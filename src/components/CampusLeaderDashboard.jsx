import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Trophy, 
  Zap, 
  Users, 
  Flame, 
  Send, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Calendar,
  Share2,
  UserCheck,
  Clock,
  ShieldCheck,
  Check,
  X,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  Building2,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getCampusStudentSummary, 
  verifyStudent, 
  rejectStudent 
} from '../services/studentVerificationService';

export default function CampusLeaderDashboard({ user, onCompleteMission }) {
  const [activeSubTab, setActiveSubTab] = useState('sprints'); // 'sprints' | 'verifications' | 'summary'
  const [summaryData, setSummaryData] = useState(() => getCampusStudentSummary(user.campusName || "IIT Gandhinagar"));
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);
  const [viewingIdPhoto, setViewingIdPhoto] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const [sprints, setSprints] = useState([
    {
      id: "sprint_1",
      title: "Inter-Hostel AC 26°C Challenge",
      description: "Hostels 3, 5, and 7 compete to maintain AC setpoint at 26°C and shift laundry away from 6-10 PM peak hours.",
      participatingHostels: ["Hall 3 (Narmada)", "Hall 5 (Sabarmati)", "Hall 7 (Tapti)"],
      currentLeader: "Hall 5 (Sabarmati)",
      progressPercent: 78,
      kwhSaved: 3820,
      activeParticipants: 245
    },
    {
      id: "sprint_2",
      title: "Zero Food-Waste Mess Challenge",
      description: "Dining halls diverting 100% of organic waste to the campus biogas plant and vermicomposting facility.",
      participatingHostels: ["Central Dining Mess A", "Dining Mess B"],
      currentLeader: "Central Dining Mess A",
      progressPercent: 92,
      kwhSaved: 1450,
      activeParticipants: 380
    },
    {
      id: "sprint_3",
      title: "Solar Rooftop Campus Walk",
      description: "Interactive peer tour of IITGN's 320 kW rooftop solar installation on Academic Blocks 3 & 4.",
      participatingHostels: ["UG Freshers Squad", "Postgrad Climate Group"],
      currentLeader: "UG Freshers Squad",
      progressPercent: 64,
      kwhSaved: 890,
      activeParticipants: 160
    }
  ]);

  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const reloadSummary = () => {
    setSummaryData(getCampusStudentSummary(user.campusName || "IIT Gandhinagar"));
  };

  const handleVerifyStudent = (studentId, studentName) => {
    const res = verifyStudent(studentId, user.name || "Aarav Mehta");
    if (res.success) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      showToast(`Verified and enrolled ${studentName} into the campus squad!`);
      reloadSummary();
    }
  };

  const handleRejectStudent = (studentId, studentName) => {
    const reason = window.prompt("Enter rejection reason (e.g. ID blurred or mismatched name):", "Unclear ID proof");
    if (reason) {
      rejectStudent(studentId, reason);
      showToast(`Rejected submission for ${studentName}.`);
      reloadSummary();
    }
  };

  const handleCheerHostel = (sprintId) => {
    setSprints(prev => prev.map(s => {
      if (s.id === sprintId) {
        return {
          ...s,
          activeParticipants: s.activeParticipants + 1,
          kwhSaved: s.kwhSaved + 40,
          progressPercent: Math.min(100, s.progressPercent + 2)
        };
      }
      return s;
    }));
    showToast("Cheered your campus squad! +40 kWh recorded to IITGN tally.");
  };

  const handleBroadcastChallenge = (e) => {
    e.preventDefault();
    if (!newChallengeTitle.trim()) return;

    const newSprint = {
      id: `sprint_${Date.now()}`,
      title: newChallengeTitle,
      description: `Campus-wide youth initiative initiated by ${user.name}.`,
      participatingHostels: ["Hostel Wing A", "Hostel Wing B", "Day Scholars"],
      currentLeader: "Campus Eco Squad",
      progressPercent: 10,
      kwhSaved: 100,
      activeParticipants: 42
    };

    setSprints([newSprint, ...sprints]);
    setNewChallengeTitle('');
    showToast("New campus green sprint broadcasted to all verified students!");
  };

  const handleExportReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(summaryData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GEDA_Campus_Audit_${summaryData.universityName.replace(/\s+/g, '_')}_2026.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Exported University GEDA Environmental Compliance Audit report.");
  };

  // Filter student roster
  const filteredStudents = summaryData.verifiedList.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.collegeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || s.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-semibold animate-fade-in border border-slate-700">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Campus Leader Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {user.campusName || "IIT Gandhinagar Eco Squad"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Trophy className="w-3.5 h-3.5" />
                  Rank #1 Campus in Gujarat
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Designated Campus Leader: <span className="font-semibold text-slate-700 dark:text-slate-300">{user.name}</span> • Gujarat Youth Climate Fellowship
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>📍 Palaj, Gandhinagar, Gujarat</span>
                <span>👥 {summaryData.totalVerifiedCount + 420}+ Registered Student Volunteers</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast("Campus sprint leaderboard link copied for WhatsApp/Telegram!")}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Share Campus Link</span>
            </button>
          </div>
        </div>

        {/* Campus Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">Squad Points</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{24890 + summaryData.totalPoints}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">+120 pts today</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">Hostel Energy Saved</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">18.4 <span className="text-xs font-normal">MWh</span></p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">AC 26°C & Peak Shifting</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">CO₂ Avoided</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{12400 + Math.round(summaryData.totalCo2SavedKg)} <span className="text-xs font-normal">kg</span></p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Audited by GEDA</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">Verified Students</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{summaryData.totalVerifiedCount}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{summaryData.pendingCount} pending verification</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Campus Leader */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('sprints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'sprints'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Active Campus Sprints</span>
        </button>

        <button
          onClick={() => setActiveSubTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
            activeSubTab === 'verifications'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Student ID Verification Queue</span>
          {summaryData.pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500 text-slate-950 font-black">
              {summaryData.pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('summary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'summary'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Student Action Content Summary</span>
        </button>
      </div>

      {/* SUB-TAB 1: CAMPUS SPRINTS & BROADCAST */}
      {activeSubTab === 'sprints' && (
        <div className="space-y-6">
          
          {/* Broadcast New Challenge */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Broadcast New Campus Eco Sprint</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Mobilize hostel blocks, dining halls, and departments with customized Mission LiFE action tasks.
            </p>

            <form onSubmit={handleBroadcastChallenge} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder="e.g. Turn off hostel corridor lights after 11 PM or Zero-Food-Waste Lunch Friday"
                value={newChallengeTitle}
                onChange={(e) => setNewChallengeTitle(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-xs hover:shadow flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Launch Sprint</span>
              </button>
            </form>
          </div>

          {/* Sprints Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Active Campus Sustainability Sprints</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {sprints.length} Live
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sprints.map((sprint) => (
                <div 
                  key={sprint.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700/60 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Campus Challenge</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{sprint.activeParticipants} Students</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                      {sprint.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      {sprint.description}
                    </p>

                    {/* Progress bar */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Sprint Goal</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{sprint.progressPercent}% Achieved</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${sprint.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Leading Block:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{sprint.currentLeader}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Energy Conserved:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{sprint.kwhSaved} kWh</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCheerHostel(sprint.id)}
                    className="w-full py-2 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Cheer Squad (+40 kWh)</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STUDENT ID VERIFICATION & APPROVAL QUEUE */}
      {activeSubTab === 'verifications' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <span>Student ID Verification Requests</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Review student roll numbers, ID card scans, and department affiliations to grant verified campus eco-volunteer credentials.
                </p>
              </div>

              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {summaryData.pendingCount} Pending Review
              </span>
            </div>

            {summaryData.pendingList.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">All Student ID Verifications Cleared!</p>
                <p className="text-xs text-slate-500 mt-1">There are no pending student enrollment requests waiting for review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {summaryData.pendingList.map((stu) => (
                  <div 
                    key={stu.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* ID Thumbnail Preview */}
                      <div 
                        onClick={() => setViewingIdPhoto(stu.idCardPhotoUrl)}
                        className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 relative cursor-pointer group flex-shrink-0 bg-slate-200 dark:bg-slate-800 shadow-xs"
                        title="Click to zoom student ID proof"
                      >
                        <img src={stu.idCardPhotoUrl} alt="ID card" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">{stu.studentName}</h3>
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                            {stu.collegeId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {stu.department} • <span className="text-slate-500">{stu.yearOfStudy}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{stu.residenceType}</span>
                          <span>•</span>
                          <span>{stu.studentEmail}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
                      <button
                        onClick={() => setViewingIdPhoto(stu.idCardPhotoUrl)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect ID Card</span>
                      </button>

                      <button
                        onClick={() => handleRejectStudent(stu.id, stu.studentName)}
                        className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleVerifyStudent(stu.id, stu.studentName)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Verify & Accept Student</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CONTENT SUMMARY OF ALL STUDENT ACTIONS */}
      {activeSubTab === 'summary' && (
        <div className="space-y-6">
          
          {/* Summary Control Bar */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Student Action Summary & Performance Audit</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Granular aggregation of all verified sustainability actions taken by students registered under {summaryData.universityName}.
                </p>
              </div>

              <button
                onClick={handleExportReport}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start md:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export GEDA Audit Report</span>
              </button>
            </div>

            {/* Department Breakdown Cards */}
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Department Participation Matrix</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(summaryData.departmentBreakdown).map(([dept, data]) => (
                  <div key={dept} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{dept}</p>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-slate-400 font-mono">{data.count} Verified</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{data.points} pts</span>
                    </div>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">-{data.co2SavedKg} kg CO₂ avoided</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students by name, roll number, or branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full sm:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Departments</option>
                {Object.keys(summaryData.departmentBreakdown).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Verified Student Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Roll / College ID</th>
                    <th className="py-2.5 px-3">Department & Hostel</th>
                    <th className="py-2.5 px-3 text-center">Actions Logged</th>
                    <th className="py-2.5 px-3 text-right">Points Added</th>
                    <th className="py-2.5 px-3 text-right">CO₂ Avoided</th>
                    <th className="py-2.5 px-3 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{stu.studentName}</span>
                        <span className="text-[10px] text-slate-400">{stu.studentEmail}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                          {stu.collegeId}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <span>{stu.department}</span>
                        <span className="text-[10px] text-slate-400 block">{stu.residenceType}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white">
                        {stu.actionsCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{stu.totalPoints} pts
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                        {stu.co2SavedKg} kg
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedStudentModal(stu)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold cursor-pointer"
                        >
                          View Log →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Time Live Campus Action Feed */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Live Student Activity Stream</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Real-Time University Action Stream</span>
            </div>

            <div className="space-y-2.5">
              {summaryData.recentActionFeed.map((act, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold">
                      🎓
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        <span>{act.studentName}</span> <span className="font-mono text-slate-400 font-normal text-[11px]">({act.collegeId})</span>
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{act.action}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{act.department} • {act.residenceType}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs block">+{act.points} pts</span>
                    <span className="text-[10px] text-slate-400 font-mono">-{act.co2Kg} kg CO₂</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: STUDENT ID PHOTO ZOOM */}
      {viewingIdPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl">
            <button
              onClick={() => setViewingIdPhoto(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Institutional Student ID Proof</h3>
            <div className="w-full h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <img src={viewingIdPhoto} alt="Student ID" className="w-full h-full object-cover" />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setViewingIdPhoto(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 text-xs font-semibold"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: STUDENT SPECIFIC ACTION LOG MODAL */}
      {selectedStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedStudentModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                  Verified Student Action Record
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                {selectedStudentModal.studentName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Roll No: <span className="font-mono font-bold text-blue-600">{selectedStudentModal.collegeId}</span> • {selectedStudentModal.department}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-slate-400 block text-[10px] font-mono">Total Points Added</span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  +{selectedStudentModal.totalPoints} pts
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-slate-400 block text-[10px] font-mono">Audited CO₂ Avoidance</span>
                <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {selectedStudentModal.co2SavedKg} kg
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Detailed Habit Execution History:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(selectedStudentModal.recentActions && selectedStudentModal.recentActions.length > 0 ? selectedStudentModal.recentActions : [
                  { action: "Set hostel AC to 26°C with ceiling fan assist", date: "Today, 14:10", co2Kg: 1.2, points: 25 },
                  { action: "Dining mess zero organic food-waste tray", date: "Today, 13:00", co2Kg: 0.8, points: 20 },
                  { action: "Switched off laptop & desk plug sockets overnight", date: "Yesterday", co2Kg: 0.4, points: 15 }
                ]).map((act, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{act.action}</p>
                      <p className="text-[10px] text-slate-400">{act.date} • Verified in Campus Squad Ledger</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs block">+{act.points} pts</span>
                      <span className="text-[10px] text-slate-400 font-mono">-{act.co2Kg} kg CO₂</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudentModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 text-xs font-semibold"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
