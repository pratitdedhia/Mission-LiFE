/**
 * Solar Quotation & Two-Way Vendor Chat Service
 * Mission LiFE Citizen Engagement Platform
 */

import { getCatalog, getCachedCatalog } from './catalogService';

const LEADS_STORAGE_KEY = 'life_solar_leads';

export async function getEmpanelledVendors() {
  const res = await getCatalog('vendors');
  return res.data || [];
}

export function getDefaultLead() {
  const vendors = getCachedCatalog('vendors') || [];
  const primaryVendor = vendors[0] || {
    id: "v_surya_urja",
    name: "Surya Urja Solutions Gujarat",
    grade: "GEDA Empanelled A-Grade",
    rating: 4.9,
    engineer: "Field Solar Auditor",
    panelBrand: "Tier-1 ALMM TopCon",
    inverterBrand: "Smart Grid-Tied Inverter",
    warranty: "25 Years Performance",
    omSupport: "5 Years Free O&M",
    expressNetMeteringDays: 12
  };

  const demoCapacity = 2.5;
  const demoGross = Math.round(demoCapacity * 55000);
  const demoSubsidy = Math.round(demoCapacity * 31200);
  const demoNet = demoGross - demoSubsidy;

  return {
    id: "lead_geda_demo_01",
    userId: "usr_citizen_pooja",
    userName: "Pooja Patel",
    userPhone: "+91 98765 43210",
    pincode: "380015",
    city: "Ahmedabad",
    district: "Ahmedabad",
    discom: "UGVCL",
    recommendedCapacityKw: demoCapacity,
    recommendedKw: demoCapacity,
    monthlyBillInr: 2120,
    roofAreaSqFt: 450,
    roofType: "RCC Flat Concrete",
    grossCostInr: demoGross,
    subsidyInr: demoSubsidy,
    netPayableInr: demoNet,
    status: "Quotes Received",
    createdAt: "2026-10-01T00:00:00Z",
    quotes: [
      {
        id: "quote_demo_1",
        vendorId: primaryVendor.id,
        vendorName: primaryVendor.name,
        vendorGrade: primaryVendor.grade,
        vendorRating: primaryVendor.rating,
        engineer: primaryVendor.engineer,
        capacityKw: demoCapacity,
        panelBrand: primaryVendor.panelBrand,
        inverterBrand: primaryVendor.inverterBrand,
        grossCostInr: demoGross,
        subsidyInr: demoSubsidy,
        netPayableInr: demoNet,
        warranty: primaryVendor.warranty,
        omSupport: primaryVendor.omSupport,
        netMeteringDays: primaryVendor.expressNetMeteringDays || 14,
        status: "active",
        chatMessages: [
          {
            id: "msg_init",
            sender: "vendor",
            authorName: primaryVendor.engineer,
            text: "Feasibility estimate generated for 2.5 kW rooftop solar with PM Surya Ghar subsidy liaison included.",
            timestamp: "Today"
          }
        ]
      }
    ]
  };
}

export function getStoredLeads() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LEADS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored solar leads:", e);
  }
  const fallback = getDefaultLead();
  return fallback ? [fallback] : [];
}

export function saveStoredLeads(leads) {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch (e) {
    console.error("Failed to save solar leads:", e);
  }
}

/**
 * Submits a new solar lead from citizen calculator and generates competitive vendor quotes
 */
