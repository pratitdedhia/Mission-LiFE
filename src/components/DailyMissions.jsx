import React, { useState, useEffect } from 'react';
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
  Info,
  GraduationCap,
  Users,
  Building2,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import { getActiveTasks } from '../repositories/taskRepository';
import { getCampusLeaderSprints } from '../services/studentVerificationService';
import PhotoProofModal from './PhotoProofModal';

const THEME_FILTERS = [
  { id: 'all', labelKey: 'all', defaultLabel: 'All Themes' },
  { id: 'inventory_targeted', labelKey: 'inventory_targeted', defaultLabel: '⚡ Targeted to My Appliances' },
  { id: 'save_energy', labelKey: 'save_energy', defaultLabel: 'Save Energy' },
  { id: 'save_water', labelKey: 'save_water', defaultLabel: 'Save Water' },
  { id: 'say_no_to_plastic', labelKey: 'say_no_to_plastic', defaultLabel: 'Say No to Single-Use Plastic' },
  { id: 'adopt_sustainable_food', labelKey: 'adopt_sustainable_food', defaultLabel: 'Sustainable Food Systems' },
  { id: 'reduce_waste', labelKey: 'reduce_waste', defaultLabel: 'Reduce Waste' },
  { id: 'adopt_healthy_lifestyles', labelKey: 'adopt_healthy_lifestyles', defaultLabel: 'Healthy Lifestyles' },
  { id: 'reduce_ewaste', labelKey: 'reduce_ewaste', defaultLabel: 'Reduce E-Waste' }
];

