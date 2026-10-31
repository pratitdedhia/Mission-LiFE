import type { SubsidyRules } from '../schemas/config';

export interface SolarCalculatorInput {
  monthlyBillInr: number;
  availableRoofAreaSqFt: number;
  discomTariffPerKwh?: number; // defaults to typical Gujarat slab Rs 6.50
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
 */
export function calculateSolarFeasibility(
  input: SolarCalculatorInput,
  rules: SubsidyRules,
  gridCo2PerKwh: number = 0.82
): SolarCalculatorResult {
  const tariffPerKwh = input.discomTariffPerKwh || 6.50;
  // Estimate monthly units from bill
  const monthlyUnitsKwh = input.monthlyBillInr / tariffPerKwh;
  const dailyUnitsNeeded = monthlyUnitsKwh / 30;

  // 1 kW rooftop solar in Gujarat produces approx 4.3 kWh/day (300 sunny days)
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

  // Central Subsidy calculation (PM Surya Ghar scheme rules):
  // 1 kW: Rs 30,000 | 2 kW: Rs 60,000 | 3 kW and above: Rs 78,000 max
  let centralSubsidy = 0;
  if (finalKw <= 1) {
    centralSubsidy = 30000;
  } else if (finalKw <= 2) {
    centralSubsidy = 60000;
  } else {
    centralSubsidy = rules.maxCentralSubsidyInr; // 78,000 max
  }

  const netPayable = Math.max(0, grossCost - centralSubsidy - rules.stateBonusInr);

  // Year 1 generation & savings
  const annualGenerationYear1 = finalKw * rules.avgGenerationPerKwPerDayKwh * 365;
  const annualSavingsYear1 = annualGenerationYear1 * tariffPerKwh;

  const paybackPeriod = annualSavingsYear1 > 0 
    ? Math.round((netPayable / annualSavingsYear1) * 10) / 10 
    : 0;

  // 25-Year projection with degradation (0.7% annual degradation)
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
  // Lifetime CO2 offset = Total kWh produced * CEA grid factor / 1000 kg per tonne
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

