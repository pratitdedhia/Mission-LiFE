/**
 * Idempotent Firestore Database Seeder for Mission LiFE Gujarat (GEDA HC26-GEDA01)
 *
 * Populates all configuration, reference collections, devices, and demo accounts from /seed/*.json.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *   npx tsx scripts/seed.ts --dry-run
 *   npx tsx scripts/seed.ts --emulator
 *   npx tsx scripts/seed.ts --only config
 *   npx tsx scripts/seed.ts --reset-demo
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isEmulator = args.includes('--emulator');
const isResetDemo = args.includes('--reset-demo');
const onlyIdx = args.indexOf('--only');
const onlyTarget = onlyIdx !== -1 && args[onlyIdx + 1] ? args[onlyIdx + 1] : null;

const SEED_DIR = path.resolve(__dirname, '../seed');

function readSeedJson<T = any>(filename: string): T {
  const filePath = path.join(SEED_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required seed file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function getAdmin() {
  return (admin as any).default || admin;
}

function initAdmin(): admin.app.App {
  const firebaseAdmin = getAdmin();
  const existingApps = firebaseAdmin.apps || [];
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

  if (isEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
    console.log(`🔧 Connecting to Firebase Emulator (Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}, Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST})`);
    return firebaseAdmin.initializeApp({ projectId: 'hackcult-f9a20' });
  }

  if (!credPath && !emulatorHost) {
    console.error(`
❌ [Seed Error] Neither GOOGLE_APPLICATION_CREDENTIALS nor FIRESTORE_EMULATOR_HOST is set.
To run against live Firebase on Windows PowerShell, run:
  $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\\path\\to\\serviceAccountKey.json"
  npx tsx scripts/seed.ts

Or run against the local emulator:
  npx tsx scripts/seed.ts --emulator

Or run validation only without contacting Firestore:
  npx tsx scripts/seed.ts --dry-run
`);
    process.exit(1);
  }

  return firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'hackcult-f9a20'
  });
}

export async function runSeed() {
  console.log(`====================================================`);
  console.log(`🌱 Mission LiFE Gujarat (GEDA HC26-GEDA01) Seeder`);
  console.log(`   Mode: ${isDryRun ? 'DRY-RUN (no writes)' : 'LIVE SEED'}`);
  if (onlyTarget) console.log(`   Filter: only "${onlyTarget}"`);
  console.log(`====================================================\n`);

  // Load all seed data files first to validate format
  const emissionFactors = readSeedJson('config.emissionFactors.json');
  const tariffs = readSeedJson('config.tariffs.json');
  const subsidyRules = readSeedJson('config.subsidyRules.json');
  const solarModel = readSeedJson('config.solarModel.json');
  const scoring = readSeedJson('config.scoring.json');
  const nudgeRules = readSeedJson('config.nudgeRules.json');
  const forecast = readSeedJson('config.forecast.json');

  const themes = readSeedJson<any[]>('themes.json');
  const tasks = readSeedJson<any[]>('tasks.json');
  const badges = readSeedJson<any[]>('badges.json');
  const rewards = readSeedJson<any[]>('rewards.json');
  const districts = readSeedJson<any[]>('districts.json');
  const campuses = readSeedJson<any[]>('campuses.json');
  const departments = readSeedJson<any[]>('departments.json');
  const schemes = readSeedJson<any[]>('schemes.json');
  const applianceCatalog = readSeedJson<any[]>('applianceCatalog.json');
  const coachKnowledge = readSeedJson<any[]>('coachKnowledge.json');
  const communityGoals = readSeedJson('communityGoals.json');
  const vendors = readSeedJson<any[]>('vendors.json');
  const registry = readSeedJson<any[]>('registry.json');
  const campusSprints = readSeedJson<any[]>('campusSprints.json');
  const devices = readSeedJson<any[]>('devices.json');
  const demoProfiles = readSeedJson<any[]>('demoProfiles.json');

  console.log(`✓ Validated all 23 seed JSON files in /seed/ successfully.`);

  if (isDryRun) {
    console.log(`\n[DRY RUN SUMMARY] Would write to Firestore:`);
    console.log(`  - config/emissionFactors`);
    console.log(`  - config/tariffs`);
    console.log(`  - config/subsidyRules`);
    console.log(`  - config/solarModel`);
    console.log(`  - config/scoring`);
    console.log(`  - config/nudgeRules`);
    console.log(`  - config/forecast`);
    console.log(`  - themes (${themes.length} items)`);
    console.log(`  - tasks (${tasks.length} items)`);
    console.log(`  - badges (${badges.length} items)`);
    console.log(`  - rewards (${rewards.length} items)`);
    console.log(`  - districts (${districts.length} items)`);
    console.log(`  - campuses (${campuses.length} items)`);
    console.log(`  - departments (${departments.length} items)`);
    console.log(`  - schemes (${schemes.length} items)`);
    console.log(`  - applianceCatalog (${applianceCatalog.length} items)`);
    console.log(`  - coachKnowledge (${coachKnowledge.length} items)`);
    console.log(`  - communityGoals/gujarat_state_goal_2026`);
    console.log(`  - vendors (${vendors.length} items)`);
    console.log(`  - registry (${registry.length} items)`);
    console.log(`  - campusSprints (${campusSprints.length} items)`);
    console.log(`  - devices (${devices.length} items)`);
    console.log(`  - demoProfiles & publicProfiles (${demoProfiles.length} users)`);
    console.log(`\nDry run complete. No modifications were made.`);
    return;
  }

  const firebaseAdmin = getAdmin();
  const app = initAdmin();
  const db = firebaseAdmin.firestore(app);
  const auth = firebaseAdmin.auth(app);

  const shouldSeed = (collection: string) => !onlyTarget || onlyTarget === collection;

  // 1. Seed Config Documents
  if (shouldSeed('config')) {
    console.log(`📦 Seeding config collection...`);
    await db.collection('config').doc('emissionFactors').set(emissionFactors);
    await db.collection('config').doc('tariffs').set(tariffs);
    await db.collection('config').doc('subsidyRules').set(subsidyRules);
    await db.collection('config').doc('solarModel').set(solarModel);
    await db.collection('config').doc('scoring').set(scoring);
    await db.collection('config').doc('nudgeRules').set(nudgeRules);
    await db.collection('config').doc('forecast').set(forecast);
    console.log(`  ✓ config docs seeded.`);
  }

  // Helper for batch collection writes
  async function seedCollection(name: string, items: any[], idField = 'id') {
    if (!shouldSeed(name)) return;
    console.log(`📦 Seeding ${name} (${items.length} items)...`);
    const batch = db.batch();
    for (const item of items) {
      const docId = String(item[idField] || item.type || item.city || item.uid);
      const ref = db.collection(name).doc(docId);
      batch.set(ref, item, { merge: true });
    }
    await batch.commit();
    console.log(`  ✓ ${name} seeded.`);
  }

  // 2. Reference Collections
  await seedCollection('themes', themes, 'id');
  await seedCollection('tasks', tasks, 'id');
  await seedCollection('badges', badges, 'id');
  await seedCollection('rewards', rewards, 'id');
  await seedCollection('districts', districts, 'id');
  await seedCollection('campuses', campuses, 'id');
  await seedCollection('departments', departments, 'id');
  await seedCollection('schemes', schemes, 'id');
  await seedCollection('applianceCatalog', applianceCatalog, 'type');
  await seedCollection('coachKnowledge', coachKnowledge, 'id');
  await seedCollection('vendors', vendors, 'id');
  await seedCollection('registry', registry, 'city');
  await seedCollection('campusSprints', campusSprints, 'id');
  await seedCollection('devices', devices, 'id');

  // Single doc: communityGoals
  if (shouldSeed('communityGoals')) {
    console.log(`📦 Seeding communityGoals...`);
    await db.collection('communityGoals').doc(communityGoals.id).set(communityGoals, { merge: true });
    console.log(`  ✓ communityGoals seeded.`);
  }

  // 3. Demo Accounts & Auth Users
  if (shouldSeed('users') || shouldSeed('demo') || isResetDemo) {
    console.log(`👥 Seeding 5 demo accounts & Auth users...`);
    const defaultPassword = process.env.DEMO_PASSWORD || 'MissionLiFE@2026';

    for (const profile of demoProfiles) {
      const { uid, email, role, name, ...rest } = profile;

      // Idempotently create / update Auth user
      try {
        await auth.getUser(uid);
        await auth.updateUser(uid, {
          email,
          displayName: name,
          password: defaultPassword
        });
      } catch (e: any) {
        if (e.code === 'auth/user-not-found') {
          await auth.createUser({
            uid,
            email,
            displayName: name,
            password: defaultPassword
          });
        } else {
          console.warn(`  Auth user check for ${uid}:`, e.message);
        }
      }

      // Set custom claims for role
      try {
        await auth.setCustomUserClaims(uid, { role });
      } catch (err: any) {
        console.warn(`  Could not set custom claim for ${uid}:`, err.message);
      }

      // Write users/{uid}
      const userDoc = {
        uid,
        email,
        role,
        name,
        demo: true,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        ...rest
      };
      await db.collection('users').doc(uid).set(userDoc, { merge: true });

      // Write publicProfiles/{uid}
      const publicDoc = {
        uid,
        name,
        role,
        roleTitle: profile.roleTitle || role,
        district: profile.district || 'Ahmedabad',
        city: profile.city || 'Ahmedabad',
        lifeScore: profile.lifeScore || 0,
        streak: profile.streak || 0,
        level: profile.level || 1,
        badges: profile.badges || [],
        monthlyFootprintKg: profile.monthlyFootprintKg || 0,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('publicProfiles').doc(uid).set(publicDoc, { merge: true });
    }
    console.log(`  ✓ Demo accounts & Auth users provisioned.`);
  }

  console.log(`\n🎉 Seed completed successfully!`);
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('scripts/seed')) {
  runSeed().catch(err => {
    console.error('Seed execution failed:', err);
    process.exit(1);
  });
}
