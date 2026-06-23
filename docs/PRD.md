# CherylCare — Product Requirements Document

## 1. Executive Summary

CherylCare is a compassionate, mobile-first health and wellbeing companion for women managing hypermobility spectrum disorders (hEDS/HSD), Premenstrual Dysphoric Disorder (PMDD), menstrual cycle symptoms, chronic fatigue, and joint pain.

The app helps users understand their bodies, identify symptom patterns, improve self-care, and feel genuinely supported — not just clinically monitored.

---

## 2. Product Vision

> "To help women with complex, intersecting chronic conditions understand their bodies, identify patterns they might never notice alone, and feel genuinely cared for throughout every phase of their cycle."

---

## 3. Target Users

### Primary Persona: Cheryl
- **Age**: 25–50
- **Conditions**: hEDS/HSD, PMDD, chronic fatigue, anxiety
- **Goals**: Understand her body, reduce uncertainty, communicate better with her healthcare team, feel encouraged on hard days
- **Pain points**: Feels dismissed by healthcare providers, struggles to identify patterns, overwhelmed by complex apps, wants something warm not clinical
- **Tech comfort**: Moderate — uses a smartphone daily, prefers simple UX
- **Faith**: May practice Christian faith and appreciate faith-based content

### Secondary Persona: Healthcare Team
- Physiotherapist, GP, gynaecologist
- Needs data exports and trend reports to inform treatment decisions

---

## 4. Core Design Principles

| Principle | Description |
|-----------|-------------|
| Warmth | Feels like a caring companion, not a medical device |
| Evidence-informed | Grounded in research; never prescribes treatment |
| Simplicity | Daily check-in completable in under 2 minutes |
| Pattern insight | Surfaces connections the user cannot easily see alone |
| Privacy-first | Data encrypted; never shared or sold |
| Optional faith | Christian content is opt-in, never imposed |
| Offline-capable | Core features work without internet connection |

---

## 5. Feature Specifications

### F1: Menstrual Cycle Tracking

**User stories:**
- As a user, I can log when my period starts and ends
- As a user, I can track bleeding intensity (spotting / light / medium / heavy)
- As a user, I can see which day of my cycle I am on
- As a user, I can see which phase I am in (menstrual / follicular / ovulatory / luteal)
- As a user, I can see a prediction of my next period
- As a user, I can read educational content about each cycle phase
- As a user, I can track physical symptoms (cramps, bloating, headaches, breast tenderness)

**Acceptance criteria:**
- Cycle day = (today − period start date) + 1
- Phase based on average cycle length (default 28 days, configurable)
  - Menstrual: days 1–5 | Follicular: days 6–13 | Ovulatory: days 13–16 | Luteal: days 17–end
- Prediction improves after 3+ logged cycles
- Calendar view with colour-coded phases and period days
- Educational phase cards with evidence-based information

---

### F2: PMDD Tracking

**Symptoms tracked (1–10 scale):**
Anxiety, Depression/low mood, Irritability, Anger/rage, Brain fog, Overwhelm, Motivation (inverted), Energy, Sleep quality

**PMDD window detection:**
- Combined emotional symptom score > threshold in late luteal phase
- Confirmed across 3+ cycles
- Highlighted on cycle calendar with colour and alert badge

**Example insight:** "Over the last 3 cycles, your anxiety tends to increase between cycle days 21–27."

---

### F3: Hypermobility Tracking

**Tracked items:**
- Joint pain via interactive body map (front + back SVG)
- Instability events and subluxation/dislocation log
- Fatigue (1–10), dizziness (1–10), headaches (Y/N), digestive symptoms (Y/N)
- Exercise tolerance (1–10), recovery score (1–10)

**Trend example:** "Joint pain appears to increase during the late luteal phase."

---

### F4: Medication and Supplement Tracking

**Medications:** SSRIs, pain relief, hormonal, other prescribed

**Supplements:** Magnesium, Vitamin D3, Omega-3, B6, Calcium, Iron, B12, custom

**Features:**
- Daily tick-off interface
- Dosage and timing tracking
- Push notification reminders
- Adherence statistics (weekly/monthly %)

---

### F5: Nutrition and Lifestyle Tracking

**Tracked:** Water (ml), Protein (g), Caffeine (mg), Alcohol (units), Exercise (mins/type/intensity), Sleep duration (hrs), Sleep quality (1–10), Stress (1–10)

**Example insight:** "Your fatigue scores tend to be lower when sleep exceeds 8 hours."

---

### F6: Daily Check-In

