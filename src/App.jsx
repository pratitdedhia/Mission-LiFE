import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FootprintCalculator from './components/FootprintCalculator';
import DailyMissions from './components/DailyMissions';
import CommunityImpact from './components/CommunityImpact';
import SolarAdvisor from './components/SolarAdvisor';
import GreenDirectory from './components/GreenDirectory';
import AICoach from './components/AICoach';
import ApplianceScanner from './components/ApplianceScanner';
import ApplianceInventoryPage from './app/inventory/page';
import AdminDashboard from './components/AdminDashboard';
import SolarVendorDashboard from './components/SolarVendorDashboard';
import CampusLeaderDashboard from './components/CampusLeaderDashboard';
import StudentPortal from './components/StudentPortal';
import InsightsView from './components/InsightsView';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import PledgeModal from './components/PledgeModal';
import OnboardingModal from './components/OnboardingModal';

import { INITIAL_USER, INITIAL_COMMUNITY } from './data/initialData';
import { BRANDING } from './config/branding';
import { isFirebaseConnected } from './firebase';
import { 
  syncInitialData, 
  saveUserFootprint, 
  recordMissionCompleted 
} from './services/firestoreService';
import { 
  getStoredUser, 
  saveStoredUser, 
  logoutUser, 
  subscribeAuth,
  isSessionActive,
  loginWithDemoPreset,
  loginAsGuest
} from './services/authService';
import { recordAuthoritativeMission } from './services/gamificationEngine';
import { recordStudentAction } from './services/studentVerificationService';
import { Check } from 'lucide-react';

