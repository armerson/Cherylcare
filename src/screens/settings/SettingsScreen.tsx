import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { saveSettings } from '@/services/firestore';
import { signOut } from '@/services/auth';
import {
  scheduleDailyCheckInReminder,
  cancelAllReminders,
} from '@/services/notifications';
import type { UserSettings } from '@/types';

export default function SettingsScreen() {
  const user = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);

  const [local, setLocal] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setLocal({ ...settings });
  }, [settings]);

  const handleSave = async () => {
    if (!user || !local) return;
    setSaving(true);
    try {
      await saveSettings(user.uid, local);
      setSettings(local);

      if (local.checkInReminderEnabled && local.notificationsEnabled) {
        await scheduleDailyCheckInReminder(local.checkInReminderHour, local.checkInReminderMinute);
      } else {
        await cancelAllReminders();
      }

      Alert.alert('Saved', 'Your settings have been updated.');
    } catch {
      Alert.alert('Error', 'Could not save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => { await signOut(); } },
    ]);
  };

  const toggle = (key: keyof UserSettings) => {
    if (!local) return;
    setLocal({ ...local, [key]: !(local[key] as boolean) });
  };

  if (!local) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* Faith */}
        <Section title="Faith & Wellbeing">
          <Row
            label="Christian mode"
            subtitle="Bible verses and prayers on dashboard & check-in"
            icon="✝️"
            value={local.christianModeEnabled}
            onToggle={() => toggle('christianModeEnabled')}
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Row
            label="All notifications"
            subtitle="Master switch for CherylCare alerts"
            icon="🔔"
            value={local.notificationsEnabled}
            onToggle={() => toggle('notificationsEnabled')}
          />
          <Divider />
          <Row
            label="Daily check-in reminder"
            subtitle={`${String(local.checkInReminderHour).padStart(2, '0')}:${String(local.checkInReminderMinute).padStart(2, '0')} each day`}
            icon="⏰"
            value={local.checkInReminderEnabled}
            onToggle={() => toggle('checkInReminderEnabled')}
          />
          <Divider />
          <Row
            label="Cycle alerts"
            subtitle={`${local.cycleAlertDaysAhead} days before period & PMDD window`}
            icon="📅"
            value={local.cycleAlertsEnabled}
            onToggle={() => toggle('cycleAlertsEnabled')}
          />
          <Divider />
          <Row
            label="Medication reminders"
            subtitle="Daily supplement & medication prompts"
            icon="💊"
            value={local.medicationRemindersEnabled}
            onToggle={() => toggle('medicationRemindersEnabled')}
          />
        </Section>

        {/* Insights */}
        <Section title="Insights">
          <Row
            label="Pattern insights"
            subtitle="Nightly analysis of your tracking data"
            icon="✨"
            value={local.insightsEnabled}
            onToggle={() => toggle('insightsEnabled')}
          />
        </Section>

        {/* Cycle */}
        <Section title="Cycle Settings">
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🔄</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Average cycle length</Text>
              <Text style={styles.infoValue}>{local.averageCycleLength} days (auto-updated from your logs)</Text>
            </View>
          </View>
          <Divider />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🩸</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Average period length</Text>
              <Text style={styles.infoValue}>{local.averagePeriodLength} days (auto-updated from your logs)</Text>
            </View>
          </View>
        </Section>

        {/* Conditions */}
        <Section title="My Conditions">
          {profile?.diagnosedConditions?.length ? (
            <View style={styles.chipsWrap}>
              {profile.diagnosedConditions.map((c) => (
                <View key={c} style={styles.chip}>
                  <Text style={styles.chipText}>{c}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No conditions added</Text>
          )}
        </Section>

        {/* Data */}
        <Section title="Data & Privacy">
          <TouchableOpacity style={styles.dataRow}>
            <Text style={styles.dataRowText}>Export my data</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            style={styles.dataRow}
            onPress={() =>
              Alert.alert(
                'Delete all data',
                'This permanently deletes all your tracking data. This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => {} },
                ]
              )
            }
          >
            <Text style={[styles.dataRowText, { color: COLORS.error }]}>Delete all my data</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Section>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save changes'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({
  label, subtitle, icon, value, onToggle,
}: {
  label: string; subtitle?: string; icon: string; value: boolean; onToggle: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: COLORS.primaryLight }}
        thumbColor={value ? COLORS.primary : '#BDBDBD'}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING['4xl'] },
  title: { fontSize: TYPOGRAPHY.fontSize['3xl'], fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xl },
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm,
  },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, padding: SPACING.md, ...SHADOWS.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.md },
  rowIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textPrimary, fontWeight: '500' },
  rowSubtitle: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.md },
  infoIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textPrimary, fontWeight: '500' },
  infoValue: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: SPACING.xs },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, paddingVertical: SPACING.sm },
  chip: {
    backgroundColor: COLORS.primaryLight, borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
  },
  chipText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.primary, fontWeight: '500' },
  emptyText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary, paddingVertical: SPACING.sm },
  dataRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, justifyContent: 'space-between' },
  dataRowText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textPrimary },
  chevron: { fontSize: TYPOGRAPHY.fontSize.xl, color: COLORS.textTertiary },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.md },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#FFFFFF', fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600' },
  signOutBtn: { padding: SPACING.lg, alignItems: 'center' },
  signOutText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textSecondary },
});
