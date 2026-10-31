import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAFOm7HLfYxob_v2CWH6urwCgs6LqqJrtQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hackcult-f9a20.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hackcult-f9a20",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hackcult-f9a20.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "640710734480",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:640710734480:web:f494e272fad279c9afde15",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XCGCXXSN2V"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics must be initialized defensively because it is not supported
// in every browser or local development environment.
export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null
);

export const isFirebaseConnected = Boolean(app && db);
