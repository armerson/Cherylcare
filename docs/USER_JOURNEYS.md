# CherylCare — User Journeys

## Journey 1: First-Time User Onboarding

```
User opens app for the first time
    │
    ▼
Splash screen → Welcome screen
    │
    ▼
Sign up (email/password or Google)
    │
    ▼
Onboarding Step 1: "Tell us about you"
  - Name
  - Conditions (checkboxes): hEDS/HSD, PMDD, Chronic fatigue, Anxiety, Other
    │
    ▼
Onboarding Step 2: "Your cycle"
  - When did your last period start? (date picker)
  - How long is your typical cycle? (slider, default 28)
  - How long does your period last? (slider, default 5)
    │
    ▼
Onboarding Step 3: "Your medications"
  - Add medications/supplements (optional, can skip)
    │
    ▼
Onboarding Step 4: "Stay on track"
  - Daily check-in reminder time (time picker)
  - Enable push notifications? (Y/N)
    │
    ▼
Onboarding Step 5: "A personal touch" (optional)
  - Enable Christian mode? (toggle with explanation)
    │
    ▼
Dashboard — "Welcome to CherylCare, [Name]!"
  - Daily encouragement shown
  - Prompt to complete first check-in
```

---

## Journey 2: Daily Check-In (returning user, 2 minutes)

```
Push notification: "Good morning [Name]. How are you feeling today?"
    │
    ▼
User taps notification → opens Daily Check-In screen
    │
    ▼
Step 1: Mood
  [😔] [😟] [😐] [🙂] [😊]
  "How are you feeling today?"
    │
    ▼
Step 2: Energy, Pain, Sleep, Stress
  Four horizontal sliders (1–10 each)
  Labels: "Today's energy" / "Pain level" / "Last night's sleep" / "Stress level"
    │
    ▼
Step 3: Notes (optional)
  Text area: "Anything else to note?"
    │
    ▼
Save → Confetti/celebration animation
  "Check-in complete! Day 7 streak 🔥"
    │
    ▼
Return to Dashboard — stats updated
  Daily encouragement personalised to today's scores
```

---

## Journey 3: Logging a Period Start

```
User opens Cycle Tracking screen
    │
    ▼
Calendar view shows current month
  Phase colours visible on each day
    │
    ▼
User taps "Log Period Start" button
    │
    ▼
Date confirmation screen
  - Date: today (or select another)
  - Bleeding intensity: [Spotting] [Light] [Medium] [Heavy]
  - Symptoms: chip selector (cramps, bloating, headaches, back pain, breast tenderness)
  - Notes: optional
    │
    ▼
Save → Calendar updates
  - Period days highlighted in rose colour
  - Cycle day counter resets to Day 1
  - Next period prediction recalculated
    │
    ▼
Dashboard updates:
  - Phase card shows "Menstrual Phase - Day 1"
  - Encouragement updates: "Your period has started. Be gentle with yourself today."
```

---

## Journey 4: Receiving an Insight

```
Cloud Function runs nightly at 2:00am
    │
    ▼
Analyses 30 days of dailyCheckIns + pmddLogs + cycleEntries
    │
    ▼
Detects: "Anxiety consistently higher on cycle days 22–27 (3 cycles)"
  Confidence: high (r = 0.74)
    │
    ▼
Insight document written to Firestore
    │
    ▼
Push notification next morning:
  "New insight: We've noticed a pattern in your anxiety across cycles."
    │
    ▼
User taps → Insights screen
    │
    ▼
Insight card displayed:
  Title: "PMDD Window Pattern Identified"
  "Over the last 3 cycles, your anxiety tends to increase between cycle days 22–27.
   This coincides with the late luteal phase. Consider planning lighter commitments
   during this window."
  [Acknowledge] [Learn More]
    │
    ▼
User taps "Acknowledge" → insight marked as read
Insights screen shows remaining unread insights
```

---

## Journey 5: Logging a Physio Session

```
User opens Physio screen
    │
    ▼
Weekly plan view — today's session highlighted
  "Wednesday: Balance & Hips (3 exercises)"
    │
    ▼
User taps "Start Session"
    │
    ▼
Safety reminder shown:
  "Remember: avoid pushing into pain. Control is more important than intensity."
  [Got it, let's go]
    │
    ▼
Exercise 1: Single-leg balance
  Sets: 3 | Reps: 10 | Target: 30s hold
  Pain before: [slider 0]
  Pain during: [slider] — user sets to 2
  Pain after: [slider] — user sets to 1
  Fatigue after: [slider] — user sets to 3
  [Mark complete]
    │
    ▼
Exercise 2, 3... (repeat)
    │
    ▼
Session complete → Recovery check-in
  "How did that feel?"
  ✓ This felt safe
  ✗ My pain increased
  ✓ I feel more stable
  ✗ Any joint slipping?
  [Submit]
    │
    ▼
Encouragement: "Great session. Consistency is everything — well done."
Session saved to Firestore
```

---

## Journey 6: Christian Mode Morning

```
Christian mode enabled in Settings
    │
    ▼
8:00am push notification:
  "Good morning, Cheryl. ✝️
   'He gives strength to the weary and increases the power of the weak.' — Isaiah 40:29"
    │
    ▼
User opens app → Dashboard
    │
    ▼
Verse card at top of dashboard:
  "Today's encouragement"
  Full verse + reference
  Short gratitude prompt: "What is one small thing you are grateful for today?"
    │
    ▼
User completes daily check-in
    │
    ▼
If PMDD window active:
  Faith encouragement shown:
  "'For I know the plans I have for you,' declares the Lord, 'plans to prosper you
   and not to harm you, plans to give you hope and a future.' — Jeremiah 29:11
   
   This season will pass. You are held."
```

---

## Journey 7: PMDD Window Alert

```
Cloud Function detects: next predicted PMDD window starts in 3 days
    │
    ▼
Push notification sent:
  "Heads up — your PMDD window is likely to begin in 3 days.
   Based on your history, anxiety tends to increase around this time."
    │
    ▼
User opens app → Dashboard shows PMDD Alert banner:
  🔔 "PMDD window approaching in 3 days"
  [Prepare] → opens PMDD info screen
    │
    ▼
PMDD Info screen shows:
  - Your typical window: cycle days 22–27
  - Historical anxiety range during this window: 6–9/10
  - Suggestions: prioritise sleep, reduce commitments, inform trusted people
  - "Remember: symptoms always improve once your period begins."
    │
    ▼
Day 22 arrives → PMDD window active
Dashboard shows active alert:
  "You're in your PMDD window. These feelings are real, but they are not permanent."
```

---

## Journey 8: Generating a Health Export Report

```
User opens Settings
    │
    ▼
Taps "Export my data"
    │
    ▼
Select date range (last 3 months default)
  Format: PDF summary / JSON full data
    │
    ▼
Cloud Function generates report:
  - Cycle chart
  - Mood trend chart
  - PMDD symptom pattern chart
  - Supplement adherence table
  - Physio session log
    │
    ▼
Download link sent to registered email
User shares PDF with GP or physiotherapist at next appointment
```