export default function DailyMissions({ 
  user = {}, 
  onAcceptMission,
  onCompleteMission, 
  onNavigateToSolar,
  onOpenPledge 
}) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [filterTheme, setFilterTheme] = useState('all');
  const [activeProofMission, setActiveProofMission] = useState(null);

  // University & Campus Leader Resolution
  const userUniversity = user.universityName || user.campusName || user.university || 'IIT Gandhinagar';
  const campusLeaderName = user.campusLeaderName || 'Aarav Mehta';
  const [campusSprints, setCampusSprints] = useState([]);

  useEffect(() => {
    let isCurrent = true;
    getActiveTasks().then(loadedTasks => {
      if (isCurrent) setTasks(loadedTasks);
    });
    // Load campus leader sprints specifically for this university
    const sprints = getCampusLeaderSprints(userUniversity);
    setCampusSprints(sprints);
    return () => { isCurrent = false; };
  }, [userUniversity]);

  const getThemeIcon = (themeId) => {
    switch (themeId) {
      case 'save_energy': return Zap;
      case 'save_water': return Droplets;
      case 'say_no_to_plastic': return ShoppingBag;
      case 'adopt_sustainable_food': return Apple;
      case 'reduce_waste': return Recycle;
      case 'adopt_healthy_lifestyles': return Bike;
      case 'reduce_ewaste': return Cpu;
      default: return Sparkles;
    }
  };

  const completedSet = new Set(user.completedMissions || []);
  const activeSet = new Set(user.activeMissions || []);

  const handleMissionAction = (mission) => {
    if (completedSet.has(mission.id)) return;

    if (mission.id === 'task_solar_feasibility' && onNavigateToSolar) {
      onNavigateToSolar();
      return;
    }

    // High-value tasks or tasks requiring proof directly open the photo verification modal
    if (activeSet.has(mission.id) || mission.basePoints >= 20 || mission.requiresPhotoProof) {
      setActiveProofMission({
        id: mission.id,
        title: t(mission.titleKey, mission.id),
        description: t(mission.descriptionKey, mission.impactSummary),
        points: mission.basePoints,
        co2Kg: mission.co2SavingsKg,
        requiresPhoto: true
      });
    } else {
      onAcceptMission(mission.id, mission.basePoints, mission.co2SavingsKg);
      confetti({
        particleCount: 40,
        spread: 45,
        origin: { y: 0.65 }
      });
    }
  };

  const handleSprintAction = (sprint) => {
    if (completedSet.has(sprint.id)) return;

    // Campus sprints require photo proof verification
    if (activeSet.has(sprint.id) || sprint.requiresPhotoProof || sprint.points >= 20) {
      setActiveProofMission({
        id: sprint.id,
        title: sprint.title,
        description: sprint.description,
        points: sprint.points,
        co2Kg: sprint.co2Kg,
        requiresPhoto: true,
        photoGuidance: sprint.photoGuidance
      });
    } else {
      onAcceptMission(sprint.id, sprint.points, sprint.co2Kg);
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

  // Check user inventory appliances
  let userAppliances = user.appliances || [];
  if ((!userAppliances || userAppliances.length === 0) && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`life_user_appliances_${user.id || 'usr_citizen'}`);
      if (raw) userAppliances = JSON.parse(raw);
    } catch (e) {
      userAppliances = [];
    }
  }
  const appTypes = new Set((userAppliances || []).map(a => a.appliance_type));

  const isApplianceTargeted = (taskId) => {
    if (taskId.includes('ac') && (appTypes.has('air_conditioner') || appTypes.size === 0)) return true;
    if (taskId.includes('fridge') && (appTypes.has('refrigerator') || appTypes.size === 0)) return true;
    if (taskId.includes('wash') && (appTypes.has('washing_machine') || appTypes.size === 0)) return true;
    return false;
  };

  const filteredTasks = tasks.filter(task => {
    if (filterTheme === 'inventory_targeted') {
      return isApplianceTargeted(task.id);
    }
    if (filterTheme === 'all') return true;
    return task.themeId === filterTheme;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mission LiFE Challenge Center</span>
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold font-mono">
              {userUniversity} Squad
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            Sustainability & Eco Challenges
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Accept local campus initiatives organized by your university leader and statewide government challenges audited by GEDA.
          </p>
        </div>

        {/* User Status Strip */}
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-xs shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Streak</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">{user.streak || 0} Days 🔥</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-xs shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total LiFE+ Pts</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{user.lifeScore || 0}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CATEGORY 1: CHALLENGES ORGANISED BY CAMPUS LEADER FOR THIS UNIVERSITY     */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Category 1 Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900/15 via-indigo-900/10 to-transparent border border-blue-200 dark:border-blue-800/80 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-800 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Category 1 • Campus Leader Initiatives</span>
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Organised for <strong>{userUniversity}</strong>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {userUniversity} Campus Eco Challenges
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              Local initiatives launched by Campus Youth Leader <strong>{campusLeaderName}</strong> to coordinate hostel wings, mess dining halls, and academic departments.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/70 px-3.5 py-2 rounded-xl text-right shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Campus Sprints</span>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {campusSprints.length} Active Challenges
              </span>
            </div>
          </div>
        </div>

        {/* Campus Sprints Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campusSprints.map((sprint) => {
            const Icon = getThemeIcon(sprint.theme || 'save_energy');
            const isDone = completedSet.has(sprint.id);
            const isActive = activeSet.has(sprint.id);

            return (
              <div
                key={sprint.id}
                className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl flex flex-col justify-between transition-all shadow-xs ${
                  isDone
                    ? 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : isActive
                    ? 'border-blue-400 dark:border-blue-700/60 bg-blue-50/30 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div>
                  {/* Top Bar: Theme Icon, Sprint Badge & Points */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : isActive
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block font-mono">
                          Campus Leader Sprint
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {sprint.title}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40 px-2 py-0.5 rounded-full flex-shrink-0">
                      +{sprint.points} pts
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sprint.description}
                  </p>

                  {/* Participating Hostels / Blocks Pills */}
                  {sprint.participatingHostels && sprint.participatingHostels.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-mono font-bold">Squads:</span>
                      {sprint.participatingHostels.map((hostel, hIdx) => (
                        <span 
                          key={hIdx}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium"
                        >
                          {hostel}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Progress & Live Participation Bar */}
                  <div className="mt-3.5 space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-500" />
                        <span>{sprint.activeParticipants || 150} students participating</span>
                      </span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {sprint.progressPercent || 75}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                        style={{ width: `${sprint.progressPercent || 75}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">Organized by {sprint.organizer}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    -{sprint.co2Kg} kg CO₂ avoided
                  </span>

                  {isDone ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Verified & Done</span>
                    </span>
                  ) : isActive ? (
                    <button
                      onClick={() => handleSprintAction(sprint)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Record Photo Proof</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSprintAction(sprint)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Accept Campus Sprint</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE BREAKER: Distinct Divider between Campus Sprints & Statewide Govt Challenges */}
      {/* ========================================================================= */}
      <div className="relative py-8 my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t-2 border-dashed border-slate-300 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center">
          <div className="bg-slate-50 dark:bg-slate-900 border-2 border-emerald-500/40 dark:border-emerald-500/30 text-slate-800 dark:text-slate-200 px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <span className="text-xl">🏛️</span>
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold tracking-wide uppercase text-xs sm:text-sm text-slate-900 dark:text-white">
                  Global Statewide LiFE Challenges
                </span>
                <span className="text-[10px] bg-emerald-600 text-white font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold shadow-xs">
                  Organised by Govt. of Gujarat • GEDA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Official GEDA curriculum across 7 Mission LiFE themes for statewide energy & environmental reduction
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CATEGORY 2: GLOBAL STATEWIDE CHALLENGES ORGANISED BY GOVERNMENT (GEDA)    */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Category 2 Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900/15 via-teal-900/10 to-transparent border border-emerald-200 dark:border-emerald-800/80 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Category 2 • Statewide Government Curriculum</span>
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Mission LiFE Gujarat
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Global Government LiFE Challenges
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              Standardized state-level challenges across 7 Mission LiFE themes, audited for GWh energy reduction, municipal water conservation, and district benchmarks.
            </p>
          </div>
        </div>

        {/* Authoritative Gamification Scoring Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              <strong>Authoritative Scoring Rules:</strong> Base (30–80 pts) • Photo Verification (+25 pts) • Streak Multiplier (up to +25%) • Deduplicated Daily Claims.
            </span>
          </div>
          <button
            onClick={() => alert("Scoring & Integrity Engine Rules (GEDA HC26-GEDA01):\n\n1. Idempotent Claims: Each mission can only be logged once per calendar date to measure sustained habit change.\n2. Photo Evidence Bonus: Uploading verifiable photographic proof to Firebase Storage grants +25 points.\n3. Streak Multipliers:\n   • 3+ Days: +5% points\n   • 7+ Days: +10% points\n   • 21+ Days: +25% points\n4. Anti-Fraud Cap: Maximum 400 points per day per citizen.\n5. State Sync: Certified points atomically update statewide GWh conservation metrics.")}
            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline whitespace-nowrap self-end sm:self-auto cursor-pointer"
          >
            View Full Scoring Matrix →
          </button>
        </div>

        {/* 7 Themes Filter Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 text-xs">
          {THEME_FILTERS.map((tf) => {
            const isActive = filterTheme === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => setFilterTheme(tf.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf.defaultLabel}
              </button>
            );
          })}
        </div>

        {/* Government Missions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const Icon = getThemeIcon(task.themeId);
            const isDone = completedSet.has(task.id);
            const isActive = activeSet.has(task.id);

            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl flex flex-col justify-between transition-all shadow-xs ${
                  isDone 
                    ? 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20' 
                    : isActive
                    ? 'border-amber-300 dark:border-amber-700/50 bg-amber-50/30 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Card Top Pill & Points */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isDone 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                          : isActive
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                            {task.themeId.replace(/_/g, ' ')}
                          </span>
                          {isApplianceTargeted(task.id) && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-mono">
                              ⚡ In Your Inventory
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {t(task.titleKey, task.id)}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 px-2 py-0.5 rounded-full flex-shrink-0">
                      +{task.basePoints} pts
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t(task.descriptionKey, task.impactSummary)}
                  </p>

                  {/* Impact Summary Note */}
                  {task.impactSummary && (
                    <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{task.impactSummary}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Impact & Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    -{task.co2SavingsKg} kg CO₂ avoided
                  </span>

                  {isDone ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  ) : isActive ? (
                    <button
                      onClick={() => handleMissionAction(task)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Record Proof</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMissionAction(task)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
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
      </div>

      {/* Citizen Pledge Banner */}
      <div className="p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Take the Official Mission LiFE Pledge</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Obtain your verified digital Certificate from Gujarat Energy Development Agency.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenPledge}
          className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
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