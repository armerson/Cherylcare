import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  User,
  NextOrObserver,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserProfile } from '../types';

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const profile: Omit<UserProfile, 'createdAt' | 'updatedAt'> & { createdAt: unknown; updatedAt: unknown } = {
    userId: credential.user.uid,
    displayName,
    name: displayName,
    email,
    diagnosedConditions: [],
    onboardingCompleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', credential.user.uid, 'profile', 'data'), profile);

  const defaultSettings = {
    christianModeEnabled: false,
    notificationsEnabled: true,
    checkInReminderEnabled: true,
    checkInReminderHour: 8,
    checkInReminderMinute: 0,
    cycleAlertsEnabled: true,
    cycleAlertDaysAhead: 3,
    medicationRemindersEnabled: true,
    averageCycleLength: 28,
    averagePeriodLength: 5,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    units: 'metric' as const,
    insightsEnabled: true,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', credential.user.uid, 'settings', 'data'), defaultSettings);

  return credential.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthStateChanged(observer: NextOrObserver<User | null>) {
  return firebaseOnAuthStateChanged(auth, observer);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
