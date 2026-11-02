import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';

describe('Firestore & Storage Security Rules Hardening Suite', () => {
  let firestoreRules = '';
  let storageRules = '';

  beforeAll(() => {
    firestoreRules = fs.readFileSync('firestore.rules', 'utf8');
    storageRules = fs.readFileSync('storage.rules', 'utf8');
  });

  describe('Firestore Rules', () => {
    it('declares rules_version = 2', () => {
      expect(firestoreRules).toContain("rules_version = '2';");
    });

    it('blocks all client writes to config reference collections', () => {
      expect(firestoreRules).toContain('match /config/{configDoc}');
      expect(firestoreRules).toContain('allow write: if false;');
    });

    it('protects task completions from client tampering (server authoritative)', () => {
      expect(firestoreRules).toContain('match /taskCompletions/{completionId}');
      expect(firestoreRules).toContain('allow write: if false;');
    });

    it('protects leaderboards and sharded aggregate counters from client writes', () => {
      expect(firestoreRules).toContain('match /leaderboards/{leaderboardId}');
      expect(firestoreRules).toContain('match /aggregates/{metric}/shards/{shardId}');
    });

    it('enforces role, points, and lifeScore escalation prevention on user profiles', () => {
      expect(firestoreRules).toContain("!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'points', 'streak', 'badges', 'lifeScore'])");
    });

    it('restricts user profile creation to role citizen only', () => {
      expect(firestoreRules).toContain("allow create: if isOwner(userId) && request.resource.data.role == 'citizen';");
    });

    it('provides fallback role extraction if custom claims are not present', () => {
      expect(firestoreRules).toContain('function getUserRole()');
      expect(firestoreRules).toContain('request.auth.token.role != null');
      expect(firestoreRules).toContain('get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role');
    });

    it('restricts student verification document creation and campus leader status verification', () => {
      expect(firestoreRules).toContain('match /studentVerifications/{verificationId}');
      expect(firestoreRules).toContain('request.resource.data.studentId == request.auth.uid');
      expect(firestoreRules).toContain("getUserRole() == 'campus_leader'");
      expect(firestoreRules).toContain('getUserCampus()');
    });

    it('bounds points and CO2 on verifiedActions with strict schema whitelist', () => {
      expect(firestoreRules).toContain('match /verifiedActions/{actionId}');
      expect(firestoreRules).toContain('request.resource.data.awardedPoints <= 100');
      expect(firestoreRules).toContain('request.resource.data.co2KgSaved <= 50');
      expect(firestoreRules).toContain('hasOnly([');
    });

    it('authorizes solar partners and solar vendors consistently', () => {
      expect(firestoreRules).toContain('function isSolarPartner()');
      expect(firestoreRules).toContain("getUserRole() == 'solar_partner'");
      expect(firestoreRules).toContain("getUserRole() == 'solar_vendor'");
      expect(firestoreRules).toContain('match /solarLeads/{leadId}');
      expect(firestoreRules).toContain('isSolarPartner()');
    });

    it('guards reference catalogs (applianceCatalog, schemes, campuses, coachKnowledge)', () => {
      expect(firestoreRules).toContain('match /applianceCatalog/{catalogId}');
      expect(firestoreRules).toContain('match /schemes/{schemeId}');
      expect(firestoreRules).toContain('match /campuses/{campusId}');
      expect(firestoreRules).toContain('match /coachKnowledge/{docId}');
      expect(firestoreRules).toContain('match /campusSprints/{sprintId}');
      expect(firestoreRules).toContain('match /communityGoals/{goalId}');
    });

    it('guards registered IoT devices allow-list and isolates simulated Wokwi meters', () => {
      expect(firestoreRules).toContain('match /devices/{deviceId}');
      expect(firestoreRules).toContain('resource.data.simulated == true');
      expect(firestoreRules).toContain('request.resource.data.ownerUid == request.auth.uid');
    });

    it('protects publicProfiles with public read and owner write', () => {
      expect(firestoreRules).toContain('match /publicProfiles/{userId}');
      expect(firestoreRules).toContain('allow read: if true;');
      expect(firestoreRules).toContain('allow write: if isOwner(userId) || isAdmin();');
    });
  });

  describe('Storage Rules', () => {
    it('declares rules_version = 2 for Firebase Storage', () => {
      expect(storageRules).toContain("rules_version = '2';");
    });

    it('enforces 5MB size limit and image/pdf MIME restriction', () => {
      expect(storageRules).toContain('request.resource.size < 5 * 1024 * 1024');
      expect(storageRules).toContain('image/(jpeg|png|webp)');
    });

    it('protects bills, task proofs, and student ID verification cards', () => {
      expect(storageRules).toContain('match /bills/{userId}/{fileName}');
      expect(storageRules).toContain('match /task_proofs/{userId}/{fileName}');
      expect(storageRules).toContain('match /student_ids/{userId}/{fileName}');
      expect(storageRules).toContain('match /public/{allPaths=**}');
    });
  });
});
