import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Leaf, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Sun,
  Moon, 
  Users, 
  GraduationCap, 
  Building2, 
  Award, 
  Sparkles, 
  Droplets, 
  ShoppingBag, 
  Apple, 
  Recycle, 
  Bike, 
  Cpu,
  Globe,
  SunMedium,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { BRANDING } from '../config/branding';
import { DEMO_USERS, LIFE_THEMES } from '../data/initialData';

export default function LandingPage({ 
  onOpenLogin, 
  onOpenRegister, 
  onQuickDemoLogin, 
  onEnterAsGuest,
  lang = 'en',
  setLang,
  isDark,
  toggleTheme
}) {
  const { t, i18n } = useTranslation();
  const [selectedDemoRole, setSelectedDemoRole] = useState('citizen');

  const handleLanguageChange = (newLang) => {
    if (setLang) setLang(newLang);
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(newLang);
    }
  };

  const THEMES_PREVIEW = [
    { title: "Save Energy", icon: Zap, desc: "AC at 26°C, ToD off-peak washing, and phantom standby cutoff.", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900" },
    { title: "Save Water", icon: Droplets, desc: "Bucket baths, low-flow tap aerators, and greywater recycling.", color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900" },
    { title: "Reduce Plastic", icon: ShoppingBag, desc: "Replace single-use bags with reusable cotton vegetable totes.", color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900" },
    { title: "Sustainable Food", icon: Apple, desc: "Adopt Gujarat millet thali (Bajra/Jowar) and zero food waste.", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900" },
    { title: "Waste Segregation", icon: Recycle, desc: "Dual-bin home composting and organic kitchen waste separation.", color: "text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900" },
    { title: "Green Lifestyle", icon: Bike, desc: "Cycle or walk for errands under 3 km and take the stairs.", color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900" },
    { title: "E-Waste Disposal", icon: Cpu, desc: "Handover old chargers & lithium batteries to GEDA collection hubs.", color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500/20 selection:text-emerald-800">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-sm shadow-emerald-700/30">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {BRANDING.name}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Gujarat LiFE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Gujarat Energy Development Agency (GEDA)
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#impact" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">3 Levels of Impact</a>
            <a href="#themes" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">7 Themes</a>
            <a href="#roles" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">Role Portals</a>
            <a href="#stats" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">State Metrics</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <select
                value={lang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold pl-6 pr-6 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="gu">GU</option>
                <option value="mr">MR</option>
              </select>
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
            </div>

            {/* Sign In Button */}
            <button
              onClick={onOpenLogin}
              className="py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Sign In
            </button>

            {/* Register CTA */}
            <button
              onClick={onOpenRegister}
              className="py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 transition-all shadow-xs hover:shadow cursor-pointer flex items-center gap-1.5"
            >
              <span>Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        
        {/* Government Authority Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6 animate-fade-in shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Gujarat Energy Development Agency (GEDA) • Problem Statement HC26-GEDA01</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Turn Sustainability From Knowledge Into <span className="text-emerald-700 dark:text-emerald-400">Daily Habit</span>.
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {BRANDING.shortPromise}. Measure your household footprint, accept daily micro-tasks, shift peak grid power, model PM Surya Ghar rooftop solar, and compete on the Gujarat state leaderboard.
        </p>

        {/* Main CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto py-3.5 px-7 rounded-2xl bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Access Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRegister}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
          >
            Create Citizen Profile
          </button>
        </div>

        {/* Quick Demo Login Presets Showcase */}
        <div className="mt-10 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-3xl mx-auto shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>⚡ Instant 1-Click Demo Evaluation Presets:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => onQuickDemoLogin('citizen')}
              className="p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span>🌱</span>
                <span>Citizen</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">Pooja Patel</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ahmedabad</p>
            </button>

            <button
              onClick={() => onQuickDemoLogin('student')}
              className="p-3 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                <span>🎒</span>
                <span>Student</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">Priyan Patel</p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">IIT Gandhinagar</p>
            </button>

            <button
              onClick={() => onQuickDemoLogin('campus_leader')}
              className="p-3 rounded-2xl border border-blue-200 dark:border-blue-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">
                <span>🎓</span>
                <span>Campus Leader</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">Aarav Mehta</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">IIT Gandhinagar</p>
            </button>

            <button
              onClick={() => onQuickDemoLogin('solar_vendor')}
              className="p-3 rounded-2xl border border-amber-200 dark:border-amber-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <span>☀️</span>
                <span>Solar Partner</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">Rajesh Shah</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">GEDA Installer</p>
            </button>

            <button
              onClick={() => onQuickDemoLogin('admin')}
              className="p-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>🏛️</span>
                <span>State Admin</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">Dr. Neha Joshi</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">GEDA Energy Lead</p>
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <button
              onClick={onEnterAsGuest}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Or explore as guest residential consumer</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Live Gujarat Impact Ticker */}
      <section id="stats" className="py-8 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">24,890+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gujarat Citizens Enrolled</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">2.45 GWh</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Domestic Energy Saved</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 font-mono">142,850 kg</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">CO₂ Emissions Mitigated</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">33</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Districts Actively Participating</p>
            </div>
            <div className="p-3 col-span-2 md:col-span-1">
              <p className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400 font-mono">342</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Verified Solar Rooftops</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Levels of Impact Showcase */}
      <section id="impact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-mono">
            Structured Impact Model
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            Three Levels of Collective Progress
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            Connecting individual domestic habits to local student squads and statewide grid decarbonization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level 1: Me */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Me (Household & Habit)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Calculate your personal domestic emissions baseline. Accept daily micro-tasks, calibrate AC to 26°C during peak load hours, and generate a certified Mission LiFE stewardship certificate.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Personal Footprint & Gujarat Urban Delta</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Photo Proof Verification to Firebase Storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>HTML5 Canvas Digital Citizen Certificate</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Level 2: My Community */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-lg mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">My Community (Locality & Campus)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Compete in localized sprints. Youth eco-clubs in universities (IIT Gandhinagar, NMIMS, PDEU) lead hostel vs hostel power challenges and zero-waste dining hall campaigns.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Inter-Hostel AC 26°C Sprints</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Gujarat Inter-Campus Sustainability League</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Peer Activity Wall with Real-Time Kudos</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Level 3: Gujarat */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Gujarat (Statewide Impact)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                State energy policymakers monitor real-time DISCOM peak load shifting compliance across 33 districts, aggregate GWh savings, and dispatch citizen rooftop solar leads to empanelled installers.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>33-District Conservation Heatmap</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>PM Surya Ghar CFA Subsidy Engine (₹78k)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>1-Click State Energy Audit CSV Export</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Official Mission LiFE Themes Grid */}
      <section id="themes" className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-mono">
              Action Taxonomy
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
              7 Official Mission LiFE Themes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              Actionable micro-tasks tailored to Indian and Gujarat domestic lifestyle habits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {THEMES_PREVIEW.map((th, idx) => {
              const Icon = th.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-3 ${th.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{th.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{th.desc}</p>
                </div>
              );
            })}

            {/* Solar Special Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/40 dark:from-amber-950/40 dark:to-slate-900 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 border border-amber-300 dark:border-amber-700 flex items-center justify-center mb-3">
                <SunMedium className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Rooftop Solar</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                PM Surya Ghar Muft Bijli Yojana calculation with up to ₹78,000 CFA subsidy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Portals Section */}
      <section id="roles" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-mono">
            Access Management
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            Dedicated Role-Based Portals
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            Tailored interfaces for every stakeholder in Gujarat's green transition.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Citizen */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-3xl mb-3 block">🌱</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Residential Citizen</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Household emissions tracker, AC 26°C peak challenge, rooftop solar sizing, and downloadable verified certificates.
              </p>
            </div>
            <button
              onClick={() => onQuickDemoLogin('citizen')}
              className="mt-5 w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Sign In as Citizen →
            </button>
          </div>

          {/* Student Volunteer */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-3xl mb-3 block">🎒</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Student Volunteer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Student ID verification pass, personal green habits, and direct point contribution to university ranking.
              </p>
            </div>
            <button
              onClick={() => onQuickDemoLogin('student')}
              className="mt-5 w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Sign In as Student →
            </button>
          </div>

          {/* Campus Leader */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-3xl mb-3 block">🎓</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Campus Youth Leader</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Campus Squad Hub, student ID verification queue, inter-hostel AC energy sprints, and campus ranking.
              </p>
            </div>
            <button
              onClick={() => onQuickDemoLogin('campus_leader')}
              className="mt-5 w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Sign In as Leader →
            </button>
          </div>

          {/* Solar Partner */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-3xl mb-3 block">☀️</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">GEDA Solar Partner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Empanelled installer portal, citizen rooftop inquiries queue, quote generation, and interactive chat.
              </p>
            </div>
            <button
              onClick={() => onQuickDemoLogin('solar_vendor')}
              className="mt-5 w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Sign In as Partner →
            </button>
          </div>

          {/* State Admin */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-3xl mb-3 block">🏛️</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">GEDA State Admin</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                State & district impact analytics, solar adoption graphs, user account controls, and scheme planning.
              </p>
            </div>
            <button
              onClick={() => onQuickDemoLogin('admin')}
              className="mt-5 w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Sign In as Admin →
            </button>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Leaf className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Take the Mission LiFE Pledge?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-xl mx-auto leading-relaxed">
            Join thousands of Gujarat households cutting energy waste, adopting clean solar power, and preserving our climate for future generations.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenRegister}
              className="py-3 px-8 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Register Citizen Profile
            </button>
            <button
              onClick={onOpenLogin}
              className="py-3 px-8 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm border border-emerald-500/40 transition-all cursor-pointer"
            >
              Portal Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">{BRANDING.name}</span>
            <span>•</span>
            <span>{BRANDING.orgName}</span>
          </div>
          <p className="text-[11px]">
            In alignment with Government of India Mission LiFE (Lifestyle for Environment) & GEDA Guidelines.
          </p>
        </div>
      </footer>

    </div>
  );
}

