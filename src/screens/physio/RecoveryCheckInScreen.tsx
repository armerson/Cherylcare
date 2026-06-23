import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';

type Nav = NativeStackNavigationProp<MainStackParamList>;

interface Question {
  id: string;
  text: string;
  yesIsGood: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: 'joint_stable',
    text: 'Did your joints feel stable throughout the session?',
    yesIsGood: true,
  },
  {
    id: 'pain_during',
    text: 'Did you experience pain during any exercise (beyond mild discomfort)?',
    yesIsGood: false,
  },
  {
    id: 'fatigue_manageable',
    text: 'Is your fatigue level manageable right now?',
    yesIsGood: true,
  },
  {
    id: 'subluxation',
    text: 'Did any joints partially dislocate or pop out during the session?',
    yesIsGood: false,
  },
  {
    id: 'would_repeat',
    text: 'Would you feel comfortable repeating this session in 2 days?',
    yesIsGood: true,
  },
];

export default function RecoveryCheckInScreen() {
  const navigation = useNavigation<Nav>();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const answered = Object.keys(answers).length;
  const allAnswered = answered === QUESTIONS.length;

  const handleAnswer = (id: string, value: boolean) => {
    Haptics.selectionAsync();
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getAdvice = () => {
    const painDuring = answers['pain_during'] === true;
    const subluxation = answers['subluxation'] === true;
    const fatigueManageable = answers['fatigue_manageable'] === true;
    const stable = answers['joint_stable'] === true;

    if (subluxation) {
      return {
        icon: '⚠️',
        title: 'Rest and recover',
        text: 'You had a subluxation during your session. Please rest today and tomorrow. Consider taping that joint before your next session, and mention it to your physio.',
        color: COLORS.error,
      };
    }
    if (painDuring) {
      return {
        icon: '🧘‍♀️',
        title: 'Take it easy',
        text: 'You experienced pain during the session. Rest tomorrow and try a gentler version of those exercises next time. Less range of motion can still build strength safely.',
        color: '#C4A484',
      };
    }
    if (!fatigueManageable || !stable) {
      return {
        icon: '💧',
        title: 'Rest well tonight',
        text: 'Your body worked hard today. Prioritise sleep, hydration, and a gentle walk tomorrow rather than another structured session.',
        color: COLORS.secondary,
      };
    }
    return {
      icon: '🌟',
      title: 'Great session!',
      text: "You listened to your body and exercised safely. That's exactly what sustainable fitness looks like for hEDS. Well done!",
      color: '#84C4A3',
    };
  };

  if (submitted) {
    const advice = getAdvice();
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>{advice.icon}</Text>
          <Text style={[styles.successTitle, { color: advice.color }]}>{advice.title}</Text>
          <Text style={styles.successText}>{advice.text}</Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: advice.color }]}
            onPress={() => navigation.navigate('Tabs', { screen: 'More' } as any)}
          >
            <Text style={styles.doneBtnText}>Back to home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Recovery check-in</Text>
        <Text style={styles.subtitle}>
          5 quick questions to help you understand how your body responded.
        </Text>

        {QUESTIONS.map((q) => (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionText}>{q.text}</Text>
            <View style={styles.answerRow}>
              <TouchableOpacity
                style={[
                  styles.answerBtn,
                  answers[q.id] === true && {
                    backgroundColor: q.yesIsGood ? '#EAF7F0' : '#FDEEF3',
                    borderColor: q.yesIsGood ? '#84C4A3' : COLORS.primary,
                  },
                ]}
                onPress={() => handleAnswer(q.id, true)}
              >
                <Text
                  style={[
                    styles.answerBtnText,
                    answers[q.id] === true && {
                      color: q.yesIsGood ? '#84C4A3' : COLORS.primary,
                      fontWeight: '700',
                    },
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.answerBtn,
                  answers[q.id] === false && {
                    backgroundColor: q.yesIsGood ? '#FDEEF3' : '#EAF7F0',
                    borderColor: q.yesIsGood ? COLORS.primary : '#84C4A3',
                  },
                ]}
                onPress={() => handleAnswer(q.id, false)}
              >
                <Text
                  style={[
                    styles.answerBtnText,
                    answers[q.id] === false && {
                      color: q.yesIsGood ? COLORS.primary : '#84C4A3',
                      fontWeight: '700',
                    },
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitBtn, !allAnswered && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!allAnswered}
        >
          <Text style={styles.submitBtnText}>See my feedback</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  questionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.base,
    marginBottom: SPACING.md,
  },
  answerRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  answerBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  answerBtnText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
  },
  successIcon: {
    fontSize: 64,
    marginBottom: SPACING.xl,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  successText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.base,
    marginBottom: SPACING['2xl'],
  },
  doneBtn: {
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
  },
  doneBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: TYPOGRAPHY.fontSize.base,
  },
});
