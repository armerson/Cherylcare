import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

type Firestore = admin.firestore.Firestore;

interface UserProfile {
  cycleLength: number;
  periodLength: number;
  fcmToken?: string;
}

interface UserSettings {
  cycleAlertsEnabled: boolean;
  pmddAlertDaysBeforeWindow: number;
  periodAlertDaysBefore: number;
}

interface CycleEntry {
  startDate: string;
  endDate?: string;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function sendCycleAlerts(
  db: Firestore,
  userId: string
): Promise<void> {
  const profileSnap = await db.doc(`users/${userId}/profile/data`).get();
  const settingsSnap = await db.doc(`users/${userId}/settings/data`).get();

  if (!profileSnap.exists || !settingsSnap.exists) return;

  const profile = profileSnap.data() as UserProfile;
  const settings = settingsSnap.data() as UserSettings;

  if (!settings.cycleAlertsEnabled) return;
  if (!profile.fcmToken) return;

  // Get last open cycle
  const cyclesSnap = await db
    .collection(`users/${userId}/cycles`)
    .orderBy('startDate', 'desc')
    .limit(1)
    .get();

  if (cyclesSnap.empty) return;

  const lastCycle = cyclesSnap.docs[0].data() as CycleEntry;
  const cycleStart = new Date(lastCycle.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycleDay = daysBetween(cycleStart, today) + 1;
  const cycleLength = profile.cycleLength ?? 28;
  const pmddWindowStart = cycleLength - 14;
  const nextPeriodDate = addDays(cycleStart, cycleLength);
  const daysUntilPeriod = daysBetween(today, nextPeriodDate);
  const daysUntilPMDD = pmddWindowStart - cycleDay;

  const messaging = admin.messaging();
  const notifications: Array<{ title: string; body: string }> = [];

  // PMDD window approaching alert
  const pmddAlertDays = settings.pmddAlertDaysBeforeWindow ?? 2;
  if (daysUntilPMDD === pmddAlertDays) {
    notifications.push({
      title: 'Heads up: PMDD window approaching',
      body: `Your luteal phase begins in ${pmddAlertDays} day${pmddAlertDays !== 1 ? 's' : ''}. Consider planning lighter commitments and extra self-care.`,
    });
  }

  // Period approaching alert
  const periodAlertDays = settings.periodAlertDaysBefore ?? 2;
  if (daysUntilPeriod === periodAlertDays) {
    notifications.push({
      title: 'Period due soon',
      body: `Your period is expected in ${periodAlertDays} day${periodAlertDays !== 1 ? 's' : ''}. Make sure you have what you need.`,
    });
  }

  // Send all queued notifications
  for (const notification of notifications) {
    try {
      await messaging.send({
        token: profile.fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          screen: 'Cycle',
          cycleDay: String(cycleDay),
        },
        android: {
          notification: {
            channelId: 'cycle_alerts',
            color: '#C4849B',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      });
      functions.logger.info(`Sent cycle alert "${notification.title}" to user ${userId}`);
    } catch (err) {
      functions.logger.error(`Failed to send notification to user ${userId}`, err);
    }
  }
}
