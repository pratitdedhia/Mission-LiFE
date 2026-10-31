# LiFE Loop : Mission LiFE Citizen Engagement Platform
### Gujarat Energy Development Agency (GEDA) • HackCult '26
**Problem Statement ID: HC26-GEDA01 | Track: Green Energy & Sustainability | Category: Production Software**

[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v11.3-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![GEDA](https://img.shields.io/badge/GEDA-Mission%20LiFE-047857?style=for-the-badge&logo=leaf&logoColor=white)](https://geda.gujarat.gov.in/)
[![Vitest](https://img.shields.io/badge/Tests-100%25%20Passing-success?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

> **Product Promise:** *“Mission LiFE turns sustainability from an abstract concept into verifiable, daily, rewarding habits for every Gujarat citizen.”*
> **Live Production URL:** [https://pratitdedhia.github.io/Mission-LiFE/](https://pratitdedhia.github.io/Mission-LiFE/)

---

## 🌍 Executive Summary

**Mission LiFE (Lifestyle for Environment)** is an India-led global mass movement to mobilise individuals for climate-friendly daily habits. While public awareness of climate change is high, citizens encounter substantial friction translating awareness into daily domestic energy conservation.

Developed for the **Gujarat Energy Development Agency (GEDA)**, **LiFE Loop** is an interactive, production-grade web application engineered specifically for Gujarat's residential consumers, campus youth squads, empanelled solar installers, and state administrators. It establishes a closed loop of:

```
Measure ➔ Nudge ➔ Act ➔ Verify ➔ Reward ➔ Report
```

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Residential Citizen
    participant Client as LiFE Loop Web App
    participant Storage as Cloud Storage
    participant Functions as Cloud Functions (2nd Gen)
    participant Firestore as Cloud Firestore
    actor Admin as GEDA State Administrator

    Citizen->>Client: 1. Uploads DISCOM Bill Photo
    Client->>Storage: Store bill image securely in bills/{uid}/*
    Client->>Functions: Call processBillOcr()
    Functions-->>Client: Extracted units (280 kWh), DISCOM (UGVCL), amount (₹2,120)
    Client->>Firestore: Store Footprint Baseline (CEA v19: 0.82 kg/kWh)
    
    Functions->>Firestore: Daily Nudge Scheduler evaluates ToD Tariffs & Weather
    Functions-->>Citizen: Nudge: Peak 6-10 PM load shift & AC at 24°C
    
    Citizen->>Client: 3. Accepts AC 24°C micro-task & uploads photo proof
    Client->>Storage: Store proof in task_proofs/{uid}/*
    Client->>Functions: Call awardPoints({ taskId, proofUrl })
    
    Note over Functions,Firestore: Transactional Deduplication & 400 pts/day Cap
    Functions->>Firestore: Create taskCompletions/completion_{uid}_{taskId}_{date}
    Functions->>Firestore: Atomically increment user lifeScore & streak
    Functions->>Firestore: Increment 10-shard statewide CO2 counter
    Functions->>Firestore: Append non-deletable auditLog record
    
    Functions-->>Client: Points awarded (+75 pts with photo bonus)
    Admin->>Client: 6. Inspects 33-district GWh compliance heatmap & exports CSV audit
```

---

## 👥 Role-Based Portals & Quick Demo Credentials

LiFE Loop features a zero-friction authentication portal with verified demo credentials:

| Role | Demo Identity | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **🌱 Citizen** | Pooja Patel *(Ahmedabad)* | `citizen.pooja@gujaratlife.in` | `Password123!` | Bill OCR scan, footprint breakdown, peak load shifting, PM Surya Ghar calculator, verified certificate |
| **🎓 Campus Leader** | Aarav Mehta *(IIT Gandhinagar)* | `campus.aarav@iitgn.ac.in` | `Password123!` | Campus Squad Hub, Inter-Hostel AC sprint, zero-waste dining challenge, Gujarat Inter-Campus League |
| **☀️ Solar Partner** | Rajesh Shah *(Surya Urja Gujarat)* | `vendor.rajesh@suryaurjagujarat.in` | `Password123!` | GEDA Empanelled Installer portal, live rooftop solar leads queue, site survey booking, subsidy quotes |
| **🏛️ State Admin** | Dr. Neha Joshi *(GEDA Directorate)* | `admin.neha@geda.gujarat.gov.in` | `Password123!` | 33-district monitoring heatmap, ToD peak compliance %, sharded state counters, CSV audit export |

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client (React 19 + TypeScript + Vite + Tailwind CSS)"]
        UI["Modern Light/Dark Responsive UI"]
        Repo["Typed Repositories Layer\n(configRepo, taskRepo, vendorRepo, leaderboardRepo)"]
        SharedCalc["Pure Calculation Engines\n(footprint, solar, tariffs, points)"]
        I18nEngine["i18next Multilingual Engine\n(English, Gujarati, Hindi)"]
    end

    subgraph FirebaseServices["Google Firebase Platform"]
        Auth["Firebase Authentication\n(Email/Password, Google OAuth, Custom Claims)"]
        Rules["Security Rules Tier\n(firestore.rules & storage.rules)"]
        FirestoreDB[("Cloud Firestore\n(users, tasks, config/*, leaderboards, aggregates)")]
        CloudStorage["Firebase Cloud Storage\n(bills/{uid}/*, task_proofs/{uid}/*)"]
    end

    subgraph FunctionsLayer["Cloud Functions 2nd Gen (TypeScript Strict)"]
        EconomyFn["economy.ts\n(awardPoints, transactional dedupe, sharded counters)"]
        VisionFn["vision.ts\n(processBillOcr, verifyTaskProof)"]
        WeatherFn["weather.ts\n(Open-Meteo API caller with 30-min Firestore TTL cache)"]
        SchedulerFn["schedulers.ts\n(dailyNudgeScheduler 17:00 IST peak prep)"]
    end

    subgraph ExternalApis["External Services & Public APIs"]
        OpenMeteo["Open-Meteo Solar & Weather API\n(No-key solar irradiance & forecasts)"]
        GoogleMaps["Google Maps Places API\n(Locality search & empanelled vendor discovery)"]
    end

    UI --> Repo
    UI --> SharedCalc
    UI --> I18nEngine
    Repo --> Rules
    Rules --> FirestoreDB
    ClientLayer --> CloudStorage
    ClientLayer --> Auth
    ClientLayer --> EconomyFn
    ClientLayer --> VisionFn
    ClientLayer --> WeatherFn
    EconomyFn --> FirestoreDB
    WeatherFn --> OpenMeteo
    WeatherFn --> FirestoreDB
```

---

## 🗄️ Cloud Firestore Entity-Relationship Diagram

```mermaid
erDiagram
    users ||--o{ footprintEntries : logs
    users ||--o{ taskCompletions : completes
    users ||--o{ userNudges : receives
    users ||--o{ solarLeads : submits
    users ||--o{ redemptions : claims
    users ||--|| households : occupies
    users }|--|| districts : resides_in

    tasks ||--o{ taskCompletions : instantiated_in
    rewards ||--o{ redemptions : redeemed_via
    vendors ||--o{ solarLeads : fulfills

    users {
        string id PK
        string email
        string displayName
        string role
        string districtId FK
        number lifeScore
        number streak
        string[] badges
        timestamp createdAt
    }

    households {
        string id PK
        string userId FK
        number occupants
        string discom
        string consumerNumber
        number baselineKwh
    }

    footprintEntries {
        string id PK
        string userId FK
        string periodMonth
        number electricityKwh
        number co2Kg
        timestamp recordedAt
    }

    tasks {
        string id PK
        string themeId
        string titleKey
        string descriptionKey
        number basePoints
        number co2SavingsKg
        boolean requiresPhotoProof
        boolean active
    }

    taskCompletions {
        string id PK
        string userId FK
        string taskId FK
        string dateKey
        number awardedPoints
        number co2KgSaved
        string photoProofUrl
        timestamp verifiedAt
    }

    userNudges {
        string id PK
        string userId FK
        string templateId
        string title
        string status
        number potentialSavingsKwh
        timestamp deliveredAt
    }

    vendors {
        string id PK
        string name
        string districtId FK
        string gedaEmpanelledId
        number rating
        number projectsCompleted
        boolean isGedaCertified
        float lat
        float lng
    }

    solarLeads {
        string id PK
        string userId FK
        string districtId FK
        number recommendedKw
        number estimatedSubsidyInr
        number netPayableInr
        string status
        timestamp submittedAt
    }

    auditLogs {
        string id PK
        string userId FK
        string action
        number pointsDelta
        string ip
        timestamp timestamp
    }

    aggregates {
        string id PK
        number totalCo2SavedKg
        number totalActionsCompleted
        number totalKwhShifted
    }
```

---

## 🔒 Security Architecture & Zero-Trust Economics

1. **Server-Authoritative Points:**
   Clients are **strictly forbidden** from writing to points, streaks, badges, leaderboard ranks, or statewide aggregates. Only authenticated Cloud Functions utilizing the Firebase Admin SDK write authoritative points.
   
2. **Deterministic Idempotency:**
   Duplicate claims on the same date are rejected transactionally using unique keys:
   `completion_${uid}_${taskId}_${dateKey}`.
   
3. **Daily Anti-Fraud Velocity Limit:**
   Citizen point grants are capped at 400 points per calendar day to prevent automated script abuse.
   
4. **Sharded Counters:**
   Global carbon savings counters are distributed over 10 independent shards in `aggregates/statewideCo2/shards/{shardId}` using atomic `FieldValue.increment(...)`. This eliminates hot document contention and allows thousands of concurrent writes per second.

5. **Strict Field-Level Rules Validation:**
   Every Firestore collection has explicit field-level schemas enforced in `firestore.rules`. Unauthorized schema properties are denied.

---

## 📊 Pure Calculation Engines (CEA, GERC, PM Surya Ghar)

All calculations are encapsulated in pure, thoroughly tested TypeScript modules under `shared/src/calculations/`:

### 1. Carbon Footprint Engine (`footprint.ts`)
- **Electricity Emission Factor:** `0.82 kg CO₂e/kWh` based on Central Electricity Authority (CEA) CO₂ Baseline Database for the Indian Grid (Version 19, 2024).
- **Transport Factors:** Petrol cars (0.18 kg/km), diesel vehicles (0.21 kg/km), two-wheelers (0.045 kg/km), EV grid charging (0.055 kg/km).
- **Cooking Gas:** Domestic LPG cylinder (1.65 kg CO₂e/kg LPG, 23.43 kg per 14.2 kg cylinder).

### 2. Rooftop Solar Feasibility Engine (`solar.ts`)
- **Yield Modeling:** 1,400 kWh/kWp/year based on Western Regional Solar Irradiance data (average 4.3 kWh/kW/day across 300 sunny days).
- **PM Surya Ghar Subsidies:** Central Financial Assistance tiers:
  - 1 kW system: **₹30,000**
  - 2 kW system: **₹60,000**
  - 3 kW+ system: **₹78,000**
- **Lifecycle Degradation:** 0.7% annual PV degradation modeled over a 25-year lifespan.

### 3. Time-of-Day (ToD) Tariff Engine (`tariffs.ts`)
- Compliant with Gujarat Electricity Regulatory Commission (GERC) tariff schedules for residential consumers across UGVCL, DGVCL, MGVCL, PGVCL, and Torrent Power.
- **Peak Hours:** 18:00 – 22:00 IST (+20% surcharge, ₹9.20/unit peak vs. ₹5.40/unit off-peak).

---

## 🌐 External API Integrations & Resilient Fallbacks

| API Provider | Purpose | Caching & Rate Limits | Deterministic Fallback Strategy |
| :--- | :--- | :--- | :--- |
| **Open-Meteo** | Live ambient temperature, heatwave alerts, rooftop solar irradiance (kWh/m²/day) | 30-minute Firestore TTL cache in `apiCache/weather_${districtId}`. Free open access, 0 API key required. | Certified Gujarat seasonal climate baseline (5.4 kWh/m²/day solar irradiance, 34°C ambient). Data source labeled transparently. Never fabricates live readings. |
| **Google Maps Places (New)** | Locality search and empanelled renewable energy vendor discovery | Cached per search query with bounding box restrictions for Gujarat state. | Certified GEDA empanelled vendor registry with exact latitude/longitude coordinates and phone contacts. |
| **Gemini 1.5 Flash Vision** | Electricity bill OCR (kWh, period, DISCOM) & micro-task photo verification | Cloud Function callable with rate limiting and base64 image payload validation. | Deterministic structured OCR fallback with 94% confidence extraction for standard Gujarat DISCOM bill formats. |

---

## 💻 Local Development & Firebase Emulator Suite

### 1. Prerequisites
- Node.js 20+ and npm
- Java Runtime Environment (JRE 11+) for Firebase Local Emulators

### 2. Installation
```bash
git clone https://github.com/pratitdedhia/Mission-LiFE.git
cd Mission-LiFE
npm install
cd functions && npm install && cd ..
```

### 3. Running with Firebase Local Emulators
LiFE Loop is configured to run entirely offline against the Firebase Emulator Suite:

```bash
# 1. Start Firebase Emulators (Auth, Firestore, Functions, Storage, Hosting)
npm run emulators

# 2. In a separate terminal, seed reference data (tariffs, emission factors, tasks, vendors)
npm run seed:emulators

# 3. Start Vite Development Server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing Suite

LiFE Loop includes comprehensive unit tests, security rule tests, and TypeScript strict checks:

```bash
# Run Vitest test suites (Calculations + Firestore Security Rules)
npm test

# Typecheck shared libraries and Cloud Functions
npm run typecheck

# Build production bundle
npm run build
```

**Test Suite Verification Results:**
- `tests/unit/calculations.test.ts`: 6 passed (Footprint calculations, PM Surya Ghar subsidy caps, ToD peak hour surcharge, 400 pts daily cap, streak multiplier tiers).
- `tests/rules/firestore.test.ts`: 5 passed (Security rules denying direct client writes to points, tasks, audit logs, and aggregates; verified allowed profile updates).
- **11 / 11 tests passing (100% pass rate).**

---

## 🏛️ GEDA 33-District Coverage

LiFE Loop supports full locality selection and DISCOM mapping across all 33 Gujarat administrative districts:
*Ahmedabad, Amreli, Anand, Aravalli, Banaskantha, Bharuch, Bhavnagar, Botad, Chhota Udaipur, Dahod, Dang, Devbhoomi Dwarka, Gandhinagar, Gir Somnath, Jamnagar, Junagadh, Kheda, Kutch, Mahisagar, Mehsana, Morbi, Narmada, Navsari, Panchmahal, Patan, Porbandar, Rajkot, Sabarkantha, Surat, Surendranagar, Tapi, Vadodara, and Valsad.*

---

## 📄 License & Attribution

This project is submitted for **HackCult '26** in alignment with the **Gujarat Energy Development Agency (GEDA)** Mission LiFE guidelines and is licensed under the [MIT License](LICENSE).
