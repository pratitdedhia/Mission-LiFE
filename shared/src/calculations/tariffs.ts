import type { DiscomTariff } from '../schemas/config';

export interface PeakShiftSimulationInput {
  appliancePowerWatts: number; // e.g. 1500W for washing machine / geyser
  durationHours: number; // e.g. 1.5 hours
  scheduledHour: number; // 0 to 23
}

export interface PeakShiftSimulationResult {
  isPeakHour: boolean;
  isOffPeakHour: boolean;
  standardCostInr: number;
  actualCostInr: number;
  savingsIfShiftedToOffPeakInr: number;
  co2SavedIfShiftedKg: number;
  recommendationKey: string;
}

/**
 * Evaluates domestic peak load shifting benefits against Gujarat DISCOM ToD tariff orders.
 */
export function simulatePeakShift(
  input: PeakShiftSimulationInput,
  tariff: DiscomTariff,
  baseTariffRate: number = 6.20,
  gridCo2Factor: number = 0.82
): PeakShiftSimulationResult {
  const unitsKwh = (input.appliancePowerWatts * input.durationHours) / 1000;
  const isPeak = tariff.peakHours.includes(input.scheduledHour);
  const isOffPeak = tariff.offPeakHours.includes(input.scheduledHour);

  const standardCost = unitsKwh * baseTariffRate;

  let actualRate = baseTariffRate;
  if (isPeak) {
    actualRate = baseTariffRate * tariff.peakRateMultiplier;
  } else if (isOffPeak) {
    actualRate = baseTariffRate * (1 - tariff.offPeakRateDiscount);
  }

  const actualCost = Math.round(unitsKwh * actualRate * 100) / 100;

  // Off-peak cost
  const offPeakRate = baseTariffRate * (1 - tariff.offPeakRateDiscount);
  const offPeakCost = unitsKwh * offPeakRate;

  const savingsIfShifted = isPeak ? Math.max(0, Math.round((actualCost - offPeakCost) * 100) / 100) : 0;
  // Shifting away from thermal peaker plants saves ~0.15 kg CO2 per unit deferral
  const co2Avoided = isPeak ? Math.round(unitsKwh * 0.15 * 100) / 100 : 0;

  let recommendation = 'tariffs.normal';
  if (isPeak) {
    recommendation = 'tariffs.shiftPeak';
  } else if (isOffPeak) {
    recommendation = 'tariffs.optimalGreen';
  }

  return {
    isPeakHour: isPeak,
    isOffPeakHour: isOffPeak,
    standardCostInr: Math.round(standardCost * 100) / 100,
    actualCostInr: actualCost,
    savingsIfShiftedToOffPeakInr: savingsIfShifted,
    co2SavedIfShiftedKg: co2Avoided,
    recommendationKey: recommendation
  };
}

