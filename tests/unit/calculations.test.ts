import { describe, it, expect } from 'vitest';
import { calculateFootprint } from '../../shared/src/calculations/footprint';
import { calculateSolarFeasibility } from '../../shared/src/calculations/solar';
import { simulatePeakShift } from '../../shared/src/calculations/tariffs';
import { calculateAuthoritativePoints, getLevelFromPoints } from '../../shared/src/calculations/points';
import { calculateInventoryBaseline } from '../../src/services/applianceService';
import type { EmissionFactors, SubsidyRules, DiscomTariff } from '../../shared/src/schemas/config';

const mockEmissionFactors: EmissionFactors = {
  id: 'emissionFactors',
  gridCo2PerKwh: 0.82,
  lpgCo2PerKg: 2.983,
  lpgCylinderWeightKg: 14.2,
  petrolCo2PerKm: 0.165,
  dieselCo2PerKm: 0.185,
  cngCo2PerKm: 0.125,
  evCo2PerKm: 0.052,
  twoWheelerPetrolCo2PerKm: 0.048,
  wasteUnsegregatedCo2PerKg: 0.95,
  waterPumpingCo2PerKilolitre: 0.42,
  source: 'CEA v19',
  sourceUrl: 'https://cea.nic.in',
  lastVerified: '2026-10-31T00:00:00Z'
};

const mockSubsidyRules: SubsidyRules = {
  id: 'subsidyRules',
  schemeName: 'PM Surya Ghar: Muft Bijli Yojana & Gujarat GEDA Subsidy',
  centralSubsidyTiers: [
    { capacityKw: 1, subsidyAmountInr: 30000 },
    { capacityKw: 2, subsidyAmountInr: 60000 },
    { capacityKw: 3, subsidyAmountInr: 78000 }
  ],
  maxCentralSubsidyInr: 78000,
  stateBonusInr: 0,
  benchmarkCostPerKwInr: 55000,
  annualSolarIrradianceGujaratKwhPerM2: 5.4,
  avgGenerationPerKwPerDayKwh: 4.3,
  annualDegradationPercent: 0.7,
  systemLifespanYears: 25,
  gridFeedInTariffInrPerKwh: 2.25,
  source: 'MNRE Notification 2024',
  sourceUrl: 'https://pmsuryaghar.gov.in',
  lastVerified: '2026-10-31T00:00:00Z'
};

const mockTariff: DiscomTariff = {
  discomId: 'UGVCL',
  name: 'Uttar Gujarat Vij Company Limited',
  coverageDistricts: ['Ahmedabad', 'Gandhinagar'],
  residentialSlabs: [
    { maxUnits: 50, ratePerKwh: 3.20 },
    { maxUnits: 100, ratePerKwh: 3.90 },
    { maxUnits: 250, ratePerKwh: 4.90 },
    { maxUnits: 99999, ratePerKwh: 6.20 }
  ],
  fixedMonthlyCharges: 40,
  peakHours: [18, 19, 20, 21],
  peakRateMultiplier: 1.25,
  offPeakHours: [22, 23, 0, 1, 2, 3, 4, 5],
  offPeakRateDiscount: 0.15,
  source: 'GERC 2024-25',
  sourceUrl: 'https://gercin.org',
  lastVerified: '2026-10-31T00:00:00Z'
};

describe('Footprint Calculation Engine', () => {
  it('calculates carbon footprint correctly for domestic consumption', () => {
    const result = calculateFootprint(
      {
        monthlyElectricityUnitsKwh: 280,
        primaryCookingFuel: 'LPG',
        lpgCylindersYear: 10,
        dailyCommuteKm: 16,
        vehicleType: 'two_wheeler_petrol',
        householdSize: 4
      },
      mockEmissionFactors
    );

    // 280 kWh * 0.82 = 229.6 kg
    expect(result.breakdown.electricity).toBe(229.6);
    expect(result.monthlyTotalCo2Kg).toBeGreaterThan(250);
    expect(result.treesEquivalentToOffset).toBeGreaterThan(100);
  });
});

