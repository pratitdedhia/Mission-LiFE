import React, { useState, useEffect } from 'react';
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
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import { getSubsidyRules } from '../repositories/configRepository';
import { submitSolarLead } from '../repositories/solarRepository';
import { calculateSolarFeasibility } from '../../shared/src/calculations/solar';

export default function SolarAdvisor({ user = {}, onNavigateToDirectory }) {
  const { t } = useTranslation();
  const [billAmount, setBillAmount] = useState(user.monthlyElectricityBill || 2100);
  const [roofArea, setRoofArea] = useState(450);
  const [discom, setDiscom] = useState(user.discom || 'UGVCL (Uttar Gujarat Vij)');
  const [roofType, setRoofType] = useState('RCC Flat Concrete');

  // Subsidy rules loaded dynamically from Firestore config/subsidyRules
  const [subsidyRules, setSubsidyRules] = useState(null);

  // Inquiry Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [phone, setPhone] = useState(user.phone || '');
  const [pincode, setPincode] = useState(user.pincode || '380015');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    getSubsidyRules().then(rules => {
      if (isCurrent) setSubsidyRules(rules);
    });
    return () => { isCurrent = false; };
  }, []);

  // Solar Calculations based on pure shared calculation engine
  const calculationResult = subsidyRules 
    ? calculateSolarFeasibility(
        {
          monthlyBillInr: billAmount,
          availableRoofAreaSqFt: roofArea,
          discomTariffPerKwh: 6.50
        },
        subsidyRules
      )
    : {
        recommendedCapacityKw: 3.0,
        requiredRoofAreaSqFt: 300,
        hasEnoughRoofSpace: true,
        estAnnualGenerationKwh: 4200,
        grossSystemCostInr: 195000,
        pmSuryaGharSubsidyInr: 78000,
        netPayableInr: 117000,
        estimatedAnnualSavingsInr: 27300,
        simplePaybackPeriodYears: 4.3,
        lifetime25YrSavingsInr: 682500,
        lifetimeCo2OffsetTonnes: 77.3,
        yearByYearSavings: []
      };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const leadPayload = {
      userId: user.id || 'usr_anonymous',
      userName: user.name || 'Gujarat Citizen',
      userPhone: phone,
      districtId: (user.city || 'Ahmedabad').toLowerCase(),
      pincode,
      monthlyBillInr: billAmount,
      availableRoofAreaSqFt: roofArea,
      roofType: roofType.toLowerCase().includes('metal') ? 'metal_shed' : roofType.toLowerCase().includes('tile') ? 'tile' : 'concrete_flat',
      discom: discom.split(' ')[0] || 'UGVCL',
      recommendedCapacityKw: calculationResult.recommendedCapacityKw,
      estimatedSubsidyInr: calculationResult.pmSuryaGharSubsidyInr,
      netPayableInr: calculationResult.netPayableInr
    };

    const res = await submitSolarLead(leadPayload);
    setIsSubmitting(false);

    if (res.success) {
      setInquirySuccess(res.leadId);
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
            {t('solar.title', 'Rooftop Solar Feasibility & Subsidy Advisor')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t('solar.subtitle', 'Compute your solar generation capacity, PM Surya Ghar central financial assistance, net payback timeline, and GERC net-metering.')}
          </p>
        </div>

        <button
          onClick={() => setShowInquiryModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-colors self-start flex items-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{t('solar.requestCallback', 'Request Empanelled Vendor Callback')}</span>
        </button>
      </div>

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
              <span>{t('solar.monthlyBill', 'Monthly Electricity Bill')}</span>
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
              <span>₹800/mo</span>
              <span>₹15,000/mo</span>
            </div>
          </div>

          {/* Rooftop Area */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>{t('solar.roofArea', 'Shadow-Free Roof Area')}</span>
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
              {t('solar.discom', 'Electricity Provider (Gujarat DISCOM)')}
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
              {t('solar.roofType', 'Roof Surface Type')}
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

        {/* Calculation Projections & Financial Model */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Sizing Metric Banner */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  {t('solar.recommendedCapacity', 'Recommended System Capacity')}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {calculationResult.recommendedCapacityKw} kW
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">On-Grid Rooftop Array</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                  {t('solar.annualGen', 'Estimated Annual Clean Generation')}
                </span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                  ~{calculationResult.estAnnualGenerationKwh.toLocaleString('en-IN')} kWh / yr
                </span>
              </div>
            </div>
          </div>

          {/* Subsidies & Financial Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Gross Benchmark Cost</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono mt-1 block">
                ₹{calculationResult.grossSystemCostInr.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">@ benchmark installed rate</span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 p-4 rounded-xl shadow-xs">
              <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">Central CFA Subsidy</span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-1 block">
                -₹{calculationResult.pmSuryaGharSubsidyInr.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-500/80 mt-0.5 block">PM Surya Ghar Portal</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Net Estimated Investment</span>
              <span className="text-base font-bold text-slate-900 dark:text-white font-mono mt-1 block">
                ₹{calculationResult.netPayableInr.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Payback: ~{calculationResult.simplePaybackPeriodYears} years</span>
            </div>
          </div>

          {/* Environmental & Carbon Offset */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-2">
              Mission LiFE Lifetime Environmental Returns (25-Year Projection)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Annual Bill Savings</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                  ₹{calculationResult.estimatedAnnualSavingsInr.toLocaleString('en-IN')}/yr
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">25-Yr CO₂ Mitigated</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5 block">
                  {calculationResult.lifetimeCo2OffsetTonnes} tonnes
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60 col-span-2 sm:col-span-1">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Tree Offset Equivalent</span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-0.5 block">
                  🌲 ~{Math.round(calculationResult.lifetimeCo2OffsetTonnes * 45)} trees
                </span>
              </div>
            </div>
          </div>

          {/* Action Callout */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Connect with an Empanelled Installer?</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Empanelled partners conduct physical shadow audits and assist with National Portal subsidy documentation.
              </p>
            </div>
            <button
              onClick={() => setShowInquiryModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
            >
              <span>{t('solar.requestCallback', 'Request Callback')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Transparent Formula Note */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-normal flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>Assumptions: Generation estimated at 1,400 kWh/kW/yr based on Western Regional Irradiance (CEA baseline). Central CFA subsidy based on published MNRE PM Surya Ghar rules (Feb 2024). Net-metering approval is administered directly by {discom}.</span>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
            <button 
              onClick={() => { setShowInquiryModal(false); setInquirySuccess(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {inquirySuccess ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inquiry Logged to Cloud</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Your rooftop feasibility request has been submitted to GEDA verified installers.
                </p>
                <div className="my-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                  REF: {inquirySuccess}
                </div>
                <button
                  onClick={() => { setShowInquiryModal(false); setInquirySuccess(null); }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                  Installer Connect
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  Request Solar Site Survey & Quote
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Get a free physical roof inspection for a {calculationResult.recommendedCapacityKw} kW system in {user.locality ? `${user.locality}, ` : ''}{user.city || 'Gujarat'}.
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
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Mobile Contact</label>
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
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Pincode</label>
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
                    Installers assist with National Portal document submission and net-meter synchronization.
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Recording to Firestore...' : 'Submit Inquiry'}</span>
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