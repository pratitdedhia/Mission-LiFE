/**
 * Solar Quotation & Two-Way Vendor Chat Service
 * Mission LiFE Citizen Engagement Platform
 */

const LEADS_STORAGE_KEY = 'life_solar_leads';
const INQUIRIES_STORAGE_KEY = 'life_solar_inquiries';

export const EMPANELLED_VENDORS = [
  {
    id: "v_surya_urja",
    name: "Surya Urja Solutions Gujarat",
    grade: "GEDA Empanelled A-Grade",
    rating: 4.9,
    reviewsCount: 312,
    city: "Ahmedabad / Gandhinagar",
    phone: "+91 79 2658 4400",
    engineer: "Ketan Joshi (Certified Field Solar Auditor)",
    panelBrand: "Waaree Bi-Facial TopCon 550W Mono Perc (ALMM Listed)",
    inverterBrand: "Growatt 3.3 kW Smart Grid-Tied Inverter with Mobile App",
    warranty: "25 Years Module Performance • 5 Years Inverter Replacement",
    omSupport: "5 Years Comprehensive Free O&M + Annual Cleansing",
    expressNetMeteringDays: 12
  },
  {
    id: "v_adani_solar",
    name: "Adani Solar Power Hub",
    grade: "Tier-1 Empanelled Partner",
    rating: 4.8,
    reviewsCount: 245,
    city: "Gujarat Statewide",
    phone: "+91 79 2555 7788",
    engineer: "Bhavin Patel (Chief Technical Officer)",
    panelBrand: "Adani Solar Shine Series DCR Mono Perc 545W",
    inverterBrand: "Polycab Solar 3 kW Grid-Tie with Dual MPPT",
    warranty: "25 Years Module • 7 Years Inverter Extended Warranty",
    omSupport: "3 Years Free Preventive Maintenance",
    expressNetMeteringDays: 14
  },
  {
    id: "v_sunedison",
    name: "SunEdison Gujarat CleanTech",
    grade: "Empanelled Installer",
    rating: 4.7,
    reviewsCount: 189,
    city: "Surat & Vadodara Region",
    phone: "+91 261 245 9911",
    engineer: "Rajesh Trivedi (Senior Solar Consultant)",
    panelBrand: "Tata Power Solar 540W Mono Perc Modules",
    inverterBrand: "Delta 3 kW High Efficiency Solar Inverter",
    warranty: "25 Years Panel Performance • 5 Years Equipment Warranty",
    omSupport: "2 Years Complimentary Health-Check Inspections",
    expressNetMeteringDays: 15
  }
];

