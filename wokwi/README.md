# Wokwi ESP32 Smart-Meter Simulation Guide

This directory contains the hardware simulation files for the **Mission LiFE IoT Smart-Meter Telemetry Bridge** using the [Wokwi ESP32 Simulator](https://wokwi.com/).

---

## 🔌 Hardware Circuit & Pinout

| Component | Pin | ESP32 DevKit v1 Connection | Function |
| :--- | :--- | :--- | :--- |
| **Potentiometer** | `GND` (Pin 1) | `GND` | Ground reference |
| **Potentiometer** | `SIG` / Wiper (Pin 2) | `GPIO 34` (ADC1_CH6) | 12-bit Analog Voltage input (0 - 3.3V) |
| **Potentiometer** | `VCC` (Pin 3) | `3V3` | 3.3V Power supply |

### 🎚️ Analog ADC Mapping
The ESP32 reads the potentiometer through its 12-bit ADC (range `0` to `4095`) and maps it linearly to active domestic wattage:
$$\text{Wattage (W)} = \text{map}(\text{rawADC}, 0, 4095, 0, 3000)$$

- **0 ADC (0.0 V):** 0 W (Idle / appliances off)
- **2048 ADC (1.65 V):** ~1500 W (Single 1.5-ton AC running)
- **2940 ADC (2.37 V):** ~2155 W (AC + Refrigerator + TV running simultaneously)
- **4095 ADC (3.3 V):** 3000 W (Peak domestic consumption)

---

## 🚀 How to Run in Wokwi

### Option 1: Using the Wokwi VS Code Extension
1. Install the official **Wokwi for VS Code** extension.
2. Open the project root in VS Code.
3. Open `wokwi.toml` or `wokwi/diagram.json`.
4. Press `F1` and select **Wokwi: Start Simulator**.
5. Observe the live serial monitor output and rotate the potentiometer dial in the diagram to simulate variable household loads.

### Option 2: Running on Wokwi Web (Browser)
1. Go to [wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32).
2. Copy the contents of [`wokwi/sketch.ino`](file:///c:/Users/dedhi/Downloads/hackcult/wokwi/sketch.ino) into `sketch.ino`.
3. Copy the contents of [`wokwi/diagram.json`](file:///c:/Users/dedhi/Downloads/hackcult/wokwi/diagram.json) into `diagram.json`.
4. In the **Libraries** tab, add `ArduinoJson`.
5. Click **Start Simulation**.

---

## 📡 Telemetry Ingest Protocol & Security

Each telemetry packet is dispatched via HTTP POST to:
`https://mission-life.onrender.com/api/hardware`

### Headers:
- `Content-Type: application/json`
- `X-Device-Api-Key: geda_esp32_secret_key_2026`

### JSON Payload:
```json
{
  "user_id": "user_12345",
  "device_id": "appliance_ac_01",
  "current_wattage": 2155,
  "voltage": 230.4,
  "current": 9.35,
  "frequency": 50.0,
  "source_type": "wokwi_simulated"
}
```

### Server Evaluation:
1. Validates `X-Device-Api-Key` against `DEVICE_API_KEY`.
2. Validates ranges via Pydantic (`current_wattage`: 0..15000 W, `voltage`: 100..300 V, `current`: 0..65 A, `frequency`: 45..55 Hz).
3. Evaluates the live nudge in **Asia/Kolkata** time:
   - **18:00 to 22:00 IST:** Alerts peak grid load and ToD tariff savings.
   - **Outside 18:00 to 22:00 IST:** Alerts high load without mentioning peak grid tariffs.
4. Persists data to Firestore under `users/{user_id}/telemetry` and marks records with `is_simulated = true`.

