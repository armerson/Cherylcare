# CherylCare — MVP Roadmap

## MVP Definition

The MVP delivers the core tracking and pattern loop: daily check-in → cycle tracking → supplement logging → basic insights. This is enough to be genuinely useful in 6–8 weeks of development.

---

## Sprint Plan

### Sprint 1 (Week 1–2): Foundation
**Goal:** Working app shell with auth and navigation

- [ ] Expo project setup (TypeScript, ESLint, Prettier)
- [ ] Firebase project configured (Auth + Firestore + Functions)
- [ ] React Navigation structure (Auth stack + Tab navigator)
- [ ] Zustand store skeleton
- [ ] Firebase Auth (email/password sign-up + sign-in)
- [ ] Onboarding flow (5 screens)
- [ ] User profile creation in Firestore
- [ ] Firestore security rules
- [ ] Design system: colours, typography, spacing constants
- [ ] Reusable components: Button, Card, ScaleSlider

**Deliverable:** Users can sign up, onboard, and see an empty dashboard.

---

### Sprint 2 (Week 3–4): Core Tracking
**Goal:** All primary logging features working

- [ ] Daily Check-In screen (mood, energy, pain, sleep, stress, notes)
- [ ] Check-in streak counter
- [ ] Cycle tracking screen
  - [ ] Calendar view with phase colours
  - [ ] Log period start/end
  - [ ] Bleeding intensity + symptom log
- [ ] Cycle phase + day calculation logic
- [ ] Medication/supplement screen
  - [ ] Add/edit/delete medications
  - [ ] Daily tick-off interface
  - [ ] Adherence percentage
- [ ] Offline support (Firestore persistence)

**Deliverable:** Users can do a complete daily check-in, log cycles, and tick off supplements.

---

### Sprint 3 (Week 5–6): Dashboard + PMDD
**Goal:** Meaningful dashboard, PMDD tracking

- [ ] Dashboard
  - [ ] Cycle phase card with countdown
  - [ ] Today's mood + energy summary
  - [ ] Supplement adherence ring
  - [ ] Daily encouragement card
  - [ ] PMDD alert banner (if window approaching)
- [ ] PMDD tracking screen (all 9 symptoms)
- [ ] PMDD symptom history charts (Victory Native)
- [ ] Push notifications
  - [ ] Daily check-in reminder
  - [ ] Supplement reminders
  - [ ] Period prediction alert
- [ ] Christian mode (verse + prayer cards)

**Deliverable:** App feels alive and personal. Notifications working.

---

### Sprint 4 (Week 7–8): Insights + Physio
**Goal:** Insight engine + physio tracker

- [ ] Cloud Functions setup
  - [ ] `generateInsights` function (sleep-mood, supplement-sleep)
  - [ ] `detectPMDDWindow` function
  - [ ] `sendCycleAlert` function
- [ ] Insights screen
  - [ ] Insight cards with confidence display
  - [ ] Acknowledge / dismiss
- [ ] Hypermobility logging screen
  - [ ] Body map (SVG)
  - [ ] Pain + instability log
- [ ] Physio tracker MVP
  - [ ] Create weekly plan
  - [ ] Log a session (exercises, pain, fatigue)
  - [ ] Recovery check-in
  - [ ] Session history

**Deliverable:** Full feature-complete MVP. Ready for beta testing.

---

### Sprint 5 (Week 9–10): Polish + Beta
**Goal:** Bug fixes, performance, beta user testing

- [ ] Performance audit (dashboard < 2s load)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Error handling and loading states on all screens
- [ ] Empty states (illustrated, friendly)
- [ ] App Store / Play Store assets
- [ ] Privacy policy + terms of service
- [ ] TestFlight + Firebase App Distribution beta
- [ ] User interviews (5 beta users)
- [ ] Bug fixes from beta feedback

**Deliverable:** App ready for App Store submission.

---

## MVP Feature Checklist

| Feature | MVP | Post-MVP |
|---------|-----|----------|
| Daily Check-In | ✅ | |
| Cycle tracking | ✅ | |
| PMDD symptom log | ✅ | |
| Medications/supplements | ✅ | |
| Dashboard | ✅ | |
| Encouragement engine | ✅ | |
| Christian mode | ✅ | |
| Push notifications | ✅ | |
| Hypermobility tracking | ✅ | |
| Physio tracker | ✅ | |
| AI Insights engine | ✅ | |
| Nutrition/lifestyle log | | ✅ |
| Health data export/PDF | | ✅ |
| Wearable integration | | ✅ |
| Healthcare provider sharing | | ✅ |
| Web app | | ✅ |
| Apple Health / Google Fit | | ✅ |
