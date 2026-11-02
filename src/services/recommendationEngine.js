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

  // Retrieve user registered appliances for targeted gamification
  let userAppliances = user.appliances || [];
  if ((!userAppliances || userAppliances.length === 0) && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`life_user_appliances_${user.id || 'usr_citizen'}`);
      if (raw) userAppliances = JSON.parse(raw);
    } catch (e) {
      userAppliances = [];
    }
  }
  const appTypes = new Set((userAppliances || []).map(a => a.appliance_type));

  // Targeted Challenge 1: Clean AC Filters (if user owns an AC)
  if (appTypes.has('air_conditioner') && !completed.has('clean_ac_filter')) {
    return {
      missionId: "clean_ac_filter",
      title: "Clean AC Mesh Filters",
      theme: "energy",
      reason: "Detected Inverter AC in your registered home appliances. Dust-clogged filters increase compressor drag by 15%.",
      action: "Remove front mesh filters, rinse under running tap water, dry and reinstall",
      transparentCalculation: "Saves ~0.8 kWh daily during peak cooling + 0.65 kg CO₂ avoided",
      impactCo2Kg: 0.65,
      estimatedSavingsInr: 120,
      points: 40,
      difficulty: "Easy",
      requiresPhotoProof: true,
      isAccepted: active.has('clean_ac_filter')
    };
  }

  // Targeted Challenge 2: Refrigerator Coil Clearance (if user owns a Refrigerator)
  if (appTypes.has('refrigerator') && !completed.has('fridge_coil_clearance')) {
    return {
      missionId: "fridge_coil_clearance",
      title: "Refrigerator Coil Clearance Check",
      theme: "energy",
      reason: "Detected Frost-Free Refrigerator in your home inventory. Proper rear clearance prevents compressor heat buildup.",
      action: "Ensure a minimum 2-inch gap between refrigerator rear coils and the kitchen wall",
      transparentCalculation: "Reduces compressor duty cycle by 12% + 0.55 kg CO₂ avoided per week",
      impactCo2Kg: 0.55,
      estimatedSavingsInr: 90,
      points: 35,
      difficulty: "Easy",
      requiresPhotoProof: true,
      isAccepted: active.has('fridge_coil_clearance')
    };
  }

  // Targeted Challenge 3: Cold Water Eco Wash (if user owns a Washing Machine)
  if (appTypes.has('washing_machine') && !completed.has('cold_water_wash')) {
    return {
      missionId: "cold_water_wash",
      title: "Cold-Water Eco Wash Cycle",
      theme: "energy",
      reason: "Detected Washing Machine in your home inventory. Water heating accounts for 85–90% of cycle electricity.",
      action: "Run next laundry batch with cold water (30°C setting) and after 10 PM off-peak",
      transparentCalculation: "Saves 1.1 kWh water heating element draw + 0.90 kg CO₂ avoided",
      impactCo2Kg: 0.90,
      estimatedSavingsInr: 75,
      points: 35,
      difficulty: "Easy",
      requiresPhotoProof: false,
      isAccepted: active.has('cold_water_wash')
    };
  }

  // Targeted Challenge 4: Geyser 15-Minute Timer (if user owns a Geyser)
  if (appTypes.has('water_heater_geyser') && !completed.has('geyser_timer_shutoff')) {
    return {
      missionId: "geyser_timer_shutoff",
      title: "Geyser 15-Min Timer Shutoff",
      theme: "energy",
      reason: "Detected 2,000 W Water Geyser in your home inventory. Continuous standby reheating wastes 1.8 kWh daily.",
      action: "Turn off bathroom geyser main switch after 15 minutes of heating",
      transparentCalculation: "Eliminates continuous 2 kW standby cycling + 1.48 kg CO₂ avoided",
      impactCo2Kg: 1.48,
      estimatedSavingsInr: 160,
      points: 50,
      difficulty: "Medium",
      requiresPhotoProof: false,
      isAccepted: active.has('geyser_timer_shutoff')
    };
  }

  // Targeted Challenge 5: Microwave Phantom Standby (if user owns a Microwave)
  if (appTypes.has('microwave') && !completed.has('microwave_phantom_switch')) {
    return {
      missionId: "microwave_phantom_switch",
      title: "Phantom Standby Kill Switch",
      theme: "energy",
      reason: "Detected Microwave Oven in your inventory consuming continuous digital display clock standby.",
      action: "Turn off microwave wall plug switch when not reheating food",
      transparentCalculation: "Eliminates 3W continuous phantom draw + 0.35 kg CO₂ avoided per month",
      impactCo2Kg: 0.35,
      estimatedSavingsInr: 40,
      points: 25,
      difficulty: "Easy",
      requiresPhotoProof: false,
      isAccepted: active.has('microwave_phantom_switch')
    };
  }

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
      transparentCalculation: `Central CFA subsidy under MNRE guidelines + ${annualCo2} kg CO₂ avoided per year`,
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
      transparentCalculation: `Saves peak tariff surcharge vs off-peak rate + 1.10 kg CO₂ avoided`,
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

