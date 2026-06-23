# CherylCare — Database Schema (Firestore)

## Overview

Firestore is a NoSQL document database. CherylCare uses a user-scoped document structure where all data lives under `/users/{userId}/`. This enforces data isolation and simplifies security rules.

---

## Collection Structure

```
/users/{userId}/
  ├── profile (document)
  ├── settings (document)
  ├── cycleEntries/{cycleId}
  ├── dailyCheckIns/{date}          ← date as YYYY-MM-DD (natural ID)
  ├── pmddLogs/{date}
  ├── hypermobilityLogs/{date}
  ├── medicationEntries/{medId}
  ├── medicationLogs/{date_medId}
  ├── nutritionLogs/{date}
  ├── physioSessions/{sessionId}
  ├── physioPlans/{planId}
  │   └── planDays/{dayId}
  └── insights/{insightId}
```

---

## Document Schemas

### `/users/{userId}/profile`
```typescript
{
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  dateOfBirth?: string;           // YYYY-MM-DD
  diagnosedConditions: string[];  // ['hEDS', 'PMDD', 'HSD']
  onboardingCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `/users/{userId}/settings`
```typescript
{
  christianModeEnabled: boolean;  // default: false
  notificationsEnabled: boolean;  // default: true
  dailyReminderTime: string;      // 'HH:mm', e.g. '08:00'
  cycleAlertDaysAhead: number;    // days before PMDD window, default: 3
  averageCycleLength: number;     // default: 28
  averagePeriodLength: number;    // default: 5
  lastPeriodStartDate?: string;   // YYYY-MM-DD
  timezone: string;               // IANA tz, e.g. 'Europe/London'
  units: 'metric' | 'imperial';
  insightsEnabled: boolean;       // default: true
  updatedAt: Timestamp;
}
```

### `/users/{userId}/cycleEntries/{cycleId}`
```typescript
{
  id: string;                     // auto-generated
  startDate: string;              // YYYY-MM-DD
  endDate?: string;               // YYYY-MM-DD (null if ongoing)
  bleedingIntensity: 'spotting' | 'light' | 'medium' | 'heavy';
  symptoms: string[];             // ['cramps', 'bloating', 'headaches', 'breast_tenderness', 'back_pain']
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `/users/{userId}/dailyCheckIns/{date}` (ID = YYYY-MM-DD)
```typescript
{
  date: string;                   // YYYY-MM-DD
  mood: 1 | 2 | 3 | 4 | 5;      // 1=very low, 5=excellent
  energy: number;                 // 1–10
  pain: number;                   // 1–10
  sleep: number;                  // 1–10
  stress: number;                 // 1–10
  notes?: string;
  cycleDay?: number;              // computed at save time
  cyclePhase?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  completedAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `/users/{userId}/pmddLogs/{date}` (ID = YYYY-MM-DD)
```typescript
{
  date: string;
  anxiety: number;        // 1–10
  depression: number;     // 1–10
  irritability: number;   // 1–10
  anger: number;          // 1–10
  brainFog: number;       // 1–10
  overwhelm: number;      // 1–10
  motivation: number;     // 1–10 (10 = high motivation, positive)
  energy: number;         // 1–10
  sleepQuality: number;   // 1–10
  cycleDay?: number;
  cyclePhase?: string;
  notes?: string;
  createdAt: Timestamp;
}
```

### `/users/{userId}/hypermobilityLogs/{date}` (ID = YYYY-MM-DD)
```typescript
{
  date: string;
  jointPain: Array<{
    bodyPart: string;                // 'left_knee', 'right_shoulder', etc.
    side: 'left' | 'right' | 'bilateral' | 'central';
    intensity: number;               // 1–10
  }>;
  instabilityLocations: string[];    // body parts with instability
  subluxations: Array<{
    joint: string;
    side: 'left' | 'right';
    partial: boolean;
    notes?: string;
  }>;
  fatigue: number;                   // 1–10
  dizziness: number;                 // 1–10
  headaches: boolean;
  digestiveSymptoms: boolean;
  exerciseTolerance: number;         // 1–10
  recoveryScore: number;             // 1–10
  cycleDay?: number;
  cyclePhase?: string;
  notes?: string;
  createdAt: Timestamp;
}
```

### `/users/{userId}/medicationEntries/{medId}`
```typescript
{
  id: string;
  name: string;
  type: 'medication' | 'supplement';
  category: 'ssri' | 'pain_relief' | 'hormonal' | 'prescribed_other'
           | 'magnesium' | 'vitamin_d' | 'omega3' | 'vitamin_b6'
           | 'calcium' | 'iron' | 'vitamin_b12' | 'custom';
  dosage: string;                    // e.g. '400mg'
  unit: string;                      // 'mg', 'mcg', 'IU', 'ml'
  timing: 'morning' | 'afternoon' | 'evening' | 'night' | 'with_meals' | 'as_needed';
  reminderEnabled: boolean;
  reminderTime?: string;             // 'HH:mm'
  active: boolean;
  prescribedBy?: string;             // GP name (optional)
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `/users/{userId}/medicationLogs/{id}` (ID = `YYYY-MM-DD_medId`)
```typescript
{
  date: string;
  medicationId: string;
  taken: boolean;
  takenAt?: Timestamp;
  skippedReason?: string;
  notes?: string;
}
```

### `/users/{userId}/nutritionLogs/{date}` (ID = YYYY-MM-DD)
```typescript
{
  date: string;
  waterIntake: number;               // ml
  proteinIntake: number;             // grams (estimated)
  caffeineIntake: number;            // mg
  alcoholUnits: number;              // UK units
  exercise: Array<{
    type: string;                    // 'walking', 'swimming', 'yoga', 'physio'
    durationMinutes: number;
    intensity: 'gentle' | 'moderate' | 'vigorous';
    notes?: string;
  }>;
  sleepDurationHours: number;
  sleepQuality: number;              // 1–10
  stressLevel: number;               // 1–10
  notes?: string;
  createdAt: Timestamp;
}
```

### `/users/{userId}/physioSessions/{sessionId}`
```typescript
{
  id: string;
  date: string;
  planDayId?: string;
  exercises: Array<{
    exerciseId: string;
    name: string;
    category: string;
    bodyArea: string;
    sets: number;
    reps?: number;
    holdSeconds?: number;
    resistance?: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    painBefore: number;              // 1–10
    painDuring: number;
    painAfter: number;
    fatigueAfter: number;
    notes?: string;
  }>;
  totalDurationMinutes: number;
  overallDifficulty: number;
  overallPainBefore: number;
  overallPainAfter: number;
  overallFatigue: number;
  recovery: {
    feltSafe: boolean;
    painIncreased: boolean;
    fatigueIncreased: boolean;
    feelMoreStable: boolean;
    subluxationOccurred: boolean;
    notes?: string;
  };
  notes?: string;
  createdAt: Timestamp;
}
```

### `/users/{userId}/physioPlans/{planId}`
```typescript
{
  id: string;
  name: string;                      // e.g. 'Cheryl's 8-Week Programme'
  active: boolean;
  createdBy: 'user' | 'physio';
  physiotherapistName?: string;
  physiotherapistNotes?: string;
  days: Array<{
    id: string;
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;  // 0=Sunday
    label: string;                           // e.g. 'Core & Glutes'
    exercises: Array<{
      exerciseId: string;
      name: string;
      category: string;
      targetSets: number;
      targetReps?: number;
      targetHoldSeconds?: number;
      targetResistance?: string;
      notes?: string;
    }>;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `/users/{userId}/insights/{insightId}`
```typescript
{
  id: string;
  type: 'pmdd_pattern' | 'sleep_mood' | 'sleep_pain' | 'supplement_sleep'
       | 'supplement_mood' | 'exercise_pain' | 'exercise_fatigue'
       | 'cycle_pain' | 'nutrition_energy' | 'hydration_headache';
  title: string;                     // e.g. 'Anxiety Pattern Detected'
  description: string;               // Human-readable insight text
  confidence: 'low' | 'medium' | 'high';
  correlationValue: number;          // Pearson r value
  dataPoints: number;                // Number of data points analysed
  cyclesAnalysed: number;
  daysAnalysed: number;
  generatedAt: Timestamp;
  acknowledged: boolean;
  acknowledgedAt?: Timestamp;
}
```

---

## Indexes Required

Create composite indexes in Firestore for the following queries:

```
# Daily check-ins by date range
collection: dailyCheckIns
fields: date (ASC), completedAt (DESC)

# PMDD logs by cycle phase
collection: pmddLogs
fields: cyclePhase (ASC), date (ASC)

# Hypermobility logs by cycle phase
collection: hypermobilityLogs
fields: cyclePhase (ASC), date (ASC)

# Medication logs by medication ID
collection: medicationLogs
fields: medicationId (ASC), date (ASC)

# Physio sessions by date
collection: physioSessions
fields: date (DESC)

# Insights by type
collection: insights
fields: type (ASC), generatedAt (DESC)
```

---

## Data Retention and GDPR

- All data is scoped to the authenticated user
- Users can request full data export (JSON) from the Settings screen
- Users can delete all data; this triggers a Cloud Function to permanently delete all sub-collections
- No data is shared with third parties
- Firebase project must have encryption at rest enabled (default on Firestore)
