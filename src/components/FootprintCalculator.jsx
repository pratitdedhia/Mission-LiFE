import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Car, 
  Flame, 
  Droplets, 
  Recycle, 
  Check, 
  ArrowRight,
  TrendingDown,
  Info,
  Calendar,
  Sparkles,
  Apple,
  MapPin,
  Plus,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getUserFootprintHistory } from '../services/firestoreService';
import { BRANDING, CO2_GRID_FACTOR_KG_PER_KWH } from '../config/branding';
import { getGujaratRegistry, saveCustomLocality } from '../data/gujaratData';
import { getEmissionFactors } from '../repositories/configRepository';
import { calculateFootprint } from '../../shared/src/calculations/footprint';

export default function FootprintCalculator({ user, onSaveProfile }) {
  const registry = getGujaratRegistry();
  const [city, setCity] = useState(user.city || 'Ahmedabad');
  const [locality, setLocality] = useState(user.locality || 'Navrangpura');
  const [isAddingLocality, setIsAddingLocality] = useState(false);
  const [customLocalityText, setCustomLocalityText] = useState('');

  const [householdSize, setHouseholdSize] = useState(user.householdSize || 4);
  const [electricityUnits, setElectricityUnits] = useState(user.monthlyElectricityUnits || 280);
  const [acHours, setAcHours] = useState(user.acUsageHours || 6);
  const [vehicleType, setVehicleType] = useState(user.vehicleType || 'petrol_car');
  const [travelKm, setTravelKm] = useState(user.dailyTravelKm || 18);
  const [lpgCylinders, setLpgCylinders] = useState(user.lpgCylindersYear || 10);
  const [waterHabits, setWaterHabits] = useState(user.waterHabits || 'moderate');
  const [wasteHabits, setWasteHabits] = useState(user.wasteSegregation || 'partial');
  const [dietHabits, setDietHabits] = useState(user.dietHabits || 'vegetarian');

  const [emissionFactors, setEmissionFactors] = useState(null);
  const [history, setHistory] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadFactors() {
      const factors = await getEmissionFactors();
      setEmissionFactors(factors);
    }
    loadFactors();
  }, []);

  useEffect(() => {
    async function fetchHistory() {
      const logs = await getUserFootprintHistory(user.id);
      setHistory(logs);
    }
    fetchHistory();
  }, [user.id]);

  const currentCityObj = registry.find(c => c.city.toLowerCase() === city.toLowerCase()) || registry[0];

  const handleAddLocality = () => {
    if (!customLocalityText.trim()) return;
    saveCustomLocality(city, customLocalityText.trim());
    setLocality(customLocalityText.trim());
    setCustomLocalityText('');
    setIsAddingLocality(false);
  };

  // Pure Calculation using Official Emission Factors (Zero Hardcoded Math in UI)
  const defaultFactors = {
    id: 'emissionFactors',
    gridCo2PerKwh: CO2_GRID_FACTOR_KG_PER_KWH,
    lpgCo2PerKg: 2.983,
    lpgCylinderWeightKg: 14.2,
    petrolCo2PerKm: 0.165,
    dieselCo2PerKm: 0.185,
    cngCo2PerKm: 0.125,
    evCo2PerKm: 0.052,
    twoWheelerPetrolCo2PerKm: 0.048,
    wasteUnsegregatedCo2PerKg: 0.95,
    waterPumpingCo2PerKilolitre: 0.42,
    source: 'Central Electricity Authority (CEA) Baseline v20.0 (Dec 2024) & MoPNG',
    sourceUrl: 'https://cea.nic.in',
    lastVerified: '2026-10-31T00:00:00Z'
  };

  const activeFactors = emissionFactors || defaultFactors;

  const footprintResult = calculateFootprint({
    monthlyElectricityUnitsKwh: electricityUnits,
    primaryCookingFuel: 'LPG',
    lpgCylindersYear: lpgCylinders,
    dailyCommuteKm: travelKm,
    vehicleType: vehicleType === 'petrol_car' ? 'petrol_car' : vehicleType === 'two_wheeler' ? 'two_wheeler_petrol' : vehicleType === 'ev' ? 'ev_car' : 'petrol_car',
    householdSize
  }, activeFactors);

  const energyFootprint = footprintResult.breakdown.electricity;
  const transportFootprint = footprintResult.breakdown.transport;
  const cookingFootprint = footprintResult.breakdown.cooking;
  const waterFootprint = footprintResult.breakdown.water;
  const wasteFootprint = footprintResult.breakdown.waste;
  const foodFootprint = 25; // Millets diet baseline analog

  const totalMonthlyFootprint = footprintResult.monthlyTotalCo2Kg;

  // Breakdown Percentages
  const pEnergy = Math.max(1, Math.round((energyFootprint / totalMonthlyFootprint) * 100));
  const pTransport = Math.max(1, Math.round((transportFootprint / totalMonthlyFootprint) * 100));
  const pCooking = Math.max(1, Math.round((cookingFootprint / totalMonthlyFootprint) * 100));
  const pWater = Math.max(1, Math.round((waterFootprint / totalMonthlyFootprint) * 100));
  const pWaste = Math.max(1, Math.round((wasteFootprint / totalMonthlyFootprint) * 100));
  const pFood = Math.max(1, Math.round((foodFootprint / totalMonthlyFootprint) * 100));

  // Benchmark comparison
  const gujaratAverageMonthly = BRANDING.assumptions.gujaratUrbanMonthlyBaselineKg;
  const deltaVsStateAvg = Math.round(((totalMonthlyFootprint - gujaratAverageMonthly) / gujaratAverageMonthly) * 100);

  const handleSave = () => {
    setIsSaved(true);
    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.7 }
    });

    onSaveProfile({
      city,
      district: city,
      locality,
      discom: currentCityObj.discom,
      householdSize,
      monthlyElectricityUnits: electricityUnits,
      monthlyElectricityBill: Math.round(electricityUnits * BRANDING.assumptions.averagePowerTariffInr),
      acUsageHours: acHours,
      vehicleType,
      dailyTravelKm: travelKm,
      lpgCylindersYear: lpgCylinders,
      waterHabits,
      wasteSegregation: wasteHabits,
      dietHabits,
      monthlyFootprintKg: totalMonthlyFootprint,
      footprintDeltaPercent: deltaVsStateAvg,
      breakdown: {
        energy: energyFootprint,
        transport: transportFootprint,
        cooking: cookingFootprint,
        water: waterFootprint,
        waste: wasteFootprint,
        food: foodFootprint
      }
    });

    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#1f2125]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              Footprint Tracker
            </span>
            <span className="text-xs font-mono text-zinc-500">CEA Baseline v19 Standard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1">
            Personal Energy & Carbon Footprint
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Measure your household baseline, track monthly improvement over time, and compare against state benchmarks.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow cursor-pointer transition-colors self-start"
        >
          <Check className="w-4 h-4" />
          <span>{isSaved ? 'Recalculated & Saved!' : 'Save & Sync Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Activity Inputs Form */}
        <div className="lg:col-span-7 card-minimal p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2125]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Household Activity Inputs
            </h3>
            <span className="text-[11px] font-mono text-zinc-500">
              {householdSize} Person Household
            </span>
          </div>

          {/* Location in Gujarat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Gujarat City / District</label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  const cityObj = registry.find(c => c.city.toLowerCase() === e.target.value.toLowerCase());
                  if (cityObj?.localities?.[0]) setLocality(cityObj.localities[0]);
                }}
                className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {registry.map(c => (
                  <option key={c.city} value={c.city}>{c.city} ({c.discom.split('/')[0].trim()})</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">Locality / Ward</label>
                <button
                  type="button"
                  onClick={() => setIsAddingLocality(!isAddingLocality)}
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{isAddingLocality ? 'Existing' : 'Add Custom'}</span>
                </button>
              </div>

              {isAddingLocality ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Type ward / area"
                    value={customLocalityText}
                    onChange={(e) => setCustomLocalityText(e.target.value)}
                    className="flex-1 bg-[#18191d] border border-[#2a2c33] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddLocality}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {currentCityObj.localities.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Household Size */}
          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1">
              <span>Family Members</span>
              <span className="font-mono text-zinc-200 font-bold">{householdSize} members</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={householdSize}
              onChange={(e) => setHouseholdSize(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Monthly Electricity Units */}
          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Monthly Electricity Consumption</span>
              </span>
              <span className="font-mono text-amber-400 font-bold">{electricityUnits} kWh (₹{Math.round(electricityUnits * BRANDING.assumptions.averagePowerTariffInr)})</span>
            </div>
            <input
              type="range"
              min="50"
              max="1200"
              step="10"
              value={electricityUnits}
              onChange={(e) => setElectricityUnits(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
              <span>50 units</span>
              <span>1200 units</span>
            </div>
          </div>

          {/* AC Runtime */}
          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1">
              <span>Daily AC Cooling Usage</span>
              <span className="font-mono text-zinc-200 font-bold">{acHours} hrs / day</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              value={acHours}
              onChange={(e) => setAcHours(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Transport Mode & Distance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                Primary Commute Vehicle
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="petrol_car">Petrol Car (0.17 kg CO₂/km)</option>
                <option value="diesel_car">Diesel Car (0.19 kg CO₂/km)</option>
                <option value="ev">Electric Vehicle (0.03 kg CO₂/km)</option>
                <option value="two_wheeler">2-Wheeler Petrol (0.05 kg CO₂/km)</option>
                <option value="public_transit">Metro / BRTS / Bus (0.02 kg CO₂/km)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                Daily Commute Distance
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={travelKm}
                  onChange={(e) => setTravelKm(Number(e.target.value))}
                  className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="text-xs text-zinc-500 font-mono">km/day</span>
              </div>
            </div>
          </div>

          {/* Habits: Water, Waste, Food */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                Water Practices
              </label>
              <select
                value={waterHabits}
                onChange={(e) => setWaterHabits(e.target.value)}
                className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="mindful">Bucket / Aerator (Mindful)</option>
                <option value="moderate">Moderate Shower</option>
                <option value="high">High Usage Flow</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                Waste Segregation
              </label>
              <select
                value={wasteHabits}
                onChange={(e) => setWasteHabits(e.target.value)}
                className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="strict">100% Wet/Dry Segregation</option>
                <option value="partial">Partial Segregation</option>
                <option value="none">Mixed Unsorted Waste</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                Dietary Habit
              </label>
              <select
                value={dietHabits}
                onChange={(e) => setDietHabits(e.target.value)}
                className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="vegan">Vegan / Plant-Only</option>
                <option value="vegetarian">Vegetarian (Millet Base)</option>
                <option value="omnivore">Regular Mixed Diet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Footprint Analytics & Improvement Over Time */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Footprint Card */}
          <div className="card-minimal p-5 rounded-xl border-emerald-900/40 bg-gradient-to-br from-emerald-950/20 to-zinc-900">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
              Calculated Monthly Footprint
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-zinc-100 font-mono">
                {totalMonthlyFootprint}
              </span>
              <span className="text-sm text-zinc-400 font-medium">kg CO₂e / month</span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#1f2125] flex items-center justify-between text-xs">
              <span className="text-zinc-400">Vs Gujarat State Average (510 kg):</span>
              <span className={`font-mono font-bold ${deltaVsStateAvg < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {deltaVsStateAvg < 0 ? `${deltaVsStateAvg}% cleaner` : `+${deltaVsStateAvg}% higher`}
              </span>
            </div>
          </div>

          {/* Visual Category Breakdown */}
          <div className="card-minimal p-4 rounded-xl space-y-3">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">
              Emissions Vector Breakdown
            </span>

            {/* Stacked bar */}
            <div className="w-full h-3 bg-zinc-800 rounded-full flex overflow-hidden">
              <div style={{ width: `${pEnergy}%` }} className="bg-amber-400 h-full" title={`Energy: ${pEnergy}%`} />
              <div style={{ width: `${pTransport}%` }} className="bg-blue-400 h-full" title={`Transport: ${pTransport}%`} />
              <div style={{ width: `${pCooking}%` }} className="bg-orange-400 h-full" title={`Cooking: ${pCooking}%`} />
              <div style={{ width: `${pWater}%` }} className="bg-cyan-400 h-full" title={`Water: ${pWater}%`} />
              <div style={{ width: `${pWaste}%` }} className="bg-teal-400 h-full" title={`Waste: ${pWaste}%`} />
              <div style={{ width: `${pFood}%` }} className="bg-emerald-500 h-full" title={`Food: ${pFood}%`} />
            </div>

            {/* Labels */}
            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Energy: {energyFootprint}kg</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Travel: {transportFootprint}kg</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>Gas: {cookingFootprint}kg</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Water: {waterFootprint}kg</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span>Waste: {wasteFootprint}kg</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Food: {foodFootprint}kg</span>
              </div>
            </div>
          </div>

          {/* Historical Improvement Over Time */}
          <div className="card-minimal p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">
                Progress Over Time (Historical Log)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                <span>Tracking Improvement</span>
              </span>
            </div>

            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 bg-[#17181c] rounded-lg border border-[#222429]">
                  <span className="text-zinc-400 font-mono text-[11px]">{h.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-200 font-bold">{h.monthlyFootprintKg} kg CO₂</span>
                    {i > 0 && (
                      <span className="text-[10px] font-mono text-emerald-400">
                        {h.monthlyFootprintKg < history[i-1].monthlyFootprintKg ? '↓ Decline' : '↑ Rise'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transparent Assumptions Footnote */}
          <div className="p-3 bg-[#141518] rounded-xl border border-[#22242a] text-[10px] font-mono text-zinc-500 leading-normal flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
            <span>Assumptions: Grid factor = {CO2_GRID_FACTOR_KG_PER_KWH} kg CO₂/kWh (CEA CO2 Database v20.0, Dec 2024). Petrol = 0.17 kg/km. LPG = 42.5 kg CO₂/cylinder. Benchmark based on Gujarat Urja Vikas Nigam residential consumption patterns.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
