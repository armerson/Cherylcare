import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import {
  getMedications,
  saveMedicationEntry,
  saveMedicationLog,
  getTodayMedicationLogs,
} from '../../services/firestore';
import { getTodayDateString } from '../../utils/dateHelpers';
import type { MedicationEntry, MedicationLog, MedicationCategory, MedicationTiming } from '../../types';

const SUPPLEMENT_SUGGESTIONS = [
  { name: 'Magnesium glycinate', category: 'magnesium' as MedicationCategory, dosage: '400mg', unit: 'mg', timing: 'evening' as MedicationTiming },
  { name: 'Vitamin D3', category: 'vitamin_d' as MedicationCategory, dosage: '2000', unit: 'IU', timing: 'morning' as MedicationTiming },
  { name: 'Omega-3 / Fish oil', category: 'omega3' as MedicationCategory, dosage: '1000mg', unit: 'mg', timing: 'with_meals' as MedicationTiming },
  { name: 'Vitamin B6', category: 'vitamin_b6' as MedicationCategory, dosage: '50mg', unit: 'mg', timing: 'morning' as MedicationTiming },
  { name: 'Vitamin B12', category: 'vitamin_b12' as MedicationCategory, dosage: '1000', unit: 'mcg', timing: 'morning' as MedicationTiming },
  { name: 'Iron', category: 'iron' as MedicationCategory, dosage: '14mg', unit: 'mg', timing: 'morning' as MedicationTiming },
  { name: 'Calcium', category: 'calcium' as MedicationCategory, dosage: '500mg', unit: 'mg', timing: 'with_meals' as MedicationTiming },
];

