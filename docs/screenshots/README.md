# Mission LiFE Judging Screenshots Specification (Phase 1)

This directory documents the 6 core judging screenshots required for HackCult '26 Track 1 (HC26-GEDA01) submission.

---

## Required Screenshots Overview

| # | Screen / Feature | Component / Route | What Judges Look For |
| :--- | :--- | :--- | :--- |
| **01** | **Citizen Dashboard & Live Telemetry** | `/` (Citizen View) | Live active wattage card, ToD Peak warning indicator, dynamic daily missions, and LifeScore badge. |
| **02** | **Multi-Role Insights Engine** | Insights Tab (Citizen / Student / Leader / Vendor / Admin) | Responsive SVG charts (Watts vs kWh distinction), time-range filter, role-based access isolation. |
| **03** | **PM Surya Ghar Solar Advisor** | Solar Calculator Tab | Feasibility calculator with 25-year payback projection, MNRE CFA subsidy calculation, vendor quotation cards. |
| **04** | **YOLOv8 Appliance Vision Scanner** | ML Scanner Modal (`/api/scan`) | Object detection bounding boxes, power rating estimation, carbon footprint impact, and tailored nudge. |
| **05** | **Collegiate Sustainability League** | Campus Leader / Student Portal | Inter-collegiate leaderboard, verified student action audit queue, carbon emissions offset by department. |
| **06** | **ESP32 Smart-Meter IoT Hardware Bridge** | Wokwi Simulator & Telemetry Log | Active Wokwi potentiometer circuit diagram, live HTTP telemetry dispatch, microservice ingestion log. |

---

## Screenshot Guidelines for Submission

1. **Resolution:** Minimum `1920x1080` (Full HD).
2. **Theme:** Capture in clean Light Mode or Dark Mode with high contrast.
3. **Data Freshness:** Ensure the data shows real telemetry from the Wokwi bridge or seeded Firestore collections.
4. **File Naming Convention:**
   - `01_citizen_dashboard_telemetry.png`
   - `02_multirole_insights_engine.png`
   - `03_solar_pm_surya_ghar.png`
   - `04_yolov8_appliance_scanner.png`
   - `05_campus_sustainability_league.png`
   - `06_esp32_wokwi_hardware_bridge.png`

