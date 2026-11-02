# Mission LiFE Official Regulatory Data Sources & Baseline Parameters

This document records the official regulatory citations, government orders, publication dates, and empirical parameters powering all carbon calculations, electricity tariffs, and solar subsidies across Mission LiFE.

---

## 1. Grid Carbon Emission Factors (National & Gujarat DISCOM)

| Parameter | Value | Official Regulatory Source | Publication Date | Status |
| :--- | :--- | :--- | :--- | :--- |
| **National Grid Emission Factor** | `0.71 kg CO2e / kWh` | Central Electricity Authority (CEA), Ministry of Power, Government of India: *CO2 Baseline Database for the Indian Power Sector, Version 20.0* | December 2024 | Audited & Verified |
| **LPG Combustion Factor** | `2.983 kg CO2e / kg` | Ministry of Petroleum and Natural Gas (MoPNG) / IPCC Guidelines for National Greenhouse Gas Inventories | 2023 | Verified |
| **Standard Domestic LPG Cylinder Weight** | `14.2 kg` | Indian Oil Corporation Limited (IOCL) / HPCL / BPCL standard domestic LPG cylinder specification | Current Standard | Verified |
| **Petrol Two-Wheeler Emission** | `0.048 kg CO2e / km` | Automotive Research Association of India (ARAI) Average Fleet Fuel Consumption Report | 2023 | Verified |
| **Four-Wheeler Petrol Emission** | `0.165 kg CO2e / km` | Central Pollution Control Board (CPCB) & ARAI Vehicular Emission Baseline | 2023 | Verified |
| **Four-Wheeler Diesel Emission** | `0.185 kg CO2e / km` | Central Pollution Control Board (CPCB) | 2023 | Verified |
| **CNG Passenger Vehicle** | `0.125 kg CO2e / km` | Petroleum Conservation Research Association (PCRA) | 2023 | Verified |
| **Electric Vehicle (EV) Grid Draw** | `0.052 kg CO2e / km` | Bureau of Energy Efficiency (BEE) National EV Charging Infrastructure Report | 2024 | Verified |
| **Unsegregated Solid Municipal Waste** | `0.95 kg CO2e / kg` | Central Pollution Control Board (CPCB) Municipal Solid Waste Guidelines | 2022 | Verified |
| **Municipal Water Pumping Energy** | `0.42 kg CO2e / kL` | Central Public Health and Environmental Engineering Organisation (CPHEEO) Water Pumping Energy Benchmark | 2021 | Verified |

---

## 2. Gujarat Electricity Regulatory Commission (GERC) Retail Tariffs (FY 2024–25)

Tariffs and Time-of-Day (ToD) rules are derived directly from the GERC Tariff Orders:

### A. Uttar Gujarat Vij Company Limited (UGVCL) & GUVNL DISCOMs (PGVCL, DGVCL, MGVCL)
- **Source:** GERC Tariff Order Case No. 2291/2024 (Applicable for FY 2024–25)
- **Publication Date:** March 2024
- **Statewide Average Residential Effective Tariff:** `₹6.50 / kWh` (used for macro estimations and microservice hourly cost estimates)
- **Residential Telescopic Slabs (RGP):**
  - First 50 units/month: `₹3.20 / kWh`
  - Next 50 units (51–100): `₹3.90 / kWh`
  - Next 150 units (101–250): `₹4.90 / kWh`
  - Above 250 units: `₹6.20 / kWh`
  - Fixed Monthly Charges: `₹40 / month` (single phase)

### B. Torrent Power Limited (Ahmedabad, Gandhinagar, Surat)
- **Source:** GERC Tariff Order Case No. 2295/2024
- **Publication Date:** March 2024
- **Residential Slabs:**
  - 1–50 units: `₹3.40 / kWh`
  - 51–100 units: `₹4.10 / kWh`
  - 101–250 units: `₹5.10 / kWh`
  - Above 250 units: `₹6.50 / kWh`

---

## 3. Time-of-Day (ToD) Peak Windows & Smart Metering Rules

- **Source:** GERC Multi-Year Tariff (MYT) Regulations & GEDA Energy Conservation Advisory 2024
- **Peak Window:** 6:00 PM to 10:00 PM Asia/Kolkata (`18:00:00` inclusive to `22:00:00` exclusive)
- **Peak Tariff Multiplier:** `1.25x` (25% surcharge for peak-hour consumption on eligible metered tariffs)
- **Off-Peak Window:** 10:00 PM to 6:00 AM Asia/Kolkata (`22:00:00` to `06:00:00`)
- **Off-Peak Tariff Rebate:** `15% discount`
- **Application Boundary Rule:** Real-time peak warning nudges are triggered strictly between 18:00:00 and 21:59:59 IST when active load exceeds the configured `highLoadThresholdWatts` (default `1200W`).

---

## 4. PM Surya Ghar: Muft Bijli Yojana Central Financial Assistance (CFA)

- **Source:** Ministry of New and Renewable Energy (MNRE), Government of India: *Operational Guidelines for PM Surya Ghar: Muft Bijli Yojana*
- **Notification Reference:** File No. 318/17/2024-GCRT
- **Publication Date:** 13 February 2024
- **Portal:** [pmsuryaghar.gov.in](https://pmsuryaghar.gov.in)

### Subsidy Structure for Residential Rooftop Solar (Individual Households)
- **Up to 2 kW capacity:** `₹33,000 per kW` (Max `₹66,000` for 2 kW)
- **Additional capacity beyond 2 kW up to 3 kW:** `₹12,000 per kW`
- **Maximum CFA Subsidy:** `₹78,000` for systems of 3 kW or higher capacity
- **Group Housing Societies / Residential Welfare Associations (GHS/RWA):** `₹18,000 per kW` for common facilities (up to 500 kW capacity)
- **ALMM Requirement:** 100% of solar photovoltaic modules installed must be listed under the Approved List of Models and Manufacturers (ALMM) with Domestic Content Requirement (DCR) solar cells.

---

## 5. Status & Limitations

1. **Tariff Indexation:** While baseline rates reflect GERC 2024-25 tariff orders, municipal electricity duty and Fuel and Power Purchase Price Adjustment (FPPPA) charges fluctuate quarterly and are modeled as part of the overall average rate.
2. **Empanelled Vendors:** Vendor names and profiles in `seed/vendors.json` are curated representations of authorized Gujarat EPC contractors participating in the PM Surya Ghar National Portal.

