# CherylCare — AI Insight Generation Logic

## Overview

CherylCare's insight engine analyses a user's historical tracking data to surface meaningful patterns. It is designed to be statistically honest — only surfacing insights with sufficient data and confidence. It never provides medical diagnoses.

---

## Insight Types and Detection Logic

### 1. PMDD Pattern Detection

**Data required:** 3+ complete cycles with PMDD logs and cycle entries

**Algorithm:**
```
1. For each completed cycle, identify the late luteal phase (final 7–10 days)
2. Extract daily PMDD scores for each symptom during that window
3. Compare scores in the late luteal window vs the follicular window
4. Compute mean symptom score for each phase across all cycles
5. Calculate the difference: luteal_mean - follicular_mean
6. If anxiety|depression|irritability|overwhelm difference > 2.5 points across 3+ cycles:
   → Generate PMDD pattern insight
7. Identify the specific cycle days where scores peak (rolling average)
8. Set confidence based on consistency across cycles:
   - 3 cycles → medium
   - 4+ cycles → high
```

**Output example:**
> "Over the last 4 cycles, your anxiety score averages 3.2/10 during the follicular phase but rises to 7.8/10 during the late luteal phase (days 22–27). This is consistent with PMDD."

---

### 2. Sleep–Mood Correlation

**Data required:** 14+ days with both dailyCheckIn (mood, sleep) entries

**Algorithm:**
```
1. Extract paired (sleep_score, next_day_mood_score) data points
   Note: mood is measured the morning after sleep
2. Compute Pearson correlation coefficient r(sleep, mood)
3. Segment: days with sleep >= 8 vs sleep < 8
4. Compute mean mood in each segment
5. Calculate percentage difference
6. Generate insight if |r| > 0.25 and >= 14 data points
```

**Confidence mapping:**
- r < 0.3 → low ("There may be a connection...")
- 0.3 ≤ r < 0.6 → medium ("We've noticed a pattern...")
- r ≥ 0.6 → high ("There is a strong pattern...")

**Output example:**
> "You report 38% better mood on days following 8+ hours of sleep. (Based on 28 days of data)"

---

### 3. Supplement–Sleep Correlation

**Data required:** 21+ days with both medicationLogs and dailyCheckIn (sleep)

**Algorithm:**
```
1. For each supplement (e.g. magnesium):
2. Identify days the supplement was taken vs not taken
3. Compare mean sleep score on days after supplement was taken
   vs days after supplement was not taken
4. Paired t-test or Mann-Whitney U test for significance
5. Generate insight if mean difference >= 0.8 and n >= 14 per group
```

**Output example:**
> "On nights when you take magnesium, your sleep score averages 7.2/10. On nights without magnesium, it averages 5.8/10. (Based on 6 weeks of data)"

---

### 4. Cycle Phase–Pain Correlation

**Data required:** 2+ cycles with hypermobility logs

**Algorithm:**
```
1. Group hypermobility pain scores by cycle phase
2. Compute mean total pain score per phase across all logged days
3. Identify phase with highest mean pain score
4. Generate insight if difference between highest and lowest phase > 2 points
```

**Output example:**
> "Your joint pain scores are consistently highest during the luteal phase, averaging 6.4/10 compared to 3.1/10 during the follicular phase."

---

### 5. Exercise–Fatigue Relationship

**Data required:** 8+ physio sessions with recovery check-in + next-day dailyCheckIn

**Algorithm:**
```
1. For each physio session, record: overallDifficulty, overallFatigue
2. Fetch next-day energy score from dailyCheckIn
3. Correlate session difficulty with next-day energy
4. Segment: high-intensity sessions (difficulty >= 4) vs low-intensity (difficulty <= 2)
5. Compare next-day energy means
```

**Output example:**
> "After high-intensity sessions (difficulty 4–5), your energy the following day averages 4.1/10. After gentle sessions (difficulty 1–2), it averages 6.8/10."

---

### 6. Exercise–Pain Response

**Data required:** 8+ sessions with exercise-specific pain logs

**Algorithm:**
```
1. For each exercise type, collect: painBefore and painAfter scores
2. Compute mean (painAfter - painBefore) per exercise type
3. Exercises with mean improvement (painAfter < painBefore) are flagged as "well-tolerated"
4. Generate insight for top-performing exercise types
```

**Output example:**
> "Glute bridges are consistently followed by lower back pain scores — average reduction of 1.8 points. Well tolerated!"

---

### 7. Hydration–Headache Relationship

**Data required:** 14+ days with nutritionLog (waterIntake) and hypermobilityLog (headaches)

**Algorithm:**
```
1. Identify days with headaches (hypermobilityLog.headaches = true)
2. Compare mean water intake on headache days vs non-headache days
3. Generate insight if mean difference >= 400ml and n >= 7 headache days
```

---

## Cloud Function Implementation

```typescript
// firebase/functions/src/insights/generateInsights.ts

export async function generateInsightsForUser(userId: string): Promise<void> {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(userId);
  
  // Fetch last 90 days of data in parallel
  const [checkIns, pmddLogs, hypermobilityLogs, medLogs, physioSessions, cycles] = 
    await Promise.all([
      fetchCollection(userRef, 'dailyCheckIns', 90),
      fetchCollection(userRef, 'pmddLogs', 90),
      fetchCollection(userRef, 'hypermobilityLogs', 90),
      fetchCollection(userRef, 'medicationLogs', 90),
      fetchCollection(userRef, 'physioSessions', 90),
      fetchCollection(userRef, 'cycleEntries', 6), // Last 6 cycles
    ]);

  const generators = [
    detectPMDDPattern(cycles, pmddLogs),
    detectSleepMoodCorrelation(checkIns),
    detectSupplementSleepCorrelation(medLogs, checkIns),
    detectCyclePainCorrelation(cycles, hypermobilityLogs, checkIns),
    detectExerciseFatiguePattern(physioSessions, checkIns),
    detectExercisePainResponse(physioSessions),
    detectHydrationHeadachePattern(nutritionLogs, hypermobilityLogs),
  ];

  const insights = (await Promise.all(generators)).filter(Boolean);
  
  // Write new insights (avoid duplicates by type within 7 days)
  for (const insight of insights) {
    const existing = await getRecentInsightByType(userRef, insight.type, 7);
    if (!existing) {
      await userRef.collection('insights').add({
        ...insight,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        acknowledged: false,
      });
    }
  }
}
```

---

## Data Minimum Requirements

| Insight Type | Minimum Data |
|---|---|
| PMDD Pattern | 3 cycles + PMDD logs during each cycle |
| Sleep–Mood | 14 days of both check-ins |
| Supplement–Sleep | 21 days + 14 days each taken/not taken |
| Cycle–Pain | 2 cycles + hypermobility logs |
| Exercise–Fatigue | 8 physio sessions with next-day check-in |
| Exercise–Pain | 8 physio sessions |
| Hydration–Headache | 14 days + 7 headache days |

---

## Insight Language Guidelines

- Always use hedged language: "appears to", "tends to", "may be associated with"
- Always include data basis: "based on X days of data"
- Never say "causes" — always say "is associated with" or "correlates with"
- Never prescribe action: "consider..." not "you should..."
- Keep insights under 3 sentences
- Include confidence label (low/medium/high) visibly in the UI