describe('Rooftop Solar Feasibility Engine', () => {
  it('correctly applies PM Surya Ghar subsidy caps (max 78,000 INR for 3 kW+)', () => {
    const result = calculateSolarFeasibility(
      {
        monthlyBillInr: 2500,
        availableRoofAreaSqFt: 350
      },
      mockSubsidyRules
    );

    expect(result.recommendedCapacityKw).toBeGreaterThanOrEqual(1.5);
    expect(result.pmSuryaGharSubsidyInr).toBeLessThanOrEqual(78000);
    expect(result.netPayableInr).toBe(result.grossSystemCostInr - result.pmSuryaGharSubsidyInr);
    expect(result.simplePaybackPeriodYears).toBeGreaterThan(0);
    expect(result.lifetime25YrSavingsInr).toBeGreaterThan(100000);
  });
});

describe('Gujarat DISCOM ToD Tariff Simulator', () => {
  it('flags peak hour penalty between 6 PM and 10 PM IST', () => {
    const peakSim = simulatePeakShift(
      { appliancePowerWatts: 1500, durationHours: 2, scheduledHour: 19 }, // 7 PM
      mockTariff
    );
    expect(peakSim.isPeakHour).toBe(true);
    expect(peakSim.savingsIfShiftedToOffPeakInr).toBeGreaterThan(0);

    const offPeakSim = simulatePeakShift(
      { appliancePowerWatts: 1500, durationHours: 2, scheduledHour: 23 }, // 11 PM
      mockTariff
    );
    expect(offPeakSim.isPeakHour).toBe(false);
    expect(offPeakSim.isOffPeakHour).toBe(true);
  });
});

describe('Server-Authoritative Gamification Logic', () => {
  it('applies 25-pt photo bonus and streak tier multipliers', () => {
    const res = calculateAuthoritativePoints({
      basePoints: 50,
      currentStreakDays: 6, // will become 7d streak (+10%)
      hasPhotoProof: true,
      dailyPointsEarnedSoFar: 0
    });

    expect(res.allowed).toBe(true);
    expect(res.newStreakDays).toBe(7);
    expect(res.streakMultiplier).toBe(1.10);
    // (50 + 25) * 1.10 = 82.5 -> 83 or 82
    expect(res.awardedPoints).toBe(83);
  });

  it('enforces 400 points daily cap strictly against bots', () => {
    const res = calculateAuthoritativePoints({
      basePoints: 50,
      currentStreakDays: 3,
      hasPhotoProof: false,
      dailyPointsEarnedSoFar: 400
    });

    expect(res.allowed).toBe(false);
    expect(res.awardedPoints).toBe(0);
  });

  it('correctly maps lifetime points to LiFE ranks', () => {
    const levelInfo = getLevelFromPoints(780);
    expect(levelInfo.level).toBe(2);
    expect(levelInfo.progressPercent).toBeGreaterThan(0);
  });
});

describe('Appliance Inventory Dynamic Baseline Engine', () => {
  it('sums monthly_co2e and overrides domestic baseline footprint', () => {
    const mockAppliances = [
      {
        id: 'app_1',
        appliance_type: 'air_conditioner',
        wattage: 1450,
        monthly_co2e: 172.5
      },
      {
        id: 'app_2',
        appliance_type: 'refrigerator',
        wattage: 220,
        monthly_co2e: 45.4
      }
    ];

    const user = {
      monthlyFootprintKg: 428,
      breakdown: {
        energy: 228,
        transport: 114,
        cooking: 38,
        water: 24,
        waste: 24
      }
    };

    const res = calculateInventoryBaseline(mockAppliances, user);

    // Sum of appliances = 172.5 + 45.4 = 217.9 kg
    expect(res.totalApplianceCo2e).toBe(217.9);
    expect(res.totalWattage).toBe(1670);
    expect(res.applianceCount).toBe(2);
    expect(res.hasDynamicInventoryBaseline).toBe(true);
    // New energy = 218 + 32 = 250
    expect(res.breakdown.energy).toBe(250);
    // Total footprint = 250 + 114 + 38 + 24 + 24 = 450
    expect(res.monthlyFootprintKg).toBe(450);
  });
});

