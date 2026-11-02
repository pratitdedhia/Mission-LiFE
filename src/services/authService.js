import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDefaultUserProfile, getCachedCatalog } from './catalogService';
import { logger } from '../utils/logger';

const LOCAL_AUTH_KEY = 'mission_life_auth_user';
const SESSION_ACTIVE_KEY = 'life_session_active';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export function isSessionActive() {
  try {
    return localStorage.getItem(SESSION_ACTIVE_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function setSessionActive(active) {
  try {
    if (active) {
      localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
    } else {
      localStorage.removeItem(SESSION_ACTIVE_KEY);
    }
  } catch (e) {}
}

export function getStoredUser() {
  try {
    if (!isSessionActive()) {
      return getDefaultUserProfile();
    }
    const raw = localStorage.getItem(LOCAL_AUTH_KEY);
    if (!raw) return getDefaultUserProfile();
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : getDefaultUserProfile();
  } catch (e) {
    return getDefaultUserProfile();
  }
}

export function saveStoredUser(userData) {
  try {
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(userData));
  } catch (e) {
    logger.error("Failed to store user profile in local storage", e);
  }
}

function mapAuthError(error) {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return "Incorrect email or password.";
    case 'auth/invalid-email':
      return "Invalid email address format.";
    case 'auth/user-disabled':
      return "This account has been disabled by an administrator.";
    case 'auth/too-many-requests':
      return "Too many unsuccessful login attempts. Please wait a moment and try again.";
    case 'auth/email-already-in-use':
      return "This email is already registered. Please sign in instead.";
    case 'auth/weak-password':
      return "Password must be at least 6 characters long.";
    case 'auth/network-request-failed':
      return "Network error: Unable to connect to the authentication service.";
    case 'auth/popup-closed-by-user':
      return "Sign-in popup was closed before completing authentication.";
    default:
      return error?.message || "Authentication failed. Please verify your credentials.";
  }
}

/**
 * Signs in a user with email and password via Firebase Auth.
 * The user's role is strictly resolved from Firestore or custom claims, never from client input.
 * On failure, returns { success: false, error } with zero fallback sessions created.
 */
export async function loginWithEmail(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!auth) {
    return {
      success: false,
      error: "Authentication service is currently unavailable. Please try again later."
    };
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCred.user;

    const profile = await fetchOrCreateUserProfile(user.uid, {
      name: user.displayName || cleanEmail.split('@')[0],
      email: user.email,
      lastLogin: new Date().toISOString()
    });

    saveStoredUser(profile);
    setSessionActive(true);
    syncUserProfile(profile).catch(() => {});
    return { success: true, user: profile };
  } catch (error) {
    logger.warn("Firebase Auth login failed:", error.code, error.message);
    return {
      success: false,
      error: mapAuthError(error),
      code: error.code
    };
  }
}

/**
 * Signs in with Google Popup via Firebase Auth.
 * Role is strictly derived from Firestore, never from client parameters.
 */
export async function loginWithGoogle() {
  if (!auth) {
    return {
      success: false,
      error: "Google Authentication service is currently unavailable."
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const googleUser = result.user;

    const profile = await fetchOrCreateUserProfile(googleUser.uid, {
      name: googleUser.displayName || googleUser.email.split('@')[0],
      email: googleUser.email,
      photoURL: googleUser.photoURL,
      provider: 'google.com',
      lastLogin: new Date().toISOString()
    });

    saveStoredUser(profile);
    setSessionActive(true);
    syncUserProfile(profile).catch(() => {});
    return { success: true, user: profile };
  } catch (error) {
    logger.warn("Firebase Google Auth error:", error.code, error.message);
    const isCancelled = error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request';
    return {
      success: false,
      cancelled: isCancelled,
      error: mapAuthError(error),
      code: error.code
    };
  }
}

/**
 * Demo accounts: sign in to real Firebase Auth accounts using VITE_DEMO_PASSWORD,
 * strictly gated by VITE_ENABLE_DEMO_LOGIN. Zero unauthenticated sessions.
 */
export async function loginWithDemoPreset(roleKey = 'citizen') {
  const isEnabled = import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';
  if (!isEnabled) {
    return {
      success: false,
      error: "Demo preset sign-in is disabled in this environment."
    };
  }

  const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;
  if (!demoPassword) {
    return {
      success: false,
      error: "Demo password is not configured on this server (VITE_DEMO_PASSWORD missing)."
    };
  }

  const cachedDemo = getCachedCatalog('demoProfiles') || [];
  const target = (roleKey || '').toLowerCase();
  const demoMatch = cachedDemo.find(p => 
    (p.role && p.role.toLowerCase() === target) ||
    (target === 'solar_vendor' && p.role === 'solar_partner')
  );

  if (!demoMatch || !demoMatch.email) {
    return {
      success: false,
      error: `No configured demo profile found for role '${roleKey}'.`
    };
  }

  if (!auth) {
    return {
      success: false,
      error: "Firebase authentication service is not connected."
    };
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, demoMatch.email, demoPassword);
    const user = userCred.user;
    const profile = await fetchOrCreateUserProfile(user.uid, {
      ...demoMatch,
      id: user.uid,
      name: demoMatch.name,
      email: user.email,
      role: demoMatch.role || 'citizen',
      roleTitle: demoMatch.roleTitle || 'Residential Citizen',
      lastLogin: new Date().toISOString()
    });

    saveStoredUser(profile);
    setSessionActive(true);
    syncUserProfile(profile).catch(() => {});
    return { success: true, user: profile, isDemoPreset: true };
  } catch (error) {
    logger.warn("Demo preset sign-in failed:", error.code, error.message);
    return {
      success: false,
      error: `Demo sign-in failed for ${demoMatch.name}: ${mapAuthError(error)}`,
      code: error.code
    };
  }
}

