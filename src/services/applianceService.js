/**
 * Mission LiFE Appliance Inventory Service & Dynamic Footprint Engine
 * 
 * Manages the Firestore subcollection `users/{uid}/appliances` and computes
 * authoritative dynamic baselines that override initial onboarding estimates.
 */

import { db, isFirebaseConnected } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  updateDoc 
} from 'firebase/firestore';

// Fallback local storage key template
const INVENTORY_STORAGE_KEY = (uid) => `life_user_appliances_${uid || 'usr_default'}`;

/**
 * Standard Gujarat Appliance Presets Catalog with verified CEA / BEE star metrics
 */
export const APPLIANCE_PRESETS = [
  {
    type: 'air_conditioner',
    name: 'Inverter Air Conditioner (1.5 Ton, 5-Star)',
    category: 'Cooling',
    icon: '❄️',
    defaultWattage: 1450,
    defaultDailyHours: 8,
    dutyCycle: 0.70,
    monthlyCo2e: 172.5,
    tip: 'Set thermostat to 24°C–26°C with ceiling fan on low speed to save 24% domestic power.',
    targetMissions: ['clean_ac_filter', 'ac_warrior']
  },
  {
    type: 'refrigerator',
    name: 'Frost-Free Refrigerator (260L, 4-Star)',
    category: 'Refrigeration',
    icon: '🧊',
    defaultWattage: 220,
    defaultDailyHours: 24,
    dutyCycle: 0.40,
    monthlyCo2e: 45.4,
    tip: 'Maintain 2-inch clearance behind cooling coils and set temperature to 3°C to 5°C.',
    targetMissions: ['fridge_coil_clearance']
  },
  {
    type: 'washing_machine',
    name: 'Front-Load Washing Machine (7 kg, Inverter)',
    category: 'Laundry',
    icon: '🧺',
    defaultWattage: 650,
    defaultDailyHours: 1.0,
    dutyCycle: 0.80,
    monthlyCo2e: 11.1,
    tip: 'Wash with cold water (30°C); heating water accounts for 85-90% of cycle electricity.',
    targetMissions: ['cold_water_wash', 'peak_shifter']
  },
  {
    type: 'microwave',
    name: 'Microwave Convection Oven (28L)',
    category: 'Kitchen',
    icon: '♨️',
    defaultWattage: 1100,
    defaultDailyHours: 0.5,
    dutyCycle: 1.0,
    monthlyCo2e: 11.7,
    tip: 'Switch off at wall plug when idle to eliminate 3W continuous phantom standby power.',
    targetMissions: ['microwave_phantom_switch']
  },
  {
    type: 'water_heater_geyser',
    name: 'Storage Water Geyser (25L, 5-Star)',
    category: 'Water Heating',
    icon: '🚿',
    defaultWattage: 2000,
    defaultDailyHours: 1.2,
    dutyCycle: 0.90,
    monthlyCo2e: 58.2,
    tip: 'Install a 15-minute timer shutoff; never leave heating elements on standby throughout the day.',
    targetMissions: ['geyser_timer_shutoff']
  },
  {
    type: 'television',
    name: 'Smart 4K UHD LED Television (55")',
    category: 'Entertainment',
    icon: '📺',
    defaultWattage: 110,
    defaultDailyHours: 5.0,
    dutyCycle: 1.0,
    monthlyCo2e: 14.2,
    tip: 'Lower backlight from 100% to 70% to cut display consumption by 28%.',
    targetMissions: ['tv_backlight_eco']
  },
  {
    type: 'ceiling_fan',
    name: 'BLDC Energy Saver Smart Ceiling Fan',
    category: 'Circulation',
    icon: '🌀',
    defaultWattage: 32,
    defaultDailyHours: 12.0,
    dutyCycle: 1.0,
    monthlyCo2e: 6.8,
    tip: 'Brushless DC motors use 65% less power than standard 75W induction ceiling fans.',
    targetMissions: ['bldc_fan_upgrade']
  },
  {
    type: 'induction_cooktop',
    name: 'Electric Induction Cooktop (2000W)',
    category: 'Cooking',
    icon: '⚡',
    defaultWattage: 1800,
    defaultDailyHours: 1.5,
    dutyCycle: 0.85,
    monthlyCo2e: 32.0,
    tip: 'Match pan base diameter to the induction ring for 84% direct thermal transfer efficiency.',
    targetMissions: ['induction_eco_cook']
  }
];

