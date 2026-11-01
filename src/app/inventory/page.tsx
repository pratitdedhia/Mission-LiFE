import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Plus, 
  Trash2, 
  Zap, 
  Sparkles, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  TrendingDown, 
  Home, 
  Info, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  APPLIANCE_PRESETS, 
  getAppliances, 
  addAppliance, 
  removeAppliance, 
  calculateInventoryBaseline,
  syncInventoryBaselineToFirestore 
} from '../../services/applianceService';

interface ApplianceInventoryProps {
  user: any;
  onNavigate?: (tab: string) => void;
  onUserUpdate?: (updatedUser: any) => void;
}

export default function ApplianceInventoryPage({ user = {}, onNavigate, onUserUpdate }: ApplianceInventoryProps) {
  const [appliances, setAppliances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Manual Entry
  const [selectedPresetType, setSelectedPresetType] = useState('air_conditioner');
  const [customName, setCustomName] = useState('');
  const [wattage, setWattage] = useState(1450);
  const [dailyHours, setDailyHours] = useState(8);
  const [roomLocation, setRoomLocation] = useState('Living Room');
  const [monthlyCo2e, setMonthlyCo2e] = useState(172.5);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user appliances
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const list = await getAppliances(user?.id || 'usr_citizen');
      if (isMounted) {
        setAppliances(list);
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [user?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Handle Preset Selection Change
  const handlePresetChange = (type: string) => {
    setSelectedPresetType(type);
    const preset = APPLIANCE_PRESETS.find(p => p.type === type) || APPLIANCE_PRESETS[0];
    setCustomName(preset.name);
    setWattage(preset.defaultWattage);
    setDailyHours(preset.defaultDailyHours);
    setMonthlyCo2e(preset.monthlyCo2e);
  };

  // Recalculate monthly co2e when wattage or hours change
  const handleWattageChange = (w: number) => {
    setWattage(w);
    // Formula: (Wattage * DailyHours * 30 * 0.82 kg/kWh) / 1000
    const est = Math.round(((w * dailyHours * 30 * 0.82) / 1000) * 10) / 10;
    setMonthlyCo2e(est);
  };

  const handleHoursChange = (h: number) => {
    setDailyHours(h);
    const est = Math.round(((wattage * h * 30 * 0.82) / 1000) * 10) / 10;
    setMonthlyCo2e(est);
  };

  // Apply dynamic baseline across user profile
  const triggerBaselineUpdate = (currentList: any[]) => {
    const dynamicBaseline = calculateInventoryBaseline(currentList, user);
    if (onUserUpdate) {
      onUserUpdate({
        ...user,
        monthlyFootprintKg: dynamicBaseline.monthlyFootprintKg,
        breakdown: dynamicBaseline.breakdown,
        hasDynamicInventoryBaseline: true,
        inventoryCount: dynamicBaseline.applianceCount,
        appliances: currentList
      });
    }
    syncInventoryBaselineToFirestore(user?.id || 'usr_citizen', dynamicBaseline);
  };

  // Add Appliance Handler
  const handleAddAppliance = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedPresetType) {
      setFormError("Please select an appliance type.");
      return;
    }
    if (wattage <= 0) {
      setFormError("Wattage must be greater than 0 W.");
      return;
    }

    setIsSubmitting(true);
    const preset = APPLIANCE_PRESETS.find(p => p.type === selectedPresetType) || APPLIANCE_PRESETS[0];

    const payload = {
      appliance_type: selectedPresetType,
      appliance_name: customName || preset.name,
      category: preset.category,
      wattage: Number(wattage),
      daily_hours: Number(dailyHours),
      duty_cycle: preset.dutyCycle,
      monthly_co2e: Number(monthlyCo2e),
      room_location: roomLocation || 'Main Residence',
      source: 'manual_entry',
      confidence: 1.0,
      energy_saving_nudge: preset.tip
    };

    const result = await addAppliance(user?.id || 'usr_citizen', payload);
    setIsSubmitting(false);

    if (result.success) {
      setAppliances(result.allAppliances);
      triggerBaselineUpdate(result.allAppliances);
      setShowAddForm(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      showToast(`Added ${payload.appliance_name} to inventory! Footprint baseline dynamically recalculated.`);
    }
  };

  // Remove Appliance Handler
  const handleRemoveAppliance = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your home inventory?`)) {
      return;
    }

    const result = await removeAppliance(user?.id || 'usr_citizen', id);
    if (result.success) {
      setAppliances(result.allAppliances);
      triggerBaselineUpdate(result.allAppliances);
      showToast(`Removed "${name}". Dynamic baseline adjusted.`);
    }
  };

  // Dynamic baseline calculations for this view
  const baselineStats = calculateInventoryBaseline(appliances, user);
  const totalKw = (baselineStats.totalWattage / 1000).toFixed(2);

  // Group appliances by type for targeted recommendations
  const applianceTypesInHome = new Set(appliances.map(a => a.appliance_type));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Smart Home Ecosystem</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Firestore: users/{user?.id || 'uid'}/appliances
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            My Appliances & Dynamic Baseline
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Maintain your household appliance registry. Verified appliances dynamically override your questionnaire baseline with empirical wattage and power draw.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => onNavigate && onNavigate('scan')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs border border-slate-300 dark:border-slate-700"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Scan with YOLOv8</span>
          </button>

          <button
            onClick={() => {
              handlePresetChange('air_conditioner');
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'Add Appliance Manually'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Baseline Telemetry KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span className="uppercase text-[10px] font-mono font-bold tracking-wider">Registered Assets</span>
            <Home className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
            {appliances.length} <span className="text-xs font-normal text-slate-500">items</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
            Empirically verified
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span className="uppercase text-[10px] font-mono font-bold tracking-wider">Connected Power</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
            {totalKw} <span className="text-xs font-normal text-slate-500">kW</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">
            {baselineStats.totalWattage.toLocaleString()} W total draw
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span className="uppercase text-[10px] font-mono font-bold tracking-wider">Appliance Footprint</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
            {baselineStats.totalApplianceCo2e} <span className="text-xs font-normal text-slate-500">kg/mo</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Active domestic load
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-1">
            <span className="uppercase text-[10px] font-mono font-bold tracking-wider">Dynamic Baseline</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-800 dark:text-emerald-200">
            {baselineStats.monthlyFootprintKg} <span className="text-xs font-normal text-slate-500">kg CO₂</span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-1">
            ⚡ Overriding onboarding estimate
          </span>
        </div>
      </div>

      {/* MANUAL ENTRY FALLBACK FORM */}
      {showAddForm && (
        <div className="p-6 bg-white dark:bg-slate-900 border-2 border-emerald-500/30 rounded-3xl shadow-lg space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Manual Appliance Entry</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  BEE / CEA Calibrated
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select an appliance category or fine-tune wattage and daily usage hours.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleAddAppliance} className="space-y-4">
            
            {/* Appliance Selector Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Standard Appliance Catalog <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <select
                value={selectedPresetType}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                {APPLIANCE_PRESETS.map((p) => (
                  <option key={p.type} value={p.type}>
                    {p.icon} {p.name} — {p.defaultWattage}W (~{p.monthlyCo2e} kg CO₂/mo)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Label / Model <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Daikin 1.5T Inverter AC"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Room / Placement <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                </label>
                <select
                  value={roomLocation}
                  onChange={(e) => setRoomLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="Living Room">Living Room</option>
                  <option value="Master Bedroom">Master Bedroom</option>
                  <option value="Kids Bedroom">Kids Bedroom</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Bathroom">Bathroom</option>
                  <option value="Balcony / Utility">Balcony / Utility</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Operating Wattage (W) <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="15000"
                  required
                  value={wattage}
                  onChange={(e) => handleWattageChange(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Daily Running Hours:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{dailyHours} hrs/day</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => handleHoursChange(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-2 sm:pt-0 sm:pl-3">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Calculated Monthly Emission</span>
                  <span className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-300 block">
                    {monthlyCo2e} kg CO₂e
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Save to Inventory'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* APPLIANCE INVENTORY CARDS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span>Household Inventory</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {appliances.length} items registered
            </span>
          </h3>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total Connected Load: <strong className="text-slate-900 dark:text-white font-mono">{baselineStats.totalWattage} W</strong>
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading your appliance telemetry from Firestore...
          </div>
        ) : appliances.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">No Appliances Registered Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan your household appliances using the YOLOv8 vision scanner or add them manually to generate your accurate dynamic carbon footprint.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => onNavigate && onNavigate('scan')}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Launch Vision Scanner
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl"
              >
                Add Manually
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appliances.map((app) => {
              const matchedPreset = APPLIANCE_PRESETS.find(p => p.type === app.appliance_type);
              const icon = matchedPreset?.icon || '⚡';
              const isVisionScan = app.source === 'yolov8_scan';

              return (
                <div
                  key={app.id}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
                >
                  <div>
                    {/* Top Row: Icon, Name, and Delete */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                          {icon}
                        </span>
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {app.appliance_name}
                          </h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            {app.room_location || 'Main Residence'} • {app.category || 'Household'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveAppliance(app.id, app.appliance_name)}
                        className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove from inventory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Telemetry Numbers */}
                    <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">Instant Wattage</span>
                        <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-0.5 block">
                          {app.wattage} W
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-emerald-600 dark:text-emerald-400 block">Monthly Footprint</span>
                        <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                          {app.monthly_co2e} kg
                        </span>
                      </div>
                    </div>

                    {/* Source Tag */}
                    <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                      <span className={`px-2 py-0.5 rounded-md font-semibold ${
                        isVisionScan 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {isVisionScan ? '📸 YOLOv8 Edge Vision' : '📝 Manual Verification'}
                      </span>
                      <span className="text-slate-400">
                        {app.daily_hours ? `${app.daily_hours}h daily` : ''}
                      </span>
                    </div>

                    {/* Nudge Tip */}
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-emerald-50/60 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 leading-snug">
                      💡 <strong>Eco-Tip:</strong> {app.energy_saving_nudge || 'Turn off at wall socket when idle.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TARGETED GAMIFICATION CHALLENGES TRIGGERED BY INVENTORY */}
      <div className="p-6 bg-gradient-to-br from-emerald-50/60 via-slate-50 to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Targeted Challenges Triggered by Your Inventory
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
            {applianceTypesInHome.size} appliance classes detected
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          The Mission LiFE recommendation engine synthesizes daily micro-tasks tailored to your specific hardware:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {applianceTypesInHome.has('air_conditioner') && (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block font-mono">
                ❄️ Air Conditioner Active
              </span>
              <h5 className="font-bold text-slate-900 dark:text-white mt-1">Clean AC Mesh Filters</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Rinsing filters avoids 15% compressor drag (+40 pts • 1.2 kg CO₂)</p>
            </div>
          )}

          {applianceTypesInHome.has('refrigerator') && (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 block font-mono">
                🧊 Refrigerator Active
              </span>
              <h5 className="font-bold text-slate-900 dark:text-white mt-1">Coil Clearance Check</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Maintain 2-inch rear wall gap (+35 pts • 0.9 kg CO₂)</p>
            </div>
          )}

          {applianceTypesInHome.has('washing_machine') && (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 block font-mono">
                🧺 Washing Machine Active
              </span>
              <h5 className="font-bold text-slate-900 dark:text-white mt-1">Cold-Water Eco Wash</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Shift wash to 30°C and after 10 PM (+35 pts • 0.8 kg CO₂)</p>
            </div>
          )}

          {applianceTypesInHome.has('water_heater_geyser') && (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 block font-mono">
                🚿 Geyser Active
              </span>
              <h5 className="font-bold text-slate-900 dark:text-white mt-1">15-Min Timer Shutoff</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Power off thermostat right after heating (+50 pts • 1.5 kg CO₂)</p>
            </div>
          )}

          {applianceTypesInHome.has('microwave') && (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400 block font-mono">
                ♨️ Microwave Active
              </span>
              <h5 className="font-bold text-slate-900 dark:text-white mt-1">Phantom Standby Switch</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Cut idle wall socket current (+25 pts • 0.4 kg CO₂)</p>
            </div>
          )}
        </div>
      </div>

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
