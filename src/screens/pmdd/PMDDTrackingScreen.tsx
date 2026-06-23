import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { COLORS } from '../../constants/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { savePMDDLog, getRecentPMDDLogs } from '../../services/firestore';
import { getTodayDateString } from '../../utils/dateHelpers';
import type { PMDDLog } from '../../types';

const PMDD_SYMPTOMS = [
  { key: 'anxiety' as const, label: 'Anxiety', emoji: '\u{1F630}', inverted: false },
  { key: 'depression' as const, label: 'Low mood', emoji: '\u{1F614}', inverted: false },
  { key: 'irritability' as const, label: 'Irritability', emoji: '\u{1F621}', inverted: false },
  { key: 'anger' as const, label: 'Anger', emoji: '\u{1F92C}', inverted: false },
  { key: 'brainFog' as const, label: 'Brain fog', emoji: '\u{1F9E0}', inverted: false },
  { key: 'overwhelm' as const, label: 'Overwhelm', emoji: '\u{1F92F}', inverted: false },
  { key: 'motivation' as const, label: 'Motivation', emoji: '\u{1F4AA}', inverted: true },
  { key: 'energy' as const, label: 'Energy', emoji: '\u{26A1}', inverted: true },
  { key: 'sleepQuality' as const, label: 'Sleep quality', emoji: '\u{1F634}', inverted: true },
];

type SymptomKey = typeof PMDD_SYMPTOMS[number]['key'];
type Scores = Record<SymptomKey, number>;

function SymptomSlider({
  label,
  emoji,
  value,
  inverted,
  onChange,
}: {
  label: string;
  emoji: string;
  value: number;
  inverted: boolean;
  onChange: (v: number) => void;
}) {
  const fillColor = inverted
    ? value >= 7 ? COLORS.accent : COLORS.primary
    : value >= 7 ? COLORS.error : value >= 4 ? COLORS.warning : COLORS.accent;

  return (
    <View style={ss.row}>
      <Text style={ss.emoji}>{emoji}</Text>
      <View style={ss.content}>
        <View style={ss.labelRow}>
          <Text style={ss.label}>{label}</Text>
          <Text style={ss.value}>{value}/10</Text>
        </View>
        <View style={ss.track}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <TouchableOpacity
              key={n}
              style={[ss.dot, n <= value && { backgroundColor: fillColor }]}
              onPress={() => onChange(n)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const ss = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md, gap: SPACING.md },
  emoji: { fontSize: 22, marginTop: 4 },
  content: { flex: 1 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600', color: COLORS.textPrimary },
  value: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary },
  track: { flexDirection: 'row', gap: 3 },
  dot: {
    flex: 1,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.surfaceAlt,
  },
});

export default function PMDDTrackingScreen() {
  const { user, currentCycleDay, currentCyclePhase } = useAppStore();
  const today = getTodayDateString();

  const defaultScores: Scores = {
    anxiety: 5, depression: 5, irritability: 5, anger: 5,
    brainFog: 5, overwhelm: 5, motivation: 5, energy: 5, sleepQuality: 5,
  };

  const [scores, setScores] = useState<Scores>(defaultScores);
  const [recentLogs, setRecentLogs] = useState<PMDDLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'log' | 'patterns'>('log');

  const loadLogs = useCallback(async () => {
    if (!user) return;
    const logs = await getRecentPMDDLogs(user.uid, 90);
    setRecentLogs(logs);
    const todayLog = logs.find(l => l.date === today);
    if (todayLog) {
      setScores({
        anxiety: todayLog.anxiety,
        depression: todayLog.depression,
        irritability: todayLog.irritability,
        anger: todayLog.anger,
        brainFog: todayLog.brainFog,
        overwhelm: todayLog.overwhelm,
        motivation: todayLog.motivation,
        energy: todayLog.energy,
        sleepQuality: todayLog.sleepQuality,
      });
    }
  }, [user, today]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await savePMDDLog(user.uid, {
        date: today,
        ...scores,
        cycleDay: currentCycleDay ?? undefined,
        cyclePhase: currentCyclePhase ?? undefined,
      });
      Alert.alert('Saved', 'PMDD log saved for today.');
      loadLogs();
    } catch {
      Alert.alert('Error', 'Could not save log.');
    } finally {
      setSaving(false);
    }
  };

  // Build chart data: last 30 days of anxiety scores by cycle day
  const anxietyData = recentLogs
    .filter(l => l.cycleDay)
    .sort((a, b) => (a.cycleDay ?? 0) - (b.cycleDay ?? 0))
    .map(l => ({ x: l.cycleDay ?? 0, y: l.anxiety }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'log' && styles.tabActive]}
          onPress={() => setTab('log')}
        >
          <Text style={[styles.tabText, tab === 'log' && styles.tabTextActive]}>Log Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'patterns' && styles.tabActive]}
          onPress={() => setTab('patterns')}
        >
          <Text style={[styles.tabText, tab === 'patterns' && styles.tabTextActive]}>Patterns</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'log' ? (
          <View style={styles.logSection}>
            <View style={styles.dayBadgeRow}>
              {currentCycleDay && (
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>Cycle Day {currentCycleDay}</Text>
                </View>
              )}
              {currentCyclePhase && (
                <View style={styles.phaseBadge}>
                  <Text style={styles.phaseBadgeText}>{currentCyclePhase} phase</Text>
                </View>
              )}
            </View>

            {PMDD_SYMPTOMS.map(s => (
              <SymptomSlider
                key={s.key}
                label={s.label}
                emoji={s.emoji}
                value={scores[s.key]}
                inverted={s.inverted}
                onChange={v => setScores(prev => ({ ...prev, [s.key]: v }))}
              />
            ))}

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Today\'s PMDD Log'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.patternsSection}>
            {recentLogs.length < 14 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>\u{1F4CA}</Text>
                <Text style={styles.emptyTitle}>Not enough data yet</Text>
                <Text style={styles.emptyText}>
                  Log your PMDD symptoms daily for at least 14 days to see patterns here.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.chartTitle}>Anxiety across your cycle</Text>
                <View style={styles.chartCard}>
                  <VictoryChart
                    theme={VictoryTheme.material}
                    height={200}
                    padding={{ top: 10, bottom: 30, left: 30, right: 20 }}
                  >
                    <VictoryAxis
                      label="Cycle day"
                      style={{ axisLabel: { fontSize: 10, fill: COLORS.textTertiary } }}
                    />
                    <VictoryAxis
                      dependentAxis
                      domain={[0, 10]}
                      style={{ axisLabel: { fontSize: 10, fill: COLORS.textTertiary } }}
                    />
                    <VictoryLine
                      data={anxietyData}
                      style={{ data: { stroke: COLORS.primary, strokeWidth: 2 } }}
                      interpolation="catmullRom"
                    />
                  </VictoryChart>
                </View>
                <Text style={styles.insightHint}>
                  Tip: Check the Insights tab for automated pattern analysis across multiple cycles.
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabs: {
    flexDirection: 'row',
    padding: SPACING.base,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.textInverse },
  scroll: { padding: SPACING.base, paddingBottom: SPACING['4xl'] },
  logSection: {},
  dayBadgeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  dayBadge: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  dayBadgeText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.secondary, fontWeight: '600' },
  phaseBadge: {
    backgroundColor: COLORS.phaseLutealBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  phaseBadgeText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.secondary, fontWeight: '600', textTransform: 'capitalize' },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  saveButtonText: { color: COLORS.textInverse, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: '600' },
  patternsSection: {},
  chartTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  insightHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  emptyState: { alignItems: 'center', paddingVertical: SPACING['4xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.lg },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
