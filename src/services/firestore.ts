import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  DailyCheckIn,
  CycleEntry,
  PMDDLog,
  HypermobilityLog,
  MedicationEntry,
  MedicationLog,
  NutritionLog,
  PhysioSession,
  PhysioPlan,
  Insight,
  UserProfile,
  UserSettings,
} from '../types';
import { format } from 'date-fns';

const col = (uid: string, name: string) => collection(db, 'users', uid, name);

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'profile', 'data'));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'profile', 'data'), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getSettings(uid: string): Promise<UserSettings | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'settings', 'data'));
  return snap.exists() ? (snap.data() as UserSettings) : null;
}

export async function saveSettings(uid: string, settings: Partial<UserSettings>): Promise<void> {
  await setDoc(
    doc(db, 'users', uid, 'settings', 'data'),
    { ...settings, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function saveDailyCheckIn(uid: string, checkIn: Omit<DailyCheckIn, 'completedAt' | 'updatedAt'>): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'dailyCheckIns', checkIn.date), {
    ...checkIn,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getDailyCheckIn(uid: string, date: string): Promise<DailyCheckIn | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'dailyCheckIns', date));
  return snap.exists() ? (snap.data() as DailyCheckIn) : null;
}

export async function getRecentCheckIns(uid: string, days: number = 30): Promise<DailyCheckIn[]> {
  const q = query(col(uid, 'dailyCheckIns'), orderBy('date', 'desc'), limit(days));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as DailyCheckIn);
}

export function subscribeToTodayCheckIn(uid: string, callback: (checkIn: DailyCheckIn | null) => void): Unsubscribe {
  const today = format(new Date(), 'yyyy-MM-dd');
  return onSnapshot(doc(db, 'users', uid, 'dailyCheckIns', today), snap => {
    callback(snap.exists() ? (snap.data() as DailyCheckIn) : null);
  });
}

export async function saveCycleEntry(uid: string, entry: Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(col(uid, 'cycleEntries'), {
    ...entry,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCycleEntries(uid: string, limitCount: number = 6): Promise<CycleEntry[]> {
  const q = query(col(uid, 'cycleEntries'), orderBy('startDate', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as CycleEntry);
}

export async function savePMDDLog(uid: string, log: Omit<PMDDLog, 'createdAt'>): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'pmddLogs', log.date), {
    ...log,
    createdAt: serverTimestamp(),
  });
}

export async function getRecentPMDDLogs(uid: string, days: number = 90): Promise<PMDDLog[]> {
  const q = query(col(uid, 'pmddLogs'), orderBy('date', 'desc'), limit(days));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as PMDDLog);
}

export async function saveHypermobilityLog(uid: string, log: Omit<HypermobilityLog, 'createdAt'>): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'hypermobilityLogs', log.date), {
    ...log,
    createdAt: serverTimestamp(),
  });
}

export async function saveMedicationEntry(uid: string, med: Omit<MedicationEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(col(uid, 'medicationEntries'), {
    ...med,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getMedications(uid: string): Promise<MedicationEntry[]> {
  const q = query(col(uid, 'medicationEntries'), where('active', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as MedicationEntry);
}

export async function saveMedicationLog(uid: string, log: MedicationLog): Promise<void> {
  const docId = `${log.date}_${log.medicationId}`;
  await setDoc(doc(db, 'users', uid, 'medicationLogs', docId), log, { merge: true });
}

export async function getTodayMedicationLogs(uid: string, date: string): Promise<MedicationLog[]> {
  const q = query(col(uid, 'medicationLogs'), where('date', '==', date));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as MedicationLog);
}

export async function savePhysioSession(uid: string, session: Omit<PhysioSession, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(col(uid, 'physioSessions'), {
    ...session,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getPhysioSessions(uid: string, limitCount: number = 20): Promise<PhysioSession[]> {
  const q = query(col(uid, 'physioSessions'), orderBy('date', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as PhysioSession);
}

export async function getActivePlan(uid: string): Promise<PhysioPlan | null> {
  const q = query(col(uid, 'physioPlans'), where('active', '==', true), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as PhysioPlan;
}

export async function getInsights(uid: string): Promise<Insight[]> {
  const q = query(col(uid, 'insights'), orderBy('generatedAt', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Insight);
}

export async function acknowledgeInsight(uid: string, insightId: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'insights', insightId), {
    acknowledged: true,
    acknowledgedAt: serverTimestamp(),
  });
}
