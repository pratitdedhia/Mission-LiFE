export const LIFE_THEMES = [
  { id: 'all', name: 'All Themes', icon: 'Sparkles', color: 'emerald' },
  { id: 'energy', name: 'Save Energy', icon: 'Zap', color: 'amber' },
  { id: 'water', name: 'Save Water', icon: 'Droplets', color: 'cyan' },
  { id: 'plastic', name: 'Reduce Single-Use Plastic', icon: 'ShoppingBag', color: 'rose' },
  { id: 'food', name: 'Sustainable Food Habits', icon: 'Apple', color: 'emerald' },
  { id: 'waste', name: 'Waste Reduction & Segregation', icon: 'Recycle', color: 'teal' },
  { id: 'lifestyle', name: 'Healthy & Green Lifestyle', icon: 'Bike', color: 'indigo' },
  { id: 'ewaste', name: 'E-Waste Management', icon: 'Cpu', color: 'purple' }
];

export const INITIAL_USER = {
  id: "citizen_daksh_01",
  name: "Daksh Sharma",
  email: "daksh.sharma@example.com",
  city: "Ahmedabad",
  district: "Ahmedabad",
  state: "Gujarat",
  householdSize: 4,
  monthlyElectricityUnits: 280,
  monthlyElectricityBill: 2120,
  acUsageHours: 6,
  vehicleType: "petrol_car", // petrol_car, diesel_car, ev, two_wheeler, public_transit
  dailyTravelKm: 18,
  lpgCylindersYear: 10,
  waterHabits: "moderate", // mindful, moderate, high
  wasteSegregation: "partial", // strict, partial, none
  dietHabits: "vegetarian", // vegan, vegetarian, omnivore
  lifeScore: 780,
  scoreTodayDelta: 50,
  streak: 7,
  level: 3,
  levelTitle: "Prakriti Mitra",
  monthlyFootprintKg: 428,
  footprintDeltaPercent: -12.4,
  pledgeSigned: true,
  pledgeDate: "2026-10-15",
  certificateId: "GEDA-LIFE-2026-AHM-8821",
  breakdown: {
    energy: 228,
    transport: 114,
    cooking: 38,
    water: 24,
    waste: 24
  },
  completedMissions: ["light_saver", "ac_warrior", "cloth_bag"],
  badges: ["prakriti_mitra", "energy_saver", "solar_enthusiast"],
  joinedDate: "2026-09-01"
};

export const INITIAL_COMMUNITY = {
  citizensCount: 24890,
  actionsCompleted: 184520,
  energySavedGWh: 2.45,
  co2SavedKg: 142850,
  co2TargetKg: 200000,
  waterSavedLitres: "3.8M",
  plasticAvoidedKg: 18920,
  activeCampaign: "Gujarat Mission LiFE: 200,000 kg CO₂ Avoided Sprint",
  participatingDistricts: 33,
  verifiedInstallations: 342
};

export const GRID_HOURS = {
  peakHours: [18, 19, 20, 21, 22], // 6 PM - 10 PM IST
  offPeakHours: [23, 0, 1, 2, 3, 4, 5, 6], // 11 PM - 6 AM IST
  standardHours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  currentPeakRate: "₹9.20 / unit",
  currentOffPeakRate: "₹5.40 / unit",
  discomName: "Gujarat Urja Vikas Nigam (GUVNL / UGVCL / Torrent)"
};

export const BADGES_CATALOG = [
  { id: "prakriti_mitra", name: "Prakriti Mitra", icon: "🌱", description: "Completed onboarding & took the Mission LiFE pledge.", tier: "Bronze" },
  { id: "energy_saver", name: "Urja Rakshak", icon: "⚡", description: "Completed 5 energy conservation micro-tasks.", tier: "Silver" },
  { id: "jal_rakshak", name: "Jal Samrakshak", icon: "💧", description: "Saved over 500 liters of domestic water.", tier: "Silver" },
  { id: "zero_waste", name: "Zero Waste Hero", icon: "♻️", description: "Logged 7 days of 100% kitchen waste segregation.", tier: "Gold" },
  { id: "solar_enthusiast", name: "Solar Champion", icon: "☀️", description: "Ran a rooftop solar feasibility assessment.", tier: "Gold" },
  { id: "life_ambassador", name: "LiFE Ambassador", icon: "🏆", description: "Achieved 1,000+ LiFE score with consistent streak.", tier: "Platinum" }
];

