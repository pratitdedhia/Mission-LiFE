import { describe, it, expect, beforeAll } from 'vitest';
import { 
  calculateKwhFromTelemetry, 
  CO2_GRID_FACTOR_KG_PER_KWH,
  GRID_EMISSION_FACTOR_METADATA,
  ENERGY_SAVING_REWARD_RULE,
  fetchCampusLeaderAnalytics,
  fetchSolarVendorAnalytics,
  fetchAdminImpactAnalytics
} from '../../src/services/analyticsService';

describe('Analytics & Telemetry Calculations Engine', () => {
  beforeAll(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const store: Record<string, string> = {};
      globalThis.localStorage = {
        getItem: (k: string) => store[k] || null,
        setItem: (k: string, v: string) => { store[k] = String(v); },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        key: (i: number) => Object.keys(store)[i] || null,
        length: 0
      } as any;
    }
  });
  it('correctly calculates kWh from contiguous power time series using trapezoidal rule', () => {
    // 1000 Watts draw sustained across 1 hour (3600 seconds)
    const readings = [
      { timestamp: 1700000000, current_wattage: 1000 },
      { timestamp: 1700000030, current_wattage: 1000 },
      { timestamp: 1700000060, current_wattage: 1000 }
    ];

    const result = calculateKwhFromTelemetry(readings, 60);
    expect(result.readingsCount).toBe(3);
    expect(result.monitoredSeconds).toBe(60);
    expect(result.gapCount).toBe(0);
    expect(result.coveragePercent).toBe(100);

    // 1000W * 60s / (3600 * 1000) = 0.0167 kWh
    expect(result.totalKwh).toBeCloseTo(0.0167, 3);
  });

  it('rejects missing-data gaps exceeding 60 seconds without fabricating consumption', () => {
    const readingsWithGap = [
      { timestamp: 1700000000, current_wattage: 1200 },
      { timestamp: 1700000020, current_wattage: 1200 },
      // 5-minute missing data gap (300 seconds)
      { timestamp: 1700000320, current_wattage: 1500 },
      { timestamp: 1700000340, current_wattage: 1500 }
    ];

    const result = calculateKwhFromTelemetry(readingsWithGap, 60);
    expect(result.gapCount).toBe(1);
    expect(result.monitoredSeconds).toBe(40); // Only 20s + 20s
    expect(result.coveragePercent).toBeLessThan(50); // Total span is 340s
  });

  it('uses CEA official 0.71 kg CO2/kWh factor with documented source metadata', () => {
    expect(CO2_GRID_FACTOR_KG_PER_KWH).toBe(0.71);
    expect(GRID_EMISSION_FACTOR_METADATA.factor).toBe(0.71);
    expect(GRID_EMISSION_FACTOR_METADATA.unit).toBe('kg CO2e / kWh');
    expect(GRID_EMISSION_FACTOR_METADATA.source).toContain('Central Electricity Authority');
  });

  it('enforces documented versioned energy-saving reward rule (v2026.1-SAVINGS)', () => {
    expect(ENERGY_SAVING_REWARD_RULE.version).toBe('2026.1-SAVINGS');
    expect(ENERGY_SAVING_REWARD_RULE.pointsPerKwhSaved).toBe(10);
    expect(ENERGY_SAVING_REWARD_RULE.maxDailyRewardPoints).toBe(50);
    expect(ENERGY_SAVING_REWARD_RULE.baselineDailyKwh).toBe(8.5);
  });

  it('ensures Campus Leader analytics are strictly aggregated from verified students without exposing PII', async () => {
    const leaderAnalytics = await fetchCampusLeaderAnalytics('IIT Gandhinagar');
    expect(leaderAnalytics.campusName).toBe('IIT Gandhinagar');
    expect(leaderAnalytics.totalVerifiedCount).toBeGreaterThan(0);
    expect(leaderAnalytics.totalPoints).toBeGreaterThan(0);

    // Verify privacy safety: no roll numbers, no email, no ID card photo in comparisons list
    leaderAnalytics.studentComparisons.forEach(student => {
      expect(student).toHaveProperty('studentName');
      expect(student).toHaveProperty('department');
      expect(student).toHaveProperty('totalPoints');
      expect(student).not.toHaveProperty('collegeId');
      expect(student).not.toHaveProperty('studentEmail');
      expect(student).not.toHaveProperty('idCardPhotoUrl');
    });
  });

  it('ensures Solar Vendor analytics expose real funnel stages and mark unrecorded purchases as not tracked', async () => {
    const vendorAnalytics = await fetchSolarVendorAnalytics('usr_vendor_rajesh', 'Ahmedabad');
    expect(vendorAnalytics.funnel).toBeDefined();
    expect(vendorAnalytics.funnel.length).toBe(6);

    // Initial stages tracked
    expect(vendorAnalytics.funnel[0].stage).toContain('Inquiries');
    expect(vendorAnalytics.funnel[1].stage).toContain('Surveys');

    // Confirmed purchases stage explicitly handles unrecorded milestone
    const purchaseStage = vendorAnalytics.funnel.find(f => f.stage.includes('Purchases'));
    expect(purchaseStage).toBeDefined();
    if (purchaseStage.count === 0) {
      expect(purchaseStage.label).toBe('Not tracked yet');
      expect(purchaseStage.status).toBe('pending_recording');
    }

    // Denominators disclaimer
    expect(vendorAnalytics.disclaimers.denominators).toContain('Eligible-household denominators not collected');
  });

  it('ensures Statewide Admin Impact analytics dynamically compute metrics and disclose missing denominators', async () => {
    const adminAnalytics = await fetchAdminImpactAnalytics({ dateRange: 'all', scope: 'state' });
    expect(adminAnalytics.statewide.totalCitizens).toBeGreaterThan(0);
    expect(adminAnalytics.districts.length).toBeGreaterThan(0);
    expect(adminAnalytics.campuses.length).toBeGreaterThan(0);
    expect(adminAnalytics.sectors.length).toBe(5);
    expect(adminAnalytics.schemes.length).toBe(3);

    // Disclosures
    expect(adminAnalytics.disclosures.simulatedTelemetry).toContain('Simulated Wokwi telemetry');
    expect(adminAnalytics.disclosures.denominators).toContain('Per-capita adoption rates unavailable');
  });
});