export default function MedicationsScreen() {
  const { user } = useAppStore();
  const today = getTodayDateString();

  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newType, setNewType] = useState<'medication' | 'supplement'>('supplement');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [meds, todayLogs] = await Promise.all([
      getMedications(user.uid),
      getTodayMedicationLogs(user.uid, today),
    ]);
    setMedications(meds);
    setLogs(todayLogs);
  }, [user, today]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (med: MedicationEntry) => {
    if (!user) return;
    const existingLog = logs.find(l => l.medicationId === med.id);
    const taken = !existingLog?.taken;
    const newLog: MedicationLog = {
      date: today,
      medicationId: med.id,
      taken,
      takenAt: taken ? new Date() : undefined,
    };
    setLogs(prev => [
      ...prev.filter(l => l.medicationId !== med.id),
      newLog,
    ]);
    await saveMedicationLog(user.uid, newLog);
  };

  const handleAddMedication = async () => {
    if (!user || !newName.trim()) {
      Alert.alert('Required', 'Please enter a medication name.');
      return;
    }
    setSaving(true);
    try {
      await saveMedicationEntry(user.uid, {
        name: newName.trim(),
        type: newType,
        category: 'custom',
        dosage: newDosage.trim() || 'As directed',
        unit: '',
        timing: 'morning',
        reminderEnabled: false,
        active: true,
      });
      setShowAddModal(false);
      setNewName('');
      setNewDosage('');
      load();
    } catch {
      Alert.alert('Error', 'Could not save medication.');
    } finally {
      setSaving(false);
    }
  };

  const takenCount = logs.filter(l => l.taken).length;
  const adherence = medications.length > 0
    ? Math.round((takenCount / medications.length) * 100)
    : 0;

  const supplements = medications.filter(m => m.type === 'supplement');
  const meds = medications.filter(m => m.type === 'medication');

  const renderItem = (med: MedicationEntry) => {
    const log = logs.find(l => l.medicationId === med.id);
    const taken = log?.taken ?? false;
    return (
      <TouchableOpacity
        key={med.id}
        style={[styles.medRow, taken && styles.medRowTaken]}
        onPress={() => handleToggle(med)}
      >
        <View style={[styles.checkbox, taken && styles.checkboxDone]}>
          {taken && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.medInfo}>
          <Text style={[styles.medName, taken && styles.medNameTaken]}>{med.name}</Text>
          <Text style={styles.medDosage}>{med.dosage} {med.unit} · {med.timing.replace('_', ' ')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Adherence summary */}
        {medications.length > 0 && (
          <View style={styles.adherenceCard}>
            <View style={styles.adherenceHeader}>
              <Text style={styles.adherenceTitle}>Today\'s adherence</Text>
              <Text style={styles.adherencePercent}>{adherence}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${adherence}%` }]} />
            </View>
            <Text style={styles.adherenceSub}>{takenCount} of {medications.length} taken</Text>
          </View>
        )}

        {/* Supplements */}
        {supplements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supplements</Text>
            {supplements.map(renderItem)}
          </View>
        )}

        {/* Medications */}
        {meds.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medications</Text>
            {meds.map(renderItem)}
          </View>
        )}

        {/* Add suggestions */}
        {supplements.length === 0 && (
          <View style={styles.suggestionsCard}>
            <Text style={styles.suggestionsTitle}>Common supplements for hEDS & PMDD</Text>
            {SUPPLEMENT_SUGGESTIONS.map(s => (
              <TouchableOpacity
                key={s.name}
                style={styles.suggestionRow}
                onPress={async () => {
                  if (!user) return;
                  await saveMedicationEntry(user.uid, {
                    name: s.name,
                    type: 'supplement',
                    category: s.category,
                    dosage: s.dosage,
                    unit: s.unit,
                    timing: s.timing,
                    reminderEnabled: false,
                    active: true,
                  });
                  load();
                }}
              >
                <Text style={styles.suggestionName}>{s.name}</Text>
                <Text style={styles.suggestionDose}>{s.dosage} {s.unit}</Text>
                <Text style={styles.addIcon}>+</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add medication or supplement</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add medication</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <View style={styles.typeToggle}>
              {(['medication', 'supplement'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeOption, newType === t && styles.typeOptionActive]}
                  onPress={() => setNewType(t)}
                >
                  <Text style={[styles.typeOptionText, newType === t && styles.typeOptionTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Sertraline"
            />

            <Text style={styles.fieldLabel}>Dosage (optional)</Text>
            <TextInput
              style={styles.input}
              value={newDosage}
              onChangeText={setNewDosage}
              placeholder="e.g. 50mg"
            />

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleAddMedication}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.base, paddingBottom: SPACING['4xl'] },
  adherenceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  adherenceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  adherenceTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', color: COLORS.textPrimary },
  adherencePercent: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '700', color: COLORS.accent },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 4,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  adherenceSub: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary },
  section: { marginBottom: SPACING.md },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SPACING.sm,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  medRowTaken: { opacity: 0.7 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  checkmark: { color: COLORS.textInverse, fontSize: 16, fontWeight: '700' },
  medInfo: { flex: 1 },
  medName: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', color: COLORS.textPrimary },
  medNameTaken: { textDecorationLine: 'line-through', color: COLORS.textTertiary },
  medDosage: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary, marginTop: 2 },
  suggestionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  suggestionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    gap: SPACING.sm,
  },
  suggestionName: { flex: 1, fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textPrimary },
  suggestionDose: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary },
  addIcon: { fontSize: 20, color: COLORS.primary, fontWeight: '600' },
  addButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.base,
    alignItems: 'center',
  },
  addButtonText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '500' },
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: '700', color: COLORS.textPrimary },
  modalClose: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.primary },
  modalBody: { padding: SPACING.base },
  typeToggle: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  typeOption: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center' },
  typeOptionActive: { backgroundColor: COLORS.primary },
  typeOptionText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, fontWeight: '500' },
  typeOptionTextActive: { color: COLORS.textInverse, fontWeight: '600' },
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
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  saveButtonText: { color: COLORS.textInverse, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: '600' },
});