export const INITIAL_LEADERBOARD = {
  districts: [
    { rank: 1, name: "Ahmedabad District", points: 89420, citizens: 6420, co2AvoidedKg: 42100, badge: "🥇 Top Green District" },
    { rank: 2, name: "Surat District", points: 76810, citizens: 5190, co2AvoidedKg: 36400, badge: "🥈 Solar Capital" },
    { rank: 3, name: "Gandhinagar District", points: 64120, citizens: 4120, co2AvoidedKg: 28900, badge: "🥉 Clean Governance" },
    { rank: 4, name: "Vadodara District", points: 53200, citizens: 3840, co2AvoidedKg: 21800, badge: "🌿 Circular Hub" },
    { rank: 5, name: "Rajkot District", points: 41950, citizens: 2980, co2AvoidedKg: 17200, badge: "⚡ Efficiency Squad" },
    { rank: 6, name: "Bhavnagar District", points: 31200, citizens: 2100, co2AvoidedKg: 12500, badge: "🌊 Coastal Guardians" }
  ],
  campuses: [
    { rank: 1, name: "IIT Gandhinagar Green Club", points: 24890, members: 420, badge: "🏆 Net-Zero Campus" },
    { rank: 2, name: "NMIMS Mumbai & Shirpur Squad", points: 19430, members: 310, badge: "⚡ Youth Innovators" },
    { rank: 3, name: "PDEU Solar Energy Society", points: 17620, members: 280, badge: "☀️ Solar Pioneers" },
    { rank: 4, name: "LD College of Engineering Eco Cell", points: 14210, members: 240, badge: "🌱 Active Habit" },
    { rank: 5, name: "MSU Baroda Sustainability Wing", points: 11840, members: 195, badge: "🌿 Zero Waste" }
  ],
  citizens: [
    { rank: 1, name: "Pooja Patel", city: "Ahmedabad", points: 1420, streak: 21, badge: "🏆 LiFE Ambassador" },
    { rank: 2, name: "Daksh Sharma (You)", city: "Ahmedabad", points: 780, streak: 7, badge: "🌱 Prakriti Mitra" },
    { rank: 3, name: "Ananya Desai", city: "Surat", points: 740, streak: 12, badge: "⚡ Urja Rakshak" },
    { rank: 4, name: "Krunal Mehta", city: "Gandhinagar", points: 690, streak: 9, badge: "☀️ Solar Champion" },
    { rank: 5, name: "Dr. Ritu Verma", city: "Vadodara", points: 610, streak: 8, badge: "💧 Jal Samrakshak" }
  ]
};

