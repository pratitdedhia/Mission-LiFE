import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Leaf,
  Globe,
  LogOut,
  Award,
  ShieldCheck,
  Sparkles,
  Zap,
  Building2,
  ChevronDown,
  Edit3,
  Sun,
  Moon,
  Menu,
  GraduationCap,
  X
} from 'lucide-react';
import { GRID_HOURS } from '../data/initialData';
import { BRANDING } from '../config/branding';

export default function Navbar({
  lang = 'en',
  setLang,
  user,
  isFirebaseConnected,
  onOpenAuth,
  onLogout,
  onOpenPledge,
  onOpenOnboarding,
  activeTab,
  setActiveTab,
  theme = 'light',
  isDark = false,
  toggleTheme
}) {
  const { t, i18n } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLanguageChange = (newLang) => {
    if (setLang) setLang(newLang);
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(newLang);
    }
  };

  // Check peak hour
  const currentHour = new Date().getHours();
  const isPeakHour = GRID_HOURS.peakHours.includes(currentHour);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">

        {/* Brand & Identity */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {BRANDING.name}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                Gujarat LiFE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {BRANDING.shortPromise}
            </p>
          </div>
        </div>

        {/* Live Grid Indicator & Top Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Smart Grid Indicator Pill */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${isPeakHour
                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50'
              }`}
            title="Gujarat DISCOM Time-of-Day Tariff Status"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isPeakHour ? 'Peak Grid Load (6–10 PM)' : 'Off-Peak Green Hours'}</span>
          </div>

          {/* User LiFE Score */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Score</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">{user.lifeScore}</span>
          </div>

          {/* User Streak */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-700 dark:text-amber-300">
            <span>🔥</span>
            <span className="font-bold">{user.streak}d streak</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
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

          {/* User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                {user.role === 'campus_leader' ? '🎓' : user.role === 'solar_vendor' ? '☀️' : user.role === 'admin' ? '🏛️' : (user.name?.[0] || 'C')}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                  {user.roleTitle || user.role || 'Citizen'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 z-50 text-xs animate-fade-in"
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{user.name}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {user.role || 'citizen'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email || 'citizen@missionlife.in'}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                    <span>📍</span>
                    <span>{user.locality ? `${user.locality}, ` : ''}{user.city || 'Ahmedabad'}, Gujarat</span>
                  </span>
                </div>

                <div className="py-1">
                  {user.role === 'solar_vendor' && (
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('solar_vendor'); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Empanelled Solar Leads</span>
                    </button>
                  )}

                  {user.role === 'campus_leader' && (
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('campus_leader'); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      <span>Campus Youth Squad Hub</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setShowProfileMenu(false); onOpenOnboarding(); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Recalculate Energy Baseline</span>
                  </button>

                  <button
                    onClick={() => { setShowProfileMenu(false); onOpenPledge(); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Mission LiFE Certificate</span>
                  </button>

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('admin'); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-cyan-500" />
                      <span>GEDA State Admin View</span>
                    </button>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => { setShowProfileMenu(false); onLogout(); }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center gap-2.5 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
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
