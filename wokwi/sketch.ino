/*
 * =========================================================================
 * Mission LiFE: Wokwi ESP32 Live Smart-Meter Simulator
 * =========================================================================
 * Hardware: ESP32 DevKit v1 + Rotary Potentiometer (ADC Pin 34)
 * Network: Wokwi Virtual WiFi (Wokwi-GUEST)
 * Target: FastAPI Microservice (/api/hardware)
 *
 * Potentiometer Pinout & ADC Mapping:
 * - Pin 1 (GND) -> ESP32 GND
 * - Pin 2 (SIG) -> ESP32 GPIO 34 (ADC1 Channel 6)
 * - Pin 3 (VCC) -> ESP32 3.3V
 *
 * ADC Range (12-bit): 0 to 4095
 * Mapped Active Power: 0 to 3000 Watts (Simulating domestic AC / heavy load)
 * =========================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID     = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// FastAPI Microservice Endpoint & Authentication
const char* TELEMETRY_URL  = "https://mission-life.onrender.com/api/hardware";
const char* DEVICE_API_KEY = "geda_esp32_secret_key_2026";
const char* USER_ID        = "user_12345";
const char* DEVICE_ID      = "appliance_ac_01";

// Potentiometer Analog Input Pin (ADC1)
const int POT_PIN = 34;

// Transmission timing
const unsigned long SEND_INTERVAL_MS = 3000;
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n========================================================");
  Serial.println("  Mission LiFE: ESP32 Smart Meter Hardware Simulator   ");
  Serial.println("========================================================");

  analogReadResolution(12); // 0 to 4095

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wokwi WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! Local IP: " + WiFi.localIP().toString());
  Serial.println("Ready to stream live wattage to Mission LiFE.\n");
}

void loop() {
  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;

    // Read Potentiometer (0 to 4095)
    int rawAdc = analogRead(POT_PIN);
    // Map to active load: 0W to 3000W
    int currentWattage = map(rawAdc, 0, 4095, 0, 3000);

    // Derived electrical metrics (230V Indian Grid Standard)
    float voltage = 230.0 + ((rawAdc % 30) / 10.0) - 1.5; // ~228.5V to 231.5V
    float current = (voltage > 0) ? round((currentWattage / voltage) * 100.0) / 100.0 : 0.0;
    float frequency = 50.0;

    Serial.println("----------------------------------------");
    Serial.printf("ADC Reading:   %d / 4095\n", rawAdc);
    Serial.printf("Active Power:  %d W\n", currentWattage);
    Serial.printf("Grid Voltage:  %.1f V\n", voltage);
    Serial.printf("Current:       %.2f A\n", current);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(TELEMETRY_URL);
      http.addHeader("Content-Type", "application/json");
      http.addHeader("X-Device-Api-Key", DEVICE_API_KEY);

      StaticJsonDocument<256> doc;
      doc["user_id"]         = USER_ID;
      doc["device_id"]       = DEVICE_ID;
      doc["current_wattage"] = currentWattage;
      doc["voltage"]         = voltage;
      doc["current"]         = current;
      doc["frequency"]       = frequency;
      doc["source_type"]     = "wokwi_simulated";

      String jsonPayload;
      serializeJson(doc, jsonPayload);

      int httpCode = http.POST(jsonPayload);
      if (httpCode > 0) {
        String resp = http.getString();
        Serial.printf("HTTP %d Dispatched Successfully!\n", httpCode);
        Serial.println("Server Evaluation: " + resp);
      } else {
        Serial.printf("HTTP POST Failed: %s\n", http.errorToString(httpCode).c_str());
      }
      http.end();
    } else {
      Serial.println("[Offline] WiFi disconnected.");
    }
  }
}