export const INITIAL_MISSIONS = [
  {
    id: "ac_warrior",
    title: "AC Eco-Set 26°C",
    theme: "energy",
    category: "energy",
    icon: "Zap",
    points: 50,
    co2Kg: 0.85,
    difficulty: "Easy",
    isPromoted: true,
    description: "Set air conditioner thermostat to 26°C or above. Each degree higher saves 6% electricity and eases grid load.",
    hint: "Keep ceiling fan on low speed for optimal circulation.",
    requiresProof: false
  },
  {
    id: "light_saver",
    title: "Vampire Power Cutoff",
    theme: "energy",
    category: "energy",
    icon: "Lightbulb",
    points: 25,
    co2Kg: 0.25,
    difficulty: "Easy",
    isPromoted: false,
    description: "Switch off wall power sockets for TV, microwave, and chargers when not in use.",
    hint: "Standby power accounts for 5-10% of residential electricity bills.",
    requiresProof: false
  },
  {
    id: "peak_shifter",
    title: "Shift Heavy Load to Off-Peak",
    theme: "energy",
    category: "energy",
    icon: "Zap",
    points: 60,
    co2Kg: 1.10,
    difficulty: "Medium",
    isPromoted: true,
    description: "Run washing machines, dishwashers, and EV charging after 10 PM or before 9 AM during green off-peak hours.",
    hint: "Reduces strain on Gujarat grid and cuts emissions from dirty thermal peaker plants.",
    requiresProof: true
  },
  {
    id: "water_guardian",
    title: "Bucket Bath & Aerator Check",
    theme: "water",
    category: "water",
    icon: "Droplets",
    points: 30,
    co2Kg: 0.35,
    difficulty: "Easy",
    isPromoted: false,
    description: "Use a bucket instead of shower, or inspect kitchen taps for water-saving aerator installation.",
    hint: "Saves ~45 litres of water and power used for pumping.",
    requiresProof: false
  },
  {
    id: "cloth_bag",
    title: "Zero Single-Use Plastic Bag",
    theme: "plastic",
    category: "plastic",
    icon: "ShoppingBag",
    points: 35,
    co2Kg: 0.40,
    difficulty: "Easy",
    isPromoted: false,
    description: "Carry reusable cloth tote bags for grocery/vegetable shopping; refuse plastic polythene bags.",
    hint: "Every cloth bag prevents microplastic accumulation and oil-based polymer waste.",
    requiresProof: true
  },
  {
    id: "short_trip",
    title: "Active Green Commute (< 3 km)",
    theme: "lifestyle",
    category: "transport",
    icon: "Bike",
    points: 70,
    co2Kg: 1.20,
    difficulty: "Medium",
    isPromoted: false,
    description: "Walk, cycle, or take Metro/BRTS for a commute trip under 3 km instead of a personal petrol/diesel car.",
    hint: "Zero tailpipe emissions and promotes cardiovascular health.",
    requiresProof: true
  },
  {
    id: "waste_segregation",
    title: "Source Waste Segregation",
    theme: "waste",
    category: "waste",
    icon: "Recycle",
    points: 40,
    co2Kg: 0.60,
    difficulty: "Easy",
    isPromoted: false,
    description: "Keep separate bins for wet kitchen compostables, dry recyclable plastics/paper, and hazardous waste.",
    hint: "Facilitates municipal composting and prevents methane generation in landfills.",
    requiresProof: true
  },
  {
    id: "plant_meal",
    title: "Plant-Forward Earth Plate",
    theme: "food",
    category: "food",
    icon: "Apple",
    points: 45,
    co2Kg: 0.75,
    difficulty: "Easy",
    isPromoted: false,
    description: "Eat a zero-food-waste, locally sourced seasonal plant meal with millets (Bajra/Jowar).",
    hint: "Millets consume 70% less water than rice and possess high climate resilience.",
    requiresProof: false
  },
  {
    id: "ewaste_drop",
    title: "E-Waste Recycling Drop",
    theme: "ewaste",
    category: "ewaste",
    icon: "Cpu",
    points: 80,
    co2Kg: 1.80,
    difficulty: "Medium",
    isPromoted: false,
    description: "Deposit discarded cables, old mobile chargers, or dead electronics at an authorized GEDA collection hub.",
    hint: "Recovers critical rare earth metals and prevents heavy metal ground pollution.",
    requiresProof: true
  },
  {
    id: "solar_explorer",
    title: "Rooftop Solar Assessment",
    theme: "energy",
    category: "solar",
    icon: "Sun",
    points: 100,
    co2Kg: 2.50,
    difficulty: "Special",
    isPromoted: true,
    description: "Run the Rooftop Solar Feasibility Tool to estimate your capacity, PM Surya Ghar subsidy, and bill savings.",
    hint: "PM Surya Ghar provides up to ₹78,000 CFA for systems up to 3 kW.",
    requiresProof: false
  }
];

export const INITIAL_FEED_POSTS = [
  {
    id: "post_1",
    authorName: "Kavita Shah",
    authorCity: "Surat",
    avatarColor: "bg-emerald-600",
    theme: "energy",
    title: "Switched to 3.2 kW Rooftop Solar under PM Surya Ghar!",
    content: "Our monthly bill dropped from ₹3,400 to almost ₹150! The installation was done through a GEDA-certified vendor in just 10 days.",
    co2SavedKg: 280,
    points: 100,
    likes: 34,
    likedBy: [],
    timestamp: "2 hours ago",
    photoUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    verified: true
  },
  {
    id: "post_2",
    authorName: "Ankit Trivedi",
    authorCity: "Ahmedabad",
    avatarColor: "bg-blue-600",
    theme: "lifestyle",
    title: "Cycled 6 km along Sabarmati Riverfront for morning commute",
    content: "Avoided petrol car emissions and felt energised! Mission LiFE small habits really add up over time.",
    co2SavedKg: 1.4,
    points: 70,
    likes: 19,
    likedBy: [],
    timestamp: "5 hours ago",
    photoUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
    verified: true
  },
  {
    id: "post_3",
    authorName: "Meera Joshi",
    authorCity: "Gandhinagar",
    avatarColor: "bg-purple-600",
    theme: "waste",
    title: "100% Home Composting Milestone: 30 days no wet waste out",
    content: "Using a terracotta khamba composter. Got rich dark compost for my balcony garden herbs!",
    co2SavedKg: 12.5,
    points: 80,
    likes: 27,
    likedBy: [],
    timestamp: "Yesterday",
    photoUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    verified: true
  }
];