**Form fields:**
- Mood: 5 emoji options (very low / low / neutral / good / excellent)
- Energy: 1–10 slider
- Pain: 1–10 slider
- Sleep: 1–10 slider
- Stress: 1–10 slider
- Notes: optional free text

**UX requirements:**
- Completable in under 2 minutes
- Auto-saves on exit
- Editable up to 24 hours later
- Streak counter to encourage consistency

---

### F7: AI Pattern Recognition

| Insight Category | Example |
|-----------------|---------|
| PMDD pattern | "Over 3 cycles, anxiety peaks on cycle days 22–26" |
| Sleep–mood | "You report 40% better mood when sleep exceeds 7 hours" |
| Supplement–sleep | "Magnesium appears associated with improved sleep quality" |
| Exercise–fatigue | "High-intensity sessions correlate with increased fatigue the next day" |
| Cycle–pain | "Joint pain is consistently highest during the late luteal phase" |

**Technical:**
- Cloud Function runs nightly per user
- Minimum 14 days of data before first insight
- Statistical correlation (Pearson r, rolling averages)
- Confidence: low (r < 0.3), medium (0.3–0.6), high (> 0.6)

---

### F8: Positive Encouragement Engine

**Contextual triggers and examples:**

| Context | Example message |
|---------|----------------|
| PMDD window | "These feelings are real, but they are not permanent. You have survived every difficult cycle before." |
| Pain flare | "Your body is working hard today. Treat yourself with the kindness you deserve." |
| Fatigue | "Rest is productive when your body needs it. You are not falling behind." |
| Good day | "Celebrate today's energy and momentum. You're doing beautifully." |
| Streak | "7 days of check-ins! Every data point is a gift to your future self." |

---

### F9: Christian Mode (Optional)

When enabled:
- Daily Bible verse (morning)
- Short contextual prayer (evening or on request)
- Faith-based encouragement messages
- Gratitude prompts
- Scripture relevant to context (pain, anxiety, strength, rest)

**Example verses:**
- "The Lord is close to the brokenhearted." (Psalm 34:18)
- "My grace is sufficient for you." (2 Corinthians 12:9)
- "He gives strength to the weary." (Isaiah 40:29)

All content hand-curated, not AI-generated. ~200 verses and prayers in initial library.

---

### F10: Cycle Preparation Alerts

**Alert types:**
- 3 days before PMDD window: "Your PMDD window is likely to begin in 3 days."
- 2 days before period: "Your period is predicted to start in 2 days. Consider gentle preparation."
- During late luteal: "Based on your history, this is a high-risk period for anxiety."
- Post-period day 2: "Energy typically begins to return in the coming days."

---

### F11: Physio and Strength Training Tracker

**Exercise log fields:** Name, category, body area, sets, reps, hold time, resistance, difficulty (1–5), pain before/during/after (1–10), fatigue after, notes

**Exercise categories:** Core stability, Glute strength, Hip stability, Knee stability, Shoulder stability, Ankle stability, Balance/proprioception, Gentle mobility, Breathing/relaxation, Recovery/stretching

**Safety reminders shown before each session:**
- Avoid pushing into pain
- Avoid end-range stretching unless prescribed
- Prioritise control over intensity
- Stop if symptoms significantly worsen
- Follow advice from your physiotherapist

**Post-session recovery check-in:**
Did this feel safe? | Pain increased? | Fatigue increased? | Feel more stable? | Any joint slipping?

**Encouragement examples:**
- "Strength is built gently, one safe rep at a time."
- "Stopping before a flare is wisdom, not failure."
- "Consistency matters more than intensity."

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Performance | Dashboard loads in < 2 seconds |
| Offline | Core check-in and logging works offline |
| Security | TLS in transit, encrypted at rest |
| Privacy | GDPR compliant; full data deletion available |
| Accessibility | WCAG 2.1 AA |
| Platforms | iOS 15+ and Android 10+ |
| Backup | Daily automated Firestore backups |

---

## 7. Out of Scope (MVP)

- Medical advice or diagnosis
- Wearable integration (Fitbit, Apple Watch)
- Healthcare provider data sharing
- Multi-user / caregiver accounts
- Web app version
- Apple Health / Google Fit integration

---

## 8. Success Metrics (6 months post-launch)

| Metric | Target |
|--------|--------|
| Daily Active Users | 60% of registered users |
| Daily Check-In Completion | > 70% on days app is opened |
| 30-day Retention | > 50% |
| Insight Engagement | > 60% of insights read |
| NPS Score | > 60 |
