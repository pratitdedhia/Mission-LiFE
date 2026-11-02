import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  Zap, 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Calculator,
  Phone,
  HelpCircle,
  X,
  ExternalLink,
  Info,
  MessageSquare,
  Send,
  Star,
  Check,
  Calendar,
  Clock,
  Sparkles,
  Award,
  Building2,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import { getSubsidyRules } from '../repositories/configRepository';
import { submitSolarLead } from '../repositories/solarRepository';
import { calculateSolarFeasibility } from '../../shared/src/calculations/solar';
import { CO2_GRID_FACTOR_KG_PER_KWH } from '../config/branding';
import { 
  getStoredLeads, 
  raiseSolarRequest, 
  sendVendorChatMessage, 
  simulateVendorReply, 
  acceptSolarQuote
} from '../services/solarQuoteService';

export default function SolarAdvisor({ user = {}, onNavigateToDirectory }) {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('calculator'); // 'calculator' | 'quotes'
  const [billAmount, setBillAmount] = useState(user.monthlyElectricityBill || 2120);
  const [roofArea, setRoofArea] = useState(450);
  const [discom, setDiscom] = useState(user.discom || 'UGVCL (Uttar Gujarat Vij)');
  const [roofType, setRoofType] = useState('RCC Flat Concrete');

  // Subsidy rules loaded dynamically from Firestore config/subsidyRules
  const [subsidyRules, setSubsidyRules] = useState(null);

  // Inquiry Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [pincode, setPincode] = useState(user.pincode || '380015');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySuccessLead, setInquirySuccessLead] = useState(null);

  // Quotes and Chat States
  const [storedLeads, setStoredLeads] = useState(() => getStoredLeads());
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [isVendorTyping, setIsVendorTyping] = useState(false);
  const chatMessagesEndRef = useRef(null);

  useEffect(() => {
    let isCurrent = true;
    getSubsidyRules().then(rules => {
      if (isCurrent) setSubsidyRules(rules);
    });
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    const leads = getStoredLeads();
    setStoredLeads(leads);
    if (leads.length > 0) {
      setSelectedLead(leads[0]);
      if (leads[0].quotes && leads[0].quotes.length > 0) {
        setSelectedQuoteId(leads[0].acceptedQuoteId || leads[0].quotes[0].id);
      }
    }
  }, []);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedLead, selectedQuoteId, isVendorTyping]);

  // Solar Calculations based on pure shared calculation engine
  const calculationResult = subsidyRules 
    ? calculateSolarFeasibility(
        {
          monthlyBillInr: billAmount,
          availableRoofAreaSqFt: roofArea,
          discomTariffPerKwh: (user.monthlyElectricityUnits && user.monthlyElectricityBill ? (user.monthlyElectricityBill / user.monthlyElectricityUnits) : 6.0)
        },
        subsidyRules,
        CO2_GRID_FACTOR_KG_PER_KWH
      )
    : {
        recommendedCapacityKw: 2.5,
        requiredRoofAreaSqFt: 250,
        hasEnoughRoofSpace: true,
        estAnnualGenerationKwh: 3900,
        grossSystemCostInr: 137500,
        pmSuryaGharSubsidyInr: (subsidyRules?.maxCentralSubsidyInr || 0),
        netPayableInr: 59500,
        estimatedAnnualSavingsInr: 25000,
        simplePaybackPeriodYears: 2.3,
        lifetime25YrSavingsInr: 630000,
        lifetimeCo2OffsetTonnes: 70.0,
        yearByYearSavings: []
      };

  const handleOpenRaiseModal = () => {
    setInquirySuccessLead(null);
    setShowInquiryModal(true);
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      alert("Please enter a valid 10-digit mobile contact number.");
      return;
    }
    if (!pincode || pincode.trim().length !== 6) {
      alert("Please enter a valid 6-digit Gujarat postal pincode.");
      return;
    }

    setIsSubmitting(true);

    const leadPayload = {
      userId: user.id || 'usr_citizen',
      userName: user.name || 'Pooja Patel',
      userPhone: phone || '+91 98765 43210',
      pincode: pincode || '380015',
      city: user.city || 'Ahmedabad',
      discom: discom.split(' ')[0] || 'UGVCL',
      recommendedCapacityKw: calculationResult.recommendedCapacityKw,
      monthlyBillInr: billAmount,
      roofAreaSqFt: roofArea,
      roofType: roofType,
      grossSystemCostInr: calculationResult.grossSystemCostInr,
      subsidyInr: calculationResult.pmSuryaGharSubsidyInr,
      netPayableInr: calculationResult.netPayableInr
    };

    // Raise solar request into quotation engine
    const quoteResult = raiseSolarRequest(leadPayload);
    // Background sync to solar leads collection
    submitSolarLead(leadPayload).catch(() => {});

    setIsSubmitting(false);

    if (quoteResult.success) {
      setInquirySuccessLead(quoteResult.lead);
      setStoredLeads(getStoredLeads());
      setSelectedLead(quoteResult.lead);
      if (quoteResult.lead.quotes?.length > 0) {
        setSelectedQuoteId(quoteResult.lead.quotes[0].id);
      }

      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || chatInput;
    if (!text.trim() || !selectedLead || !selectedQuoteId) return;

    sendVendorChatMessage(selectedLead.id, selectedQuoteId, text.trim(), "citizen", user.name || "Citizen");
    setChatInput('');
    
    // Refresh leads
    const updatedLeads = getStoredLeads();
    setStoredLeads(updatedLeads);
    const updatedLead = updatedLeads.find(l => l.id === selectedLead.id);
    if (updatedLead) setSelectedLead(updatedLead);

    // Simulate vendor reply
    setIsVendorTyping(true);
    setTimeout(() => {
      simulateVendorReply(selectedLead.id, selectedQuoteId, text.trim());
      setIsVendorTyping(false);
      const postReplyLeads = getStoredLeads();
      setStoredLeads(postReplyLeads);
      const postReplyLead = postReplyLeads.find(l => l.id === selectedLead.id);
      if (postReplyLead) setSelectedLead(postReplyLead);
    }, 900);
  };

  const handleAcceptQuote = (quoteId) => {
    if (!selectedLead) return;
    const res = acceptSolarQuote(selectedLead.id, quoteId);
    if (res.success) {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      const updatedLeads = getStoredLeads();
      setStoredLeads(updatedLeads);
      const updatedLead = updatedLeads.find(l => l.id === selectedLead.id);
      if (updatedLead) setSelectedLead(updatedLead);
    }
  };

  const currentQuote = selectedLead?.quotes?.find(q => q.id === selectedQuoteId) || selectedLead?.quotes?.[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full">
              {t('solar.badge', 'PM Surya Ghar: Muft Bijli Yojana')}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              GEDA Feasibility Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            Rooftop Solar & PM Surya Ghar Advisor
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Grounded in official MNRE benchmark rates and GEDA net-metering regulations.
          </p>
        </div>

        <button
          onClick={handleOpenRaiseModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-colors self-start flex items-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Request Empanelled Vendor Callback</span>
        </button>
      </div>

      {/* Primary Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'calculator'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Feasibility & Subsidy Calculator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('quotes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'quotes'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Solar Quotations & Vendor Chat</span>
          {storedLeads.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700">
              {storedLeads[0].quotes?.length || 3} Quotes Available
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: FEASIBILITY & SUBSIDY CALCULATOR */}
      {activeSubTab === 'calculator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Sliders and Parameters */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('solar.parameters', 'Household Parameters')}
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">Gujarat RGP Slab</span>
              </div>

              {/* Monthly Bill */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Average Monthly Bill (₹)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">₹{billAmount.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="15000"
                  step="100"
                  value={billAmount}
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                  <span>Min: ₹{Number(800).toLocaleString('en-IN')}/mo</span>
                  <span>Max: ₹{Number(15000).toLocaleString('en-IN')}/mo</span>
                </div>
              </div>

              {/* Rooftop Area */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Available Shadow-Free Roof Area (sq. ft.)</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{roofArea} sq.ft</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="25"
                  value={roofArea}
                  onChange={(e) => setRoofArea(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                  <span>100 sq.ft (~1 kW)</span>
                  <span>2000 sq.ft</span>
                </div>
              </div>

              {/* DISCOM Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Electricity Provider (Gujarat DISCOM)
                </label>
                <select
                  value={discom}
                  onChange={(e) => setDiscom(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                >
                  <option value="UGVCL (Uttar Gujarat Vij)">UGVCL (Uttar Gujarat Vij)</option>
                  <option value="DGVCL (Dakshin Gujarat Vij)">DGVCL (Dakshin Gujarat Vij)</option>
                  <option value="MGVCL (Madhya Gujarat Vij)">MGVCL (Madhya Gujarat Vij)</option>
                  <option value="PGVCL (Paschim Gujarat Vij)">PGVCL (Paschim Gujarat Vij)</option>
                  <option value="Torrent Power (Ahmedabad/Gandhinagar/Surat)">Torrent Power (Ahmedabad/Gandhinagar/Surat)</option>
                </select>
              </div>

              {/* Roof Construction */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Roof Surface Type
                </label>
                <select
                  value={roofType}
                  onChange={(e) => setRoofType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                >
                  <option value="RCC Flat Concrete">RCC Flat Concrete (Optimal for south orientation)</option>
                  <option value="Tin / Metal Shed">Tin / Metal Industrial Shed</option>
                  <option value="Sloped Tile Roof">Sloped Tile Roof</option>
                </select>
              </div>
            </div>

            {/* Recommended System Card */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full font-mono">
                      Recommended System Capacity
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
                      {calculationResult.recommendedCapacityKw} kW <span className="text-xs font-normal text-slate-500">On-Grid Rooftop Array</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Estimated Annual Clean Generation</span>
                    <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200">
                      ~{calculationResult.estAnnualGenerationKwh.toLocaleString('en-IN')} kWh / yr
                    </span>
                  </div>
                </div>

                {/* Financial Math Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Gross Benchmark Cost</span>
                    <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-1 block">
                      ₹{calculationResult.grossSystemCostInr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-400">@ benchmark installed rate</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block font-mono">Central CFA Subsidy</span>
                    <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1 block">
                      -₹{calculationResult.pmSuryaGharSubsidyInr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">PM Surya Ghar Portal</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Net Estimated Investment</span>
                    <span className="text-xl font-bold font-mono text-slate-950 dark:text-white mt-1 block">
                      ₹{calculationResult.netPayableInr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">Payback: ~{calculationResult.simplePaybackPeriodYears} years</span>
                  </div>
                </div>

                {/* 25-Year Lifecycle Returns */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-blue-500/10 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono">
                      Mission LiFE Lifetime Environmental Returns (25-Year Projection)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Annual Bill Savings</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                        ₹{calculationResult.estimatedAnnualSavingsInr.toLocaleString('en-IN')}/yr
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">25-Yr CO₂ Mitigated</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {calculationResult.lifetimeCo2OffsetTonnes} tonnes
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Tree Offset Equivalent</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        🌲 ~{Math.round(calculationResult.lifetimeCo2OffsetTonnes * 45)} trees
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Callout Button */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Connect with an Empanelled Installer?</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Empanelled partners conduct physical shadow audits and assist with National Portal subsidy documentation.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenRaiseModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                  >
                    <span>Request Callback</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MY SOLAR QUOTATIONS & VENDOR CHAT */}
      {activeSubTab === 'quotes' && (
        <div className="space-y-6">
          
          {storedLeads.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl">
                ☀️
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Active Solar Quotation Request</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                  You haven't requested any installer callback yet. Run the rooftop feasibility calculator and click "Request Empanelled Vendor Callback" to receive competitive quotes and chat live with installers.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('calculator')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                <span>Go to Rooftop Calculator</span>
              </button>
            </div>
          ) : (
            /* Active Quotations & Chat Interface */
            <div className="space-y-5">
              
              {/* Active Lead Summary Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Active {selectedLead?.recommendedCapacityKw || 2.5} kW Rooftop Solar Request
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-700">
                        {selectedLead?.status || "Quotes Received"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      {selectedLead?.roofAreaSqFt || 450} sq.ft {selectedLead?.roofType || 'RCC Flat'} • {selectedLead?.discom || 'UGVCL'} • Monthly Bill: ₹{selectedLead?.monthlyBillInr?.toLocaleString() || '2,120'}
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3 self-end md:self-auto">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Net Payable</span>
                    <span className="text-base font-black font-mono text-emerald-700 dark:text-emerald-300">
                      ₹{selectedLead?.netPayableInr?.toLocaleString('en-IN') || '59,500'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Split Layout: Quotes List & Live Vendor Chat Window */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left (5 cols): Empanelled Installer Quotes */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Empanelled Vendor Quotes ({selectedLead?.quotes?.length || 3})</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">GEDA Empanelled</span>
                  </div>

                  <div className="space-y-3">
                    {selectedLead?.quotes?.map((quote) => {
                      const isSelected = quote.id === selectedQuoteId;
                      const isAccepted = quote.status === 'accepted';
                      return (
                        <div
                          key={quote.id}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-400 dark:border-blue-700 shadow-sm ring-1 ring-blue-400/20' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                          onClick={() => setSelectedQuoteId(quote.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{quote.vendorName}</h4>
                                {isAccepted && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 font-mono">
                                    Accepted
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <span>{quote.vendorGrade}</span>
                                <span>•</span>
                                <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  <span>{quote.vendorRating}</span>
                                </span>
                              </p>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400 block">
                                ₹{quote.netPayableInr?.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[9px] text-slate-400 line-through">
                                ₹{quote.grossCostInr?.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                            <p>🔹 <strong>Modules:</strong> {quote.panelBrand}</p>
                            <p>🔹 <strong>Inverter:</strong> {quote.inverterBrand}</p>
                            <p>🔹 <strong>Warranty:</strong> {quote.warranty}</p>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedQuoteId(quote.id); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                                isSelected 
                                  ? 'bg-blue-600 text-white shadow-xs' 
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>{isSelected ? 'Active Chat' : 'Chat with Vendor'}</span>
                            </button>

                            {!isAccepted && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAcceptQuote(quote.id); }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Accept & Book Survey</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right (7 cols): Active Live Chat Window with Vendor */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col h-[580px] overflow-hidden">
                  
                  {/* Chat Header */}
                  <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        ⚡
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {currentQuote?.vendorName || "Surya Urja Solutions Gujarat"}
                          </h4>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Field Engineer: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentQuote?.engineer || "Ketan Joshi"}</span> • {currentQuote?.phone}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptQuote(currentQuote?.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <Check className="w-3 h-3" />
                      <span>Book Survey</span>
                    </button>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20">
                    {currentQuote?.chatMessages?.map((msg) => {
                      const isCitizen = msg.sender === 'citizen';
                      const isSystem = msg.sender === 'system';

                      if (isSystem) {
                        return (
                          <div key={msg.id} className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                            {msg.text}
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col ${isCitizen ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-mono">
                            {isCitizen ? `${user.name || 'You'} (Citizen)` : msg.authorName} • {msg.timestamp}
                          </span>
                          <div className={`p-3 rounded-2xl max-w-sm sm:max-w-md text-xs leading-relaxed shadow-2xs whitespace-pre-line ${
                            isCitizen 
                              ? 'bg-blue-600 text-white rounded-tr-xs' 
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-xs'
                          }`}>
                            <div>{msg.text}</div>
                            {(msg.text?.includes('.pdf') || msg.text?.includes('Attached Document:')) && (
                              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 bg-emerald-50/80 dark:bg-emerald-950/40 p-2 rounded-xl text-emerald-800 dark:text-emerald-200">
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                  <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                  <span className="text-[11px] font-bold truncate">Official Quotation PDF</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => alert("Downloading verified GEDA solar quotation document...")}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {isVendorTyping && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 italic py-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span>{currentQuote?.engineer || 'Vendor engineer'} is typing reply...</span>
                      </div>
                    )}
                    <div ref={chatMessagesEndRef} />
                  </div>

                  {/* Quick Inquiries Chips */}
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto whitespace-nowrap flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono font-semibold pl-1">Ask:</span>
                    {[
                      "Can you visit for a physical roof shadow audit this Saturday?",
                      "Does this quote include UGVCL net-meter documentation?",
                      "What are the bank EMI / financing options available?",
                      "Are these panels ALMM Tier-1 approved?"
                    ].map((pill, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(pill)}
                        className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 text-[10px] font-semibold transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer flex-shrink-0"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input Bar */}
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                    className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder={`Message ${currentQuote?.vendorName || 'installer'}...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: REQUEST SOLAR SITE SURVEY & VENDOR CALLBACK */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl">
            <button 
              onClick={() => { setShowInquiryModal(false); setInquirySuccessLead(null); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {inquirySuccessLead ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Solar Request Logged Successfully!</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Your rooftop feasibility request for a <strong>{inquirySuccessLead.recommendedCapacityKw} kW</strong> system has been dispatched to 3 GEDA empanelled installers.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                  REF: {inquirySuccessLead.id} • 3 Quotes Received
                </div>

                <button
                  onClick={() => { 
                    setShowInquiryModal(false); 
                    setInquirySuccessLead(null); 
                    setActiveSubTab('quotes'); 
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>View Empanelled Quotes & Start Vendor Chat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                  Installer Connect
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  Request Solar Site Survey & Quotes
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Receive 3 competitive quotes from GEDA certified installers for a {calculationResult.recommendedCapacityKw} kW system in {user.locality ? `${user.locality}, ` : ''}{user.city || 'Gujarat'}.
                </p>

                <form onSubmit={handleSubmitInquiry} className="space-y-3.5 mt-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Citizen Name</label>
                    <input
                      type="text"
                      disabled
                      value={user.name || 'Gujarat Citizen'}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Mobile Contact Number <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Pincode <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="380015"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold block mb-0.5">Includes PM Surya Ghar Subsidy Liaison:</span>
                    Installers assist with National Portal document submission and GEDA net-meter synchronization.
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Raising Request & Generating Quotes...' : 'Submit Request & Receive Quotes'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