/**
 * Registers a new user. Always creates role: 'citizen'.
 * Ignores any privileged keys from extraMetadata.
 * Elevated roles are granted only by an admin via Admin SDK or approval workflows.
 */
export async function registerWithEmail(email, password, displayName, district = 'Ahmedabad', extraMetadata = {}) {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!auth) {
    return {
      success: false,
      error: "Authentication service is currently unavailable. Please try again later."
    };
  }

  // Whitelist extraMetadata keys to prevent privilege escalation
  const allowedExtraKeys = [
    'requestedCampus',
    'requestedCollegeId',
    'requestedDepartment',
    'requestedYearOfStudy',
    'requestedResidenceType',
    'idCardPhotoUrl',
    'companyName',
    'licenseId',
    'phone'
  ];

  const sanitizedExtra = {};
  if (extraMetadata && typeof extraMetadata === 'object') {
    for (const key of allowedExtraKeys) {
      if (extraMetadata[key] !== undefined) {
        sanitizedExtra[key] = extraMetadata[key];
      }
    }
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCred.user;

    if (displayName) {
      await updateProfile(user, { displayName }).catch(() => {});
    }

    const newProfile = {
      ...getDefaultUserProfile(user.uid),
      id: user.uid,
      role: 'citizen',
      roleTitle: 'Residential Citizen',
      name: displayName || cleanEmail.split('@')[0],
      email: user.email,
      district: district || 'Ahmedabad',
      city: district || 'Ahmedabad',
      joinedDate: new Date().toISOString(),
      ...sanitizedExtra
    };

    if (db) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, newProfile);
    }

    saveStoredUser(newProfile);
    setSessionActive(true);
    return { success: true, user: newProfile };
  } catch (error) {
    logger.warn("Firebase Auth signup failed:", error.code, error.message);
    return {
      success: false,
      error: mapAuthError(error),
      code: error.code
    };
  }
}

export async function loginAnonymously() {
  if (!auth) {
    return {
      success: false,
      error: "Authentication service is currently unavailable."
    };
  }

  try {
    const result = await signInAnonymously(auth);
    const profile = await fetchOrCreateUserProfile(result.user.uid, {
      name: "Guest Citizen (Gujarat)",
      isAnonymous: true,
      role: 'citizen',
      roleTitle: 'Residential Citizen'
    });
    saveStoredUser(profile);
    setSessionActive(true);
    return { success: true, user: profile };
  } catch (error) {
    logger.warn("Firebase Anonymous Auth error:", error.code, error.message);
    return {
      success: false,
      error: mapAuthError(error),
      code: error.code
    };
  }
}

export const loginAsGuest = loginAnonymously;

export async function signOutUser() {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (e) {
    logger.warn("Sign out error:", e);
  }
  setSessionActive(false);
  const resetUser = getDefaultUserProfile();
  saveStoredUser(resetUser);
  return resetUser;
}

export const logoutUser = signOutUser;

async function fetchOrCreateUserProfile(uid, defaults = {}) {
  try {
    if (db) {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const firestoreData = snap.data();
        return { 
          ...getDefaultUserProfile(uid), 
          ...firestoreData, 
          id: uid,
          role: firestoreData.role || 'citizen',
          roleTitle: firestoreData.roleTitle || 'Residential Citizen'
        };
      } else {
        // Enforce role: 'citizen' on initial profile creation
        const newProfile = {
          ...getDefaultUserProfile(uid),
          ...defaults,
          role: 'citizen',
          roleTitle: 'Residential Citizen',
          id: uid
        };
        await setDoc(userRef, newProfile);
        return newProfile;
      }
    }
  } catch (e) {
    logger.warn("Firestore fetch profile warning:", e.message);
  }
  return { ...getDefaultUserProfile(uid), ...defaults, role: 'citizen', id: uid };
}

async function syncUserProfile(profile) {
  try {
    if (db && profile?.id) {
      const userRef = doc(db, 'users', profile.id);
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore sync timeout')), 2500)
      );
      await Promise.race([
        setDoc(userRef, profile, { merge: true }),
        timeout
      ]);
    }
  } catch (err) {
    logger.warn("Firestore syncUserProfile warning:", err.message);
  }
}

export function subscribeAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await fetchOrCreateUserProfile(firebaseUser.uid, {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Citizen',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL
      });
      saveStoredUser(profile);
      setSessionActive(true);
      callback(profile);
    } else {
      setSessionActive(false);
      const guest = getDefaultUserProfile();
      saveStoredUser(guest);
      callback(null);
    }
  });
}
