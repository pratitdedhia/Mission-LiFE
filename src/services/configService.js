/**
 * Mission LiFE Configuration Service
 *
 * Implements the Zero-Hardcoding Contract:
 * All business parameters, tariffs, emission factors, and subsidy tiers are
 * retrieved dynamically from Firestore (`config/{name}`) or verified offline cache.
 *
 * Cache Hierarchy:
 * 1. In-memory Map cache
 * 2. localStorage offline read-through cache (tagged with _cachedAt)
 * 3. Cloud Firestore (`config/{name}`)
 *
 * If missing from Firestore and no cache is present, an explicit error state
 * is raised (never silently falling back to hardcoded numbers).
 */

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// -------------------------------------------------------------
// Zod Schemas for Runtime Validation
// -------------------------------------------------------------

export const EmissionFactorsSchema = z.object({
  id: z.string().optional(),
  gridCo2PerKwh: z.number().positive(),
  lpgCo2PerKg: z.number().positive(),
  lpgCylinderWeightKg: z.number().positive(),
  petrolCo2PerKm: z.number().positive(),
  dieselCo2PerKm: z.number().positive(),
  cngCo2PerKm: z.number().positive(),
  evCo2PerKm: z.number().positive(),
  twoWheelerPetrolCo2PerKm: z.number().positive(),
  wasteUnsegregatedCo2PerKg: z.number().positive(),
  waterPumpingCo2PerKilolitre: z.number().positive(),
  source: z.string().min(1),
  sourceUrl: z.string().optional(),
  lastVerified: z.string().optional()
});

export const TariffSlabSchema = z.object({
  minUnits: z.number().nonnegative().optional(),
  maxUnits: z.number().positive(),
  ratePerKwh: z.number().positive()
});

export const DiscomTariffSchema = z.object({
  discomId: z.string(),
  name: z.string(),
  coverageDistricts: z.array(z.string()).optional(),
  fixedMonthlyCharges: z.number().nonnegative(),
  residentialSlabs: z.array(TariffSlabSchema),
  peakHours: z.array(z.number()),
  peakRateMultiplier: z.number().positive(),
  offPeakHours: z.array(z.number()),
  offPeakRateDiscount: z.number().nonnegative()
});

export const TariffsConfigSchema = z.object({
  id: z.string().optional(),
  statewidePeakRateMultiplier: z.number().positive(),
  statewideOffPeakDiscount: z.number().nonnegative(),
  peakHours: z.array(z.number()),
  offPeakHours: z.array(z.number()),
  discoms: z.record(z.string(), DiscomTariffSchema).or(z.array(DiscomTariffSchema)),
  source: z.string().min(1)
});

export const SubsidyTierSchema = z.object({
  capacityKw: z.number().positive(),
  subsidyAmountInr: z.number().positive()
});

export const SubsidyRulesSchema = z.object({
  id: z.string().optional(),
  schemeName: z.string(),
  centralSubsidyTiers: z.array(SubsidyTierSchema),
  maxCentralSubsidyInr: z.number().positive(),
  stateBonusInr: z.number().nonnegative(),
  benchmarkCostPerKwInr: z.number().positive(),
  avgGenerationPerKwPerDayKwh: z.number().positive(),
  annualDegradationPercent: z.number().nonnegative(),
  systemLifespanYears: z.number().positive(),
  gridFeedInTariffInrPerKwh: z.number().positive(),
  source: z.string().min(1)
});

export const SolarModelSchema = z.object({
  id: z.string().optional(),
  benchmarkCostPerKwInr: z.number().positive(),
  dailyKwhPerKw: z.number().positive(),
  annualDegradationPercent: z.number().nonnegative(),
  systemLifeYears: z.number().positive(),
  feedInTariffInrPerKwh: z.number().positive(),
  minRooftopAreaSqFtPerKw: z.number().positive(),
  inverterReplacementYear: z.number().positive(),
  annualOmPercentOfCapex: z.number().nonnegative(),
  source: z.string().min(1)
});

export const ScoringSchema = z.object({
  id: z.string().optional(),
  dailyCap: z.number().positive(),
  baselineDailyKwh: z.number().positive(),
  expectedSavingsFactor: z.number().positive(),
  streakBonusMultiplier: z.number().positive(),
  maxStreakBonusMultiplier: z.number().positive(),
  bonusEligibleActionsCount: z.number().positive(),
  levelThresholds: z.array(z.number()).or(z.record(z.string(), z.number())),
  source: z.string().min(1)
});

export const NudgeRulesSchema = z.object({
  id: z.string().optional(),
  timezone: z.string(),
  wattageThreshold: z.number().positive(),
  peakHoursStart: z.number(),
  peakHoursEnd: z.number(),
  peakWindowLabel: z.string(),
  quietHoursStart: z.number(),
  quietHoursEnd: z.number(),
  cooldownMinutesPerAppliance: z.number().positive(),
  minReadingIntervalSeconds: z.number().positive(),
  source: z.string().min(1)
});

