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
  CheckCircle,
  Upload,
  Paperclip,
  FileCheck,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
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

  // Quotation Window & Presets State
  const [quoteTab, setQuoteTab] = useState('preset'); // 'preset' | 'pdf'
  const [quoteCapacityKw, setQuoteCapacityKw] = useState(3.2);
  const [quoteGrossCost, setQuoteGrossCost] = useState(198400);
  const [quoteSubsidy, setQuoteSubsidy] = useState(78000);
  const [quoteNetPayable, setQuoteNetPayable] = useState(120400);
  const [quoteAnnualKwh, setQuoteAnnualKwh] = useState(4960);
  const [quoteAnnualSavings, setQuoteAnnualSavings] = useState(32240);
  const [quotePaybackYears, setQuotePaybackYears] = useState('3.7');
  const [quotePanelBrand, setQuotePanelBrand] = useState('Waaree Bi-Facial TOPCon 550W Mono Perc (ALMM Listed)');
  const [quoteInverterBrand, setQuoteInverterBrand] = useState('Growatt 3.3 kW Smart Grid-Tied Inverter with Mobile App');
  const [quoteTimeline, setQuoteTimeline] = useState('10–14 Working Days');
  const [quoteNotes, setQuoteNotes] = useState('Includes full GEDA rooftop CFA subsidy liaisoning, DISCOM net-meter grid synchronization, and 5-year free comprehensive O&M.');
  const [quoteInclusions, setQuoteInclusions] = useState([
    '25-Year Linear Performance Warranty on Solar PV Modules',
    'GEDA & DISCOM Net-Metering Liaisoning & Bi-Directional Smart Meter',
    '5-Year Free Comprehensive Maintenance & Bi-Annual Panel Cleansing',
    'Galvanized Iron (GI) Elevated Structure with South-Facing Tilt',
    'Surge Protection Device (SPD), Dual Chemical Earthing & ACDB/DCDB'
  ]);
  const [quoteAttachedPdfName, setQuoteAttachedPdfName] = useState(null);
  const [quoteAttachedPdfSize, setQuoteAttachedPdfSize] = useState(null);
  const [quoteAttachedPdfData, setQuoteAttachedPdfData] = useState(null);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

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

    if (!surveyDate) {
      showToast("Please specify the rooftop survey date.");
      return;
    }
    if (!surveyEngineer.trim()) {
      showToast("Please assign a qualified field engineer.");
      return;
    }

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

  // Open the customized quotation modal with intelligent lead presets
  const handleOpenQuoteModal = (inq) => {
    setActiveInquiryModal(inq);
    setActionType('quote');
    const cap = parseFloat(inq.recommendedKw) || 3.2;
    setQuoteCapacityKw(cap);
    const gross = inq.grossBenchmarkCost || Math.round(cap * 62000);
    setQuoteGrossCost(gross);
    const sub = inq.cfaSubsidyEstimated || (cap <= 2 ? Math.round(cap * 30000) : 78000);
    setQuoteSubsidy(sub);
    const net = Math.max(0, gross - sub);
    setQuoteNetPayable(net);
    const kwh = Math.round(cap * 1550);
    setQuoteAnnualKwh(kwh);
    const savings = Math.round(kwh * 6.5);
    setQuoteAnnualSavings(savings);
    setQuotePaybackYears(savings > 0 ? (net / savings).toFixed(1) : '2.5');
    setQuotePanelBrand("Waaree Bi-Facial TOPCon 550W Mono Perc (ALMM Listed)");
    setQuoteInverterBrand(cap <= 3.5 ? "Growatt 3.3 kW Smart Grid-Tied Inverter with Mobile App" : "Sungrow 5 kW String Inverter with Dual MPPT");
    setQuoteTimeline("10–14 Working Days");
    setQuoteNotes(`Includes official PM Surya Ghar subsidy liaisoning for ${inq.discom || 'Gujarat DISCOM'}, dual chemical earthing, and 10-day commissioning guarantee.`);
    setQuoteAttachedPdfName(null);
    setQuoteAttachedPdfSize(null);
    setQuoteAttachedPdfData(null);
    setQuoteTab('preset');
  };

  const handleCapacityChange = (val) => {
    const kw = parseFloat(val) || 0;
    setQuoteCapacityKw(kw);
    const gross = Math.round(kw * 62000);
    setQuoteGrossCost(gross);
    const sub = kw <= 2 ? Math.round(kw * 30000) : 78000;
    setQuoteSubsidy(sub);
    const net = Math.max(0, gross - sub);
    setQuoteNetPayable(net);
    const kwh = Math.round(kw * 1550);
    setQuoteAnnualKwh(kwh);
    const savings = Math.round(kwh * 6.5);
    setQuoteAnnualSavings(savings);
    setQuotePaybackYears(savings > 0 ? (net / savings).toFixed(1) : '2.5');
  };

  const handleGrossCostChange = (val) => {
    const gross = parseInt(val) || 0;
    setQuoteGrossCost(gross);
    const net = Math.max(0, gross - quoteSubsidy);
    setQuoteNetPayable(net);
    if (quoteAnnualSavings > 0) {
      setQuotePaybackYears((net / quoteAnnualSavings).toFixed(1));
    }
  };

  const handleSubsidyChange = (val) => {
    const sub = parseInt(val) || 0;
    setQuoteSubsidy(sub);
    const net = Math.max(0, quoteGrossCost - sub);
    setQuoteNetPayable(net);
    if (quoteAnnualSavings > 0) {
      setQuotePaybackYears((net / quoteAnnualSavings).toFixed(1));
    }
  };

  const toggleInclusion = (item) => {
    setQuoteInclusions(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleQuotePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setQuoteAttachedPdfName(file.name);
      setQuoteAttachedPdfSize(`${(file.size / 1024).toFixed(1)} KB`);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuoteAttachedPdfData(reader.result);
      };
      reader.readAsDataURL(file);
      showToast(`Quotation PDF "${file.name}" attached successfully!`);
    }
  };

  const handleGenerateOfficialPdf = () => {
    const citizenName = activeInquiryModal?.userName || activeInquiryModal?.citizenName || "Citizen";
    const cleanName = citizenName.replace(/[^a-zA-Z0-9]/g, '_');
    setQuoteAttachedPdfName(`GEDA_Official_Quote_${cleanName}_${quoteCapacityKw}kW.pdf`);
    setQuoteAttachedPdfSize("482 KB (Signed & Verified)");
    setQuoteAttachedPdfData("data:application/pdf;base64,GEDA_OFFICIAL_STAMP_VERIFIED");
    showToast("Official GEDA Empanelled Quotation PDF generated and attached!");
  };

  const handleConfirmSendQuote = (e) => {
    e.preventDefault();
    if (!activeInquiryModal) return;

    // Validate genuine required fields
    if (quoteTab === 'preset') {
      if (!quoteCapacityKw || Number(quoteCapacityKw) <= 0) {
        showToast("Please enter a valid system capacity (> 0 kW).");
        return;
      }
      if (!quoteGrossCost || Number(quoteGrossCost) <= 0) {
        showToast("Please enter a valid gross benchmark cost (> ₹0).");
        return;
      }
      if (Number(quoteSubsidy) < 0) {
        showToast("Central subsidy cannot be negative.");
        return;
      }
    } else if (quoteTab === 'pdf') {
      if (!quoteAttachedPdfName) {
        showToast("Please attach a proposal PDF or click 'Auto-Generate Official GEDA Proposal PDF' before dispatching.");
        return;
      }
    }

    setIsSubmittingQuote(true);

    const quoteRecord = {
      capacityKw: quoteCapacityKw,
      panelBrand: quotePanelBrand,
      inverterBrand: quoteInverterBrand,
      grossCost: quoteGrossCost,
      subsidy: quoteSubsidy,
      netPayable: quoteNetPayable,
      annualKwh: quoteAnnualKwh,
      annualSavings: quoteAnnualSavings,
      paybackYears: quotePaybackYears,
      timeline: quoteTimeline,
      inclusions: quoteInclusions,
      notes: quoteNotes,
      attachedPdfName: quoteAttachedPdfName || null,
      attachedPdfSize: quoteAttachedPdfSize || null,
      dispatchedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      dispatchedAt: new Date().toISOString()
    };

    // 1. Update inquiries list in state and localStorage
    const updated = inquiries.map(item => 
      item.id === activeInquiryModal.id 
        ? { 
            ...item, 
            status: "Quote Dispatched", 
            quoteDetails: quoteRecord,
            lastUpdated: new Date().toISOString() 
          } 
        : item
    );
    saveInquiries(updated);

    // 2. Cross-sync with solar leads and post message into citizen chat thread
    const storedLeads = getStoredLeads();
    const targetLead = storedLeads.find(l => 
      l.id === activeInquiryModal.id || 
      l.userName?.toLowerCase() === (activeInquiryModal.userName || '').toLowerCase()
    ) || storedLeads[0];

    if (targetLead && targetLead.quotes?.length > 0) {
      const activeQuoteId = targetLead.quotes[0].id;
      const quoteSummaryMsg = `📄 GEDA EMPANELLED SOLAR QUOTATION (${quoteCapacityKw} kW System)
• Capacity: ${quoteCapacityKw} kWp On-Grid Array
• Solar PV Modules: ${quotePanelBrand}
• Smart Inverter: ${quoteInverterBrand}
• Gross Benchmark Installed Cost: ₹${quoteGrossCost.toLocaleString('en-IN')}
• Central PM Surya Ghar CFA Subsidy: -₹${quoteSubsidy.toLocaleString('en-IN')}
• Net Payable Investment: ₹${quoteNetPayable.toLocaleString('en-IN')}
• Est. Annual Generation: ~${quoteAnnualKwh.toLocaleString('en-IN')} kWh/yr
• Est. Annual Bill Savings: ₹${quoteAnnualSavings.toLocaleString('en-IN')}/yr (Payback: ~${quotePaybackYears} Years)
• Scope: Complete GEDA net-metering liaison, bi-directional smart meter & 25-yr performance warranty
• Commissioning Timeline: ${quoteTimeline}
${quoteAttachedPdfName ? `📎 Attached Document: ${quoteAttachedPdfName} (${quoteAttachedPdfSize})` : ''}
${quoteNotes ? `• Notes: "${quoteNotes}"` : ''}`;

      sendVendorChatMessage(
        targetLead.id,
        activeQuoteId,
        quoteSummaryMsg,
        "vendor",
        user.name || "Ketan Joshi (Certified Field Solar Auditor)"
      );

      // Refresh leads list in vendor dashboard state
      setLeadsList(getStoredLeads());
    }

    setIsSubmittingQuote(false);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    showToast(`Official quotation of ₹${quoteNetPayable.toLocaleString('en-IN')} dispatched to ${activeInquiryModal.userName || 'Citizen'}!`);
    setActiveInquiryModal(null);
    setActionType(null);
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
                        onClick={() => handleOpenQuoteModal(inq)}
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const matchedInq = inquiries.find(i => i.userName?.toLowerCase() === activeLead?.userName?.toLowerCase()) || {
                      id: activeLead?.id || "inq_custom",
                      userName: activeLead?.userName || "Citizen",
                      userCity: activeLead?.city || "Ahmedabad",
                      recommendedKw: activeLead?.recommendedCapacityKw || 2.5,
                      monthlyBillInr: activeLead?.monthlyBillInr || 2120,
                      discom: activeLead?.discom || "UGVCL"
                    };
                    handleOpenQuoteModal(matchedInq);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Send Quote</span>
                </button>

                <button
                  onClick={() => handleTabChange('leads')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Survey</span>
                </button>
              </div>
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
                    <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed whitespace-pre-line ${
                      isVendor 
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700 shadow-xs'
                    }`}>
                      <div>{msg.text}</div>
                      {(msg.text?.includes('.pdf') || msg.text?.includes('Attached Document:')) && (
                        <div className="mt-2.5 pt-2 border-t border-white/20 dark:border-slate-700 flex items-center justify-between gap-2 bg-emerald-950/30 p-2 rounded-xl text-emerald-200">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <FileText className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                            <span className="text-[11px] font-bold truncate">Verified Quotation PDF</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 font-mono">
                            Delivered
                          </span>
                        </div>
                      )}
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Survey Date <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={surveyDate}
                  onChange={(e) => setSurveyDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Time Window <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Field Engineer <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ketan Joshi (Field Lead)"
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

      {/* Send Official Solar Quotation Window / Modal */}
      {activeInquiryModal && actionType === 'quote' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto max-h-[92vh] overflow-y-auto transition-all">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <FileText className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Send Official Solar Quotation
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono">
                    GEDA Empanelled
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Recipient: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeInquiryModal.userName || activeInquiryModal.citizenName}</span> • {activeInquiryModal.userCity || activeInquiryModal.city || 'Gujarat'} • {activeInquiryModal.discom || 'DISCOM'} • Bill: ₹{activeInquiryModal.monthlyBillInr || 2120}/mo
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setActiveInquiryModal(null); setActionType(null); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher: Preset Fields vs PDF Attachment */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl my-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setQuoteTab('preset')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  quoteTab === 'preset'
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Preset Numbers & Specs</span>
              </button>

              <button
                type="button"
                onClick={() => setQuoteTab('pdf')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  quoteTab === 'pdf'
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach / Generate PDF Document</span>
                {quoteAttachedPdfName && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </div>

            <form onSubmit={handleConfirmSendQuote} className="space-y-4">
              
              {/* TAB 1: PRESET FIELDS & SPECS */}
              {quoteTab === 'preset' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* System Capacity & Timeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        System Capacity (kW) <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <Zap className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="50"
                          required
                          value={quoteCapacityKw}
                          onChange={(e) => handleCapacityChange(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Recommended based on shadow-free rooftop area</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Commissioning Timeline <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </label>
                      <select
                        value={quoteTimeline}
                        onChange={(e) => setQuoteTimeline(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="7–10 Working Days">7–10 Working Days (Express)</option>
                        <option value="10–14 Working Days">10–14 Working Days (Standard GEDA Track)</option>
                        <option value="15–20 Working Days">15–20 Working Days</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Includes DISCOM net-meter inspection</span>
                    </div>
                  </div>

                  {/* Hardware Specification: Panel Brand & Inverter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Solar PV Module (ALMM Approved) <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </label>
                      <select
                        value={quotePanelBrand}
                        onChange={(e) => setQuotePanelBrand(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Waaree Bi-Facial TOPCon 550W Mono Perc (ALMM Listed)">Waaree Bi-Facial TOPCon 550W Mono Perc (ALMM Listed)</option>
                        <option value="Adani Solar Shine Series DCR Mono Perc 545W">Adani Solar Shine Series DCR Mono Perc 545W</option>
                        <option value="Tata Power Solar 540W Mono Perc Modules">Tata Power Solar 540W Mono Perc Modules</option>
                        <option value="Goldi Solar 550W Heloc Plus Mono Perc">Goldi Solar 550W Heloc Plus Mono Perc</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Smart Grid-Tied Inverter <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </label>
                      <select
                        value={quoteInverterBrand}
                        onChange={(e) => setQuoteInverterBrand(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Growatt 3.3 kW Smart Grid-Tied Inverter with Mobile App">Growatt 3.3 kW Smart Grid-Tied Inverter with Mobile App</option>
                        <option value="Sungrow 5 kW String Inverter with Dual MPPT">Sungrow 5 kW String Inverter with Dual MPPT</option>
                        <option value="Polycab Solar 3 kW Grid-Tie with Dual MPPT">Polycab Solar 3 kW Grid-Tie with Dual MPPT</option>
                        <option value="Delta 3 kW High Efficiency Solar Inverter">Delta 3 kW High Efficiency Solar Inverter</option>
                      </select>
                    </div>
                  </div>

                  {/* Financials: Gross Cost, Subsidy, Net Payable */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-800/60 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-mono block">
                      Financial Calculation & Government CFA Subsidy
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Gross System Cost (₹) <span className="text-rose-500 font-bold ml-0.5">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={quoteGrossCost}
                          onChange={(e) => handleGrossCostChange(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Central CFA Subsidy (₹) <span className="text-rose-500 font-bold ml-0.5">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={quoteSubsidy}
                          onChange={(e) => handleSubsidyChange(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 focus:outline-none"
                        />
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">PM Surya Ghar Portal</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Net Customer Payable (₹)
                        </label>
                        <div className="w-full bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 rounded-xl px-3 py-2 text-xs font-extrabold text-emerald-900 dark:text-emerald-200 font-mono">
                          ₹{quoteNetPayable.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5 block">After subsidy deduction</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/80 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Est. Clean Gen:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">~{quoteAnnualKwh.toLocaleString()} kWh/yr</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Est. Bill Savings:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{quoteAnnualSavings.toLocaleString()}/yr</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Est. Payback:</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">~{quotePaybackYears} Years</span>
                      </div>
                    </div>
                  </div>

                  {/* Scope of Work Inclusions */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Included Warranties & GEDA Liaisoning <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        "25-Year Linear Performance Warranty on Solar PV Modules",
                        "GEDA & DISCOM Net-Metering Liaisoning & Bi-Directional Smart Meter",
                        "5-Year Free Comprehensive Maintenance & Bi-Annual Panel Cleansing",
                        "Galvanized Iron (GI) Elevated Structure with South-Facing Tilt",
                        "Surge Protection Device (SPD), Dual Chemical Earthing & ACDB/DCDB"
                      ].map((item, idx) => {
                        const isIncluded = quoteInclusions.includes(item);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleInclusion(item)}
                            className={`p-2 rounded-xl text-left border text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                              isIncluded
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400'
                            }`}
                          >
                            <Check className={`w-3.5 h-3.5 flex-shrink-0 ${isIncluded ? 'text-emerald-600' : 'text-slate-300'}`} />
                            <span className="truncate">{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Notes / Terms */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Installer Notes & Special Terms for Citizen <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="e.g. Includes CEI safety inspection, net-metering dispatch, and zero hidden charges guarantee."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                </div>
              )}

              {/* TAB 2: ATTACH PDF DOCUMENT */}
              {quoteTab === 'pdf' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Upload Custom File Section */}
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/40 relative hover:border-emerald-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,application/pdf,image/*"
                      onChange={handleQuotePdfUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {quoteAttachedPdfName ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <FileCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {quoteAttachedPdfName}
                          </p>
                          <p className="text-[11px] text-emerald-600 font-medium">
                            {quoteAttachedPdfSize} • Ready to Deliver
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Click to select a different PDF quotation file
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Upload Custom Solar Quotation PDF
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Drop official detailed quote document or engineering CAD layout
                          </p>
                        </div>
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono mt-1">
                          PDF, PNG, JPG (Max 15MB)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 1-Click Generate Official PDF Quote Button */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950/30 dark:to-emerald-950/30 border border-amber-200/80 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Generate Official GEDA Empanelled PDF Quote
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Prepares a verified branded PDF with GEDA license GEDA-EMP-2026-088 seal & itemized breakdown.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateOfficialPdf}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate & Attach PDF</span>
                    </button>
                  </div>

                  {quoteAttachedPdfName && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-mono font-medium truncate">{quoteAttachedPdfName}</span>
                        <span className="text-[10px] text-slate-400">({quoteAttachedPdfSize})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setQuoteAttachedPdfName(null);
                          setQuoteAttachedPdfSize(null);
                          setQuoteAttachedPdfData(null);
                        }}
                        className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-[11px] text-blue-800 dark:text-blue-300 leading-snug">
                    <span className="font-bold">Citizen Delivery:</span> The attached quotation PDF will appear directly in the citizen's Solar Advisor "Quotes & Chat" inbox with an instant download link.
                  </div>

                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                  <span>Net Payable: </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{quoteNetPayable.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px]"> ({quoteCapacityKw} kW System)</span>
                  {quoteAttachedPdfName && (
                    <span className="ml-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                      📎 PDF Attached
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => { setActiveInquiryModal(null); setActionType(null); }}
                    className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingQuote}
                    className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingQuote ? 'Dispatching...' : 'Send Quotation to Citizen'}</span>
                  </button>
                </div>
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
