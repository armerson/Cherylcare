import { useEffect, useCallback } from 'react';
import { getCycleEntries, getRecentCheckIns } from '../services/firestore';
import {
  calculateCycleDay,
  calculateCyclePhase,
  predictNextPeriod,
  getDaysUntilNextPeriod,
  isInPMDDWindow,
  calculateCheckInStreak,
} from '../utils/cycleCalculations';
import { useAppStore } from '../store/useAppStore';

export function useCycleInit(uid: string | undefined) {
  const setCycleData = useAppStore(s => s.setCycleData);
  const setCheckInStreak = useAppStore(s => s.setCheckInStreak);
  const settings = useAppStore(s => s.settings);

  const loadCycleData = useCallback(async () => {
    if (!uid) return;
    try {
      const [cycles, checkIns] = await Promise.all([
        getCycleEntries(uid, 6),
        getRecentCheckIns(uid, 90),
      ]);

      const avgLength = settings?.averageCycleLength ?? 28;

      if (cycles.length === 0) {
        setCycleData({
          cycleDay: null,
          cyclePhase: null,
          currentCycle: null,
          nextPeriodDate: null,
          pmddWindowActive: false,
          pmddWindowDaysUntil: null,
        });
        return;
      }

      const sorted = [...cycles].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
      const currentCycle = sorted[0];
      const cycleDay = calculateCycleDay(currentCycle.startDate);
      const cyclePhase = calculateCyclePhase(cycleDay, avgLength);
      const nextPeriodDate = predictNextPeriod(cycles, avgLength);
      const pmddWindowActive = isInPMDDWindow(cycleDay, avgLength);
      const pmddWindowDaysUntil = getDaysUntilNextPeriod(
        nextPeriodDate
          ? new Date(nextPeriodDate.getTime() - (avgLength - 10) * 86400000)
          : null,
      );

      setCycleData({
        cycleDay,
        cyclePhase,
        currentCycle,
        nextPeriodDate,
        pmddWindowActive,
        pmddWindowDaysUntil,
      });

      const streak = calculateCheckInStreak(checkIns.map(c => c.date));
      setCheckInStreak(streak);
    } catch (error) {
      console.error('Error loading cycle data:', error);
    }
  }, [uid, settings?.averageCycleLength, setCycleData, setCheckInStreak]);

  useEffect(() => {
    loadCycleData();
  }, [loadCycleData]);

  return { refresh: loadCycleData };
}
