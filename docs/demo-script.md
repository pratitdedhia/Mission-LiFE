# LiFE Loop : 5-Minute Live Demo Script for Judges
### Gujarat Energy Development Agency (GEDA) • Problem ID HC26-GEDA01

---

## ⏱️ Minute 0:00 – 0:45 | Introduction & The Problem Fit
1. **Show:** Start on the Public Landing Page (`https://pratitdedhia.github.io/Mission-LiFE/`).
2. **Narration:**
   > *"Good evening, judges. Mission LiFE is India’s flagship movement for sustainable living. But for millions of Gujarat households, sustainability remains abstract and disconnected from their monthly bills. For GEDA, problem statement HC26-GEDA01, we built **LiFE Loop** — an institutional, production-grade engagement engine turning knowledge into daily verified habits through a closed loop: Measure, Nudge, Act, Verify, Reward, and Report."*
3. **Action:** Point out the clean institutional Light Theme, language selector (English, Gujarati, Hindi), and 1-click role presets.

---

## ⏱️ Minute 0:45 – 1:30 | The Wow Moment: Instant Bill Scan to Baseline
1. **Show:** Click **"Citizen Quick Demo"** (Pooja Patel, Ahmedabad) or the **"Recalculate Energy Baseline"** modal.
2. **Narration:**
   > *"A citizen’s journey starts with measurement in under 30 seconds. Instead of filling cumbersome forms, citizens snap a picture of their electricity bill. Our Cloud Function with Gemini Vision OCR extracts the units (280 kWh), billing period, and DISCOM (UGVCL). Using Central Electricity Authority v19 factors (0.82 kg CO₂/kWh), we immediately compute their exact baseline: 228 kg CO₂/month, benchmarking them against the Ahmedabad urban average."*
3. **Action:** Click **"Recalculate Footprint"** to show instant dynamic charts and category breakdown.

---

## ⏱️ Minute 1:30 – 2:30 | Real-Time Time-of-Day Nudge & Photo Verification
1. **Show:** Dashboard smart grid banner & Daily Missions tab.
2. **Narration:**
   > *"Now comes the Nudge and Act stages. Notice our dynamic Time-of-Day banner: between 6 PM and 10 PM IST, the Gujarat grid experiences peak load from thermal peaker plants. Our platform nudges citizens to defer dishwashing and EV charging until after 10 PM, saving them ₹3.80/unit under GERC tariffs.
   > Now let's complete a challenge: AC at 24°C. We accept the mission and click 'Record Proof'. Citizens upload a photo of their thermostat. Our backend verifies the evidence and awards points authoritatively. Notice that clients can NEVER write points directly — all scoring is server-authoritative with anti-duplicate idempotency!"*
3. **Action:** Accept mission, simulate photo upload, see confetti and toast showing: `+75 pts (+10% streak multiplier), -2.0 kg CO₂ avoided`.

---

## ⏱️ Minute 2:30 – 3:30 | PM Surya Ghar Rooftop Solar & Installer Connect
1. **Show:** Navigate to **"Solar Rooftop Engine"** (`SolarAdvisor`).
2. **Narration:**
   > *"Next, the highest-impact action in Gujarat: Rooftop Solar. Based on their 280 units consumption, our engine calculates an optimal 3.0 kW array requiring 300 sq.ft of shadow-free roof. It automatically models the Central Financial Assistance under PM Surya Ghar: exactly ₹78,000 subsidy, bringing net investment down to ₹1,17,000 with a 4.3-year payback.
   > When the citizen clicks 'Request Callback', a lead is dispatched to Cloud Firestore with an official GEDA reference code."*
3. **Action:** Submit inquiry modal, show generated reference code `GEDA-SOLAR-XXXXXX`.

---

## ⏱️ Minute 3:30 – 4:30 | Empanelled Partner & GEDA State Command Center
1. **Show:** Click user profile menu → Switch to **"Solar Partner"** or **"GEDA State View"**.
2. **Narration:**
   > *"Let's look at the other side of the platform. Here is the Empanelled Solar Partner portal for Surya Urja Gujarat: the installer sees citizen leads in real-time, schedules physical shadow audits, and issues verified subsidy quotes.
   > And for state administrators, the GEDA Command Center aggregates data across all 33 Gujarat districts. Notice the sharded atomic counters in Firestore: hundreds of thousands of citizen actions aggregate with zero hot document contention, producing verifiable GWh and CO₂ reduction metrics for state reporting."*
3. **Action:** Show the 33-district rankings, Time-of-Day compliance graph, and click **"Export GEDA CSV Audit"**.

---

## ⏱️ Minute 4:30 – 5:00 | Engineering Rigor & Closing Summary
1. **Show:** Slide/README summary showing Architecture & ER diagrams.
2. **Narration:**
   > *"To conclude on technical execution: ZERO hardcoded business data — all tariffs and subsidy rules live in Firestore with official citations. Strict TypeScript everywhere with 100% passing Vitest test suites. Responsive, accessible Light and Dark modes. LiFE Loop is not a prototype; it is an enterprise-grade platform ready to roll out for GEDA across Gujarat. Thank you!"*

