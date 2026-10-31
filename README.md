# LiFE+ : Mission LiFE Citizen Engagement Platform
### Gujarat Energy Development Agency (GEDA) • HackCult '26
**Problem Statement ID: HC26-GEDA01 | Track: Green Energy & Sustainability | Category: Software**

[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v11.3-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![GEDA](https://img.shields.io/badge/GEDA-Mission%20LiFE-047857?style=for-the-badge&logo=leaf&logoColor=white)](https://geda.gujarat.gov.in/)

> **Product Promise:** *“Mission LiFE turns sustainability from something citizens know about into something they do every day.”*

---

## 🌍 Executive Summary

**Mission LiFE (Lifestyle for Environment)** is an India-led global mass movement to mobilise individuals for climate-friendly daily habits. While public awareness of climate change is high, citizens encounter substantial friction translating knowledge into daily domestic energy conservation.

Developed for the **Gujarat Energy Development Agency (GEDA)**, **LiFE+** is an interactive, role-based, production-ready web application designed specifically for Gujarat's residential consumers, campus youth squads, empanelled solar installers, and state administrators. It turns abstract sustainability into a transparent, gamified behavior-change loop:

$$\text{User Profile \& Baseline} \longrightarrow \text{Personalized Nudge} \longrightarrow \text{Accept Mission} \longrightarrow \text{Photo Verification} \longrightarrow \text{Points \& CO}_2 \text{ Impact} \longrightarrow \text{Community Progress}$$

---

## 👥 Role-Based Portals & Quick Demo Credentials

LiFE+ features a role-based access management portal with quick one-click demo presets:

| Role | Demo Identity | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **🌱 Citizen** | Pooja Patel *(Ahmedabad)* | `citizen.pooja@gujaratlife.in` | `Password123!` | Energy footprint tracker, AC 26°C challenge, rooftop solar calculator, Mission LiFE certificate |
| **🎓 Campus Leader** | Aarav Mehta *(IIT Gandhinagar)* | `campus.aarav@iitgn.ac.in` | `Password123!` | Campus Squad Hub, Inter-Hostel AC sprint, zero-waste mess challenge, Gujarat Campus League (#1) |
| **☀️ Solar Partner** | Rajesh Shah *(Surya Urja Solutions)* | `vendor.rajesh@suryaurjagujarat.in` | `Password123!` | GEDA Empanelled Installer Portal, live citizen rooftop leads queue, site survey booking, subsidy quotes |
| **🏛️ State Admin** | Dr. Neha Joshi *(GEDA Energy Directorate)* | `admin.neha@geda.gujarat.gov.in` | `Password123!` | 33-district monitoring heatmap, Time-of-Day (ToD) peak grid compliance %, statewide CSV export |

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Application (React 19 + Vite + Tailwind CSS v4)"]
        UI["Modern Responsive UI\n(Light & Dark Mode)"]
        AuthModal["Role-Based Auth Portal\n(Citizen / Campus / Vendor / Admin)"]
        
        subgraph Dashboards["Role-Tailored Portals"]
            CitizenView["Citizen Companion View\n(Footprint, Nudges, Solar, Badges)"]
            CampusView["Campus Youth Squad Hub\n(Inter-Hostel Sprints & League)"]
            VendorView["Solar Partner Leads Portal\n(Surveys, Subsidy Quotes, Net-Metering)"]
            AdminView["GEDA State Command Center\n(33 Districts, ToD Peak Load, CSV Audit)"]
        end
        
        subgraph Engines["Core Application Engines"]
            FootprintEngine["Footprint & Energy Baseline Engine"]
            SolarEngine["Rooftop Solar & PM Surya Ghar CFA Engine"]
            CertEngine["Verifiable Canvas Certificate Generator"]
            AIEngine["LiFE AI Energy & Habit Coach"]
        end
    end

    subgraph DataServices["Resilient Data & Sync Layer"]
        AuthService["Authentication Service\n(Firebase Auth + Offline Fallbacks)"]
        FirestoreService["Firestore Service\n(Live Data Sync with Local Persistence)"]
        StorageService["Firebase Storage Service\n(Task Photo Proofs & Badges)"]
    end

    subgraph FirebaseCloud["Google Firebase Cloud Infrastructure"]
        FBAuth["Firebase Authentication\n(Email/Password, Anonymous, Profiles)"]
        FBDb["Cloud Firestore\n(users, footprints, solarInquiries, feedPosts)"]
        FBStorage["Firebase Storage\n(hackcult-f9a20.firebasestorage.app)"]
        FBHosting["Firebase Hosting\n(Global CDN Edge Distribution)"]
    end

    UI --> AuthModal
    AuthModal --> Dashboards
    Dashboards --> Engines
    Engines --> DataServices
    DataServices --> FBAuth
    DataServices --> FBDb
    DataServices --> FBStorage
```

---

## 🚀 Key Features End-to-End

### 1. 👣 Personalized Footprint Tracker
* **Multi-Vector Domestic Assessment:** Calculates residential electricity (kWh), air-conditioner hours, vehicle commute, LPG cylinders, water consumption, and waste segregation.
* **Gujarat Residential Benchmark:** Measures citizen delta against the Gujarat urban average (428 kg vs. 510 kg CO₂e/month) and national targets.
* **Vector Breakdown:** Interactive visual distribution across Energy, Transport, Cooking Gas, Water, and Waste.
* **Editable Gujarat Localities:** Editable local data across all 33 Gujarat districts (Ahmedabad, Surat, Vadodara, Gandhinagar, Rajkot, Bhavnagar, Kutch, etc.) and major DISCOMs (UGVCL, DGVCL, MGVCL, PGVCL, Torrent Power).

### 2. ⚡ Real-Time Smart Grid Time-of-Day (ToD) Nudges
* **Live Grid Peak-Hour Alert:** Dynamic header indicator alerting users during peak grid hours (**18:00 – 22:00 IST**) to shift heavy loads (washing machines, EV chargers, water pumps) to prevent thermal peaker coal generation.
* **7 Official Mission LiFE Themes:**
  1. *Save Energy* (AC setpoint at 26°C+, phantom standby switch-off, BLDC fans).
  2. *Save Water* (Bucket baths, tap aerators, greywater recycling).
  3. *Reduce Single-Use Plastic* (Cloth shopping totes, refillable bottles).
  4. *Sustainable Food Habits* (Millet meals, zero food waste).
  5. *Waste Segregation & Composting* (Wet/dry segregation, home composting).
  6. *Healthy & Green Lifestyle* (Bicycle commute under 3 km, taking stairs).
  7. *E-Waste Management* (Authorised collection and drop-off points).
* **Photo Proof Verification:** Citizens upload photo evidence to **Firebase Storage** (e.g. AC thermostat display, cloth bag) with verification notes.

### 3. ☀️ Rooftop Solar Feasibility & PM Surya Ghar Subsidy Engine
* **Automated Solar Sizing:** Calculates recommended kWp capacity, annual units generated, and required roof area.
* **Financial Model & Subsidies:** Models Central Financial Assistance (CFA) under **PM Surya Ghar: Muft Bijli Yojana** (up to ₹78,000 for 3 kW+) with accelerated payback period (~3.4 years).
* **Direct Lead Generation:** Citizens can submit an inquiry directly to Cloud Firestore with an official reference code (`GEDA-SOLAR-XXXXXX`).

### 4. 🛠️ GEDA Empanelled Solar Partner Portal (`solar_vendor`)
* **Dedicated Installer Dashboard:** Built for authorised Gujarat solar vendors (Surya Urja Solutions Gujarat).
* **Live Inquiries Queue:** Instant access to citizen solar feasibility leads (`solarInquiries` Firestore collection).
* **Site Survey Scheduler:** Book field inspection dates, time slots, and assign certified field engineers.
* **Subsidy Quote Generator:** Automatically computes net payable amount after GEDA/MNRE CFA subsidies and sends quote updates.
* **Net-Meter Tracker:** Manages lifecycle status from *Site Survey Pending* → *Quote Dispatched* → *Net-Meter Approved* → *Installed*.

### 5. 🎓 Campus Youth Squad Hub (`campus_leader`)
* **Inter-Hostel AC 26°C Challenge:** Hostels compete to keep thermostats at 26°C and avoid peak-hour laundry.
* **Zero-Waste Dining Mess Campaign:** Tracks organic food waste diverted to campus biogas plants.
* **Campus Sprint Broadcaster:** Youth leaders broadcast new eco-challenges to 420+ student volunteers.
* **Gujarat Inter-Campus League:** Live leaderboard ranking IIT Gandhinagar, NMIMS, PDEU, LDCE, and MSU Baroda.

### 6. 📜 Mission LiFE Citizen Pledge & Verifiable Certificate
* Built-in pledge modal where citizens make a formal commitment to sustainable living.
* Dynamic digital certificate generator rendered using HTML5 Canvas with citizen name, city, unique verification ID (`GEDA-LIFE-2026-AHM-8821`), and official seal, downloadable as a high-resolution PNG.

### 7. 🏛️ GEDA State Command Center (`admin`)
* **33-District Oversight:** Heatmap and rankings of energy savings across all Gujarat districts.
* **Time-of-Day (ToD) Compliance:** Real-time residential peak load shift metrics.
* **1-Click Audit Export:** Generates official CSV audit reports for GEDA and state regulatory compliance.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 6, Modern Functional Components & Hooks |
| **Styling & Design** | Tailwind CSS v4, Custom CSS Variables, Dark / Light Theme System |
| **Icons & Visuals** | Lucide React, Canvas Confetti |
| **Authentication** | Firebase Authentication (Email/Password, Anonymous Guest Auth) |
| **Database** | Cloud Firestore (NoSQL Document Store with Offline Persistence) |
| **Media Storage** | Firebase Storage (Photo proofs and certificates) |
| **Analytics** | Firebase Analytics (Defensive Initialization) |
| **Internationalization** | English (EN), Hindi (HI), Gujarati (GU), Marathi (MR) |

---

## ⚙️ Firebase Setup & Configuration

The application uses the Firebase JavaScript modular SDK (v11.3):

```ts
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAFOm7HLfYxob_v2CWH6urwCgs6LqqJrtQ",
  authDomain: "hackcult-f9a20.firebaseapp.com",
  projectId: "hackcult-f9a20",
  storageBucket: "hackcult-f9a20.firebasestorage.app",
  messagingSenderId: "640710734480",
  appId: "1:640710734480:web:f494e272fad279c9afde15",
  measurementId: "G-XCGCXXSN2V"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### Firestore Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Storage Security Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /proofs/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 🌐 External API Integrations Specification

Complete documentation is available in [`docs/API_INTEGRATIONS.md`](docs/API_INTEGRATIONS.md).

| Integration | Endpoint / Provider | Environment Variables | Feature Powered & Fail-Safe Behavior |
| :--- | :--- | :--- | :--- |
| **🌤️ OpenWeather** | OpenWeatherMap API | `VITE_OPENWEATHER_API_KEY` | Real-time ambient heat alerts & rooftop solar irradiance ($5.4\text{ kWh/m}^2/\text{day}$). 30-min cache; transparently falls back to seasonal Gujarat climate baseline on missing key or 429 quota. Never fabricates live readings. |
| **🗺️ Maps & Places** | Google Maps Platform Places API (New) | `VITE_GOOGLE_MAPS_API_KEY` | Locality search for sustainable energy providers. Strict visual demarcation between **GEDA Empanelled Vendors** and unverified public map search results. Supports manual entry; device GPS is optional. |
| **⚡ Gamification Engine** | Cloud Firestore + Atomic Verification | `VITE_FIREBASE_*` | Authoritative scoring (30–80 pts base + 25 pts photo proof + up to 25% streak multiplier). Deduplicates daily claims via idempotent date keys and enforces a 300 pts/day cap. |
| **🤖 Adaptation Platform** | Hackathon Adaptation AI Platform ($500 Credits) | `VITE_ADAPTION_API_KEY`<br>`VITE_ADAPTION_MODEL`<br>`VITE_ADAPTION_ENDPOINT` | Provider interface with standardized dataset schema (`adaptation_dataset_schema.json`). Cleanly delegates to certified `DeterministicGEDAEngine` when cloud endpoint is unconfigured. |

---

## 💻 Getting Started Locally

### Prerequisites
* Node.js 18+ and npm installed

### 1. Clone the Repository
```bash
git clone https://github.com/pratitdedhia/Mission-LiFE.git
cd Mission-LiFE
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 📄 License

This project is developed for the **HackCult '26 Hackathon** in alignment with the **Gujarat Energy Development Agency (GEDA)** Mission LiFE guidelines and is licensed under the [MIT License](LICENSE).
