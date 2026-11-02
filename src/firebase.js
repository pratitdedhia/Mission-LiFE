import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAFOm7HLfYxob_v2CWH6urwCgs6LqqJrtQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hackcult-f9a20.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hackcult-f9a20",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hackcult-f9a20.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "640710734480",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:640710734480:web:f494e272fad279c9afde15",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XCGCXXSN2V"
};

const hasCredentials = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!hasCredentials) {
  console.error(
    "CRITICAL FIREBASE CONFIGURATION ERROR: VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID are missing from your environment. " +
    "Copy .env.example to .env and configure your Firebase project credentials. Operating in defensive offline mode."
  );
}

export const app = hasCredentials ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

// Connect to Firebase Emulator Suite if configured
if (app && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    const authUrl = import.meta.env.VITE_EMULATOR_AUTH_URL || 'http://localhost:9099';
    const host = import.meta.env.VITE_EMULATOR_FIRESTORE_HOST || 'localhost';
    const firestorePort = Number(import.meta.env.VITE_EMULATOR_FIRESTORE_PORT) || 8080;
    const storagePort = Number(import.meta.env.VITE_EMULATOR_STORAGE_PORT) || 9199;

    if (auth) connectAuthEmulator(auth, authUrl, { disableWarnings: true });
    if (db) connectFirestoreEmulator(db, host, firestorePort);
    if (storage) connectStorageEmulator(storage, host, storagePort);
    console.log('⚡ Connected to local Firebase Emulator Suite (Auth, Firestore, Storage)');
  } catch (e) {
    console.warn('Firebase emulator connection warning:', e);
  }
}

// Analytics must be initialized defensively because it is not supported
// in every browser or local development environment.
export const analyticsPromise = (app && typeof window !== 'undefined')
  ? isSupported().then((supported) => (supported ? getAnalytics(app) : null)).catch(() => null)
  : Promise.resolve(null);

export const isFirebaseConnected = Boolean(app && db);
