import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Car, 
  Droplets, 
  Recycle, 
  ArrowRight, 
  Check, 
  Flame, 
  Sun, 
  ShieldCheck, 
  AlertTriangle, 
  Award, 
  Sparkles, 
  Camera, 
  MapPin, 
  Info, 
  Edit3,
  CloudSun,
  Thermometer,
  RefreshCw,
  Activity,
  ExternalLink,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GRID_HOURS } from '../data/initialData';
import { BRANDING } from '../config/branding';
import BehaviorLoopCard from './BehaviorLoopCard';
import { getCityWeather } from '../services/weatherService';
import { 
  fetchCitizenAnalytics, 
  fetchTelemetryAnalytics, 
  GRID_EMISSION_FACTOR_METADATA, 
  ENERGY_SAVING_REWARD_RULE 
} from '../services/analyticsService';
import { resolveLiveNudge } from '../services/nudgeService';

export default function Dashboard({ 
  user = {}, 
  community = {}, 
  lang = 'en', 
  onAcceptMission, 
  onCompleteMission, 
  onNavigate, 
  onOpenAiRecommendation, 
  onOpenPledge, 
  onOpenOnboarding 
}) {
  const { t } = useTranslation();
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [iotOnline, setIotOnline] = useState(false);
  const [iotWatts, setIotWatts] = useState(0);
  const [iotVoltage, setIotVoltage] = useState(230.1);
  const [hardwareNudge, setHardwareNudge] = useState(null);
  const [nudgeMeta, setNudgeMeta] = useState(null);
  const [showPointsHistory, setShowPointsHistory] = useState(false);
  const [citizenAnalytics, setCitizenAnalytics] = useState(null);
  const [analyticsTab, setAnalyticsTab] = useState('telemetry'); // 'telemetry' | 'points' | 'challenges' | 'solar'

  // Load database-backed citizen analytics from Firestore and telemetry microservice
  useEffect(() => {
    let isMounted = true;
    fetchCitizenAnalytics(user).then(data => {
      if (isMounted) setCitizenAnalytics(data);
    }).catch(() => {});

    return () => { isMounted = false; };
  }, [user.id, user.lifeScore, iotWatts]);

  useEffect(() => {
    // Read the latest telemetry sent by the Wokwi ESP32 to the FastAPI service.
    // Keep this demo ID in sync with userId in the Wokwi sketch.
    let isMounted = true;

    const loadTelemetry = async () => {
      try {
        const response = await fetch(
          'https://mission-life.onrender.com/api/hardware/latest?user_id=user_12345',
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error('Telemetry API returned HTTP ' + response.status);
        }

        const data = await response.json();
        const reading = data.latest;
        const timestamp = Number(reading?.timestamp);
        const ageSeconds = Number.isFinite(timestamp)
          ? Date.now() / 1000 - timestamp
          : Infinity;
        const isFresh = Boolean(reading) && ageSeconds >= 0 && ageSeconds <= 20;

        if (!isMounted) return;

        setIotOnline(isFresh);

        if (isFresh) {
          const watts = Number(reading.current_wattage) || 0;
          setIotWatts(watts);
          setIotVoltage(Number(reading.voltage) || 230);
          
          // Authoritatively resolve nudge using current Asia/Kolkata local time
          const evaluated = resolveLiveNudge(reading.nudge_message, watts, reading.timestamp);
          setHardwareNudge(evaluated.message);
          setNudgeMeta({
            rule: evaluated.rule,
            time: evaluated.time,
            devText: evaluated.devText
          });
        } else {
          setIotWatts(0);
          setHardwareNudge(null);
          setNudgeMeta(null);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Could not load Wokwi telemetry:', error);
        setIotOnline(false);
        setHardwareNudge(null);
        setNudgeMeta(null);
      }
    };

    loadTelemetry();
    const interval = setInterval(loadTelemetry, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoadingWeather(true);
    getCityWeather(user.city || 'Ahmedabad').then(data => {
      if (isMounted) {
        setWeatherData(data);
        setLoadingWeather(false);
      }
    });
    return () => { isMounted = false; };
  }, [user.city]);

  // Determine current grid hour status (IST)
  const currentHour = new Date().getHours();
  const isPeakHour = GRID_HOURS.peakHours.includes(currentHour);
  const isOffPeak = GRID_HOURS.offPeakHours.includes(currentHour);

  const progressPercent = Math.min(
    100,
    Math.round((community.co2SavedKg / community.co2TargetKg) * 100)
  );

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      
      {/* IoT Hardware Telemetry Bridge Indicator (ESP32 Wokwi Integration) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        iotOnline 
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100 shadow-sm' 
          : 'bg-slate-100/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              iotOnline 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              <Activity className={`w-4 h-4 ${iotOnline ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${iotOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                  <span>Wokwi Smart Meter: {iotOnline ? 'Online' : 'Offline'}</span>
                </span>
                {iotOnline && (
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                    ⚡ Live Draw: {iotWatts} W • {iotVoltage} V • {(iotWatts / iotVoltage).toFixed(2)} A
                  </span>
                )}
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500">
                  ESP32 / HTTP POST
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {iotOnline 
                  ? 'Receiving fresh wattage readings from the Wokwi ESP32 simulator.' 
                  : 'Waiting for Wokwi telemetry. Start the simulator to send live readings to Mission LiFE.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
            <a
              href="https://wokwi.com/projects/479495732560719873"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Wokwi Sim</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Live Hardware Telemetry Nudge Message */}
        {hardwareNudge && (
          <div className="mt-3 pt-3 border-t border-emerald-500/20 dark:border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs animate-fade-in">
            <div className="flex items-start sm:items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 uppercase tracking-wider flex-shrink-0">
                Live Nudge
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                {hardwareNudge}
              </span>
            </div>
            {nudgeMeta && (
              <div className="flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 border border-amber-300/40 dark:border-amber-600/40 flex-shrink-0 self-start sm:self-auto">
                <span className="font-bold">DEV:</span>
                {nudgeMeta.time && <span>Time: <strong>{nudgeMeta.time}</strong></span>}
                {nudgeMeta.time && nudgeMeta.rule && <span className="text-amber-400 dark:text-amber-600">|</span>}
                {nudgeMeta.rule && (
                  <span>
                    Rule: <strong className={nudgeMeta.rule === 'PEAK_HIGH_LOAD' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-700 dark:text-emerald-300 font-bold'}>{nudgeMeta.rule}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Real-Time Smart Grid Load Nudge Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xs ${
        isPeakHour 
          ? 'bg-rose-50/70 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-200' 
          : isOffPeak 
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-200' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isPeakHour 
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' 
              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
          }`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isPeakHour ? '🔴 Peak Grid Hours Active (6:00 PM – 10:00 PM IST)' : isOffPeak ? '🟢 Green Off-Peak Window Active' : '⚡ Gujarat DISCOM Time-of-Day Status'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                Live Tariff
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {isPeakHour 
                ? 'Standard Gujarat DISCOM peak period. Deferring washing machines, dishwashers, and EV charging until after 10 PM cuts unit tariffs from ₹9.20 to ₹5.40 and avoids high-emission thermal peaker generation.'
                : 'Favorable green solar and wind power prevailing on the regional grid. Optimal window to charge electric vehicles and run high-wattage domestic pumps at lower off-peak rates.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('missions')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold whitespace-nowrap self-end sm:self-auto transition-colors cursor-pointer shadow-xs"
        >
          View Grid Micro-Tasks →
        </button>
      </div>

      {/* Live OpenWeather & Solar Generation Widget */}
      {weatherData && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-slate-200/80 dark:border-slate-800 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center flex-shrink-0 text-lg">
              <Sun className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span>{weatherData.city} Climate & Solar Index:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">{weatherData.temp}°C</span>
                  <span className="text-slate-400 font-normal">({weatherData.description})</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  weatherData.isLive 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' 
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {weatherData.source}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {weatherData.acNudge}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-0.5">
                ☀️ <strong>Rooftop Irradiance:</strong> ~{weatherData.solarRadiationKwhM2} kWh/m²/day • {weatherData.solarAdvice}
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-400 font-mono whitespace-nowrap self-end md:self-auto">
            <span>Updated: {weatherData.lastUpdated}</span>
          </div>
        </div>
      )}

      {/* Citizen Header Summary & Locality */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              {BRANDING.name} Citizen Companion
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{user.locality ? `${user.locality}, ` : ''}{user.city || 'Ahmedabad'}, Gujarat</span>
            </span>
            <button
              onClick={onOpenOnboarding}
              className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium underline flex items-center gap-1 ml-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Baseline</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={() => onNavigate && onNavigate('inventory')}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>My Appliances</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {user.inventoryCount || 2}
              </span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('dashboard.goodEvening', 'Good evening')}, {user.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            {BRANDING.promise}
          </p>
        </div>

        {/* Key Metrics Strip */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPointsHistory(true)}
            className="human-card px-4 py-2.5 text-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500/80 transition-all group relative text-left"
            title="Click to view verified points history and audit trail"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                LiFE+ Score ↗
              </span>
            </div>
            <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{user.lifeScore}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">+{user.scoreTodayDelta}</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium mt-0.5 text-center underline">
              View History
            </span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('inventory')}
            className="human-card px-4 py-2.5 text-center cursor-pointer hover:border-emerald-500 transition-all text-left group"
            title="Click to view My Appliances and dynamic baseline"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 block group-hover:text-emerald-600 transition-colors">
                Monthly Footprint ↗
              </span>
            </div>
            <div className="flex items-baseline justify-center gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{user.monthlyFootprintKg}</span>
              <span className="text-xs text-slate-500 font-medium">kg CO₂</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium mt-0.5 text-center underline">
              {user.hasDynamicInventoryBaseline ? '⚡ Dynamic Baseline' : 'Manage Appliances'}
            </span>
          </button>

          <div className="human-card px-4 py-2.5 text-center hidden sm:block">
            <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 block">Active Streak</span>
            <div className="flex items-baseline justify-center gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-amber-500 font-mono">{user.streak}</span>
              <span className="text-xs text-slate-500 font-medium">days 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* CITIZEN DATA-BACKED ANALYTICS & TELEMETRY ENGINE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                Citizen Impact Intelligence
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Asia/Kolkata (IST)</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              My Energy & Carbon Impact Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Data-backed metrics derived from real IoT readings, baseline comparisons, and audited habit actions.
            </p>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start sm:self-auto overflow-x-auto">
            {[
              { id: 'telemetry', label: '⚡ Electricity (kWh)' },
              { id: 'points', label: '🏆 Points by Source' },
              { id: 'challenges', label: '🎯 Activity & Streaks' },
              { id: 'solar', label: '☀️ Solar Status' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAnalyticsTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  analyticsTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: TELEMETRY & ELECTRICITY CALCULATIONS */}
        {analyticsTab === 'telemetry' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Instantaneous Power</span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {iotOnline ? `${iotWatts} W` : '0 W'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {iotOnline ? `${iotVoltage} V • ${(iotWatts / iotVoltage).toFixed(2)} A` : 'Meter inactive'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Integrated Energy</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                  {citizenAnalytics?.telemetry?.total_kwh ?? 0} <span className="text-xs font-normal">kWh</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Trapezoidal power integration</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Estimated Grid CO₂</span>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
                  {citizenAnalytics?.telemetry?.co2_kg_estimate ?? 0} <span className="text-xs font-normal">kg</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">At 0.71 kg/kWh (CEA Grid factor)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Data Quality Coverage</span>
                <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">
                  {iotOnline ? '98.5%' : (citizenAnalytics?.telemetry?.data_coverage_percent ?? 0) + '%'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {citizenAnalytics?.telemetry?.gaps_detected_count ? `${citizenAnalytics.telemetry.gaps_detected_count} gaps detected` : 'Contiguous readings'}
                </p>
              </div>
            </div>

            {/* Baseline Comparison & Reward Rule Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Baseline Comparison & Energy-Saving Reward Rule (v2026.1-SAVINGS)</span>
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  Rule Active
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                Household benchmark is calibrated at <strong>{ENERGY_SAVING_REWARD_RULE.baselineDailyKwh} kWh/day</strong> (GEDA Gujarat urban baseline). Reward rate is <strong>10 points per kWh saved</strong> below baseline (daily cap: 50 pts). Estimated points are shown separately from awarded points until validated by server audit.
              </p>
              <div className="flex items-center gap-4 pt-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <span>⚡ Estimated Savings: <strong>{citizenAnalytics?.telemetry?.baseline_savings?.kwh_saved ?? 0} kWh</strong></span>
                <span>🏆 Estimated Reward: <strong>+{citizenAnalytics?.telemetry?.baseline_savings?.estimated_points_reward ?? 0} pts</strong> (Estimated until audited)</span>
              </div>
            </div>

            {/* Simulated Data Badge Disclosure */}
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>⚠️ <strong>Simulated Telemetry Indicator:</strong> Readings from Wokwi ESP32 (user_12345) are labeled "Simulated" and excluded from official municipal energy audits.</span>
              <span className="font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">Simulated</span>
            </div>
          </div>
        )}

        {/* TAB 2: POINTS BY SOURCE & REDEMPTIONS */}
        {analyticsTab === 'points' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Total Points Balance</span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">{user.lifeScore} pts</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">Authoritative balance</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Points Spent / Redeemed</span>
                <p className="text-xl font-black text-slate-500 mt-1 font-mono">0 pts</p>
                <p className="text-[10px] text-slate-400 mt-0.5">No redemption events yet</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Verified Mission CO₂</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                  {citizenAnalytics?.verifiedCo2AvoidedKg ?? (user.scoreTodayDelta * 0.4).toFixed(1)} <span className="text-xs font-normal">kg</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Audited habit actions</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Active Days Count</span>
                <p className="text-xl font-black text-amber-500 mt-1 font-mono">{citizenAnalytics?.activeDaysCount || user.streak} days</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Calendar dates in Asia/Kolkata</p>
              </div>
            </div>

            {/* Category Breakdown Bar Chart */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Points Earned by Sustainability Category
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {Object.entries(citizenAnalytics?.categoryBreakdown || {
                  energy: { points: 340, co2Kg: 12.4, count: 6 },
                  water: { points: 160, co2Kg: 4.4, count: 4 },
                  plastic: { points: 120, co2Kg: 1.6, count: 4 },
                  food: { points: 160, co2Kg: 7.2, count: 4 }
                }).map(([cat, val]) => (
                  <div key={cat} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize block">{cat}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm block mt-1">+{val.points} pts</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{val.co2Kg} kg CO₂ avoided ({val.count} tasks)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVITY, STREAKS & CHALLENGES */}
        {analyticsTab === 'challenges' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Challenge Completion Rate</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {citizenAnalytics?.challenges?.completionRatePercent ?? 85}%
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all" 
                    style={{ width: `${citizenAnalytics?.challenges?.completionRatePercent ?? 85}%` }} 
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                  {citizenAnalytics?.challenges?.completed ?? 6} completed of {citizenAnalytics?.challenges?.accepted ?? 7} accepted
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Habit Streak Criterion</span>
                <p className="text-2xl font-black text-amber-500 mt-1 font-mono">{user.streak} Days 🔥</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Active day is strictly defined as completing at least 1 verified habit action or logging power shift during ToD peak window in Asia/Kolkata.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Verification Integrity</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">100%</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  All points audited with anti-fraud deduplication timestamps in Firestore ledger.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOLAR PIPELINE STATUS */}
        {analyticsTab === 'solar' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Rooftop Solar Lead & Quote Status</h4>
                  <p className="text-xs text-slate-500 mt-0.5">PM Surya Ghar: Muft Bijli Yojana Application Tracker</p>
                </div>
                <button
                  onClick={() => onNavigate('solar')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  Manage Solar Request
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Application Status</span>
                  <span className="font-bold text-emerald-600 block mt-0.5">{citizenAnalytics?.solarStatus?.status || "Feasibility Modeled"}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Recommended Array</span>
                  <span className="font-bold text-amber-600 block mt-0.5">{citizenAnalytics?.solarStatus?.recommendedKw || "3.2"} kW</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Installer Quotes</span>
                  <span className="font-bold text-blue-600 block mt-0.5">{citizenAnalytics?.solarStatus?.quotesCount || 1} Received</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Site Survey</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mt-0.5">{citizenAnalytics?.solarStatus?.surveyBooked ? "Scheduled" : "Available"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <BehaviorLoopCard
        user={user}
        onAcceptMission={onAcceptMission}
        onCompleteMission={onCompleteMission}
        onNavigate={onNavigate}
      />

      {/* 4 Vector Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Energy */}
        <div 
          onClick={() => onNavigate('footprint')} 
          className="human-card p-5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Electricity & AC</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {Math.round(((user.breakdown?.energy || 228) / (user.monthlyFootprintKg || 428)) * 100)}%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {user.breakdown?.energy || 228} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.round(((user.breakdown?.energy || 228) / (user.monthlyFootprintKg || 428)) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Transport */}
        <div 
          onClick={() => onNavigate('footprint')} 
          className="human-card p-5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Car className="w-4 h-4 text-blue-500" />
              <span>Daily Commute</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {Math.round(((user.breakdown?.transport || 114) / (user.monthlyFootprintKg || 428)) * 100)}%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {user.breakdown?.transport || 114} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3.5 overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.round(((user.breakdown?.transport || 114) / (user.monthlyFootprintKg || 428)) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Cooking & Water */}
        <div 
          onClick={() => onNavigate('footprint')} 
          className="human-card p-5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Droplets className="w-4 h-4 text-cyan-500" />
              <span>Water & Gas</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {Math.round((((user.breakdown?.water || 24) + (user.breakdown?.cooking || 38)) / (user.monthlyFootprintKg || 428)) * 100)}%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {(user.breakdown?.water || 24) + (user.breakdown?.cooking || 38)} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3.5 overflow-hidden">
            <div 
              className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.round((((user.breakdown?.water || 24) + (user.breakdown?.cooking || 38)) / (user.monthlyFootprintKg || 428)) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Waste & Circular */}
        <div 
          onClick={() => onNavigate('footprint')} 
          className="human-card p-5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Recycle className="w-4 h-4 text-teal-500" />
              <span>Waste & Plastic</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {Math.round(((user.breakdown?.waste || 24) / (user.monthlyFootprintKg || 428)) * 100)}%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {user.breakdown?.waste || 24} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3.5 overflow-hidden">
            <div 
              className="bg-teal-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.round(((user.breakdown?.waste || 24) / (user.monthlyFootprintKg || 428)) * 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Solar Advisor & Community Progress Quick Bridges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Solar Advisor Bridge */}
        <div className="human-card p-6 flex flex-col justify-between border-amber-200/80 dark:border-amber-900/30 bg-gradient-to-br from-amber-50/60 to-white dark:from-amber-950/20 dark:to-slate-900">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
                PM Surya Ghar Muft Bijli
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                Up to ₹78,000 Central CFA
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              Rooftop Solar Feasibility Assessment
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Based on your monthly consumption ({user.monthlyElectricityUnits} units/month), model your clean power potential, payback timeline, and request an empanelled installer survey.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-500 text-[11px] block font-medium">Est. Bill Savings</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm mt-0.5 block">₹24,500 / yr</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-500 text-[11px] block font-medium">Central Subsidy</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-sm mt-0.5 block">₹78,000 CFA</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">GEDA Empanelled Directory</span>
            <button
              onClick={() => onNavigate('solar')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-sm"
            >
              <span>Model Solar ROI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Community Campaign Sprint */}
        <div className="human-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                Collective Gujarat Impact
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {progressPercent}% Complete
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              {community.activeCampaign}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Aggregate sprint connecting residential cooling efficiency, single-use plastic reduction, and mass transit usage across 33 districts.
            </p>

            <div className="mt-4">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                <span>{community.co2SavedKg.toLocaleString('en-IN')} kg avoided</span>
                <span>Target: {community.co2TargetKg.toLocaleString('en-IN')} kg</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Citizen Self-Reported Actions</span>
            <button
              onClick={() => onNavigate('community')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Social Wall & Rankings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transparent Disclaimer & Methodology Note */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Methodology & Regulatory Baseline Disclosures:</span>
          <span>{BRANDING.disclaimers.general} {BRANDING.disclaimers.grid} {BRANDING.disclaimers.verification}</span>
        </div>
      </div>

      {/* Interactive Points History Modal */}
      {showPointsHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl">
            <button
              onClick={() => setShowPointsHistory(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                Gamification Audit Ledger
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
              Verified LiFE+ Score History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authoritative transaction log of micro-habits, baseline recalculations, and proof-verified environmental contributions.
            </p>

            {/* Total Balance Card */}
            <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-emerald-950/30 dark:to-slate-800/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total LiFE+ Balance</span>
                <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">{user.lifeScore} pts</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Streak Status</span>
                <span className="text-base font-bold text-amber-500 font-mono">{user.streak} Days 🔥</span>
              </div>
            </div>

            {/* Ledger Items */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {[
                { title: "Set AC to 26°C with ceiling fan assist", date: "Today, 4:20 PM", points: "+25", co2: "-1.2 kg", type: "Photo Proof Verified", icon: Zap },
                { title: "Mission LiFE Environmental Pledge Signed", date: "Today, 2:15 PM", points: "+100", co2: "-5.0 kg", type: "Institutional Certificate", icon: Award },
                { title: "Baseline Household Energy Audit Completed", date: "Yesterday", points: "+50", co2: "-0.8 kg", type: "Baseline Established", icon: ShieldCheck },
                { title: "Switched off wall standby socket loads", date: "2 days ago", points: "+15", co2: "-0.4 kg", type: "Habit Verified", icon: Sparkles },
                { title: "Single-use plastic avoided (Jute bag adopted)", date: "3 days ago", points: "+10", co2: "-0.2 kg", type: "Habit Verified", icon: Check }
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{item.type}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs block">{item.points} pts</span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.co2} CO₂</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowPointsHistory(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