export const VENDORS_DIRECTORY = [
  {
    id: "v_1",
    name: "Surya Urja Solutions Gujarat",
    category: "solar",
    city: "Ahmedabad",
    district: "Ahmedabad",
    rating: 4.9,
    reviews: 142,
    badge: "GEDA Certified Rooftop Partner",
    phone: "+91 79 2658 9100",
    email: "contact@suryaurjagujarat.in",
    address: "SG Highway, Bodakdev, Ahmedabad",
    services: ["Residential Rooftop Solar", "PM Surya Ghar Subsidies", "Net Metering Approvals"],
    verified: true
  },
  {
    id: "v_2",
    name: "GreenGrid Tech Gandhinagar",
    category: "solar",
    city: "Gandhinagar",
    district: "Gandhinagar",
    rating: 4.8,
    reviews: 98,
    badge: "Empanelled Installer",
    phone: "+91 79 2324 8812",
    email: "info@greengridtech.in",
    address: "Sector 11, Electronic Estate, Gandhinagar",
    services: ["3 kW to 10 kW On-Grid Systems", "Smart Bi-directional Inverters"],
    verified: true
  },
  {
    id: "v_3",
    name: "Tapi Solar & Renewables",
    category: "solar",
    city: "Surat",
    district: "Surat",
    rating: 4.9,
    reviews: 215,
    badge: "GEDA Diamond Tier",
    phone: "+91 261 247 6390",
    email: "solar@tapienergy.com",
    address: "Ring Road, Surat",
    services: ["Fast Turnaround Solar", "DGVCL Liaison", "Battery Backup Hybrids"],
    verified: true
  },
  {
    id: "v_4",
    name: "Gujarat E-Waste Recyclers Ltd",
    category: "ewaste",
    city: "Ahmedabad",
    district: "Ahmedabad",
    rating: 4.7,
    reviews: 76,
    badge: "CPCB & GPCB Authorized",
    phone: "+91 79 2286 4410",
    email: "pickup@gujrecylers.com",
    address: "Naroda GIDC, Ahmedabad",
    services: ["Doorstep E-Waste Collection", "Data Sanitization", "Certificate of Destruction"],
    verified: true
  },
  {
    id: "v_5",
    name: "Jio-BP Pulse & Tata Power EV Fast Hub",
    category: "ev",
    city: "Vadodara",
    district: "Vadodara",
    rating: 4.8,
    reviews: 310,
    badge: "60 kW CCS2 & Bharat DC001",
    phone: "+91 265 233 1199",
    email: "evcharging@gujarat.in",
    address: "Near Golden Chokdi, National Highway 48, Vadodara",
    services: ["24x7 Fast Charging", "100% Renewable-Powered Hub"],
    verified: true
  },
  {
    id: "v_6",
    name: "Prakriti Bio-Compost & Aerator Systems",
    category: "waste",
    city: "Rajkot",
    district: "Rajkot",
    rating: 4.6,
    reviews: 54,
    badge: "Mission LiFE Community Partner",
    phone: "+91 281 258 7701",
    email: "sales@prakritibio.com",
    address: "Yagnik Road, Rajkot",
    services: ["Home Aerated Composters", "Low-Flow Faucet Aerators", "Microbial Starters"],
    verified: true
  }
];

