import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { CYCLE_PHASE_CONFIG } from '../../constants/theme';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { useCycleInit } from '../../hooks/useCycle';
import { getEncouragement } from '../../constants/encouragement';
import { getGreeting, formatDate } from '../../utils/dateHelpers';
import type { TabScreenProps } from '../../navigation/types';

export default function DashboardScreen({ navigation }: TabScreenProps<'Home'>) {
  const {
    user,
    profile,
    settings,
    currentCycleDay,
    currentCyclePhase,
    nextPeriodDate,
    pmddWindowActive,
    pmddWindowDaysUntil,
    todayCheckIn,
    checkInStreak,
    todaySupplementAdherence,
  } = useAppStore();

  const { refresh } = useCycleInit(user?.uid);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const phaseConfig = currentCyclePhase ? CYCLE_PHASE_CONFIG[currentCyclePhase] : null;
  const christianMode = settings?.christianModeEnabled ?? false;
  const encouragement = getEncouragement(
    pmddWindowActive ? 'pmdd' : todayCheckIn?.pain && todayCheckIn.pain >= 7 ? 'pain' : 'morning',
    christianMode,
  );

  const daysUntilPeriod = nextPeriodDate
    ? Math.max(0, Math.round((nextPeriodDate.getTime() - Date.now()) / 86400000))
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {profile?.displayName ?? 'you'} ✨</Text>
            <Text style={styles.date}>{formatDate(new Date())}</Text>
          </View>
          {checkInStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {checkInStreak}</Text>
            </View>
          )}
        </View>

        {/* PMDD Alert */}
        {(pmddWindowActive || (pmddWindowDaysUntil !== null && pmddWindowDaysUntil <= 3)) && (
          <View style={[styles.alertBanner, pmddWindowActive ? styles.alertActive : styles.alertWarning]}>
            <Text style={styles.alertEmoji}>⚠️</Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {pmddWindowActive
                  ? 'PMDD window active'
                  : `PMDD window in ${pmddWindowDaysUntil} day${pmddWindowDaysUntil === 1 ? '' : 's'}`}
              </Text>
              <Text style={styles.alertBody}>
                {pmddWindowActive
                  ? 'These feelings are real, but they are not permanent.'
                  : 'Consider planning lighter commitments this week.'}
              </Text>
            </View>
          </View>
        )}

        {/* Cycle Phase Card */}
        {phaseConfig ? (
          <View style={[styles.phaseCard, { backgroundColor: phaseConfig.background }]}>
            <View style={styles.phaseCardHeader}>
              <Text style={styles.phaseEmoji}>{phaseConfig.emoji}</Text>
              <View style={styles.phaseInfo}>
                <Text style={styles.phaseLabel}>{phaseConfig.label.toUpperCase()}</Text>
                <Text style={styles.phaseDay}>Day {currentCycleDay}</Text>
              </View>
              {daysUntilPeriod !== null && (
                <View style={styles.phasePrediction}>
                  <Text style={styles.phasePredictionLabel}>Next period</Text>
                  <Text style={styles.phasePredictionValue}>in {daysUntilPeriod}d</Text>
                </View>
              )}
            </View>
            <Text style={styles.phaseDescription}>{phaseConfig.shortDescription}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.noDataCard}
            onPress={() => navigation.navigate('Cycle')}
          >
            <Text style={styles.noDataEmoji}>🔴</Text>
            <Text style={styles.noDataText}>Log your period to start tracking your cycle</Text>
          </TouchableOpacity>
        )}

        {/* Today's Stats */}
        {todayCheckIn ? (
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardHalf]}>
              <Text style={styles.statEmoji}>
                {['\u{1F614}', '\u{1F61F}', '\u{1F610}', '\u{1F642}', '\u{1F60A}'][todayCheckIn.mood - 1]}
              </Text>
              <Text style={styles.statLabel}>Mood</Text>
              <Text style={styles.statValue}>
                {['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'][todayCheckIn.mood - 1]}
              </Text>
            </View>
            <View style={[styles.statCard, styles.statCardHalf]}>
              <Text style={styles.statValueLarge}>{todayCheckIn.energy}</Text>
              <Text style={styles.statLabel}>Energy</Text>
              <View style={styles.statBar}>
                <View style={[styles.statBarFill, { width: `${todayCheckIn.energy * 10}%`, backgroundColor: COLORS.accent }]} />
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.checkInPrompt}
            onPress={() => navigation.navigate('CheckIn')}
          >
            <Text style={styles.checkInPromptText}>✔️ Complete today\'s check-in</Text>
            <Text style={styles.checkInPromptSub}>Takes less than 2 minutes</Text>
          </TouchableOpacity>
        )}

        {/* Supplement Adherence */}
        {todaySupplementAdherence > 0 && (
          <View style={styles.supplementCard}>
            <Text style={styles.sectionTitle}>Supplements today</Text>
            <View style={styles.adherenceBar}>
              <View style={[styles.adherenceFill, { width: `${todaySupplementAdherence * 100}%` }]} />
            </View>
            <Text style={styles.adherenceText}>
              {Math.round(todaySupplementAdherence * 100)}% taken
            </Text>
          </View>
        )}

        {/* Encouragement Card */}
        <View style={styles.encouragementCard}>
          {christianMode && encouragement.verseRef && (
            <Text style={styles.verseRef}>{encouragement.verseRef}</Text>
          )}
          <Text style={styles.encouragementText}>
            {christianMode && encouragement.verse ? `"${encouragement.verse}"` : encouragement.text}
          </Text>
          {christianMode && encouragement.verse && (
            <Text style={styles.encouragementSubtext}>{encouragement.text}</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.base, paddingBottom: SPACING['4xl'] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  date: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  streakText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.warning,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  alertActive: { backgroundColor: COLORS.pmddActive, borderWidth: 1, borderColor: COLORS.pmddActiveBorder },
  alertWarning: { backgroundColor: COLORS.pmddAlert, borderWidth: 1, borderColor: COLORS.pmddAlertBorder },
  alertEmoji: { fontSize: 20 },
  alertContent: { flex: 1 },
  alertTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  alertBody: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  phaseCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  phaseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  phaseEmoji: { fontSize: 32 },
  phaseInfo: { flex: 1 },
  phaseLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  phaseDay: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  phasePrediction: { alignItems: 'flex-end' },
  phasePredictionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
  phasePredictionValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  phaseDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  noDataCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  noDataEmoji: { fontSize: 24 },
  noDataText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  statCardHalf: { flex: 1 },
  statEmoji: { fontSize: 28, marginBottom: SPACING.xs },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statValueLarge: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statBar: {
    height: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 3,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  checkInPrompt: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  checkInPromptText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  checkInPromptSub: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
  },
  supplementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  adherenceBar: {
    height: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 4,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  adherenceFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  adherenceText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  encouragementCard: {
    backgroundColor: COLORS.accentLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  verseRef: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '700',
    color: COLORS.accentDark,
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  encouragementText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  encouragementSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
});
