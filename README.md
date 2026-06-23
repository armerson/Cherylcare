# CherylCare

A mobile-first health and wellbeing app for women managing hypermobility (hEDS/HSD), PMDD, menstrual cycle symptoms, chronic fatigue, and joint pain.

## Overview

CherylCare is a compassionate digital companion that helps users:
- Track their menstrual cycle and predict future periods
- Monitor PMDD symptoms and identify emotional patterns
- Log hypermobility-related symptoms and flares
- Track medications and supplements with adherence statistics
- Record nutrition, lifestyle, and sleep data
- Complete a daily check-in in under 2 minutes
- Receive AI-generated pattern insights
- Access personalised encouragement (with optional Christian mode)
- Follow a physio/strength training programme safely

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile Framework | React Native + Expo SDK 51 |
| Language | TypeScript |
| Navigation | React Navigation v6 |
| State Management | Zustand |
| Database | Firebase Firestore |
| Authentication | Firebase Auth |
| Backend Functions | Firebase Cloud Functions |
| Push Notifications | Expo Notifications + Firebase FCM |
| Charts | Victory Native |
| Offline Support | Firestore Offline Persistence |

## Getting Started

### Prerequisites
- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- Firebase project configured
- iOS Simulator, Android Emulator, or Expo Go

### Installation

```bash
cd cherylcare
npm install
cp .env.example .env
# Fill in your Firebase credentials in .env
npx expo start
```

### Firebase Setup
1. Create a Firebase project at console.firebase.google.com
2. Enable Authentication (Email/Password + Google Sign-In)
3. Create a Firestore database in production mode
4. Enable Cloud Functions (Blaze plan required)
5. Copy your Firebase config to `src/services/firebase.ts`
6. Deploy security rules: `firebase deploy --only firestore:rules`
7. Deploy functions: `firebase deploy --only functions`

## Project Structure

```
cherylcare/
├── App.tsx                        # Root component with navigation
├── app.json                       # Expo configuration
├── package.json
├── tsconfig.json
├── src/
│   ├── navigation/                # React Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   ├── screens/                   # Screen components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── check-in/
│   │   ├── cycle/
│   │   ├── pmdd/
│   │   ├── hypermobility/
│   │   ├── medications/
│   │   ├── physio/
│   │   ├── insights/
│   │   └── settings/
│   ├── components/                # Reusable UI components
│   │   ├── ui/
│   │   ├── charts/
│   │   ├── dashboard/
│   │   └── body/
│   ├── constants/                 # Colours, theme, static data
│   ├── hooks/                     # Custom React hooks
│   ├── services/                  # Firebase, notifications, insights
│   ├── store/                     # Zustand state stores
│   ├── types/                     # TypeScript interfaces
│   └── utils/                     # Helper functions
├── firebase/
│   ├── firestore.rules
│   └── functions/
└── docs/
    ├── PRD.md
    ├── DATABASE_SCHEMA.md
    ├── USER_JOURNEYS.md
    ├── WIREFRAMES.md
    ├── ARCHITECTURE.md
    ├── AI_INSIGHTS.md
    ├── NOTIFICATIONS.md
    ├── MVP_ROADMAP.md
    └── FUTURE_ROADMAP.md
```

## Documentation

See the `docs/` folder for comprehensive documentation:
- [Product Requirements Document](docs/PRD.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [User Journeys](docs/USER_JOURNEYS.md)
- [Screen Wireframes](docs/WIREFRAMES.md)
- [Technical Architecture](docs/ARCHITECTURE.md)
- [AI Insights Engine](docs/AI_INSIGHTS.md)
- [Notification Strategy](docs/NOTIFICATIONS.md)
- [MVP Roadmap](docs/MVP_ROADMAP.md)
- [Future Roadmap](docs/FUTURE_ROADMAP.md)

## Privacy and Security

This app handles sensitive health data. All contributors must:
- Follow GDPR and HIPAA-aware data practices
- Never log personally identifiable health data to the console
- Ensure all Firebase credentials are in `.env` and never committed
- Follow the security rules defined in `firebase/firestore.rules`

## Licence

Private — all rights reserved.
