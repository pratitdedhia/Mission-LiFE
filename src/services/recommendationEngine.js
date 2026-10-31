/**
 * LiFE+ Adaptive Behavioral Recommendation Engine
 * Dynamically computes tailored next-best actions based on citizen profile,
 * footprint vectors, and historical mission completions.
 */

import { BRANDING } from '../config/branding';

export function getAdaptiveRecommendation(user) {
  const completed = new Set(user.completedMissions || []);
  const active = new Set(user.activeMissions || []);
  const breakdown = user.breakdown || { energy: 228, transport: 114, cooking: 38, water: 24, waste: 24 };
  const total = user.monthlyFootprintKg || 428;

  // Percentage shares
  const pEnergy = Math.round((breakdown.energy / total) * 100);
  const pTransport = Math.round((breakdown.transport / total) * 100);
  const pWaste = Math.round((breakdown.waste / total) * 100);

  // 1. Peak hour / AC cooling high emission
  if (!completed.has('ac_warrior') && (user.acUsageHours >= 4 || pEnergy > 45)) {
    const dailyKwhSaved = (user.acUsageHours * 0.22).toFixed(2);
    const dailyCo2 = (dailyKwhSaved * BRANDING.assumptions.gridEmissionFactorKgPerKwh).toFixed(2);
    const monthlyRupees = Math.round(dailyKwhSaved * 30 * BRANDING.assumptions.averagePowerTariffInr);

    return {
      missionId: "ac_warrior",
      title: "AC Eco-Set 26°C Challenge",
      theme: "energy",
      reason: `AC cooling accounts for an estimated ${pEnergy}% of your household carbon footprint.`,
      action: "Set thermostat to 26°C with ceiling fan on low speed",
      transparentCalculation: `Formula: ${user.acUsageHours} hrs × 0.22 kWh saved/hr × ${BRANDING.assumptions.gridEmissionFactorKgPerKwh} kg/kWh = ${dailyCo2} kg CO₂/day`,
      impactCo2Kg: Number(dailyCo2),
      estimatedSavingsInr: monthlyRupees,
      points: 50,
      difficulty: "Easy",
      isAccepted: active.has('ac_warrior')
    };
  }

  // 2. Solar Feasibility for high consumption households
  if (!completed.has('solar_explorer') && user.monthlyElectricityUnits >= 200) {
    const kw = Math.max(1, Math.round((user.monthlyElectricityUnits / 120) * 10) / 10);
    const annualCo2 = Math.round(kw * 1400 * BRANDING.assumptions.gridEmissionFactorKgPerKwh);

    return {
      missionId: "solar_explorer",
      title: "Rooftop Solar Feasibility Assessment",
      theme: "energy",
      reason: `At ${user.monthlyElectricityUnits} units/month, a ${kw} kW solar array can eliminate up to 90% of your power bill under PM Surya Ghar.`,
      action: "Run the interactive rooftop feasibility model and review CFA subsidy",
      transparentCalculation: `Subsidy up to ₹78,000 CFA under MNRE guidelines + ${annualCo2} kg CO₂ avoided per year`,
      impactCo2Kg: 2.5,
      estimatedSavingsInr: Math.round(kw * 1400 * BRANDING.assumptions.averagePowerTariffInr / 12),
      points: 100,
      difficulty: "Special",
      isAccepted: active.has('solar_explorer')
    };
  }

  // 3. Peak grid load shifting
  if (!completed.has('peak_shifter')) {
    return {
      missionId: "peak_shifter",
      title: "Shift Heavy Load to Off-Peak (ToD Tariff)",
      theme: "energy",
      reason: "Evening peak hours (6 PM - 10 PM) trigger high-carbon coal thermal generators in Gujarat.",
      action: "Run washing machines, dishwashers, and water pumps after 10 PM",
      transparentCalculation: `Saves peak tariff surcharge (₹9.20 vs ₹5.40/unit off-peak) + 1.10 kg CO₂ avoided`,
      impactCo2Kg: 1.10,
      estimatedSavingsInr: 180,
      points: 60,
      difficulty: "Medium",
      isAccepted: active.has('peak_shifter')
    };
  }

  // 4. Commute switch for high travel
  if (!completed.has('short_trip') && user.dailyTravelKm >= 10 && user.vehicleType !== 'public_transit') {
    const savedCo2 = (3 * 0.17).toFixed(2);
    return {
      missionId: "short_trip",
      title: "Active Green Commute (< 3 km)",
      theme: "lifestyle",
      reason: `Daily commute by ${user.vehicleType.replace('_', ' ')} contributes ${pTransport}% of your emissions.`,
      action: "Walk, cycle, or take Metro/BRTS for one trip under 3 km",
      transparentCalculation: `Formula: 3 km avoided × 0.17 kg CO₂/km (petrol car baseline) = ${savedCo2} kg CO₂ avoided`,
      impactCo2Kg: 0.85,
      estimatedSavingsInr: 45,
      points: 70,
      difficulty: "Medium",
      isAccepted: active.has('short_trip')
    };
  }

  // 5. Waste segregation
  if (!completed.has('waste_segregation')) {
    return {
      missionId: "waste_segregation",
      title: "100% Kitchen Wet/Dry Segregation",
      theme: "waste",
      reason: "Mixed household waste in municipal dump yards produces potent methane emissions.",
      action: "Keep wet organic compostables strictly separated from dry recyclables",
      transparentCalculation: `Prevents landfill methane decomposition: ~0.60 kg CO₂e avoided per day`,
      impactCo2Kg: 0.60,
      estimatedSavingsInr: 0,
      points: 40,
      difficulty: "Easy",
      isAccepted: active.has('waste_segregation')
    };
  }

  // Fallback default continuous improvement
  return {
    missionId: "light_saver",
    title: "Vampire Power Cutoff",
    theme: "energy",
    reason: "Standby power consumes 5-10% of residential electricity silently.",
    action: "Switch off wall sockets for television sets, microwave ovens, and phone chargers",
    transparentCalculation: `Cuts 0.3 kWh idle standby consumption × ${BRANDING.assumptions.gridEmissionFactorKgPerKwh} kg/kWh = 0.25 kg CO₂ avoided`,
    impactCo2Kg: 0.25,
    estimatedSavingsInr: 70,
    points: 25,
    difficulty: "Easy",
    isAccepted: active.has('light_saver')
  };
}

