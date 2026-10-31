# Mission LiFE Citizen Engagement Platform
### Gujarat Energy Development Agency (GEDA) • HackCult '26
**Problem Statement 1 (HC26-GEDA01): Development of an Interactive "Mission LiFE" Citizen Engagement Application**

[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v11.3-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 🌍 Executive Summary

**Mission LiFE (Lifestyle for Environment)** is an India-led global mass movement to mobilise individuals for climate-friendly daily habits. While awareness is high, citizens face friction connecting macro climate targets to daily domestic behaviors.

Developed for **Gujarat Energy Development Agency (GEDA)**, this production-ready web application operationalises Mission LiFE into an engaging, verified, community-driven digital companion. It empowers residential citizens to calculate their baseline emissions, receive real-time grid peak-hour nudges, complete micro-tasks across the **7 official Mission LiFE themes**, model **PM Surya Ghar rooftop solar** potential, verify green actions with photo evidence, and compete on state/district leaderboards.

---

## 🏛 System Architecture

```mermaid
flowchart TD
    subgraph Frontend["Client Layer (React 19 + Vite + Tailwind v4)"]
        UI[Responsive Modern Interface]
        AuthUI[Firebase Auth Modal & Guest Demo]
        Tracker[Personal Footprint Tracker & History]
        Missions[7-Theme Micro-Tasks & Photo Proof]
        SolarCalc[Rooftop Solar & Subsidy Advisor]
        Community[Leaderboards & Peer Social Wall]
        AICoach[LiFE AI Sustainability Companion]
        AdminView[GEDA State Administrator Analytics]
        PledgeCert[Mission LiFE Certificate Engine]
    end

    subgraph Resilience["Resilient Data & Storage Abstraction"]
        DataLayer[Resilient Client Data Service]
        LocalCache[IndexedDB / LocalStorage Persistent Cache]
    end

    subgraph FirebaseCloud["Google Firebase Cloud Services"]
        FBAuth["Firebase Authentication\n(Email/Password, Anonymous, User Profiles)"]
        Firestore["Cloud Firestore\n(users, footprints, feedPosts, solarInquiries, verifiedActions)"]
        Storage["Firebase Storage\n(Task Photo Proofs, Social Feed Images)"]
        Analytics["Firebase Analytics\n(Defensive Web Metric Tracking)"]
    end

    UI --> DataLayer
    Tracker --> DataLayer
    Missions --> DataLayer
    SolarCalc --> DataLayer
    Community --> DataLayer
    DataLayer --> FBAuth
    DataLayer --> Firestore
    DataLayer --> Storage
    DataLayer --> LocalCache
```

---

## 🚀 Key Features

### 1. 👣 Personalised Footprint Tracker
- **Multi-Vector Assessment**: Measures residential electricity & AC runtime, commute & fuel type, cooking gas (LPG/Induction), water consumption, and waste segregation.
- **Improvement Over Time**: Visualizes historical trend across monthly logs, displaying verified decline in carbon footprint.
- **State Benchmark Comparison**: Real-time delta against the Gujarat urban residential average (510 kg CO₂e/month) and India national target (< 150 kg CO₂e/month).
- **Emissions Vector Breakdown**: Interactive stacked distribution across Energy, Transport, Gas, Water, and Waste.

### 2. ⚡ Real-Time Smart Grid Peak-Hour Nudges & Micro-Tasks
- **Gujarat DISCOM Grid Alert**: Dynamic time-of-day (ToD) indicator alerting users during evening peak hours (**18:00 – 22:00 IST**) to defer heavy loads (washing machines, EV chargers, water pumps) to prevent thermal peaker coal plant emissions.
- **7 Mission LiFE Themes Covered**:
  1. *Save Energy* (AC at 26°C+, phantom standby cutoff, LED retrofits)
  2. *Save Water* (Bucket baths, low-flow aerators, leak detection)
  3. *Reduce Single-Use Plastic* (Reusable cloth tote bags, stainless steel containers)
  4. *Sustainable Food* (Millets / Bajra-Jowar earth plate, zero food waste)
  5. *Waste Reduction & Composting* (Dual-bin source segregation, organic compost)
  6. *Healthy & Green Lifestyle* (Bicycle commute under 3 km, stair climbing)
  7. *E-Waste Management* (Authorized GEDA collection points)
- **Photo Evidence Verification**: Allows users to upload photo proof to **Firebase Storage** (e.g. thermostat set to 26°C or cloth shopping bag) to validate habits and earn points.

### 3. ☀️ Rooftop Solar Feasibility & PM Surya Ghar Subsidy Advisor
- **Automated Sizing Engine**: Computes required kW capacity based on monthly bill (₹), consumption (kWh), and shadow-free roof area (sq. ft).
- **Subsidies Calculator**: Central Financial Assistance (CFA) under **PM Surya Ghar: Muft Bijli Yojana** (up to ₹78,000 for 3 kW+) plus Gujarat state incentives.
- **Financial Projections**: Net investment cost, annual bill savings (₹), and accelerated payback period (typically 3.4 years).
- **Environmental Returns**: 25-year lifetime CO₂ offset (tonnes) and tree equivalent.
- **Empanelled Installer Callback**: Citizen inquiry form submitted directly to Cloud Firestore with an official reference code (`GEDA-SOLAR-XXXXXX`).

### 4. 🏆 Gamification, Multi-Tier Leaderboards & Social Wall
- **Points, Badges & Tiers**: *Prakriti Mitra*, *Urja Rakshak*, *Jal Samrakshak*, *Zero-Waste Champion*, and *Solar Ambassador*.
- **Multi-Level Leaderboards**:
  - Gujarat Districts (Ahmedabad, Surat, Gandhinagar, Vadodara, Rajkot, etc.)
  - Universities & Youth Squads (IIT Gandhinagar, NMIMS, PDEU, LDCE, MSU Baroda)
  - Individual Citizens with rank and active streaks.
- **Community Sprints**: Collective progress tracking (e.g. *Gujarat 200,000 kg CO₂ Avoided Sprint*).
- **Community Social Wall / Feed**: Real-time peer feed of completed green actions with photos, badges, and "👏 Kudos" interaction.

### 5. 📜 Mission LiFE Citizen Pledge & Certificate Generator
- Built-in pledge modal where citizens make a formal commitment to sustainable living.
- Dynamic digital certificate generator using HTML5 Canvas with the citizen's name, city, unique verification ID (`GEDA-LIFE-2026-AHM-XXXX`), and official GEDA seal, downloadable as a high-resolution PNG.

### 6. 🤖 AI Sustainability Coach (LiFE Companion)
- Integrated with Adaptation AI Platform (`deepseek-v4-flash`) and equipped with a deterministic local intelligence engine.
- Personalised context: Evaluates the citizen's actual monthly units, AC runtime, and peak footprint sources.
- Suggests immediate savings, quantified rupee reductions, and one-click action links.

### 7. 🏢 GEDA State Administrator View
- Built for state energy policymakers and municipal commissioners to monitor:
  - Aggregate statewide energy saved (GWh) and CO₂ mitigated (tonnes).
  - District compliance with Time-of-Day (ToD) off-peak energy consumption.
  - Rooftop solar installed capacity across Gujarat.
  - One-click **Export State CSV Report** for regulatory reviews.

---

## 🛠 Tech Stack

- **Framework**: React 19, Vite 6, Tailwind CSS v4
- **Icons & Visuals**: Lucide React, Canvas Confetti
- **Backend & Cloud**:
  - **Firebase Authentication** (Modular SDK v11.3)
  - **Cloud Firestore** (Real-time NoSQL document database)
  - **Firebase Storage** (User photo evidence uploads)
  - **Firebase Analytics** (Defensive initialization)
- **Internationalization**: English (EN), Hindi (HI), Gujarati (GU), Marathi (MR)

---

## ⚙️ Firebase Setup & Credentials

The application uses the Firebase JavaScript modular SDK configured with the provided project:

```ts
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
export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null
);
```

### Resilient Offline-First Data Architecture
To ensure seamless operation during demonstrations or hackathon judging, the application implements an automatic fallback architecture:
1. Every write and read operation interacts with live Firebase services (Auth, Firestore, Storage).
2. If the Cloud Firestore API or Firebase Auth has not yet been toggled active in the GCP console for this project, the data layer automatically falls back to an in-memory/IndexedDB/LocalStorage sync mechanism.
3. Once enabled in the Firebase console, the application connects to the cloud backend without requiring any code modifications!

---

## 🏃 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-repo>/hackcult.git
cd hackcult

# Install dependencies
npm install

# Start the Vite local development server
npm run dev
```

### Production Build
```bash
# Build production bundle with optimized chunking
npm run build

# Preview production build locally
npm run preview
```

---

## 👥 Authors & Acknowledgments

- **Organization**: Gujarat Energy Development Agency (GEDA)
- **Event**: HackCult '26
- **Track**: Track 1: Green Energy & Sustainability (HC26-GEDA01)
- Built with commitment to Mission LiFE principles: Mindful consumption over mindless destruction.