function getInitialSeedLead() {
  const leadId = "lead_geda_demo_01";
  return {
    id: leadId,
    userId: "usr_citizen",
    userName: "Pooja Patel",
    userPhone: "+91 98765 43210",
    pincode: "380015",
    city: "Ahmedabad",
    discom: "UGVCL",
    recommendedCapacityKw: 2.5,
    monthlyBillInr: 2120,
    roofAreaSqFt: 450,
    roofType: "RCC Flat Concrete",
    grossCostInr: 137500,
    subsidyInr: 78000,
    netPayableInr: 59500,
    status: "Quotes Received (3 Empanelled Installers)",
    createdAt: new Date().toISOString(),
    quotes: [
      {
        id: `quote_${leadId}_1`,
        vendorId: EMPANELLED_VENDORS[0].id,
        vendorName: EMPANELLED_VENDORS[0].name,
        vendorGrade: EMPANELLED_VENDORS[0].grade,
        vendorRating: EMPANELLED_VENDORS[0].rating,
        phone: EMPANELLED_VENDORS[0].phone,
        engineer: EMPANELLED_VENDORS[0].engineer,
        capacityKw: 2.5,
        panelBrand: EMPANELLED_VENDORS[0].panelBrand,
        inverterBrand: EMPANELLED_VENDORS[0].inverterBrand,
        grossCostInr: 135000,
        subsidyInr: 78000,
        netPayableInr: 57000,
        warranty: EMPANELLED_VENDORS[0].warranty,
        omSupport: EMPANELLED_VENDORS[0].omSupport,
        netMeteringDays: EMPANELLED_VENDORS[0].expressNetMeteringDays,
        status: "active",
        chatMessages: [
          {
            id: `msg_1_seed`,
            sender: "vendor",
            authorName: EMPANELLED_VENDORS[0].engineer,
            text: "Namaste Pooja! I have reviewed your 2.5 kW rooftop feasibility estimate for 450 sq.ft (UGVCL). We have prepared an A-Grade empanelled quote using Waaree Bi-Facial TopCon modules with full PM Surya Ghar National Portal subsidy liaison included. Feel free to ask any question or book a free physical roof shadow audit!",
            timestamp: "10 mins ago"
          }
        ]
      },
      {
        id: `quote_${leadId}_2`,
        vendorId: EMPANELLED_VENDORS[1].id,
        vendorName: EMPANELLED_VENDORS[1].name,
        vendorGrade: EMPANELLED_VENDORS[1].grade,
        vendorRating: EMPANELLED_VENDORS[1].rating,
        phone: EMPANELLED_VENDORS[1].phone,
        engineer: EMPANELLED_VENDORS[1].engineer,
        capacityKw: 2.5,
        panelBrand: EMPANELLED_VENDORS[1].panelBrand,
        inverterBrand: EMPANELLED_VENDORS[1].inverterBrand,
        grossCostInr: 138000,
        subsidyInr: 78000,
        netPayableInr: 60000,
        warranty: EMPANELLED_VENDORS[1].warranty,
        omSupport: EMPANELLED_VENDORS[1].omSupport,
        netMeteringDays: EMPANELLED_VENDORS[1].expressNetMeteringDays,
        status: "active",
        chatMessages: [
          {
            id: `msg_2_seed`,
            sender: "vendor",
            authorName: EMPANELLED_VENDORS[1].engineer,
            text: "Hello Pooja! Adani Solar Power Hub is pleased to quote for your 2.5 kW system. We offer zero-cost financing options and guarantee GEDA bi-directional net-meter synchronization within 14 working days. Let us know when our team can inspect your rooftop!",
            timestamp: "25 mins ago"
          }
        ]
      },
      {
        id: `quote_${leadId}_3`,
        vendorId: EMPANELLED_VENDORS[2].id,
        vendorName: EMPANELLED_VENDORS[2].name,
        vendorGrade: EMPANELLED_VENDORS[2].grade,
        vendorRating: EMPANELLED_VENDORS[2].rating,
        phone: EMPANELLED_VENDORS[2].phone,
        engineer: EMPANELLED_VENDORS[2].engineer,
        capacityKw: 2.5,
        panelBrand: EMPANELLED_VENDORS[2].panelBrand,
        inverterBrand: EMPANELLED_VENDORS[2].inverterBrand,
        grossCostInr: 132000,
        subsidyInr: 78000,
        netPayableInr: 54000,
        warranty: EMPANELLED_VENDORS[2].warranty,
        omSupport: EMPANELLED_VENDORS[2].omSupport,
        netMeteringDays: EMPANELLED_VENDORS[2].expressNetMeteringDays,
        status: "active",
        chatMessages: [
          {
            id: `msg_3_seed`,
            sender: "vendor",
            authorName: EMPANELLED_VENDORS[2].engineer,
            text: "Greetings from SunEdison! We have computed your net payable at ₹54,000 after ₹78,000 Central subsidy deduction. Our local engineer can conduct a compass & shading survey at your convenience.",
            timestamp: "1 hour ago"
          }
        ]
      }
    ],
    acceptedQuoteId: null
  };
}

