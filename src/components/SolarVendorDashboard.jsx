import React, { useState, useEffect } from 'react';
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
  UserCheck,
  MessageSquare,
  Send,
  Star,
  Check,
  Award,
  Building2,
  ChevronRight,
  Info,
  Layers,
  Cpu,
  CheckCircle
} from 'lucide-react';
import { INITIAL_SOLAR_INQUIRIES } from '../data/initialData';
import { 
  getStoredLeads, 
  sendVendorChatMessage, 
  EMPANELLED_VENDORS 
} from '../services/solarQuoteService';

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

export default function SolarVendorDashboard({ user = {}, activeTab = 'solar_vendor', setActiveTab }) {
  // Determine internal sub-tab based on activeTab
  const [internalView, setInternalView] = useState(() => {
    if (activeTab === 'vendor_chat') return 'chat';
    if (activeTab === 'vendor_grid') return 'grid';
    if (activeTab === 'vendor_hardware') return 'catalog';
    return 'leads';
  });

  useEffect(() => {
    if (activeTab === 'vendor_chat') setInternalView('chat');
    else if (activeTab === 'vendor_grid') setInternalView('grid');
    else if (activeTab === 'vendor_hardware') setInternalView('catalog');
    else if (activeTab === 'solar_vendor') setInternalView('leads');
  }, [activeTab]);

  const handleTabChange = (view) => {
    setInternalView(view);
    if (setActiveTab) {
      if (view === 'leads') setActiveTab('solar_vendor');
      else if (view === 'chat') setActiveTab('vendor_chat');
      else if (view === 'grid') setActiveTab('vendor_grid');
      else if (view === 'catalog') setActiveTab('vendor_hardware');
    }
  };

  // Inquiries State
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

  // Chat State
  const [leadsList, setLeadsList] = useState(() => getStoredLeads());
  const [selectedLeadId, setSelectedLeadId] = useState(() => {
    const list = getStoredLeads();
    return list.length > 0 ? list[0].id : null;
  });
  const [vendorReplyInput, setVendorReplyInput] = useState('');

  const activeLead = leadsList.find(l => l.id === selectedLeadId) || leadsList[0];
  const activeQuote = activeLead?.quotes?.[0];

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

  const handleSendVendorMessage = (customText = null) => {
    const text = customText || vendorReplyInput;
    if (!text.trim() || !activeLead || !activeQuote) return;

    sendVendorChatMessage(
      activeLead.id, 
      activeQuote.id, 
      text.trim(), 
      "vendor", 
      user.name || "Ketan Joshi (Certified Field Solar Auditor)"
    );
    setVendorReplyInput('');
    setLeadsList(getStoredLeads());
    showToast(`Message sent to ${activeLead.userName}!`);
  };

  const filteredInquiries = inquiries.filter(inq => {
    if (selectedFilter === 'all') return true;
    return inq.status === selectedFilter;
  });

  const totalKwUnderInstall = inquiries.reduce((acc, curr) => acc + (curr.recommendedKw || 0), 0).toFixed(1);
  const pendingSurveysCount = inquiries.filter(i => i.status === "Site Survey Pending").length;
  const approvedMetersCount = inquiries.filter(i => i.status === "Net-Meter Approved").length;

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-6xl mx-auto">
      
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
                Authorised Vendor ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">GEDA-EMP-SOLAR-2026-088</span> • Representative: <span className="font-semibold text-slate-700 dark:text-slate-300">{user.name || "Rajesh Shah"}</span>
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
              onClick={() => showToast("GEDA PM Surya Ghar National Portal sync active. Real-time leads connected.")}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
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

      {/* Role-Specific Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('leads')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            internalView === 'leads'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <SunMedium className="w-4 h-4" />
          <span>Installer Leads Queue ({inquiries.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('chat')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            internalView === 'chat'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Citizen Inquiries & Chat</span>
          <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
            Live Thread
          </span>
        </button>

        <button
          onClick={() => handleTabChange('grid')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            internalView === 'grid'
              ? 'bg-emerald-700 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>DISCOM Net-Metering</span>
        </button>

        <button
          onClick={() => handleTabChange('catalog')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            internalView === 'catalog'
              ? 'bg-slate-800 text-white font-bold shadow-xs dark:bg-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>ALMM Hardware Catalog</span>
        </button>
      </div>

      {/* VIEW 1: LEADS QUEUE */}
      {internalView === 'leads' && (
        <div className="space-y-5">
          {/* Leads Queue Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Rooftop Solar Citizen Inquiries</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {filteredInquiries.length} leads
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Incoming leads generated by citizens requesting GEDA empanelled partner callbacks.
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
                      ? 'bg-emerald-800 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leads List Cards */}
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
                          {inq.referenceCode || inq.id}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                          {inq.userName || inq.citizenName || "Citizen Homeowner"}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {inq.locality || inq.city || "Ahmedabad"}, Gujarat ({inq.pincode || "380015"})
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.color} whitespace-nowrap`}>
                        {cfg.badge}
                      </span>
                    </div>

                    {/* Technical Feasibility Details */}
                    <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Recommended</span>
                        <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">{inq.recommendedKw || inq.recommendedCapacityKw || 2.5} kWp</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Monthly Bill</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5">₹{inq.estimatedBill || inq.monthlyBill || 2120}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Roof Area</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{inq.roofArea || 450} sq ft</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">DISCOM</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{inq.discom || "UGVCL"}</p>
                      </div>
                    </div>

                    {/* Subsidy note */}
                    <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl text-xs flex items-center justify-between mb-3">
                      <span className="text-emerald-800 dark:text-emerald-300 font-medium">PM Surya Ghar Subsidy:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">₹{(inq.cfaSubsidyEstimated || inq.cfaSubsidy || 78000).toLocaleString()}</span>
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
                        className="py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
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
        </div>
      )}

      {/* VIEW 2: CITIZEN INQUIRIES & LIVE CHAT */}
      {internalView === 'chat' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
          {/* Left Column: Leads Thread List */}
          <div className="lg:col-span-4 border-r border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Citizen Conversations
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                {leadsList.length} Inquiries
              </span>
            </div>

            <div className="space-y-2">
              {leadsList.map((lead) => {
                const isSelected = lead.id === activeLead?.id;
                const lastMsg = lead.quotes?.[0]?.chatMessages?.slice(-1)[0];
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {lead.userName}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {lead.recommendedCapacityKw} kW
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {lead.city || "Ahmedabad"} • {lead.discom || "UGVCL"}
                    </p>
                    {lastMsg && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate mt-1.5 italic bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                        "{lastMsg.text}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Chat Thread */}
          <div className="lg:col-span-8 flex flex-col justify-between h-[550px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeLead?.userName || "Citizen"}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    {activeLead?.recommendedCapacityKw || 2.5} kW Rooftop Inquiry
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Phone: <span className="font-mono font-semibold">{activeLead?.userPhone || "+91 98765 43210"}</span> • {activeLead?.roofAreaSqFt || 450} sq.ft {activeLead?.roofType || "RCC Flat"} • Bill: ₹{activeLead?.monthlyBillInr || 2120}
                </p>
              </div>

              <button
                onClick={() => handleTabChange('leads')}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Survey</span>
              </button>
            </div>

            {/* Chat Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
              {activeQuote?.chatMessages?.map((msg, i) => {
                const isVendor = msg.sender === 'vendor';
                const isSystem = msg.sender === 'system';

                if (isSystem) {
                  return (
                    <div key={i} className="p-2.5 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div key={i} className={`flex flex-col ${isVendor ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-bold text-slate-400 mb-0.5">
                      {msg.authorName} ({isVendor ? 'You' : 'Homeowner'}) • {msg.timestamp}
                    </span>
                    <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                      isVendor 
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700 shadow-xs'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vendor Fast Response Pills */}
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto whitespace-nowrap flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-mono font-semibold pl-1">Quick Reply:</span>
              {[
                "We can schedule a free physical roof shadow audit this Saturday at 11 AM.",
                "Quote includes 100% DISCOM net-meter documentation and CEI liaison.",
                "Waaree Bi-Facial TopCon modules are ALMM Tier-1 approved with 25-yr warranty.",
                "Pre-approved SBI Surya Ghar 7% collateral-free solar loan available."
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendVendorMessage(pill)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 text-[10px] font-semibold transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer flex-shrink-0"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendVendorMessage(); }}
              className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Reply to ${activeLead?.userName || 'citizen'} as field engineer...`}
                value={vendorReplyInput}
                onChange={(e) => setVendorReplyInput(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!vendorReplyInput.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 3: DISCOM NET-METERING LIAISON */}
      {internalView === 'grid' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full font-mono">
                  Gujarat Power Grid Interface
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  DISCOM Net-Metering Synchronization Protocol
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  GEDA end-to-end liaison tracking across Gujarat state distribution utilities.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                  Avg. Sync: 12 Days
                </span>
              </div>
            </div>

            {/* 5-Step Synchronization Workflow */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {[
                { step: "01", title: "Feasibility Clearance", desc: "Online application on PM Surya Ghar portal with consumer number.", done: true },
                { step: "02", title: "Technical Sanction", desc: "DISCOM Junior Engineer inspects transformer capacity.", done: true },
                { step: "03", title: "Installation & CEI", desc: "ALMM modules & inverter installed; CEI safety test report.", done: true },
                { step: "04", title: "Bi-Directional Meter", desc: "DISCOM installs smart bi-directional net-meter at consumer premises.", done: false },
                { step: "05", title: "CFA Subsidy Release", desc: "Direct Bank Transfer (DBT) of ₹78,000 to citizen account.", done: false }
              ].map((st, i) => (
                <div 
                  key={i} 
                  className={`p-3.5 rounded-2xl border ${
                    st.done 
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">{st.step}</span>
                    {st.done ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{st.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{st.desc}</p>
                </div>
              ))}
            </div>

            {/* Active DISCOM Circles Directory */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                Designated DISCOM Sub-Division Nodal Offices
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">UGVCL (Uttar Gujarat)</span>
                  <span className="text-[11px] text-slate-500">Sabarmati, Mehsana, Gandhinagar Circle</span>
                  <span className="text-[10px] font-mono text-emerald-600 mt-1 block">Toll-Free: 19122</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">PGVCL (Paschim Gujarat)</span>
                  <span className="text-[11px] text-slate-500">Rajkot, Bhavnagar, Bhuj Circle</span>
                  <span className="text-[10px] font-mono text-emerald-600 mt-1 block">Toll-Free: 19122</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">DGVCL (Dakshin Gujarat)</span>
                  <span className="text-[11px] text-slate-500">Surat, Navsari, Valsad Circle</span>
                  <span className="text-[10px] font-mono text-emerald-600 mt-1 block">Toll-Free: 1800-233-3003</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">MGVCL (Madhya Gujarat)</span>
                  <span className="text-[11px] text-slate-500">Vadodara, Anand, Godhra Circle</span>
                  <span className="text-[10px] font-mono text-emerald-600 mt-1 block">Toll-Free: 1800-233-2670</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: ALMM HARDWARE CATALOG */}
      {internalView === 'catalog' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full font-mono">
                  MNRE ALMM & DCR Compliance
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Empanelled Solar PV Modules & Inverters Catalog
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tier-1 equipment approved for the direct ₹78,000 PM Surya Ghar Central subsidy.
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                FY 2026-27 Approved List
              </span>
            </div>

            {/* Hardware Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ALMM Listed
                  </span>
                  <span className="text-xs font-bold text-amber-500">★ 4.9 Rating</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Waaree Bi-Facial TopCon 550W
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  High-efficiency N-Type TOPCon cells with dual-glass bifacial generation (+15% rear gain).
                </p>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300">
                  <p>• Efficiency: 21.8%</p>
                  <p>• Linear Warranty: 25 Years</p>
                  <p>• DCR Certified: Yes (Full Subsidy)</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ALMM Listed
                  </span>
                  <span className="text-xs font-bold text-amber-500">★ 4.8 Rating</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Adani Solar Shine Series DCR 545W
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mono PERC 144 half-cut cells engineered for high ambient temperatures in Gujarat summers.
                </p>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300">
                  <p>• Efficiency: 21.3%</p>
                  <p>• Hail Resistance: Class 4</p>
                  <p>• DCR Certified: Yes (Full Subsidy)</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Smart Grid-Tie
                  </span>
                  <span className="text-xs font-bold text-blue-500">Mobile App Sync</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Growatt 3.3 kW Dual MPPT Inverter
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Smart transformerless on-grid inverter with integrated Wi-Fi telemetry and anti-islanding protection.
                </p>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300">
                  <p>• Max Efficiency: 98.4%</p>
                  <p>• Ingress: IP65 Outdoor</p>
                  <p>• Replacement Warranty: 5 Years</p>
                </div>
              </div>
            </div>

            {/* PM Surya Ghar Subsidy Rate Matrix */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono mb-2">
                Official PM Surya Ghar Direct Benefit Transfer (DBT) Slabs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] font-mono block">1.0 kW System</span>
                  <span className="text-lg font-bold font-mono text-emerald-600 block mt-0.5">₹30,000 CFA</span>
                  <span className="text-[10px] text-slate-500">₹30,000 / kW slab</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] font-mono block">2.0 kW System</span>
                  <span className="text-lg font-bold font-mono text-emerald-600 block mt-0.5">₹60,000 CFA</span>
                  <span className="text-[10px] text-slate-500">₹30,000 / kW slab</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] font-mono block">3.0 kW+ System</span>
                  <span className="text-lg font-bold font-mono text-emerald-600 block mt-0.5">₹78,000 CFA</span>
                  <span className="text-[10px] text-slate-500">Maximum Central cap</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey Schedule Modal */}
      {activeInquiryModal && actionType === 'survey' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Schedule Rooftop Site Survey
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Citizen: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeInquiryModal.userName || activeInquiryModal.citizenName}</span> ({activeInquiryModal.userCity || activeInquiryModal.city})
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
                  className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
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
