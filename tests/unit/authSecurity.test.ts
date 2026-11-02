import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase Auth and Firestore modules
vi.mock('../../src/firebase', () => ({
  auth: { currentUser: null },
  db: {}
}));

const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockOnAuthStateChanged = vi.fn();
const mockSignOut = vi.fn();

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
  onAuthStateChanged: (auth: any, callback: any) => mockOnAuthStateChanged(auth, callback),
  signInAnonymously: vi.fn(),
  signOut: (...args: any[]) => mockSignOut(...args),
  updateProfile: vi.fn().mockResolvedValue(undefined),
  GoogleAuthProvider: vi.fn(function () {
    return {
      setCustomParameters: vi.fn()
    };
  }),
  signInWithPopup: vi.fn()
}));

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db, col, id) => ({ path: `${col}/${id}` })),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args)
}));

import { 
  loginWithEmail, 
  registerWithEmail, 
  subscribeAuth, 
  isSessionActive, 
  getStoredUser 
} from '../../src/services/authService';

const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((k: string) => store[k] || null),
  setItem: vi.fn((k: string, v: string) => { store[k] = String(v); }),
  removeItem: vi.fn((k: string) => { delete store[k]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  key: vi.fn((i: number) => Object.keys(store)[i] || null),
  length: 0
};

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = mockLocalStorage as any;
}

describe('C1 & C2: Authentication Security & Privilege Escalation Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('C1: Authentication Bypass Defenses (loginWithEmail)', () => {
    it('wrong password does NOT create a session or return success', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValueOnce({
        code: 'auth/wrong-password',
        message: 'Invalid password provided.'
      });

      const res = await loginWithEmail('pooja.patel@gujaratlife.in', 'IncorrectPass123!');
      
      expect(res.success).toBe(false);
      expect(res.error).toBe('Incorrect email or password.');
      expect(isSessionActive()).toBe(false);
    });

    it('unknown email does NOT create a session or fallback user', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValueOnce({
        code: 'auth/user-not-found',
        message: 'No record corresponding to this identifier.'
      });

      const res = await loginWithEmail('nonexistent.user@gujaratlife.in', 'SomePassword123!');

      expect(res.success).toBe(false);
      expect(res.error).toBe('Incorrect email or password.');
      expect(isSessionActive()).toBe(false);
      expect(getStoredUser().role).toBe('citizen');
    });

    it('network failure returns an error and does NOT create a session', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValueOnce({
        code: 'auth/network-request-failed',
        message: 'Network error communicating with Firebase Auth.'
      });

      const res = await loginWithEmail('pooja.patel@gujaratlife.in', 'Password123!');

      expect(res.success).toBe(false);
      expect(res.error).toContain('Network error');
      expect(isSessionActive()).toBe(false);
    });

    it('user cannot obtain admin by passing an argument or client parameter', async () => {
      // Simulate successful login of standard user
      mockSignInWithEmailAndPassword.mockResolvedValueOnce({
        user: { uid: 'usr_normal_123', email: 'normal@test.in', displayName: 'Normal Citizen' }
      });

      // Firestore profile returns citizen
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          role: 'citizen',
          roleTitle: 'Residential Citizen',
          name: 'Normal Citizen'
        })
      });

      // Attempt to pass 3rd argument (roleHint)
      const res = await (loginWithEmail as any)('normal@test.in', 'ValidPassword123!', 'admin');

      expect(res.success).toBe(true);
      expect(res.user.role).toBe('citizen');
      expect(res.user.role).not.toBe('admin');
    });

    it('admin login via admin@gmail.com with password admin routes to authorized state admin persona', async () => {
      mockSignInWithEmailAndPassword.mockResolvedValueOnce({
        user: { uid: 'usr_admin_neha', email: 'admin.neha@geda.gujarat.gov.in', displayName: 'Dr. Neha Joshi' }
      });
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          role: 'admin',
          roleTitle: 'GEDA State Energy Officer',
          name: 'Dr. Neha Joshi',
          department: 'Directorate of Energy Conservation'
        })
      });

      const res = await loginWithEmail('admin@gmail.com', 'admin');

      expect(res.success).toBe(true);
      expect(res.user.role).toBe('admin');
      expect(res.user.name).toContain('Neha Joshi');
    });
  });

  describe('C2: Privilege Escalation Prevention (registerWithEmail & LocalStorage)', () => {
    it('signup cannot create an admin role even if requested in client call', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
        user: { uid: 'usr_new_999', email: 'newadmin@test.in' }
      });
      mockSetDoc.mockResolvedValueOnce(undefined);

      // Attempt privilege escalation via extraMetadata or role parameter
      const res = await (registerWithEmail as any)(
        'newadmin@test.in', 
        'SecurePassword123!', 
        'Sneaky User', 
        'Ahmedabad', 
        { role: 'admin', points: 99999, status: 'approved' }
      );

      expect(res.success).toBe(true);
      expect(res.user.role).toBe('citizen');
      expect(res.user.roleTitle).toBe('Residential Citizen');
      
      // Ensure the Firestore write was strictly role: 'citizen'
      const setDocCall = mockSetDoc.mock.calls[0];
      expect(setDocCall[1].role).toBe('citizen');
      expect(setDocCall[1].points).toBeUndefined();
    });

    it('email-already-in-use returns an error, never a session', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValueOnce({
        code: 'auth/email-already-in-use',
        message: 'The email address is already in use by another account.'
      });

      const res = await registerWithEmail('existing@test.in', 'Password123!', 'Existing User');

      expect(res.success).toBe(false);
      expect(res.error).toBe('This email is already registered. Please sign in instead.');
      expect(isSessionActive()).toBe(false);
    });

    it('editing localStorage does not retain elevated role when Firebase auth state resolves to null', () => {
      // Maliciously tamper with localStorage
      localStorage.setItem('mission_life_auth_user', JSON.stringify({
        id: 'usr_hacker',
        role: 'admin',
        roleTitle: 'State Admin'
      }));
      localStorage.setItem('life_session_active', 'true');

      let authCallback: any = null;
      mockOnAuthStateChanged.mockImplementationOnce((auth, cb) => {
        authCallback = cb;
        return vi.fn();
      });

      const profileCallback = vi.fn();
      subscribeAuth(profileCallback);

      // Simulate Firebase Auth notifying that no real user is signed in
      authCallback(null);

      // Must report null to profileCallback and clear session
      expect(profileCallback).toHaveBeenCalledWith(null);
      expect(isSessionActive()).toBe(false);
      expect(getStoredUser().role).toBe('citizen');
    });

    it('getDefaultUserProfile is callable and returns a guest citizen profile', async () => {
      const { getDefaultUserProfile } = await import('../../src/services/catalogService');
      const profile = getDefaultUserProfile();
      expect(profile).toBeDefined();
      expect(profile.role).toBe('citizen');
      expect(profile.lifeScore).toBe(100);
    });
  });
});
