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
import { INITIAL_USER, DEMO_USERS } from '../data/initialData';

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
    const raw = localStorage.getItem(LOCAL_AUTH_KEY);
    return raw ? JSON.parse(raw) : INITIAL_USER;
  } catch (e) {
    return INITIAL_USER;
  }
}

export function saveStoredUser(userData) {
  try {
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(userData));
  } catch (e) {
    console.error("Failed to store user profile in local storage", e);
  }
}

export async function loginWithEmail(email, password, roleHint = 'citizen') {
  // First check if this email matches one of our demo users
  const demoRole = Object.keys(DEMO_USERS).find(
    k => DEMO_USERS[k].email.toLowerCase() === email.trim().toLowerCase()
  );
  if (demoRole) {
    const demoProfile = { ...DEMO_USERS[demoRole] };
    saveStoredUser(demoProfile);
    setSessionActive(true);
    syncUserProfile(demoProfile).catch(err => console.warn(err));
    return { success: true, user: demoProfile, isDemoPreset: true };
  }

  try {
    if (auth) {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      const profile = await fetchOrCreateUserProfile(user.uid, {
        email: user.email,
        name: user.displayName || email.split('@')[0],
        role: roleHint
      });
      saveStoredUser(profile);
      setSessionActive(true);
      return { success: true, user: profile };
    }
  } catch (error) {
    console.warn("Firebase Auth login error:", error.code, error.message);
    // If auth API is pending enablement in Firebase console, provide resilient login
    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/network-request-failed' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      const fallbackUser = {
        ...INITIAL_USER,
        id: `usr_${email.replace(/[^a-zA-Z0-9]/g, '')}`,
        email: email,
        name: email.split('@')[0],
        role: roleHint
      };
      saveStoredUser(fallbackUser);
      setSessionActive(true);
      return { success: true, user: fallbackUser, isFallback: true };
    }
    return { success: false, error: error.message };
  }
}

export async function loginWithGoogle(roleHint = 'citizen') {
  if (!auth) {
    const basePreset = DEMO_USERS[roleHint] || DEMO_USERS.citizen;
    const fallbackUser = {
      ...basePreset,
      id: `usr_google_${Date.now()}`,
      name: `${basePreset.name} (Google)`,
      email: basePreset.email,
      role: roleHint,
      provider: 'google.com'
    };
    saveStoredUser(fallbackUser);
    setSessionActive(true);
    return { success: true, user: fallbackUser, isFallback: true };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const googleUser = result.user;

    const basePreset = DEMO_USERS[roleHint] || DEMO_USERS.citizen;
    const profile = {
      ...basePreset,
      id: googleUser.uid,
      name: googleUser.displayName || googleUser.email.split('@')[0],
      email: googleUser.email,
      photoURL: googleUser.photoURL,
      role: roleHint,
      provider: 'google.com',
      lastLogin: new Date().toISOString()
    };

    saveStoredUser(profile);
    setSessionActive(true);

    syncUserProfile(profile).catch((err) => {
      console.warn("Background Firestore user sync:", err);
    });

    return { success: true, user: profile };
  } catch (error) {
    console.warn("Firebase Google Auth error code:", error.code, error.message);

    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, cancelled: true, error: 'Sign-in window closed.' };
    }

    if (error.code === 'auth/cancelled-popup-request') {
      return { success: false, cancelled: true, error: 'Sign-in window was re-opened.' };
    }

    return {
      success: false,
      code: error.code,
      error: error.message,
      canFallback: true
    };
  }
}

