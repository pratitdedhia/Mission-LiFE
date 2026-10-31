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
  Apple
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getUserFootprintHistory } from '../services/firestoreService';

export default function FootprintCalculator({ user, onSaveProfile }) {
  const [householdSize, setHouseholdSize] = useState(user.householdSize || 4);
  const [electricityUnits, setElectricityUnits] = useState(user.monthlyElectricityUnits || 280);
  const [acHours, setAcHours] = useState(user.acUsageHours || 6);
  const [vehicleType, setVehicleType] = useState(user.vehicleType || 'petrol_car');
  const [travelKm, setTravelKm] = useState(user.dailyTravelKm || 18);
  const [lpgCylinders, setLpgCylinders] = useState(user.lpgCylindersYear || 10);
  const [waterHabits, setWaterHabits] = useState(user.waterHabits || 'moderate');
  const [wasteHabits, setWasteHabits] = useState(user.wasteSegregation || 'partial');
  const [dietHabits, setDietHabits] = useState(user.dietHabits || 'vegetarian');

  const [history, setHistory] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      const logs = await getUserFootprintHistory(user.id);
      setHistory(logs);
    }
    fetchHistory();
  }, [user.id]);

  // Scientific Emissions Calculation Factors (India Baseline)
  const energyFootprint = Math.round((electricityUnits * 0.82) + (acHours * 1.1 * 30 * 0.12));
  
  const transportFactor = {
    petrol_car: 0.17,
    diesel_car: 0.19,
    two_wheeler: 0.05,
    ev: 0.03,
    public_transit: 0.02
  }[vehicleType] || 0.15;
  const transportFootprint = Math.round(travelKm * 30 * transportFactor);

  const cookingFootprint = Math.round((lpgCylinders * 42.5) / 12);
  
  const waterFactor = { mindful: 12, moderate: 24, high: 45 }[waterHabits] || 24;
  const waterFootprint = Math.round(waterFactor * (householdSize / 2));
  
  const wasteFactor = { strict: 10, partial: 22, none: 48 }[wasteHabits] || 22;
  const wasteFootprint = Math.round(wasteFactor * (householdSize / 3));

  const foodFactor = { vegan: 15, vegetarian: 25, omnivore: 55 }[dietHabits] || 25;
  const foodFootprint = Math.round(foodFactor * (householdSize / 2));

  const totalMonthlyFootprint = energyFootprint + transportFootprint + cookingFootprint + waterFootprint + wasteFootprint + foodFootprint;

  // Breakdown Percentages
  const pEnergy = Math.max(1, Math.round((energyFootprint / totalMonthlyFootprint) * 100));
  const pTransport = Math.max(1, Math.round((transportFootprint / totalMonthlyFootprint) * 100));
  const pCooking = Math.max(1, Math.round((cookingFootprint / totalMonthlyFootprint) * 100));
  const pWater = Math.max(1, Math.round((waterFootprint / totalMonthlyFootprint) * 100));
  const pWaste = Math.max(1, Math.round((wasteFootprint / totalMonthlyFootprint) * 100));
  const pFood = Math.max(1, Math.round((foodFootprint / totalMonthlyFootprint) * 100));

  // Benchmark comparison
  const gujaratAverageMonthly = 510;
  const deltaVsStateAvg = Math.round(((totalMonthlyFootprint - gujaratAverageMonthly) / gujaratAverageMonthly) * 100);

  const handleSave = () => {
    setIsSaved(true);
    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.7 }
    });

    onSaveProfile({
      householdSize,
      monthlyElectricityUnits: electricityUnits,
      monthlyElectricityBill: Math.round(electricityUnits * 7.6),
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
            <span className="text-xs font-mono text-zinc-500">Mission LiFE Standards</span>
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
              <span className="font-mono text-amber-400 font-bold">{electricityUnits} kWh</span>
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
                <option value="petrol_car">Petrol Car</option>
                <option value="diesel_car">Diesel Car</option>
                <option value="ev">Electric Vehicle (EV)</option>
                <option value="two_wheeler">2-Wheeler (Petrol)</option>
                <option value="public_transit">Metro / BRTS / Bus</option>
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
              Total Monthly Footprint
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-zinc-100 font-mono">
                {totalMonthlyFootprint}
              </span>
              <span className="text-sm text-zinc-400 font-medium">kg CO₂e / month</span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#1f2125] flex items-center justify-between text-xs">
              <span className="text-zinc-400">Vs Gujarat State Average:</span>
              <span className={`font-mono font-bold ${deltaVsStateAvg < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {deltaVsStateAvg < 0 ? `${deltaVsStateAvg}% cleaner` : `+${deltaVsStateAvg}% higher`}
              </span>
            </div>
          </div>

          {/* Visual Category Breakdown */}
          <div className="card-minimal p-4 rounded-xl space-y-3">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">
              Emissions Vector Distribution
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
                Improvement Over Time (Historical Trend)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                <span>Consistent Decline</span>
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
                        {h.monthlyFootprintKg < history[i-1].monthlyFootprintKg ? '↓' : '↑'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reduction Pathway Suggestion */}
          <div className="card-minimal p-4 rounded-xl border-amber-900/30 bg-amber-950/10 text-xs">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block mb-1">
              Top Actionable Reduction Pathway
            </span>
            <p className="text-zinc-300 leading-relaxed">
              {pEnergy > 45 ? (
                <>Your home electricity represents <strong>{pEnergy}%</strong> of emissions. Installing a 3 kW Rooftop Solar system can neutralize <strong>~220 kg CO₂e/month</strong> and cut your bill by 90%.</>
              ) : (
                <>Shifting 2 days of personal car commute to active cycling or BRTS will reduce your transport footprint by <strong>~35 kg CO₂e/month</strong>.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