export function raiseSolarRequest({
  userId,
  userName,
  userPhone,
  pincode,
  city,
  discom,
  capacityKw,
  monthlyBillInr,
  roofAreaSqFt,
  roofType,
  grossCostInr,
  subsidyInr,
  netPayableInr,
  vendorsList = []
}) {
  const leadId = `lead_${Date.now()}`;
  const leads = getStoredLeads();
  const capacity = Number(capacityKw) || 2.5;

  const vendors = vendorsList.length > 0 ? vendorsList : (getCachedCatalog('vendors') || []);
  const activeVendors = vendors.slice(0, 3);

  const quotes = activeVendors.map((vendor, idx) => {
    const costMultiplier = [1.0, 1.02, 0.98][idx] || 1.0;
    const vendorGross = Math.round((grossCostInr || (capacity * 50000)) * costMultiplier);
    const vendorSubsidy = subsidyInr || 0;
    const vendorNet = Math.max(10000, vendorGross - vendorSubsidy);

    return {
      id: `quote_${leadId}_${idx + 1}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorGrade: vendor.grade || 'GEDA Certified',
      vendorRating: vendor.rating || 4.8,
      phone: vendor.phone,
      engineer: vendor.engineer || 'Technical Lead',
      capacityKw: capacity,
      panelBrand: vendor.panelBrand || 'Tier-1 Mono Perc',
      inverterBrand: vendor.inverterBrand || 'Smart Grid-Tie Inverter',
      grossCostInr: vendorGross,
      subsidyInr: vendorSubsidy,
      netPayableInr: vendorNet,
      warranty: vendor.warranty || '25 Years Module',
      omSupport: vendor.omSupport || '3 Years Free Maintenance',
      netMeteringDays: vendor.expressNetMeteringDays || 14,
      status: "active",
      chatMessages: [
        {
          id: `msg_${idx + 1}_${Date.now()}`,
          sender: "vendor",
          authorName: vendor.engineer || vendor.name,
          text: `Namaste ${userName || 'Citizen'}! We have reviewed your ${capacity} kW rooftop feasibility estimate for ${roofAreaSqFt || 400} sq.ft (${discom || 'DISCOM'}). We have prepared a quote with full PM Surya Ghar National Portal subsidy liaison included. Feel free to ask any question or book a free physical roof shadow audit!`,
          timestamp: "Just now"
        }
      ]
    };
  });

  const newLead = {
    id: leadId,
    userId: userId || 'usr_guest',
    userName: userName || 'Gujarat Citizen',
    userPhone: userPhone || '',
    pincode: pincode || '',
    city: city || 'Ahmedabad',
    discom: discom || 'UGVCL',
    recommendedCapacityKw: capacity,
    monthlyBillInr: monthlyBillInr || 0,
    roofAreaSqFt: roofAreaSqFt || 400,
    roofType: roofType || 'Flat Concrete',
    grossCostInr: grossCostInr || Math.round(capacity * 50000),
    subsidyInr: subsidyInr || 0,
    netPayableInr: netPayableInr || Math.max(10000, (grossCostInr || (capacity * 50000)) - (subsidyInr || 0)),
    status: `Quotes Received (${quotes.length} Empanelled Installers)`,
    createdAt: new Date().toISOString(),
    quotes,
    acceptedQuoteId: null
  };

  leads.unshift(newLead);
  saveStoredLeads(leads);
  return newLead;
}

export function acceptVendorQuote(leadId, quoteId) {
  const leads = getStoredLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return null;

  lead.acceptedQuoteId = quoteId;
  const quote = lead.quotes.find(q => q.id === quoteId);
  if (quote) {
    quote.status = "accepted";
    lead.status = `Accepted Quote (${quote.vendorName})`;
    quote.chatMessages.push({
      id: `msg_accepted_${Date.now()}`,
      sender: "system",
      authorName: "Mission LiFE System",
      text: `Proposal accepted! ${quote.vendorName} field team has been notified to initiate site survey and net-metering application documentation.`,
      timestamp: "Just now"
    });
  }

  saveStoredLeads(leads);
  return lead;
}

export function sendCitizenMessage(leadId, quoteId, text) {
  if (!text || !text.trim()) return null;
  const leads = getStoredLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return null;

  const quote = lead.quotes.find(q => q.id === quoteId);
  if (!quote) return null;

  const citizenMsg = {
    id: `msg_citizen_${Date.now()}`,
    sender: "citizen",
    authorName: lead.userName || "You",
    text: text.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  quote.chatMessages.push(citizenMsg);
  saveStoredLeads(leads);
  return citizenMsg;
}

export function simulateVendorReply(leadId, quoteId, citizenQuery = "") {
  const leads = getStoredLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return null;

  const quote = lead.quotes.find(q => q.id === quoteId);
  if (!quote) return null;

  let replyText = `Thanks for reaching out! Our field engineer can definitely assist you with this. We will ensure seamless net-meter registration with ${lead.discom || 'DISCOM'}.`;
  const qLower = citizenQuery.toLowerCase();

  if (qLower.includes("saturday") || qLower.includes("visit") || qLower.includes("survey") || qLower.includes("when")) {
    replyText = `Yes, absolutely! We can schedule a free physical shadow-audit visit for your roof this Saturday between 10:30 AM and 1:00 PM. Our engineer will carry the 3D solar azimuth compass and inspect your main electrical distribution board.`;
  } else if (qLower.includes("net-meter") || qLower.includes("meter") || qLower.includes("discom") || qLower.includes("ugvcl")) {
    replyText = `Yes! All GEDA and DISCOM paperwork is handled end-to-end by us. We upload your test report on the PM Surya Ghar National Portal and coordinate with the DISCOM sub-division for the bi-directional solar meter installation.`;
  } else if (qLower.includes("emi") || qLower.includes("loan") || qLower.includes("finance") || qLower.includes("bank")) {
    replyText = `We have pre-approved collateral-free solar loans via State Bank of India (SBI Surya Ghar loan scheme) and Bank of Baroda at low annual interest with zero processing fees. Your monthly EMI is typically lower than your monthly electricity bill savings!`;
  } else if (qLower.includes("panel") || qLower.includes("brand") || qLower.includes("almm") || qLower.includes("mono")) {
    replyText = `We exclusively use ALMM Tier-1 DCR (Domestic Content Requirement) certified modules (${quote.panelBrand}) with a 25-year linear performance warranty. These modules qualify 100% for the direct Central DBT subsidy into your bank account.`;
  }

  const vendorMsg = {
    id: `msg_vendor_${Date.now()}`,
    sender: "vendor",
    authorName: quote.engineer || quote.vendorName,
    text: replyText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  quote.chatMessages.push(vendorMsg);
  saveStoredLeads(leads);

  return vendorMsg;
}

export const sendVendorChatMessage = (leadId, quoteId, text) => sendCitizenMessage(leadId, quoteId, text);
export const acceptSolarQuote = (leadId, quoteId) => acceptVendorQuote(leadId, quoteId);

