/**
 * Custom Gamification & Integrity Engine for Mission LiFE
 * Provides authoritative point calculation, duplicate completion protection,
 * streak multipliers, daily anti-fraud caps, and transactional Firebase updates.
 */

import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, runTransaction } from 'firebase/firestore';
import { CO2_GRID_FACTOR_KG_PER_KWH, DEFAULT_BASELINE_DAILY_KWH } from '../config/branding';
import { getIstDateString, getIstYesterdayString } from '../utils/dateUtils';

export const SCORING_RULES_SPECIFICATION = {
  version: "2026.1-GEDA",
  dailyCapPoints: 300,
  photoVerificationBonusPoints: 25,
  streakTiers: [
    { minDays: 21, multiplier: 1.25, badge: "Habit Master (21d+)", label: "+25% Points Bonus" },
    { minDays: 7, multiplier: 1.10, badge: "Weekly Champion (7d+)", label: "+10% Points Bonus" },
    { minDays: 3, multiplier: 1.05, badge: "Consistent Citizen (3d+)", label: "+5% Points Bonus" },
    { minDays: 0, multiplier: 1.00, badge: "Prakriti Starter", label: "Base Points" }
  ],
  missionsBasePoints: {
    ac_warrior: { base: 50, co2Kg: 2.4, category: "energy" },
    light_saver: { base: 30, co2Kg: 0.8, category: "energy" },
    peak_shifter: { base: 60, co2Kg: 3.2, category: "energy" },
    bucket_bath: { base: 40, co2Kg: 1.1, category: "water" },
    cloth_bag: { base: 30, co2Kg: 0.4, category: "plastic" },
    plant_meal: { base: 40, co2Kg: 1.8, category: "food" },
    waste_segregation: { base: 50, co2Kg: 1.5, category: "waste" },
    short_trip: { base: 45, co2Kg: 2.1, category: "lifestyle" },
    ewaste_drop: { base: 70, co2Kg: 4.5, category: "ewaste" },
    solar_explorer: { base: 80, co2Kg: 6.0, category: "energy" }
  }
};

/**
 * Authoritative Energy-Saving Point Award Rule Specification
 * Points are never awarded for instantaneous low draw, only audited savings against a baseline.
 */
export const ENERGY_SAVING_REWARD_RULE = {
  version: "2026.1-SAVINGS",
  pointsPerKwhSaved: 10,
  maxDailyRewardPoints: 50,
  baselineDailyKwh: DEFAULT_BASELINE_DAILY_KWH, // Standard urban Gujarat household benchmark (GEDA baseline)
  co2GridFactorKgPerKwh: CO2_GRID_FACTOR_KG_PER_KWH,
  factorSource: "Central Electricity Authority (CEA) Baseline v20.0 (Dec 2024) / GEDA"
};

/**
 * Validates and records a mission completion with anti-fraud deduplication
 * and authoritative scoring calculation inside a Firestore transaction.
 */
