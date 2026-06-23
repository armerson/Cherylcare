# CherylCare — Screen Wireframes

All wireframes are mobile-first (375px width reference). Dimensions in descriptive units.

---

## Screen 1: Dashboard

```
┌────────────────────────────────────────┐
│  CherylCare        Mon 23 Jun    │
│  Good morning, Cheryl ✨          │
├────────────────────────────────────────┤
│                                   │
│  ┌─────────────────────────────────┐ │
│  │  🌙 LUTEAL PHASE • Day 22    │ │
│  │  Next period in ~6 days       │ │
│  │  ███████░░░░░░░  78% through │ │
│  └─────────────────────────────────┘ │
│                                   │
│  ⚠️  PMDD window in 3 days        │
│  "Consider planning lighter        │
│   commitments this week."          │
│                              [>]  │
│                                   │
│  ┌───────────────┐  ┌───────────────┐ │
│  │ TODAY'S MOOD  │  │  ENERGY     │ │
│  │     🙂        │  │     7/10    │ │
│  │    Good       │  │  ███████░░░ │ │
│  └───────────────┘  └───────────────┘ │
│                                   │
│  Supplements today                 │
│  ███████░░░  3/4 taken          │
│  ✅ Magnesium  ✅ Vit D  ✅ Omega-3  │
│  ❏ Iron  [+ Log]                  │
│                                   │
│  Today's encouragement             │
│  ┌─────────────────────────────────┐ │
│  │ "Your consistency this week    │ │
│  │  is something to be proud of.  │ │
│  │  Every check-in matters."      │ │
│  └─────────────────────────────────┘ │
│                                   │
│  [ Check In ] [ Cycle ] [ More ⋯ ] │
└────────────────────────────────────────┘
      Bottom tab bar (5 icons)
```

