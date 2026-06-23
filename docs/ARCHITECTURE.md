# CherylCare — Technical Architecture

## System Overview

```
┌────────────────────────────────────────┐
│           React Native (Expo)             │
│                                           │
│  ┌───────┐  ┌───────┐  ┌────────────┐   │
│  │Screens│  │ Store │  │  Services  │   │
│  │  (UI) │  │Zustand│  │ (Firebase) │   │
│  └───────┘  └───────┘  └────────────┘   │
└────────────────────────────────────────┘
                       │ HTTPS/SDK
          ┌──────────┴──────────┐
          │        Firebase          │
          │                         │
          │  Auth    Firestore  FCM  │
          │  Functions             │
          └─────────────────────────┘
```

---

## Component Architecture

### Layer 1: Navigation

```
AppNavigator (Root)
  ├── AuthStack
  │   ├── SplashScreen
  │   ├── OnboardingScreen
  │   └── LoginScreen
  └── MainStack
      ├── TabNavigator
      │   ├── DashboardScreen (tab: Home)
      │   ├── DailyCheckInScreen (tab: Check In)
      │   ├── CycleTrackingScreen (tab: Cycle)
      │   ├── InsightsScreen (tab: Insights)
      │   └── MoreMenuScreen (tab: More)
      ├── PMDDScreen (stack, from More)
      ├── HypermobilityScreen
      ├── MedicationsScreen
      ├── PhysioScreen
      │   ├── PhysioSessionScreen
      │   ├── PhysioPlanScreen
      │   └── RecoveryCheckInScreen
      ├── NutritionScreen
      └── SettingsScreen
```

### Layer 2: Zustand Stores

```typescript
// useAppStore.ts
interface AppState {
  user: FirebaseUser | null;
  settings: UserSettings | null;
  currentCyclePhase: CyclePhase | null;
  currentCycleDay: number | null;
  pmddWindowActive: boolean;
  todayCheckIn: DailyCheckIn | null;
  unreadInsights: number;
  checkInStreak: number;
}

// useCycleStore.ts
interface CycleState {
  cycleEntries: CycleEntry[];
  currentCycle: CycleEntry | null;
  predictedNextPeriod: Date | null;
  averageCycleLength: number;
}

// usePhysioStore.ts
interface PhysioState {
  activePlan: PhysioPlan | null;
  recentSessions: PhysioSession[];
  todaySession: PhysioSession | null;
}
```

### Layer 3: Services

```typescript
// firebase.ts        → Firebase app initialisation
// auth.ts            → signIn, signOut, onAuthStateChanged
// firestore.ts       → CRUD operations for all collections
// notifications.ts   → Expo push notification scheduling
// insights.ts        → Insight fetching and acknowledgement
```

### Layer 4: Reusable Components

```
src/components/
  ui/
    Button.tsx          # Primary, secondary, ghost variants
    Card.tsx            # Elevated card container
    ScaleSlider.tsx     # 1-10 slider with labels
    ChipSelector.tsx    # Multi-select chip row
    SectionHeader.tsx   # Section title + optional action
    EmptyState.tsx      # Illustrated empty states
    Badge.tsx           # Notification badge
  charts/
    SymptomLineChart.tsx  # Victory Native line chart
    CycleBarChart.tsx     # Bar chart for cycle data
    AdherenceRing.tsx     # Circular progress ring
  dashboard/
    CyclePhaseCard.tsx    # Current phase card
    DailyEncouragement.tsx # Encouragement card
    SupplementRing.tsx    # Today's supplement adherence
    CheckInPrompt.tsx     # CTA if check-in not done
  body/
    BodyMap.tsx           # SVG front+back body diagram
    JointSelector.tsx     # Joint picker for pain logging
```

---

## Firebase Architecture

### Authentication
- Provider: Email/Password + Google OAuth
- Session persistence: `browserLocalPersistence` on native (AsyncStorage)
- Token refresh: automatic via Firebase SDK
- Onboarding gate: user cannot reach main app until `profile.onboardingCompleted = true`

### Firestore Security Rules
All writes and reads are scoped to the authenticated user:
```
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### Cloud Functions (Node.js 20)

| Function | Trigger | Schedule |
|----------|---------|----------|
| `generateInsights` | Scheduled | Nightly 2:00am per timezone |
| `detectPMDDWindow` | Firestore trigger: new cycleEntry | On write |
| `sendCycleAlert` | Scheduled | Daily 8:00am |
| `calculateAdherence` | Scheduled | Daily midnight |
| `deleteUserData` | HTTP (auth required) | On user request |
| `exportUserData` | HTTP (auth required) | On user request |

### Offline Support
Firestore is configured with `enableMultiTabIndexedDbPersistence()` (web) or `enableIndexedDbPersistence()` (native). Core operations (check-in, medication log, physio session) queue locally and sync when connection resumes.

---

## Push Notification Architecture

```
Expo Notifications SDK
    │
    ▼
Expo Push Service
    │
    └──► iOS APNs / Android FCM
         │
         ▼
     Device
```

**Token management:**
1. On app launch, request notification permission
2. Get Expo push token
3. Store token in Firestore: `/users/{userId}/profile.expoPushToken`
4. Cloud Functions use Expo Push API to send notifications server-side

---

## Data Flow: Daily Check-In

```
User opens Check-In screen
    │
    ▼
useCheckIn hook loads today's check-in from Zustand cache
(or fetches from Firestore if not cached)
    │
    ▼
User fills form → taps Save
    │
    ▼
Optimistic update to Zustand store
    │
    ▼
Firestore write: /users/{uid}/dailyCheckIns/{YYYY-MM-DD}
With cycleDay and cyclePhase computed locally
    │
    ▼
Insights Cloud Function may re-run overnight
    │
    ▼
Streak counter updated in Zustand
Encouragement card updates on Dashboard
```

---

## Performance Considerations

- Firestore reads are batched: dashboard loads in one compound query
- Zustand store is persisted to AsyncStorage (MMKV in production)
- Images use `expo-image` with aggressive caching
- Victory Native charts lazy-render on tab focus
- SVG BodyMap is a static component rendered once, with state overlay
- Cloud Functions run in `us-central1`; consider `europe-west1` for UK users
