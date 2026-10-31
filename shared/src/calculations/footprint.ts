import type { EmissionFactors } from '../schemas/config';

export interface FootprintInput {
  monthlyElectricityUnitsKwh: number;
  primaryCookingFuel: 'LPG' | 'PNG' | 'INDUCTION';
  lpgCylindersYear: number;
  dailyCommuteKm: number;
  vehicleType: 'petrol_car' | 'diesel_car' | 'cng_car' | 'ev_car' | 'two_wheeler_petrol' | 'two_wheeler_ev' | 'public_transport';
  householdSize: number;
}

export interface FootprintResult {
  monthlyTotalCo2Kg: number;
  annualTotalCo2Kg: number;
  perCapitaMonthlyCo2Kg: number;
  breakdown: {
    electricity: number;
    transport: number;
    cooking: number;
    waste: number;
    water: number;
  };
  treesEquivalentToOffset: number;
  kmEquivalentPetrolCar: number;
}

/**
 * Pure calculation engine for residential household carbon footprint.
 * Grounded in CEA CO2 baseline database and standard Indian emission factors.
 */
export function calculateFootprint(
  input: FootprintInput,
  factors: EmissionFactors
): FootprintResult {
  // 1. Electricity Emissions (Grid emission factor from CEA)
  const electricityCo2Kg = Math.max(0, input.monthlyElectricityUnitsKwh * factors.gridCo2PerKwh);

  // 2. Cooking Emissions
  let cookingCo2Kg = 0;
  if (input.primaryCookingFuel === 'LPG') {
    // 14.2 kg LPG cylinder * factors.lpgCo2PerKg / 12 months
    const cylindersPerMonth = input.lpgCylindersYear / 12;
    cookingCo2Kg = cylindersPerMonth * factors.lpgCylinderWeightKg * factors.lpgCo2PerKg;
  } else if (input.primaryCookingFuel === 'PNG') {
    // Standard domestic PNG analog (~1.9 kg CO2 per SCM, typical 15 SCM/mo)
    cookingCo2Kg = 15 * 1.9;
  } else {
    // Induction cooking is already captured in electricity units
    cookingCo2Kg = 0;
  }

  // 3. Transport Emissions
  let transportFactor = factors.twoWheelerPetrolCo2PerKm;
  switch (input.vehicleType) {
    case 'petrol_car':
      transportFactor = factors.petrolCo2PerKm;
      break;
    case 'diesel_car':
      transportFactor = factors.dieselCo2PerKm;
      break;
    case 'cng_car':
      transportFactor = factors.cngCo2PerKm;
      break;
    case 'ev_car':
      transportFactor = factors.evCo2PerKm;
      break;
    case 'two_wheeler_petrol':
      transportFactor = factors.twoWheelerPetrolCo2PerKm;
      break;
    case 'two_wheeler_ev':
      transportFactor = factors.evCo2PerKm * 0.4; // 2-wheeler EV uses ~40% energy of 4-wheeler
      break;
    case 'public_transport':
      transportFactor = 0.04; // Bus / Metro per passenger-km
      break;
  }
  const monthlyTravelKm = input.dailyCommuteKm * 30;
  const transportCo2Kg = monthlyTravelKm * transportFactor;

  // 4. Waste & Water baseline for Gujarat domestic households
  // Average urban Gujarat resident generates ~0.45 kg waste/day and 135 L water/day
  const occupants = Math.max(1, input.householdSize);
  const monthlyWasteKg = occupants * 0.45 * 30;
  const wasteCo2Kg = monthlyWasteKg * factors.wasteUnsegregatedCo2PerKg;

  const monthlyWaterKilolitres = (occupants * 135 * 30) / 1000;
  const waterCo2Kg = monthlyWaterKilolitres * factors.waterPumpingCo2PerKilolitre;

  const monthlyTotal = Math.round((electricityCo2Kg + transportCo2Kg + cookingCo2Kg + wasteCo2Kg + waterCo2Kg) * 10) / 10;
  const annualTotal = Math.round(monthlyTotal * 12);
  const perCapitaMonthly = Math.round((monthlyTotal / occupants) * 10) / 10;

  // Equivalencies:
  // 1 mature Neem / Peepal tree in Gujarat absorbs approx 20 kg CO2 / year = 1.67 kg / month
  const treesEquivalent = Math.round((monthlyTotal / 1.67) * 10) / 10;
  // Km in standard petrol car (using factors.petrolCo2PerKm)
  const kmPetrolEquivalent = Math.round(monthlyTotal / factors.petrolCo2PerKm);

  return {
    monthlyTotalCo2Kg: monthlyTotal,
    annualTotalCo2Kg: annualTotal,
    perCapitaMonthlyCo2Kg: perCapitaMonthly,
    breakdown: {
      electricity: Math.round(electricityCo2Kg * 10) / 10,
      transport: Math.round(transportCo2Kg * 10) / 10,
      cooking: Math.round(cookingCo2Kg * 10) / 10,
      waste: Math.round(wasteCo2Kg * 10) / 10,
      water: Math.round(waterCo2Kg * 10) / 10
    },
    treesEquivalentToOffset: treesEquivalent,
    kmEquivalentPetrolCar: kmPetrolEquivalent
  };
}

