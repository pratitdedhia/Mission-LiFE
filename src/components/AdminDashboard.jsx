import React, { useState, useEffect } from 'react';
import { 
  Building, 
  TrendingUp, 
  Download, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Sun, 
  Zap, 
  Users,
  Activity,
  FileSpreadsheet,
  Info,
  Award,
  Filter,
  Search,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  GraduationCap,
  SunMedium,
  Check,
  X,
  AlertTriangle,
  Layers,
  BarChart3
} from 'lucide-react';
import { DISTRICT_ADMIN_STATS } from '../data/initialData';
import { BRANDING } from '../config/branding';
import { 
  getAllManagedUsers, 
  updateManagedUser, 
  createManagedUser, 
  deleteManagedUser, 
  toggleUserStatus 
} from '../services/userManagementService';

// Comprehensive District Master Data for Scheme Planning
const GUJARAT_DISTRICTS_DATA = [
  { id: "ahm", name: "Ahmedabad", households: 8420, solarAdopters: 1280, solarKw: 4200, co2AvoidedTonnes: 48.6, totalPoints: 412000, complianceRate: "91%", discom: "UGVCL / Torrent" },
  { id: "srt", name: "Surat", households: 6150, solarAdopters: 910, solarKw: 2980, co2AvoidedTonnes: 36.2, totalPoints: 318000, complianceRate: "89%", discom: "DGVCL / Torrent" },
  { id: "vad", name: "Vadodara", households: 4320, solarAdopters: 640, solarKw: 2120, co2AvoidedTonnes: 24.8, totalPoints: 226000, complianceRate: "86%", discom: "MGVCL" },
  { id: "rjk", name: "Rajkot", households: 3450, solarAdopters: 420, solarKw: 1480, co2AvoidedTonnes: 18.2, totalPoints: 184000, complianceRate: "83%", discom: "PGVCL" },
  { id: "gnr", name: "Gandhinagar", households: 2550, solarAdopters: 380, solarKw: 1320, co2AvoidedTonnes: 14.5, totalPoints: 156000, complianceRate: "94%", discom: "UGVCL" },
  { id: "bhv", name: "Bhavnagar", households: 1890, solarAdopters: 210, solarKw: 780, co2AvoidedTonnes: 9.8, totalPoints: 98000, complianceRate: "80%", discom: "PGVCL" },
  { id: "jmn", name: "Jamnagar", households: 1420, solarAdopters: 160, solarKw: 560, co2AvoidedTonnes: 7.4, totalPoints: 72000, complianceRate: "78%", discom: "PGVCL" },
  { id: "jnd", name: "Junagadh", households: 1180, solarAdopters: 130, solarKw: 440, co2AvoidedTonnes: 6.1, totalPoints: 58000, complianceRate: "82%", discom: "PGVCL" },
  { id: "ktc", name: "Kutch", households: 980, solarAdopters: 95, solarKw: 320, co2AvoidedTonnes: 4.8, totalPoints: 46000, complianceRate: "76%", discom: "PGVCL" },
  { id: "meh", name: "Mehsana", households: 870, solarAdopters: 85, solarKw: 290, co2AvoidedTonnes: 4.2, totalPoints: 42000, complianceRate: "85%", discom: "UGVCL" }
];

// Campus Master Data for Youth Climate Planning
const GUJARAT_CAMPUSES_DATA = [
  { id: "iitgn", name: "IIT Gandhinagar", city: "Gandhinagar", students: 420, solarKw: 320, co2AvoidedTonnes: 12.4, totalPoints: 84000, complianceRate: "96%", sprintsCompleted: 18 },
  { id: "svnit", name: "SVNIT Surat", city: "Surat", students: 380, solarKw: 240, co2AvoidedTonnes: 9.8, totalPoints: 71000, complianceRate: "92%", sprintsCompleted: 15 },
  { id: "msu", name: "MS University Baroda", city: "Vadodara", students: 310, solarKw: 180, co2AvoidedTonnes: 7.9, totalPoints: 59000, complianceRate: "88%", sprintsCompleted: 12 },
  { id: "pdeu", name: "PDEU Gandhinagar", city: "Gandhinagar", students: 290, solarKw: 210, co2AvoidedTonnes: 8.2, totalPoints: 52000, complianceRate: "90%", sprintsCompleted: 11 },
  { id: "nirma", name: "Nirma University", city: "Ahmedabad", students: 260, solarKw: 150, co2AvoidedTonnes: 6.7, totalPoints: 48000, complianceRate: "85%", sprintsCompleted: 9 },
  { id: "gu", name: "Gujarat University", city: "Ahmedabad", students: 240, solarKw: 120, co2AvoidedTonnes: 5.9, totalPoints: 44000, complianceRate: "82%", sprintsCompleted: 8 }
];

