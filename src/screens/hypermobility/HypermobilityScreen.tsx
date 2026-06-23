import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { saveHypermobilityLog } from '../../services/firestore';
import { getTodayDateString } from '../../utils/dateHelpers';
import type { PainLocation, SubluxationEvent } from '../../types';

const BODY_PARTS = [
  'Neck', 'Left shoulder', 'Right shoulder', 'Left elbow', 'Right elbow',
  'Left wrist', 'Right wrist', 'Left hand', 'Right hand',
  'Upper back', 'Lower back', 'Left hip', 'Right hip',
  'Left knee', 'Right knee', 'Left ankle', 'Right ankle',
  'Left foot', 'Right foot',
];

function ScaleRow({
  label,
  value,
  onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={scaleStyles.row}>
      <Text style={scaleStyles.label}>{label}</Text>
      <View style={scaleStyles.track}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <TouchableOpacity
            key={n}
            style={[scaleStyles.dot, n <= value && scaleStyles.dotActive]}
            onPress={() => onChange(n)}
          />
        ))}
      </View>
      <Text style={scaleStyles.value}>{value}</Text>
    </View>
  );
}

const scaleStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.sm },
  label: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textPrimary, width: 90 },
  track: { flex: 1, flexDirection: 'row', gap: 3 },
  dot: { flex: 1, height: 7, borderRadius: 3.5, backgroundColor: COLORS.surfaceAlt },
  dotActive: { backgroundColor: COLORS.primary },
  value: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600', color: COLORS.textPrimary, width: 20, textAlign: 'right' },
});

export default function HypermobilityScreen() {
  const { user, currentCycleDay, currentCyclePhase } = useAppStore();
  const today = getTodayDateString();

  const [painLocations, setPainLocations] = useState<PainLocation[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [fatigue, setFatigue] = useState(5);
  const [dizziness, setDizziness] = useState(1);
  const [headaches, setHeadaches] = useState(false);
  const [digestiveSymptoms, setDigestiveSymptoms] = useState(false);
  const [exerciseTolerance, setExerciseTolerance] = useState(7);
  const [recoveryScore, setRecoveryScore] = useState(7);
  const [saving, setSaving] = useState(false);

  const toggleBodyPart = (part: string) => {
    const exists = painLocations.find(p => p.bodyPart === part);
    if (exists) {
      setPainLocations(prev => prev.filter(p => p.bodyPart !== part));
    } else {
      setPainLocations(prev => [...prev, {
        bodyPart: part,
        side: 'bilateral',
        intensity: 5,
      }]);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveHypermobilityLog(user.uid, {
        date: today,
        jointPain: painLocations,
        instabilityLocations: [],
        subluxations: [],
        fatigue,
        dizziness,
        headaches,
        digestiveSymptoms,
        exerciseTolerance,
        recoveryScore,
        cycleDay: currentCycleDay ?? undefined,
        cyclePhase: currentCyclePhase ?? undefined,
      });
      Alert.alert('Saved', 'Hypermobility log saved.');
    } catch {
      Alert.alert('Error', 'Could not save log.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Body map */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Joint pain today</Text>
          <Text style={styles.cardSubtitle}>Tap the areas that are painful or unstable</Text>
          <View style={styles.bodyGrid}>
            {BODY_PARTS.map(part => {
              const isPainful = painLocations.some(p => p.bodyPart === part);
              return (
                <TouchableOpacity
                  key={part}
                  style={[
                    styles.bodyPartChip,
                    isPainful && styles.bodyPartChipActive,
                  ]}
                  onPress={() => toggleBodyPart(part)}
                >
                  <Text style={[
                    styles.bodyPartText,
                    isPainful && styles.bodyPartTextActive,
                  ]}>{part}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {painLocations.length > 0 && (
            <Text style={styles.selectedCount}>
              {painLocations.length} area{painLocations.length !== 1 ? 's' : ''} affected
            </Text>
          )}
        </View>

        {/* Scales */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How do you feel?</Text>
          <ScaleRow label="Fatigue" value={fatigue} onChange={setFatigue} />
          <ScaleRow label="Dizziness" value={dizziness} onChange={setDizziness} />
          <ScaleRow label="Exercise tolerance" value={exerciseTolerance} onChange={setExerciseTolerance} />
          <ScaleRow label="Recovery" value={recoveryScore} onChange={setRecoveryScore} />
        </View>

        {/* Boolean symptoms */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Other symptoms</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Headaches today</Text>
            <Switch
              value={headaches}
              onValueChange={setHeadaches}
              trackColor={{ true: COLORS.primary, false: COLORS.border }}
              thumbColor={COLORS.surface}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Digestive symptoms</Text>
            <Switch
              value={digestiveSymptoms}
              onValueChange={setDigestiveSymptoms}
              trackColor={{ true: COLORS.primary, false: COLORS.border }}
              thumbColor={COLORS.surface}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Today\'s Log'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.base, paddingBottom: SPACING['4xl'] },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  bodyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  bodyPartChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  bodyPartChipActive: {
    backgroundColor: COLORS.errorLight,
    borderColor: COLORS.error,
  },
  bodyPartText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  bodyPartTextActive: {
    color: COLORS.error,
    fontWeight: '600',
  },
  selectedCount: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  switchLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
});
