import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { COLORS as C } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

interface NutritionState {
  waterMl: number;
  proteinG: number;
  caffeineMg: number;
  alcoholUnits: number;
  exerciseMinutes: number;
  sleepHours: number;
  tookOmega3: boolean;
  tookMagnesium: boolean;
  tookVitaminD: boolean;
  notes: string;
}

const WATER_GOAL = 2000;
const PROTEIN_GOAL = 80;
const CAFFEINE_LIMIT = 400;

export default function NutritionScreen() {
  const settings = useAppStore((s) => s.settings);

  const [state, setState] = useState<NutritionState>({
    waterMl: 0,
    proteinG: 0,
    caffeineMg: 0,
    alcoholUnits: 0,
    exerciseMinutes: 0,
    sleepHours: 0,
    tookOmega3: false,
    tookMagnesium: false,
    tookVitaminD: false,
    notes: '',
  });

  const update = (key: keyof NutritionState, value: any) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const addWater = (ml: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState((prev) => ({ ...prev, waterMl: Math.min(prev.waterMl + ml, 5000) }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Nutrition & Lifestyle</Text>

        {/* Water */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hydration</Text>
          <View style={styles.card}>
            <View style={styles.goalRow}>
              <Text style={styles.goalValue}>{state.waterMl} ml</Text>
              <Text style={styles.goalTarget}>/ {WATER_GOAL} ml goal</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((state.waterMl / WATER_GOAL) * 100, 100)}%`,
                    backgroundColor:
                      state.waterMl >= WATER_GOAL ? '#84C4A3' : COLORS.secondary,
                  },
                ]}
              />
            </View>
            <View style={styles.waterBtns}>
              {[150, 250, 350, 500].map((ml) => (
                <TouchableOpacity
                  key={ml}
                  style={styles.waterBtn}
                  onPress={() => addWater(ml)}
                >
                  <Text style={styles.waterBtnText}>+{ml}ml</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Macros */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition</Text>
          <View style={styles.card}>
            <NumberRow
              label="Protein"
              unit="g"
              value={state.proteinG}
              onChange={(v) => update('proteinG', v)}
              goal={PROTEIN_GOAL}
              icon="🥩"
            />
            <View style={styles.divider} />
            <NumberRow
              label="Caffeine"
              unit="mg"
              value={state.caffeineMg}
              onChange={(v) => update('caffeineMg', v)}
              goal={CAFFEINE_LIMIT}
              warningAboveGoal
              icon="☕"
            />
            <View style={styles.divider} />
            <NumberRow
              label="Alcohol"
              unit="units"
              value={state.alcoholUnits}
              onChange={(v) => update('alcoholUnits', v)}
              icon="🍷"
            />
          </View>
        </View>

        {/* Sleep & Exercise */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep & Activity</Text>
          <View style={styles.card}>
            <NumberRow
              label="Sleep last night"
              unit="hrs"
              value={state.sleepHours}
              onChange={(v) => update('sleepHours', v)}
              step={0.5}
              icon="🛌"
            />
            <View style={styles.divider} />
            <NumberRow
              label="Exercise"
              unit="mins"
              value={state.exerciseMinutes}
              onChange={(v) => update('exerciseMinutes', v)}
              step={5}
              icon="🏃‍♀️"
            />
          </View>
        </View>

        {/* Key supplements quick-tick */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key supplements</Text>
          <View style={styles.card}>
            <ToggleRow
              label="Omega-3"
              icon="🐟"
              value={state.tookOmega3}
              onToggle={() => update('tookOmega3', !state.tookOmega3)}
            />
            <View style={styles.divider} />
            <ToggleRow
              label="Magnesium"
              icon="🧪"
              value={state.tookMagnesium}
              onToggle={() => update('tookMagnesium', !state.tookMagnesium)}
            />
            <View style={styles.divider} />
            <ToggleRow
              label="Vitamin D"
              icon="☀️"
              value={state.tookVitaminD}
              onToggle={() => update('tookVitaminD', !state.tookVitaminD)}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={state.notes}
            onChangeText={(t) => update('notes', t)}
            placeholder="Anything worth noting about today's food or energy..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonIcon}>🚧</Text>
          <Text style={styles.comingSoonText}>
            Nutrition logging with Firestore persistence coming in v1.1.
            For now, use this screen to track your day manually.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NumberRow({
  label,
  unit,
  value,
  onChange,
  goal,
  warningAboveGoal,
  step = 1,
  icon,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  goal?: number;
  warningAboveGoal?: boolean;
  step?: number;
  icon: string;
}) {
  const atGoal = goal !== undefined && value >= goal;
  const warn = atGoal && warningAboveGoal;
  const success = atGoal && !warningAboveGoal;

  return (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {goal && (
          <Text style={[styles.rowGoal, success && styles.goalMet, warn && styles.goalWarn]}>
            {value} / {goal} {unit}
          </Text>
        )}
        {!goal && (
          <Text style={styles.rowGoal}>{value} {unit}</Text>
        )}
      </View>
      <View style={styles.stepper}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(Math.max(0, parseFloat((value - step).toFixed(1))))}
        >
          <Text style={styles.stepBtnText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(parseFloat((value + step).toFixed(1)))}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  icon,
  value,
  onToggle,
}: {
  label: string;
  icon: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: COLORS.primaryLight }}
        thumbColor={value ? COLORS.primary : '#BDBDBD'}
      />
    </View>
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
    marginBottom: SPACING.xl,
  },
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  goalValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  goalTarget: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  waterBtns: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  waterBtn: {
    flex: 1,
    backgroundColor: COLORS.secondaryLight ?? '#EDE9F7',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  waterBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  rowIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  rowContent: { flex: 1 },
  rowLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  rowGoal: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  goalMet: { color: '#84C4A3' },
  goalWarn: { color: COLORS.error },
  stepper: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.xs,
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    ...SHADOWS.sm,
  },
  comingSoon: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  comingSoonIcon: { fontSize: 16 },
  comingSoonText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.xs,
  },
});