// Initial seeded inventory for demo/citizen default
export const SEED_INVENTORY = [
  {
    id: 'app_seed_ac',
    appliance_type: 'air_conditioner',
    appliance_name: 'Inverter Air Conditioner (1.5 Ton)',
    category: 'Cooling',
    wattage: 1450,
    daily_hours: 8,
    duty_cycle: 0.70,
    monthly_co2e: 172.5,
    room_location: 'Master Bedroom',
    source: 'yolov8_scan',
    confidence: 0.94,
    energy_saving_nudge: 'Set thermostat to 26°C with ceiling fan on low speed.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'app_seed_fridge',
    appliance_type: 'refrigerator',
    appliance_name: 'Frost-Free Refrigerator (260L)',
    category: 'Refrigeration',
    wattage: 220,
    daily_hours: 24,
    duty_cycle: 0.40,
    monthly_co2e: 45.4,
    room_location: 'Kitchen',
    source: 'manual_entry',
    confidence: 1.0,
    energy_saving_nudge: 'Maintain 2-inch clearance behind coils for ventilation.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

/**
 * Fetch all appliances from Firestore subcollection `users/{uid}/appliances`
 * with resilient offline localStorage caching.
 */
export async function getAppliances(uid = 'usr_citizen') {
  const localKey = INVENTORY_STORAGE_KEY(uid);
  let localData = [];

  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      localData = JSON.parse(raw);
    } else {
      // Seed initial sample inventory on first access
      localData = SEED_INVENTORY;
      localStorage.setItem(localKey, JSON.stringify(localData));
    }
  } catch (err) {
    console.warn("Local inventory retrieval error:", err);
    localData = SEED_INVENTORY;
  }

  if (!isFirebaseConnected || !db) {
    return localData;
  }

  try {
    const colRef = collection(db, 'users', uid, 'appliances');
    const snap = await getDocs(colRef);

    if (!snap.empty) {
      const items = [];
      snap.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      localStorage.setItem(localKey, JSON.stringify(items));
      return items;
    } else {
      // If Firestore is connected but subcollection is empty, seed it with initial items
      for (const item of localData) {
        await setDoc(doc(db, 'users', uid, 'appliances', item.id), item);
      }
      return localData;
    }
  } catch (err) {
    console.warn("Firestore subcollection getAppliances fallback:", err.message);
    return localData;
  }
}

/**
 * Add a new appliance to `users/{uid}/appliances` subcollection and update baseline
 */
