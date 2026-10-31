import React, { useState } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  Camera, 
  Flame, 
  Award,
  TrendingDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getAdaptiveRecommendation } from '../services/recommendationEngine';
import PhotoProofModal from './PhotoProofModal';

export default function BehaviorLoopCard({ 
  user, 
  onAcceptMission, 
  onCompleteMission, 
  onNavigate 
}) {
  const [activeProofModal, setActiveProofModal] = useState(false);
  const rec = getAdaptiveRecommendation(user);
  const isAccepted = user.activeMissions?.includes(rec.missionId);
  const isCompleted = user.completedMissions?.includes(rec.missionId);

  const handleAccept = () => {
    onAcceptMission(rec.missionId, rec.points, rec.impactCo2Kg);
    confetti({
      particleCount: 40,
      spread: 45,
      origin: { y: 0.7 }
    });
  };

  const handleOpenRecord = () => {
    setActiveProofModal(true);
  };

  const handleProofConfirmed = (data) => {
    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.65 }
    });
    onCompleteMission(data.missionId, data.points, data.co2Kg, data.proofData);
    setActiveProofModal(false);
  };

  return (
    <div className="human-card p-6 sm:p-7 border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm relative overflow-hidden transition-all">
      
      {/* Header Pill & Reward */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/70 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's Adaptive Recommendation</span>
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            Tailored to your {user.locality ? `${user.locality}, ` : ''}{user.city || 'Ahmedabad'} home
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Reward:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">+{rec.points} LiFE+ pts</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-slate-700 dark:text-slate-200 font-mono">-{rec.impactCo2Kg} kg CO₂</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {rec.title}
            </h3>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {rec.difficulty}
            </span>
          </div>

          {/* Rationale based on user baseline */}
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed">
            🌿 {rec.reason}
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Specific Step:</strong> {rec.action}.
          </p>

          {/* Transparent Calculation Box */}
          <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Transparent Impact Formula:</span>
            </div>
            <p className="font-mono text-xs text-slate-700 dark:text-slate-300">{rec.transparentCalculation}</p>
            {rec.estimatedSavingsInr > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold block text-xs">
                Estimated power bill savings: ~₹{rec.estimatedSavingsInr}/month
              </span>
            )}
          </div>
        </div>

        {/* Action Button & Status Loop */}
        <div className="lg:col-span-4 flex flex-col items-stretch lg:items-end justify-center gap-3">
          {isCompleted ? (
            <div className="w-full text-center lg:text-right p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-center lg:justify-end gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Action Recorded Today!</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Your footprint has been updated. The engine will adapt tomorrow.
              </p>
            </div>
          ) : isAccepted ? (
            <div className="w-full space-y-2">
              <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 text-center lg:text-right flex items-center justify-center lg:justify-end gap-1">
                <span>⏳ Challenge In Progress</span>
              </div>
              <button
                onClick={handleOpenRecord}
                className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-[0.99]"
              >
                <Camera className="w-4 h-4" />
                <span>Record Completion & Proof</span>
              </button>
            </div>
          ) : (
            <div className="w-full space-y-2">
              <button
                onClick={handleAccept}
                className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-[0.99]"
              >
                <span>Accept Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('missions')}
                className="w-full py-1 text-center text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Browse all 7 LiFE themes →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Photo Proof / Completion Modal */}
      {activeProofModal && (
        <PhotoProofModal
          isOpen={activeProofModal}
          onClose={() => setActiveProofModal(false)}
          mission={{
            id: rec.missionId,
            title: rec.title,
            description: rec.action,
            points: rec.points,
            co2Kg: rec.impactCo2Kg,
            theme: rec.theme
          }}
          user={user}
          onProofConfirmed={handleProofConfirmed}
        />
      )}
    </div>
  );
}
