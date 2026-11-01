import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trophy, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  Zap, 
  Camera, 
  ExternalLink,
  ChevronRight,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  POPULAR_UNIVERSITIES, 
  DEPARTMENTS, 
  getStudentVerificationForUser, 
  submitStudentVerification 
} from '../services/studentVerificationService';

export default function StudentPortal({ user, onNavigate }) {
  const [verification, setVerification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [universityName, setUniversityName] = useState('IIT Gandhinagar');
  const [customUniversity, setCustomUniversity] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('2nd Year (Batch 2023-27)');
  const [residenceType, setResidenceType] = useState('Hostel Hall 5 (Sabarmati)');
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    loadUserVerification();
  }, [user]);

  const loadUserVerification = () => {
    const record = getStudentVerificationForUser(user.id, user.email);
    setVerification(record);
    if (record) {
      setUniversityName(record.universityName || 'IIT Gandhinagar');
      setCollegeId(record.collegeId || '');
      setDepartment(record.department || 'Computer Science & Engineering');
      setYearOfStudy(record.yearOfStudy || '2nd Year');
      setResidenceType(record.residenceType || 'Hostel');
      setIdCardPreview(record.idCardPhotoUrl || null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdCardFile(file);
      const url = URL.createObjectURL(file);
      setIdCardPreview(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!collegeId.trim()) {
      showNotification("Please enter your Student Roll / Enrollment ID.");
      return;
    }

    if (!idCardPreview && !idCardFile) {
      showNotification("Please upload your institutional student ID card photo proof for verification.");
      return;
    }

    setSubmitting(true);
    const finalUni = universityName === 'Other' ? (customUniversity || "Gujarat University") : universityName;

    // Use uploaded preview URL or fallback
    const photoUrl = idCardPreview || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80";

    const saved = submitStudentVerification({
      userId: user.id,
      studentName: user.name || "Student Volunteer",
      studentEmail: user.email || "student@iitgn.ac.in",
      universityName: finalUni,
      collegeId: collegeId.toUpperCase().trim(),
      department,
      yearOfStudy,
      residenceType,
      idCardPhotoUrl: photoUrl
    });

    setVerification(saved);
    setSubmitting(false);
    setIsEditing(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showNotification("Student ID submitted! Your Campus Leader has been notified for verification.");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-semibold animate-fade-in border border-slate-700">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                Mission LiFE Campus Eco-Squad
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                Gujarat Youth Climate Wing
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student Sustainability Portal
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              Verify your institutional student ID with your university's designated Campus Leader. All personal habit actions directly contribute to your university squad's statewide green ranking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('community')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>Campus Rankings</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW STATE 1: VERIFIED STUDENT ECO-BADGE & CAMPUS CONTRIBUTION */}
      {verification && verification.status === 'verified' && !isEditing && (
        <div className="space-y-6">
          
          {/* Official Verified Student Pass */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <GraduationCap className="w-9 h-9" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {verification.studentName}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Campus Eco-Student
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{verification.universityName}</span> • Roll No: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{verification.collegeId}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {verification.department} • {verification.residenceType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Update ID Details
                </button>
              </div>
            </div>

            {/* University & Individual Impact Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono block">Your Squad Contribution</span>
                <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200 font-mono mt-0.5 block">+{verification.totalPoints || 375}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">LiFE+ points added</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 font-mono block">Personal CO₂ Avoided</span>
                <span className="text-2xl font-black text-blue-800 dark:text-blue-200 font-mono mt-0.5 block">{verification.co2SavedKg || 21.6} <span className="text-xs font-normal">kg</span></span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400">Audited campus habits</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono block">Campus State Rank</span>
                <span className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono mt-0.5 block">Rank #1</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400">Gujarat University League</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block">Verified Actions Log</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">{verification.actionsCount || 14}</span>
                <span className="text-[10px] text-slate-500">Actions completed</span>
              </div>
            </div>

            {/* Quick Sprints Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Active Campus Sustainability Challenge</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Inter-Hostel AC 26°C & Zero-Food-Waste Mess Sprint active now.</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('missions')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <span>Take Campus Micro-Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Student Actions History Feed */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Your Audited Campus Actions Log</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Audited by Aarav Mehta (Campus Leader)
              </span>
            </div>

            <div className="space-y-2.5">
              {(verification.recentActions && verification.recentActions.length > 0 ? verification.recentActions : [
                { action: "Set hostel AC to 26°C with ceiling fan assist", date: "Today, 14:10", co2Kg: 1.2, points: 25 },
                { action: "Dining mess zero organic food-waste tray", date: "Today, 13:00", co2Kg: 0.8, points: 20 },
                { action: "Switched off laptop & desk plug sockets overnight", date: "Yesterday", co2Kg: 0.4, points: 15 },
                { action: "Used campus bicycle for Academic Block travel", date: "2 days ago", co2Kg: 1.6, points: 30 }
              ]).map((act, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{act.action}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{act.date} • Verified in Campus Squad Ledger</p>
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

      {/* VIEW STATE 2: PENDING VERIFICATION STATE */}
      {verification && verification.status === 'pending' && !isEditing && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center flex-shrink-0 text-xl font-bold">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  University ID Verification In Progress
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  Queued for Review
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Your credentials for <strong>{verification.universityName}</strong> have been submitted. Your designated Campus Youth Leader (<strong>Aarav Mehta</strong>) has received your roll number and ID proof for verification.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-mono block">Submitted Roll / College ID</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold text-sm mt-0.5 block">{verification.collegeId}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-mono block">Department & Batch</span>
              <span className="text-slate-900 dark:text-white font-medium text-sm mt-0.5 block">{verification.department}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-mono block">Hostel / Campus Housing</span>
              <span className="text-slate-900 dark:text-white font-medium text-sm mt-0.5 block">{verification.residenceType}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-mono block">Submission Date</span>
              <span className="text-slate-900 dark:text-white font-medium text-sm mt-0.5 block">
                {new Date(verification.submittedAt).toLocaleDateString()} at {new Date(verification.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">Need to update your ID photo or roll number?</span>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Edit Submitted Information
            </button>
          </div>
        </div>
      )}

      {/* VIEW STATE 3: REGISTRATION / EDITING FORM */}
      {(!verification || isEditing || verification.status === 'rejected') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>{isEditing ? "Update University Credentials" : "Register Student Credentials & College ID"}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Provide your university enrollment details. Once verified by your Campus Leader, your actions power your university squad.
              </p>
            </div>

            {isEditing && verification && (
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* University Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                University / Institute
                <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <select
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {POPULAR_UNIVERSITIES.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
                <option value="Other">Other University / College...</option>
              </select>

              {universityName === 'Other' && (
                <input
                  type="text"
                  required
                  placeholder="Enter your university or college name"
                  value={customUniversity}
                  onChange={(e) => setCustomUniversity(e.target.value)}
                  className="mt-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              )}
            </div>

            {/* Roll Number & Department Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Student Roll / Enrollment ID
                  <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 23BCE094 or IITGN-2024-EE12"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department / Branch
                  <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Academic Year & Residence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Year of Study
                  <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="1st Year (UG Freshers)">1st Year (UG Freshers)</option>
                  <option value="2nd Year (Batch 2023-27)">2nd Year (Batch 2023-27)</option>
                  <option value="3rd Year (Batch 2022-26)">3rd Year (Batch 2022-26)</option>
                  <option value="4th Year (Batch 2021-25)">4th Year (Batch 2021-25)</option>
                  <option value="Postgraduate / PhD Scholar">Postgraduate / PhD Scholar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Hostel / Residence Block <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Hall 5 (Sabarmati) or Day Scholar"
                  value={residenceType}
                  onChange={(e) => setResidenceType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* College ID Card Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Upload Student ID Card Photo (Proof)
                <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-800/40 transition-colors">
                {idCardPreview ? (
                  <div className="space-y-3">
                    <div className="max-w-xs mx-auto h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-sm">
                      <img src={idCardPreview} alt="ID Preview" className="w-full h-full object-cover" />
                    </div>
                    <label className="inline-block px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer">
                      Change ID Image
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Click to upload institutional ID card photo
                    </span>
                    <span className="text-[11px] text-slate-400">
                      JPEG, PNG or WEBP (Max 5MB)
                    </span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit ID for Campus Leader Verification</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

