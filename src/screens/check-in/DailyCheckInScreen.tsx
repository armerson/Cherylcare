import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { saveDailyCheckIn, getDailyCheckIn } from '../../services/firestore';
import { getTodayDateString } from '../../utils/dateHelpers';
import type { TabScreenProps } from '../../navigation/types';

const MOOD_OPTIONS = [
  { value: 1 as const, emoji: '\u{1F614}', label: 'Very Low' },
  { value: 2 as const, emoji: '\u{1F61F}', label: 'Low' },
  { value: 3 as const, emoji: '\u{1F610}', label: 'Neutral' },
  { value: 4 as const, emoji: '\u{1F642}', label: 'Good' },
  { value: 5 as const, emoji: '\u{1F60A}', label: 'Excellent' },
];

function ScaleSlider({
  label,
  value,
  onChange,
  lowLabel = 'Low',
  highLabel = 'High',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
}) {
  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.header}>
        <Text style={sliderStyles.label}>{label}</Text>
        <View style={sliderStyles.valueBadge}>
          <Text style={sliderStyles.valueText}>{value}</Text>
        </View>
      </View>
      <View style={sliderStyles.track}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <TouchableOpacity
            key={n}
            style={[
              sliderStyles.dot,
              n <= value && sliderStyles.dotActive,
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(n); }}
          />
        ))}
      </View>
      <View style={sliderStyles.labels}>
        <Text style={sliderStyles.edgeLabel}>{lowLabel}</Text>
        <Text style={sliderStyles.edgeLabel}>{highLabel}</Text>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  valueBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
  },
  valueText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  track: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceAlt,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  edgeLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
});

export default function DailyCheckInScreen({ navigation }: TabScreenProps<'CheckIn'>) {
  const { user, currentCycleDay, currentCyclePhase, setTodayCheckIn, checkInStreak } = useAppStore();
  const today = getTodayDateString();

  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [energy, setEnergy] = useState(5);
  const [pain, setPain] = useState(3);
  const [sleep, setSleep] = useState(7);
  const [stress, setStress] = useState(4);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDailyCheckIn(user.uid, today).then(existing => {
      if (existing) {
        setMood(existing.mood);
        setEnergy(existing.energy);
        setPain(existing.pain);
        setSleep(existing.sleep);
        setStress(existing.stress);
        setNotes(existing.notes ?? '');
        setAlreadyDone(true);
      }
    });
  }, [user, today]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const checkIn = {
        date: today,
        mood,
        energy,
        pain,
        sleep,
        stress,
        notes: notes.trim() || undefined,
        cycleDay: currentCycleDay ?? undefined,
        cyclePhase: currentCyclePhase ?? undefined,
      };
      await saveDailyCheckIn(user.uid, checkIn);
      setTodayCheckIn({ ...checkIn, completedAt: new Date(), updatedAt: new Date() });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaved(true);
    } catch (e) {
      Alert.alert('Error', 'Could not save check-in. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successState}>
          <Text style={styles.successEmoji}>✨</Text>
          <Text style={styles.successTitle}>Check-in complete!</Text>
          {checkInStreak > 0 && (
            <Text style={styles.successStreak}>🔥 {checkInStreak} day streak</Text>
          )}
          <Text style={styles.successText}>
            Your data has been saved. Every check-in builds a picture of your health.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backButtonText}>Back to dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Daily Check-In</Text>
          {currentCycleDay && (
            <View style={styles.cycleBadge}>
              <Text style={styles.cycleBadgeText}>Day {currentCycleDay}</Text>
            </View>
          )}
        </View>
        {alreadyDone && (
          <View style={styles.editBanner}>
            <Text style={styles.editBannerText}>✏️ You\'ve already checked in today — you can update it here.</Text>
          </View>
        )}

        {/* Mood */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.moodOption,
                  mood === option.value && styles.moodOptionSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMood(option.value);
                }}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.moodLabel,
                  mood === option.value && styles.moodLabelSelected,
                ]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sliders */}
        <View style={styles.section}>
          <ScaleSlider
            label="Energy today"
            value={energy}
            onChange={setEnergy}
            lowLabel="Exhausted"
            highLabel="Full energy"
          />
          <ScaleSlider
            label="Pain level"
            value={pain}
            onChange={setPain}
            lowLabel="No pain"
            highLabel="Severe"
          />
          <ScaleSlider
            label="Last night's sleep"
            value={sleep}
            onChange={setSleep}
            lowLabel="Poor"
            highLabel="Excellent"
          />
          <ScaleSlider
            label="Stress level"
            value={stress}
            onChange={setStress}
            lowLabel="Calm"
            highLabel="Very stressed"
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anything to note? <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="How are you feeling? Any symptoms, wins, or observations..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Today\'s Check-In'}
          </Text>
        </TouchableOpacity>

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
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cycleBadge: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  cycleBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  editBanner: {
    backgroundColor: COLORS.infoLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  editBannerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.info,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  optional: {
    fontWeight: '400',
    color: COLORS.textTertiary,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  moodOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 4,
  },
  moodOptionSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  moodEmoji: { fontSize: 22 },
  moodLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    minHeight: 100,
    lineHeight: 22,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  successState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
  },
  successEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  successStreak: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: SPACING.md,
  },
  successText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING['2xl'],
  },
  backButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING['2xl'],
  },
  backButtonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
});
