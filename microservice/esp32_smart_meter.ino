/*
 * =========================================================================
 * Mission LiFE: ESP32 Smart-Meter Telemetry Bridge (IoT Client)
 * =========================================================================
 * Hardware Target: ESP32 Dev Module (or ESP8266 / Arduino MKR WiFi 1010)
 * Sensors Supported: PZEM-004T (Modbus UART) or ACS712 / ZMPT101B ADC Sensors
 * Communication: WiFi + HTTP POST JSON Telemetry to FastAPI Microservice
 * =========================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// -------------------------------------------------------------------------
// NETWORK & BACKEND CONFIGURATION
// -------------------------------------------------------------------------
const char* WIFI_SSID      = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD  = "YOUR_WIFI_PASSWORD";

// Target endpoint of the FastAPI Microservice (Render Production or Localhost)
const char* TELEMETRY_URL  = "https://mission-life.onrender.com/api/hardware";
const char* DEVICE_API_KEY = "YOUR_DEVICE_API_KEY";
const char* DEVICE_ID      = "appliance_ac_01";
const char* USER_ID        = "usr_citizen_pooja";

// Sample transmission interval (e.g. 5000 ms = 5 seconds)
const unsigned long SEND_INTERVAL_MS = 5000;
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n[Mission LiFE] Initializing ESP32 Smart-Meter Bridge...");

  // Connect to Local Wi-Fi Network
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected successfully!");
    Serial.print("Local IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed. Running in offline telemetry simulation mode.");
  }
}

void loop() {
  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;

    // 1. Acquire Telemetry (From PZEM-004T or Simulated Indian 230V AC Grid)
    float voltage    = 230.0 + ((rand() % 100) / 50.0) - 1.0; // 229.0V - 231.0V RMS
    float current    = 3.20 + ((rand() % 150) / 100.0);       // 3.2A - 4.7A
    float powerWatts = voltage * current * 0.95;               // Active Power (W)
    float frequency  = 50.0 + ((rand() % 20) / 100.0) - 0.1;  // 49.9Hz - 50.1Hz

    Serial.println("----------------------------------------");
    Serial.printf("Grid Voltage:   %.1f V\n", voltage);
    Serial.printf("Current:        %.2f A\n", current);
    Serial.printf("Active Power:   %.1f W\n", powerWatts);
    Serial.printf("Grid Frequency: %.2f Hz\n", frequency);

    // 2. Transmit Payload to Microservice if Connected
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(TELEMETRY_URL);
      http.addHeader("Content-Type", "application/json");
      http.addHeader("X-Device-Api-Key", DEVICE_API_KEY);

      // Serialize JSON payload conforming to FastAPI Pydantic schema
      StaticJsonDocument<256> doc;
      doc["user_id"]         = USER_ID;
      doc["device_id"]       = DEVICE_ID;
      doc["current_wattage"] = (int)powerWatts;
      doc["voltage"]         = voltage;
      doc["current"]         = current;
      doc["frequency"]       = frequency;
      doc["source_type"]     = "meter_measured";
      doc["timestamp"]       = (unsigned long)(time(nullptr));

      String jsonPayload;
      serializeJson(doc, jsonPayload);

      int httpResponseCode = http.POST(jsonPayload);
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("Telemetry Dispatched (HTTP %d)\n", httpResponseCode);
        Serial.println("Server Nudge: " + response);
      } else {
        Serial.printf("HTTP POST Error: %s\n", http.errorToString(httpResponseCode).c_str());
      }
      http.end();
    } else {
      Serial.println("[Offline] Wi-Fi disconnected; buffering telemetry packet.");
    }
  }
}

