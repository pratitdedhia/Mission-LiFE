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
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Camera,
  MessageSquare,
  Zap,
  TrendingUp
} from 'lucide-react';
import { TRANSLATIONS } from '../data/initialData';
import { BRANDING } from '../config/branding';

export default function Sidebar({ activeTab, setActiveTab, lang, onOpenPledge, user, onOpenAuth }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const userRole = user?.role || 'citizen';

  // Base navigation items tailored by role (Strict RBAC: admin only for role === 'admin')
  let navItems = [];

  if (userRole === 'solar_vendor') {
    navItems = [
      { id: 'solar_vendor', label: 'Installer Leads Queue', icon: SunMedium, badge: 'Partner' },
      { id: 'vendor_chat', label: 'Citizen Inquiries & Chat', icon: MessageSquare, badge: 'Live' },
      { id: 'vendor_grid', label: 'DISCOM Net-Metering', icon: Zap, badge: 'Grid' },
      { id: 'vendor_hardware', label: 'ALMM Hardware Catalog', icon: ShieldCheck, badge: 'GEDA' }
    ];
  } else if (userRole === 'student') {
    navItems = [
      { id: 'student_portal', label: 'My Campus Eco Hub', icon: GraduationCap, badge: 'Student' },
      { id: 'missions', label: 'Campus Challenges', icon: CheckCircle2 },
      { id: 'community', label: 'University Rankings', icon: Users },
      { id: 'scan', label: 'Appliance Scanner', icon: Camera, badge: 'YOLOv8' },
      { id: 'coach', label: 'Campus AI Coach', icon: Bot }
    ];
  } else if (userRole === 'campus_leader') {
    navItems = [
      { id: 'campus_leader', label: 'Campus Squad Hub', icon: GraduationCap, badge: 'Leader' },
      { id: 'missions', label: 'Campus Eco Sprints', icon: CheckCircle2 },
      { id: 'community', label: 'Campus Rankings', icon: Users },
      { id: 'scan', label: 'Appliance Scanner', icon: Camera, badge: 'YOLOv8' },
      { id: 'coach', label: 'Campus AI Coach', icon: Bot }
    ];
  } else if (userRole === 'admin') {
    navItems = [
      { id: 'admin', label: 'GEDA Command Center', icon: Building2, badge: 'Officer' },
      { id: 'admin_impact', label: 'Impact Analytics', icon: TrendingUp, badge: 'Planning' },
      { id: 'admin_users', label: 'User Login Controls', icon: Users, badge: 'RBAC' },
      { id: 'admin_solar', label: 'Rooftop Pipeline', icon: SunMedium, badge: 'MNRE' },
      { id: 'directory', label: t.navDirectory, icon: BookOpen }
    ];
  } else {
    // Default Citizen role - strict RBAC: no student portal or admin view exposed to citizens
    navItems = [
      { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
      { id: 'scan', label: 'Appliance Scanner', icon: Camera, badge: 'YOLOv8' },
      { id: 'footprint', label: t.navFootprint, icon: Footprints },
      { id: 'missions', label: t.navMissions, icon: CheckCircle2 },
      { id: 'community', label: t.navCommunity, icon: Users },
      { id: 'solar', label: t.navSolar, icon: SunMedium },
      { id: 'directory', label: t.navDirectory, icon: BookOpen },
      { id: 'coach', label: t.navCoach, icon: Bot }
    ];
  }

  const rolePillMap = {
    citizen: { label: "Citizen", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200" },
    student: { label: "Student Volunteer", color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200" },
    campus_leader: { label: "Campus Leader", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200" },
    solar_vendor: { label: "Solar Partner", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200" },
    admin: { label: "State Admin", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300" }
  };

  const currentRoleMeta = rolePillMap[userRole] || rolePillMap.citizen;

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex md:flex-col justify-between p-3 md:p-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shadow-xs">
      <div className="w-full">
        
        {/* Active Role Card */}
        <div 
          className="hidden md:flex items-center justify-between p-2.5 mb-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {userRole === 'campus_leader' ? '🎓' : userRole === 'student' ? '🎒' : userRole === 'solar_vendor' ? '☀️' : userRole === 'admin' ? '🏛️' : '🌱'}
            </div>
            <div className="truncate">
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Active Role</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{currentRoleMeta.label}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/50">
            Active
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex md:flex-col gap-1 w-full overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          <div className="hidden md:block px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role-Specific Credential Badge & Footer */}
      <div className="hidden md:block pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {userRole === 'admin' ? (
          <div className="w-full p-3 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/60 dark:from-slate-800 dark:to-slate-900 border border-slate-300/80 dark:border-slate-700/80 text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 text-xs font-bold">
              <Building2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>GEDA State Administration</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
              Directorate of Energy Conservation
            </p>
          </div>
        ) : userRole === 'solar_vendor' ? (
          <div className="w-full p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-slate-900 border border-amber-200/80 dark:border-amber-800/40 text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>GEDA Empanelled Partner</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
              License ID: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">GEDA-EMP-2026-088</span>
            </p>
          </div>
        ) : userRole === 'campus_leader' ? (
          <div className="w-full p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-800/40 text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Campus Climate Lead</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
              Gujarat Youth Climate Fellowship
            </p>
          </div>
        ) : userRole === 'student' ? (
          <div className="w-full p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/40 text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Student Eco Volunteer</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
              Verified Campus Youth Member
            </p>
          </div>
        ) : (
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
        )}

        <div className="text-[11px] text-slate-400 dark:text-slate-500 px-2 leading-relaxed">
          <p className="font-semibold text-slate-700 dark:text-slate-300">{BRANDING.name} Gujarat</p>
          <p className="text-[10px]">{BRANDING.orgName}</p>
        </div>
      </div>
    </aside>
  );
}
