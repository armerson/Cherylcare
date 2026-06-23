export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export type BleedingIntensity = 'spotting' | 'light' | 'medium' | 'heavy';

export interface CycleEntry {
  id: string;
  startDate: string;          // YYYY-MM-DD
  endDate?: string;
  bleedingIntensity: BleedingIntensity;
  symptoms: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyCheckIn {
  date: string;               // YYYY-MM-DD — also the Firestore doc ID
  mood: 1 | 2 | 3 | 4 | 5;  // 1=very low, 5=excellent
  energy: number;             // 1-10
  pain: number;               // 1-10
  sleep: number;              // 1-10
  stress: number;             // 1-10
  notes?: string;
  cycleDay?: number;
  cyclePhase?: CyclePhase;
  completedAt: Date;
  updatedAt: Date;
}

export interface PMDDLog {
  date: string;               // YYYY-MM-DD — Firestore doc ID
  anxiety: number;            // 1-10
  depression: number;
  irritability: number;
  anger: number;
  brainFog: number;
  overwhelm: number;
  motivation: number;         // 1-10, 10 = high motivation (positive)
  energy: number;
  sleepQuality: number;
  cycleDay?: number;
  cyclePhase?: CyclePhase;
  notes?: string;
  createdAt: Date;
}

export interface PainLocation {
  bodyPart: string;
  side: 'left' | 'right' | 'bilateral' | 'central';
  intensity: number;          // 1-10
}

export interface SubluxationEvent {
  joint: string;
  side: 'left' | 'right';
  partial: boolean;
  notes?: string;
}

export interface HypermobilityLog {
  date: string;               // YYYY-MM-DD — Firestore doc ID
  jointPain: PainLocation[];
  instabilityLocations: string[];
  subluxations: SubluxationEvent[];
  fatigue: number;            // 1-10
  dizziness: number;          // 1-10
  headaches: boolean;
  digestiveSymptoms: boolean;
  exerciseTolerance: number;  // 1-10
  recoveryScore: number;      // 1-10
  cycleDay?: number;
  cyclePhase?: CyclePhase;
  notes?: string;
  createdAt: Date;
}

export type MedicationCategory =
  | 'ssri'
  | 'pain_relief'
  | 'hormonal'
  | 'prescribed_other'
  | 'magnesium'
  | 'vitamin_d'
  | 'omega3'
  | 'vitamin_b6'
  | 'calcium'
  | 'iron'
  | 'vitamin_b12'
  | 'custom';

export type MedicationTiming = 'morning' | 'afternoon' | 'evening' | 'night' | 'with_meals' | 'as_needed';

export interface MedicationEntry {
  id: string;
  name: string;
  type: 'medication' | 'supplement';
  category: MedicationCategory;
  dosage: string;
  unit: string;
  timing: MedicationTiming;
  reminderEnabled: boolean;
  reminderTime?: string;      // 'HH:mm'
  active: boolean;
  prescribedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationLog {
  date: string;               // YYYY-MM-DD
  medicationId: string;
  taken: boolean;
  takenAt?: Date;
  skippedReason?: string;
  notes?: string;
}

export interface NutritionLog {
  date: string;
  waterIntakeMl: number;
  proteinGrams: number;
  caffeineMg: number;
  alcoholUnits: number;
  exercise: Array<{
    type: string;
    durationMinutes: number;
    intensity: 'gentle' | 'moderate' | 'vigorous';
    notes?: string;
  }>;
  sleepDurationHours: number;
  sleepQuality: number;       // 1-10
  stressLevel: number;        // 1-10
  notes?: string;
  createdAt: Date;
}

// Simplified exercise shape used in live session logging
export interface SessionExercise {
  name: string;
  category: string;
  sets: number;
  reps: number;
  weight?: number;
  completedSets: number;
  notes?: string;
}

export interface PhysioSession {
  id: string;
  date: string;               // YYYY-MM-DD
  planId?: string;
  exercises: SessionExercise[];
  durationMinutes: number;
  overallExertion: number;    // 1-10
  recoveryNotes?: string;
  createdAt: Date;
}

// Exercise within a physio plan (target values, no tracking)
export interface PhysioExercise {
  name: string;
  category: string;
  sets: number;
  reps: number;
  notes?: string;
}

export interface PhysioPlanDay {
  dayNumber: number;          // 1-based
  label: string;              // e.g. 'Core & Glutes'
  exercises: PhysioExercise[];
}

export interface PhysioPlan {
  id: string;
  name: string;
  active: boolean;
  daysPerWeek: number;
  durationWeeks: number;
  days: PhysioPlanDay[];
  createdBy?: 'user' | 'physio';
  physiotherapistName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type InsightType =
  | 'pmdd_pattern'
  | 'sleep_mood'
  | 'sleep_pain'
  | 'supplement_sleep'
  | 'supplement_mood'
  | 'exercise_pain'
  | 'exercise_fatigue'
  | 'cycle_pain'
  | 'nutrition_energy'
  | 'hydration_headache';

// Insight documents come from Firestore, so generatedAt is a Firestore Timestamp
export interface FirestoreTimestamp {
  toDate(): Date;
}

export interface Insight {
  id: string;
  type: InsightType;
  message: string;
  dataBasis?: string;
  confidence: 'low' | 'medium' | 'high';
  correlationValue?: number;
  generatedAt: FirestoreTimestamp;
  acknowledged: boolean;
  acknowledgedAt?: FirestoreTimestamp;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  diagnosedConditions: string[];
  onboardingCompleted: boolean;
  expoPushToken?: string;
  cycleLength?: number;       // cached average, updated by useCycle hook
  periodLength?: number;
  conditions?: string[];      // alias for diagnosedConditions used in Settings UI
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  christianModeEnabled: boolean;
  notificationsEnabled: boolean;
  checkInReminderEnabled: boolean;
  checkInReminderHour: number;      // 0-23
  checkInReminderMinute: number;    // 0-59
  cycleAlertsEnabled: boolean;
  cycleAlertDaysAhead: number;      // days before period/PMDD to alert
  medicationRemindersEnabled: boolean;
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodStartDate?: string;     // YYYY-MM-DD
  timezone: string;
  units: 'metric' | 'imperial';
  insightsEnabled: boolean;
  updatedAt: Date;
}

export interface Encouragement {
  text: string;
  context: 'pmdd' | 'pain' | 'fatigue' | 'good_day' | 'general' | 'morning' | 'exercise' | 'streak';
  christian?: boolean;
  verse?: string;
  verseRef?: string;
  prayer?: string;
}
