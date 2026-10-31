import { db, isFirebaseConnected } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore';
import { 
  INITIAL_USER, 
  INITIAL_COMMUNITY, 
  INITIAL_LEADERBOARD, 
  INITIAL_MISSIONS,
  INITIAL_FEED_POSTS,
  VENDORS_DIRECTORY
} from '../data/initialData';

// Local storage backup keys for offline/fallback resilience
const FEED_STORAGE_KEY = 'life_community_feed_posts';
const FOOTPRINT_HISTORY_KEY = 'life_footprint_history_';
const INQUIRIES_STORAGE_KEY = 'life_solar_inquiries';

/**
 * Initializes default global records in Firestore if they do not yet exist
 */
export async function syncInitialData() {
  if (!isFirebaseConnected || !db) return;
  try {
    const commRef = doc(db, 'communityStats', 'global');
    const commSnap = await getDoc(commRef);
    if (!commSnap.exists()) {
      await setDoc(commRef, INITIAL_COMMUNITY);
    }

    // Seed feed if empty
    const feedSnap = await getDocs(query(collection(db, 'feedPosts'), limit(2)));
    if (feedSnap.empty) {
      for (const post of INITIAL_FEED_POSTS) {
        await setDoc(doc(db, 'feedPosts', post.id), {
          ...post,
          createdAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.warn("Firestore sync non-fatal fallback:", err.message);
  }
}

/**
 * Saves footprint calculation and logs to history
 */
export async function saveUserFootprint(userId, updatedData) {
  // Always update local history
  const historyKey = FOOTPRINT_HISTORY_KEY + userId;
  try {
    const existingRaw = localStorage.getItem(historyKey);
    const history = existingRaw ? JSON.parse(existingRaw) : [
      {
        timestamp: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        monthlyFootprintKg: (updatedData.monthlyFootprintKg || 428) + 38,
        label: "Last Month"
      }
    ];
    history.push({
      timestamp: new Date().toISOString(),
      monthlyFootprintKg: updatedData.monthlyFootprintKg,
      breakdown: updatedData.breakdown,
      label: "Current"
    });
    localStorage.setItem(historyKey, JSON.stringify(history.slice(-6)));
  } catch (e) {
    console.error("Local history save error", e);
  }

  if (!isFirebaseConnected || !db) return { success: true, localOnly: true };

  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, updatedData, { merge: true });

    // Save historical audit log
    const logId = `${userId}_${Date.now()}`;
    await setDoc(doc(db, 'footprints', logId), {
      userId,
      timestamp: new Date().toISOString(),
      ...updatedData
    });
    return { success: true };
  } catch (err) {
    console.warn("Firestore footprint save fallback:", err.message);
    return { success: true, localOnly: true };
  }
}

/**
 * Get footprint history for visual comparison over time
 */
export async function getUserFootprintHistory(userId) {
  const historyKey = FOOTPRINT_HISTORY_KEY + userId;
  try {
    const local = localStorage.getItem(historyKey);
    if (local) return JSON.parse(local);
  } catch (e) {}

  return [
    { label: "Baseline (Sep)", monthlyFootprintKg: 495, date: "2026-09-01" },
    { label: "Previous (Oct)", monthlyFootprintKg: 452, date: "2026-10-01" },
    { label: "Current (Now)", monthlyFootprintKg: 428, date: "2026-10-31" }
  ];
}

/**
 * Records a completed mission with optional photo proof
 */
export async function recordMissionCompleted(userId, missionId, points, co2Kg, proofData = null) {
  // Update local storage feed or action logs
  if (proofData?.url) {
    const newPost = {
      id: `post_${Date.now()}`,
      authorName: proofData.userName || "Citizen",
      authorCity: proofData.userCity || "Ahmedabad",
      avatarColor: "bg-emerald-600",
      theme: proofData.theme || "energy",
      title: proofData.title || "Completed Mission LiFE Action",
      content: proofData.notes || `Successfully completed verified sustainability micro-task. Avoided ${co2Kg} kg CO₂!`,
      co2SavedKg: co2Kg,
      points: points,
      likes: 1,
      likedBy: [userId],
      timestamp: "Just now",
      photoUrl: proofData.url,
      verified: true
    };
    saveLocalFeedPost(newPost);
  }

  if (!isFirebaseConnected || !db) return { success: true, localOnly: true };

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lifeScore: increment(points),
      scoreTodayDelta: increment(points),
      streak: increment(1)
    });

    const commRef = doc(db, 'communityStats', 'global');
    await updateDoc(commRef, {
      actionsCompleted: increment(1),
      co2SavedKg: increment(Math.round(co2Kg))
    });

    // Record verified action document
    await addDoc(collection(db, 'verifiedActions'), {
      userId,
      missionId,
      points,
      co2Kg,
      proofUrl: proofData?.url || null,
      proofNote: proofData?.notes || null,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  } catch (err) {
    console.warn("Firestore mission record fallback:", err.message);
    return { success: true, localOnly: true };
  }
}

/**
 * Community Social Feed Management
 */
export async function getCommunityFeed() {
  if (isFirebaseConnected && db) {
    try {
      const q = query(collection(db, 'feedPosts'), orderBy('createdAt', 'desc'), limit(15));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (err) {
      console.warn("Firestore getCommunityFeed fallback:", err.message);
    }
  }

  // Fallback to local storage or defaults
  try {
    const local = localStorage.getItem(FEED_STORAGE_KEY);
    if (local) return JSON.parse(local);
  } catch (e) {}
  return INITIAL_FEED_POSTS;
}

export async function createFeedPost(postData) {
  const newPost = {
    ...postData,
    id: `post_${Date.now()}`,
    likes: 0,
    likedBy: [],
    timestamp: "Just now",
    createdAt: new Date().toISOString()
  };

  saveLocalFeedPost(newPost);

  if (isFirebaseConnected && db) {
    try {
      await setDoc(doc(db, 'feedPosts', newPost.id), newPost);
    } catch (err) {
      console.warn("Firestore createFeedPost fallback:", err.message);
    }
  }

  return newPost;
}

function saveLocalFeedPost(post) {
  try {
    const current = getLocalFeed();
    const updated = [post, ...current.filter(p => p.id !== post.id)];
    localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
}

function getLocalFeed() {
  try {
    const raw = localStorage.getItem(FEED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_FEED_POSTS;
  } catch (e) {
    return INITIAL_FEED_POSTS;
  }
}

export async function likeFeedPost(postId, userId) {
  // Update local
  try {
    const feed = getLocalFeed();
    const target = feed.find(p => p.id === postId);
    if (target) {
      const hasLiked = target.likedBy?.includes(userId);
      target.likes = hasLiked ? target.likes - 1 : target.likes + 1;
      target.likedBy = hasLiked 
        ? target.likedBy.filter(id => id !== userId) 
        : [...(target.likedBy || []), userId];
      localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(feed));
    }
  } catch (e) {}

  if (isFirebaseConnected && db) {
    try {
      const postRef = doc(db, 'feedPosts', postId);
      await updateDoc(postRef, {
        likes: increment(1)
      });
    } catch (err) {
      console.warn("Firestore like fallback:", err.message);
    }
  }
}

/**
 * Solar Feasibility Inquiry submission
 */
export async function submitSolarInquiry(inquiryData) {
  const refCode = `GEDA-SOLAR-${Math.floor(100000 + Math.random() * 900000)}`;
  const record = {
    ...inquiryData,
    referenceCode: refCode,
    status: "Pending GEDA Empanelled Vendor Callback",
    createdAt: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem(INQUIRIES_STORAGE_KEY) || '[]');
    existing.unshift(record);
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {}

  if (isFirebaseConnected && db) {
    try {
      await addDoc(collection(db, 'solarInquiries'), record);
    } catch (err) {
      console.warn("Firestore solar inquiry fallback:", err.message);
    }
  }

  return { success: true, referenceCode: refCode };
}

/**
 * Vendors Directory
 */
export async function getVendorsDirectory() {
  return VENDORS_DIRECTORY;
}