**Colours:** Phase card background = warm lavender (#E8DFF5). PMDD alert = rose (#FDEEF3). Encouragement card = sage (#EDF7F1).

---

## Screen 2: Daily Check-In

```
┌────────────────────────────────────────┐
│  ←  Daily Check-In       Cycle Day 22 │
├────────────────────────────────────────┤
│                                       │
│  How are you feeling today?           │
│                                       │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐ │
│  │😔│  │😟│  │😐│  │🙂│  │😊│ │
│  └────┘  └────┘  └────┘  └────┘  └────┘ │
│  Very    Low    Neutral   Good  Excel  │
│  Low                                  │
│                                       │
│  ────────────────────────────────────── │
│  Energy today                         │
│  1  ----●---------  10   [7]           │
│                                       │
│  Pain level                           │
│  1  --●-----------  10   [3]           │
│                                       │
│  Last night's sleep                   │
│  1  ----------●---  10   [8]           │
│                                       │
│  Stress level                         │
│  1  -----●--------  10   [5]           │
│                                       │
│  ────────────────────────────────────── │
│  Anything to note? (optional)         │
│  ┌────────────────────────────────────┐ │
│  │                                  │ │
│  │  "Feeling a bit foggy today..." │ │
│  │                                  │ │
│  └────────────────────────────────────┘ │
│                                       │
│  ████████████  Save Today's Check-In  │
└────────────────────────────────────────┘
```

---

## Screen 3: Cycle Tracking

```
┌────────────────────────────────────────┐
│  Cycle Tracking          [+ Log Period] │
├────────────────────────────────────────┤
│                                         │
│  ◄ June 2026                          ►  │
│                                         │
│  Mo  Tu  We  Th  Fr  Sa  Su             │
│   1   2   3   4   5   6   7             │
│  [M] [M] [M] [M] [M] [F] [F]            │
│   8   9  10  11  12  13  14             │
│  [F] [F] [F] [F] [F] [O] [O]            │
│  15  16  17  18  19  20  21             │
│  [L] [L] [L] [L] [L] [L] [L]            │
│  22  23  24  25  26  27  28             │
│  [L*][T] [L] [L] [L]  ~   ~             │
│                                         │
│  Legend: [M]=Menstrual [F]=Follicular    │
│  [O]=Ovulatory [L]=Luteal [*]=Today ~=Predicted│
│                                         │
│  Current Phase                          │
│  ┌────────────────────────────────────┐ │
│  │ 🌙 Luteal Phase                     │ │
│  │ Day 22 of 28 • 6 days until period │ │
│  │ "Progesterone peaks then falls...  │ │
│  │  Energy may dip. Rest is wise."    │ │
│  │ [Learn more about Luteal phase]    │ │
│  └────────────────────────────────────┘ │
│                                         │
│  Cycle History (last 3 cycles)          │
│  Cycle 1: 28 days | Cycle 2: 27 days    │
│  Cycle 3: 29 days | Avg: 28 days        │
└────────────────────────────────────────┘
```

---

## Screen 4: PMDD Tracking

```
┌────────────────────────────────────────┐
│  ←  PMDD Tracking           [Log Today] │
├────────────────────────────────────────┤
│                                         │
│  Emotional Symptom Log                  │
│  ────────────────────────────────────── │
│  Anxiety           1 ----●--------- 10 │
│  Depression        1 --●----------- 10 │
│  Irritability      1 -------●------ 10 │
│  Anger             1 ----●--------- 10 │
│  Brain fog         1 -------●------ 10 │
│  Overwhelm         1 ------●------- 10 │
│  Motivation        1 ----------●--- 10 │
│  Energy            1 -----●-------- 10 │
│  Sleep quality     1 ----------●--- 10 │
│                                         │
│  [Save Today's PMDD Log]                │
│                                         │
│  ────────────────────────────────────── │
│  Patterns (last 3 cycles)               │
│  Anxiety vs Cycle Day                   │
│  10|                 ***               │
│   8|               *   *               │
│   6|          *****     ****           │
│   4|    ***** _period_                 │
│   2|____|                              │
│      1   7   14   21   28              │
│                                         │
│  ⚠️ PMDD window identified: days 22–27   │
└────────────────────────────────────────┘
```

---

## Screen 5: Physio Tracker

```
┌────────────────────────────────────────┐
│  ←  Physio & Strength              │
├────────────────────────────────────────┤
│  [This Week] [My Plan] [Progress]  │
│                                    │
│  This Week (W/C 23 Jun)            │
│  ────────────────────────────────── │
│  Mon  Core & Glutes        ✅ Done  │
│  Wed  Balance & Hips   ▶ Start now │
│  Fri  Shoulders (gentle)  ● Upcoming│
│                                    │
│  Wednesday: Balance & Hips         │
│  ────────────────────────────────── │
│  1. Single-leg balance     3x30s   │
│  2. Hip hinge              3x10    │
│  3. Clamshells             3x15    │
│                                    │
│  ████████  Start Session         │
│                                    │
│  This week: 1/3 sessions done      │
│  Streak: 4 consecutive weeks 🔥    │
└────────────────────────────────────────┘
```

---

## Screen 6: Insights

```
┌────────────────────────────────────────┐
│  Insights                  3 New     │
├────────────────────────────────────────┤
│                                       │
│  ┌────────────────────────────────────┐ │
│  │ 📊 NEW                             │ │
│  │ PMDD Window Pattern              │ │
│  │ High confidence • 3 cycles        │ │
│  │                                  │ │
│  │ "Your anxiety consistently        │ │
│  │  increases between cycle days     │ │
│  │  22–27 across your last 3 cycles. │ │
│  │  This is your PMDD window."       │ │
│  │                                  │ │
│  │ [Acknowledge]  [Learn more]       │ │
│  └────────────────────────────────────┘ │
│                                       │
│  ┌────────────────────────────────────┐ │
│  │ 📊 NEW                             │ │
│  │ Sleep & Mood Connection          │ │
│  │ Medium confidence • 21 days       │ │
│  │                                  │ │
│  │ "You report 38% better mood on   │ │
│  │  days following 8+ hours sleep." │ │
│  │                                  │ │
│  │ [Acknowledge]  [View chart]      │ │
│  └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

## Navigation Structure

```
Bottom Tab Bar (5 tabs):
  🏠 Home (Dashboard)
  ✔️  Check In
  🔴 Cycle
  📊 Insights
  ⋯  More

More menu contains:
  - PMDD Tracking
  - Hypermobility
  - Medications
  - Physio
  - Nutrition & Lifestyle
  - Settings
```
