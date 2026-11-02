# Mission LiFE (LiFE Loop) : Pitch Deck Outline
### Gujarat Energy Development Agency (GEDA) • Problem Statement HC26-GEDA01
**Target Track:** Green Energy & Sustainability | **Product:** Mission LiFE (LiFE Loop)

---

## Slide 1: Title & The Mission LiFE Challenge
- **Title:** Mission LiFE: Closing the Citizen Action Loop for Gujarat Energy Development Agency
- **Tagline:** Turning abstract sustainability into daily, measurable habits across 33 Gujarat districts.
- **Problem Statement ID:** HC26-GEDA01
- **The Core Problem:** Citizens care about climate goals, but abstract advice fails to drive sustained action without clear feedback loops, transparent tariff savings, and simple onboarding for PM Surya Ghar rooftop solar.

---

## Slide 2: The Core Thesis — The 5-Stage Closed Loop
- **Visual:** Circular Loop Diagram
  1. **Measure:** Questionnaire and appliance inventory establish an empirical baseline (0.71 kg CO₂/kWh per CEA v20.0).
  2. **Nudge:** Live Time-of-Day (ToD) tariff alerts & weather nudges in Asia/Kolkata timezone (18:00 - 22:00 IST peak).
  3. **Act:** Micro-tasks across the 7 official Mission LiFE themes.
  4. **Verify:** Dual verification: student ID cards verified by Campus Leaders; hardware telemetry audited with API keys.
  5. **Reward & Report:** Points, digital certificates, and statewide multi-tier Insights dashboards for GEDA administration.

---

## Slide 3: Appliance Scanner & Empirical Home Baseline
- **Capabilities:**
  - Interactive questionnaire calculates household baseline across electricity, transport, cooking, water, and waste.
  - Appliance Inventory tracks connected loads (inverter ACs, frost-free refrigerators, washing machines).
  - YOLOv8 edge vision scanner detects appliances with an honest fallback when hardware is outside standard COCO classes.
  - Standardized on **0.71 kg CO₂/kWh** (Central Electricity Authority Baseline Database v20.0, Dec 2024).

---

## Slide 4: Real-Time Grid Load Shifting (ToD Tariff Economics)
- **Problem:** Peak grid demand between 18:00 – 22:00 IST strains the Gujarat grid, triggering high-cost thermal peaker generation.
- **Solution:** Mission LiFE dynamically alerts residential consumers to defer high-wattage loads (washing machines, dishwashers, pumps) to off-peak hours.
- **Strict Timezone Handling:** Nudge evaluations run in Asia/Kolkata time, inclusive at 18:00 and exclusive at 22:00 IST.
- **Citizen Incentive:** Saves on electricity bills under GERC Time-of-Day domestic tariffs while reducing peak coal burn.

---

## Slide 5: PM Surya Ghar Feasibility & Empanelled Installer Connect
- **Capabilities:**
  - Dynamic solar sizing based on monthly electricity units and rooftop shadow-free area.
  - Central Financial Assistance (CFA) modeling (₹30,000 / ₹60,000 / ₹78,000 subsidy tiers under PM Surya Ghar).
  - 25-year financial projection with panel degradation (0.7%/year) and GERC net-metering.
  - 1-click lead dispatch to GEDA-certified empanelled installers with official reference code.

---

## Slide 6: Multi-Stakeholder Ecosystem Architecture
- **5 Dedicated Roles in One Unified Platform:**
  1. **Residential Citizen:** Daily challenges, solar feasibility calculator, appliance inventory, verifiable certificate.
  2. **Student Volunteer:** Campus eco-squad participation, ID verification workflow, departmental contribution.
  3. **Campus Youth Leader:** Fellowship portal, student ID verification ledger, campus sprint management.
  4. **Empanelled Solar Partner:** Live rooftop leads queue, site survey scheduling, subsidy quotations.
  5. **GEDA State Administrator:** Multi-district aggregate metrics, ToD peak load compliance, certified CSV audit logs.

---

## Slide 7: Technical Architecture & Rigor (Judging Weight: 40%)
- **Unified Emission Standard:** Single source of truth for grid emission factor (0.71 kg CO₂/kWh) across frontend, microservice, and tests.
- **Hardened Security Rules:** Firestore rules enforce ownership, field bounds on points, and restrict verification updates to authorized campus leaders/admins.
- **IoT Hardware Telemetry Bridge:** ESP32 sketch and Wokwi simulation post to `/api/hardware` with `X-Device-Api-Key` authentication and Pydantic validation.
- **Automated Testing:** Passing Vitest test suite covering RBAC routing, static security rules analysis, calculations, and nudge evaluation.

---

## Slide 8: UI/UX & High-Standard Accessibility (Judging Weight: 20%)
- **Design Philosophy:** Institutional, accessible, clean Light Mode default with global dark mode synchronization.
- **Multilingual Inclusivity:** Full i18n support in English, Gujarati (ગુજરાતી), and Hindi (हिन्दी).
- **Privacy First:** Departmental aggregates protect individual student privacy; simulated Wokwi data is tagged to protect official audit integrity.

---

## Slide 9: Scalability & Cloud Cost Economics
- **Route-Level Code Splitting:** `React.lazy` and `Suspense` for all dashboards keep initial bundle size lightweight.
- **Seeded Reference Architecture:** Idempotent database seeder (`scripts/seed.ts`) populates emission factors, tariffs, subsidy tiers, and demo profiles.
- **Durable Logging:** Concurrency-safe telemetry buffer with disk store and Firestore persistence.

---

## Slide 10: State Impact & The Road to 2030
- **Projected Impact across Gujarat:**
  - 100,000 households shifting 2 kWh daily from peak hours = **200 MWh/day peak thermal avoided**.
  - 25,000 rooftop solar inquiries converted = **75 MW clean distributed capacity**.
  - Verifiable digital Mission LiFE certificates driving genuine behavioral change.
- **Call to Action:** Mission LiFE is live, tested, and ready for deployment with GEDA.
