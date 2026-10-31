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
import AdminDashboard from './components/AdminDashboard';
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
  subscribeAuth 
} from './services/authService';
import { Check } from 'lucide-react';

export default function App() {
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

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPledgeOpen, setIsPledgeOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Check if first-time user
  useEffect(() => {
    const hasBaseline = localStorage.getItem('life_user_has_baseline');
    if (!hasBaseline && !user.hasCompletedOnboarding) {
      // Delay onboarding prompt slightly for smooth appearance
      const timer = setTimeout(() => setIsOnboardingOpen(true), 1200);
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

  // Behavior loop: Record completion
  const handleCompleteMission = async (missionId, points, co2Kg, proofData = null) => {
    if (user.completedMissions?.includes(missionId)) return;

    const newCompleted = [...(user.completedMissions || []), missionId];
    const newActive = (user.activeMissions || []).filter(id => id !== missionId);
    const newScore = user.lifeScore + points;
    const newStreak = user.streak + 1;

    setUser(prev => ({
      ...prev,
      lifeScore: newScore,
      scoreTodayDelta: (prev.scoreTodayDelta || 0) + points,
      streak: newStreak,
      activeMissions: newActive,
      completedMissions: newCompleted
    }));

    setCommunity(prev => ({
      ...prev,
      actionsCompleted: prev.actionsCompleted + 1,
      co2SavedKg: prev.co2SavedKg + Math.round(co2Kg)
    }));

    const proofMsg = proofData?.url ? " with citizen photo evidence" : "";
    showToast(`Action recorded${proofMsg}! +${points} LiFE+ pts, -${co2Kg} kg CO₂.`);
    await recordMissionCompleted(user.id, missionId, points, co2Kg, proofData);
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
    showToast(`Signed in as ${authenticatedUser.name}`);
  };

  const handleLogout = async () => {
    const resetUser = await logoutUser();
    setUser(resetUser);
    showToast("Signed out. Using local guest demo profile.");
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        user={user}
        isFirebaseConnected={isFirebaseConnected}
        onOpenAuth={() => setIsAuthOpen(true)}
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
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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

          {activeTab === 'admin' && (
            <AdminDashboard
              community={community}
            />
          )}
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
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#141519] text-zinc-200 border border-[#2a2c35] shadow-2xl text-xs font-medium animate-fade-in">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
