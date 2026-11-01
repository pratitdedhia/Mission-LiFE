# Mission LiFE : Citizen Engagement Platform
> **See your impact. Lower your bills.**

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v11.3-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![C++](https://img.shields.io/badge/C++-ESP32-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white)](https://espressif.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![OpenCV](https://img.shields.io/badge/OpenCV-YOLOv8-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org/)

---

## 🔗 Live Demos

* **Production Frontend:** [https://pratitdedhia.github.io/Mission-LiFE/](https://pratitdedhia.github.io/Mission-LiFE/)
* **Hardware IoT Simulation:** [https://wokwi.com/projects/479495732560719873](https://wokwi.com/projects/479495732560719873)

---

## 🌍 The Problem & The Solution

### The Problem
While public awareness of climate change and national carbon neutrality goals is at an all-time high, citizens encounter massive friction translating macro climate targets into daily, tangible domestic energy decisions. Traditional utility bills arrive once a month with opaque aggregate figures, providing zero actionable feedback loops, no real-time guidance on peak tariffs, and no social accountability.

### The Solution
**Mission LiFE** closes this gap by transforming abstract carbon accounting into a seamless, habit-forming loop:
1. **Progressive Onboarding:** A 3-step, zero-friction baseline assessment (home configuration, monthly kWh consumption, and daily commute) calculates the household's baseline carbon equivalent ($0.71 \text{ kg CO}_2\text{e/kWh}$) in under two minutes.
2. **Actionable Micro-Nudges:** Daily bite-sized challenges (e.g., set AC thermostat to 26°C, defer washing to off-peak grid hours post-10 PM) award 10–20 points and unlock a $1.2\times$ multiplier when maintaining a 3-day streak.
3. **Pin-Code Community Squads:** To eliminate toxic individual competition, personal carbon offsets roll up directly into neighborhood postal code squads (`pin_code`), highlighting collective civic milestones (e.g., *"Andheri West offset 500kg of CO₂ today—equivalent to planting 10 trees"*).

---

## ⚡ Technical X-Factors

### 1. Computer Vision Appliance Scanner (`/api/scan`)
* **Vision Pipeline:** Built on **FastAPI**, **OpenCV**, and **Ultralytics YOLOv8**.
* **Instant Detection:** Citizens photograph domestic appliances (air conditioners, refrigerators, ovens, washing machines).
* **Automated Telemetry:** The vision model identifies the appliance type, calculates estimated instant wattage, evaluates duty cycle patterns, and estimates monthly carbon footprint, returning tailored energy-saving tips to cut vampire standby draw and compressor fatigue.

### 2. ESP32 Smart-Meter Telemetry Bridge (`/api/hardware`)
* **Edge Hardware Interface:** Simulated via **Wokwi** and implemented on **ESP32 Dev Module / Arduino Uno**.
* **Real-Time Sampling:** Microcontroller samples grid telemetry (Voltage RMS, Current, Active Power in Watts, Grid Frequency) and dispatches JSON payloads over HTTP POST at 5-second intervals.
* **Smart Grid Dynamic Nudging:** Microservice backend analyzes instantaneous power draw against regional Time-of-Day (ToD) peak windows (18:00 – 22:00 IST), pushing live alerts when heavy loads coincide with peak thermal grid hours.

---

## 🛠️ Tech Stack Matrix

| Layer | Technology | Key Capabilities & Libraries |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (App Router)** & React 19 | Tailwind CSS v4, Framer Motion (progressive disclosure & tree animation), Lucide Icons |
| **Backend / BaaS** | **Google Firebase** | Firebase Authentication (Email/Password & Google OAuth), Cloud Firestore (NoSQL, subcollections, atomic increments), Firebase Storage |
| **Microservices** | **Python 3.11 & FastAPI** | OpenCV (`cv2`), YOLOv8 (`ultralytics`), Pydantic v2 data validation, Uvicorn ASGI server |
| **IoT & Hardware** | **ESP32 & C++ (Arduino)** | Wokwi Hardware Simulation, `WiFi.h`, `HTTPClient.h`, `ArduinoJson`, PZEM-004T / CT sensor emulation |

---

## 📐 System Architecture

![System Architecture](link-to-diagram.png)

```mermaid
flowchart TD
    subgraph Frontend["Client Tier (Next.js App Router + Tailwind CSS)"]
        Landing["Landing Page (/)"]
        AuthFlow["Auth Flow (/auth)\nFirebase Email & Google SSO"]
        Onboarding["Progressive Onboarding (/onboarding)\n3-Step Baseline Calculator"]
        Dashboard["Core Dashboard (/dashboard)\nGrowing Digital Tree & Micro-Tasks"]
        Squads["Community Squads (/community)\nPin-Code Aggregations"]
        ScannerUI["Appliance Scanner UI (/scan)"]
    end

    subgraph FirebaseBaaS["Backend-as-a-Service (Google Firebase)"]
        FBAuth["Firebase Authentication"]
        FirestoreDB[("Cloud Firestore\n- users/{uid}\n- users/{uid}/user_tasks/{taskId}\n- tasks/{taskId}")]
    end

    subgraph Microservice["Python ML & IoT Microservice (FastAPI + YOLOv8)"]
        ScanAPI["POST /api/scan\nOpenCV + YOLOv8 Detection"]
        HardwareAPI["POST /api/hardware\nSmart-Meter Telemetry Ingestion"]
    end

    subgraph Hardware["IoT Hardware Layer (ESP32 / Wokwi)"]
        ESP32["ESP32 / Arduino Uno\nVoltage, Current & Wattage Sensor"]
        WokwiSim["Wokwi Cloud Simulator"]
    end

    Landing --> AuthFlow
    AuthFlow --> FBAuth
    AuthFlow --> Onboarding
    Onboarding --> FirestoreDB
    Onboarding --> Dashboard
    Dashboard --> FirestoreDB
    Dashboard --> Squads
    Squads --> FirestoreDB
    ScannerUI --> ScanAPI
    ESP32 --> HardwareAPI
    WokwiSim -.-> HardwareAPI
```

---

## 🚀 Setup & Installation Instructions

### Prerequisites
* **Node.js** 20.x or higher and **npm**
* **Python** 3.10 or 3.11 with `pip`
* **Git** installed on your terminal

---

### 1. Clone the Repository
```bash
git clone https://github.com/pratitdedhia/Mission-LiFE.git
cd Mission-LiFE
```

---

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and add the exact Firebase credentials:

```ini
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAFOm7HLfYxob_v2CWH6urwCgs6LqqJrtQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hackcult-f9a20.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hackcult-f9a20
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hackcult-f9a20.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=640710734480
NEXT_PUBLIC_FIREBASE_APP_ID=1:640710734480:web:f494e272fad279c9afde15
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XCGCXXSN2V
```

---

### 3. Frontend Installation & Execution
```bash
# Install frontend dependencies
npm install --legacy-peer-deps

# Run Next.js App Router development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or [http://localhost:5173](http://localhost:5173) for Vite) in your browser.

---

### 4. Start the Python FastAPI ML & IoT Microservice
```bash
# Navigate to microservice directory
cd microservice

# Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Start the ASGI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Interactive Swagger API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 5. Hardware IoT Simulation (Wokwi ESP32)
1. Open the [Wokwi Simulation Project](https://wokwi.com/projects/479495732560719873).
2. Set the target endpoint URL to your FastAPI server or local proxy.
3. Click **Play** to observe real-time telemetry streaming and peak-hour load alerts.

---

## 📄 License & Hackathon Submission

Submitted for **HackCult '26** in alignment with the national **Mission LiFE (Lifestyle for Environment)** guidelines. Licensed under the [MIT License](LICENSE).
