# Firebase Security Rules Deployment Guide (Windows PowerShell)

This guide documents the procedures for testing, simulating, and deploying `firestore.rules` and `storage.rules` to the Firebase project.

---

## 1. Prerequisites

Ensure you have the Firebase CLI installed and are authenticated to the project:

```powershell
# Verify Firebase CLI installation
firebase --version

# Log in to your Google / Firebase Account
firebase login

# Set active project
firebase use hackcult-f9a20
```

---

## 2. Local Testing & Validation

Before deploying to production, run the automated static analysis and unit tests:

```powershell
# Run Firestore & Storage rules test suite
cmd /c npm run test:rules

# Run full repository test suite
cmd /c npm run test
```

### Local Emulation

To test rules live against the Firebase Emulator Suite:

```powershell
# Start Firestore & Storage emulators
firebase emulators:start --only firestore,storage
```

---

## 3. Deploying Rules to Production

To deploy only security rules without altering hosting or Cloud Functions:

```powershell
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firebase Storage security rules
firebase deploy --only storage

# Or deploy both simultaneously
firebase deploy --only firestore:rules,storage
```

---

## 4. Post-Deployment Verification

Verify the deployed rules in the Firebase Console:
1. Navigate to **Firestore Database** > **Rules** tab.
2. Confirm the version header displays `rules_version = '2';`.
3. Check **Storage** > **Rules** tab for file size and MIME-type restrictions.
4. Run live verification using an unauthenticated test request to verify that unauthorized writes to `/config/` or `/tasks/` return `PERMISSION_DENIED`.

