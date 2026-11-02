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

// Local storage backup keys for offline/fallback resilience
const FEED_STORAGE_KEY = 'life_community_feed_posts';
const FOOTPRINT_HISTORY_KEY = 'life_footprint_history_';
const INQUIRIES_STORAGE_KEY = 'life_solar_inquiries';

/**
 * Ensures offline feed cache is initialized
 */
export async function syncInitialData() {
  // Database seeding is now authoritative via npm run seed.
  // Client only reads from Firestore or offline cache.
}

export function getUserFootprintHistory(userId) {
  if (!userId) return [];
  try {
    const key = `${FOOTPRINT_HISTORY_KEY}${userId}`;
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (raw) {
      const history = JSON.parse(raw);
      if (Array.isArray(history)) return history;
    }
  } catch (e) {
    console.error("Local footprint history read error:", e);
  }
  return [];
}

/**
 * Saves footprint calculation and logs to history
 */
export async function saveUserFootprint(userId, updatedData) {
  if (!userId) return;

  // Local storage history log
  try {
    const key = `${FOOTPRINT_HISTORY_KEY}${userId}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    history.unshift({
      ...updatedData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(history.slice(0, 30)));
  } catch (e) {
    console.error("Local footprint history write error:", e);
  }

  if (!isFirebaseConnected || !db) return;

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      monthlyFootprintKg: updatedData.monthlyFootprintKg,
      footprintDeltaPercent: updatedData.footprintDeltaPercent,
      breakdown: updatedData.breakdown,
      lastCalculationDate: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Firestore saveUserFootprint fallback:", err.message);
  }
}

/**
 * Records a verified daily challenge completion
 */
export async function recordMissionCompleted(userId, mission, proofData = null) {
  if (!userId || !mission) return;

  const actionRecord = {
    userId,
    taskId: mission.id,
    missionTitle: mission.title,
    theme: mission.theme,
    points: mission.points,
    co2Kg: mission.co2Kg,
    proofUrl: proofData?.photoUrl || null,
    notes: proofData?.notes || null,
    status: proofData?.photoUrl ? 'verified' : 'self_reported',
    timestamp: new Date().toISOString()
  };

  if (!isFirebaseConnected || !db) {
    return actionRecord;
  }

  try {
    // 1. Add action log
    const actionsRef = collection(db, 'verifiedActions');
    await addDoc(actionsRef, actionRecord);

    // 2. Increment user total points and streak
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lifeScore: increment(mission.points),
      scoreTodayDelta: increment(mission.points)
    });

    // 3. Update community impact document
    const commRef = doc(db, 'communityGoals', 'gujarat_state_goal_2026');
    await updateDoc(commRef, {
      actionsCompleted: increment(1),
      co2SavedKg: increment(mission.co2Kg)
    }).catch(() => {});

  } catch (err) {
    console.warn("Firestore recordMissionCompleted fallback:", err.message);
  }

  return actionRecord;
}

/**
 * Fetches latest social action feed posts from Firestore or local cache
 */
export async function getCommunityFeed() {
  if (isFirebaseConnected && db) {
    try {
      const q = query(
        collection(db, 'feedPosts'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const posts = [];
        snap.forEach(d => posts.push({ id: d.id, ...d.data() }));
        localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(posts));
        return posts;
      }
    } catch (err) {
      console.warn("Firestore getCommunityFeed fallback:", err.message);
    }
  }

  // Fallback to local storage
  try {
    const local = localStorage.getItem(FEED_STORAGE_KEY);
    if (local) return JSON.parse(local);
  } catch (e) {}
  return [];
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
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function likeFeedPost(postId, userId) {
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
      console.warn("Firestore likeFeedPost fallback:", err.message);
    }
  }
}

/**
 * Creates solar rooftop quotation request
 */
export async function createSolarInquiry(inquiryData) {
  const randNum = typeof crypto !== 'undefined' && crypto.getRandomValues ? (crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000) : (Date.now() % 900000 + 100000);
  const refCode = `GEDA-SOLAR-${randNum}`;
  const newInquiry = {
    ...inquiryData,
    referenceCode: refCode,
    status: 'Site Survey Pending',
    createdAt: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem(INQUIRIES_STORAGE_KEY) || '[]');
    existing.unshift(newInquiry);
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Local solar inquiry storage error:", e);
  }

  if (isFirebaseConnected && db) {
    try {
      const docRef = await addDoc(collection(db, 'solarLeads'), newInquiry);
      newInquiry.id = docRef.id;
    } catch (err) {
      console.warn("Firestore createSolarInquiry fallback:", err.message);
    }
  }

  return newInquiry;
}
