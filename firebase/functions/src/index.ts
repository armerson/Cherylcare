import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { generateInsightsForUser } from './insights/generateInsights';
import { sendCycleAlerts } from './notifications/cycleAlerts';

admin.initializeApp();

// Nightly insight generation — runs at 02:00 UTC every day
export const generateInsights = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('UTC')
  .onRun(async (_context) => {
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').listDocuments();

    const promises = usersSnapshot.map(async (userRef) => {
      try {
        await generateInsightsForUser(db, userRef.id);
      } catch (err) {
        functions.logger.error(`Insight generation failed for user ${userRef.id}`, err);
      }
    });

    await Promise.allSettled(promises);
    functions.logger.info(`Insights generated for ${usersSnapshot.length} users`);
  });

// Cycle alerts — runs at 09:00 UTC every day
export const sendDailyCycleAlerts = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('UTC')
  .onRun(async (_context) => {
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').listDocuments();

    const promises = usersSnapshot.map(async (userRef) => {
      try {
        await sendCycleAlerts(db, userRef.id);
      } catch (err) {
        functions.logger.error(`Cycle alert failed for user ${userRef.id}`, err);
      }
    });

    await Promise.allSettled(promises);
  });

// HTTP trigger to manually generate insights for a single user (dev/admin use)
export const generateInsightsHttp = functions.https.onCall(
  async (data: { userId: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }
    if (context.auth.uid !== data.userId) {
      throw new functions.https.HttpsError('permission-denied', 'Can only generate for own user');
    }
    const db = admin.firestore();
    await generateInsightsForUser(db, data.userId);
    return { success: true };
  }
);
