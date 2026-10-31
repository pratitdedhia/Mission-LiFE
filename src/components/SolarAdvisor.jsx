import React, { useState } from 'react';
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
import { submitSolarInquiry } from '../services/firestoreService';
import { BRANDING } from '../config/branding';

export default function SolarAdvisor({ user, onNavigateToDirectory }) {
  const [billAmount, setBillAmount] = useState(user.monthlyElectricityBill || 2100);
  const [monthlyUnits, setMonthlyUnits] = useState(user.monthlyElectricityUnits || 280);
  const [roofArea, setRoofArea] = useState(450);
  const [discom, setDiscom] = useState('UGVCL (Uttar Gujarat Vij)');
  const [roofType, setRoofType] = useState('RCC Flat Concrete');

  // Inquiry Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('380015');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(null);

  // Solar Calculations based on published MNRE & GUVNL parameters
  const maxCapacityByRoof = Math.floor((roofArea / 100) * 10) / 10;
  const capacityNeededByUnits = Math.round((monthlyUnits / 120) * 10) / 10;
  const recommendedCapacityKw = Math.max(1, Math.min(capacityNeededByUnits || 3.2, maxCapacityByRoof || 3.2));
  
  const annualGenerationKwh = Math.round(recommendedCapacityKw * 1400); // 1 kW ~ 1400 kWh/yr in Gujarat solar irradiance
  const annualSavingsRupees = Math.round(annualGenerationKwh * BRANDING.assumptions.averagePowerTariffInr);
  const co2ReductionTonnesAnnual = Math.round((annualGenerationKwh * BRANDING.assumptions.gridEmissionFactorKgPerKwh / 1000) * 10) / 10;
  const lifetime25YrCO2Tonnes = (co2ReductionTonnesAnnual * 25).toFixed(1);
  const equivalentTrees = Math.round(co2ReductionTonnesAnnual * 25 * 45);

  const benchmarkCostPerKw = 65000; // MNRE benchmark rate per kW installed
  const grossCost = Math.round(recommendedCapacityKw * benchmarkCostPerKw);
  
  // PM Surya Ghar Central Financial Assistance (CFA)
  let centralSubsidy = 0;
  if (recommendedCapacityKw >= 3) {
    centralSubsidy = BRANDING.assumptions.pmSuryaGharSubsidies.threeKwPlus;
  } else if (recommendedCapacityKw >= 2) {
    centralSubsidy = BRANDING.assumptions.pmSuryaGharSubsidies.twoKw;
  } else {
    centralSubsidy = BRANDING.assumptions.pmSuryaGharSubsidies.oneKw;
  }

  const netCost = Math.max(15000, grossCost - centralSubsidy);
  const paybackYears = (netCost / annualSavingsRupees).toFixed(1);

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await submitSolarInquiry({
      userId: user.id,
      userName: user.name,
      userCity: user.city || 'Ahmedabad',
      locality: user.locality || 'Navrangpura',
      phone,
      pincode,
      recommendedKw: recommendedCapacityKw,
      estimatedBill: billAmount,
      roofArea,
      roofType,
      discom
    });

    setIsSubmitting(false);
    if (res.success) {
      setInquirySuccess(res.referenceCode);
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
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#1f2125]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
              Actionable Resource Hub
            </span>
            <span className="text-xs font-mono text-zinc-500">PM Surya Ghar Feasibility</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1">
            Rooftop Solar Feasibility & Subsidy Advisor
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Model your clean power potential, PM Surya Ghar subsidy entitlement, payback timeline, and DISCOM net-metering.
          </p>
        </div>

        <button
          onClick={() => setShowInquiryModal(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow cursor-pointer transition-colors self-start flex items-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Request Empanelled Vendor Callback</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sliders and Parameters */}
        <div className="lg:col-span-5 card-minimal p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2125]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Household Parameters
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">Gujarat Tariff R-1</span>
          </div>

          {/* Monthly Bill */}
          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
              <span>Monthly Electricity Bill</span>
              <span className="font-mono text-emerald-400 font-bold">₹{billAmount.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="800"
              max="15000"
              step="100"
              value={billAmount}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBillAmount(val);
                setMonthlyUnits(Math.round(val / BRANDING.assumptions.averagePowerTariffInr));
              }}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5 font-mono">
              <span>₹800/mo</span>
              <span>₹15,000/mo</span>
            </div>
          </div>

          {/* Monthly Units */}
          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
              <span>Monthly Units Consumed</span>
              <span className="font-mono text-zinc-200 font-bold">{monthlyUnits} kWh</span>
            </div>
            <input
              type="range"
              min="80"
              max="1800"
              step="10"
              value={monthlyUnits}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMonthlyUnits(val);
                setBillAmount(Math.round(val * BRANDING.assumptions.averagePowerTariffInr));
              }}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5 font-mono">
              <span>80 kWh</span>
              <span>1800 kWh</span>
            </div>
          </div>

          {/* Rooftop Area */}
          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
              <span>Shadow-Free Roof Area</span>
              <span className="font-mono text-zinc-200 font-bold">{roofArea} sq.ft</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="25"
              value={roofArea}
              onChange={(e) => setRoofArea(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5 font-mono">
              <span>100 sq.ft (~1 kW)</span>
              <span>2000 sq.ft</span>
            </div>
          </div>

          {/* DISCOM Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Electricity Provider (Gujarat DISCOM)
            </label>
            <select
              value={discom}
              onChange={(e) => setDiscom(e.target.value)}
              className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
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
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Roof Surface Type
            </label>
            <select
              value={roofType}
              onChange={(e) => setRoofType(e.target.value)}
              className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
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
          <div className="card-minimal p-5 rounded-xl border-emerald-900/40 bg-gradient-to-br from-emerald-950/20 to-zinc-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                  Recommended System Capacity
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-zinc-100 font-mono">
                    {recommendedCapacityKw} kW
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">On-Grid Rooftop Array</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Estimated Annual Clean Generation</span>
                <span className="text-xl font-bold text-amber-400 font-mono">
                  ~{annualGenerationKwh.toLocaleString('en-IN')} kWh / yr
                </span>
              </div>
            </div>
          </div>

          {/* Subsidies & Financial Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card-minimal p-3.5 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Gross Benchmark Cost</span>
              <span className="text-base font-bold text-zinc-200 font-mono mt-1 block">
                ₹{grossCost.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">@ ₹65k/kW installed</span>
            </div>

            <div className="card-minimal p-3.5 rounded-xl border-emerald-900/40">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">Central CFA Subsidy</span>
              <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
                -₹{centralSubsidy.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-500/80 mt-0.5 block">PM Surya Ghar Portal</span>
            </div>

            <div className="card-minimal p-3.5 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Net Estimated Investment</span>
              <span className="text-base font-bold text-zinc-100 font-mono mt-1 block">
                ₹{netCost.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5 block">Payback: ~{paybackYears} years</span>
            </div>
          </div>

          {/* Environmental & Carbon Offset */}
          <div className="card-minimal p-4 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-2">
              Mission LiFE Lifetime Environmental Returns (25-Year Projection)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#17181c] p-2.5 rounded-lg border border-[#24262c]">
                <span className="text-zinc-500 text-[10px] block">Annual Bill Savings</span>
                <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                  ₹{annualSavingsRupees.toLocaleString('en-IN')}/yr
                </span>
              </div>
              <div className="bg-[#17181c] p-2.5 rounded-lg border border-[#24262c]">
                <span className="text-zinc-500 text-[10px] block">25-Yr CO₂ Mitigated</span>
                <span className="text-sm font-bold text-zinc-100 font-mono mt-0.5 block">
                  {lifetime25YrCO2Tonnes} tonnes
                </span>
              </div>
              <div className="bg-[#17181c] p-2.5 rounded-lg border border-[#24262c] col-span-2 sm:col-span-1">
                <span className="text-zinc-500 text-[10px] block">Tree Offset Equivalent</span>
                <span className="text-sm font-bold text-emerald-300 font-mono mt-0.5 block">
                  🌲 ~{equivalentTrees} trees
                </span>
              </div>
            </div>
          </div>

          {/* Action Callout */}
          <div className="card-minimal p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#15161a]">
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Connect with an Empanelled Installer?</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Empanelled partners conduct physical shadow audits and assist with National Portal subsidy documentation.
              </p>
            </div>
            <button
              onClick={() => setShowInquiryModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow"
            >
              <span>Request Callback</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Transparent Formula Note */}
          <div className="p-3 bg-[#141518] border border-[#22242a] rounded-xl text-[10px] font-mono text-zinc-500 leading-normal flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
            <span>Assumptions: Generation estimated at 1,400 kWh/kW/yr based on Western Regional Irradiance (CEA baseline). Central CFA subsidy based on published MNRE PM Surya Ghar rules (Feb 2024). Net-metering approval is administered directly by {discom}.</span>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#121316] border border-[#26282f] rounded-2xl p-6 shadow-2xl">
            <button 
              onClick={() => { setShowInquiryModal(false); setInquirySuccess(null); }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {inquirySuccess ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100">Inquiry Logged to Cloud</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Your rooftop feasibility request has been submitted to GEDA verified installers.
                </p>
                <div className="my-4 p-3 bg-[#17181c] rounded-lg border border-[#23252a] font-mono text-xs text-emerald-400">
                  REF: {inquirySuccess}
                </div>
                <button
                  onClick={() => { setShowInquiryModal(false); setInquirySuccess(null); }}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  Installer Connect
                </span>
                <h3 className="text-lg font-bold text-zinc-100 mt-2">
                  Request Solar Site Survey & Quote
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Get a free physical roof inspection for a {recommendedCapacityKw} kW system in {user.locality ? `${user.locality}, ` : ''}{user.city || 'Gujarat'}.
                </p>

                <form onSubmit={handleSubmitInquiry} className="space-y-3.5 mt-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Citizen Name</label>
                    <input
                      type="text"
                      disabled
                      value={user.name}
                      className="w-full bg-[#17181c] border border-[#26282e] rounded-lg px-3 py-2 text-xs text-zinc-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Mobile Contact</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      placeholder="380015"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="p-3 bg-[#17181c] rounded-lg border border-[#23252a] text-[11px] text-zinc-400 leading-normal">
                    <span className="text-emerald-400 font-semibold block mb-0.5">Includes PM Surya Ghar Subsidy Liaison:</span>
                    Installers assist with National Portal document submission and net-meter synchronization.
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow disabled:opacity-50"
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
