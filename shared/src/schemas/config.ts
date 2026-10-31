import { z } from 'zod';

/**
 * Emission Factors Schema
 * Every factor carries provenance metadata and official sources.
 */
export const EmissionFactorsSchema = z.object({
  id: z.literal('emissionFactors'),
  // TODO(verify): Check against latest CEA CO2 Baseline Database Version 19 / 2024
  gridCo2PerKwh: z.number().positive().describe('kg CO2e per kWh of grid electricity in Gujarat (Western Regional Grid)'),
  // TODO(verify): Check against MoPNG / IPCC guidelines for domestic LPG cylinder combustion
  lpgCo2PerKg: z.number().positive().describe('kg CO2e per kg of LPG'),
  lpgCylinderWeightKg: z.number().positive().default(14.2),
  // TODO(verify): Check against BEE / MoPNG transport emissions database
  petrolCo2PerKm: z.number().positive().describe('kg CO2e per km for typical 1200cc petrol passenger car'),
  dieselCo2PerKm: z.number().positive().describe('kg CO2e per km for diesel car'),
  cngCo2PerKm: z.number().positive().describe('kg CO2e per km for domestic CNG car'),
  evCo2PerKm: z.number().positive().describe('kg CO2e per km for electric two/four-wheeler charged on Gujarat grid'),
  twoWheelerPetrolCo2PerKm: z.number().positive().describe('kg CO2e per km for 100-125cc commuter motorcycle'),
  // Waste and Water factors
  wasteUnsegregatedCo2PerKg: z.number().positive().describe('kg CO2e per kg municipal solid waste sent to landfill (Pirana / Gazipur analog)'),
  waterPumpingCo2PerKilolitre: z.number().positive().describe('kg CO2e per kL domestic water treatment & municipal pumping'),
  // Provenance metadata
  source: z.string(),
  sourceUrl: z.string().url(),
  lastVerified: z.string().datetime()
});

export type EmissionFactors = z.infer<typeof EmissionFactorsSchema>;

/**
 * Gujarat DISCOM Tariff Schedules
 * Captures peak Time-of-Day (ToD) penalties and off-peak green incentives.
 */
export const DiscomTariffSchema = z.object({
  discomId: z.enum(['UGVCL', 'MGVCL', 'DGVCL', 'PGVCL', 'TORRENT_POWER']),
  name: z.string(),
  coverageDistricts: z.array(z.string()),
  // Standard domestic residential slab rates (Rs / kWh)
  // TODO(verify): Check against GERC Multi-Year Tariff (MYT) Order 2024-25
  residentialSlabs: z.array(z.object({
    maxUnits: z.number(), // 0 to 50, 51 to 100, 101 to 250, >250
    ratePerKwh: z.number()
  })),
  fixedMonthlyCharges: z.number(),
  // Time of Day (ToD) tariff windows
  peakHours: z.array(z.number()), // e.g. [18, 19, 20, 21] (6:00 PM to 10:00 PM IST)
  peakRateMultiplier: z.number().positive().default(1.2), // 20% surcharge during peak
  offPeakHours: z.array(z.number()), // e.g. [22, 23, 0, 1, 2, 3, 4, 5] (10 PM to 6 AM)
  offPeakRateDiscount: z.number().positive().default(0.15), // 15% concession
  source: z.string(),
  sourceUrl: z.string().url(),
  lastVerified: z.string().datetime()
});

export type DiscomTariff = z.infer<typeof DiscomTariffSchema>;

/**
 * PM Surya Ghar Muft Bijli Yojana & Gujarat State Rooftop Solar Subsidy Rules
 */
export const SubsidyRulesSchema = z.object({
  id: z.literal('subsidyRules'),
  schemeName: z.literal('PM Surya Ghar: Muft Bijli Yojana & Gujarat GEDA Subsidy'),
  // TODO(verify): Check against Ministry of New and Renewable Energy (MNRE) Notification dated 13 Feb 2024
  centralSubsidyTiers: z.array(z.object({
    capacityKw: z.number(),
    subsidyAmountInr: z.number()
  })),
  maxCentralSubsidyInr: z.number(),
  // Additional GEDA State Top-up Subsidy where applicable
  // TODO(verify): Check Gujarat Renewable Energy Policy 2023-2028 provisions
  stateBonusInr: z.number().default(0),
  benchmarkCostPerKwInr: z.number(),
  annualSolarIrradianceGujaratKwhPerM2: z.number().default(5.4),
  avgGenerationPerKwPerDayKwh: z.number().default(4.3),
  annualDegradationPercent: z.number().default(0.7), // 0.7% annual solar panel degradation
  systemLifespanYears: z.number().default(25),
  gridFeedInTariffInrPerKwh: z.number().default(2.25), // APPC / surplus export rate
  source: z.string(),
  sourceUrl: z.string().url(),
  lastVerified: z.string().datetime()
});

export type SubsidyRules = z.infer<typeof SubsidyRulesSchema>;

