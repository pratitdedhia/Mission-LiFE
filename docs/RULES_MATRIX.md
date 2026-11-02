# Mission LiFE Security Rules Matrix

This document provides an exhaustive mapping of client operations, roles, schema constraints, and enforcement mechanisms implemented in `firestore.rules` and `storage.rules`.

---

## 1. Role-Based Access Control (RBAC) Architecture

Rules resolve caller identity and roles through a two-tier strategy:
1. **Tier 1 (Custom Token Claims):** `request.auth.token.role` is evaluated first for low-latency rule execution.
2. **Tier 2 (Firestore Document Fallback):** If custom claims are absent (e.g. in development or client SDK sessions), the rule safely fetches `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role`.
3. **Default Role:** Any authenticated user lacking an explicit role record defaults safely to `'citizen'`.

### Role Definitions

| Role | Identifiers Accepted | Permissions Summary |
| :--- | :--- | :--- |
| **Citizen** | `'citizen'` | Create own profile, log energy telemetry, submit daily mission proofs, request solar quotes. |
| **Student** | `'student'` | All Citizen rights + link campus ID card, submit verification requests, participate in collegiate sustainability league. |
| **Campus Leader** | `'campus_leader'` | Review and verify student enrollment for their specific campus; inspect campus-wide aggregated energy metrics. |
| **Solar Partner** | `'solar_partner'`, `'solar_vendor'` | Inspect assigned citizen solar inquiries, update quotation milestones, conduct rooftop shadow feasibility reviews. |
| **State Admin** | `'admin'` | Full statewide aggregation, reference catalog updates, platform audit inspections, scheme target reviews. |

---

## 2. Firestore Collections Access Matrix

| Collection Path | Read Permission | Create Permission | Update Permission | Delete Permission | Constraints & Field-Level Guards |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `config/{configDoc}` | Public (`true`) | `false` | `false` | `false` | Static reference tariffs, emission factors, and subsidies. Server Admin SDK only. |
| `tasks/{taskId}` | Public (`true`) | Admin only | Admin only | Admin only | Official Mission LiFE 7-theme task catalog. |
| `themes/{themeId}` | Public (`true`) | Admin only | Admin only | Admin only | Mission LiFE national themes. |
| `badges/{badgeId}` | Public (`true`) | Admin only | Admin only | Admin only | Gamification badge catalog. |
| `rewards/{rewardId}` | Public (`true`) | Admin only | Admin only | Admin only | Carbon redemption catalog. |
| `districts/{districtId}` | Public (`true`) | Admin only | Admin only | Admin only | Gujarat 33 districts reference catalog. |
| `campuses/{campusId}` | Public (`true`) | Admin only | Admin only | Admin only | Gujarat collegiate institutions. |
| `departments/{deptId}` | Public (`true`) | Admin only | Admin only | Admin only | University departments. |
| `schemes/{schemeId}` | Public (`true`) | Admin only | Admin only | Admin only | Government solar and climate schemes. |
| `applianceCatalog/{id}` | Public (`true`) | Admin only | Admin only | Admin only | Appliance specifications for ML vision. |
| `coachKnowledge/{id}` | Public (`true`) | Admin only | Admin only | Admin only | AI LiFE Coach energy advice corpus. |
| `registry/{regId}` | Public (`true`) | Admin only | Admin only | Admin only | Gujarat district & DISCOM registry. |
| `campusSprints/{id}` | Public (`true`) | Admin only | Admin only | Admin only | Campus challenge sprints. |
| `communityGoals/{id}` | Public (`true`) | Admin only | Admin only | Admin only | Statewide energy saving goals. |
| `devices/{deviceId}` | Authenticated Owner, Simulated or Admin | Authenticated Owner or Admin | Authenticated Owner or Admin | Admin only | Hardware device allow-list. Physical devices require authentication. |
| `users/{userId}` | Authenticated | Owner (role must be `'citizen'`) | Owner (excluding protected fields) or Admin | Admin only | **Escalation Guard:** Owner cannot modify `['role', 'points', 'streak', 'badges', 'lifeScore']`. |
| `users/{uid}/telemetry/{id}` | Owner or Admin | Owner or Admin | Owner or Admin | Admin only | Time-series smart meter readings. |
| `users/{uid}/appliances/{id}` | Owner or Admin | Owner or Admin | Owner or Admin | Admin only | Dynamic inventory devices & live draw. |
| `publicProfiles/{userId}` | Public (`true`) | Owner or Admin | Owner or Admin | Admin only | Sanitized leaderboard display data. |
| `households/{userId}` | Owner or Admin | Owner or Admin | Owner or Admin | Admin only | Energy audit baseline parameters. |
| `footprintEntries/{entryId}` | Owner or Admin | Owner (`userId == auth.uid`) | Admin only | Admin only | Immutable calculation log. |
| `taskCompletions/{id}` | Owner or Admin | `false` | `false` | `false` | Server-authoritative via Cloud Function. |
| `verifiedActions/{actionId}` | Authenticated | Owner (`userId == auth.uid`) | Admin only | Admin only | **Bounded points:** `awardedPoints <= 100`, `co2KgSaved <= 50`. Strict whitelist schema. |
| `studentVerifications/{id}` | Authenticated | Owner (`studentId == auth.uid`) | Campus Leader of same campus, or Admin | Admin only | Student can create `status: 'pending'`. Status update restricted to campus leader or admin. |
| `solarLeads/{leadId}` | Owner or Solar Partner | Authenticated | Owner or Solar Partner | Admin only | Dual role recognition (`solar_partner` & `solar_vendor`). |
| `leaderboards/{id}` | Public (`true`) | `false` | `false` | `false` | Read-only cache populated by backend. |
| `aggregates/{metric}/shards/{id}` | Public (`true`) | `false` | `false` | `false` | Read-only sharded counters. |
| `auditLogs/{id}` | Admin only | `false` | `false` | `false` | Tamper-proof audit trail. |

---

## 3. Firebase Storage Rules Matrix

| Storage Bucket Path | Read Access | Write / Upload Access | Content Constraints |
| :--- | :--- | :--- | :--- |
| `/bills/{userId}/{fileName}` | Owner or Admin | Owner | `< 5 MB`, MIME: `image/(jpeg\|png\|webp)` or `application/pdf` |
| `/task_proofs/{userId}/{fileName}` | Authenticated | Owner | `< 5 MB`, MIME: `image/(jpeg\|png\|webp)` or `application/pdf` |
| `/student_ids/{userId}/{fileName}` | Owner, Campus Leader, Admin | Owner | `< 5 MB`, MIME: `image/(jpeg\|png\|webp)` or `application/pdf` |
| `/public/{allPaths=**}` | Public (`true`) | Admin only | Public logos, theme assets, and badge graphics |

---

## 4. Verification and Security Test Evidence

Rules are continuously validated using:
1. `tests/rules/firestore.test.ts` (Vitest static analysis covering all rule branches).
2. Firebase Rules Emulator validation (`npm run test:rules`).
3. Point inflation prevention verified on `verifiedActions` and `users/{uid}`.

