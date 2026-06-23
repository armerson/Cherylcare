import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { savePhysioSession } from '@/services/firestore';
import { getTodayDateString } from '@/utils/dateHelpers';
import * as Haptics from 'expo-haptics';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type Route = RouteProp<MainStackParamList, 'PhysioSession'>;

interface LiveExercise {
  name: string;
  category: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
  completedSets: number;
}

const QUICK_ADD_EXERCISES: LiveExercise[] = [
  { name: 'Clamshells', category: 'glute_strength', sets: 3, reps: 15, completedSets: 0 },
  { name: 'Dead bugs', category: 'core_stability', sets: 3, reps: 10, completedSets: 0 },
  { name: 'Glute bridges', category: 'glute_strength', sets: 3, reps: 12, completedSets: 0 },
  { name: 'Side-lying leg raises', category: 'hip_strength', sets: 3, reps: 15, completedSets: 0 },
  { name: 'Wall sits', category: 'lower_body_strength', sets: 3, reps: 30, completedSets: 0 },
  { name: 'Shoulder blade squeezes', category: 'shoulder_stability', sets: 3, reps: 15, completedSets: 0 },
  { name: 'Single-leg balance', category: 'ankle_proprioception', sets: 3, reps: 30, completedSets: 0 },
  { name: 'Cat-cow stretch', category: 'flexibility', sets: 2, reps: 10, completedSets: 0 },
];

export default function PhysioSessionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const user = useAppStore((s) => s.user);

  const [exercises, setExercises] = useState<LiveExercise[]>([]);
  const [startTime] = useState(Date.now());
  const [overallNotes, setOverallNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const addExercise = (ex: LiveExercise) => {
    setExercises((prev) => {
      if (prev.find((e) => e.name === ex.name)) return prev;
      return [...prev, { ...ex }];
    });
    setShowQuickAdd(false);
  };

  const markSet = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === idx && ex.completedSets < ex.sets
          ? { ...ex, completedSets: ex.completedSets + 1 }
          : ex
      )
    );
  };

  const handleFinish = async () => {
    if (!user) return;
    if (exercises.length === 0) {
      Alert.alert('No exercises', 'Add at least one exercise before finishing.');
      return;
    }
    setSaving(true);
    try {
      const durationMinutes = Math.round((Date.now() - startTime) / 60000);
      await savePhysioSession(user.uid, {
        date: getTodayDateString(),
        exercises: exercises.map((ex) => ({
          name: ex.name,
          category: ex.category as any,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          completedSets: ex.completedSets,
          notes: ex.notes,
        })),
        durationMinutes: Math.max(durationMinutes, 1),
        overallExertion: 5,
        recoveryNotes: overallNotes,
      });
      navigation.replace('RecoveryCheckIn', {});
    } catch {
      Alert.alert('Error', 'Could not save session. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Session in progress</Text>

        <View style={styles.safetyBanner}>
          <Text style={styles.safetyIcon}>⚠️</Text>
          <Text style={styles.safetyText}>
            Listen to your body. If you feel joint popping, sharp pain, or
            instability, stop that exercise and rest.
          </Text>
        </View>

        {exercises.length === 0 && (
          <View style={styles.emptyExercises}>
            <Text style={styles.emptyText}>No exercises added yet</Text>
          </View>
        )}

        {exercises.map((ex, idx) => (
          <ExerciseRow key={ex.name} exercise={ex} onMarkSet={() => markSet(idx)} />
        ))}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowQuickAdd(!showQuickAdd)}
        >
          <Text style={styles.addBtnText}>+ Add exercise</Text>
        </TouchableOpacity>

        {showQuickAdd && (
          <View style={styles.quickAddPanel}>
            <Text style={styles.quickAddTitle}>Quick add (hEDS-safe)</Text>
            {QUICK_ADD_EXERCISES.map((ex) => (
              <TouchableOpacity
                key={ex.name}
                style={styles.quickAddItem}
                onPress={() => addExercise(ex)}
              >
                <Text style={styles.quickAddName}>{ex.name}</Text>
                <Text style={styles.quickAddMeta}>{ex.sets}x{ex.reps}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Session notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={overallNotes}
            onChangeText={setOverallNotes}
            placeholder="How did it go? Any joints playing up?"
            placeholderTextColor={COLORS.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.finishBtn, saving && styles.finishBtnDisabled]}
          onPress={handleFinish}
          disabled={saving}
        >
          <Text style={styles.finishBtnText}>
            {saving ? 'Saving…' : 'Finish session'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExerciseRow({
  exercise,
  onMarkSet,
}: {
  exercise: LiveExercise;
  onMarkSet: () => void;
}) {
  const isComplete = exercise.completedSets >= exercise.sets;

  return (
    <View style={[styles.exerciseCard, isComplete && styles.exerciseComplete]}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseMeta}>
          {exercise.sets} sets x {exercise.reps} reps
        </Text>
      </View>
      <View style={styles.setDots}>
        {Array.from({ length: exercise.sets }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.setDot,
              i < exercise.completedSets && styles.setDotFilled,
            ]}
          />
        ))}
        <TouchableOpacity
          style={[styles.markSetBtn, isComplete && styles.markSetBtnDisabled]}
          onPress={onMarkSet}
          disabled={isComplete}
        >
          <Text style={styles.markSetBtnText}>
            {isComplete ? '✓ Done' : 'Mark set'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING['4xl'] },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
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
  emptyExercises: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
  },
  exerciseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  exerciseComplete: {
    borderWidth: 1,
    borderColor: '#84C4A3',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  exerciseName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  exerciseMeta: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  setDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  setDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  setDotFilled: {
    backgroundColor: COLORS.primary,
  },
  markSetBtn: {
    marginLeft: 'auto',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  markSetBtnDisabled: {
    backgroundColor: '#84C4A3',
  },
  markSetBtnText: {
    color: '#FFF',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  addBtn: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  addBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  quickAddPanel: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.sm,
    marginBottom: SPACING.md,
  },
  quickAddTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  quickAddItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  quickAddName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  quickAddMeta: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  notesSection: { marginBottom: SPACING.xl },
  notesLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
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
  finishBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  finishBtnDisabled: { opacity: 0.6 },
  finishBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: TYPOGRAPHY.fontSize.base,
  },
});
