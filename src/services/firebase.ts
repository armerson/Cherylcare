import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize Firebase on the client — prevents Next.js prerender from
// crashing with auth/invalid-api-key when env vars aren't available server-side.
function initFirebase() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return { app, auth: getAuth(app), db: getFirestore(app) };
}

const firebase = typeof window !== 'undefined' ? initFirebase() : null;

export const app = firebase?.app ?? ({} as FirebaseApp);
export const auth = firebase?.auth ?? ({} as Auth);
export const db = firebase?.db ?? ({} as Firestore);
