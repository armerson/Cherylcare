import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { signUp } from '../../services/auth';
import type { AuthScreenProps } from '../../navigation/types';

const CONDITIONS = [
  { id: 'hEDS', label: 'hEDS / Hypermobile EDS' },
  { id: 'HSD', label: 'HSD (Hypermobility Spectrum Disorder)' },
  { id: 'PMDD', label: 'PMDD' },
  { id: 'chronic_fatigue', label: 'Chronic Fatigue' },
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'other', label: 'Other chronic condition' },
];

type Step = 'welcome' | 'account' | 'conditions' | 'cycle' | 'done';

export default function OnboardingScreen({ navigation }: AuthScreenProps<'Onboarding'>) {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCondition = (id: string) => {
    setSelectedConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    );
  };

  const handleCreateAccount = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp(email.trim(), password, name.trim());
      setStep('conditions');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(msg.replace('Firebase: ', '').replace(/\(auth.*\)/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  if (step === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeContent}>
          <Text style={styles.heroEmoji}>🌸</Text>
          <Text style={styles.heroTitle}>Welcome to{`\n`}CherylCare</Text>
          <Text style={styles.heroSubtitle}>
            A compassionate companion for your body, your cycle,
            and your wellbeing.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep('account')}
          >
            <Text style={styles.primaryButtonText}>Get started</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ghostButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.ghostButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'account') {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.stepTitle}>Create your account</Text>
            <Text style={styles.stepSubtitle}>Your data stays private and belongs only to you.</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.fieldLabel}>Your name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Cheryl"
              autoCapitalize="words"
              autoComplete="name"
            />

            <Text style={styles.fieldLabel}>Email address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleCreateAccount}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Creating account...' : 'Create account'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  if (step === 'conditions') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.stepTitle}>About you</Text>
          <Text style={styles.stepSubtitle}>
            Select any conditions you manage. This helps us personalise your experience.
          </Text>
          {CONDITIONS.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.conditionChip,
                selectedConditions.includes(c.id) && styles.conditionChipSelected,
              ]}
              onPress={() => toggleCondition(c.id)}
            >
              <Text style={[
                styles.conditionChipText,
                selectedConditions.includes(c.id) && styles.conditionChipTextSelected,
              ]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep('cycle')}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'cycle') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.stepTitle}>Your cycle</Text>
          <Text style={styles.stepSubtitle}>
            This helps us predict your next period and identify patterns.
            You can adjust these later.
          </Text>

          <Text style={styles.fieldLabel}>Typical cycle length: {cycleLength} days</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setCycleLength(Math.max(20, cycleLength - 1))}
            >
              <Text style={styles.counterButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{cycleLength}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setCycleLength(Math.min(45, cycleLength + 1))}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Typical period length: {periodLength} days</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setPeriodLength(Math.max(2, periodLength - 1))}
            >
              <Text style={styles.counterButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{periodLength}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setPeriodLength(Math.min(10, periodLength + 1))}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep('done')}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.welcomeContent}>
        <Text style={styles.heroEmoji}>✨</Text>
        <Text style={styles.heroTitle}>You\'re all set!</Text>
        <Text style={styles.heroSubtitle}>
          CherylCare is ready to support you.
          Start with your first daily check-in.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('done')}>
          <Text style={styles.primaryButtonText}>Start tracking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  scrollContent: {
    padding: SPACING['2xl'],
    paddingTop: SPACING['3xl'],
  },
  heroEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  heroTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: SPACING['3xl'],
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING['2xl'],
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  primaryButtonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  ghostButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  ghostButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
  },
  disabledButton: { opacity: 0.6 },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  conditionChip: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  conditionChipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  conditionChipText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  conditionChipTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    fontSize: 24,
    color: COLORS.textPrimary,
    fontWeight: '300',
  },
  counterValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
});