export const GOVERNMENT_SCHEMES = [
  {
    id: "pm_surya_ghar",
    title: "PM Surya Ghar: Muft Bijli Yojana",
    authority: "Ministry of New and Renewable Energy (MNRE) & GEDA",
    tagline: "Free electricity up to 300 units/month for 1 Crore households",
    subsidyDetails: "₹30,000 for 1 kW, ₹60,000 for 2 kW, and ₹78,000 for 3 kW and above.",
    eligibility: "Indian citizen, valid electricity connection in own name, suitable shadow-free rooftop.",
    portalUrl: "https://pmsuryaghar.gov.in"
  },
  {
    id: "geda_surya_gujarat",
    title: "Surya Gujarat Residential Solar Scheme",
    authority: "Gujarat Energy Development Agency (GEDA)",
    tagline: "State-level facilitation & expedited net-metering grid connection",
    subsidyDetails: "Seamless integration with DISCOM net-meters (UGVCL, MGVCL, PGVCL, DGVCL, Torrent Power).",
    eligibility: "Residential consumers across all Gujarat districts.",
    portalUrl: "https://geda.gujarat.gov.in"
  },
  {
    id: "tod_tariff",
    title: "Time-of-Day (ToD) Energy Conservation Incentive",
    authority: "Gujarat Electricity Regulatory Commission (GERC)",
    tagline: "Financial discount for consumption during daytime solar hours",
    subsidyDetails: "Off-peak rebate on standard tariff; surcharge on peak grid hours (6 PM - 10 PM).",
    eligibility: "Smart meter enabled domestic and commercial consumers.",
    portalUrl: "https://gercin.org"
  }
];

export const DISTRICT_ADMIN_STATS = [
  { id: "ahm", name: "Ahmedabad", households: 6420, solarKw: 18200, co2SavedTonnes: 42.1, complianceRate: "88%" },
  { id: "srt", name: "Surat", households: 5190, solarKw: 22400, co2SavedTonnes: 36.4, complianceRate: "92%" },
  { id: "gnr", name: "Gandhinagar", households: 4120, solarKw: 14100, co2SavedTonnes: 28.9, complianceRate: "94%" },
  { id: "vad", name: "Vadodara", households: 3840, solarKw: 11800, co2SavedTonnes: 21.8, complianceRate: "85%" },
  { id: "rjk", name: "Rajkot", households: 2980, solarKw: 9200, co2SavedTonnes: 17.2, complianceRate: "81%" },
  { id: "bhv", name: "Bhavnagar", households: 2100, solarKw: 6400, co2SavedTonnes: 12.5, complianceRate: "79%" },
  { id: "ktc", name: "Kutch", households: 1820, solarKw: 8900, co2SavedTonnes: 11.2, complianceRate: "84%" }
];