export default function AdminDashboard({ community = {}, user = {}, activeTab = 'admin', setActiveTab }) {
  // Navigation View: 'overview' | 'impact' | 'users' | 'solar'
  const [internalView, setInternalView] = useState(() => {
    if (activeTab === 'admin_impact') return 'impact';
    if (activeTab === 'admin_users') return 'users';
    if (activeTab === 'admin_solar') return 'solar';
    return 'overview';
  });

  useEffect(() => {
    if (activeTab === 'admin_impact') setInternalView('impact');
    else if (activeTab === 'admin_users') setInternalView('users');
    else if (activeTab === 'admin_solar') setInternalView('solar');
    else if (activeTab === 'admin') setInternalView('overview');
  }, [activeTab]);

  const handleTabChange = (view) => {
    setInternalView(view);
    if (setActiveTab) {
      if (view === 'overview') setActiveTab('admin');
      else if (view === 'impact') setActiveTab('admin_impact');
      else if (view === 'users') setActiveTab('admin_users');
      else if (view === 'solar') setActiveTab('admin_solar');
    }
  };

  // ----------------------------------------------------
  // IMPACT ANALYTICS STATE (State / District / Campus)
  // ----------------------------------------------------
  const [scopeFilter, setScopeFilter] = useState('state'); // 'state' | 'district' | 'campus'
  const [metricFilter, setMetricFilter] = useState('all'); // 'all' | 'co2' | 'solar' | 'points'
  const [selectedEntityId, setSelectedEntityId] = useState('all');

  // ----------------------------------------------------
  // USER LOGIN CONTROL STATE
  // ----------------------------------------------------
  const [managedUsers, setManagedUsers] = useState(() => getAllManagedUsers());
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('citizen');
  const [newUserDistrict, setNewUserDistrict] = useState('Ahmedabad');
  const [newUserPhone, setNewUserPhone] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshUsers = () => {
    setManagedUsers(getAllManagedUsers());
  };

  const handleRoleChange = (userId, newRole) => {
    const roleTitleMap = {
      citizen: 'Residential Citizen',
      campus_leader: 'Campus Youth Leader',
      solar_vendor: 'GEDA Empanelled Installer',
      admin: 'GEDA State Energy Officer'
    };
    updateManagedUser(userId, { 
      role: newRole, 
      roleTitle: roleTitleMap[newRole] || 'Citizen' 
    });
    refreshUsers();
    showToast(`Role updated to: ${roleTitleMap[newRole]}`);
  };

  const handleToggleStatus = (userId) => {
    toggleUserStatus(userId);
    refreshUsers();
    showToast(`User status toggled!`);
  };

  const handleDeleteUser = (userId, name) => {
    if (window.confirm(`Are you sure you want to remove user ${name}?`)) {
      deleteManagedUser(userId);
      refreshUsers();
      showToast(`User ${name} removed.`);
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    createManagedUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      district: newUserDistrict,
      city: newUserDistrict,
      phone: newUserPhone.trim() || "+91 98000 12345"
    });

    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    refreshUsers();
    showToast(`User account created successfully!`);
  };

  // Filtered Users List
  const filteredUsers = managedUsers.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.district || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.collegeId || '').toLowerCase().includes(userSearchQuery.toLowerCase());
    
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate Macro Stats
  const totalSolarAdopters = GUJARAT_DISTRICTS_DATA.reduce((acc, d) => acc + d.solarAdopters, 0);
  const totalSolarKw = GUJARAT_DISTRICTS_DATA.reduce((acc, d) => acc + d.solarKw, 0);
  const totalDistrictTonnes = GUJARAT_DISTRICTS_DATA.reduce((acc, d) => acc + d.co2AvoidedTonnes, 0);
  const totalDistrictPoints = GUJARAT_DISTRICTS_DATA.reduce((acc, d) => acc + d.totalPoints, 0);

  const handleExportStateReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Region/Entity,Type,Households/Students,Rooftop Solar Adopters,Solar Capacity (kW),CO2 Mitigated (Tonnes),LiFE Points,Compliance Rate\n" +
      GUJARAT_DISTRICTS_DATA.map(d => `${d.name},District,${d.households},${d.solarAdopters},${d.solarKw},${d.co2AvoidedTonnes},${d.totalPoints},${d.complianceRate}`).join("\n") + "\n" +
      GUJARAT_CAMPUSES_DATA.map(c => `${c.name},Campus,${c.students},${Math.round(c.solarKw/3)},${c.solarKw},${c.co2AvoidedTonnes},${c.totalPoints},${c.complianceRate}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GEDA_Mission_LiFE_Scheme_Planning_Analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-12">
      
      {/* Title Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
                GEDA State Command Center
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Gujarat Energy Development Agency • Policy Planning & RBAC Oversight
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
              Statewide LiFE+ Governance & Scheme Planning
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Officer: <span className="font-semibold text-slate-800 dark:text-slate-200">{user.name || "Dr. Neha Joshi"}</span> (Directorate of Energy Conservation) • Active DISCOM Shifting Protocol
            </p>
          </div>

          <button
            onClick={handleExportStateReport}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors self-start whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Scheme Planning CSV</span>
          </button>
        </div>

        {/* Macro KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase font-semibold">Statewide Energy Saved</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              2.45 <span className="text-xs font-normal text-slate-500">GWh</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              +14.2% off-peak shift vs Q2
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase font-semibold">CO₂ Avoided</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {totalDistrictTonnes.toFixed(1)} <span className="text-xs font-normal text-slate-500">tonnes</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
              Audited citizen verification
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase font-semibold">Solar Adopters</span>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {totalSolarAdopters.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">homes</span>
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
              {(totalSolarKw / 1000).toFixed(1)} MW Grid-Tied Capacity
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase font-semibold">Managed Logins</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {managedUsers.length} <span className="text-xs font-normal text-slate-500">Profiles</span>
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1 block">
              Full RBAC Access Control
            </span>
          </div>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            internalView === 'overview'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>GEDA Command Center</span>
        </button>

        <button
          onClick={() => handleTabChange('impact')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            internalView === 'impact'
              ? 'bg-emerald-700 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Impact Analytics (Graphs & Scheme Planning)</span>
        </button>

        <button
          onClick={() => handleTabChange('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            internalView === 'users'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Login & RBAC Controls ({managedUsers.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('solar')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            internalView === 'solar'
              ? 'bg-slate-800 text-white font-bold shadow-xs dark:bg-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <SunMedium className="w-4 h-4" />
          <span>Rooftop Solar Pipeline (MNRE)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: IMPACT ANALYTICS (GRAPHS, STATE/DISTRICT/CAMPUS SCHEME PLANNING) */}
      {/* ========================================================================= */}
      {internalView === 'impact' && (
        <div className="space-y-6">
          
          {/* Controls: Scope Filter & Metric Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Statewide Multi-Tier Impact Analytics Engine</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Filter independently by <strong>Statewide</strong>, <strong>District-Wise</strong>, or <strong>Campus-Wise</strong> to formulate targeted green energy schemes.
                </p>
              </div>

              {/* Granularity / Scope Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  onClick={() => { setScopeFilter('state'); setSelectedEntityId('all'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    scopeFilter === 'state'
                      ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🏛️ Statewide
                </button>
                <button
                  onClick={() => { setScopeFilter('district'); setSelectedEntityId('all'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    scopeFilter === 'district'
                      ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  📍 District-Wise
                </button>
                <button
                  onClick={() => { setScopeFilter('campus'); setSelectedEntityId('all'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    scopeFilter === 'campus'
                      ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🎓 Campus-Wise
                </button>
              </div>
            </div>

            {/* Metric Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Active Metric:</span>
                {[
                  { id: 'all', label: 'All Indicators' },
                  { id: 'solar', label: '☀️ Solar Panels Adopted' },
                  { id: 'co2', label: '🌱 CO₂ Emissions Mitigated' },
                  { id: 'points', label: '🏆 LiFE Engagement Points' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMetricFilter(m.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      metricFilter === m.id
                        ? 'bg-emerald-800 text-white font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Sub-Entity Selector (when district or campus is selected) */}
              {scopeFilter !== 'state' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Filter:</span>
                  <select
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="all">
                      {scopeFilter === 'district' ? 'All 10 Monitored Districts' : 'All 6 Climate Partner Universities'}
                    </option>
                    {(scopeFilter === 'district' ? GUJARAT_DISTRICTS_DATA : GUJARAT_CAMPUSES_DATA).map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* VISUAL GRAPHS & BAR CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Graph (7 cols): Regional Performance Bar Graph */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {scopeFilter === 'campus' ? 'University Sustainability Comparison' : 'District Benchmark Distribution'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Visual comparative bar graph showing {metricFilter === 'solar' ? 'Rooftop Solar Installations' : metricFilter === 'co2' ? 'CO₂ Tonnes Mitigated' : metricFilter === 'points' ? 'LiFE Points' : 'Relative Performance Slabs'}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  Audited GEDA Data
                </span>
              </div>

              {/* Dynamic SVG / Styled Bar Graph */}
              <div className="space-y-3 pt-2">
                {(scopeFilter === 'campus' ? GUJARAT_CAMPUSES_DATA : GUJARAT_DISTRICTS_DATA)
                  .filter(item => selectedEntityId === 'all' || item.id === selectedEntityId)
                  .slice(0, 6)
                  .map((item, idx) => {
                    const maxValue = scopeFilter === 'campus' ? 84000 : 412000;
                    const currentValue = metricFilter === 'solar' 
                      ? (item.solarAdopters || item.solarKw) 
                      : metricFilter === 'co2' 
                        ? item.co2AvoidedTonnes 
                        : item.totalPoints;
                    
                    const barPercent = Math.min(100, Math.max(12, Math.round((item.totalPoints / maxValue) * 100)));

                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            {item.name}
                          </span>
                          <div className="flex items-center gap-3 font-mono text-xs">
                            <span className="text-amber-600 dark:text-amber-400 font-bold">
                              ☀️ {item.solarAdopters ? `${item.solarAdopters} Solar Homes` : `${item.solarKw} kW Array`}
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              🌱 {item.co2AvoidedTonnes} t CO₂
                            </span>
                            <span className="text-slate-900 dark:text-white font-extrabold">
                              {item.totalPoints.toLocaleString()} pts
                            </span>
                          </div>
                        </div>

                        {/* Visual Bar */}
                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${barPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right Card (5 cols): Sector Impact Breakdown Pie / Metric Cards */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Sector-wise Emission Mitigation Sinks
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Where Gujarat's 142.8 tonnes of avoided carbon originate:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      ☀️
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Rooftop Solar Generation</p>
                      <p className="text-[10px] text-slate-500">3,420 households under PM Surya Ghar</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">54.2%</span>
                    <span className="text-[10px] text-slate-400 block font-mono">77.4 tonnes</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      ❄️
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">AC 26°C Eco-Set Shifting</p>
                      <p className="text-[10px] text-slate-500">6–10 PM Peak Load Shifting</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-blue-600 dark:text-blue-400">26.8%</span>
                    <span className="text-[10px] text-slate-400 block font-mono">38.2 tonnes</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      🚲
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Campus & Transit Mobility</p>
                      <p className="text-[10px] text-slate-500">Shared bicycles & EV feeder routes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">11.5%</span>
                    <span className="text-[10px] text-slate-400 block font-mono">16.4 tonnes</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                      🔌
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Phantom Load & Plug Sockets</p>
                      <p className="text-[10px] text-slate-500">Nighttime standby cutoff</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-purple-600 dark:text-purple-400">7.5%</span>
                    <span className="text-[10px] text-slate-400 block font-mono">10.8 tonnes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GOVERNMENT SCHEME PLANNING & POLICY FORMULATION INSIGHTS */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 text-white p-6 rounded-3xl border border-emerald-800/50 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 font-mono">
                Government Scheme Planning & Policy Formulation Insights (GEDA Directorate)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">1. Priority Solar Camps</span>
                <p className="font-bold text-sm text-white">Target Kutch & Saurashtra Feeders</p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  While Ahmedabad and Surat lead in urban rooftop solar (&gt;1,200 adopters), Kutch and Bhavnagar show high solar insolation (5.8 kWh/m²/day) with lower uptake (&lt;100 adopters). Recommend targeted PM Surya Ghar mobile subsidy documentation camps.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block">2. Substation Load Relief</span>
                <p className="font-bold text-sm text-white">Peak Load Shaving Shaved ₹2.1 Cr</p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Time-of-Day AC setpoint adherence at 26°C shifted 2.45 GWh away from 6–10 PM peak load, preventing expensive thermal peaker station dispatch across UGVCL & PGVCL distribution networks.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">3. Fellowship Grant Allocations</span>
                <p className="font-bold text-sm text-white">IITGN & SVNIT Qualify for Tier-1 Grants</p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Campus engagement metrics show IIT Gandhinagar (84,000 pts) and SVNIT Surat (71,000 pts) achieved &gt;90% habit verification rates. Recommend allocating ₹25 Lakhs state youth climate fellowships for campus biogas & rooftop solar walk labs.
                </p>
              </div>
            </div>
          </div>

          {/* Granular Table View (District or Campus) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {scopeFilter === 'campus' ? 'Gujarat University Climate League Table' : 'Gujarat District Conservation Benchmarks'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed breakdown by {scopeFilter === 'campus' ? 'university campus' : 'administrative district'}
                </p>
              </div>

              <button
                onClick={handleExportStateReport}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">{scopeFilter === 'campus' ? 'Enrolled Students' : 'Registered Homes'}</th>
                    <th className="py-3 px-4">{scopeFilter === 'campus' ? 'Campus Rooftop Array' : 'Solar Adopters (Homes)'}</th>
                    <th className="py-3 px-4">CO₂ Avoided</th>
                    <th className="py-3 px-4">Total LiFE Points</th>
                    <th className="py-3 px-4">Off-Peak Adherence</th>
                    <th className="py-3 px-4 text-right">Policy Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {(scopeFilter === 'campus' ? GUJARAT_CAMPUSES_DATA : GUJARAT_DISTRICTS_DATA).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {scopeFilter === 'campus' ? <GraduationCap className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-emerald-500" />}
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">{(item.households || item.students).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400 font-bold">
                        {item.solarAdopters ? `${item.solarAdopters.toLocaleString()} homes (${item.solarKw} kW)` : `${item.solarKw} kW On-Grid`}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{item.co2AvoidedTonnes} tonnes</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{item.totalPoints.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-600 h-full rounded-full" 
                              style={{ width: item.complianceRate }}
                            />
                          </div>
                          <span className="font-mono text-[11px]">{item.complianceRate}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Compliant</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: USER LOGINS & ACCESS CONTROL CENTER (ADMIN CAN CONTROL ALL USERS) */}
      {/* ========================================================================= */}
      {internalView === 'users' && (
        <div className="space-y-6">
          
          {/* User Control Header & Quick Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Statewide User Login & Identity Administration</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Inspect and control all logged-in profiles, switch user roles, toggle account statuses, and provision new credentials.
                </p>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Provision New User</span>
              </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search user by name, email, district, or college ID..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">All Roles (Citizens, Leads, Installers, Admins)</option>
                  <option value="citizen">Citizens Only</option>
                  <option value="campus_leader">Campus Leaders</option>
                  <option value="solar_vendor">Solar Partners</option>
                  <option value="admin">State Admins</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">All Account Statuses</option>
                  <option value="active">Active Accounts</option>
                  <option value="pending">Pending Verification</option>
                  <option value="suspended">Suspended Accounts</option>
                </select>
              </div>
            </div>
          </div>

          {/* User Table with Role Switcher & Status Toggles */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Registered Logins ({filteredUsers.length} profiles matching filters)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Instant RBAC Permission Sync Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Assigned Role (Live RBAC)</th>
                    <th className="py-3 px-4">District / Campus</th>
                    <th className="py-3 px-4">Auth Method</th>
                    <th className="py-3 px-4">Impact (Points / CO₂)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredUsers.map((u) => {
                    const isActive = u.status === 'active';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono block">{u.email}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.phone}</span>
                          </div>
                        </td>

                        {/* Interactive Role Switcher Dropdown */}
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:border-blue-500"
                          >
                            <option value="citizen">🌱 Citizen</option>
                            <option value="campus_leader">🎓 Campus Leader</option>
                            <option value="solar_vendor">☀️ Solar Partner</option>
                            <option value="admin">🏛️ State Admin</option>
                          </select>
                        </td>

                        <td className="py-3 px-4">
                          <div>
                            <span className="font-medium text-slate-800 dark:text-slate-200 block">
                              {u.campusName || u.locality || u.district}
                            </span>
                            <span className="text-[10px] text-slate-400">{u.city || u.district}, Gujarat</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {u.authProvider || "Email"}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-slate-900 dark:text-white block">{u.lifeScore || 0} pts</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">{u.co2SavedKg || 0} kg CO₂</span>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                            }`}
                            title="Click to toggle status"
                          >
                            {isActive ? '● Active' : '✕ Suspended'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(u.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                              title={isActive ? "Suspend User" : "Activate User"}
                            >
                              {isActive ? <UserX className="w-3.5 h-3.5 text-amber-500" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-500" />}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: GEDA COMMAND CENTER OVERVIEW */}
      {/* ========================================================================= */}
      {internalView === 'overview' && (
        <div className="space-y-6">
          {/* District-wise Conservation Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gujarat District Performance Benchmarks</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Demand side management compliance and rooftop solar penetration</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTabChange('impact')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Open Full Impact Analytics & Graphs</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Participating Households</th>
                    <th className="py-3 px-4">Rooftop Solar Adopters</th>
                    <th className="py-3 px-4">Solar Capacity</th>
                    <th className="py-3 px-4">CO₂ Avoided</th>
                    <th className="py-3 px-4">ToD Off-Peak Adherence</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {GUJARAT_DISTRICTS_DATA.slice(0, 7).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">{item.households.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 font-mono text-amber-600 font-bold">{item.solarAdopters} homes</td>
                      <td className="py-3 px-4 font-mono text-amber-600">{item.solarKw.toLocaleString('en-IN')} kW</td>
                      <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{item.co2AvoidedTonnes} tonnes</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-600 h-full rounded-full" 
                              style={{ width: item.complianceRate }}
                            />
                          </div>
                          <span className="font-mono text-[11px]">{item.complianceRate}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Tracking</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: ROOFTOP SOLAR PIPELINE (MNRE / GEDA) */}
      {/* ========================================================================= */}
      {internalView === 'solar' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full font-mono">
                  PM Surya Ghar Muft Bijli Yojana
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Gujarat State Rooftop Solar Installation Pipeline
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Authorised installer performance, DISCOM net-metering dispatch, and DBT subsidy disbursement monitoring.
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                ₹26.68 Cr DBT Disbursed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Surya Urja Solutions</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">GEDA Empanelled Tier-1</p>
                <p className="text-xs text-emerald-600 font-mono font-bold">142 Rooftops Commissioned</p>
                <p className="text-[11px] text-slate-500">Avg Net-Meter Time: 12 Days • Rating: 4.9 ★</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Adani Solar Power Hub</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Tier-1 State Partner</p>
                <p className="text-xs text-emerald-600 font-mono font-bold">98 Rooftops Commissioned</p>
                <p className="text-[11px] text-slate-500">Avg Net-Meter Time: 14 Days • Rating: 4.8 ★</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">SunEdison Gujarat</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Empanelled Installer</p>
                <p className="text-xs text-emerald-600 font-mono font-bold">76 Rooftops Commissioned</p>
                <p className="text-[11px] text-slate-500">Avg Net-Meter Time: 15 Days • Rating: 4.7 ★</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROVISION NEW USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Provision New User Account
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Add a new authenticated profile with specific role credentials and district assignment.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Trivedi"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. anand.trivedi@gujaratlife.in"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="citizen">🌱 Citizen</option>
                    <option value="campus_leader">🎓 Campus Leader</option>
                    <option value="solar_vendor">☀️ Solar Partner</option>
                    <option value="admin">🏛️ State Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gujarat District</label>
                  <select
                    value={newUserDistrict}
                    onChange={(e) => setNewUserDistrict(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {GUJARAT_DISTRICTS_DATA.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98000 12345"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Create & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
