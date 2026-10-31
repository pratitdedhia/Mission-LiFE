# Architecture Decision Record (ADR) 001: Server-Authoritative Economy & Anti-Tamper Points

## Status
Accepted

## Context
Mission LiFE (Lifestyle for Environment) citizen gamification platforms frequently suffer from client-side manipulation vulnerabilities when points, streaks, levels, or leaderboard totals can be written directly by web clients. In a state-level engagement platform for the Gujarat Energy Development Agency (GEDA), carbon savings and energy conservation certificates have official and financial implications (e.g., green ratings, utility rebates, PM Surya Ghar empanelled benefits).

Allowing client devices to write directly to user points, badges, leaderboard collections, or statewide aggregates exposes the platform to:
1. Arbitrary point inflation by modifying client-side JavaScript or sending arbitrary Firestore write requests.
2. Duplicate daily mission claims allowing bots or repeated clicks to claim points multiple times in a single day.
3. Race conditions and hot document contention when hundreds of thousands of citizens simultaneously update statewide metrics.

## Decision
We enforce a strict **Server-Authoritative Economy** using Firebase Cloud Functions 2nd Gen (`functions/src/economy.ts`) and Cloud Firestore Security Rules:

1. **Client Write Ban:**
   Clients have `allow write: if false;` on `tasks`, `badges`, `rewards`, `leaderboards`, `aggregates`, `taskCompletions`, and `auditLogs`. On `users/{userId}`, clients may only update basic profile fields (`name`, `city`, `phone`, `pincode`, `hasCompletedOnboarding`), and rules explicitly deny writes that attempt to alter `points`, `lifeScore`, `streak`, `badges`, or `role`.

2. **Deterministic Completion IDs & Idempotency:**
   Every task claim is submitted via a callable Cloud Function `awardPoints`. The function computes a deterministic completion document ID:
   ```ts
   const completionId = `completion_${uid}_${taskId}_${dateKey}`;
   ```
   Using a Firestore transaction, if `taskCompletions/{completionId}` already exists, the transaction aborts with an `already-exists` error code. This guarantees mathematical idempotency and prevents duplicate claims for the same calendar date.

3. **Daily Velocity Cap:**
   Points earned on any given calendar day are tracked and capped at 400 points/day per user. Any claims beyond this limit are rejected to prevent automated bot farming.

4. **Sharded Atomic Aggregates:**
   Statewide metrics (total CO2 saved, total actions completed, total kWh shifted) are distributed across 10 deterministic counter shards under `aggregates/statewideCo2/shards/{shardId}`. Shard updates use `FieldValue.increment(...)`, eliminating hot-document contention and scaling linearly to tens of thousands of concurrent writes per second.

5. **Tamper-Evident Audit Logging:**
   Every points grant atomically appends a non-deletable record to `auditLogs` containing `userId`, `taskId`, `pointsAwarded`, `co2SavedKg`, `timestamp`, `ip`, and `proofHash`.

## Consequences
- **Positive:** Mathematically tamper-proof economy. Zero client trust. Clean audit trail for state administrators.
- **Positive:** Protection against high-concurrency contention on global counters.
- **Negative:** Requires network round-trip to Cloud Functions for points calculation, mitigated via optimistic client UI updates with automatic reconciliation.

