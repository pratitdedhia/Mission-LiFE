import * as admin from 'firebase-admin';

admin.initializeApp();

export { awardPoints } from './economy';
export { processBillOcr, verifyTaskProof } from './vision';
export { getLiveWeather } from './weather';
export { dailyNudgeScheduler } from './schedulers';

