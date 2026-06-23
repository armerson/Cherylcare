import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function registerForPushNotifications(uid: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'CherylCare',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C4849B',
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  await updateDoc(doc(db, 'users', uid, 'profile', 'data'), {
    expoPushToken: token,
    updatedAt: serverTimestamp(),
  });

  return token;
}

export async function scheduleDailyCheckInReminder(hour: number, minute: number): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Check-In',
      body: 'How are you feeling today? Take 2 minutes to check in.',
      data: { screen: 'CheckIn' },
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    } as Notifications.DailyTriggerInput,
  });
}

export async function scheduleMedicationReminder(
  medicationId: string,
  medicationName: string,
  hour: number,
  minute: number,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Medication Reminder',
      body: `Time to take your ${medicationName}`,
      data: { screen: 'Medications', medicationId },
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    } as Notifications.DailyTriggerInput,
  });
  return id;
}

export async function cancelMedicationReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
