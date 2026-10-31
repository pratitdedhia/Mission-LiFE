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
  Camera,
  MapPin,
  Info,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TRANSLATIONS, GRID_HOURS } from '../data/initialData';
import { BRANDING } from '../config/branding';
import BehaviorLoopCard from './BehaviorLoopCard';

export default function Dashboard({ 
  user, 
  community, 
  lang, 
  onAcceptMission, 
  onCompleteMission,
  onNavigate,
  onOpenAiRecommendation,
  onOpenPledge,
  onOpenOnboarding
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Determine current grid hour status (IST)
  const currentHour = new Date().getHours();
  const isPeakHour = GRID_HOURS.peakHours.includes(currentHour);
  const isOffPeak = GRID_HOURS.offPeakHours.includes(currentHour);

  const progressPercent = Math.min(
    100,
    Math.round((community.co2SavedKg / community.co2TargetKg) * 100)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Real-Time Smart Grid Load Nudge Banner (Externally contextualized) */}
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
                {isPeakHour ? '🔴 Peak Grid Hours (18:00 - 22:00 IST)' : isOffPeak ? '🟢 Green Off-Peak Hours Active' : '⚡ Gujarat DISCOM Time-of-Day Status'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-800 rounded text-zinc-400">
                Live Grid Tariff Schedule
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
              {isPeakHour 
                ? 'Standard Gujarat DISCOM peak period. Shifting washing machines, dishwashers, and EV charging until after 10 PM cuts unit tariffs from ₹9.20 to ₹5.40 and avoids dirty coal thermal peaker generation.'
                : 'Favorable green wind and solar power prevailing on the regional grid. Optimal window to charge electric vehicles and run high-wattage pump motors at lower off-peak rates.'}
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

      {/* Citizen Header Summary & Locality */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1f2125]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              {BRANDING.name} Citizen Companion
            </span>
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{user.locality ? `${user.locality}, ` : ''}{user.city || 'Ahmedabad'}, Gujarat</span>
            </span>
            <button
              onClick={onOpenOnboarding}
              className="text-[10px] text-zinc-500 hover:text-emerald-400 font-mono underline flex items-center gap-0.5 ml-1 cursor-pointer"
              title="Recalculate baseline parameters"
            >
              <Edit3 className="w-2.5 h-2.5" />
              <span>Edit Baseline</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
            {t.goodEvening}, {user.name}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            {BRANDING.promise}
          </p>
        </div>

        {/* Key Metrics Strip */}
        <div className="flex items-center gap-2.5">
          <div className="card-minimal px-3.5 py-2 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">LiFE+ Score</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-zinc-100 font-mono">{user.lifeScore}</span>
              <span className="text-[11px] text-emerald-400 font-medium">+{user.scoreTodayDelta}</span>
            </div>
          </div>

          <div className="card-minimal px-3.5 py-2 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Monthly Footprint</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-zinc-100 font-mono">{user.monthlyFootprintKg}</span>
              <span className="text-[11px] text-zinc-500">kg CO₂</span>
            </div>
          </div>

          <div className="card-minimal px-3.5 py-2 rounded-xl hidden sm:block">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Active Streak</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-emerald-400 font-mono">{user.streak}</span>
              <span className="text-[11px] text-zinc-500">days 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE BEHAVIOR-CHANGE LOOP ENGINE CARD */}
      <BehaviorLoopCard
        user={user}
        onAcceptMission={onAcceptMission}
        onCompleteMission={onCompleteMission}
        onNavigate={onNavigate}
      />

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
              {Math.round(((user.breakdown?.energy || 228) / (user.monthlyFootprintKg || 428)) * 100)}%
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {user.breakdown?.energy || 228} <span className="text-xs font-normal text-zinc-500">kg CO₂</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-400 h-full rounded-full" 
              style={{ width: `${Math.round(((user.breakdown?.energy || 228) / (user.monthlyFootprintKg || 428)) * 100)}%` }} 
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
              {Math.round(((user.breakdown?.transport || 114) / (user.monthlyFootprintKg || 428)) * 100)}%
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {user.breakdown?.transport || 114} <span className="text-xs font-normal text-zinc-500">kg CO₂</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-blue-400 h-full rounded-full" 
              style={{ width: `${Math.round(((user.breakdown?.transport || 114) / (user.monthlyFootprintKg || 428)) * 100)}%` }} 
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
              {Math.round((((user.breakdown?.water || 24) + (user.breakdown?.cooking || 38)) / (user.monthlyFootprintKg || 428)) * 100)}%
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {(user.breakdown?.water || 24) + (user.breakdown?.cooking || 38)} <span className="text-xs font-normal text-zinc-500">kg CO₂</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full" 
              style={{ width: `${Math.round((((user.breakdown?.water || 24) + (user.breakdown?.cooking || 38)) / (user.monthlyFootprintKg || 428)) * 100)}%` }} 
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
              {Math.round(((user.breakdown?.waste || 24) / (user.monthlyFootprintKg || 428)) * 100)}%
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {user.breakdown?.waste || 24} <span className="text-xs font-normal text-zinc-500">kg CO₂</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-teal-400 h-full rounded-full" 
              style={{ width: `${Math.round(((user.breakdown?.waste || 24) / (user.monthlyFootprintKg || 428)) * 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Solar Advisor & Community Progress Quick CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Solar Advisor Bridge */}
        <div className="card-minimal p-5 rounded-xl flex flex-col justify-between border-amber-900/30 bg-gradient-to-br from-amber-950/15 via-zinc-900 to-zinc-900">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                PM Surya Ghar Muft Bijli
              </span>
              <span className="text-xs font-mono text-amber-300 font-semibold">
                Up to ₹78,000 Central CFA
              </span>
            </div>

            <h3 className="text-base font-bold text-zinc-100 mt-2">
              Rooftop Solar Feasibility Assessment
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Based on your monthly consumption ({user.monthlyElectricityUnits} units/month), model your clean power potential, payback timeline, and request an empanelled installer survey.
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
            <span className="text-xs text-zinc-500">GEDA Empanelled Directory</span>
            <button
              onClick={() => onNavigate('solar')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow"
            >
              <span>Model Solar ROI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Community Campaign Sprint */}
        <div className="card-minimal p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                Collective Gujarat Impact
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {progressPercent}% Complete
              </span>
            </div>

            <h3 className="text-base font-bold text-zinc-100 mt-2">
              {community.activeCampaign}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Aggregate sprint connecting residential cooling efficiency, single-use plastic reduction, and mass transit usage across 33 districts.
            </p>

            <div className="mt-4">
              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 mt-2 font-mono">
                <span>{community.co2SavedKg.toLocaleString('en-IN')} kg avoided</span>
                <span>Target: {community.co2TargetKg.toLocaleString('en-IN')} kg</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#1f2125] flex items-center justify-between text-xs">
            <span className="text-zinc-500">Citizen Self-Reported Actions</span>
            <button
              onClick={() => onNavigate('community')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Social Wall & Rankings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transparent Disclaimer & Methodology Note */}
      <div className="p-4 rounded-xl bg-[#141518] border border-[#23252c] text-[11px] text-zinc-400 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-zinc-300 block mb-0.5">Methodology & Regulatory Baseline Disclosures:</span>
          <span>{BRANDING.disclaimers.general} {BRANDING.disclaimers.grid} {BRANDING.disclaimers.verification}</span>
        </div>
      </div>
    </div>
  );
}
