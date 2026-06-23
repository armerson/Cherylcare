import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root stack navigates between auth and app
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

// Auth screens
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
};

// Bottom tab screens
export type TabParamList = {
  Home: undefined;
  CheckIn: undefined;
  Cycle: undefined;
  Insights: undefined;
  More: undefined;
};

// Main app stack (overlaid on tabs)
export type MainStackParamList = {
  Tabs: undefined;
  PMDDTracking: undefined;
  PMDD: undefined;
  Hypermobility: undefined;
  Medications: undefined;
  Physio: undefined;
  PhysioSession: { planId?: string };
  RecoveryCheckIn: undefined;
  Nutrition: undefined;
  Settings: undefined;
  InsightDetail: { insightId: string };
  CyclePhaseInfo: { phase: string };
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> =
  BottomTabScreenProps<TabParamList, T>;

export type MainScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;
