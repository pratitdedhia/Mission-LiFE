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
  FileCheck,
  Clock,
  CheckCircle2,
  Phone,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithDemoPreset,
  loginWithGoogle,
  loginWithGoogleInstant 
} from '../services/authService';
import { DEMO_USERS, GUJARAT_DISTRICTS } from '../data/initialData';
import { BRANDING } from '../config/branding';
import { POPULAR_UNIVERSITIES, DEPARTMENTS, submitStudentVerification } from '../services/studentVerificationService';
import { createManagedUser } from '../services/userManagementService';

const ROLES = [
  { 
    id: 'citizen', 
    label: 'Citizen', 
    icon: '🌱',
    fullTitle: 'Residential Citizen',
    approvalBadge: 'Instant Activation',
    approvalType: 'instant',
    approvalAuthority: null,
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: 'Residential citizen of Gujarat • No approval needed, begin tracking habits immediately.'
  },
  { 
    id: 'student', 
    label: 'Student', 
    icon: '🎒',
    fullTitle: 'Student Volunteer',
    approvalBadge: 'To be approved by Campus Leader',
    approvalType: 'campus_leader',
    approvalAuthority: 'Campus Youth Leader',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    description: 'University / college student • ID proof verified by your Campus Leader before points credit.'
  },
  { 
    id: 'solar_vendor', 
    label: 'Solar Partner', 
    icon: '☀️',
    fullTitle: 'GEDA Empanelled Solar Installer',
    approvalBadge: 'To be approved by Admin',
    approvalType: 'admin',
    approvalAuthority: 'GEDA State Admin',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: 'Empanelled solar contractor • Verified by GEDA State Admin to receive rooftop leads and dispatch quotes.'
  },
  { 
    id: 'campus_leader', 
    label: 'Campus Leader', 
    icon: '🎓',
    fullTitle: 'Campus Youth Leader',
    approvalBadge: 'To be approved by Admin',
    approvalType: 'admin',
    approvalAuthority: 'GEDA State Admin',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    description: 'Designated campus climate lead • Approved by GEDA State Admin to audit student verifications.'
  },
  { 
    id: 'admin', 
    label: 'State Admin', 
    icon: '🏛️',
    fullTitle: 'GEDA State Energy Officer',
    approvalBadge: 'To be approved by Campus Leader',
    approvalType: 'campus_leader',
    approvalAuthority: 'Campus Leader / Oversight Directorate',
    badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    description: 'State agency energy officer • High-level oversight for Gujarat Energy Development Agency planning.'
  }
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'

  useEffect(() => {
    if (isOpen && initialMode) {
      setMode(initialMode);
      setSubmittedApproval(null);
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

  // Solar Vendor-specific registration state
  const [vendorCompanyName, setVendorCompanyName] = useState('');
  const [vendorLicenseId, setVendorLicenseId] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorSpecialty, setVendorSpecialty] = useState('PM Surya Ghar Rooftop On-Grid Systems');

  // Campus Leader-specific registration state
  const [leaderCampusName, setLeaderCampusName] = useState('IIT Gandhinagar');
  const [leaderRoleTitle, setLeaderRoleTitle] = useState('Eco-Squad Convener & Youth Fellow');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderYear, setLeaderYear] = useState('3rd Year');

  // State Admin-specific registration state
  const [adminDepartment, setAdminDepartment] = useState('Directorate of Energy Conservation & Solar');
  const [adminEmployeeCode, setAdminEmployeeCode] = useState('');
  const [adminPhone, setAdminPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleNotice, setGoogleNotice] = useState(null);
  const [submittedApproval, setSubmittedApproval] = useState(null);

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
    } else if (mode === 'signup') {
      setEmail('');
      setPassword('');
      setDisplayName('');
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
    setError(null);
    setGoogleNotice(null);

    // Validate genuine required fields
    if (mode === 'signup') {
      if (!displayName.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!password || password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }

      // Role specific genuine requirements
      if (selectedRole === 'student') {
        if (!studentCollegeId.trim()) {
          setError("Please provide your Student Roll / Enrollment ID.");
          return;
        }
        if (!studentIdCardPreview) {
          setError("Institutional Student ID Card photo proof is required to verify your enrollment.");
          return;
        }
      } else if (selectedRole === 'solar_vendor') {
        if (!vendorCompanyName.trim()) {
          setError("Please provide your Enterprise / Company Name.");
          return;
        }
        if (!vendorLicenseId.trim()) {
          setError("Please provide your GEDA Empanelment License No. or GSTIN.");
          return;
        }
        if (!vendorPhone.trim()) {
          setError("Please provide a contact phone / helpline number.");
          return;
        }
      } else if (selectedRole === 'campus_leader') {
        if (!leaderRoleTitle.trim()) {
          setError("Please specify your Student Council or Eco-Squad leadership designation.");
          return;
        }
        if (!leaderPhone.trim()) {
          setError("Please provide your contact phone number.");
          return;
        }
      } else if (selectedRole === 'admin') {
        if (!adminEmployeeCode.trim()) {
          setError("Please enter your GEDA Officer Employee Code or State Authorization Passcode.");
          return;
        }
      }
    } else {
      if (!email.trim()) {
        setError("Please enter your registered email address.");
        return;
      }
      if (!password) {
        setError("Please enter your password.");
        return;
      }
    }

    setLoading(true);

    if (mode === 'login') {
      const res = await loginWithEmail(email, password, selectedRole);
      setLoading(false);
      if (res.success) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setError(res.error || "Authentication failed. Please check credentials.");
      }
      return;
    }

    // REGISTRATION WORKFLOW
    const roleMeta = ROLES.find(r => r.id === selectedRole) || ROLES[0];
    const isApprovalRequired = roleMeta.approvalType !== 'instant';
    const accountStatus = isApprovalRequired ? 'pending' : 'active';

    let extraMetadata = {
      status: accountStatus,
      approvalRequiredBy: roleMeta.approvalType,
      roleTitle: roleMeta.fullTitle
    };

    if (selectedRole === 'student') {
      extraMetadata = {
        ...extraMetadata,
        universityName: studentUniversity,
        campusName: `${studentUniversity} Eco Squad`,
        collegeId: studentCollegeId.trim().toUpperCase(),
        department: studentDepartment,
        yearOfStudy: studentYear,
        residenceType: studentHostel || "Campus Housing",
        idCardPhotoUrl: studentIdCardPreview,
        verificationStatus: "pending",
        verifiedBy: null,
        campusLeaderName: "Aarav Mehta"
      };
    } else if (selectedRole === 'solar_vendor') {
      extraMetadata = {
        ...extraMetadata,
        companyName: vendorCompanyName.trim(),
        licenseId: vendorLicenseId.trim().toUpperCase(),
        phone: vendorPhone.trim(),
        solarStatus: "Empanelment Application Pending",
        specialty: vendorSpecialty
      };
    } else if (selectedRole === 'campus_leader') {
      extraMetadata = {
        ...extraMetadata,
        campusName: `${leaderCampusName} Eco Squad`,
        universityName: leaderCampusName,
        roleTitle: leaderRoleTitle.trim(),
        phone: leaderPhone.trim(),
        yearOfStudy: leaderYear
      };
    } else if (selectedRole === 'admin') {
      extraMetadata = {
        ...extraMetadata,
        department: adminDepartment,
        employeeCode: adminEmployeeCode.trim().toUpperCase(),
        phone: adminPhone.trim() || "+91 79 2325 7200"
      };
    }

    const res = await registerWithEmail(email, password, displayName, district, selectedRole, extraMetadata);

    if (res.success) {
      // Record in student ledger if student
      if (selectedRole === 'student') {
        submitStudentVerification({
          userId: res.user.id,
          studentName: displayName,
          studentEmail: email,
          universityName: studentUniversity,
          collegeId: studentCollegeId.trim().toUpperCase(),
          department: studentDepartment,
          yearOfStudy: studentYear,
          residenceType: studentHostel,
          idCardPhotoUrl: studentIdCardPreview
        });
      }

      // Record in statewide managed users repository
      createManagedUser({
        id: res.user.id,
        name: displayName,
        email: email,
        role: selectedRole,
        roleTitle: roleMeta.fullTitle,
        district: district,
        phone: vendorPhone || leaderPhone || adminPhone || "+91 98000 00000",
        status: accountStatus,
        approvalRequiredBy: roleMeta.approvalType,
        ...extraMetadata
      });

      setLoading(false);

      if (isApprovalRequired) {
        // Show approval workflow notice screen
        setSubmittedApproval({
          role: selectedRole,
          roleLabel: roleMeta.fullTitle,
          authority: roleMeta.approvalAuthority,
          user: res.user,
          approvalType: roleMeta.approvalType
        });
      } else {
        // Citizen: instant success
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        onAuthSuccess(res.user);
        onClose();
      }
    } else {
      setLoading(false);
      setError(res.error || "Registration failed. Please check information.");
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

    if (res.cancelled) return;

    const roleLabel = currentRoleObj.label;
    setGoogleNotice({
      title: 'Google Sign-In Notice',
      message: res.error || 'Authentication provider connection unavailable. You can proceed instantly in verified mode below.',
      actionLabel: `Continue as Google ${roleLabel} (Instant Mode)`
    });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-[540px] my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all max-h-[94vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* REGISTRATION SUBMISSION APPROVAL SCREEN */}
        {submittedApproval ? (
          <div className="space-y-5 text-center py-2 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5 font-mono">
                <span>Application Submitted • Pending Approval</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                Registration Successful
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Your account for <strong>{displayName}</strong> has been registered under <strong>{submittedApproval.roleLabel}</strong>.
              </p>
            </div>

            {/* Workflow Explanatory Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Approval Authority: {submittedApproval.authority}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-[11px]">
                    {submittedApproval.role === 'solar_vendor' && (
                      "Your GEDA empanelment license and company credentials have been sent to the GEDA State Directorate for review. Once verified, you will be authorized to receive citizen inquiries and submit quotations."
                    )}
                    {submittedApproval.role === 'student' && (
                      "Your institutional student ID card has been routed to Aarav Mehta (Campus Youth Leader). Once approved, your daily habit actions will credit points to your university's ranking."
                    )}
                    {submittedApproval.role === 'campus_leader' && (
                      "Your Campus Youth Leader fellowship registration is pending approval by the GEDA State Directorate. Once cleared, you will have authority to audit student IDs and launch campus sprints."
                    )}
                    {submittedApproval.role === 'admin' && (
                      "State Administrator access has been requested. Per dual-governance protocol, clearance is reviewed by the Campus Leadership Directorate."
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Account Status:</span>
                <span className="font-bold font-mono text-amber-600 dark:text-amber-400">● Pending Verification</span>
              </div>
            </div>

            <button
              onClick={() => {
                onAuthSuccess(submittedApproval.user);
                onClose();
              }}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Proceed to Portal (Preview Mode)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-5">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {mode === 'signup' ? 'Create Mission LiFE Account' : `${BRANDING.name} Portal Login`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'signup' 
                  ? 'Register as citizen, student, solar partner, campus leader, or state admin'
                  : 'Sign in to access your role-based dashboard'}
              </p>
            </div>

            {/* PROMINENT TOP SEGMENTED TAB BUTTONS: SIGN IN vs REGISTER */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-5 border border-slate-200/80 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-emerald-800 text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Register / Create Account</span>
              </button>
            </div>

            {/* ROLE SELECTOR: 5 IDENTITIES WITH APPROVAL STATUS PILLS */}
            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
                  {mode === 'signup' ? '1. SELECT IDENTITY TO REGISTER AS:' : 'I AM SIGNING IN AS:'}
                </p>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${currentRoleObj.badgeColor}`}>
                  {currentRoleObj.approvalBadge}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-800 text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span className="text-base mb-0.5">{role.icon}</span>
                      <span className="truncate">{role.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Informative Approval Description Pill */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{currentRoleObj.description}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Notice Box if popup blocked */}
            {googleNotice && (
              <div className="p-3.5 mb-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-xs space-y-2">
                <p className="font-bold text-amber-800 dark:text-amber-200">{googleNotice.title}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">{googleNotice.message}</p>
                <button
                  type="button"
                  onClick={handleInstantGoogleAccess}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {googleNotice.actionLabel}
                </button>
              </div>
            )}

            {/* GOOGLE ONE-CLICK AUTH (for Citizen or instant roles) */}
            {mode === 'login' && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google as {currentRoleObj.label.toUpperCase()}</span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono">
                    <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">
                      OR CONTINUE WITH EMAIL
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* MAIN AUTHENTICATION & REGISTRATION FORM */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                    {selectedRole === 'solar_vendor' ? "Authorized Contact Person Name *" : "Full Legal Name *"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder={
                        selectedRole === 'student' ? "e.g. Priyan Patel" :
                        selectedRole === 'solar_vendor' ? "e.g. Rajesh Shah" :
                        selectedRole === 'campus_leader' ? "e.g. Aarav Mehta" :
                        selectedRole === 'admin' ? "e.g. Dr. Neha Joshi" : "e.g. Pooja Patel"
                      }
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                  {selectedRole === 'student' ? "Institutional Student Email (.ac.in / .edu) *" : 
                   selectedRole === 'solar_vendor' ? "Business / Work Email *" : 
                   selectedRole === 'admin' ? "Official Government Email (@geda.gujarat.gov.in) *" : "Email Address *"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder={
                      selectedRole === 'student' ? "student.priyan@iitgn.ac.in" :
                      selectedRole === 'solar_vendor' ? "vendor.rajesh@suryaurjagujarat.in" :
                      selectedRole === 'campus_leader' ? "campus.aarav@iitgn.ac.in" :
                      selectedRole === 'admin' ? "admin.neha@geda.gujarat.gov.in" : "citizen.pooja@gujaratlife.in"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">Password *</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => alert("Demo Password: Password123!\nYou can also click any of the 5 quick demo preset pills below for instant login.")}
                      className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* District Selector (for signups) */}
              {mode === 'signup' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                    Gujarat District *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {GUJARAT_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* ROLE-SPECIFIC FIELDS: STUDENT REGISTRATION                        */}
              {/* ================================================================= */}
              {mode === 'signup' && selectedRole === 'student' && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-indigo-100 dark:border-indigo-900/60">
                    <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Academic & Enrollment Credentials</span>
                    </span>
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                      Campus Leader Verified
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">University / Institute *</label>
                    <select
                      value={studentUniversity}
                      onChange={(e) => setStudentUniversity(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    >
                      {POPULAR_UNIVERSITIES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">Student Roll ID *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 23BCE094"
                        value={studentCollegeId}
                        onChange={(e) => setStudentCollegeId(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white uppercase font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">Year of Study *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2nd Year (Batch 2023-27)"
                        value={studentYear}
                        onChange={(e) => setStudentYear(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">Department / Branch *</label>
                    <select
                      value={studentDepartment}
                      onChange={(e) => setStudentDepartment(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">Hostel / Residence Block *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hostel Hall 5 (Sabarmati) or Day Scholar"
                      value={studentHostel}
                      onChange={(e) => setStudentHostel(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      Upload Institutional Student ID Card Proof *
                    </label>
                    <div className="p-3 bg-white dark:bg-slate-800 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl text-center">
                      {studentIdCardPreview ? (
                        <div className="flex items-center justify-between gap-2">
                          <img src={studentIdCardPreview} alt="ID preview" className="w-10 h-10 object-cover rounded-lg border" />
                          <span className="text-[11px] font-bold text-emerald-600">ID Photo Attached</span>
                          <button
                            type="button"
                            onClick={() => setStudentIdCardPreview(null)}
                            className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center gap-1 text-[11px] text-indigo-700 dark:text-indigo-300 hover:underline">
                          <Upload className="w-4 h-4" />
                          <span>Click to select college ID card photo</span>
                          <input type="file" accept="image/*" onChange={handleStudentIdUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* ROLE-SPECIFIC FIELDS: SOLAR VENDOR (TO BE APPROVED BY ADMIN)      */}
              {/* ================================================================= */}
              {mode === 'signup' && selectedRole === 'solar_vendor' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-amber-100 dark:border-amber-900/60">
                    <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <SunMedium className="w-3.5 h-3.5 text-amber-600" />
                      <span>Solar Fitting Enterprise Credentials</span>
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono font-bold">
                      Admin Approved
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      Company / Enterprise Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Surya Urja Solutions Gujarat LLP"
                      value={vendorCompanyName}
                      onChange={(e) => setVendorCompanyName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        GEDA License / GSTIN *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. GEDA-EMP-2026-088"
                        value={vendorLicenseId}
                        onChange={(e) => setVendorLicenseId(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white uppercase font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        Helpline / Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 79 2658 9100"
                        value={vendorPhone}
                        onChange={(e) => setVendorPhone(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      Installation Specialization
                    </label>
                    <input
                      type="text"
                      value={vendorSpecialty}
                      onChange={(e) => setVendorSpecialty(e.target.value)}
                      placeholder="e.g. PM Surya Ghar On-Grid Rooftop & Net-Metering"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* ROLE-SPECIFIC FIELDS: CAMPUS LEADER (TO BE APPROVED BY ADMIN)     */}
              {/* ================================================================= */}
              {mode === 'signup' && selectedRole === 'campus_leader' && (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-blue-100 dark:border-blue-900/60">
                    <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      <span>Campus Youth Climate Leadership Appointment</span>
                    </span>
                    <span className="text-[10px] text-blue-700 dark:text-blue-300 font-mono font-bold">
                      Admin Approved
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      Designated University / Campus *
                    </label>
                    <select
                      value={leaderCampusName}
                      onChange={(e) => setLeaderCampusName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    >
                      {POPULAR_UNIVERSITIES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        Leadership Role *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Eco-Squad Convener"
                        value={leaderRoleTitle}
                        onChange={(e) => setLeaderRoleTitle(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 97129 44321"
                        value={leaderPhone}
                        onChange={(e) => setLeaderPhone(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* ROLE-SPECIFIC FIELDS: STATE ADMIN (TO BE APPROVED BY CAMPUS LEADER) */}
              {/* ================================================================= */}
              {mode === 'signup' && selectedRole === 'admin' && (
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                      <span>GEDA Directorate Clearance Credentials</span>
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold">
                      Campus Leader Clearance
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      Directorate Wing / Department *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Directorate of Energy Conservation & Solar"
                      value={adminDepartment}
                      onChange={(e) => setAdminDepartment(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        Officer / Passcode Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. GEDA-OFFICER-2026-AHM"
                        value={adminEmployeeCode}
                        onChange={(e) => setAdminEmployeeCode(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white uppercase font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        Official Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 79 2325 7200"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <span>
                  {loading 
                    ? "Processing..." 
                    : mode === 'signup' 
                      ? (currentRoleObj.approvalType === 'instant' ? "Create Account & Sign In →" : `Submit Registration (${currentRoleObj.approvalBadge}) →`)
                      : "Sign In →"}
                </span>
              </button>
            </form>

            {/* QUICK DEMO PRESETS (when in login mode) */}
            {mode === 'login' && (
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
            )}

            {/* Bottom Toggle Note */}
            <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); }} 
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
                    onClick={() => { setMode('login'); setError(null); }} 
                    className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>

            {/* Security Footnote */}
            <div className="mt-4 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>Authoritative Role-Based Access Control • Gujarat Energy Development Agency</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
