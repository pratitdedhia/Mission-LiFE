import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  User, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  GraduationCap,
  SunMedium,
  Building2,
  Check,
  Upload,
  FileCheck
} from 'lucide-react';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithDemoPreset,
  loginWithGoogle,
  loginWithGoogleInstant 
} from '../services/authService';
import { DEMO_USERS } from '../data/initialData';
import { BRANDING } from '../config/branding';
import { POPULAR_UNIVERSITIES, DEPARTMENTS, submitStudentVerification } from '../services/studentVerificationService';

const ROLES = [
  { id: 'citizen', label: 'Citizen', icon: '🌱' },
  { id: 'student', label: 'Student', icon: '🎒' },
  { id: 'campus_leader', label: 'Campus Leader', icon: '🎓' },
  { id: 'solar_vendor', label: 'Solar Partner', icon: '☀️' },
  { id: 'admin', label: 'State Admin', icon: '🏛️' }
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'

  useEffect(() => {
    if (isOpen && initialMode) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [email, setEmail] = useState(DEMO_USERS.citizen.email);
  const [password, setPassword] = useState(DEMO_USERS.citizen.password);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [district, setDistrict] = useState('Ahmedabad');

  // Student-specific registration state
  const [studentUniversity, setStudentUniversity] = useState('IIT Gandhinagar');
  const [studentCollegeId, setStudentCollegeId] = useState('');
  const [studentDepartment, setStudentDepartment] = useState('Computer Science & Engineering');
  const [studentYear, setStudentYear] = useState('2nd Year (Batch 2023-27)');
  const [studentHostel, setStudentHostel] = useState('Hostel Hall 5 (Sabarmati)');
  const [studentIdCardPreview, setStudentIdCardPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleNotice, setGoogleNotice] = useState(null);

  const handleStudentIdUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentIdCardPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // When selected role changes in login mode, prefill demo credentials for convenience
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    if (mode === 'login' && DEMO_USERS[roleId]) {
      setEmail(DEMO_USERS[roleId].email);
      setPassword(DEMO_USERS[roleId].password);
    }
    setError(null);
    setGoogleNotice(null);
  };

  const handleQuickPresetLogin = async (roleKey) => {
    setLoading(true);
    setError(null);
    setGoogleNotice(null);
    try {
      const res = await loginWithDemoPreset(roleKey);
      setLoading(false);
      if (res.success) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setError(res.error || "Failed to switch demo profile.");
      }
    } catch (e) {
      setLoading(false);
      setError("Login error: " + e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGoogleNotice(null);

    let res;
    if (mode === 'login') {
      res = await loginWithEmail(email, password, selectedRole);
    } else {
      const extraMetadata = selectedRole === 'student' ? {
        universityName: studentUniversity,
        campusName: `${studentUniversity} Eco Squad`,
        collegeId: studentCollegeId.trim().toUpperCase() || '23BCE094',
        department: studentDepartment,
        yearOfStudy: studentYear,
        residenceType: studentHostel,
        idCardPhotoUrl: studentIdCardPreview || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
        verificationStatus: "pending",
        verifiedBy: null,
        campusLeaderName: "Aarav Mehta"
      } : {};

      res = await registerWithEmail(email, password, displayName, district, selectedRole, extraMetadata);

      if (res.success && selectedRole === 'student') {
        submitStudentVerification({
          userId: res.user.id,
          studentName: res.user.name,
          studentEmail: res.user.email,
          universityName: studentUniversity,
          collegeId: studentCollegeId.trim().toUpperCase() || '23BCE094',
          department: studentDepartment,
          yearOfStudy: studentYear,
          residenceType: studentHostel,
          idCardPhotoUrl: studentIdCardPreview || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80"
        });
      }
    }

    setLoading(false);
    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || "Authentication failed. Please check credentials.");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setGoogleNotice(null);

    const res = await loginWithGoogle(selectedRole);
    setLoading(false);

    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
      return;
    }

    if (res.cancelled) {
      // User dismissed Google popup window
      return;
    }

    // Handle Firebase configuration or domain restrictions gracefully
    const roleLabel = currentRoleObj.label;
    if (res.code === 'auth/unauthorized-domain') {
      setGoogleNotice({
        title: 'Domain Not Whitelisted in Firebase Console',
        message: 'The current domain (pratitdedhia.github.io) is not yet listed in Firebase Console > Authentication > Settings > Authorized Domains. You can proceed immediately with verified Google profile simulation below.',
        actionLabel: `Continue as Google ${roleLabel} (Instant Mode)`
      });
    } else if (res.code === 'auth/operation-not-allowed') {
      setGoogleNotice({
        title: 'Google Sign-In Provider Disabled',
        message: 'Google Sign-In is pending activation in Firebase Console > Authentication > Sign-in method. You can enter instantly in verified demo mode below.',
        actionLabel: `Continue as Google ${roleLabel} (Instant Mode)`
      });
    } else if (res.code === 'auth/popup-blocked') {
      setGoogleNotice({
        title: 'Browser Blocked Popup',
        message: 'The browser blocked the Google authentication popup. Allow popups for this page or proceed instantly below.',
        actionLabel: `Continue as Google ${roleLabel} (Instant Mode)`
      });
    } else {
      setGoogleNotice({
        title: 'Google Sign-In Notice',
        message: res.error || 'Authentication provider connection unavailable. You can proceed instantly in verified mode below.',
        actionLabel: `Continue as Google ${roleLabel} (Instant Mode)`
      });
    }
  };

  const handleInstantGoogleAccess = () => {
    const res = loginWithGoogleInstant(selectedRole);
    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentRoleObj = ROLES.find(r => r.id === selectedRole) || ROLES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-[500px] my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {BRANDING.name} Portal Login
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to access your role-based dashboard
          </p>
        </div>

        {/* Role Selector: "I AM SIGNING IN AS" */}
        <div className="mb-5">
          <p className="text-[11px] font-bold text-center tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2.5 font-mono">
            I AM SIGNING IN AS
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-sm">{role.icon}</span>
                  <span className="truncate">{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Google SSO Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 mb-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin flex-shrink-0" />
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{loading ? 'Connecting with Google...' : `Continue with Google as ${currentRoleObj.label.toUpperCase()}`}</span>
        </button>

        {/* Google Guidance & Instant Access Fallback */}
        {googleNotice && (
          <div className="mb-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 rounded-2xl text-xs space-y-2.5 animate-fade-in">
            <div className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
              <span className="text-base leading-none">⚠️</span>
              <div>
                <p className="font-bold text-xs">{googleNotice.title}</p>
                <p className="text-[11px] font-normal text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                  {googleNotice.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleInstantGoogleAccess}
              className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow"
            >
              <span>{googleNotice.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Divider: OR CONTINUE WITH EMAIL */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Or continue with email
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {selectedRole === 'student' ? 'Student Full Name' : 'Full Name / Entity Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={selectedRole === 'student' ? "e.g. Priyan Patel" : "e.g. Pooja Patel or Solar Tech LLP"}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gujarat District
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                  >
                    {["Ahmedabad", "Gandhinagar", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Kutch", "Anand", "Bharuch"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedRole === 'student' && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
                    <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>University Student Verification Details</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      University / Institute
                    </label>
                    <select
                      value={studentUniversity}
                      onChange={(e) => setStudentUniversity(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                    >
                      {POPULAR_UNIVERSITIES.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Student Roll / ID No.
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 23BCE094"
                        value={studentCollegeId}
                        onChange={(e) => setStudentCollegeId(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Department / Branch
                      </label>
                      <select
                        value={studentDepartment}
                        onChange={(e) => setStudentDepartment(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                      >
                        {DEPARTMENTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Year of Study
                      </label>
                      <select
                        value={studentYear}
                        onChange={(e) => setStudentYear(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                      >
                        <option value="1st Year (Batch 2024-28)">1st Year (Batch 2024-28)</option>
                        <option value="2nd Year (Batch 2023-27)">2nd Year (Batch 2023-27)</option>
                        <option value="3rd Year (Batch 2022-26)">3rd Year (Batch 2022-26)</option>
                        <option value="4th Year (Batch 2021-25)">4th Year (Batch 2021-25)</option>
                        <option value="Postgraduate / PhD">Postgraduate / PhD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Hostel / Residence Block
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hostel Hall 5 (Sabarmati)"
                        value={studentHostel}
                        onChange={(e) => setStudentHostel(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Upload College Student ID Card (Photo Proof)
                    </label>
                    <div className="relative border-2 border-dashed border-indigo-200 dark:border-indigo-800/80 rounded-xl p-3 text-center bg-white/70 dark:bg-slate-800/60 hover:bg-white transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleStudentIdUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {studentIdCardPreview ? (
                        <div className="flex items-center justify-center gap-3">
                          <img
                            src={studentIdCardPreview}
                            alt="Student ID Preview"
                            className="w-12 h-12 object-cover rounded-lg border border-indigo-300 shadow-xs"
                          />
                          <div className="text-left">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <Check className="w-3.5 h-3.5" /> ID Card Photo Attached
                            </span>
                            <p className="text-[10px] text-slate-400">Click to change photo file</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Upload className="w-5 h-5 text-indigo-500" />
                          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                            Click to browse institutional ID card
                          </span>
                          <span className="text-[10px] text-slate-400">
                            JPG, PNG or WEBP (Max 5MB)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-200 leading-snug">
                    <span className="font-bold">Campus Leader Verification:</span> Your ID card is submitted to your university Campus Leader for verification. Once approved, your daily eco actions and points will actively boost your university's ranking.
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="canteen@dtu.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert("Password reset link has been queued for: " + email)}
                  className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500/30 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">Remember me for 30 days</span>
            </label>
          </div>

          {/* Main Sign In CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In' : 'Create Account')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => setMode('signup')} 
                className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Register Here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button 
                type="button"
                onClick={() => setMode('login')} 
                className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

        {/* Quick Demo Login Presets bar matching the reference image */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold tracking-wider font-mono uppercase">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>⚡ Quick Demo Login Presets:</span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickPresetLogin('citizen')}
              className="py-1.5 px-1.5 rounded-full border border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-semibold transition-colors cursor-pointer text-center truncate"
            >
              Citizen
            </button>

            <button
              type="button"
              onClick={() => handleQuickPresetLogin('student')}
              className="py-1.5 px-1.5 rounded-full border border-indigo-500 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[11px] font-semibold transition-colors cursor-pointer text-center truncate"
            >
              Student
            </button>

            <button
              type="button"
              onClick={() => handleQuickPresetLogin('campus_leader')}
              className="py-1.5 px-1.5 rounded-full border border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[11px] font-semibold transition-colors cursor-pointer text-center truncate"
            >
              Campus Leader
            </button>

            <button
              type="button"
              onClick={() => handleQuickPresetLogin('solar_vendor')}
              className="py-1.5 px-1.5 rounded-full border border-amber-500 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-[11px] font-semibold transition-colors cursor-pointer text-center truncate"
            >
              Solar Partner
            </button>

            <button
              type="button"
              onClick={() => handleQuickPresetLogin('admin')}
              className="py-1.5 px-1.5 rounded-full border border-slate-400 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold transition-colors cursor-pointer text-center truncate"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Security Footnote matching reference style */}
        <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Firebase Auth, Cloud Firestore & Firebase Storage integration</span>
        </div>

      </div>
    </div>
  );
}
