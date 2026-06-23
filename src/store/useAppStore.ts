import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type {
  UserProfile,
  UserSettings,
  DailyCheckIn,
  CyclePhase,
  CycleEntry,
  Insight,
} from '../types';

interface AppState {
  // Auth
  user: User | null;
  isInitialised: boolean;
  setUser: (user: User | null) => void;
  setInitialised: (value: boolean) => void;

  // Profile and settings
  profile: UserProfile | null;
  settings: UserSettings | null;
  setProfile: (profile: UserProfile | null) => void;
  setSettings: (settings: UserSettings | null) => void;

  // Cycle state
  currentCycleDay: number | null;
  currentCyclePhase: CyclePhase | null;
  currentCycle: CycleEntry | null;
  nextPeriodDate: Date | null;
  pmddWindowActive: boolean;
  pmddWindowDaysUntil: number | null;
  setCycleData: (data: {
    cycleDay: number | null;
    cyclePhase: CyclePhase | null;
    currentCycle: CycleEntry | null;
    nextPeriodDate: Date | null;
    pmddWindowActive: boolean;
    pmddWindowDaysUntil: number | null;
  }) => void;

  // Today's check-in
  todayCheckIn: DailyCheckIn | null;
  checkInStreak: number;
  setTodayCheckIn: (checkIn: DailyCheckIn | null) => void;
  setCheckInStreak: (streak: number) => void;

  // Insights
  unreadInsights: number;
  insights: Insight[];
  setInsights: (insights: Insight[]) => void;
  acknowledgeInsight: (id: string) => void;

  // Supplement adherence
  todaySupplementAdherence: number;   // 0-1 fraction
  setTodaySupplementAdherence: (value: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isInitialised: false,
  setUser: (user) => set({ user }),
  setInitialised: (isInitialised) => set({ isInitialised }),

  profile: null,
  settings: null,
  setProfile: (profile) => set({ profile }),
  setSettings: (settings) => set({ settings }),

  currentCycleDay: null,
  currentCyclePhase: null,
  currentCycle: null,
  nextPeriodDate: null,
  pmddWindowActive: false,
  pmddWindowDaysUntil: null,
  setCycleData: (data) => set({
    currentCycleDay: data.cycleDay,
    currentCyclePhase: data.cyclePhase,
    currentCycle: data.currentCycle,
    nextPeriodDate: data.nextPeriodDate,
    pmddWindowActive: data.pmddWindowActive,
    pmddWindowDaysUntil: data.pmddWindowDaysUntil,
  }),

  todayCheckIn: null,
  checkInStreak: 0,
  setTodayCheckIn: (todayCheckIn) => set({ todayCheckIn }),
  setCheckInStreak: (checkInStreak) => set({ checkInStreak }),

  unreadInsights: 0,
  insights: [],
  setInsights: (insights) => set({
    insights,
    unreadInsights: insights.filter(i => !i.acknowledged).length,
  }),
  acknowledgeInsight: (id) => set((state) => {
    const updated = state.insights.map(i =>
      i.id === id ? { ...i, acknowledged: true } : i,
    );
    return {
      insights: updated,
      unreadInsights: updated.filter(i => !i.acknowledged).length,
    };
  }),

  todaySupplementAdherence: 0,
  setTodaySupplementAdherence: (todaySupplementAdherence) =>
    set({ todaySupplementAdherence }),
}));
