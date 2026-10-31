export interface AwardPointsInput {
  basePoints: number;
  currentStreakDays: number;
  hasPhotoProof: boolean;
  dailyPointsEarnedSoFar: number;
  dailyPointsCap?: number; // defaults to 400 pts/day to prevent bot exploitation
}

export interface AwardPointsResult {
  allowed: boolean;
  awardedPoints: number;
  streakMultiplier: number;
  newStreakDays: number;
  photoProofBonus: number;
  reason?: string;
}

export interface UserLevelInfo {
  level: number;
  titleKey: string;
  minPoints: number;
  maxPoints: number;
  progressPercent: number;
}

export const STREAK_TIERS = [
  { minDays: 21, multiplier: 1.25, badgeKey: 'badges.habit_master' },
  { minDays: 7, multiplier: 1.10, badgeKey: 'badges.weekly_champion' },
  { minDays: 3, multiplier: 1.05, badgeKey: 'badges.consistent_starter' },
  { minDays: 0, multiplier: 1.00, badgeKey: '' }
];

export const LEVEL_THRESHOLDS = [
  { level: 1, titleKey: 'levels.level1', minPoints: 0, maxPoints: 300 },
  { level: 2, titleKey: 'levels.level2', minPoints: 301, maxPoints: 800 },
  { level: 3, titleKey: 'levels.level3', minPoints: 801, maxPoints: 1800 },
  { level: 4, titleKey: 'levels.level4', minPoints: 1801, maxPoints: 3500 },
  { level: 5, titleKey: 'levels.level5', minPoints: 3501, maxPoints: 6000 },
  { level: 6, titleKey: 'levels.level6', minPoints: 6001, maxPoints: 10000 }
];

/**
 * Server-authoritative calculation for awarding points, bonuses, and streak multipliers.
 */
export function calculateAuthoritativePoints(input: AwardPointsInput): AwardPointsResult {
  const cap = input.dailyPointsCap || 400;

  if (input.dailyPointsEarnedSoFar >= cap) {
    return {
      allowed: false,
      awardedPoints: 0,
      streakMultiplier: 1.0,
      newStreakDays: input.currentStreakDays,
      photoProofBonus: 0,
      reason: 'DAILY_CAP_REACHED'
    };
  }

  // 1. Photo proof bonus (+25 pts)
  const photoBonus = input.hasPhotoProof ? 25 : 0;

  // 2. Streak tier multiplier
  const newStreak = input.currentStreakDays + 1;
  const activeTier = STREAK_TIERS.find(t => newStreak >= t.minDays) || STREAK_TIERS[STREAK_TIERS.length - 1];
  const multiplier = activeTier.multiplier;

  // 3. Total calculation
  const rawAward = Math.round((input.basePoints + photoBonus) * multiplier);

  // Enforce cap
  const maxPossible = Math.max(0, cap - input.dailyPointsEarnedSoFar);
  const finalAward = Math.min(rawAward, maxPossible);

  return {
    allowed: true,
    awardedPoints: finalAward,
    streakMultiplier: multiplier,
    newStreakDays: newStreak,
    photoProofBonus: photoBonus
  };
}

/**
 * Computes level progression from lifetime points.
 */
export function getLevelFromPoints(lifetimePoints: number): UserLevelInfo {
  const currentTier = LEVEL_THRESHOLDS.find(
    t => lifetimePoints >= t.minPoints && lifetimePoints <= t.maxPoints
  ) || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  const range = currentTier.maxPoints - currentTier.minPoints;
  const progressInLevel = Math.max(0, lifetimePoints - currentTier.minPoints);
  const percent = range > 0 ? Math.min(100, Math.round((progressInLevel / range) * 100)) : 100;

  return {
    level: currentTier.level,
    titleKey: currentTier.titleKey,
    minPoints: currentTier.minPoints,
    maxPoints: currentTier.maxPoints,
    progressPercent: percent
  };
}

