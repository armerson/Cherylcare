import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

type Firestore = admin.firestore.Firestore;

interface CheckInData {
  date: string;
  mood: number;
  energy: number;
  pain: number;
  sleep: number;
  stress: number;
  cycleDay?: number;
  cyclePhase?: string;
}

interface PMDDLogData {
  date: string;
  anxiety: number;
  depression: number;
  irritability: number;
  overwhelm: number;
  brainFog: number;
  fatigue: number;
  sleep: number;
  motivation: number;
  energy: number;
  cycleDay?: number;
}

interface InsightToWrite {
  type: string;
  message: string;
  dataBasis: string;
  confidence: 'low' | 'medium' | 'high';
  correlationValue?: number;
  generatedAt: admin.firestore.Timestamp;
  acknowledged: boolean;
}

// Pearson correlation coefficient
function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 5) return 0;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const denom = Math.sqrt(denX * denY);
  return denom === 0 ? 0 : num / denom;
}

function confidenceFromR(r: number): 'low' | 'medium' | 'high' | null {
  const abs = Math.abs(r);
  if (abs < 0.25) return null;
  if (abs < 0.4) return 'low';
  if (abs < 0.6) return 'medium';
  return 'high';
}

export async function generateInsightsForUser(
  db: Firestore,
  userId: string
): Promise<void> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

  // Fetch last 30 days of check-ins
  const checkInsSnap = await db
    .collection(`users/${userId}/dailyCheckIns`)
    .where('date', '>=', cutoffDate)
    .orderBy('date', 'asc')
    .get();

  const checkIns: CheckInData[] = checkInsSnap.docs.map((d) => d.data() as CheckInData);

  // Fetch PMDD logs
  const pmddSnap = await db
    .collection(`users/${userId}/pmddLogs`)
    .where('date', '>=', cutoffDate)
    .orderBy('date', 'asc')
    .get();

  const pmddLogs: PMDDLogData[] = pmddSnap.docs.map((d) => d.data() as PMDDLogData);

  const insights: InsightToWrite[] = [];

  // Algorithm 1: Sleep -> Mood correlation
  if (checkIns.length >= 10) {
    const sleepVals = checkIns.map((c) => c.sleep);
    const moodVals = checkIns.map((c) => c.mood);
    const r = pearson(sleepVals, moodVals);
    const conf = confidenceFromR(r);
    if (conf) {
      insights.push({
        type: 'sleep_mood',
        message:
          r > 0
            ? `Your data suggests that nights with more sleep tend to be followed by better mood days. This pattern appeared across ${checkIns.length} check-ins.`
            : `Interestingly, your mood and sleep scores haven't moved together in the last month. Other factors may be playing a larger role for you.`,
        dataBasis: `Based on ${checkIns.length} daily check-ins over the last 30 days (r = ${r.toFixed(2)}).`,
        confidence: conf,
        correlationValue: r,
        generatedAt: admin.firestore.Timestamp.now(),
        acknowledged: false,
      });
    }
  }

  // Algorithm 2: Cycle day -> Pain correlation
  const checkInsWithCycleDay = checkIns.filter((c) => c.cycleDay !== undefined);
  if (checkInsWithCycleDay.length >= 10) {
    const cycleDayVals = checkInsWithCycleDay.map((c) => c.cycleDay!);
    const painVals = checkInsWithCycleDay.map((c) => c.pain);
    const r = pearson(cycleDayVals, painVals);
    const conf = confidenceFromR(r);
    if (conf && r > 0.3) {
      insights.push({
        type: 'cycle_pain',
        message:
          `Your joint and overall pain scores appear to increase in the later part of your cycle. This is common with hEDS — progesterone changes in the luteal phase can increase joint laxity. Gentle preparation (extra rest, reduced high-impact exercise) in days 17+ may help.`,
        dataBasis: `Correlation between cycle day and pain score across ${checkInsWithCycleDay.length} logged days (r = ${r.toFixed(2)}).`,
        confidence: conf,
        correlationValue: r,
        generatedAt: admin.firestore.Timestamp.now(),
        acknowledged: false,
      });
    }
  }

  // Algorithm 3: PMDD window — anxiety spike detection
  if (pmddLogs.length >= 14) {
    const lutealLogs = pmddLogs.filter(
      (l) => l.cycleDay !== undefined && l.cycleDay >= 17
    );
    const nonLutealLogs = pmddLogs.filter(
      (l) => l.cycleDay !== undefined && l.cycleDay < 17
    );

    if (lutealLogs.length >= 5 && nonLutealLogs.length >= 5) {
      const lutealAnxiety =
        lutealLogs.reduce((s, l) => s + l.anxiety, 0) / lutealLogs.length;
      const nonLutealAnxiety =
        nonLutealLogs.reduce((s, l) => s + l.anxiety, 0) / nonLutealLogs.length;
      const diff = lutealAnxiety - nonLutealAnxiety;

      if (diff >= 1.5) {
        insights.push({
          type: 'pmdd_pattern',
          message:
            `Your anxiety scores are notably higher during the luteal phase (day 17+) compared to the rest of your cycle. Your average luteal anxiety is ${lutealAnxiety.toFixed(1)} vs ${nonLutealAnxiety.toFixed(1)} outside that window. This pattern is consistent with PMDD. Consider discussing this data with your GP or gynaecologist.`,
          dataBasis: `Comparison of anxiety scores: ${lutealLogs.length} luteal-phase days vs ${nonLutealLogs.length} non-luteal days.`,
          confidence: diff >= 2.5 ? 'high' : diff >= 1.5 ? 'medium' : 'low',
          generatedAt: admin.firestore.Timestamp.now(),
          acknowledged: false,
        });
      }
    }
  }

  // Algorithm 4: Energy -> Fatigue (stress drains energy)
  if (checkIns.length >= 10) {
    const stressVals = checkIns.map((c) => c.stress);
    const energyVals = checkIns.map((c) => c.energy);
    const r = pearson(stressVals, energyVals);
    const conf = confidenceFromR(r);
    if (conf && r < -0.3) {
      insights.push({
        type: 'exercise_fatigue',
        message:
          `Your data shows a pattern: higher stress days tend to correlate with lower energy. For hEDS, stress management isn't a luxury — it directly affects your physical capacity. Even 5 minutes of breathing exercises on high-stress days may help your energy levels.`,
        dataBasis: `Based on stress vs energy across ${checkIns.length} check-ins (r = ${r.toFixed(2)}).`,
        confidence: conf,
        correlationValue: r,
        generatedAt: admin.firestore.Timestamp.now(),
        acknowledged: false,
      });
    }
  }

  if (insights.length === 0) {
    functions.logger.info(`No new insights for user ${userId} (insufficient pattern strength)`);
    return;
  }

  // Write insights, avoiding duplicates by type within the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const existingSnap = await db
    .collection(`users/${userId}/insights`)
    .where('generatedAt', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
    .get();

  const recentTypes = new Set(existingSnap.docs.map((d) => d.data().type as string));

  const batch = db.batch();
  let written = 0;
  for (const insight of insights) {
    if (recentTypes.has(insight.type)) continue;
    const ref = db.collection(`users/${userId}/insights`).doc();
    batch.set(ref, { ...insight, id: ref.id });
    written++;
  }
  if (written > 0) {
    await batch.commit();
    functions.logger.info(`Wrote ${written} insights for user ${userId}`);
  }
}
