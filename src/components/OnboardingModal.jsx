import React, { useState } from 'react';
import { 
  Leaf, 
  MapPin, 
  Zap, 
  Car, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  X,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BRANDING } from '../config/branding';
import { getGujaratRegistry, saveCustomLocality } from '../data/gujaratData';

export default function OnboardingModal({ isOpen, onClose, onBaselineComplete, initialUser }) {
  const [step, setStep] = useState(1);
  const registry = getGujaratRegistry();

  // Form State
  const [name, setName] = useState(initialUser?.name || 'Pooja Patel');
  const [selectedCity, setSelectedCity] = useState(initialUser?.city || 'Ahmedabad');
  const [locality, setLocality] = useState(initialUser?.locality || 'Navrangpura');
  const [isAddingLocality, setIsAddingLocality] = useState(false);
  const [customLocalityText, setCustomLocalityText] = useState('');
  const [familyMembers, setFamilyMembers] = useState(initialUser?.householdSize || 4);
  const [monthlyUnits, setMonthlyUnits] = useState(initialUser?.monthlyElectricityUnits || 280);
  const [acHours, setAcHours] = useState(initialUser?.acUsageHours || 6);
  const [vehicle, setVehicle] = useState(initialUser?.vehicleType || 'petrol_car');
  const [dailyKm, setDailyKm] = useState(initialUser?.dailyTravelKm || 16);

  if (!isOpen) return null;

  const currentCityObj = registry.find(c => c.city.toLowerCase() === selectedCity.toLowerCase()) || registry[0];

  const handleAddLocality = () => {
    if (!customLocalityText.trim()) return;
    saveCustomLocality(selectedCity, customLocalityText.trim());
    setLocality(customLocalityText.trim());
    setCustomLocalityText('');
    setIsAddingLocality(false);
  };

  // Calculations
  const energyFootprint = Math.round((monthlyUnits * BRANDING.assumptions.gridEmissionFactorKgPerKwh) + (acHours * 1.1 * 30 * 0.12));
  const transportFactor = { petrol_car: 0.17, diesel_car: 0.19, two_wheeler: 0.05, ev: 0.03, public_transit: 0.02 }[vehicle] || 0.15;
  const transportFootprint = Math.round(dailyKm * 30 * transportFactor);
  const otherFootprint = Math.round(38 + (24 * (familyMembers / 2)));
  const totalMonthlyKg = energyFootprint + transportFootprint + otherFootprint;

  const handleFinish = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    onBaselineComplete({
      name: name.trim() || 'Citizen',
      city: selectedCity,
      district: selectedCity,
      locality: locality,
      discom: currentCityObj.discom,
      householdSize: familyMembers,
      monthlyElectricityUnits: monthlyUnits,
      monthlyElectricityBill: Math.round(monthlyUnits * BRANDING.assumptions.averagePowerTariffInr),
      acUsageHours: acHours,
      vehicleType: vehicle,
      dailyTravelKm: dailyKm,
      monthlyFootprintKg: totalMonthlyKg,
      breakdown: {
        energy: energyFootprint,
        transport: transportFootprint,
        cooking: 38,
        water: 24,
        waste: 24
      },
      hasCompletedOnboarding: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-6">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
        </div>

        {/* STEP 1: Gujarat Location & Household */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                Step 1 of 3: Gujarat Location
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2.5">
                Welcome to {BRANDING.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {BRANDING.promise}
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pooja Patel"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Gujarat City / District</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      const cityObj = registry.find(c => c.city.toLowerCase() === e.target.value.toLowerCase());
                      if (cityObj?.localities?.[0]) setLocality(cityObj.localities[0]);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                  >
                    {registry.map(c => (
                      <option key={c.city} value={c.city}>{c.city} ({c.discom.split('/')[0].trim()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Locality / Ward</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingLocality(!isAddingLocality)}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isAddingLocality ? 'Select Existing' : 'Add Custom'}</span>
                    </button>
                  </div>

                  {isAddingLocality ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type ward/area"
                        value={customLocalityText}
                        onChange={(e) => setCustomLocalityText(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddLocality}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                    >
                      {currentCityObj.localities.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Household Size (Family Members)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{familyMembers} persons</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={familyMembers}
                  onChange={(e) => setFamilyMembers(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-[0.99]"
            >
              <span>Continue to Energy Baseline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Energy & Commute Baseline */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                Step 2 of 3: Energy & Mobility Baseline
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2.5">
                Your Monthly Consumption Habits
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Calibrates your baseline against Gujarat Urja Vikas Nigam (GUVNL) published average tariffs.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Monthly Electricity Consumption</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{monthlyUnits} kWh (units)</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="1000"
                  step="10"
                  value={monthlyUnits}
                  onChange={(e) => setMonthlyUnits(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>Est. Bill: ₹{Math.round(monthlyUnits * BRANDING.assumptions.averagePowerTariffInr)}/mo</span>
                  <span>1000 units</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Daily AC Runtime during Warm Months</span>
                  <span className="font-bold text-slate-900 dark:text-white">{acHours} hours/day</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Primary Commute</label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="petrol_car">Petrol Car</option>
                    <option value="diesel_car">Diesel Car</option>
                    <option value="ev">Electric Vehicle (EV)</option>
                    <option value="two_wheeler">2-Wheeler (Petrol)</option>
                    <option value="public_transit">Metro / BRTS / Bus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Daily Roundtrip Distance</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={dailyKm}
                      onChange={(e) => setDailyKm(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-400 font-mono">km</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
              >
                <span>Calculate Baseline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Transparent Baseline & First Mission */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                Step 3 of 3: Your LiFE+ Baseline
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2.5">
                Baseline Established, {name}!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Here is your transparent emissions profile and companion starting points.
              </p>
            </div>

            {/* Calculated Card */}
            <div className="human-card p-5 border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Monthly Carbon Baseline</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">Starting Score: 700 pts</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{totalMonthlyKg}</span>
                <span className="text-sm text-slate-500 font-medium">kg CO₂e / month</span>
              </div>

              {/* Assumptions Box */}
              <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-normal">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 mb-1">
                  <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Calculation Basis (Central Electricity Authority v19):</span>
                </div>
                <span>Electricity: {monthlyUnits} kWh × {BRANDING.assumptions.gridEmissionFactorKgPerKwh} kg/kWh = {energyFootprint} kg CO₂ | Travel: {dailyKm * 30} km/mo × {transportFactor} = {transportFootprint} kg CO₂.</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">First Tailored Challenge Ready:</span>
                <span className="text-xs text-slate-600 dark:text-slate-300">"AC Eco-Set 26°C" will avoid ~0.85 kg CO₂ today and lower your peak power bill.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Enter LiFE+ Companion</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
