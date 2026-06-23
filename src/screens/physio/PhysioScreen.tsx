import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { getPhysioSessions, getActivePlan } from '@/services/firestore';
import { formatShortDate } from '@/utils/dateHelpers';
import type { PhysioSession, PhysioPlan } from '@/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const EXERCISE_CATEGORY_LABELS: Record<string, string> = {
  core_stability: 'Core stability',
  glute_strength: 'Glute strength',
  shoulder_stability: 'Shoulder stability',
  hip_strength: 'Hip strength',
  ankle_proprioception: 'Ankle proprioception',
  upper_body_strength: 'Upper body',
  lower_body_strength: 'Lower body',
  flexibility: 'Flexibility',
  recovery_stretching: 'Recovery stretching',
  hydrotherapy: 'Hydrotherapy',
  walking: 'Walking',
  swimming: 'Swimming',
  cycling: 'Cycling',
  yoga_pilates: 'Yoga / Pilates',
  custom: 'Custom',
};

export default function PhysioScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAppStore((s) => s.user);
  const [sessions, setSessions] = useState<PhysioSession[]>([]);
  const [activePlan, setActivePlan] = useState<PhysioPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [recentSessions, plan] = await Promise.all([
        getPhysioSessions(user.uid, 10),
        getActivePlan(user.uid),
      ]);
      setSessions(recentSessions);
      setActivePlan(plan);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const streak = calculateStreak(sessions);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.primary} />}
      >
        <Text style={styles.title}>Physio & Exercise</Text>

        {/* Streak */}
        <View style={styles.streakCard}>
          <Text style={styles.streakIcon}>🔥</Text>
          <View>
            <Text style={styles.streakNumber}>{streak} session{streak !== 1 ? 's' : ''}</Text>
            <Text style={styles.streakLabel}>in the last 7 days</Text>
          </View>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.navigate('PhysioSession', { planId: activePlan?.id })}
          >
            <Text style={styles.startBtnText}>Start session</Text>
          </TouchableOpacity>
        </View>

        {/* Safety reminder */}
        <View style={styles.safetyBanner}>
          <Text style={styles.safetyIcon}>⚠️</Text>
          <Text style={styles.safetyText}>
            hEDS tip: warm up gently, avoid end-range loading, and stop if you
            feel joint instability. Quality over quantity always.
          </Text>
        </View>

        {/* Active plan */}
        {activePlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active plan</Text>
            <View style={styles.planCard}>
              <Text style={styles.planName}>{activePlan.name}</Text>
              <Text style={styles.planMeta}>
                {activePlan.daysPerWeek}x per week · {activePlan.durationWeeks} weeks
              </Text>
              <View style={styles.planDays}>
                {activePlan.days.map((day) => (
                  <View key={day.dayNumber} style={styles.planDay}>
                    <Text style={styles.planDayLabel}>Day {day.dayNumber}</Text>
                    {day.exercises.map((ex) => (
                      <Text key={ex.name} style={styles.planExercise}>
                        • {ex.name}{ex.sets ? ` · ${ex.sets}x${ex.reps}` : ''}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Recent sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent sessions</Text>
          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏃‍♀️</Text>
              <Text style={styles.emptyText}>
                No sessions yet. Tap “Start session” to log your first workout.
              </Text>
            </View>
          ) : (
            sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionCard({ session }: { session: PhysioSession }) {
  const completedCount = session.exercises.filter((e) => e.completedSets > 0).length;
  const totalCount = session.exercises.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionDate}>{formatShortDate(new Date(session.date))}</Text>
        <View style={[styles.completionBadge, { backgroundColor: completionPct >= 80 ? '#EAF7F0' : '#FFF4E8' }]}>
          <Text style={[styles.completionText, { color: completionPct >= 80 ? '#84C4A3' : '#C4A484' }]}>
            {completionPct}% done
          </Text>
        </View>
      </View>
      <Text style={styles.sessionDuration}>
        {session.durationMinutes} min · {session.exercises.length} exercises
      </Text>
      {session.recoveryNotes && (
        <Text style={styles.sessionNotes} numberOfLines={2}>{session.recoveryNotes}</Text>
      )}
    </View>
  );
}

function calculateStreak(sessions: PhysioSession[]): number {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 7);
  return sessions.filter((s) => new Date(s.date) >= cutoff).length;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING['4xl'] },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
  },
  streakCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  streakIcon: { fontSize: 32 },
  streakNumber: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  startBtn: {
    marginLeft: 'auto',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  startBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  safetyBanner: {
    backgroundColor: '#FFF8EE',
    borderLeftWidth: 3,
    borderLeftColor: '#C4A484',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  safetyIcon: { fontSize: 16 },
  safetyText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#7A6040',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.xs,
  },
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  planName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  planMeta: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  planDays: { gap: SPACING.md },
  planDay: {},
  planDayLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  planExercise: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    paddingLeft: SPACING.sm,
  },
  sessionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sessionDate: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  completionBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  completionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  sessionDuration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  sessionNotes: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
  },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.md },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
