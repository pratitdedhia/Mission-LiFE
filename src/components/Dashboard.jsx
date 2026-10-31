import React, { useState } from 'react';
import { 
  Zap, 
  Car, 
  Droplets, 
  Recycle, 
  ArrowRight, 
  Check, 
  Flame, 
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
    <div className="space-y-7 max-w-5xl mx-auto">
      
      {/* Real-Time Smart Grid Load Nudge Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xs ${
        isPeakHour 
          ? 'bg-rose-50/70 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-200' 
          : isOffPeak 
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-200' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isPeakHour 
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' 
              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
          }`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isPeakHour ? '🔴 Peak Grid Hours Active (6:00 PM – 10:00 PM IST)' : isOffPeak ? '🟢 Green Off-Peak Window Active' : '⚡ Gujarat DISCOM Time-of-Day Status'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                Live Tariff
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {isPeakHour 
                ? 'Standard Gujarat DISCOM peak period. Deferring washing machines, dishwashers, and EV charging until after 10 PM cuts unit tariffs from ₹9.20 to ₹5.40 and avoids high-emission thermal peaker generation.'
                : 'Favorable green solar and wind power prevailing on the regional grid. Optimal window to charge electric vehicles and run high-wattage domestic pumps at lower off-peak rates.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('missions')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold whitespace-nowrap self-end sm:self-auto transition-colors cursor-pointer shadow-xs"
        >
          View Grid Micro-Tasks →
        </button>
      </div>

      {/* Citizen Header Summary & Locality */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              {BRANDING.name} Citizen Companion
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{user.locality ? `${user.locality}, ` : ''}{user.city || 'Ahmedabad'}, Gujarat</span>
            </span>
            <button
              onClick={onOpenOnboarding}
              className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium underline flex items-center gap-1 ml-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Home Baseline</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.goodEvening}, {user.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            {BRANDING.promise}
          </p>
        </div>

        {/* Key Metrics Strip */}
        <div className="flex items-center gap-3">
          <div className="human-card px-4 py-2.5 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 block">LiFE+ Score</span>
            <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{user.lifeScore}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">+{user.scoreTodayDelta}</span>
            </div>
          </div>

          <div className="human-card px-4 py-2.5 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 block">Monthly Footprint</span>
            <div className="flex items-baseline justify-center gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{user.monthlyFootprintKg}</span>
              <span className="text-xs text-slate-500 font-medium">kg CO₂</span>
            </div>
          </div>

          <div className="human-card px-4 py-2.5 text-center hidden sm:block">
            <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 block">Active Streak</span>
            <div className="flex items-baseline justify-center gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-amber-500 font-mono">{user.streak}</span>
              <span className="text-xs text-slate-500 font-medium">days 🔥</span>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Energy */}
        <div 
          onClick={() => onNavigate('footprint')} 
          className="human-card p-5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Electricity & AC</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {Math.round(((user.breakdown?.energy || 228) / (user.monthlyFootprintKg || 428)) * 100)}%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {user.breakdown?.energy || 228} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.round(((user.breakdown?.energy || 228) / (user.monthlyFootprintKg || 428)) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Transport */}
        <div 
          onClick={() => onNavigate('footprint')} 
          className="human-card p-5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Car className="w-4 h-4 text-blue-500" />
              <span>Daily Commute</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {Math.round(((user.breakdown?.transport || 114) / (user.monthlyFootprintKg || 428)) * 100)}%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {user.breakdown?.transport || 114} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3.5 overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.round(((user.breakdown?.transport || 114) / (user.monthlyFootprintKg || 428)) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Cooking & Water */}
        <div 
          onClick={() => onNavigate('footprint')} 
          className="human-card p-5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Droplets className="w-4 h-4 text-cyan-500" />
              <span>Water & Gas</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {Math.round((((user.breakdown?.water || 24) + (user.breakdown?.cooking || 38)) / (user.monthlyFootprintKg || 428)) * 100)}%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {(user.breakdown?.water || 24) + (user.breakdown?.cooking || 38)} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3.5 overflow-hidden">
            <div 
              className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.round((((user.breakdown?.water || 24) + (user.breakdown?.cooking || 38)) / (user.monthlyFootprintKg || 428)) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Waste & Circular */}
        <div 
          onClick={() => onNavigate('footprint')} 
          className="human-card p-5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Recycle className="w-4 h-4 text-teal-500" />
              <span>Waste & Plastic</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {Math.round(((user.breakdown?.waste || 24) / (user.monthlyFootprintKg || 428)) * 100)}%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {user.breakdown?.waste || 24} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3.5 overflow-hidden">
            <div 
              className="bg-teal-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.round(((user.breakdown?.waste || 24) / (user.monthlyFootprintKg || 428)) * 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Solar Advisor & Community Progress Quick Bridges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Solar Advisor Bridge */}
        <div className="human-card p-6 flex flex-col justify-between border-amber-200/80 dark:border-amber-900/30 bg-gradient-to-br from-amber-50/60 to-white dark:from-amber-950/20 dark:to-slate-900">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
                PM Surya Ghar Muft Bijli
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                Up to ₹78,000 Central CFA
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              Rooftop Solar Feasibility Assessment
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Based on your monthly consumption ({user.monthlyElectricityUnits} units/month), model your clean power potential, payback timeline, and request an empanelled installer survey.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-500 text-[11px] block font-medium">Est. Bill Savings</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm mt-0.5 block">₹24,500 / yr</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-500 text-[11px] block font-medium">Central Subsidy</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-sm mt-0.5 block">₹78,000 CFA</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">GEDA Empanelled Directory</span>
            <button
              onClick={() => onNavigate('solar')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-sm"
            >
              <span>Model Solar ROI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Community Campaign Sprint */}
        <div className="human-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                Collective Gujarat Impact
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {progressPercent}% Complete
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              {community.activeCampaign}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Aggregate sprint connecting residential cooling efficiency, single-use plastic reduction, and mass transit usage across 33 districts.
            </p>

            <div className="mt-4">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                <span>{community.co2SavedKg.toLocaleString('en-IN')} kg avoided</span>
                <span>Target: {community.co2TargetKg.toLocaleString('en-IN')} kg</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Citizen Self-Reported Actions</span>
            <button
              onClick={() => onNavigate('community')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Social Wall & Rankings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transparent Disclaimer & Methodology Note */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Methodology & Regulatory Baseline Disclosures:</span>
          <span>{BRANDING.disclaimers.general} {BRANDING.disclaimers.grid} {BRANDING.disclaimers.verification}</span>
        </div>
      </div>
    </div>
  );
}
