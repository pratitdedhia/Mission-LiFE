import type { SubsidyRules } from '../schemas/config';

export interface SolarCalculatorInput {
  monthlyBillInr: number;
  availableRoofAreaSqFt: number;
  discomTariffPerKwh: number;
}

export interface SolarCalculatorResult {
  recommendedCapacityKw: number;
  requiredRoofAreaSqFt: number;
  hasEnoughRoofSpace: boolean;
  estAnnualGenerationKwh: number;
  grossSystemCostInr: number;
  pmSuryaGharSubsidyInr: number;
  netPayableInr: number;
  estimatedAnnualSavingsInr: number;
  simplePaybackPeriodYears: number;
  lifetime25YrSavingsInr: number;
  lifetimeCo2OffsetTonnes: number;
  yearByYearSavings: Array<{
    year: number;
    generationKwh: number;
    savingsInr: number;
    cumulativeSavingsInr: number;
  }>;
}

/**
 * Pure calculation engine for PM Surya Ghar: Muft Bijli Yojana & GEDA Rooftop Solar.
 * Models 25-year yield with panel degradation and GERC net-metering regulations.
 * All parameters, subsidy tiers, and emission factors are passed in from configuration.
 */
export function calculateSolarFeasibility(
  input: SolarCalculatorInput,
  rules: SubsidyRules,
  gridCo2PerKwh: number
): SolarCalculatorResult {
  const tariffPerKwh = input.discomTariffPerKwh;
  // Estimate monthly units from bill
  const monthlyUnitsKwh = input.monthlyBillInr / tariffPerKwh;
  const dailyUnitsNeeded = monthlyUnitsKwh / 30;

  // 1 kW rooftop solar in Gujarat produces approx avgGenerationPerKwPerDayKwh (from rules)
  let idealKw = dailyUnitsNeeded / rules.avgGenerationPerKwPerDayKwh;
  // Standard solar capacities are rounded to nearest 0.5 kW (min 1 kW, max 10 kW residential)
  idealKw = Math.max(1, Math.min(10, Math.round(idealKw * 2) / 2));

  // 1 kW requires approx 100 sq.ft of shadow-free rooftop area
  const requiredAreaSqFt = idealKw * 100;
  const hasEnoughRoofSpace = input.availableRoofAreaSqFt >= requiredAreaSqFt;

  // If roof area is constrained, adjust capacity downwards
  let finalKw = idealKw;
  if (!hasEnoughRoofSpace && input.availableRoofAreaSqFt >= 80) {
    finalKw = Math.max(1, Math.floor(input.availableRoofAreaSqFt / 100 * 2) / 2);
  }

  // Cost calculation based on MNRE benchmark
  const grossCost = finalKw * rules.benchmarkCostPerKwInr;

  // Central Subsidy calculation from rules.centralSubsidyTiers:
  let centralSubsidy = 0;
  if (rules.centralSubsidyTiers && rules.centralSubsidyTiers.length > 0) {
    // Sort tiers by capacityKw ascending
    const sortedTiers = [...rules.centralSubsidyTiers].sort((a, b) => a.capacityKw - b.capacityKw);
    for (const tier of sortedTiers) {
      if (finalKw >= tier.capacityKw) {
        centralSubsidy = tier.subsidyAmountInr;
      }
    }
  }
  if (rules.maxCentralSubsidyInr) {
    centralSubsidy = Math.min(centralSubsidy, rules.maxCentralSubsidyInr);
  }

  const netPayable = Math.max(0, grossCost - centralSubsidy - (rules.stateBonusInr || 0));

  // Year 1 generation & savings
  const annualGenerationYear1 = finalKw * rules.avgGenerationPerKwPerDayKwh * 365;
  const annualSavingsYear1 = annualGenerationYear1 * tariffPerKwh;

  const paybackPeriod = annualSavingsYear1 > 0 
    ? Math.round((netPayable / annualSavingsYear1) * 10) / 10 
    : 0;

  // 25-Year projection with degradation
  const yearlyData: SolarCalculatorResult['yearByYearSavings'] = [];
  let cumulative = -netPayable; // start with net capital investment
  let lifetimeGenKwh = 0;

  for (let yr = 1; yr <= rules.systemLifespanYears; yr++) {
    const degradationMultiplier = Math.pow(1 - (rules.annualDegradationPercent / 100), yr - 1);
    const yrGen = Math.round(annualGenerationYear1 * degradationMultiplier);
    lifetimeGenKwh += yrGen;
    const yrSavings = Math.round(yrGen * tariffPerKwh);
    cumulative += yrSavings;

    yearlyData.push({
      year: yr,
      generationKwh: yrGen,
      savingsInr: yrSavings,
      cumulativeSavingsInr: Math.round(cumulative)
    });
  }

  const lifetime25YrSavings = Math.round(cumulative);
  // Lifetime CO2 offset = Total kWh produced * grid factor / 1000 kg per tonne
  const lifetimeCo2Tonnes = Math.round((lifetimeGenKwh * gridCo2PerKwh / 1000) * 10) / 10;

  return {
    recommendedCapacityKw: finalKw,
    requiredRoofAreaSqFt: finalKw * 100,
    hasEnoughRoofSpace,
    estAnnualGenerationKwh: Math.round(annualGenerationYear1),
    grossSystemCostInr: grossCost,
    pmSuryaGharSubsidyInr: centralSubsidy,
    netPayableInr: netPayable,
    estimatedAnnualSavingsInr: Math.round(annualSavingsYear1),
    simplePaybackPeriodYears: paybackPeriod,
    lifetime25YrSavingsInr: lifetime25YrSavings,
    lifetimeCo2OffsetTonnes: lifetimeCo2Tonnes,
    yearByYearSavings: yearlyData
  };
}
