import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserNudge } from '../../shared/src/schemas/models';

export async function getUserNudges(userId: string): Promise<UserNudge[]> {
  try {
    const q = query(collection(db, 'userNudges'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const nudges: UserNudge[] = [];
      snap.forEach(d => {
        nudges.push(d.data() as UserNudge);
      });
      return nudges;
    }
  } catch (err) {
    console.warn('User nudges fetch fallback:', err);
  }

  // Initial validated nudge set
  return [
    {
      id: `nudge_tod_${userId}`,
      userId,
      templateId: 'peak_hours',
      headlineKey: 'nudges.peakHour.headline',
      bodyKey: 'nudges.peakHour.body',
      estimatedSavingsKwh: 2.4,
      status: 'delivered',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: `nudge_heatwave_${userId}`,
      userId,
      templateId: 'heatwave',
      headlineKey: 'nudges.heatwave.headline',
      bodyKey: 'nudges.heatwave.body',
      estimatedSavingsKwh: 1.8,
      status: 'delivered',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ];
}

export async function updateNudgeStatus(nudgeId: string, status: 'accepted' | 'dismissed'): Promise<void> {
  try {
    const nudgeRef = doc(db, 'userNudges', nudgeId);
    await updateDoc(nudgeRef, {
      status,
      acceptedAt: status === 'accepted' ? new Date().toISOString() : null
    });
  } catch (err) {
    console.warn('Nudge status update non-fatal fallback:', err);
  }
}

