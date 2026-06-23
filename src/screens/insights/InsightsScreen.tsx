import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { useInsights } from '@/hooks/useInsights';
import { formatDate } from '@/utils/dateHelpers';
import type { Insight } from '@/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const CONFIDENCE_CONFIG = {
  low: { label: 'Emerging pattern', color: '#A0A0A0', bg: '#F0F0F0' },
  medium: { label: 'Likely pattern', color: '#C4A484', bg: '#FFF4E8' },
  high: { label: 'Strong pattern', color: '#84C4A3', bg: '#EAF7F0' },
};

const TYPE_ICONS: Record<string, string> = {
  pmdd_pattern: '🌙',
  sleep_mood: '😴',
  supplement_sleep: '💊',
  cycle_pain: '🔄',
  exercise_fatigue: '🏃‍♀️',
  exercise_pain: '💪',
  hydration_headache: '💧',
};

function InsightCard({ insight, onAcknowledge }: { insight: Insight; onAcknowledge: (id: string) => void }) {
  const conf = CONFIDENCE_CONFIG[insight.confidence];
  const icon = TYPE_ICONS[insight.type] ?? '✨';

  return (
    <View style={[styles.card, insight.acknowledged && styles.cardAcknowledged]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Text style={styles.cardIcon}>{icon}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: conf.bg }]}>
          <Text style={[styles.badgeText, { color: conf.color }]}>{conf.label}</Text>
        </View>
        {!insight.acknowledged && <View style={styles.newDot} />}
      </View>

      <Text style={styles.cardMessage}>{insight.message}</Text>

      {insight.dataBasis && (
        <Text style={styles.dataBasis}>{insight.dataBasis}</Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{formatDate(insight.generatedAt.toDate())}</Text>
        {!insight.acknowledged && (
          <TouchableOpacity
            style={styles.acknowledgeBtn}
            onPress={() => onAcknowledge(insight.id)}
          >
            <Text style={styles.acknowledgeBtnText}>Got it ✓</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function InsightsScreen() {
  const user = useAppStore((s) => s.user);
  const { insights, loading, refresh, acknowledge } = useInsights(user?.uid ?? '');
  const navigation = useNavigation<Nav>();

  useFocusEffect(useCallback(() => { refresh(); }, []));

  const unread = insights.filter((i) => !i.acknowledged);
  const read = insights.filter((i) => i.acknowledged);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={COLORS.primary} />}
      >
        <Text style={styles.title}>Your Insights</Text>
        <Text style={styles.subtitle}>
          Patterns discovered from your tracking data
        </Text>

        {insights.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Building your picture</Text>
            <Text style={styles.emptyText}>
              Keep tracking daily check-ins, cycle data and symptoms. Insights
              appear after about 2 weeks of consistent logging — your patterns
              take a little time to emerge.
            </Text>
          </View>
        )}

        {unread.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New for you</Text>
            {unread.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onAcknowledge={acknowledge}
              />
            ))}
          </View>
        )}

        {read.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Previous insights</Text>
            {read.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onAcknowledge={acknowledge}
              />
            ))}
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Insights are generated nightly from your last 30 days of data using
            statistical pattern analysis. They suggest correlations, not causes.
            Always discuss health decisions with your care team.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING['4xl'] },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardAcknowledged: { opacity: 0.7 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: { fontSize: 18 },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    flex: 1,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  cardMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.base,
    marginBottom: SPACING.sm,
  },
  dataBasis: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
  acknowledgeBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  acknowledgeBtnText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.lg },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  infoIcon: { fontSize: 16 },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.xs,
  },
});
