# CherylCare — Notification Strategy

## Notification Types

| ID | Name | When | Channel |
|----|------|------|---------|
| `daily_checkin` | Daily check-in reminder | User-set time (default 8am) | Push |
| `supplement_reminder` | Medication reminder | Per-medication time | Push |
| `pmdd_warning` | PMDD window approaching | 3 days before predicted window | Push |
| `period_warning` | Period approaching | 2 days before predicted start | Push |
| `period_started` | Period started encouragement | Day 1 of period | Push |
| `insight_ready` | New insight available | After nightly insight run | Push |
| `cycle_phase_change` | Phase changed | On phase transition | Push (optional) |
| `physio_reminder` | Physio session due | Day of planned session, 6pm | Push |
| `streak_milestone` | Check-in streak achieved | Day 7, 14, 30, 60, 90 | In-app + Push |

---

## Implementation

### Scheduling (Expo Notifications)

```typescript
// Local notifications (scheduled on device)
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Daily Check-In',
    body: `Good morning, ${name}. How are you feeling today?`,
    data: { screen: 'CheckIn' },
  },
  trigger: {
    hour: parseInt(reminderTime.split(':')[0]),
    minute: parseInt(reminderTime.split(':')[1]),
    repeats: true,
  },
});
```

### Server-Side (Cloud Functions → Expo Push API)

```typescript
// For PMDD alerts and insights — computed server-side
await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: user.expoPushToken,
    title: 'Heads up',
    body: `Your PMDD window is likely to begin in ${daysUntilWindow} days.`,
    data: { screen: 'PMDD', type: 'pmdd_warning' },
    sound: 'default',
  }),
});
```

---

## User Preferences

Users can configure in Settings:
- Enable/disable each notification type individually
- Set daily check-in reminder time
- Set medication reminder times per medication
- Enable/disable physio session reminders
- Enable/disable phase change notifications
- PMDD warning lead time (1–5 days)

---

## Notification Tone Guidelines

- **Warm, not clinical**: "Heads up" not "Alert"
- **Encouraging, not alarming**: "Your PMDD window is approaching" not "Warning: high-risk period"
- **Brief**: Notification body under 80 characters where possible
- **Actionable**: Deep-link to relevant screen via `data.screen`
- **Respectful**: Never send more than 3 push notifications per day

---

## Deep Linking

All notifications include a `screen` key in the data payload:

```typescript
const screens: Record<string, string> = {
  CheckIn: '/(tabs)/check-in',
  Cycle: '/(tabs)/cycle',
  Insights: '/(tabs)/insights',
  PMDD: '/more/pmdd',
  Physio: '/more/physio',
  Medications: '/more/medications',
};
```

The notification handler navigates to the screen when the notification is tapped.