export function getStoredLeads() {
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse stored solar leads:", e);
  }
  const defaultLead = getInitialSeedLead();
  saveStoredLeads([defaultLead]);
  return [defaultLead];
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
  recommendedCapacityKw,
  monthlyBillInr,
  roofAreaSqFt,
  roofType,
  grossSystemCostInr,
  subsidyInr,
  netPayableInr
}) {
  const currentLeads = getStoredLeads();
  const leadId = `lead_${Date.now()}`;
  const capacity = Number(recommendedCapacityKw) || 2.5;
  const kwCost = Math.round((grossSystemCostInr || 137500) / capacity);

  // Generate 3 competitive vendor quotes tailored to the citizen's system size
  const generatedQuotes = [
    {
      id: `quote_${leadId}_1`,
      vendorId: EMPANELLED_VENDORS[0].id,
      vendorName: EMPANELLED_VENDORS[0].name,
      vendorGrade: EMPANELLED_VENDORS[0].grade,
      vendorRating: EMPANELLED_VENDORS[0].rating,
      phone: EMPANELLED_VENDORS[0].phone,
      engineer: EMPANELLED_VENDORS[0].engineer,
      capacityKw: capacity,
      panelBrand: EMPANELLED_VENDORS[0].panelBrand,
      inverterBrand: EMPANELLED_VENDORS[0].inverterBrand,
      grossCostInr: Math.round(capacity * 54000),
      subsidyInr: subsidyInr || 78000,
      netPayableInr: Math.max(15000, Math.round(capacity * 54000) - (subsidyInr || 78000)),
      warranty: EMPANELLED_VENDORS[0].warranty,
      omSupport: EMPANELLED_VENDORS[0].omSupport,
      netMeteringDays: EMPANELLED_VENDORS[0].expressNetMeteringDays,
      status: "active",
      chatMessages: [
        {
          id: `msg_1_${Date.now()}`,
          sender: "vendor",
          authorName: EMPANELLED_VENDORS[0].engineer,
          text: `Namaste ${userName || 'Citizen'}! I have reviewed your ${capacity} kW rooftop feasibility estimate for ${roofAreaSqFt || 400} sq.ft (${discom || 'UGVCL'}). We have prepared an A-Grade empanelled quote using Waaree Bi-Facial TopCon modules with full PM Surya Ghar National Portal subsidy liaison included. Feel free to ask any question or book a free physical roof shadow audit!`,
          timestamp: "Just now"
        }
      ]
    },
    {
      id: `quote_${leadId}_2`,
      vendorId: EMPANELLED_VENDORS[1].id,
      vendorName: EMPANELLED_VENDORS[1].name,
      vendorGrade: EMPANELLED_VENDORS[1].grade,
      vendorRating: EMPANELLED_VENDORS[1].rating,
      phone: EMPANELLED_VENDORS[1].phone,
      engineer: EMPANELLED_VENDORS[1].engineer,
      capacityKw: capacity,
      panelBrand: EMPANELLED_VENDORS[1].panelBrand,
      inverterBrand: EMPANELLED_VENDORS[1].inverterBrand,
      grossCostInr: Math.round(capacity * 55200),
      subsidyInr: subsidyInr || 78000,
      netPayableInr: Math.max(16000, Math.round(capacity * 55200) - (subsidyInr || 78000)),
      warranty: EMPANELLED_VENDORS[1].warranty,
      omSupport: EMPANELLED_VENDORS[1].omSupport,
      netMeteringDays: EMPANELLED_VENDORS[1].expressNetMeteringDays,
      status: "active",
      chatMessages: [
        {
          id: `msg_2_${Date.now()}`,
          sender: "vendor",
          authorName: EMPANELLED_VENDORS[1].engineer,
          text: `Hello ${userName || 'Citizen'}! Adani Solar Power Hub is pleased to quote for your ${capacity} kW system. We offer zero-cost financing options and guarantee GEDA bi-directional net-meter synchronization within 14 working days. Let us know when our team can inspect your rooftop!`,
          timestamp: "Just now"
        }
      ]
    },
    {
      id: `quote_${leadId}_3`,
      vendorId: EMPANELLED_VENDORS[2].id,
      vendorName: EMPANELLED_VENDORS[2].name,
      vendorGrade: EMPANELLED_VENDORS[2].grade,
      vendorRating: EMPANELLED_VENDORS[2].rating,
      phone: EMPANELLED_VENDORS[2].phone,
      engineer: EMPANELLED_VENDORS[2].engineer,
      capacityKw: capacity,
      panelBrand: EMPANELLED_VENDORS[2].panelBrand,
      inverterBrand: EMPANELLED_VENDORS[2].inverterBrand,
      grossCostInr: Math.round(capacity * 52800),
      subsidyInr: subsidyInr || 78000,
      netPayableInr: Math.max(14000, Math.round(capacity * 52800) - (subsidyInr || 78000)),
      warranty: EMPANELLED_VENDORS[2].warranty,
      omSupport: EMPANELLED_VENDORS[2].omSupport,
      netMeteringDays: EMPANELLED_VENDORS[2].expressNetMeteringDays,
      status: "active",
      chatMessages: [
        {
          id: `msg_3_${Date.now()}`,
          sender: "vendor",
          authorName: EMPANELLED_VENDORS[2].engineer,
          text: `Greetings from SunEdison! We have computed your net payable at ₹${Math.max(14000, Math.round(capacity * 52800) - (subsidyInr || 78000)).toLocaleString('en-IN')} after ₹78,000 Central subsidy deduction. Our local engineer can conduct a compass & shading survey at your convenience.`,
          timestamp: "Just now"
        }
      ]
    }
  ];

  const newLead = {
    id: leadId,
    userId: userId || 'usr_guest',
    userName: userName || 'Gujarat Citizen',
    userPhone: userPhone || '+91 98765 43210',
    pincode: pincode || '380015',
    city: city || 'Ahmedabad',
    discom: discom || 'UGVCL',
    recommendedCapacityKw: capacity,
    monthlyBillInr: monthlyBillInr || 2120,
    roofAreaSqFt: roofAreaSqFt || 450,
    roofType: roofType || 'RCC Flat Concrete',
    grossCostInr: grossSystemCostInr || Math.round(capacity * 55000),
    subsidyInr: subsidyInr || 78000,
    netPayableInr: netPayableInr || 59500,
    status: "Quotes Received (3 Empanelled Installers)",
    createdAt: new Date().toISOString(),
    quotes: generatedQuotes,
    acceptedQuoteId: null
  };

  currentLeads.unshift(newLead);
  saveStoredLeads(currentLeads);

  // Also sync to vendor incoming inquiries so the installer dashboard reflects this lead
  try {
    const rawInq = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    const inqList = rawInq ? JSON.parse(rawInq) : [];
    inqList.unshift({
      id: `inq_${Date.now()}`,
      citizenName: userName || "Residential Citizen",
      phone: userPhone || "+91 98765 43210",
      pincode: pincode || "380015",
      city: city || "Ahmedabad",
      district: city || "Ahmedabad",
      recommendedCapacityKw: capacity,
      monthlyBill: monthlyBillInr || 2120,
      roofArea: roofAreaSqFt || 450,
      roofType: roofType || "RCC Flat Concrete",
      discom: discom || "UGVCL",
      status: "Site Survey Pending",
      leadSource: "Mission LiFE GEDA Portal",
      createdAt: new Date().toISOString(),
      surveyDate: null,
      surveyTime: null,
      assignedEngineer: "Ketan Joshi (Certified Field Engineer)",
      formalQuote: {
        capacityKw: capacity,
        grossAmount: Math.round(capacity * 55000),
        cfaSubsidy: subsidyInr || 78000,
        netPayable: netPayableInr || 59500,
        paybackYears: 2.8,
        panelBrand: "Waaree Bi-Facial TopCon 550W",
        inverterBrand: "Growatt 3 kW Grid-Tied"
      }
    });
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inqList));
  } catch (e) {
    console.warn("Could not sync to vendor inquiries:", e);
  }

  return { success: true, lead: newLead };
}

