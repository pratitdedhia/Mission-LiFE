# Mission LiFE: 5-Minute Live Demo Script for Judges
### Gujarat Energy Development Agency (GEDA) • Problem ID HC26-GEDA01
**Platform:** Mission LiFE (Tagline: *LiFE Loop*)

---

## ⏱️ Minute 0:00 – 0:45 | Introduction & The Mission LiFE Challenge
1. **Show:** Open the Public Landing Page (`https://pratitdedhia.github.io/Mission-LiFE/`).
2. **Narration:**
   > *"Good evening, judges. Mission LiFE is India’s flagship movement for environmentally conscious living. For GEDA problem statement HC26-GEDA01, we built **Mission LiFE (LiFE Loop)** — an institutional engagement platform that turns environmental knowledge into daily habits through five coordinated roles: Residential Citizen, Student Volunteer, Campus Youth Leader, GEDA Empanelled Solar Partner, and State Energy Administrator.*
   > *Every carbon metric in our platform is unified to 0.71 kg CO₂/kWh, strictly citing the Central Electricity Authority (CEA) Baseline Database v20.0 (December 2024)."*
3. **Action:** Point out institutional theme, multilingual selector (English, Gujarati, Hindi), and top identity tabs.

---

## ⏱️ Minute 0:45 – 1:30 | Baseline Calibration & Smart Home Inventory
1. **Show:** Click **"Citizen"** demo preset (Pooja Patel, Ahmedabad) or the **"Recalculate Energy Baseline"** button.
2. **Narration:**
   > *"A citizen’s journey starts with establishing an accurate carbon baseline. Citizens can input their monthly UGVCL/Torrent electricity bill or configure individual household appliances.
   > In 'My Appliances', citizens track high-draw devices like inverter ACs, frost-free refrigerators, and washing machines. Our Appliance Scanner leverages edge computer vision (YOLOv8) to identify appliances and compute standby duty cycles, with an honest manual catalog fallback when non-standard hardware is presented."*
3. **Action:** Demonstrate the Dynamic Baseline calculation and show category breakdown (Energy, Transport, Cooking, Water, Waste).

---

## ⏱️ Minute 1:30 – 2:30 | Live Hardware Telemetry & Asia/Kolkata Peak Nudges
1. **Show:** Dashboard live meter banner (`Wokwi ESP32 Smart Meter`).
2. **Narration:**
   > *"Now observe our real-time IoT hardware bridge. We have an ESP32 microcontroller sketch streaming live active wattage to our FastAPI microservice.
   > Notice our ToD nudge logic: the backend evaluates timestamps strictly in Asia/Kolkata time. Between 6:00 PM and 10:00 PM IST (inclusive at 18:00, exclusive at 22:00), high domestic loads trigger an alert to defer washing machines and pumps to off-peak green hours under GERC tariffs. Outside that window, high usage triggers a neutral load notice without false peak claims. Simulated Wokwi meter data is isolated with source tags to safeguard audit integrity."*
3. **Action:** Show the live reading card and peek behind the evaluation rules.

---

## ⏱️ Minute 2:30 – 3:30 | PM Surya Ghar Rooftop Solar & Installer Connect
1. **Show:** Navigate to **"Solar Rooftop Engine"** (`SolarAdvisor`).
2. **Narration:**
   > *"Next, the highest-impact action in Gujarat: Rooftop Solar under PM Surya Ghar Muft Bijli Yojana. Based on 280 units of monthly consumption, the engine sizes an optimal 3.0 kW system requiring 300 sq.ft of shadow-free rooftop.
   > It models central financial assistance (up to ₹78,000 subsidy), 25-year generation with panel degradation (0.7%/yr), and GERC feed-in tariffs. When the citizen requests a site audit, a lead is recorded with an official reference code."*
3. **Action:** Click "Request Callback / Quote" and show generated lead reference.

---

## ⏱️ Minute 3:30 – 4:30 | Student Verification, Campus Eco-Squads & Solar Portal
1. **Show:** Switch profile to **"Student Volunteer"** (Priyan Patel, IITGN) then **"Campus Leader"** (Aarav Mehta).
2. **Narration:**
   > *"Mission LiFE bridges campuses and communities. Students register with institutional ID cards and roll numbers. Campus Youth Leaders review pending verifications to prevent self-awarding of points.
   > Next, switch to the Empanelled Solar Partner portal: installers review verified leads, inspect roof capacity, and submit customized quotations.
   > Finally, the GEDA State Admin dashboard aggregates multi-district metrics with CSV export for state reporting."*
3. **Action:** Display campus verification ledger, student contribution graph, and solar pipeline stats.

---

## ⏱️ Minute 4:30 – 5:00 | Multi-Role Insights Engine & Engineering Rigor
1. **Show:** Navigate to the new **"Insights"** tab.
2. **Narration:**
   > *"Our new unified Insights Engine provides multi-tier analytics across all 5 profiles:
   > - Citizens see empirical kWh consumption and baseline savings (with Watts strictly separated from kWh).
   > - Students see personal impact and campus squad totals without privacy leaks.
   > - Campus Leaders compare departmental sprints without exposing private roll numbers.
   > - Solar Partners track the pipeline from enquiry to installation.
   > - State Admins view cross-role aggregated metrics across Gujarat districts.
   > All changes are backed by automated Vitest tests, hardened Firestore security rules, and clean modular code."*
3. **Action:** Switch between time filters (7 Days, 30 Days) and highlight responsive charts.