export async function addAppliance(uid = 'usr_citizen', applianceData) {
  const localKey = INVENTORY_STORAGE_KEY(uid);
  const newId = applianceData.id || `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const record = {
    id: newId,
    appliance_type: applianceData.appliance_type || 'other',
    appliance_name: applianceData.appliance_name || 'Home Appliance',
    category: applianceData.category || 'Household',
    wattage: Number(applianceData.wattage) || 500,
    daily_hours: Number(applianceData.daily_hours) || 4,
    duty_cycle: Number(applianceData.duty_cycle) || 0.8,
    monthly_co2e: Number(applianceData.monthly_co2e) || Math.round(Number(applianceData.wattage || 500) * 0.08),
    room_location: applianceData.room_location || 'Main Residence',
    source: applianceData.source || 'manual_entry',
    confidence: applianceData.confidence || (applianceData.source === 'yolov8_scan' ? 0.92 : 1.0),
    energy_saving_nudge: applianceData.energy_saving_nudge || 'Turn off at wall socket when not in active use.',
    created_at: new Date().toISOString()
  };

  // 1. Save to local storage
  let currentList = [];
  try {
    const raw = localStorage.getItem(localKey);
    currentList = raw ? JSON.parse(raw) : [];
  } catch (e) {
    currentList = [];
  }
  const updatedList = [record, ...currentList.filter(item => item.id !== newId)];
  localStorage.setItem(localKey, JSON.stringify(updatedList));

  // 2. Save to Firestore subcollection if connected
  if (isFirebaseConnected && db) {
    try {
      const docRef = doc(db, 'users', uid, 'appliances', newId);
      await setDoc(docRef, record, { merge: true });
    } catch (err) {
      console.warn("Firestore addAppliance subcollection write warning:", err.message);
    }
  }

  return { success: true, appliance: record, allAppliances: updatedList };
}

/**
 * Remove an appliance from `users/{uid}/appliances` subcollection
 */
export async function removeAppliance(uid = 'usr_citizen', applianceId) {
  const localKey = INVENTORY_STORAGE_KEY(uid);
  let updatedList = [];

  try {
    const raw = localStorage.getItem(localKey);
    const list = raw ? JSON.parse(raw) : [];
    updatedList = list.filter(item => item.id !== applianceId);
    localStorage.setItem(localKey, JSON.stringify(updatedList));
  } catch (e) {
    console.error("Local storage removeAppliance error:", e);
  }

  if (isFirebaseConnected && db) {
    try {
      await deleteDoc(doc(db, 'users', uid, 'appliances', applianceId));
    } catch (err) {
      console.warn("Firestore delete appliance subcollection warning:", err.message);
    }
  }

  return { success: true, allAppliances: updatedList };
}

/**
 * DYNAMIC BASELINE UTILITY
 * 
 * Sums the `monthly_co2e` of all verified items in the inventory
 * to dynamically update and override the user's initial onboarding footprint.
 */
export function calculateInventoryBaseline(appliances = [], currentUser = {}) {
  const totalApplianceCo2e = appliances.reduce((sum, item) => {
    return sum + (Number(item.monthly_co2e) || 0);
  }, 0);

  // Baseline non-appliance household electricity (lighting, router, standby)
  const baseLightingAndStandbyKg = 32;
  const newEnergyKg = Math.round(totalApplianceCo2e + baseLightingAndStandbyKg);

  const existingBreakdown = currentUser.breakdown || {
    energy: 228,
    transport: 114,
    cooking: 38,
    water: 24,
    waste: 24
  };

  const newBreakdown = {
    ...existingBreakdown,
    energy: newEnergyKg
  };

  const newTotalMonthlyKg = 
    newBreakdown.energy + 
    (newBreakdown.transport || 114) + 
    (newBreakdown.cooking || 38) + 
    (newBreakdown.water || 24) + 
    (newBreakdown.waste || 24);

  const totalWattage = appliances.reduce((sum, item) => sum + (Number(item.wattage) || 0), 0);

  return {
    monthlyFootprintKg: newTotalMonthlyKg,
    breakdown: newBreakdown,
    totalApplianceCo2e: Math.round(totalApplianceCo2e * 10) / 10,
    totalWattage: totalWattage,
    applianceCount: appliances.length,
    hasDynamicInventoryBaseline: appliances.length > 0
  };
}

/**
 * Persist dynamic baseline to user profile in Firestore
 */
export async function syncInventoryBaselineToFirestore(uid, dynamicBaseline) {
  if (!isFirebaseConnected || !db) return { success: true, localOnly: true };

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      monthlyFootprintKg: dynamicBaseline.monthlyFootprintKg,
      breakdown: dynamicBaseline.breakdown,
      hasDynamicInventoryBaseline: true,
      inventoryCount: dynamicBaseline.applianceCount,
      inventoryWattage: dynamicBaseline.totalWattage,
      lastBaselineRecalculation: new Date().toISOString()
    });
    return { success: true };
  } catch (err) {
    console.warn("Failed to sync dynamic baseline to Firestore user doc:", err.message);
    return { success: false, error: err.message };
  }
}