export function sendVendorChatMessage(leadId, quoteId, text, sender = "citizen", authorName = "Citizen") {
  const leads = getStoredLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return { success: false, error: "Lead not found" };

  const quote = lead.quotes.find(q => q.id === quoteId);
  if (!quote) return { success: false, error: "Quote not found" };

  const newMsg = {
    id: `msg_${Date.now()}`,
    sender,
    authorName,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  if (!quote.chatMessages) quote.chatMessages = [];
  quote.chatMessages.push(newMsg);
  saveStoredLeads(leads);

  return { success: true, message: newMsg };
}

export function simulateVendorReply(leadId, quoteId, citizenQuery = "") {
  const leads = getStoredLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return null;

  const quote = lead.quotes.find(q => q.id === quoteId);
  if (!quote) return null;

  let replyText = `Thanks for reaching out! Our field engineer can definitely assist you with this. We will ensure seamless net-meter registration with ${lead.discom || 'UGVCL'}.`;
  const qLower = citizenQuery.toLowerCase();

  if (qLower.includes("saturday") || qLower.includes("visit") || qLower.includes("survey") || qLower.includes("when")) {
    replyText = `Yes, absolutely! We can schedule a free physical shadow-audit visit for your roof this Saturday between 10:30 AM and 1:00 PM. Our engineer will carry the 3D solar azimuth compass and inspect your main electrical distribution board.`;
  } else if (qLower.includes("net-meter") || qLower.includes("meter") || qLower.includes("discom") || qLower.includes("ugvcl")) {
    replyText = `Yes! All GEDA and DISCOM paperwork is handled end-to-end by us. We upload your test report on the PM Surya Ghar National Portal and coordinate with the DISCOM sub-division for the bi-directional solar meter installation.`;
  } else if (qLower.includes("emi") || qLower.includes("loan") || qLower.includes("finance") || qLower.includes("bank")) {
    replyText = `We have pre-approved collateral-free solar loans via State Bank of India (SBI Surya Ghar loan scheme) and Bank of Baroda at 7.0% annual interest with zero processing fees. Your monthly EMI will be approximately ₹1,250, which is lower than your monthly electricity bill savings!`;
  } else if (qLower.includes("panel") || qLower.includes("brand") || qLower.includes("almm") || qLower.includes("mono")) {
    replyText = `We exclusively use ALMM Tier-1 DCR (Domestic Content Requirement) certified modules (${quote.panelBrand}) with a 25-year linear performance warranty. These modules qualify 100% for the direct ₹78,000 DBT subsidy into your bank account.`;
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

export function acceptSolarQuote(leadId, quoteId) {
  const leads = getStoredLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return { success: false };

  lead.acceptedQuoteId = quoteId;
  lead.status = "Physical Roof Survey Scheduled";

  const quote = lead.quotes.find(q => q.id === quoteId);
  if (quote) {
    quote.status = "accepted";
    quote.chatMessages.push({
      id: `msg_sys_${Date.now()}`,
      sender: "system",
      authorName: "GEDA Portal System",
      text: `🎉 Citizen accepted the quote! Free physical rooftop shadow audit has been booked with ${quote.vendorName}. Field engineer will call before arrival.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  saveStoredLeads(leads);
  return { success: true, lead, acceptedQuote: quote };
}
