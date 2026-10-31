import React, { useState } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import { DISTRICT_ADMIN_STATS } from '../data/initialData';

export default function AdminDashboard({ community }) {
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const filteredStats = DISTRICT_ADMIN_STATS.filter(d => 
    selectedDistrict === 'all' || d.id === selectedDistrict
  );

  const totalSolarKw = DISTRICT_ADMIN_STATS.reduce((acc, d) => acc + d.solarKw, 0);
  const totalTonnes = DISTRICT_ADMIN_STATS.reduce((acc, d) => acc + d.co2SavedTonnes, 0);

  const handleExportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "District,Participating Households,Rooftop Solar (kW),CO2 Mitigated (Tonnes),Grid Compliance Rate\n" +
      DISTRICT_ADMIN_STATS.map(d => `${d.name},${d.households},${d.solarKw},${d.co2SavedTonnes},${d.complianceRate}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GEDA_Mission_LiFE_State_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#1f2125]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold bg-amber-950/50 border border-amber-800/50 px-2 py-0.5 rounded">
              State Administrator View
            </span>
            <span className="text-xs font-mono text-zinc-500">GEDA Conservation Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1">
            Regional Conservation & Grid Monitoring
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Aggregated policy metrics tracking residential demand-side management and rooftop solar adoption across Gujarat.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow cursor-pointer transition-colors self-start"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export State CSV Report</span>
        </button>
      </div>

      {/* Top Level Macro KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="card-minimal p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[10px] font-mono uppercase">Statewide Energy Saved</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            {community.energySavedGWh} <span className="text-xs font-normal text-zinc-500">GWh</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
            +14.2% vs previous quarter
          </span>
        </div>

        <div className="card-minimal p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[10px] font-mono uppercase">CO₂ Mitigated</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {totalTonnes.toFixed(1)} <span className="text-xs font-normal text-zinc-500">k Tonnes</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Under Mission LiFE campaign
          </span>
        </div>

        <div className="card-minimal p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[10px] font-mono uppercase">Rooftop Solar Active</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            {(totalSolarKw / 1000).toFixed(1)} <span className="text-xs font-normal text-zinc-500">MW</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            PM Surya Ghar installations
          </span>
        </div>

        <div className="card-minimal p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[10px] font-mono uppercase">Active Citizens</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            {community.citizensCount.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            33 Districts participating
          </span>
        </div>
      </div>

      {/* District-wise Conservation Table */}
      <div className="card-minimal rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1f2125] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Gujarat District Performance Benchmarks</h3>
            <p className="text-[11px] text-zinc-400">Demand side management compliance and rooftop solar penetration</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] text-zinc-500 font-mono">Filter:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-[#18191d] border border-[#2a2c33] rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Districts</option>
              {DISTRICT_ADMIN_STATS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#16171b] border-b border-[#22242a] text-[10px] font-mono uppercase text-zinc-400">
              <tr>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Registered Homes</th>
                <th className="py-3 px-4">Rooftop Solar (kW)</th>
                <th className="py-3 px-4">CO₂ Avoided</th>
                <th className="py-3 px-4">ToD Off-Peak Adherence</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2125] text-zinc-300">
              {filteredStats.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-zinc-100 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{item.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">{item.households.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-mono text-amber-300">{item.solarKw.toLocaleString('en-IN')} kW</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">{item.co2SavedTonnes} tonnes</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: item.complianceRate }}
                        />
                      </div>
                      <span className="font-mono text-[11px]">{item.complianceRate}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                      <ShieldCheck className="w-3 h-3" />
                      <span>On Track</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid Peak Load Strategy Notice */}
      <div className="card-minimal p-5 rounded-xl border-amber-900/30 bg-amber-950/10">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              Automated Grid Nudge System Active
            </h4>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Gujarat DISCOM smart grid protocol automatically pushes behavioral alerts to residential app users between 18:00 and 22:00 to curtail residential peak demand by an estimated 180 MW during high thermal load periods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
