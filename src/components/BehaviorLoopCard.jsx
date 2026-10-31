import React, { useState } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  HelpCircle,
  Camera,
  Flame,
  Award
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
    <div className="card-minimal rounded-2xl p-5 sm:p-6 border-emerald-900/40 bg-gradient-to-br from-emerald-950/20 via-zinc-900 to-[#121316] relative overflow-hidden">
      {/* Decorative top pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#22242b]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Behavior Change Loop • Next Recommended Action</span>
          </span>
          <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
            Tailored to your {user.city || 'Gujarat'} baseline
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 font-mono">Award:</span>
          <span className="text-emerald-400 font-bold font-mono">+{rec.points} LiFE+ pts</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-300 font-mono">-{rec.impactCo2Kg} kg CO₂</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        <div className="lg:col-span-8 space-y-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-zinc-100">
              {rec.title}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
              {rec.difficulty}
            </span>
          </div>

          {/* Reason based on user baseline */}
          <p className="text-xs text-emerald-300 font-medium leading-relaxed">
            💡 {rec.reason}
          </p>

          <p className="text-xs text-zinc-300 leading-relaxed">
            <strong>Target Action:</strong> {rec.action}.
          </p>

          {/* Transparent Calculation Box */}
          <div className="p-3 bg-[#17181c]/90 rounded-xl border border-[#24262d] text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5 text-zinc-300 font-semibold mb-0.5">
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transparent Impact Estimate:</span>
            </div>
            <p className="font-mono text-zinc-400 text-[11px]">{rec.transparentCalculation}</p>
            {rec.estimatedSavingsInr > 0 && (
              <span className="text-emerald-400 font-medium block mt-1">
                Estimated power bill reduction: ~₹{rec.estimatedSavingsInr}/month
              </span>
            )}
          </div>
        </div>

        {/* Action Button & Status Loop */}
        <div className="lg:col-span-4 flex flex-col items-stretch lg:items-end justify-center gap-3">
          {isCompleted ? (
            <div className="w-full text-center lg:text-right p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
              <div className="flex items-center justify-center lg:justify-end gap-1.5 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Action Recorded Today!</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                Impact added to your profile. The recommendation engine will adapt tomorrow.
              </p>
            </div>
          ) : isAccepted ? (
            <div className="w-full space-y-2">
              <div className="text-[11px] font-mono text-amber-400 text-center lg:text-right">
                ⏳ Mission In Progress
              </div>
              <button
                onClick={handleOpenRecord}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <span>Record Completion & Evidence</span>
              </button>
            </div>
          ) : (
            <div className="w-full space-y-2">
              <button
                onClick={handleAccept}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Accept Mission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('missions')}
                className="w-full py-1.5 text-center text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
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
