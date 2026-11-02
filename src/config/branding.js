/**
 * Mission LiFE Product Branding & Regulatory Configuration
 * Aligned with Gujarat Energy Development Agency (GEDA) - HackCult '26 (HC26-GEDA01)
 */

/**
 * Standard Central Electricity Authority (CEA) Grid Emission Factor:
 * Source: CEA CO2 Baseline Database for the Indian Power Sector, User Guide Version 20.0 (Published December 2024).
 * Weighted average grid emission factor for the National Grid / Western Regional Grid: 0.71 kg CO2/kWh.
 */
export const CO2_GRID_FACTOR_KG_PER_KWH = 0.71;
export const DEFAULT_BASELINE_DAILY_KWH = 8.5;

export const CO2_GRID_EMISSION_FACTOR_METADATA = {
  factor: 0.71,
  unit: "kg CO2e / kWh",
  source: "Central Electricity Authority (CEA) Baseline Database v20.0 (December 2024)",
  lastVerified: "2026-10-31T00:00:00Z"
};

export const BRANDING = {
  // Canonical product name & tagline
  name: "Mission LiFE",
  tagline: "LiFE Loop",
  legalName: "Mission LiFE: Gujarat Energy Development Agency (GEDA) Platform",
  version: "1.2.0-prod",
  
  // Product promise
  promise: "Mission LiFE turns sustainability from something citizens know about into something they do every day.",
  shortPromise: "From awareness to daily action via the LiFE Loop cycle.",
  
  // Organization Context
  orgName: "Gujarat Energy Development Agency (GEDA)",
  orgShort: "GEDA",
  hackathonTrack: "HackCult '26 • HC26-GEDA01 (Green Energy & Sustainability)",
  
  // Scientific & Regulatory Baselines
  assumptions: {
    gridEmissionFactorKgPerKwh: CO2_GRID_FACTOR_KG_PER_KWH, // Official CEA Baseline v20.0 (Dec 2024)
    averagePowerTariffInr: 7.60,      // Gujarat Urja Vikas Nigam Limited (GUVNL) residential average tariff (₹/kWh)
    peakTariffInr: 9.20,             // Gujarat ToD peak surcharge rate (18:00 - 22:00 IST)
    offPeakTariffInr: 5.40,          // Gujarat ToD off-peak concession rate (23:00 - 06:00 IST)
    nationalBenchmarkCapitaTonnes: 1.8, // India per capita annual CO2 target (tonnes/year)
    gujaratUrbanMonthlyBaselineKg: 510, // Benchmark urban household footprint (4 persons)
    pmSuryaGharSubsidies: {
      oneKw: 30000,
      twoKw: 60000,
      threeKwPlus: 78000,
      source: "MNRE PM Surya Ghar: Muft Bijli Yojana Guidelines (February 2024)"
    }
  },

  // Transparent Disclaimers
  disclaimers: {
    general: "Mission LiFE is an interactive citizen engagement platform for HackCult '26. All emission metrics are calculated using official CEA & BEE benchmarks.",
    subsidy: "Subsidy figures represent published PM Surya Ghar Central Financial Assistance guidelines. Final approval and net-metering depends on DISCOM feasibility inspection.",
    grid: "Peak hours reflect standard Gujarat DISCOM Time-of-Day (ToD) tariff windows (6 PM - 10 PM IST).",
    verification: "Community actions are citizen-submitted with optional photographic evidence. They reflect community participation and peer inspiration.",
    communityData: "Community aggregate impact is synced with Cloud Firestore."
  }
};
