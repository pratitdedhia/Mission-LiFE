import React from 'react';
import { 
  LayoutDashboard, 
  Footprints, 
  CheckCircle2, 
  Users, 
  SunMedium, 
  Bot,
  Building2,
  BookOpen,
  Award,
  Sparkles
} from 'lucide-react';
import { TRANSLATIONS } from '../data/initialData';
import { BRANDING } from '../config/branding';

export default function Sidebar({ activeTab, setActiveTab, lang, onOpenPledge }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'footprint', label: t.navFootprint, icon: Footprints },
    { id: 'missions', label: t.navMissions, icon: CheckCircle2 },
    { id: 'community', label: t.navCommunity, icon: Users },
    { id: 'solar', label: t.navSolar, icon: SunMedium },
    { id: 'directory', label: t.navDirectory, icon: BookOpen },
    { id: 'coach', label: t.navCoach, icon: Bot },
    { id: 'admin', label: t.navAdmin, icon: Building2 },
  ];

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex md:flex-col justify-between p-3 md:p-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm transition-colors">
      <nav className="flex md:flex-col gap-1 w-full overflow-x-auto md:overflow-visible pb-1 md:pb-0">
        <div className="hidden md:block px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Citizen Pledge Quick Access & GEDA Footer */}
      <div className="hidden md:block pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <button
          onClick={onOpenPledge}
          className="w-full p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-300 dark:hover:border-emerald-600/50 text-left transition-all cursor-pointer group shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>Mission LiFE Pledge</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
            Get your verified environmental stewardship certificate.
          </p>
        </button>

        <div className="text-[11px] text-slate-400 dark:text-slate-500 px-2 leading-relaxed">
          <p className="font-semibold text-slate-700 dark:text-slate-300">{BRANDING.name} Gujarat</p>
          <p className="text-[10px]">{BRANDING.orgName}</p>
        </div>
      </div>
    </aside>
  );
}
