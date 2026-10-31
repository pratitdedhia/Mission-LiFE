import React, { useState } from 'react';
import { 
  SunMedium, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  FileText, 
  Calendar, 
  Sparkles, 
  Download, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { INITIAL_SOLAR_INQUIRIES } from '../data/initialData';

const STATUS_CONFIG = {
  "Site Survey Pending": {
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    badge: "Survey Pending"
  },
  "Survey Scheduled": {
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    badge: "Survey Scheduled"
  },
  "Quote Dispatched": {
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    badge: "Quote Sent"
  },
  "Net-Meter Approved": {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    badge: "Net-Meter Approved"
  },
  "Installation Completed": {
    color: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    badge: "Installed & Live"
  }
};

export default function SolarVendorDashboard({ user }) {
  const [inquiries, setInquiries] = useState(() => {
    try {
      const saved = localStorage.getItem('life_solar_inquiries');
      return saved ? JSON.parse(saved) : INITIAL_SOLAR_INQUIRIES;
    } catch (e) {
      return INITIAL_SOLAR_INQUIRIES;
    }
  });

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeInquiryModal, setActiveInquiryModal] = useState(null);
  const [actionType, setActionType] = useState(null); // 'survey' | 'quote'
  const [surveyDate, setSurveyDate] = useState('');
  const [surveyTime, setSurveyTime] = useState('10:00 AM');
  const [surveyEngineer, setSurveyEngineer] = useState('Ketan Joshi (Certified Field Engineer)');
  const [toastMessage, setToastMessage] = useState(null);

  const saveInquiries = (updated) => {
    setInquiries(updated);
    localStorage.setItem('life_solar_inquiries', JSON.stringify(updated));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = (inquiryId, newStatus) => {
    const updated = inquiries.map(inq => 
      inq.id === inquiryId ? { ...inq, status: newStatus, lastUpdated: new Date().toISOString() } : inq
    );
    saveInquiries(updated);
    showToast(`Lead status updated to: ${newStatus}`);
  };

  const handleScheduleSurvey = (e) => {
    e.preventDefault();
    if (!activeInquiryModal) return;
    const updated = inquiries.map(inq => 
      inq.id === activeInquiryModal.id 
        ? { 
            ...inq, 
            status: "Survey Scheduled", 
            surveySchedule: `${surveyDate} at ${surveyTime} (${surveyEngineer})`,
            lastUpdated: new Date().toISOString() 
          } 
        : inq
    );
    saveInquiries(updated);
    showToast(`Site survey booked for ${activeInquiryModal.userName} on ${surveyDate}!`);
    setActiveInquiryModal(null);
    setActionType(null);
  };

  const handleDispatchQuote = (inq) => {
    const totalCost = Math.round(inq.recommendedKw * 62000);
    const subsidy = inq.cfaSubsidyEstimated || (inq.recommendedKw <= 2 ? inq.recommendedKw * 30000 : 78000);
    const netPayable = totalCost - subsidy;

    const updated = inquiries.map(item => 
      item.id === inq.id 
        ? { 
            ...item, 
            status: "Quote Dispatched", 
            quoteDetails: { totalCost, subsidy, netPayable, date: new Date().toLocaleDateString() },
            lastUpdated: new Date().toISOString() 
          } 
        : item
    );
    saveInquiries(updated);
    showToast(`GEDA CFA subsidy quotation dispatched to ${inq.userName} via SMS/Email!`);
  };

  const filteredInquiries = inquiries.filter(inq => {
    if (selectedFilter === 'all') return true;
    return inq.status === selectedFilter;
  });

  const totalKwUnderInstall = inquiries.reduce((acc, curr) => acc + (curr.recommendedKw || 0), 0).toFixed(1);
  const pendingSurveysCount = inquiries.filter(i => i.status === "Site Survey Pending").length;
  const approvedMetersCount = inquiries.filter(i => i.status === "Net-Meter Approved").length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Empanelled Vendor Profile Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center flex-shrink-0">
              <SunMedium className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {user.companyName || "Surya Urja Solutions Gujarat"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  GEDA Empanelled Tier-1 Installer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Authorised Vendor ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">GEDA-EMP-SOLAR-2026-088</span> • Representative: <span className="font-semibold text-slate-700 dark:text-slate-300">{user.name}</span>
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user.locality || "Bodakdev"}, {user.city || "Ahmedabad"}, Gujarat
                </span>
                <span>⭐ 4.9 Rating (142 Residential Rooftops)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("GEDA PM Surya Ghar National Portal sync active. New citizen leads are polled in real-time.")}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>GEDA Portal Live Sync</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">Citizen Inquiries</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{inquiries.length}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Active Gujarat Leads</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">Pending Surveys</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{pendingSurveysCount}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Requires field visit</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">Capacity Pipeline</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{totalKwUnderInstall} <span className="text-xs font-normal">kWp</span></p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Clean solar power</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">Net-Meters Approved</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{approvedMetersCount}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">DISCOM Grid-Tied</p>
          </div>
        </div>
      </div>

      {/* Leads Queue Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Rooftop Solar Citizen Inquiries</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredInquiries.length} leads
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Leads generated directly by citizens using the LiFE+ Solar Feasibility Calculator.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Leads' },
            { id: 'Site Survey Pending', label: 'Survey Pending' },
            { id: 'Quote Dispatched', label: 'Quote Sent' },
            { id: 'Net-Meter Approved', label: 'Approved' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInquiries.map((inq) => {
          const cfg = STATUS_CONFIG[inq.status] || STATUS_CONFIG["Site Survey Pending"];
          return (
            <div 
              key={inq.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      {inq.referenceCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {inq.userName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {inq.locality}, {inq.userCity} ({inq.pincode})
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color} whitespace-nowrap`}>
                    {cfg.badge}
                  </span>
                </div>

                {/* Technical Feasibility Details */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Recommended</span>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">{inq.recommendedKw} kWp</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Monthly Bill</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5">₹{inq.estimatedBill}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Roof Area</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{inq.roofArea} sq ft</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">DISCOM</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{inq.discom}</p>
                  </div>
                </div>

                {/* Subsidy note */}
                <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl text-xs flex items-center justify-between mb-3">
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium">Est. CFA Subsidy:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">₹{inq.cfaSubsidyEstimated.toLocaleString()}</span>
                </div>

                {inq.surveySchedule && (
                  <div className="p-2.5 mb-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                    <p className="font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Survey Booked:
                    </p>
                    <p className="text-[11px] mt-0.5">{inq.surveySchedule}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveInquiryModal(inq);
                      setActionType('survey');
                      setSurveyDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Book Survey</span>
                  </button>

                  <button
                    onClick={() => handleDispatchQuote(inq)}
                    className="py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Send Quote</span>
                  </button>
                </div>

                {/* Change Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Status:</span>
                  <select
                    value={inq.status}
                    onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                    className="w-full text-xs font-medium py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="Site Survey Pending">Site Survey Pending</option>
                    <option value="Survey Scheduled">Survey Scheduled</option>
                    <option value="Quote Dispatched">Quote Dispatched</option>
                    <option value="Net-Meter Approved">Net-Meter Approved</option>
                    <option value="Installation Completed">Installation Completed</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Survey Schedule Modal */}
      {activeInquiryModal && actionType === 'survey' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Schedule Rooftop Site Survey
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Citizen: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeInquiryModal.userName}</span> ({activeInquiryModal.userCity})
            </p>

            <form onSubmit={handleScheduleSurvey} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Survey Date</label>
                <input
                  type="date"
                  required
                  value={surveyDate}
                  onChange={(e) => setSurveyDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Time Window</label>
                <select
                  value={surveyTime}
                  onChange={(e) => setSurveyTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Field Engineer</label>
                <input
                  type="text"
                  value={surveyEngineer}
                  onChange={(e) => setSurveyEngineer(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveInquiryModal(null); setActionType(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                >
                  Confirm & Notify Citizen
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
