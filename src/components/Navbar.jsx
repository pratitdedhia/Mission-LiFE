import React, { useState } from 'react';
import { 
  Leaf, 
  Globe, 
  User, 
  LogOut, 
  Award, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Building2,
  ChevronDown
} from 'lucide-react';
import { TRANSLATIONS, GRID_HOURS } from '../data/initialData';

export default function Navbar({ 
  lang, 
  setLang, 
  user, 
  isFirebaseConnected,
  onOpenAuth,
  onLogout,
  onOpenPledge,
  activeTab,
  setActiveTab
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Check peak hour
  const currentHour = new Date().getHours();
  const isPeakHour = GRID_HOURS.peakHours.includes(currentHour);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0d0e]/95 backdrop-blur-md border-b border-[#1f2125] px-4 lg:px-8 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-100 tracking-tight">
                Mission LiFE
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                GEDA
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Status, Grid Nudge & User Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Smart Grid Indicator */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono cursor-pointer transition-colors ${
              isPeakHour 
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' 
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{isPeakHour ? 'Peak Grid (6-10 PM)' : 'Off-Peak Green'}</span>
          </div>

          {/* LiFE Score Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#16171a] border border-[#26282e] text-xs">
            <span className="text-zinc-500 font-mono text-[10px]">SCORE</span>
            <span className="font-bold text-zinc-100 font-mono">{user.lifeScore}</span>
          </div>

          {/* Streak Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#16171a] border border-[#26282e] text-xs">
            <span className="text-zinc-500 font-mono text-[10px]">STREAK</span>
            <span className="font-bold text-emerald-400 font-mono">{user.streak}d 🔥</span>
          </div>

          {/* Firebase Cloud Sync Badge */}
          <div 
            className="hidden lg:flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono rounded-lg border border-[#22242a] bg-[#141518]"
            title={isFirebaseConnected ? "Connected to Cloud Firestore & Storage" : "Resilient Local Persistence (Cloud Ready)"}
          >
            <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-zinc-400">{isFirebaseConnected ? 'Firebase Live' : 'Local Cache'}</span>
          </div>

          {/* Language Selector */}
          <div className="relative flex items-center">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="appearance-none bg-[#16171a] text-zinc-300 text-xs font-semibold pl-6 pr-6 py-1.5 rounded-lg border border-[#26282e] hover:border-zinc-700 focus:outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="gu">GU</option>
              <option value="mr">MR</option>
            </select>
            <Globe className="w-3.5 h-3.5 text-zinc-500 absolute left-2 pointer-events-none" />
          </div>

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-lg bg-[#16171a] border border-[#26282e] hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                {user.name?.[0] || 'C'}
              </div>
              <span className="text-xs text-zinc-300 hidden sm:inline font-medium max-w-[90px] truncate">
                {user.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-[#141518] border border-[#26282f] rounded-xl shadow-2xl p-2 z-50 text-xs animate-fade-in"
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <div className="px-3 py-2 border-b border-[#222429]">
                  <p className="font-semibold text-zinc-100">{user.name}</p>
                  <p className="text-[10px] text-zinc-400 font-mono truncate">{user.email || 'citizen@missionlife.in'}</p>
                  <span className="inline-block text-[10px] text-emerald-400 font-mono mt-1">
                    {user.district || 'Ahmedabad'}, Gujarat
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { setShowProfileMenu(false); onOpenPledge(); }}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-800/50 rounded-lg flex items-center gap-2 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>LiFE Certificate</span>
                  </button>

                  <button
                    onClick={() => { setShowProfileMenu(false); setActiveTab('admin'); }}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-800/50 rounded-lg flex items-center gap-2 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>GEDA State Admin View</span>
                  </button>

                  <button
                    onClick={() => { setShowProfileMenu(false); onOpenAuth(); }}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-800/50 rounded-lg flex items-center gap-2 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Switch Account / Sign In</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#222429]">
                  <button
                    onClick={() => { setShowProfileMenu(false); onLogout(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-rose-950/30 rounded-lg flex items-center gap-2 text-rose-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Reset / Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