export const TRANSLATIONS = {
  en: {
    appName: "MISSION LiFE",
    tagline: "Lifestyle for Environment • Gujarat Energy Development Agency",
    org: "Gujarat Energy Development Agency (GEDA)",
    goodEvening: "Good evening",
    lifeScore: "LiFE Score",
    today: "today",
    streak: "Streak",
    days: "days",
    monthlyFootprint: "Monthly CO₂ Footprint",
    thisMonth: "this month",
    todaysMission: "TODAY'S MISSION",
    acceptMission: "ACCEPT MISSION",
    completed: "COMPLETED",
    communityImpact: "COMMUNITY IMPACT",
    citizens: "citizens",
    co2Saved: "CO₂ saved",
    navDashboard: "Home",
    navFootprint: "Footprint Tracker",
    navMissions: "Daily Missions",
    navCommunity: "Community & Feed",
    navSolar: "Solar Advisor",
    navCoach: "LiFE AI Coach",
    navDirectory: "Green Directory",
    navAdmin: "GEDA Admin View",
    takePledge: "Take LiFE Pledge",
    viewCertificate: "View Certificate",
    language: "Language",
    peakHoursNotice: "Peak Grid Load Hours (6 PM - 10 PM). Defer high-power appliances.",
    offPeakNotice: "Green Off-Peak Hours Active. Ideal time for EV charging & heavy appliances."
  },
  hi: {
    appName: "मिशन LiFE",
    tagline: "पर्यावरण के लिए जीवनशैली • गुजरात ऊर्जा विकास एजेंसी",
    org: "गुजरात ऊर्जा विकास एजेंसी (GEDA)",
    goodEvening: "शुभ संध्या",
    lifeScore: "LiFE स्कोर",
    today: "आज",
    streak: "स्ट्राइक",
    days: "दिन",
    monthlyFootprint: "मासिक कार्बन फुटप्रिंट",
    thisMonth: "इस माह",
    todaysMission: "आज का प्रमुख मिशन",
    acceptMission: "मिशन स्वीकारें",
    completed: "पूर्ण हुआ",
    communityImpact: "सामुदायिक प्रभाव",
    citizens: "नागरिक",
    co2Saved: "CO₂ बचत",
    navDashboard: "होम",
    navFootprint: "कार्बन फुटप्रिंट",
    navMissions: "दैनिक मिशन",
    navCommunity: "समुदाय और फीड",
    navSolar: "सोलर एडवाइजर",
    navCoach: "AI LiFE कोच",
    navDirectory: "ग्रीन डायरेक्टरी",
    navAdmin: "GEDA एडमिन व्यू",
    takePledge: "LiFE प्रतिज्ञा लें",
    viewCertificate: "प्रमाणपत्र देखें",
    language: "भाषा",
    peakHoursNotice: "पीक ग्रिड लोड समय (शाम 6 से रात 10)। भारी उपकरण बाद में चलाएं।",
    offPeakNotice: "ग्रीन ऑफ-पीक घंटे सक्रिय। ईवी चार्जिंग और वाशिंग के लिए आदर्श समय।"
  },
  gu: {
    appName: "મિશન LiFE",
    tagline: "પર્યાવરણ માટે જીવનશૈલી • ગુજરાત ઊર્જા વિકાસ એજન્સી",
    org: "ગુજરાત ઊર્જા વિકાસ એજન્સી (GEDA)",
    goodEvening: "શુભ સાંજ",
    lifeScore: "LiFE સ્કોર",
    today: "આજે",
    streak: "સતત પ્રગતિ",
    days: "દિવસ",
    monthlyFootprint: "માસિક કાર્બન ફૂટપ્રિન્ટ",
    thisMonth: "આ મહિને",
    todaysMission: "આજનો મુખ્ય સંકલ્પ",
    acceptMission: "મિશન સ્વીકારો",
    completed: "સફળ",
    communityImpact: "સામૂહિક યોગદાન",
    citizens: "નાગરિકો",
    co2Saved: "CO₂ બચાવ્યો",
    navDashboard: "હોમ",
    navFootprint: "ફૂટપ્રિન્ટ ટ્રેકર",
    navMissions: "દૈનિક મિશન્સ",
    navCommunity: "કમ્યુનિટી ફીડ",
    navSolar: "સોલાર સલાહકાર",
    navCoach: "AI LiFE કોચ",
    navDirectory: "ગ્રીન ડિરેક્ટરી",
    navAdmin: "GEDA એડમિન વ્યૂ",
    takePledge: "LiFE પ્રતિજ્ઞા લો",
    viewCertificate: "પ્રમાણપત્ર જુઓ",
    language: "ભાષા",
    peakHoursNotice: "પીક ગ્રીડ લોડ કલાકો (સાંજે 6 થી રાત્રે 10). ભારે ઉપકરણો મોડા ચલાવો.",
    offPeakNotice: "ગ્રીન ઓફ-પીક કલાકો સક્રિય. EV ચાર્જિંગ માટે શ્રેષ્ઠ સમય."
  },
  mr: {
    appName: "मिशन LiFE",
    tagline: "पर्यावरणासाठी जीवनशैली • गुजरात ऊर्जा विकास संस्था",
    org: "गुजरात ऊर्जा विकास संस्था (GEDA)",
    goodEvening: "शुभ संध्याकाळ",
    lifeScore: "LiFE स्कोअर",
    today: "आज",
    streak: "सातत्य",
    days: "दिवस",
    monthlyFootprint: "मासिक कार्बन फूटप्रिंट",
    thisMonth: "या महिन्यात",
    todaysMission: "आजचे प्रमुख मिशन",
    acceptMission: "मिशन स्वीकारा",
    completed: "पूर्ण",
    communityImpact: "सामूहिक प्रभाव",
    citizens: "नागरिक",
    co2Saved: "CO₂ बचत",
    navDashboard: "होम",
    navFootprint: "कार्बन फूटप्रिंट",
    navMissions: "दैनिक मिशन",
    navCommunity: "समुदाय आणि फीड",
    navSolar: "सौर सल्लागार",
    navCoach: "AI LiFE कोच",
    navDirectory: "ग्रीन डिरेक्टरी",
    navAdmin: "GEDA अ‍ॅडमिन व्ह्यू",
    takePledge: "LiFE प्रतिज्ञा घ्या",
    viewCertificate: "प्रमाणपत्र पहा",
    language: "भाषा",
    peakHoursNotice: "पीक ग्रिड लोड वेळ (संध्याकाळी 6 ते रात्री 10). उपकरणे नंतर वापरा.",
    offPeakNotice: "ग्रीन ऑफ-पीक वेळ सुरू. ईव्ही चार्जिंगसाठी सर्वोत्तम वेळ."
  }
};
