import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create in-memory mock database state
const mockDb = {
  verifiedActions: new Map<string, any>(),
  users: new Map<string, any>()
};

vi.mock('../../src/firebase', () => ({
  db: { _isMock: true },
  auth: { currentUser: { uid: 'test-user-123' } }
}));

vi.mock('firebase/firestore', () => ({
  db: { _isMock: true },
  doc: vi.fn((_db, collection, id) => ({ collection, id, path: `${collection}/${id}` })),
  serverTimestamp: vi.fn(() => 'MOCK_SERVER_TIMESTAMP'),
  increment: vi.fn((n) => n),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  runTransaction: vi.fn(async (_db, updateFunction) => {
    // Provide transaction implementation backed by mockDb
    const transaction = {
      get: vi.fn(async (docRef) => {
        const store = docRef.collection === 'verifiedActions' ? mockDb.verifiedActions : mockDb.users;
        const data = store.get(docRef.id);
        return {
          exists: () => !!data,
          data: () => (data ? { ...data } : undefined)
        };
      }),
      set: vi.fn((docRef, data, options) => {
        const store = docRef.collection === 'verifiedActions' ? mockDb.verifiedActions : mockDb.users;
        if (options?.merge && store.has(docRef.id)) {
          store.set(docRef.id, { ...store.get(docRef.id), ...data });
        } else {
          store.set(docRef.id, { ...data });
        }
      })
    };
    return await updateFunction(transaction);
  })
}));

// In-memory localStorage mock for node
const mockLocalStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => mockLocalStorage[key] || null,
  setItem: (key: string, val: string) => { mockLocalStorage[key] = String(val); },
  removeItem: (key: string) => { delete mockLocalStorage[key]; },
  clear: () => {
    for (const k of Object.keys(mockLocalStorage)) {
      delete mockLocalStorage[k];
    }
  },
  key: (i: number) => Object.keys(mockLocalStorage)[i] || null,
  length: 0
} as any;

import { recordAuthoritativeMission } from '../../src/services/gamificationEngine';
import { runTransaction } from 'firebase/firestore';

describe('Gamification Engine Security & Anti-Fraud (H1)', () => {
  beforeEach(() => {
    mockDb.verifiedActions.clear();
    mockDb.users.clear();
    globalThis.localStorage.clear();
    vi.clearAllMocks();
  });

  it('rejects unknown mission ids with UNKNOWN_MISSION and awards zero points', async () => {
    const result = await recordAuthoritativeMission({
      userId: 'citizen_123',
      missionId: 'fake_exploit_task',
      currentStreak: 0,
      currentScore: 100
    });

    expect(result.success).toBe(false);
    expect(result.reason).toBe('UNKNOWN_MISSION');
    expect(mockDb.verifiedActions.size).toBe(0);
    expect(mockDb.users.size).toBe(0);
  });

  it('second claim of the same mission on the same IST day fails even with cleared localStorage', async () => {
    const fixedDate = new Date('2026-11-02T10:00:00+05:30');

    // 1. First claim succeeds
    const firstResult = await recordAuthoritativeMission({
      userId: 'citizen_123',
      missionId: 'ac_warrior',
      currentStreak: 0,
      dateOverride: fixedDate
    });
    expect(firstResult.success).toBe(true);
    expect(firstResult.awardedPoints).toBe(50);

    // 2. Clear localStorage completely (simulating incognito / cache clear / script attempt)
    globalThis.localStorage.clear();

    // 3. Second claim must be rejected authoritatively by the database transaction
    const secondResult = await recordAuthoritativeMission({
      userId: 'citizen_123',
      missionId: 'ac_warrior',
      currentStreak: 1,
      dateOverride: fixedDate
    });

    expect(secondResult.success).toBe(false);
    expect(secondResult.reason).toBe('DUPLICATE_CLAIM_TODAY');
  });

  it('claims at 23:59 IST and 00:01 IST count as two consecutive days and increment streak', async () => {
    // 23:59:00 IST on 2026-11-02 is 18:29:00 UTC
    const day1LateNight = new Date('2026-11-02T18:29:00.000Z');
    // 00:01:00 IST on 2026-11-03 is 18:31:00 UTC
    const day2EarlyMorning = new Date('2026-11-02T18:31:00.000Z');

    // Day 1 Claim
    const res1 = await recordAuthoritativeMission({
      userId: 'citizen_123',
      missionId: 'ac_warrior',
      currentStreak: 0,
      dateOverride: day1LateNight
    });
    expect(res1.success).toBe(true);
    expect(res1.newStreak).toBe(1);

    // Verify stored user state
    const userAfterDay1 = mockDb.users.get('citizen_123');
    expect(userAfterDay1.lastActionDate).toBe('2026-11-02');
    expect(userAfterDay1.streak).toBe(1);

    // Day 2 Claim (different task or next day same task)
    const res2 = await recordAuthoritativeMission({
      userId: 'citizen_123',
      missionId: 'light_saver',
      currentStreak: 1,
      dateOverride: day2EarlyMorning
    });
    expect(res2.success).toBe(true);
    expect(res2.newStreak).toBe(2);

    const userAfterDay2 = mockDb.users.get('citizen_123');
    expect(userAfterDay2.lastActionDate).toBe('2026-11-03');
    expect(userAfterDay2.streak).toBe(2);
  });

  it('five different missions claimed on the same day increment streak by at most 1', async () => {
    const fixedDate = new Date('2026-11-02T12:00:00+05:30');
    const missions = ['ac_warrior', 'light_saver', 'peak_shifter', 'bucket_bath', 'cloth_bag'];

    let streakResult = 0;
    for (const missionId of missions) {
      const res = await recordAuthoritativeMission({
        userId: 'citizen_123',
        missionId,
        currentStreak: streakResult,
        dateOverride: fixedDate
      });
      expect(res.success).toBe(true);
      streakResult = res.newStreak;
    }

    // After 5 different missions on the same day, streak must remain 1
    expect(streakResult).toBe(1);
    const userDoc = mockDb.users.get('citizen_123');
    expect(userDoc.streak).toBe(1);
  });

  it('database transaction failure reports false and surfaces error message', async () => {
    // Force transaction to throw an unexpected error
    vi.mocked(runTransaction).mockRejectedValueOnce(new Error('Firestore network timeout or permission denied'));

    const result = await recordAuthoritativeMission({
      userId: 'citizen_123',
      missionId: 'ac_warrior',
      currentStreak: 0
    });

    expect(result.success).toBe(false);
    expect(result.reason).toBe('TRANSACTION_FAILED');
    expect(result.error).toContain('Firestore network timeout');
  });
});

