import { format, isToday, isYesterday, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMMM yyyy');
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMM');
}

export function formatDayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEE d MMM');
}

export function formatTime(date: Date): string {
  return format(date, 'h:mm a');
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function fromDateString(dateString: string): Date {
  return parseISO(dateString);
}

export function getTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getDayOfWeekLabel(dayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

export function getDayOfWeekShort(dayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex];
}

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
