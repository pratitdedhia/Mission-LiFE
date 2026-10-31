/**
 * LiFE+ Product Branding & Configuration
 * Allows easy modification of product name, promise, and organizational context.
 */

export const BRANDING = {
  // Working product name
  name: "LiFE+",
  legalName: "LiFE+ Gujarat Citizen Companion",
  version: "1.2.0-prod",
  
  // One-line product promise
  promise: "Mission LiFE turns sustainability from something citizens know about into something they do every day.",
  shortPromise: "From awareness to daily action.",
  
  // Organization Context
  orgName: "Gujarat Energy Development Agency (GEDA)",
  orgShort: "GEDA",
  hackathonTrack: "HackCult '26 • HC26-GEDA01 (Green Energy & Sustainability)",
  
  // Scientific & Regulatory Baselines
  assumptions: {
    gridEmissionFactorKgPerKwh: 0.82, // Central Electricity Authority (CEA) Baseline v19 for Western Regional Grid
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
    general: "LiFE+ is a prototype developed for HackCult '26. All emission metrics are calculated using published CEA & BEE benchmarks. All user activities are citizen-reported.",
    subsidy: "Subsidy figures represent published PM Surya Ghar Central Financial Assistance guidelines. Final approval and net-metering depends on DISCOM feasibility inspection.",
    grid: "Peak hours reflect standard Gujarat DISCOM Time-of-Day (ToD) tariff windows (6 PM - 10 PM IST).",
    verification: "Community actions are citizen-submitted with optional photographic evidence. They reflect community participation and peer inspiration, not third-party audited credits.",
    communityData: "Community aggregate impact includes baseline demonstration metrics for evaluation purposes."
  }
};

