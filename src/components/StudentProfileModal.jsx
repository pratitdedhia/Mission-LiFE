import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Mail, 
  FileText, 
  Calendar, 
  MapPin, 
  User, 
  ZoomIn, 
  Award, 
  Zap, 
  Check, 
  Eye
} from 'lucide-react';

export default function StudentProfileModal({ 
  student, 
  isOpen, 
  onClose, 
  isLeader = false, 
  onVerify = null, 
  onReject = null 
}) {
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  if (!isOpen || !student) return null;

  const isVerified = student.status === 'verified';
  const isPending = student.status === 'pending';
  const isRejected = student.status === 'rejected';

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'Not recorded';
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? isoString : d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      {/* Lightbox Zoom for Student ID Photo */}
      {isPhotoZoomed && (
        <div 
          onClick={() => setIsPhotoZoomed(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Institutional ID Photo Proof • {student.studentName}
                </span>
              </div>
              <button 
                onClick={() => setIsPhotoZoomed(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 flex items-center justify-center bg-slate-950/70 rounded-2xl my-3">
              <img 
                src={student.idCardPhotoUrl} 
                alt={`${student.studentName} Institutional ID`}
                className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-md"
              />
            </div>
            <div className="text-center text-xs text-slate-400">
              Roll No: <span className="font-mono text-blue-400 font-bold">{student.collegeId}</span> • {student.universityName}
            </div>
          </div>
        </div>
      )}

      {/* Main Student Dossier Modal */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
      >
        <div 
          onClick={e => e.stopPropagation()}
          className="relative max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto"
        >
          {/* Header Bar */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Student Environmental Record</span>
                </span>

                {isVerified && (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Verified Campus Volunteer</span>
                  </span>
                )}

                {isPending && (
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>Pending Campus Leader Approval</span>
                  </span>
                )}

                {isRejected && (
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-500" />
                    <span>Verification Rejected</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {student.studentName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{student.universityName}</span>
                <span>•</span>
                <span>Enrolled in Gujarat Youth Climate League</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer flex-shrink-0"
              title="Close dossier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Dossier Grid: ID Photo & Academic Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* ID Proof Card */}
            <div className="md:col-span-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-between text-center space-y-3">
              <div className="w-full">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-2">
                  Institutional ID Proof
                </span>
                <div 
                  onClick={() => setIsPhotoZoomed(true)}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-zoom-in bg-slate-200 dark:bg-slate-800 aspect-square w-full max-w-[180px] mx-auto shadow-xs"
                  title="Click to zoom full-screen ID card"
                >
                  <img 
                    src={student.idCardPhotoUrl} 
                    alt={`${student.studentName} ID`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-semibold">
                    <ZoomIn className="w-4 h-4" />
                    <span>Zoom ID</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsPhotoZoomed(true)}
                className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span>Inspect Full Card</span>
              </button>
            </div>

            {/* Academic & University Profile Fields */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Roll / College ID</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm mt-0.5 block truncate">
                    {student.collegeId}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Year of Study</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-0.5 block truncate">
                    {student.yearOfStudy || 'Not specified'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Department / Branch</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-0.5 block truncate" title={student.department}>
                    {student.department}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Residence / Hostel</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-0.5 block truncate" title={student.residenceType}>
                    {student.residenceType}
                  </span>
                </div>
              </div>

              {/* Email & Timestamps */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Institutional Email:</span>
                  </span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300 truncate max-w-[240px]">
                    {student.studentEmail}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Submitted:</span>
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {formatTimestamp(student.submittedAt)}
                  </span>
                </div>

                {isVerified && (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Verified At:</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      {formatTimestamp(student.verifiedAt)} {student.verifiedBy ? `by ${student.verifiedBy}` : ''}
                    </span>
                  </div>
                )}

                {isRejected && student.rejectionReason && (
                  <div className="pt-1 border-t border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-[11px]">
                    <strong>Rejection Notice:</strong> {student.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Environmental Metrics Strip */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center">
              <span className="text-slate-400 block text-[10px] font-mono uppercase">Verified Actions</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                {student.actionsCount || 0}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center">
              <span className="text-slate-400 block text-[10px] font-mono uppercase">LiFE Points</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                +{student.totalPoints || 0} pts
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center">
              <span className="text-slate-400 block text-[10px] font-mono uppercase">CO₂ Avoidance</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
                {student.co2SavedKg || 0} kg
              </span>
            </div>
          </div>

          {/* Real-time Habit Execution History (No Hardcoded Fallbacks) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Audited Habit Execution History ({student.recentActions?.length || 0})</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Live Database Ledger</span>
            </div>

            {student.recentActions && student.recentActions.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {student.recentActions.map((act, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-0.5 pr-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{act.action}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span>{act.date || 'Recent'}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Verified in Campus Squad Ledger</span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs block">
                        +{act.points} pts
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        -{act.co2Kg} kg CO₂
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {isPending 
                    ? "Pending Campus Leader verification" 
                    : "No individual sustainability habits logged yet"}
                </p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  {isPending 
                    ? "Once approved by the Campus Leader, this student's daily LiFE habit actions and photo evidence will be audited in real time and credited to " + student.universityName + "."
                    : "Daily micro-tasks and verified habit completions logged by this student will appear here automatically."}
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 font-mono">
              ID Record: <span className="font-bold text-slate-600 dark:text-slate-300">{student.id}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Leader approval actions for pending students */}
              {isLeader && isPending && onVerify && (
                <>
                  {onReject && (
                    <button
                      onClick={() => onReject(student.id, student.studentName)}
                      className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reject Submission
                    </button>
                  )}
                  <button
                    onClick={() => onVerify(student.id, student.studentName)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Verify & Enroll Student</span>
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
