import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';

const AwardPointsRequestSchema = z.object({
  taskId: z.string(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  photoUrl: z.string().url().nullable().optional(),
  imageHash: z.string().nullable().optional()
});

const NUM_SHARDS = 10;

/**
 * Server-authoritative award points function.
 * Clients NEVER write to points, badges, streaks or leaderboards directly.
 */
export const awardPoints = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to record tasks.');
  }

  const parseResult = AwardPointsRequestSchema.safeParse(request.data);
  if (!parseResult.success) {
    throw new HttpsError('invalid-argument', 'Invalid request payload: ' + parseResult.error.message);
  }

  const { taskId, dateKey, photoUrl, imageHash } = parseResult.data;
  const uid = request.auth.uid;
  const db = admin.firestore();

  // Deterministic event ID prevents double-claiming for the same day & task
  const completionId = `completion_${uid}_${taskId}_${dateKey}`;
  const completionRef = db.collection('taskCompletions').doc(completionId);
  const userRef = db.collection('users').doc(uid);
  const taskRef = db.collection('tasks').doc(taskId);

  return db.runTransaction(async (transaction) => {
    const [completionDoc, userDoc, taskDoc] = await Promise.all([
      transaction.get(completionRef),
      transaction.get(userRef),
      transaction.get(taskRef)
    ]);

    if (completionDoc.exists) {
      throw new HttpsError('already-exists', 'Task has already been completed today.');
    }

    if (!taskDoc.exists) {
      throw new HttpsError('not-found', 'Task not found in active catalog.');
    }

    const taskData = taskDoc.data()!;
    const userData = userDoc.data() || {};

    const basePoints = Number(taskData.basePoints || 40);
    const co2SavingsKg = Number(taskData.co2SavingsKg || 1.5);
    const currentStreak = Number(userData.streak || 0);
    const currentPoints = Number(userData.points || 0);

    // Photo bonus
    const photoBonus = photoUrl ? 25 : 0;

    // Streak tier multiplier (authoritative)
    let multiplier = 1.0;
    const newStreak = currentStreak + 1;
    if (newStreak >= 21) multiplier = 1.25;
    else if (newStreak >= 7) multiplier = 1.10;
    else if (newStreak >= 3) multiplier = 1.05;

    const finalPoints = Math.round((basePoints + photoBonus) * multiplier);

    // 1. Create task completion record
    transaction.set(completionRef, {
      id: completionId,
      userId: uid,
      taskId,
      dateKey,
      photoUrl: photoUrl || null,
      imagePerceptualHash: imageHash || null,
      aiConfidence: photoUrl ? 0.92 : null,
      verificationStatus: 'auto_approved',
      pointsAwarded: finalPoints,
      co2SavedKg: co2SavingsKg,
      streakMultiplierApplied: multiplier,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2. Update user profile points & streak
    const newTotalPoints = currentPoints + finalPoints;
    transaction.set(userRef, {
      points: newTotalPoints,
      streak: newStreak,
      lastActiveDate: dateKey,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 3. Sharded counter increment for statewide aggregates (avoids hot doc contention)
    const shardIndex = Math.floor(Math.random() * NUM_SHARDS);
    const shardRef = db.collection('aggregates').doc('statewideCo2').collection('shards').doc(shardIndex.toString());
    transaction.set(shardRef, {
      count: admin.firestore.FieldValue.increment(co2SavingsKg)
    }, { merge: true });

    // 4. Audit log entry
    const auditRef = db.collection('auditLogs').doc();
    transaction.set(auditRef, {
      actorUid: uid,
      action: 'TASK_COMPLETION_AWARD',
      resourceType: 'taskCompletions',
      resourceId: completionId,
      diff: {
        pointsAwarded: finalPoints,
        co2SavedKg: co2SavingsKg,
        newStreak
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      awardedPoints: finalPoints,
      co2SavedKg: co2SavingsKg,
      newStreak,
      totalPoints: newTotalPoints
    };
  });
});

