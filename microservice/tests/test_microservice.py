"""
Unit and integration tests for Mission LiFE FastAPI microservice.
Tests telemetry ingestion, rate limiting, device allow-list, peak-hour nudge evaluation,
and health/root endpoints.
"""

import os
import sys
import time
import pytest
from fastapi.testclient import TestClient

# Ensure microservice is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app, _DEVICE_RATE_BUCKETS


@pytest.fixture
def client():
    # Clear rate limit buckets before each test run
    _DEVICE_RATE_BUCKETS.clear()
    return TestClient(app)


def test_root_endpoint(client):
    """GET / must return service metadata, version, and git SHA."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "mission-life-microservice"
    assert data["version"] == "1.0.0"
    assert "git_sha" in data
    assert data["status"] == "healthy"


def test_health_endpoint(client):
    """GET /health must report firestore connectivity, device count, and uptime."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "firestore_connected" in data
    assert "device_count" in data
    assert data["device_count"] >= 1
    assert "uptime_seconds" in data
    assert data["uptime_seconds"] >= 0


def test_unknown_device_rejection(client):
    """Devices not in the allow-list must be rejected with 404."""
    payload = {
        "user_id": "usr_citizen_pooja",
        "device_id": "unknown_rogue_device_999",
        "current_wattage": 1500
    }
    response = client.post("/api/hardware", json=payload)
    assert response.status_code == 404
    assert "not registered" in response.json()["detail"]


def test_simulated_device_telemetry_allowed_without_key(client):
    """Simulated devices (e.g. appliance_ac_01) in allow-list are permitted without X-Device-Key."""
    payload = {
        "user_id": "usr_citizen_pooja",
        "device_id": "appliance_ac_01",
        "current_wattage": 1450,
        "voltage": 230.0,
        "source_type": "wokwi_simulated"
    }
    response = client.post("/api/hardware", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["device_id"] == "appliance_ac_01"
    assert data["is_simulated"] is True
    assert "nudge_message" in data


def test_device_rate_limiting(client):
    """Bursts exceeding the rate limit (~1 req / 2s per device) must return 429."""
    payload = {
        "user_id": "usr_citizen_pooja",
        "device_id": "appliance_ac_01",
        "current_wattage": 1450,
        "source_type": "wokwi_simulated"
    }
    # Initial request uses 1 token (capacity 2.0 -> 1.0 left)
    r1 = client.post("/api/hardware", json=payload)
    assert r1.status_code == 200

    # Second request uses 1 token (1.0 -> 0.0 left)
    r2 = client.post("/api/hardware", json=payload)
    assert r2.status_code == 200

    # Third immediate request exhausts bucket and must return 429
    r3 = client.post("/api/hardware", json=payload)
    assert r3.status_code == 429
    assert "Rate limit exceeded" in r3.json()["detail"]


def test_peak_hour_nudge_evaluation(client):
    """Verify nudge logic: 18:00 to 22:00 IST is peak hours; outside is off-peak."""
    # 8:00 PM IST (Hour 20) -> Peak hour
    r_peak = client.get("/api/hardware/verify-nudge?power_watts=1600&hour_ist=20")
    assert r_peak.status_code == 200
    data_peak = r_peak.json()
    assert data_peak["is_peak_hours"] is True
    assert data_peak["nudge_rule"] == "PEAK_HIGH_LOAD"
    assert "HIGH LOAD WARNING" in data_peak["base_message"]

    # 3:00 AM IST (Hour 3) -> Off-peak hour with high load
    r_offpeak = client.get("/api/hardware/verify-nudge?power_watts=1600&hour_ist=3")
    assert r_offpeak.status_code == 200
    data_offpeak = r_offpeak.json()
    assert data_offpeak["is_peak_hours"] is False
    assert data_offpeak["nudge_rule"] == "OFF_PEAK_HIGH_LOAD"
    assert "Peak" not in data_offpeak["base_message"]
    assert "High electricity usage detected" in data_offpeak["base_message"]

    # Low wattage -> Efficient grid draw
    r_eff = client.get("/api/hardware/verify-nudge?power_watts=400&hour_ist=20")
    assert r_eff.status_code == 200
    data_eff = r_eff.json()
    assert data_eff["nudge_rule"] == "EFFICIENT_GRID_DRAW"
    assert "Efficient Grid Draw" in data_eff["base_message"]


def test_insights_role_authorization(client):
    """Citizen insights must require authenticated user_id; Admin does not."""
    # Citizen without user_id -> 403 Forbidden
    r_citizen_no_uid = client.get("/api/insights?role=citizen")
    assert r_citizen_no_uid.status_code == 403

    # Citizen with user_id -> 200 OK
    r_citizen = client.get("/api/insights?role=citizen&user_id=usr_citizen_pooja")
    assert r_citizen.status_code == 200
    data = r_citizen.json()
    assert data["role"] == "citizen"
    assert "power_telemetry" in data
    assert data["units"]["carbon_emissions"] == "kg CO2e"

    # Admin without user_id -> 200 OK (authorized for platform aggregate view)
    r_admin = client.get("/api/insights?role=admin")
    assert r_admin.status_code == 200
    assert r_admin.json()["role"] == "admin"

