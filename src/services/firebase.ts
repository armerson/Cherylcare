import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// NOTE: Next.js only exposes environment variables to browser code when they
// are prefixed with NEXT_PUBLIC_. Variables named EXPO_PUBLIC_ (left over from
// this app's React Native origins) are NOT available in the browser, so the
// Firebase config would be undefined and getAuth() would throw on boot.
const ENV = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseConfig = {
  apiKey: ENV.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: ENV.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: ENV.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: ENV.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize Firebase on the client — prevents Next.js prerender from
// crashing when env vars aren't available server-side at build time.
function initFirebase() {
  const missing = Object.entries(ENV)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      'Firebase is not configured. The following environment variables are ' +
      'missing from this deployment: ' + missing.join(', ') + '. ' +
      'Add them in Vercel → Settings → Environment Variables using the ' +
      'NEXT_PUBLIC_ prefix (not EXPO_PUBLIC_), then redeploy.',
    );
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return { app, auth: getAuth(app), db: getFirestore(app) };
}

const firebase = typeof window !== 'undefined' ? initFirebase() : null;

export const app = firebase?.app ?? ({} as FirebaseApp);
export const auth = firebase?.auth ?? ({} as Auth);
export const db = firebase?.db ?? ({} as Firestore);
