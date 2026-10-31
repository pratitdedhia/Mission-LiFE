import React, { useState } from 'react';
import { 
  Zap, 
  Lightbulb, 
  Droplets, 
  Bike, 
  Recycle, 
  Sun, 
  ShoppingBag,
  Apple,
  Cpu,
  Check, 
  Camera,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_MISSIONS, LIFE_THEMES } from '../data/initialData';
import { BRANDING } from '../config/branding';
import PhotoProofModal from './PhotoProofModal';

export default function DailyMissions({ 
  user, 
  onAcceptMission,
  onCompleteMission, 
  onNavigateToSolar,
  onOpenPledge 
}) {
  const [filterTheme, setFilterTheme] = useState('all');
  const [activeProofMission, setActiveProofMission] = useState(null);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'Lightbulb': return Lightbulb;
      case 'Droplets': return Droplets;
      case 'Bike': return Bike;
      case 'Recycle': return Recycle;
      case 'Sun': return Sun;
      case 'ShoppingBag': return ShoppingBag;
      case 'Apple': return Apple;
      case 'Cpu': return Cpu;
      default: return Sparkles;
    }
  };

  const completedSet = new Set(user.completedMissions || []);
  const activeSet = new Set(user.activeMissions || []);

  const handleMissionAction = (mission) => {
    if (completedSet.has(mission.id)) return;

    if (mission.id === 'solar_explorer' && onNavigateToSolar) {
      onNavigateToSolar();
      return;
    }

    if (activeSet.has(mission.id)) {
      // Record completion
      setActiveProofMission(mission);
    } else {
      // Accept mission
      onAcceptMission(mission.id, mission.points, mission.co2Kg);
      confetti({
        particleCount: 40,
        spread: 45,
        origin: { y: 0.65 }
      });
    }
  };

  const handleProofConfirmed = (data) => {
    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.65 }
    });
    onCompleteMission(data.missionId, data.points, data.co2Kg, data.proofData);
    setActiveProofMission(null);
  };

  const filteredMissions = INITIAL_MISSIONS.filter(m => {
    if (filterTheme === 'all') return true;
    return m.theme === filterTheme || m.category === filterTheme;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#1f2125]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              7 Mission LiFE Themes
            </span>
            <span className="text-xs font-mono text-zinc-500">Citizen Daily Challenges</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1">
            Daily Action Challenges
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Accept micro-tasks, record completion with transparent formulas, and validate habits through peer evidence.
          </p>
        </div>

        {/* User Status Strip */}
        <div className="flex items-center gap-3">
          <div className="card-minimal px-3.5 py-2 rounded-lg text-xs">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Current Streak</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">{user.streak} Days 🔥</span>
          </div>

          <div className="card-minimal px-3.5 py-2 rounded-lg text-xs">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total LiFE+ Pts</span>
            <span className="font-bold text-zinc-100 font-mono text-sm">{user.lifeScore}</span>
          </div>
        </div>
      </div>

      {/* Authoritative Gamification Scoring Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong>Authoritative Scoring Rules:</strong> Base (30–80 pts) • Photo Verification (+25 pts) • Streak Multiplier (up to +25%) • Deduplicated Daily Claims.
          </span>
        </div>
        <button
          onClick={() => alert("Scoring & Integrity Engine Rules (GEDA HC26-GEDA01):\n\n1. Idempotent Claims: Each mission can only be logged once per calendar date to measure sustained habit change.\n2. Photo Evidence Bonus: Uploading verifiable photographic proof to Firebase Storage grants +25 points.\n3. Streak Multipliers:\n   • 3+ Days: +5% points\n   • 7+ Days: +10% points\n   • 21+ Days: +25% points\n4. Anti-Fraud Cap: Maximum 300 points per day per citizen.\n5. State Sync: Certified points atomically update statewide GWh conservation metrics.")}
          className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline whitespace-nowrap self-end sm:self-auto cursor-pointer"
        >
          View Full Scoring Matrix →
        </button>
      </div>

      {/* 7 Themes Filter Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 text-xs">
        {LIFE_THEMES.map((theme) => {
          const isActive = filterTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => setFilterTheme(theme.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'bg-[#16171a] text-zinc-400 border border-[#26282e] hover:text-zinc-200'
              }`}
            >
              {theme.name}
            </button>
          );
        })}
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMissions.map((mission) => {
          const Icon = getIcon(mission.icon);
          const isDone = completedSet.has(mission.id);
          const isActive = activeSet.has(mission.id);

          return (
            <div
              key={mission.id}
              className={`card-minimal p-5 rounded-xl flex flex-col justify-between transition-all ${
                isDone 
                  ? 'border-emerald-900/40 bg-emerald-950/10' 
                  : isActive
                  ? 'border-amber-700/50 bg-amber-950/10'
                  : 'hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Card Top Pill & Points */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDone 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : isActive
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                        {mission.theme}
                      </span>
                      <span className="text-xs font-bold text-zinc-100">
                        {mission.title}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                    +{mission.points} pts
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {mission.description}
                </p>

                {/* Hint / Transparent Basis */}
                {mission.hint && (
                  <div className="mt-3 text-[11px] text-zinc-500 bg-[#16171b] p-2 rounded border border-[#23252a] flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.2" />
                    <span>{mission.hint}</span>
                  </div>
                )}
              </div>

              {/* Bottom Impact & Action */}
              <div className="mt-4 pt-3 border-t border-[#1f2125] flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-400 text-[11px]">
                  -{mission.co2Kg} kg CO₂ avoided
                </span>

                {isDone ? (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </span>
                ) : isActive ? (
                  <button
                    onClick={() => handleMissionAction(mission)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Record Proof</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleMissionAction(mission)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow"
                  >
                    <span>Accept Mission</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Citizen Pledge Banner */}
      <div className="card-minimal p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-emerald-900/30 bg-gradient-to-r from-emerald-950/20 via-zinc-900 to-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100">Take the Official Mission LiFE Pledge</h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Obtain your verified digital Certificate from Gujarat Energy Development Agency.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenPledge}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow"
        >
          {user.pledgeSigned ? 'View Certificate' : 'Take Pledge & Get Certificate'}
        </button>
      </div>

      {/* Photo Proof Modal */}
      {activeProofMission && (
        <PhotoProofModal
          isOpen={Boolean(activeProofMission)}
          onClose={() => setActiveProofMission(null)}
          mission={activeProofMission}
          user={user}
          onProofConfirmed={handleProofConfirmed}
        />
      )}
    </div>
  );
}
