import React, { useState } from 'react';
import { 
  Zap, 
  Car, 
  Droplets, 
  Recycle, 
  ArrowRight, 
  Check, 
  Flame,
  ArrowUpRight,
  Sun,
  ShieldCheck,
  AlertTriangle,
  Award,
  Sparkles,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TRANSLATIONS, GRID_HOURS } from '../data/initialData';
import PhotoProofModal from './PhotoProofModal';

export default function Dashboard({ 
  user, 
  community, 
  lang, 
  onAcceptMission, 
  onNavigate,
  onOpenAiRecommendation,
  onOpenPledge 
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [activeProofMission, setActiveProofMission] = useState(null);

  // Determine current grid hour status (IST)
  const currentHour = new Date().getHours();
  const isPeakHour = GRID_HOURS.peakHours.includes(currentHour);
  const isOffPeak = GRID_HOURS.offPeakHours.includes(currentHour);

  const isAcDone = user.completedMissions?.includes('ac_warrior');
  const isPeakShifterDone = user.completedMissions?.includes('peak_shifter');

  const handleAcClick = () => {
    if (!isAcDone) {
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.7 }
      });
      onAcceptMission('ac_warrior', 50, 0.85);
    }
  };

  const featuredMission = {
    id: "ac_warrior",
    title: "AC Eco-Set 26°C Challenge",
    theme: "energy",
    points: 50,
    co2Kg: 0.85,
    description: "Keep AC set to 26°C with ceiling fan on low. Eases Gujarat grid strain during peak hours.",
    requiresProof: false
  };

  const progressPercent = Math.min(
    100,
    Math.round((community.co2SavedKg / community.co2TargetKg) * 100)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Real-Time Smart Grid Load Nudge Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isPeakHour 
          ? 'bg-rose-950/20 border-rose-800/40 text-rose-200' 
          : isOffPeak 
          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
          : 'bg-[#15171c] border-[#262933] text-zinc-300'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isPeakHour ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                {isPeakHour ? '🔴 Peak Grid Hours (18:00 - 22:00)' : isOffPeak ? '🟢 Green Off-Peak Hours Active' : '⚡ Gujarat DISCOM Grid Status'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-800 rounded text-zinc-400">
                ToD Tariff
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
              {isPeakHour 
                ? 'High grid demand in Gujarat. Defer dishwashers, washing machines, and EV charging until after 10 PM to avoid coal thermal peaker plants.'
                : 'Favorable green power available on the grid. Ideal window to charge EVs and run domestic pump loads at lower off-peak tariff.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('missions')}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold whitespace-nowrap self-end sm:self-auto transition-colors cursor-pointer"
        >
          View Grid Micro-Tasks →
        </button>
      </div>

      {/* Citizen Header Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1f2125]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              Citizen Dashboard
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {user.district || user.city || 'Ahmedabad'}, Gujarat
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
            {t.goodEvening}, {user.name}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Operationalising sustainable daily practices for measurable carbon and energy reduction.
          </p>
        </div>

        {/* Key Metrics Strip */}
        <div className="flex items-center gap-2.5">
          <div className="card-minimal px-3.5 py-2 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">LiFE Score</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-zinc-100 font-mono">{user.lifeScore}</span>
              <span className="text-[11px] text-emerald-400 font-medium">+{user.scoreTodayDelta}</span>
            </div>
          </div>

          <div className="card-minimal px-3.5 py-2 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Monthly CO₂</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-zinc-100 font-mono">{user.monthlyFootprintKg}</span>
              <span className="text-[11px] text-zinc-500">kg</span>
            </div>
          </div>

          <div className="card-minimal px-3.5 py-2 rounded-xl hidden sm:block">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Streak</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-emerald-400 font-mono">{user.streak}</span>
              <span className="text-[11px] text-zinc-500">days 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Vector Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Energy */}
        <div 
          onClick={() => onNavigate('footprint')} 
          className="card-minimal p-4 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Electricity & AC</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {Math.round((user.breakdown?.energy / user.monthlyFootprintKg) * 100)}%
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {user.breakdown?.energy || 228} <span className="text-xs font-normal text-zinc-500">kg CO₂</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-400 h-full rounded-full" 
              style={{ width: `${Math.round((user.breakdown?.energy / user.monthlyFootprintKg) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Transport */}
        <div 
          onClick={() => onNavigate('footprint')} 
          className="card-minimal p-4 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>Commute</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {Math.round((user.breakdown?.transport / user.monthlyFootprintKg) * 100)}%
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {user.breakdown?.transport || 114} <span className="text-xs font-normal text-zinc-500">kg CO₂</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-blue-400 h-full rounded-full" 
              style={{ width: `${Math.round((user.breakdown?.transport / user.monthlyFootprintKg) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Cooking & Water */}
        <div 
          onClick={() => onNavigate('footprint')} 
          className="card-minimal p-4 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Water & Cooking</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {Math.round(((user.breakdown?.water + user.breakdown?.cooking) / user.monthlyFootprintKg) * 100)}%
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {(user.breakdown?.water || 24) + (user.breakdown?.cooking || 38)} <span className="text-xs font-normal text-zinc-500">kg CO₂</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full" 
              style={{ width: `${Math.round(((user.breakdown?.water + user.breakdown?.cooking) / user.monthlyFootprintKg) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Waste & Circular */}
        <div 
          onClick={() => onNavigate('footprint')} 
          className="card-minimal p-4 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Recycle className="w-3.5 h-3.5 text-teal-400" />
              <span>Waste & Plastic</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {Math.round((user.breakdown?.waste / user.monthlyFootprintKg) * 100)}%
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {user.breakdown?.waste || 24} <span className="text-xs font-normal text-zinc-500">kg CO₂</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-teal-400 h-full rounded-full" 
              style={{ width: `${Math.round((user.breakdown?.waste / user.monthlyFootprintKg) * 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Main Feature Row: Daily Mission & Rooftop Solar Advisor Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Today's Featured Mission */}
        <div className="card-minimal p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                Today's Featured Micro-Task
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                +50 LiFE pts
              </span>
            </div>

            <h3 className="text-base font-bold text-zinc-100 mt-2">
              {featuredMission.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {featuredMission.description}
            </p>

            <div className="mt-3 p-3 bg-[#17181c] rounded-lg border border-[#23252a] flex items-center justify-between text-xs">
              <span className="text-zinc-400">Avoided Emissions:</span>
              <span className="font-mono text-emerald-400 font-semibold">-0.85 kg CO₂</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#1f2125] flex items-center justify-between">
            <button
              onClick={() => onNavigate('missions')}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>All 7 Themes</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {isAcDone ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold font-mono">
                <Check className="w-4 h-4" />
                <span>Challenge Logged</span>
              </span>
            ) : (
              <button
                onClick={handleAcClick}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark 26°C Complete</span>
              </button>
            )}
          </div>
        </div>

        {/* Solar Advisor Quick Bridge */}
        <div className="card-minimal p-5 rounded-xl flex flex-col justify-between border-amber-900/30 bg-gradient-to-br from-amber-950/15 via-zinc-900 to-zinc-900">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                PM Surya Ghar Muft Bijli
              </span>
              <span className="text-xs font-mono text-amber-300 font-semibold">
                Up to ₹78,000 Subsidy
              </span>
            </div>

            <h3 className="text-base font-bold text-zinc-100 mt-2">
              Rooftop Solar Feasibility Assessment
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Based on your monthly power consumption ({user.monthlyElectricityUnits} kWh), a 3.2 kW system can generate 100% of your power bill with a 3.4-year payback.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#17181c] p-2.5 rounded-lg border border-[#23252a]">
                <span className="text-zinc-500 text-[10px] block">Est. Bill Savings</span>
                <span className="text-emerald-400 font-mono font-bold mt-0.5 block">₹24,500 / yr</span>
              </div>
              <div className="bg-[#17181c] p-2.5 rounded-lg border border-[#23252a]">
                <span className="text-zinc-500 text-[10px] block">Central Subsidy</span>
                <span className="text-amber-400 font-mono font-bold mt-0.5 block">₹78,000 CFA</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#1f2125] flex items-center justify-between">
            <span className="text-xs text-zinc-500">GEDA Empanelled</span>
            <button
              onClick={() => onNavigate('solar')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow"
            >
              <span>Open Solar Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Community Sprint Progress & LiFE Pledge Quick CTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sprint */}
        <div className="md:col-span-2 card-minimal p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Active Campaign</span>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-200 mt-0.5">{community.activeCampaign}</h4>
            </div>
            <span className="text-base font-bold font-mono text-emerald-400">{progressPercent}%</span>
          </div>

          <div className="mt-3">
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span>{community.co2SavedKg.toLocaleString('en-IN')} kg avoided</span>
              <span>Target: {community.co2TargetKg.toLocaleString('en-IN')} kg</span>
            </div>
          </div>
        </div>

        {/* Certificate CTA */}
        <div className="card-minimal p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Award className="w-4 h-4" />
              <span>Mission LiFE Pledge</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              {user.pledgeSigned ? 'Your official digital certificate is ready for download.' : 'Sign the formal citizen pledge to generate your official GEDA certificate.'}
            </p>
          </div>

          <button
            onClick={onOpenPledge}
            className="mt-3 w-full py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors cursor-pointer text-center"
          >
            {user.pledgeSigned ? 'View Certificate' : 'Take Pledge'}
          </button>
        </div>
      </div>
    </div>
  );
}
