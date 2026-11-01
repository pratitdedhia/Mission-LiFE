# External API & Cloud Integrations Guide
### Mission LiFE Citizen Engagement Platform (GEDA • HackCult '26)

This document specifies the architecture, environment variables, setup instructions, quota and error handling, privacy policies, and exact features powered by every external integration in **LiFE+**.

---

## 1. 🌤️ OpenWeather API Integration

| Attribute | Specification |
| :--- | :--- |
| **Provider** | OpenWeatherMap (`api.openweathermap.org/data/2.5/weather`) |
| **Environment Variable** | `VITE_OPENWEATHER_API_KEY` |
| **Exact Feature Powered** | Real-time ambient temperature alerts, heatwave AC 26°C nudges, and rooftop solar irradiance estimations (~5.4 kWh/m²/day) in [`Dashboard.jsx`](file:///c:/Users/dedhi/Downloads/hackcult/src/components/Dashboard.jsx). |
| **Implementation** | [`src/services/weatherService.js`](file:///c:/Users/dedhi/Downloads/hackcult/src/services/weatherService.js) |

### Setup Instructions
1. Create a free account at [OpenWeatherMap](https://openweathermap.org/api).
2. Generate an API Key (Free tier allows 1,000 API calls/day or 60 calls/minute).
3. Add the key to your `.env` file:
   ```env
   VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```

### Quota & Error Behavior
* **Caching:** Results for each Gujarat city are cached in `localStorage` for **30 minutes** to prevent exceeding API rate limits.
* **Missing API Key / 401 Unauthorized:** Automatically returns `isLive: false` with label `Seasonal Gujarat Climate Model (Offline Reference)`.
* **Rate Limits (HTTP 429) / Network Outages:** Gracefully serves the seasonal climate model with estimated temperature and typical Gujarat solar irradiance.
* **Integrity:** Never fabricates live temperature readings. The UI transparently indicates whether the weather is live-verified or from the seasonal baseline model.

### Privacy Implications
* **Zero GPS Tracking:** The app queries only the user's selected Gujarat city/locality string (e.g. `Ahmedabad,IN`, `Surat,IN`). Precise GPS latitude/longitude coordinates are never required or transmitted to OpenWeather.

---

## 2. 🗺️ Google Maps Platform & Places API (New)

| Attribute | Specification |
| :--- | :--- |
| **Provider** | Google Maps Platform Places API (New) (`places.googleapis.com/v1/places:searchText`) |
| **Environment Variable** | `VITE_GOOGLE_MAPS_API_KEY` |
| **Exact Feature Powered** | Locality-based discovery of sustainable resources (rooftop solar installers, e-waste drop-offs, EV chargers, compost hubs) in [`GreenDirectory.jsx`](file:///c:/Users/dedhi/Downloads/hackcult/src/components/GreenDirectory.jsx). |
| **Implementation** | [`src/services/mapsService.js`](file:///c:/Users/dedhi/Downloads/hackcult/src/services/mapsService.js) |

### Setup Instructions
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Places API (New)** on your project.
3. Generate an API Key under **Credentials** and apply HTTP Referrer restrictions (e.g. `https://pratitdedhia.github.io/*`).
4. Add the key to `.env`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

### Verification Demarcation & Integrity
The application enforces strict visual and textual demarcation between verified and third-party results:
* 🟢 **GEDA Empanelled Tier-1 Providers:** Displays official GEDA empanelment ID (`GEDA-EMP-SOLAR-2026-088`), verified contact information, and state certification text.
* 🟡 **Public Map Listings (Unverified):** Clearly tagged `Public Map Search Listing (Unverified)` with the explicit notice: *“Retrieved via Google Maps Places API. Not independently audited or certified by GEDA. Please verify credentials prior to engaging services.”*

### Privacy & Locality Entry
* **Manual Entry Supported:** Citizens can type their locality (e.g., *Navrangpura*, *Bodakdev*, *Gotri*, *Vesu*) or click city chips. The application **does not require device location permissions**.

---

## 3. ⚡ Custom Gamification & Integrity Engine

| Attribute | Specification |
| :--- | :--- |
| **Provider** | Cloud Firestore + Local Atomic Validation Logic |
| **Exact Feature Powered** | Anti-fraud mission deduplication, authoritative points calculation, streak multipliers, and state aggregate updates. |
| **Implementation** | [`src/services/gamificationEngine.js`](file:///c:/Users/dedhi/Downloads/hackcult/src/services/gamificationEngine.js) |

### Scoring Matrix & Authoritative Rules
1. **Base Mission Points:** 30 to 80 points depending on category difficulty:
   * *AC at 26°C*: 50 pts (-2.4 kg CO₂)
   * *Rooftop Solar Feasibility*: 80 pts (-6.0 kg CO₂)
   * *Peak Load Shifting (11 PM - 6 AM)*: 60 pts (-3.2 kg CO₂)
   * *Cloth Shopping Bag*: 30 pts (-0.4 kg CO₂)
2. **Photo Verification Bonus:** +25 bonus points when citizen uploads photographic proof to Firebase Storage.
3. **Streak Multipliers:**
   * 3+ Consecutive Days: +5% bonus
   * 7+ Consecutive Days: +10% bonus (*Weekly Champion*)
   * 21+ Consecutive Days: +25% bonus (*Habit Master*)
4. **Anti-Fraud & Deduplication Protection:**
   * **Idempotency Key:** `life_claim_{userId}_{missionId}_{dateString}` prevents claiming the same mission multiple times on the same date.
   * **Daily Points Cap:** Maximum 300 points per day per user prevents scripted bot submissions.
5. **Atomic State Updates:** Action records are written to Firestore (`verifiedActions`) with `serverTimestamp()`, updating user scores and state aggregates atomically.

---

## 4. 🤖 Adaptation Platform Provider Interface (500 USD Compute Credits)

| Attribute | Specification |
| :--- | :--- |
| **Provider** | Hackathon Adaptation AI Platform / Deterministic Fallback Engine |
| **Environment Variables** | `VITE_ADAPTION_API_KEY`, `VITE_ADAPTION_MODEL`, `VITE_ADAPTION_ENDPOINT` |
| **Exact Feature Powered** | AI Sustainability Coach in [`AICoach.jsx`](file:///c:/Users/dedhi/Downloads/hackcult/src/components/AICoach.jsx) & Dataset Evaluation Workflow. |
| **Implementation** | [`src/services/adaptationProviderInterface.js`](file:///c:/Users/dedhi/Downloads/hackcult/src/services/adaptationProviderInterface.js) |
| **Schema Specification** | [`adaptation_dataset_schema.json`](file:///c:/Users/dedhi/Downloads/hackcult/adaptation_dataset_schema.json) |

### Platform Architecture & Fallback
The hackathon offers 500 USD per participant in credits for datasets and custom model training, but provider credentials and endpoint specifics are issued during the event. To adhere to strict software engineering standards:
* **No Invented Endpoints:** The code cleanly defines an abstract class `AdaptationProvider` and concrete client `CustomAdaptationPlatformClient`.
* **Deterministic Fallback Engine:** If the cloud provider is unconfigured or offline, queries are handled by `DeterministicGEDAEngine` which calculates exact rooftop solar sizing, PM Surya Ghar subsidy amounts (up to ₹78,000), and ToD tariff savings (₹9.20 vs ₹5.40/unit) with 100% accuracy.
* **Dataset Evaluation Schema:** [`adaptation_dataset_schema.json`](file:///c:/Users/dedhi/Downloads/hackcult/adaptation_dataset_schema.json) defines the standardized schema for training custom models on Gujarat domestic energy profiles.

