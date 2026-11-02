/**
 * Mission LiFE Catalog & Reference Data Service
 *
 * Provides dynamic loaders for Firestore reference collections:
 * tasks, themes, badges, rewards, districts, campuses, departments,
 * schemes, applianceCatalog, coachKnowledge, vendors, registry, campusSprints, demoProfiles.
 *
 * Cache hierarchy: Memory -> LocalStorage -> Firestore.
 */

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const memoryCache = new Map();
const CACHE_PREFIX = 'life_catalog_cache_';

export function getCachedCatalog(collectionName) {
  if (memoryCache.has(collectionName)) {
    return memoryCache.get(collectionName);
  }
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${collectionName}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) || (parsed && typeof parsed === 'object')) {
        memoryCache.set(collectionName, parsed);
        return parsed;
      }
    }
  } catch {
    // LocalStorage unavailable
  }
  return null;
}

export function setCachedCatalog(collectionName, data) {
  memoryCache.set(collectionName, data);
  try {
    localStorage.setItem(`${CACHE_PREFIX}${collectionName}`, JSON.stringify(data));
  } catch {
    // LocalStorage quota or unavailable
  }
}

/**
 * Fetch a reference collection from Firestore with offline cache fallback.
 */
export async function getCatalog(collectionName) {
  let items = null;

  if (db) {
    try {
      const snap = await getDocs(collection(db, collectionName));
      if (!snap.empty) {
        items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCachedCatalog(collectionName, items);
        return { data: items, isCached: false };
      }
    } catch (err) {
      console.warn(`Firestore getDocs notice for "${collectionName}":`, err.message);
    }
  }

  // Fallback to cache
  const cached = getCachedCatalog(collectionName);
  if (cached) {
    return { data: cached, isCached: true };
  }

  return { data: [], isCached: false };
}

/**
 * Single document fetcher with cache
 */
export async function getDocData(collectionName, docId) {
  const cacheKey = `${collectionName}_${docId}`;
  if (memoryCache.has(cacheKey)) {
    return { data: memoryCache.get(cacheKey), isCached: true };
  }

  if (db) {
    try {
      const snap = await getDoc(doc(db, collectionName, docId));
      if (snap.exists()) {
        const item = { id: snap.id, ...snap.data() };
        setCachedCatalog(cacheKey, item);
        return { data: item, isCached: false };
      }
    } catch (err) {
      console.warn(`Firestore getDoc notice for "${collectionName}/${docId}":`, err.message);
    }
  }

  const cached = getCachedCatalog(cacheKey);
  if (cached) return { data: cached, isCached: true };
  return { data: null, isCached: false };
}

// React hook for catalog collections
export function useCatalog(collectionName) {
  const [data, setData] = useState(() => getCachedCatalog(collectionName) || []);
  const [loading, setLoading] = useState(!getCachedCatalog(collectionName));
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getCatalog(collectionName)
      .then(res => {
        if (active) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          setError(err);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [collectionName]);

  return { data, loading, error };
}

// React hook for single document
export function useCatalogDoc(collectionName, docId) {
  const [data, setData] = useState(() => getCachedCatalog(`${collectionName}_${docId}`) || null);
  const [loading, setLoading] = useState(!getCachedCatalog(`${collectionName}_${docId}`));
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getDocData(collectionName, docId)
      .then(res => {
        if (active) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          setError(err);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [collectionName, docId]);

  return { data, loading, error };
}

export const GUJARAT_DISTRICT_NAMES = [
  "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar",
  "Junagadh", "Anand", "Kheda", "Mehsana", "Banaskantha", "Sabarkantha", "Patan",
  "Kutch", "Bharuch", "Navsari", "Valsad", "Dahod", "Panchmahal", "Surendranagar",
  "Amreli", "Porbandar", "Gir Somnath", "Morbi", "Botad", "Devbhumi Dwarka",
  "Aravalli", "Mahisagar", "Chhota Udaipur", "Tapi", "Narmada", "Dang"
];

// Convenience getters
export const getTasks = () => getCatalog('tasks');
export const getThemes = () => getCatalog('themes');
export const getBadges = () => getCatalog('badges');
export const getRewards = () => getCatalog('rewards');
export const getDistricts = () => getCatalog('districts');
export const getCampuses = () => getCatalog('campuses');
export const getDepartments = () => getCatalog('departments');
export const getSchemes = () => getCatalog('schemes');
export const getApplianceCatalog = () => getCatalog('applianceCatalog');
export const getCoachKnowledge = () => getCatalog('coachKnowledge');
export const getVendors = () => getCatalog('vendors');
export const getRegistry = () => getCatalog('registry');
export const getCampusSprints = () => getCatalog('campusSprints');
export const getDemoProfiles = () => getCatalog('demoProfiles');
export const getCommunityGoals = () => getDocData('communityGoals', 'gujarat_state_goal_2026');

/**
 * Returns default guest user profile
 */
export function getDefaultUserProfile(uid = 'usr_guest') {
  return {
    id: uid,
    uid: uid,
    role: 'citizen',
    roleTitle: 'Residential Citizen',
    name: 'Citizen',
    email: '',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    locality: 'Navrangpura',
    state: 'Gujarat',
    householdSize: 4,
    monthlyElectricityUnits: 250,
    monthlyElectricityBill: 1800,
    lifeScore: 100,
    streak: 1,
    level: 1,
    levelTitle: 'Prakriti Mitra',
    monthlyFootprintKg: 350,
    footprintDeltaPercent: 0,
    pledgeSigned: false,
    completedMissions: [],
    badges: [],
    joinedDate: new Date().toISOString()
  };
}

/**
 * Resolves demo profiles dictionary { citizen, student, campus_leader, solar_partner, admin }
 */
export async function getDemoProfilesMap() {
  const { data } = await getDemoProfiles();
  const profiles = Array.isArray(data) ? data : [];
  return {
    citizen: profiles.find(p => p.role === 'citizen') || getDefaultUserProfile('usr_citizen_pooja'),
    student: profiles.find(p => p.role === 'student'),
    campus_leader: profiles.find(p => p.role === 'campus_leader'),
    solar_partner: profiles.find(p => p.role === 'solar_partner'),
    admin: profiles.find(p => p.role === 'admin')
  };
}
