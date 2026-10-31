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
    <aside className="w-full md:w-60 flex-shrink-0 flex md:flex-col justify-between p-3 md:p-4 border-b md:border-b-0 md:border-r border-[#1f2125] bg-[#0c0d0e]">
      <nav className="flex md:flex-col gap-1 w-full overflow-x-auto md:overflow-visible pb-1 md:pb-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Citizen Pledge Quick Access & GEDA Footer */}
      <div className="hidden md:block pt-4 border-t border-[#1f2125] space-y-3">
        <button
          onClick={onOpenPledge}
          className="w-full p-2.5 rounded-xl bg-gradient-to-br from-emerald-950/40 to-[#14161a] border border-emerald-800/30 hover:border-emerald-600/50 text-left transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Mission LiFE Pledge</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
            Download your official citizen certificate.
          </p>
        </button>

        <div className="text-[10px] text-zinc-500 font-mono px-1">
          <p className="font-semibold text-zinc-400">Mission LiFE Platform</p>
          <p className="mt-0.5">Gujarat Energy Development Agency</p>
        </div>
      </div>
    </aside>
  );
}
