import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { format, parseISO, addDays } from 'date-fns';
import { COLORS } from '../../constants/colors';
import { CYCLE_PHASE_CONFIG } from '../../constants/theme';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { getCycleEntries, saveCycleEntry, updateCycleEntry } from '../../services/firestore';
import { calculateCyclePhase, predictNextPeriod, calculateAverageCycleLength } from '../../utils/cycleCalculations';
import { useCycleInit } from '../../hooks/useCycle';
import type { CycleEntry, BleedingIntensity, CyclePhase } from '../../types';

const BLEEDING_OPTIONS: { value: BleedingIntensity; label: string }[] = [
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

const PERIOD_SYMPTOMS = [
  { id: 'cramps', label: 'Cramps' },
  { id: 'bloating', label: 'Bloating' },
  { id: 'headaches', label: 'Headaches' },
  { id: 'back_pain', label: 'Back pain' },
  { id: 'breast_tenderness', label: 'Breast tenderness' },
  { id: 'nausea', label: 'Nausea' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'mood_changes', label: 'Mood changes' },
];

export default function CycleTrackingScreen() {
  const { user, settings } = useAppStore();
  const { refresh } = useCycleInit(user?.uid);

  const [cycles, setCycles] = useState<CycleEntry[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [bleeding, setBleeding] = useState<BleedingIntensity>('medium');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const avgLength = settings?.averageCycleLength ?? 28;

  const loadCycles = useCallback(async () => {
    if (!user) return;
    const data = await getCycleEntries(user.uid, 6);
    setCycles(data);
  }, [user]);

  useEffect(() => { loadCycles(); }, [loadCycles]);

  const markedDates = buildMarkedDates(cycles, avgLength);

  const handleLogPeriod = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // Check if there's already an open cycle (no end date)
      const openCycle = cycles.find(c => !c.endDate);
      if (openCycle) {
        await updateCycleEntry(user.uid, openCycle.id, { endDate: today });
      }

      await saveCycleEntry(user.uid, {
        startDate: today,
        bleedingIntensity: bleeding,
        symptoms,
      });

      setShowLogModal(false);
      setBleeding('medium');
      setSymptoms([]);
      await loadCycles();
      await refresh();
    } catch {
      Alert.alert('Error', 'Could not save period log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentCycle = cycles.length > 0
    ? [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate))[0]
    : null;

  const nextPeriod = predictNextPeriod(cycles, avgLength);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Cycle Tracking</Text>
          <TouchableOpacity
            style={styles.logButton}
            onPress={() => setShowLogModal(true)}
          >
            <Text style={styles.logButtonText}>+ Log Period</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <Calendar
            markedDates={markedDates}
            markingType="period"
            theme={{
              calendarBackground: COLORS.surface,
              textSectionTitleColor: COLORS.textSecondary,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: COLORS.textInverse,
              todayTextColor: COLORS.primary,
              dayTextColor: COLORS.textPrimary,
              textDisabledColor: COLORS.textTertiary,
              dotColor: COLORS.primary,
              monthTextColor: COLORS.textPrimary,
              arrowColor: COLORS.primary,
            }}
          />
        </View>

        {/* Phase Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Cycle phases</Text>
          <View style={styles.legendGrid}>
            {(Object.keys(CYCLE_PHASE_CONFIG) as CyclePhase[]).map(phase => (
              <View key={phase} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: CYCLE_PHASE_CONFIG[phase].color }]} />
                <Text style={styles.legendLabel}>{CYCLE_PHASE_CONFIG[phase].label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Current phase info */}
        {currentCycle && (() => {
          const day = Math.round((Date.now() - parseISO(currentCycle.startDate).getTime()) / 86400000) + 1;
          const phase = calculateCyclePhase(day, avgLength);
          const config = CYCLE_PHASE_CONFIG[phase];
          return (
            <View style={[styles.phaseInfoCard, { backgroundColor: config.background }]}>
              <Text style={styles.phaseInfoEmoji}>{config.emoji}</Text>
              <View style={styles.phaseInfoContent}>
                <Text style={styles.phaseInfoTitle}>{config.label}</Text>
                <Text style={styles.phaseInfoDay}>Day {day} of ~{avgLength}</Text>
                {nextPeriod && (
                  <Text style={styles.phaseInfoNext}>
                    Next period predicted: {format(nextPeriod, 'd MMM yyyy')}
                  </Text>
                )}
                <Text style={styles.phaseInfoEdu}>{config.education}</Text>
              </View>
            </View>
          );
        })()}

        {/* Cycle history */}
        {cycles.length >= 2 && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Cycle history</Text>
            {cycles.slice(0, 4).map((c, i) => {
              const next = cycles[i + 1];
              const length = next
                ? Math.round((parseISO(c.startDate).getTime() - parseISO(next.startDate).getTime()) / 86400000)
                : null;
              return (
                <View key={c.id} style={styles.historyRow}>
                  <Text style={styles.historyDate}>{format(parseISO(c.startDate), 'd MMM yyyy')}</Text>
                  {length && <Text style={styles.historyLength}>{length} day cycle</Text>}
                </View>
              );
            })}
            <Text style={styles.historyAvg}>
              Average cycle: {calculateAverageCycleLength(cycles)} days
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Log Period Modal */}
      <Modal
        visible={showLogModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLogModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Period Start</Text>
            <TouchableOpacity onPress={() => setShowLogModal(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.modalSectionTitle}>Bleeding intensity</Text>
            <View style={styles.chipRow}>
              {BLEEDING_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, bleeding === opt.value && styles.chipSelected]}
                  onPress={() => setBleeding(opt.value)}
                >
                  <Text style={[styles.chipText, bleeding === opt.value && styles.chipTextSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSectionTitle}>Symptoms (optional)</Text>
            <View style={styles.symptomGrid}>
              {PERIOD_SYMPTOMS.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.symptomChip,
                    symptoms.includes(s.id) && styles.symptomChipSelected,
                  ]}
                  onPress={() => setSymptoms(prev =>
                    prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id],
                  )}
                >
                  <Text style={[
                    styles.symptomChipText,
                    symptoms.includes(s.id) && styles.symptomChipTextSelected,
                  ]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleLogPeriod}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Log Period Start'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function buildMarkedDates(cycles: CycleEntry[], avgLength: number): Record<string, unknown> {
  const marked: Record<string, unknown> = {};

  for (const cycle of cycles) {
    const start = parseISO(cycle.startDate);
    const end = cycle.endDate ? parseISO(cycle.endDate) : addDays(start, 4);
    let d = start;
    while (d <= end) {
      const key = format(d, 'yyyy-MM-dd');
      marked[key] = { color: COLORS.phaseMenustrual, textColor: '#fff' };
      d = addDays(d, 1);
    }
  }

  return marked;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.base, paddingBottom: SPACING['4xl'] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  logButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  logButtonText: {
    color: COLORS.textInverse,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  calendarCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  legendCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  legendTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    minWidth: '45%',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  phaseInfoCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  phaseInfoEmoji: { fontSize: 36 },
  phaseInfoContent: { flex: 1 },
  phaseInfoTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  phaseInfoDay: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  phaseInfoNext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  phaseInfoEdu: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  historyTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  historyDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  historyLength: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  historyAvg: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalClose: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.primary,
  },
  modalScroll: { padding: SPACING.base },
  modalSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  symptomChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  symptomChipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  symptomChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  symptomChipTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
});
