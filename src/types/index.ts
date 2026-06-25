export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
export type InsightType = 'sleep_mood' | 'cycle_pain' | 'pmdd_pattern' | 'stress_energy' | 'general';

export interface FirestoreTimestamp {
  toDate(): Date;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  name?: string;
  email: string;
  diagnosedConditions: string[];
  onboardingCompleted: boolean;
  dateOfBirth?: string;
  createdAt: Date | FirestoreTimestamp;
  updatedAt: Date | FirestoreTimestamp;
}

export interface UserSettings {
  christianModeEnabled: boolean;
  notificationsEnabled: boolean;
  checkInReminderEnabled: boolean;
  checkInReminderHour: number;
  checkInReminderMinute: number;
  cycleAlertsEnabled: boolean;
  cycleAlertDaysAhead: number;
  medicationRemindersEnabled: boolean;
  averageCycleLength: number;
  averagePeriodLength: number;
  timezone: string;
  units: 'metric' | 'imperial';
  insightsEnabled: boolean;
  updatedAt: Date | FirestoreTimestamp;
}

export interface DailyCheckIn {
  date: string;
  mood: number;
  painLevel: number;
  fatigue: number;
  stress: number;
  sleepQuality: number;
  notes?: string;
  completedAt?: Date | FirestoreTimestamp;
  updatedAt?: Date | FirestoreTimestamp;
}

export interface CycleEntry {
  id: string;
  startDate: string;
  endDate?: string;
  type: 'period_start' | 'period_end' | 'spotting';
  notes?: string;
  flow?: 'light' | 'medium' | 'heavy';
  createdAt: Date | FirestoreTimestamp;
  updatedAt?: Date | FirestoreTimestamp;
}

export interface PMDDLog {
  date: string;
  irritability: number;
  anxiety: number;
  depression: number;
  foodCravings: number;
  bloating: number;
  breastTenderness: number;
  fatigue: number;
  sleepDisturbance: number;
  concentration: number;
  overwhelm: number;
  notes?: string;
  cycleDay?: number;
  createdAt: Date | FirestoreTimestamp;
}

export interface HypermobilityLog {
  date: string;
  jointPain: string[];
  subluxations: string[];
  fatigue: number;
  dizziness: number;
  exerciseCompleted: boolean;
  exerciseType?: string;
  recoveryTime?: number;
  headaches: boolean;
  digestiveIssues: boolean;
  notes?: string;
  createdAt: Date | FirestoreTimestamp;
}

export interface MedicationEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  type: 'medication' | 'supplement';
  reminderEnabled: boolean;
  reminderTimes: string[];
  active: boolean;
  notes?: string;
  createdAt: Date | FirestoreTimestamp;
  updatedAt: Date | FirestoreTimestamp;
}

export interface MedicationLog {
  medicationId: string;
  date: string;
  taken: boolean;
  takenAt?: string;
  skippedReason?: string;
}

export interface NutritionLog {
  date: string;
  waterMl: number;
  proteinG: number;
  caffeineG: number;
  alcoholUnits: number;
  sleepHours: number;
  exerciseMinutes: number;
  supplements: Record<string, boolean>;
  notes?: string;
  createdAt: Date | FirestoreTimestamp;
}

export interface PhysioExercise {
  name: string;
  sets: number;
  reps: number;
  holdSeconds?: number;
  notes?: string;
  category: string;
}

export interface PhysioPlanDay {
  dayNumber: number;
  label: string;
  exercises: PhysioExercise[];
}

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
  date: string;
  planId?: string;
  exercises: SessionExercise[];
  durationMinutes: number;
  overallExertion: number;
  recoveryNotes?: string;
  createdAt: Date | FirestoreTimestamp;
}

export interface PhysioPlan {
  id: string;
  name: string;
  active: boolean;
  daysPerWeek: number;
  durationWeeks: number;
  days: PhysioPlanDay[];
  createdAt: Date | FirestoreTimestamp;
  updatedAt: Date | FirestoreTimestamp;
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