export default function App() {
  // Always start fresh from the Landing Page when the link is opened
  const [currentView, setCurrentView] = useState('landing');
  const [authModalMode, setAuthModalMode] = useState('login');
  const [user, setUser] = useState(() => getStoredUser());
  const [community, setCommunity] = useState(() => {
    try {
      const saved = localStorage.getItem('life_community');
      return saved ? JSON.parse(saved) : INITIAL_COMMUNITY;
    } catch (e) {
      return INITIAL_COMMUNITY;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState('en');
  const [toast, setToast] = useState(null);

  // Unified theme management across Landing, Auth, and Dashboard
  // Default to 'light' for a clean, professional, high-contrast institutional aesthetic
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('life_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('life_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('life_theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPledgeOpen, setIsPledgeOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Check if first-time user
  useEffect(() => {
    const hasBaseline = localStorage.getItem('life_user_has_baseline');
    if (!hasBaseline && !user.hasCompletedOnboarding) {
      const timer = setTimeout(() => setIsOnboardingOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    saveStoredUser(user);
  }, [user]);

  useEffect(() => {
    localStorage.setItem('life_community', JSON.stringify(community));
  }, [community]);

  // Sync initial state with Firestore
  useEffect(() => {
    syncInitialData();
  }, []);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeAuth((remoteProfile) => {
      if (remoteProfile) {
        setUser(prev => ({ ...prev, ...remoteProfile }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Strict RBAC: Ensure role-isolated views
  useEffect(() => {
    const role = (user?.role || 'citizen').toLowerCase();
    if (role === 'solar_vendor' || role === 'solar_partner') {
      const allowedVendorTabs = ['solar_vendor', 'vendor_chat', 'vendor_grid', 'vendor_hardware', 'insights'];
      if (!allowedVendorTabs.includes(activeTab)) {
        setActiveTab('solar_vendor');
      }
    } else if (role === 'campus_leader') {
      const allowedCampusTabs = ['campus_leader', 'missions', 'community', 'scan', 'coach', 'insights'];
      if (!allowedCampusTabs.includes(activeTab)) {
        setActiveTab('campus_leader');
      }
    } else if (role === 'student') {
      const allowedStudentTabs = ['student_portal', 'inventory', 'missions', 'community', 'scan', 'coach', 'insights'];
      if (!allowedStudentTabs.includes(activeTab)) {
        setActiveTab('student_portal');
      }
    } else if (role === 'admin') {
      const allowedAdminTabs = ['admin', 'admin_impact', 'admin_users', 'admin_solar', 'directory', 'insights'];
      if (!allowedAdminTabs.includes(activeTab)) {
        setActiveTab('admin');
      }
    } else {
      // Citizen role - strict isolation: no student portal, solar partner, or admin tabs
      const citizenRestricted = ['admin', 'admin_impact', 'admin_users', 'admin_solar', 'solar_vendor', 'vendor_chat', 'vendor_grid', 'vendor_hardware', 'campus_leader', 'student_portal'];
      if (citizenRestricted.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [user?.role, activeTab]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3800);
  };

  // Behavior loop: Accept mission
  const handleAcceptMission = (missionId, points, co2Kg) => {
    const currentActive = user.activeMissions || [];
    if (!currentActive.includes(missionId)) {
      setUser(prev => ({
        ...prev,
        activeMissions: [...currentActive, missionId]
      }));
      showToast(`Mission accepted! Complete the task and record verification.`);
    }
  };

  // Behavior loop: Authoritative gamification engine completion
  const handleCompleteMission = async (missionId, points, co2Kg, proofData = null) => {
    // Strict Verification: High-value tasks require photo proof to prevent bypass
    if (points >= 20 && !proofData?.url) {
      showToast("Photo verification evidence is required to verify this mission and claim points.");
      return;
    }

    // 1. Authoritative validation via gamification engine (anti-duplicate check & streak bonus)
    const authResult = await recordAuthoritativeMission({
      userId: user.id || 'usr_guest',
      missionId,
      currentStreak: user.streak || 0,
      hasPhotoProof: Boolean(proofData?.url),
      photoProofUrl: proofData?.url || null,
      userCity: user.city || 'Ahmedabad',
      currentScore: user.lifeScore || 0
    });

    if (!authResult.success) {
      showToast(authResult.message || "This mission was already recorded today.");
      return;
    }

    const awardedPoints = authResult.awardedPoints;
    const verifiedCo2 = authResult.co2KgSaved;
    const newCompleted = [...(user.completedMissions || []), missionId];
    const newActive = (user.activeMissions || []).filter(id => id !== missionId);
    const newScore = user.lifeScore + awardedPoints;
    const newStreak = user.streak + 1;

    setUser(prev => ({
      ...prev,
      lifeScore: newScore,
      scoreTodayDelta: (prev.scoreTodayDelta || 0) + awardedPoints,
      streak: newStreak,
      activeMissions: newActive,
      completedMissions: newCompleted
    }));

    setCommunity(prev => ({
      ...prev,
      actionsCompleted: prev.actionsCompleted + 1,
      co2SavedKg: prev.co2SavedKg + Math.round(verifiedCo2)
    }));

    const proofMsg = proofData?.url ? " with photographic evidence" : "";
    const streakMsg = authResult.streakTier.multiplier > 1.0 ? ` (${authResult.streakTier.label})` : "";
    showToast(`Action recorded${proofMsg}! +${awardedPoints} pts${streakMsg}, -${verifiedCo2} kg CO₂.`);
    await recordMissionCompleted(user.id, missionId, awardedPoints, verifiedCo2, proofData);
    recordStudentAction(user.id, proofData?.title || "Completed Mission LiFE Action", awardedPoints, verifiedCo2);
  };

  const handleSaveProfile = async (updatedData) => {
    setUser(prev => ({
      ...prev,
      ...updatedData
    }));

    showToast("Carbon footprint recalculated and saved to profile.");
    await saveUserFootprint(user.id, updatedData);
  };

  const handleBaselineCompleted = async (baselineData) => {
    localStorage.setItem('life_user_has_baseline', 'true');
    const updated = {
      ...user,
      ...baselineData,
      lifeScore: Math.max(user.lifeScore, 700)
    };
    setUser(updated);
    showToast(`Welcome to ${BRANDING.name}, ${baselineData.name}! Baseline established.`);
    await saveUserFootprint(user.id, updated);
  };

  const handlePledgeSigned = async (pledgeData) => {
    const updated = {
      ...user,
      ...pledgeData,
      lifeScore: user.lifeScore + 100,
      badges: Array.from(new Set([...(user.badges || []), "prakriti_mitra"]))
    };
    setUser(updated);
    showToast("Pledge completed! Mission LiFE certificate generated.");
    await saveUserFootprint(user.id, updated);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setCurrentView('app');
    showToast(`Signed in as ${authenticatedUser.name} (${authenticatedUser.roleTitle || authenticatedUser.role})`);
    
    // Automatically route to their designated primary dashboard based on authoritative role
    const role = (authenticatedUser?.role || 'citizen').toLowerCase();
    if (role === 'solar_vendor' || role === 'solar_partner') {
      setActiveTab('solar_vendor');
    } else if (role === 'campus_leader') {
      setActiveTab('campus_leader');
    } else if (role === 'admin') {
      setActiveTab('admin');
    } else if (role === 'student') {
      setActiveTab('student_portal');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = async () => {
    const resetUser = await logoutUser();
    setUser(resetUser);
    setCurrentView('landing');
    setActiveTab('dashboard');
    showToast("Signed out. Returned to landing page.");
  };

  const handleLandingQuickDemo = async (roleKey) => {
    const res = await loginWithDemoPreset(roleKey);
    if (res.success) {
      handleAuthSuccess(res.user);
    }
  };

  const handleLandingGuest = async () => {
    const res = await loginAsGuest();
    if (res.success) {
      handleAuthSuccess(res.user);
    }
  };

  // Dedicated Landing Page View with Login & Register
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <LandingPage
          onOpenLogin={() => { setAuthModalMode('login'); setIsAuthOpen(true); }}
          onOpenRegister={() => { setAuthModalMode('signup'); setIsAuthOpen(true); }}
          onQuickDemoLogin={handleLandingQuickDemo}
          onEnterAsGuest={handleLandingGuest}
          lang={lang}
          setLang={setLang}
          theme={theme}
          isDark={theme === 'dark'}
          toggleTheme={toggleTheme}
        />

        {/* Auth Modal with Login / Register toggle */}
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-xl text-xs font-semibold animate-fade-in">
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{toast}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500/20 selection:text-emerald-800 dark:selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        user={user}
        theme={theme}
        isDark={theme === 'dark'}
        toggleTheme={toggleTheme}
        isFirebaseConnected={isFirebaseConnected}
        onOpenAuth={() => { setAuthModalMode('login'); setIsAuthOpen(true); }}
        onLogout={handleLogout}
        onOpenPledge={() => setIsPledgeOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Layout with Sidebar and Content Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
          onOpenPledge={() => setIsPledgeOpen(true)}
          user={user}
          onOpenAuth={() => { setAuthModalMode('login'); setIsAuthOpen(true); }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <ErrorBoundary key={activeTab}>
          {activeTab === 'dashboard' && (
            <Dashboard
              user={user}
              community={community}
              lang={lang}
              onAcceptMission={handleAcceptMission}
              onCompleteMission={handleCompleteMission}
              onNavigate={setActiveTab}
              onOpenAiRecommendation={() => setActiveTab('coach')}
              onOpenPledge={() => setIsPledgeOpen(true)}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {activeTab === 'footprint' && (
            <FootprintCalculator
              user={user}
              onSaveProfile={handleSaveProfile}
            />
          )}

          {activeTab === 'missions' && (
            <DailyMissions
              user={user}
              onAcceptMission={handleAcceptMission}
              onCompleteMission={handleCompleteMission}
              onNavigateToSolar={() => setActiveTab('solar')}
              onOpenPledge={() => setIsPledgeOpen(true)}
            />
          )}

          {activeTab === 'community' && (
            <CommunityImpact
              community={community}
              user={user}
            />
          )}

          {activeTab === 'solar' && (
            <SolarAdvisor
              user={user}
              onNavigateToDirectory={() => setActiveTab('directory')}
            />
          )}

          {activeTab === 'directory' && (
            <GreenDirectory
              onNavigateToSolar={() => setActiveTab('solar')}
            />
          )}

          {activeTab === 'coach' && (
            <AICoach
              user={user}
              onNavigate={setActiveTab}
              onCompleteMission={handleCompleteMission}
            />
          )}

          {activeTab === 'scan' && (
            <ApplianceScanner
              user={user}
              onNavigate={setActiveTab}
              onApplianceAdded={(newApp, allApps) => {
                setUser(prev => ({
                  ...prev,
                  appliances: allApps,
                  inventoryCount: allApps.length
                }));
                showToast(`Saved ${newApp.appliance_name} to your home inventory!`);
              }}
            />
          )}

          {activeTab === 'inventory' && (
            <ApplianceInventoryPage
              user={user}
              onNavigate={setActiveTab}
              onUserUpdate={(updatedUser) => {
                setUser(prev => ({ ...prev, ...updatedUser }));
                showToast("Dynamic baseline updated across your profile!");
              }}
            />
          )}

          {activeTab === 'student_portal' && (
            <StudentPortal
              user={user}
              onNavigate={setActiveTab}
            />
          )}

          {(activeTab === 'admin' || activeTab === 'admin_impact' || activeTab === 'admin_users' || activeTab === 'admin_solar') && (
            user.role === 'admin' ? (
              <AdminDashboard
                community={community}
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            ) : (
              <div className="p-8 human-card text-center max-w-lg mx-auto my-12 border-rose-200 dark:border-rose-900/50">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                  🔒
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">GEDA Officer Access Restricted</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  The GEDA Command Center is strictly reserved for authorized State Department administrators under Gujarat Energy Development Agency RBAC protocols.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Return to Citizen Dashboard
                </button>
              </div>
            )
          )}

          {(activeTab === 'solar_vendor' || activeTab === 'vendor_chat' || activeTab === 'vendor_grid' || activeTab === 'vendor_hardware') && (
            <SolarVendorDashboard
              user={user}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'campus_leader' && (
            <CampusLeaderDashboard
              user={user}
              onCompleteMission={handleCompleteMission}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsView
              user={user}
              onNavigate={setActiveTab}
            />
          )}
          </ErrorBoundary>
        </main>
      </div>

      {/* First-Time User Onboarding & Baseline Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onBaselineComplete={handleBaselineCompleted}
        initialUser={user}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Citizen Pledge & Certificate Generator Modal */}
      <PledgeModal
        isOpen={isPledgeOpen}
        onClose={() => setIsPledgeOpen(false)}
        user={user}
        onPledgeSigned={handlePledgeSigned}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-xl text-xs font-semibold animate-fade-in">
          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