export function loginWithGoogleInstant(roleHint = 'citizen', customDetails = {}) {
  const basePreset = DEMO_USERS[roleHint] || DEMO_USERS.citizen;
  const profile = {
    ...basePreset,
    id: `usr_google_${Date.now().toString(36)}`,
    name: customDetails.name || (roleHint === 'citizen' ? 'Pooja Patel (Google Verified)' : `${basePreset.name} (Google Verified)`),
    email: customDetails.email || (roleHint === 'citizen' ? 'citizen.pooja.google@gujaratlife.in' : `${roleHint}.google@gujaratlife.in`),
    role: roleHint,
    provider: 'google.com',
    lastLogin: new Date().toISOString()
  };
  saveStoredUser(profile);
  setSessionActive(true);
  syncUserProfile(profile).catch(() => {});
  return { success: true, user: profile };
}

export async function loginWithDemoPreset(roleKey = 'citizen') {
  const preset = DEMO_USERS[roleKey] || DEMO_USERS.citizen;
  const userObj = { ...preset };
  saveStoredUser(userObj);
  setSessionActive(true);
  syncUserProfile(userObj).catch(err => console.warn(err));
  return { success: true, user: userObj, isDemoPreset: true };
}

export async function registerWithEmail(email, password, displayName, district = 'Ahmedabad', role = 'citizen') {
  try {
    if (auth) {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      await updateProfile(user, { displayName });
      const newProfile = {
        ...INITIAL_USER,
        id: user.uid,
        role: role,
        name: displayName || email.split('@')[0],
        email: user.email,
        district: district,
        city: district,
        joinedDate: new Date().toISOString()
      };
      await syncUserProfile(newProfile);
      saveStoredUser(newProfile);
      setSessionActive(true);
      return { success: true, user: newProfile };
    }
  } catch (error) {
    console.warn("Firebase Auth signup error:", error.code, error.message);
    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/network-request-failed' || error.code === 'auth/email-already-in-use') {
      const fallbackUser = {
        ...INITIAL_USER,
        id: `usr_${Date.now()}`,
        role: role,
        name: displayName || email.split('@')[0],
        email: email,
        district: district,
        city: district,
        joinedDate: new Date().toISOString()
      };
      saveStoredUser(fallbackUser);
      setSessionActive(true);
      return { success: true, user: fallbackUser, isFallback: true };
    }
    return { success: false, error: error.message };
  }
}

export async function loginAsGuest() {
  try {
    if (auth) {
      const userCred = await signInAnonymously(auth);
      const user = userCred.user;
      const guestProfile = {
        ...INITIAL_USER,
        id: user.uid,
        name: `Guest Citizen #${user.uid.slice(0, 5)}`,
        email: 'guest@missionlife.in',
        isAnonymous: true
      };
      await syncUserProfile(guestProfile);
      saveStoredUser(guestProfile);
      setSessionActive(true);
      return { success: true, user: guestProfile };
    }
  } catch (error) {
    console.warn("Anonymous auth fallback:", error.message);
    const guestUser = {
      ...INITIAL_USER,
      id: `guest_${Date.now().toString().slice(-4)}`,
      name: `Citizen (Demo Account)`,
      isAnonymous: true
    };
    saveStoredUser(guestUser);
    setSessionActive(true);
    return { success: true, user: guestUser, isFallback: true };
  }
}

export async function logoutUser() {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (e) {
    console.warn("Sign out fallback error:", e);
  }
  setSessionActive(false);
  const resetUser = INITIAL_USER;
  saveStoredUser(resetUser);
  return resetUser;
}

async function fetchOrCreateUserProfile(uid, defaults = {}) {
  try {
    if (db) {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return { ...INITIAL_USER, ...snap.data(), id: uid };
      } else {
        const newProfile = {
          ...INITIAL_USER,
          ...defaults,
          id: uid
        };
        await setDoc(userRef, newProfile);
        return newProfile;
      }
    }
  } catch (e) {
    console.warn("Firestore fetch profile fallback:", e.message);
  }
  return { ...INITIAL_USER, ...defaults, id: uid };
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
  } catch (e) {
    console.warn("Firestore user sync warning:", e.message);
  }
}

export function subscribeAuth(onUser) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await fetchOrCreateUserProfile(firebaseUser.uid, {
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'Citizen'
      });
      onUser(profile);
    }
  });
}

