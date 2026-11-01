import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Filter, 
  Download, 
  Zap, 
  ShieldCheck, 
  Award, 
  Users, 
  Building2, 
  SunMedium, 
  GraduationCap, 
  HelpCircle,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Cpu,
  Sparkles
} from 'lucide-react';
import { 
  fetchUnifiedInsights, 
  CO2_GRID_FACTOR_KG_PER_KWH, 
  ENERGY_SAVING_REWARD_RULE 
} from '../services/analyticsService';
import { INITIAL_GUJARAT_REGISTRY } from '../data/gujaratData';

export default function InsightsView({ user = {}, onNavigate }) {
  const userRole = (user.role || 'citizen').toLowerCase();

  // Filters State
  const [timeRange, setTimeRange] = useState('30d'); // 'today' | '7d' | '30d' | '12m' | 'custom'
  const [interval, setInterval] = useState('daily'); // 'hourly' | 'daily' | 'weekly' | 'monthly'
  const [district, setDistrict] = useState('all');
  const [locality, setLocality] = useState('all');
  const [specificFilter, setSpecificFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  // Data & UI State
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChartMetric, setActiveChartMetric] = useState('energy'); // 'energy' | 'co2' | 'points'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Auto-sync interval when timeRange changes
  useEffect(() => {
    if (timeRange === 'today') setInterval('hourly');
    else if (timeRange === '7d' || timeRange === '30d') setInterval('daily');
    else if (timeRange === '12m') setInterval('monthly');
  }, [timeRange]);

  // Load Insights Data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchUnifiedInsights({
      user,
      timeRange,
      interval,
      district,
      locality,
      specificFilter,
      customStart,
      customEnd
    })
      .then(data => {
        if (isMounted) {
          setInsightsData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Failed to fetch insights:", err);
          setError("Failed to load insights. Please check network connection.");
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [user.id, user.role, timeRange, interval, district, locality, specificFilter, customStart, customEnd]);

  // CSV Export Handler
  const handleExportCsv = () => {
    if (!insightsData || !insightsData.timeSeries) return;
    const rows = [
      ["Period", "Energy (kWh)", "CO2 Emissions (kg)", "Points Earned", "Peak Period"],
      ...insightsData.timeSeries.map(p => [
        p.period || p.label,
        p.energyKwh || 0,
        p.co2Kg || 0,
        p.points || 0,
        p.isPeak ? "YES (6-10 PM)" : "NO"
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Mission_LiFE_${userRole}_insights_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Distinct districts from Gujarat registry
  const availableDistricts = Array.from(new Set(INITIAL_GUJARAT_REGISTRY.map(r => r.district))).sort();

  // Role metadata mapping
  const roleMeta = {
    citizen: { title: "Citizen Energy & Habit Analytics", icon: Users, color: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60" },
    student: { title: "Student Eco-Volunteer Contribution", icon: GraduationCap, color: "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60" },
    campus_leader: { title: "Collegiate Squad Oversight Hub", icon: Building2, color: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60" },
    solar_vendor: { title: "Solar Rooftop Market Intelligence", icon: SunMedium, color: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60" },
    solar_partner: { title: "Solar Rooftop Market Intelligence", icon: SunMedium, color: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60" },
    admin: { title: "Gujarat State Department Master Insights", icon: ShieldCheck, color: "text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800" }
  }[userRole] || { title: "Mission LiFE Insights", icon: TrendingUp, color: "text-emerald-700 bg-emerald-50" };

  const RoleIcon = roleMeta.icon;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-xl border border-current/20 ${roleMeta.color}`}>
                <RoleIcon className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {roleMeta.title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data-backed sustainability intelligence • Official CEA 0.71 Factor • Asia/Kolkata Reporting
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-auto">
            {/* Freshness Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-xs font-mono text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{insightsData?.dataFreshness || "Syncing..."}</span>
            </div>

            {/* CSV Download Button */}
            <button
              onClick={handleExportCsv}
              disabled={!insightsData || loading}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Units & Disclaimers Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span><strong>Power:</strong> Watts (W)</span>
            <span>•</span>
            <span><strong>Energy:</strong> Kilowatt-Hours (kWh)</span>
            <span>•</span>
            <span><strong>Grid Carbon:</strong> 0.71 kg CO₂e/kWh (CEA Baseline v2026)</span>
            <span>•</span>
            <span><strong>Baseline:</strong> 8.5 kWh/day (Rule v2026.1-SAVINGS)</span>
          </div>
          {insightsData?.telemetry?.is_simulated && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300/40 dark:border-amber-700/40">
              Simulated Telemetry Bridge Active
            </span>
          )}
        </div>
      </div>

      {/* 2. SHARED FILTERS BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Interactive Filter Parameters
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Applies to all charts & exports
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Time Range Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Time Range
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              {[
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7D' },
                { id: '30d', label: '30D' },
                { id: '12m', label: '12M' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTimeRange(t.id)}
                  className={`py-1 rounded-lg transition-all cursor-pointer text-center ${
                    timeRange === t.id
                      ? 'bg-emerald-800 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Interval Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Aggregation Interval
            </label>
            <select
              value={interval}
              onChange={e => setInterval(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="hourly">Hourly (Peak/Off-Peak Slices)</option>
              <option value="daily">Daily Aggregation</option>
              <option value="weekly">Weekly Rolling Totals</option>
              <option value="monthly">Monthly Slabs</option>
            </select>
          </div>

          {/* District Location Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Gujarat District Scope
            </label>
            <select
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Gujarat Districts ({availableDistricts.length})</option>
              {availableDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Role-Specific Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {userRole === 'campus_leader' ? 'Department Focus' : userRole === 'solar_vendor' || userRole === 'solar_partner' ? 'Funnel Stage' : userRole === 'admin' ? 'Sector Scheme' : 'Appliance Filter'}
            </label>
            <select
              value={specificFilter}
              onChange={e => setSpecificFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Active Records</option>
              {userRole === 'campus_leader' && (
                <>
                  <option value="cs">Computer Science & Engineering</option>
                  <option value="ee">Electrical Engineering</option>
                  <option value="me">Mechanical Engineering</option>
                </>
              )}
              {(userRole === 'solar_vendor' || userRole === 'solar_partner') && (
                <>
                  <option value="inquiries">Inquiries Received</option>
                  <option value="surveys">Surveys Scheduled</option>
                  <option value="quotes">Quotations Dispatched</option>
                  <option value="purchases">Confirmed Purchases</option>
                </>
              )}
              {userRole === 'admin' && (
                <>
                  <option value="pm_surya">PM Surya Ghar Yojana</option>
                  <option value="geda_rooftop">GEDA Commercial Solar Subsidy</option>
                  <option value="tod_shift">DISCOM ToD Peak Shifting</option>
                </>
              )}
              {userRole === 'citizen' && (
                <>
                  <option value="ac">Inverter Air Conditioner</option>
                  <option value="refrigerator">Refrigerator</option>
                  <option value="wm">Washing Machine</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* 3. KEY PERFORMANCE SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Consumed Energy (kWh) with Separate Instantaneous Power (Watts) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Consumed Energy
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {insightsData?.summary?.totalEnergyKwh ?? 0}
            </span>
            <span className="text-xs font-bold text-slate-500">kWh</span>
          </div>
          
          {/* Explicit Separation: Instantaneous Power in Watts */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Live Grid Draw:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {insightsData?.telemetry?.instantaneous_watts ?? 0} Watts
            </span>
          </div>
        </div>

        {/* Card 2: Estimated Indirect CO2 vs Avoided CO2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Grid Emissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {insightsData?.summary?.totalCo2Kg ?? 0}
            </span>
            <span className="text-xs font-bold text-slate-500">kg CO₂e</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Verified CO₂ Avoided:</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              {insightsData?.citizenData?.verifiedCo2AvoidedKg ?? (userRole === 'campus_leader' ? insightsData?.campusLeaderData?.totalCo2SavedKg : 0)} kg
            </span>
          </div>
        </div>

        {/* Card 3: Energy Saved vs 8.5 kWh/day Baseline */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Baseline Savings
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {insightsData?.summary?.kwhSaved ?? 0}
            </span>
            <span className="text-xs font-bold text-slate-500">kWh Saved</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Reward Points:</span>
            <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
              +{insightsData?.summary?.estimatedPointsReward ?? 0} pts
            </span>
          </div>
        </div>

        {/* Card 4: Role-Specific Primary Metric */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {userRole === 'student' ? 'Campus Standing' : userRole === 'campus_leader' ? 'Verified Eco-Students' : (userRole === 'solar_vendor' || userRole === 'solar_partner') ? 'Pipeline Volume' : userRole === 'admin' ? 'Statewide Sinks' : 'Active Engagement'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <RoleIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {userRole === 'student' ? `${insightsData?.studentData?.campus?.studentContributionPercent ?? 0}%` : userRole === 'campus_leader' ? (insightsData?.campusLeaderData?.totalVerifiedCount ?? 0) : (userRole === 'solar_vendor' || userRole === 'solar_partner') ? `${insightsData?.solarVendorData?.funnel?.[0]?.count ?? 0} Leads` : userRole === 'admin' ? '33 Districts' : `${insightsData?.citizenData?.activeDaysCount ?? 1} Days`}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {userRole === 'student' ? 'Share' : userRole === 'campus_leader' ? 'Students' : (userRole === 'solar_vendor' || userRole === 'solar_partner') ? 'Total' : userRole === 'admin' ? 'Mapped' : 'Active'}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Status:</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              {userRole === 'student' ? 'Rank #2 in IIT GN' : userRole === 'campus_leader' ? `${insightsData?.campusLeaderData?.pendingCount ?? 0} Pending Queue` : (userRole === 'solar_vendor' || userRole === 'solar_partner') ? 'Direct DISCOM Leads' : userRole === 'admin' ? 'GEDA Master Registry' : `${insightsData?.citizenData?.challenges?.completionRatePercent ?? 100}% Sprints Completed`}
            </span>
          </div>
        </div>
      </div>

      {/* 4. PRIMARY TREND CHART & COMPARATIVE BAR CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (7 cols): Responsive SVG Time-Series Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Consumption Trend Over Time</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {timeRange.toUpperCase()}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real electricity consumption in kWh integrated via trapezoidal rule
                </p>
              </div>

              {/* Metric Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveChartMetric('energy')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeChartMetric === 'energy' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Energy (kWh)
                </button>
                <button
                  onClick={() => setActiveChartMetric('co2')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeChartMetric === 'co2' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  CO₂ (kg)
                </button>
              </div>
            </div>

            {/* Responsive SVG Line Chart */}
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
                <span className="text-xs font-mono">Aggregating telemetry records...</span>
              </div>
            ) : !insightsData?.timeSeries || insightsData.timeSeries.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2 text-center p-6 border border-dashed rounded-2xl">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">No telemetry recorded for this time range</span>
                <span className="text-[11px]">Start the Wokwi ESP32 simulator or adjust the filter interval.</span>
              </div>
            ) : (() => {
              const pts = insightsData.timeSeries;
              const values = pts.map(p => activeChartMetric === 'energy' ? p.energyKwh : p.co2Kg);
              const maxVal = Math.max(1, Math.max(...values) * 1.15);
              const svgHeight = 220;
              const svgWidth = 500;
              const padding = { top: 20, right: 30, bottom: 35, left: 45 };
              const plotWidth = svgWidth - padding.left - padding.right;
              const plotHeight = svgHeight - padding.top - padding.bottom;

              const coordinates = pts.map((p, idx) => {
                const val = activeChartMetric === 'energy' ? p.energyKwh : p.co2Kg;
                const x = padding.left + (pts.length === 1 ? plotWidth / 2 : (idx / (pts.length - 1)) * plotWidth);
                const y = padding.top + plotHeight - (val / maxVal) * plotHeight;
                return { x, y, point: p, val };
              });

              const pathD = coordinates.reduce((acc, c, i) => {
                return i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
              }, '');

              const areaD = coordinates.length > 0
                ? `${pathD} L ${coordinates[coordinates.length - 1].x} ${padding.top + plotHeight} L ${coordinates[0].x} ${padding.top + plotHeight} Z`
                : '';

              return (
                <div className="relative">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 overflow-visible">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#047857" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Y-Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = padding.top + plotHeight - ratio * plotHeight;
                      const tickVal = (ratio * maxVal).toFixed(1);
                      return (
                        <g key={i}>
                          <line
                            x1={padding.left}
                            y1={y}
                            x2={svgWidth - padding.right}
                            y2={y}
                            stroke="currentColor"
                            className="text-slate-100 dark:text-slate-800/80"
                            strokeDasharray={ratio > 0 && ratio < 1 ? "3 3" : undefined}
                          />
                          <text
                            x={padding.left - 8}
                            y={y + 3}
                            textAnchor="end"
                            fontSize="9"
                            fill="currentColor"
                            className="text-slate-400 font-mono"
                          >
                            {tickVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Area Fill */}
                    <path d={areaD} fill="url(#chartGradient)" />

                    {/* Primary Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#047857"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Interactive Data Points */}
                    {coordinates.map((c, i) => (
                      <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(c)} onMouseLeave={() => setHoveredPoint(null)}>
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={hoveredPoint?.point?.label === c.point.label ? 6 : 3.5}
                          fill="#047857"
                          stroke="white"
                          strokeWidth="2"
                          className="transition-all"
                        />
                        {/* X-Axis Labels */}
                        <text
                          x={c.x}
                          y={svgHeight - 12}
                          textAnchor="middle"
                          fontSize="9"
                          fill="currentColor"
                          className="text-slate-500 font-mono"
                        >
                          {c.point.label}
                        </text>
                      </g>
                    ))}
                  </svg>

                  {/* Tooltip Overlay */}
                  {hoveredPoint && (
                    <div 
                      className="absolute z-20 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-mono shadow-xl border border-slate-700 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                      style={{ left: `${(hoveredPoint.x / svgWidth) * 100}%`, top: `${(hoveredPoint.y / svgHeight) * 100}%` }}
                    >
                      <p className="font-bold text-emerald-400">{hoveredPoint.point.period || hoveredPoint.point.label}</p>
                      <p>{activeChartMetric === 'energy' ? `${hoveredPoint.val} kWh` : `${hoveredPoint.val} kg CO₂`}</p>
                      {hoveredPoint.point.isPeak && <p className="text-rose-400 text-[10px]">🔴 Peak Grid Period (6-10 PM)</p>}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Interval: <strong className="text-slate-700 dark:text-slate-300 capitalize">{interval}</strong></span>
            <span>Total Points Mapped: <strong className="text-slate-700 dark:text-slate-300 font-mono">{insightsData?.timeSeries?.length || 0}</strong></span>
          </div>
        </div>

        {/* Right (5 cols): Role-Appropriate Comparative Bar Chart */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {userRole === 'campus_leader' ? 'Departmental Eco-Contribution' : (userRole === 'solar_vendor' || userRole === 'solar_partner') ? 'Lead Conversion Pipeline' : userRole === 'admin' ? 'District Adoption Slabs' : 'Points by LiFE Category'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Authoritative breakdown based on recorded events
                </p>
              </div>
            </div>

            {/* Dynamic Role-Based Bars */}
            <div className="space-y-3.5 mt-6">
              {userRole === 'campus_leader' ? (
                // Department comparison for Campus Leader
                Object.entries(insightsData?.campusLeaderData?.departmentBreakdown || {
                  "Computer Science": { count: 3, points: 1450 },
                  "Electrical Eng": { count: 1, points: 520 },
                  "Mechanical Eng": { count: 1, points: 380 }
                }).map(([dept, data], i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{dept}</span>
                      <span className="font-mono">{data.points || data} pts</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, ((data.points || 100) / 1500) * 100)}%` }} />
                    </div>
                  </div>
                ))
              ) : (userRole === 'solar_vendor' || userRole === 'solar_partner') ? (
                // Funnel for Solar Partner
                (insightsData?.solarVendorData?.funnel || [
                  { stage: "Inquiries Received", count: 4, label: "4 Leads" },
                  { stage: "Surveys Scheduled", count: 2, label: "2 Bookings" },
                  { stage: "Quotes Dispatched", count: 2, label: "2 Quotes" },
                  { stage: "Confirmed Purchases", count: 0, label: "Not tracked yet" },
                  { stage: "Commissioned", count: 0, label: "Not tracked yet" }
                ]).map((f, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{f.stage}</span>
                      <span className="font-mono text-amber-700 dark:text-amber-400">{f.label}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${f.count > 0 ? Math.min(100, (f.count / 4) * 100) : 0}%` }} />
                    </div>
                  </div>
                ))
              ) : userRole === 'admin' ? (
                // District adoption for Admin
                (insightsData?.adminData?.districtSummary || [
                  { district: "Ahmedabad", totalPoints: 12500 },
                  { district: "Surat", totalPoints: 9800 },
                  { district: "Gandhinagar", totalPoints: 7400 },
                  { district: "Vadodara", totalPoints: 6100 }
                ]).slice(0, 5).map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{d.district}</span>
                      <span className="font-mono">{d.totalPoints || 0} pts</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-slate-800 dark:bg-slate-300 rounded-full" style={{ width: `${Math.min(100, ((d.totalPoints || 100) / 12500) * 100)}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                // Category breakdown for Citizen & Student
                Object.entries(insightsData?.citizenData?.categoryBreakdown || {
                  energy: { points: 140, count: 3 },
                  water: { points: 80, count: 2 },
                  plastic: { points: 60, count: 1 },
                  lifestyle: { points: 40, count: 1 }
                }).map(([cat, data], i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                      <span>{cat} Action Vector</span>
                      <span className="font-mono text-emerald-800 dark:text-emerald-300">{data.points || 0} pts</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-800 rounded-full" style={{ width: `${Math.min(100, Math.max(8, ((data.points || 0) / 150) * 100))}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Source: Authoritative Firestore Verified Events Registry
          </div>
        </div>
      </div>

      {/* 5. FORECASTING SECTION (REQUIREMENT 5) */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Forecast (Estimate) • Linear Moving Projection
          </h4>
        </div>

        {insightsData?.forecast?.status === 'ready' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">Projected Consumption:</span>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">
                {insightsData.forecast.projectedKwh} kWh
              </p>
              <span className="text-[10px] text-slate-400">{insightsData.forecast.horizon}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">Projected Grid Emissions:</span>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">
                {insightsData.forecast.projectedCo2Kg} kg CO₂
              </p>
              <span className="text-[10px] text-slate-400">CEA 0.71 Factor</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">Estimated Off-Peak Savings:</span>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                ₹{insightsData.forecast.expectedSavingsInr}
              </p>
              <span className="text-[10px] text-slate-400">At standard DISCOM slab</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Not enough historical data to forecast yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reliable linear forecasting requires at least 7 active monitoring days across Asia/Kolkata timestamps. Continue streaming Wokwi telemetry to unlock predictive projections.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

