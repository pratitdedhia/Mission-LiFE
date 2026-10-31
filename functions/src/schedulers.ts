import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';

/**
 * Scheduled Cloud Function: Generates personalized daily nudges for active citizens.
 * Runs daily at 5:00 PM IST (prior to Gujarat DISCOM 6-10 PM peak window).
 */
export const dailyNudgeScheduler = onSchedule('every day 17:00', async () => {
  const db = admin.firestore();
  const usersSnap = await db.collection('users').where('role', '==', 'citizen').limit(500).get();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 18 * 60 * 60 * 1000); // 18 hours validity

  const batch = db.batch();

  usersSnap.forEach((userDoc) => {
    const nudgeRef = db.collection('userNudges').doc();
    batch.set(nudgeRef, {
      id: nudgeRef.id,
      userId: userDoc.id,
      templateId: 'peak_hour_shift',
      headlineKey: 'nudges.peakHour.headline',
      bodyKey: 'nudges.peakHour.body',
      estimatedSavingsKwh: 2.4,
      status: 'delivered',
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString()
    });
  });

  await batch.commit();
});

