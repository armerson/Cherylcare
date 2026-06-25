import { addDays, differenceInDays, parseISO, format, isAfter } from 'date-fns';
import type { CycleEntry, CyclePhase } from '../types';

export function calculateCycleDay(periodStartDate: string, today: Date = new Date()): number {
  const start = parseISO(periodStartDate);
  return differenceInDays(today, start) + 1;
}

export function calculateCyclePhase(
  cycleDay: number,
  cycleLength: number = 28,
): CyclePhase {
  const ovulationDay = Math.round(cycleLength - 14);
  const follicularStart = 6;
  const ovulatoryStart = ovulationDay - 1;
  const lutealStart = ovulationDay + 2;

  if (cycleDay >= 1 && cycleDay <= 5) return 'menstrual';
  if (cycleDay >= follicularStart && cycleDay < ovulatoryStart) return 'follicular';
  if (cycleDay >= ovulatoryStart && cycleDay < lutealStart) return 'ovulatory';
  return 'luteal';
}

export function predictNextPeriod(
  cycles: CycleEntry[],
  defaultCycleLength: number = 28,
): Date | null {
  if (cycles.length === 0) return null;
  const sorted = [...cycles].sort(
    (a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime(),
  );
  const lastStart = parseISO(sorted[0].startDate);
  const avgLength = sorted.length >= 3
    ? calculateAverageCycleLength(sorted)
    : defaultCycleLength;
  return addDays(lastStart, avgLength);
}

export function calculateAverageCycleLength(cycles: CycleEntry[]): number {
  const sorted = [...cycles].sort(
    (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime(),
  );
  if (sorted.length < 2) return 28;
  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const length = differenceInDays(
      parseISO(sorted[i].startDate),
      parseISO(sorted[i - 1].startDate),
    );
    if (length >= 20 && length <= 45) lengths.push(length);
  }
  if (lengths.length === 0) return 28;
  return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
}

export function getDaysUntilNextPeriod(predictedDate: Date | null, today: Date = new Date()): number | null {
  if (!predictedDate) return null;
  return Math.max(0, differenceInDays(predictedDate, today));
}

export function isInPMDDWindow(
  cycleDay: number,
  cycleLength: number = 28,
  windowStartDay?: number,
): boolean {
  const start = windowStartDay ?? cycleLength - 10;
  const end = cycleLength - 3;
  return cycleDay >= start && cycleDay <= end;
}

export function getPhaseForDate(
  date: Date,
  cycleEntries: CycleEntry[],
  averageCycleLength: number = 28,
): CyclePhase | null {
  const sorted = [...cycleEntries].sort(
    (a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime(),
  );
  const applicableCycle = sorted.find(c => !isAfter(parseISO(c.startDate), date));
  if (!applicableCycle) return null;
  const day = calculateCycleDay(applicableCycle.startDate, date);
  if (day > averageCycleLength + 5) return null;
  return calculateCyclePhase(day, averageCycleLength);
}

export function calculateCheckInStreak(checkInDates: string[]): number {
  if (checkInDates.length === 0) return 0;
  const sorted = [...checkInDates].sort().reverse();
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const expected = format(addDays(parseISO(sorted[0]), -i), 'yyyy-MM-dd');
    if (sorted[i] === expected) streak++;
    else break;
  }
  return streak;
}
