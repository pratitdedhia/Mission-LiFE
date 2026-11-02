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
import { getCatalog, getCachedCatalog } from './catalogService';

// Fallback local storage key template
const INVENTORY_STORAGE_KEY = (uid) => `life_user_appliances_${uid || 'usr_default'}`;

/**
 * Fetch appliance catalog presets dynamically from Firestore applianceCatalog collection or cache
 */
export const APPLIANCE_PRESETS = getCachedCatalog('applianceCatalog') || [
  {
    type: "air_conditioner",
    name: "Inverter Air Conditioner",
    category: "Cooling",
    icon: "❄️",
    defaultWattage: 1450,
    defaultDailyHours: 8,
    dutyCycle: 0.70,
    monthlyCo2e: 172.5,
    tip: "Set thermostat to 24°C–26°C with ceiling fan on low speed."
  },
  {
    type: "refrigerator",
    name: "Frost-Free Refrigerator",
    category: "Refrigeration",
    icon: "🧊",
    defaultWattage: 220,
    defaultDailyHours: 24,
    dutyCycle: 0.40,
    monthlyCo2e: 45.4,
    tip: "Maintain 2-inch clearance behind cooling coils."
  },
  {
    type: "washing_machine",
    name: "Front-Load Washing Machine",
    category: "Laundry",
    icon: "🧺",
    defaultWattage: 650,
    defaultDailyHours: 1.0,
    dutyCycle: 0.80,
    monthlyCo2e: 11.1,
    tip: "Wash with cold water to save power."
  },
  {
    type: "microwave",
    name: "Microwave Convection Oven",
    category: "Kitchen",
    icon: "♨️",
    defaultWattage: 1100,
    defaultDailyHours: 0.5,
    dutyCycle: 1.0,
    monthlyCo2e: 11.7,
    tip: "Switch off at wall plug when idle."
  },
  {
    type: "tv",
    name: "Smart Television / Display",
    category: "Entertainment",
    icon: "📺",
    defaultWattage: 110,
    defaultDailyHours: 5,
    dutyCycle: 1.0,
    monthlyCo2e: 11.7,
    tip: "Avoid standby vampire draw."
  }
];

export async function getAppliancePresets() {
  const result = await getCatalog('applianceCatalog');
  return result.data || [];
}

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
    }
  } catch (err) {
    console.warn("Local inventory retrieval error:", err);
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
  const randSuffix = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now().toString(36);
  const newId = applianceData.id || `app_${Date.now()}_${randSuffix}`;
  
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