export const ForecastSchema = z.object({
  id: z.string().optional(),
  minHistoryDays: z.number().positive(),
  baselineWindowDays: z.number().positive(),
  rollingAverageWindowDays: z.number().positive(),
  insufficientDataMessage: z.string(),
  modelType: z.string(),
  source: z.string().min(1)
});

// Map of schema validators by config document name
export const CONFIG_SCHEMAS = {
  emissionFactors: EmissionFactorsSchema,
  tariffs: TariffsConfigSchema,
  subsidyRules: SubsidyRulesSchema,
  solarModel: SolarModelSchema,
  scoring: ScoringSchema,
  nudgeRules: NudgeRulesSchema,
  forecast: ForecastSchema
};

// -------------------------------------------------------------
// Cache Layer: Memory + LocalStorage
// -------------------------------------------------------------

const inMemoryCache = new Map();
const CACHE_PREFIX = 'life_config_cache_';

export function clearConfigCache() {
  inMemoryCache.clear();
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore in non-browser env
  }
}

function getFromLocalCache(docName) {
  // Check memory
  if (inMemoryCache.has(docName)) {
    return { data: inMemoryCache.get(docName), isCached: true };
  }

  // Check localStorage
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${docName}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data) {
        inMemoryCache.set(docName, parsed.data);
        return { data: parsed.data, isCached: true, cachedAt: parsed.cachedAt };
      }
    }
  } catch {
    // LocalStorage unavailable
  }

  return null;
}

function saveToLocalCache(docName, data) {
  inMemoryCache.set(docName, data);
  try {
    localStorage.setItem(`${CACHE_PREFIX}${docName}`, JSON.stringify({
      data,
      cachedAt: new Date().toISOString()
    }));
  } catch {
    // LocalStorage quota or unavailable
  }
}

// -------------------------------------------------------------
// Core Fetcher with Zod Validation
// -------------------------------------------------------------

/**
 * Fetch and validate a configuration document from Firestore `config/{docName}`.
 * If offline or Firestore fails, falls back to local cache if available.
 * If completely missing, throws an explicit ConfigurationMissingError.
 */
export async function getConfig(docName) {
  const schema = CONFIG_SCHEMAS[docName];
  if (!schema) {
    throw new Error(`Unknown config document name: "${docName}"`);
  }

  // Attempt Firestore fetch
  let rawData = null;
  let fetchFailed = false;

  if (db) {
    try {
      const docRef = doc(db, 'config', docName);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        rawData = snapshot.data();
      }
    } catch (err) {
      console.warn(`Firestore config fetch failed for "${docName}":`, err.message);
      fetchFailed = true;
    }
  } else {
    fetchFailed = true;
  }

  // If fetched from Firestore, validate and update cache
  if (rawData) {
    const parseResult = schema.safeParse(rawData);
    if (!parseResult.success) {
      console.error(`Config validation failure for "${docName}":`, parseResult.error.format());
      throw new Error(`Invalid configuration format for "${docName}": ${parseResult.error.message}`);
    }
    saveToLocalCache(docName, parseResult.data);
    return { data: parseResult.data, isCached: false };
  }

  // Fallback to local cache
  const local = getFromLocalCache(docName);
  if (local && local.data) {
    const parseResult = schema.safeParse(local.data);
    if (parseResult.success) {
      return { data: parseResult.data, isCached: true, cachedAt: local.cachedAt };
    }
  }

  // Completely missing: throw actionable error, NEVER fall back to silent hardcoded numbers!
  throw new Error(
    `Configuration missing for '${docName}'. ` +
    `Firestore document config/${docName} does not exist and no offline cache was found. ` +
    `To resolve, run: npm run seed`
  );
}

// Typed convenience fetchers
export const getEmissionFactorsConfig = () => getConfig('emissionFactors');
export const getTariffsConfig = () => getConfig('tariffs');
export const getSubsidyRulesConfig = () => getConfig('subsidyRules');
export const getSolarModelConfig = () => getConfig('solarModel');
export const getScoringConfig = () => getConfig('scoring');
export const getNudgeRulesConfig = () => getConfig('nudgeRules');
export const getForecastConfig = () => getConfig('forecast');

// -------------------------------------------------------------
// React Hook: useConfig(docName)
// -------------------------------------------------------------

/**
 * React hook to retrieve a configuration document.
 * Returns { data, loading, error, isCached, refetch }
 */
export function useConfig(docName) {
  // Pre-seed state from in-memory or localStorage cache for instantaneous first-paint
  const initialCache = getFromLocalCache(docName);

  const [data, setData] = useState(initialCache?.data || null);
  const [loading, setLoading] = useState(!initialCache?.data);
  const [error, setError] = useState(null);
  const [isCached, setIsCached] = useState(!!initialCache?.data);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getConfig(docName);
      setData(res.data);
      setIsCached(res.isCached);
    } catch (err) {
      setError(err);
      // If we don't have cached data, ensure data is null
      if (!initialCache?.data) {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [docName]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { data, loading, error, isCached, refetch: fetchConfig };
}