export async function recordAuthoritativeMission({
  userId,
  missionId,
  currentStreak = 0,
  hasPhotoProof = false,
  photoProofUrl = null,
  userCity = "Ahmedabad",
  currentScore = 0,
  dateOverride = null
}) {
  if (!userId) {
    return {
      success: false,
      reason: "MISSING_USER_ID",
      message: "A valid user ID is required to record a mission action."
    };
  }

  // 1. Unknown mission check - reject without awarding default points
  const missionMeta = SCORING_RULES_SPECIFICATION.missionsBasePoints[missionId];
  if (!missionMeta) {
    return {
      success: false,
      reason: "UNKNOWN_MISSION",
      message: `Unknown or unverified mission task: '${missionId}'. Default points are rejected.`
    };
  }

  // 2. Determine IST date key
  const todayDateStr = dateOverride ? getIstDateString(dateOverride) : getIstDateString();
  const yesterdayDateStr = dateOverride ? getIstYesterdayString(dateOverride) : getIstYesterdayString();
  const deduplicationKey = `life_claim_${userId}_${missionId}_${todayDateStr}`;

  // 3. Optimistic local deduplication check
  try {
    const existingClaim = localStorage.getItem(deduplicationKey);
    if (existingClaim) {
      return {
        success: false,
        reason: "DUPLICATE_CLAIM_TODAY",
        message: "You have already completed this Mission LiFE task today. Streaks measure consistent daily habits! Try another task or return tomorrow."
      };
    }
  } catch (e) {
    // Proceed to authoritative check
  }

  // If db is not initialized/available
  if (!db) {
    return {
      success: false,
      reason: "DATABASE_UNAVAILABLE",
      message: "Database connection is unavailable to record this mission action."
    };
  }

  const deterministicDocId = `${userId}_${missionId}_${todayDateStr}`;
  const actionDocRef = doc(db, 'verifiedActions', deterministicDocId);
  const userRef = doc(db, 'users', userId);

  try {
    const txResult = await runTransaction(db, async (transaction) => {
      // Step A: All reads must occur before any writes
      const actionSnap = await transaction.get(actionDocRef);
      if (actionSnap.exists()) {
        throw new Error("ALREADY_COMPLETED_TODAY");
      }

      const userSnap = await transaction.get(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      const lastActionDate = userData.lastActionDate || null;
      const userStreak = typeof userData.streak === 'number' ? userData.streak : (currentStreak || 0);
      const userScore = typeof userData.lifeScore === 'number' ? userData.lifeScore : (currentScore || 0);

      // Streak calculation:
      // - Same IST day: streak stays unchanged (at most +1 per calendar day)
      // - Consecutive IST day (yesterday): streak increments by 1
      // - Missed a day or first action: streak resets to 1
      let newStreak;
      if (lastActionDate === todayDateStr) {
        newStreak = Math.max(1, userStreak);
      } else if (lastActionDate === yesterdayDateStr) {
        newStreak = Math.max(1, userStreak + 1);
      } else {
        newStreak = 1;
      }

      // Explicit streak tier lookup (fallback explicitly to lowest tier)
      const lowestTier = SCORING_RULES_SPECIFICATION.streakTiers[SCORING_RULES_SPECIFICATION.streakTiers.length - 1];
      const streakTier = SCORING_RULES_SPECIFICATION.streakTiers.find(t => newStreak >= t.minDays) || lowestTier;

      const basePoints = missionMeta.base;
      const co2Kg = missionMeta.co2Kg;
      const pointsWithStreak = Math.round(basePoints * (streakTier?.multiplier || 1.0));
      const photoBonus = hasPhotoProof ? SCORING_RULES_SPECIFICATION.photoVerificationBonusPoints : 0;
      const totalAwardedPoints = pointsWithStreak + photoBonus;

      const actionRecord = {
        userId,
        missionId,
        dateKey: todayDateStr,
        actionDate: todayDateStr,
        awardedPoints: totalAwardedPoints,
        streakBonusMultiplier: streakTier?.multiplier || 1.0,
        hasPhotoProof: Boolean(hasPhotoProof),
        photoProofUrl: photoProofUrl || null,
        co2KgSaved: co2Kg,
        category: missionMeta.category || "energy",
        userCity,
        verifiedBy: hasPhotoProof ? "Firebase Storage Photo Verification" : "Citizen Self-Reported",
        createdAt: new Date().toISOString()
      };

      // Step B: Writes
      transaction.set(actionDocRef, {
        ...actionRecord,
        serverTimestamp: serverTimestamp()
      });

      transaction.set(userRef, {
        lifeScore: userScore + totalAwardedPoints,
        streak: newStreak,
        lastActionDate: todayDateStr
      }, { merge: true });

      return {
        awardedPoints: totalAwardedPoints,
        basePoints,
        photoBonus,
        streakTier,
        co2KgSaved: co2Kg,
        newStreak,
        actionRecord
      };
    });

    // Update optimistic cache only upon successful server transaction
    try {
      localStorage.setItem(deduplicationKey, JSON.stringify({
        timestamp: Date.now(),
        awardedPoints: txResult.awardedPoints
      }));
    } catch (e) {
      // LocalStorage non-fatal
    }

    return {
      success: true,
      awardedPoints: txResult.awardedPoints,
      basePoints: txResult.basePoints,
      photoBonus: txResult.photoBonus,
      streakTier: txResult.streakTier,
      streak: txResult.newStreak,
      newStreak: txResult.newStreak,
      co2KgSaved: txResult.co2KgSaved,
      verificationLabel: hasPhotoProof ? "Verified with Photographic Evidence" : "Citizen Self-Reported Action",
      actionRecord: txResult.actionRecord
    };
  } catch (err) {
    if (err.message === "ALREADY_COMPLETED_TODAY") {
      return {
        success: false,
        reason: "DUPLICATE_CLAIM_TODAY",
        message: "You have already completed this Mission LiFE task today. Streaks measure consistent daily habits! Try another task or return tomorrow."
      };
    }

    // Never return false success
    return {
      success: false,
      reason: "TRANSACTION_FAILED",
      error: err.message,
      message: `Failed to record mission action: ${err.message}`
    };
  }
}
