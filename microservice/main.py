"""
Mission LiFE - Appliance Scanner & Hardware IoT Microservice
FastAPI + OpenCV + YOLOv8 + Smart-Meter Telemetry Bridge + Firestore Persistence
Hardened device authorization, rate limiting, and defensive input validation.
"""

import io
import os
import re
import json
import time
import hmac
import uuid
import threading
import logging
import urllib.parse
from datetime import datetime, timezone, timedelta, time as time_obj
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, File, UploadFile, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
import cv2

# Structured application logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("mission_life_microservice")

SERVICE_START_TIME = time.time()
GIT_SHA = os.environ.get("GIT_SHA", "5c5d353")
ID_REGEX = re.compile(r"^[A-Za-z0-9_-]{1,64}$")

try:
    from nudge_engine import evaluate_telemetry_nudge, get_kolkata_tz
except ImportError:
    from microservice.nudge_engine import evaluate_telemetry_nudge, get_kolkata_tz

# In-memory circular buffer for fast telemetry auditing and dashboard stream
TELEMETRY_LEDGER: List[Dict[str, Any]] = []

# Persistent disk ledger path to survive service restarts
TELEMETRY_STORE_PATH = os.path.join(os.path.dirname(__file__), "telemetry_store.jsonl")
_disk_lock = threading.Lock()

# Document collision-safe counter
_doc_counter = 0
_doc_counter_lock = threading.Lock()


def generate_doc_id(device_id: str, ts: float) -> str:
    """Generates unique deterministic document ID formatted as {deviceId}_{timestamp_ms}_{counter}."""
    global _doc_counter
    with _doc_counter_lock:
        _doc_counter = (_doc_counter + 1) % 1000000
        counter = _doc_counter
    ts_ms = int(ts * 1000)
    return f"{device_id}_{ts_ms}_{counter:04d}"


# -----------------------------------------------------------------------------
# DYNAMIC CONFIGURATION & CATALOG CACHE (5-minute in-memory cache)
# -----------------------------------------------------------------------------
_CONFIG_CACHE: Dict[str, Any] = {}
_CONFIG_CACHE_EXPIRY: Dict[str, float] = {}
CONFIG_CACHE_TTL = 300.0  # 5 minutes

# Token bucket rate limiting per device (~1 req / 2s -> 0.5 tokens/sec, capacity 2.0)
_DEVICE_RATE_BUCKETS: Dict[str, Dict[str, float]] = {}
_rate_lock = threading.Lock()

# YOLOv8 lazy loaded instance and thread lock
_yolo_model = None
_model_lock = threading.Lock()


def append_to_persistent_ledger(record: Dict[str, Any]) -> None:
    """Appends telemetry record to durable disk store so history survives restarts (thread-safe)."""
    try:
        with _disk_lock:
            with open(TELEMETRY_STORE_PATH, "a", encoding="utf-8") as f:
                f.write(json.dumps(record) + "\n")
    except Exception as e:
        logger.warning(f"Persistent disk write warning: {e}")


def load_persistent_ledger(user_id: Optional[str] = None, limit: int = 200) -> List[Dict[str, Any]]:
    """Loads historical records from disk store (thread-safe)."""
    records = []
    if not os.path.exists(TELEMETRY_STORE_PATH):
        return [t for t in TELEMETRY_LEDGER if not user_id or t.get("user_id") == user_id][-limit:]
    try:
        with _disk_lock:
            with open(TELEMETRY_STORE_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            rec = json.loads(line)
                            if not user_id or rec.get("user_id") == user_id:
                                records.append(rec)
                        except Exception:
                            pass
        if not records and TELEMETRY_LEDGER:
            return [t for t in TELEMETRY_LEDGER if not user_id or t.get("user_id") == user_id][-limit:]
        return records[-limit:]
    except Exception as e:
        logger.warning(f"Persistent disk read warning: {e}")
        return [t for t in TELEMETRY_LEDGER if not user_id or t.get("user_id") == user_id][-limit:]


# Optional Firebase Admin SDK initialization for server-side Firestore operations
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    if not firebase_admin._apps:
        project_id = os.environ.get("VITE_FIREBASE_PROJECT_ID", "hackcult-f9a20")
        firebase_creds_json = os.environ.get("FIREBASE_CREDENTIALS")
        
        if firebase_creds_json:
            try:
                cred_dict = json.loads(firebase_creds_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred, {"projectId": project_id})
                logger.info("Firebase Admin SDK initialized successfully via FIREBASE_CREDENTIALS.")
            except Exception as env_err:
                logger.warning(f"Failed to parse FIREBASE_CREDENTIALS json: {env_err}")
                cred = credentials.ApplicationDefault()
                firebase_admin.initialize_app(cred, {"projectId": project_id})
        else:
            try:
                cred = credentials.ApplicationDefault()
                firebase_admin.initialize_app(cred, {"projectId": project_id})
            except Exception:
                firebase_admin.initialize_app(options={"projectId": project_id})
                
    firestore_client = firestore.client()
except Exception as e:
    logger.info(f"Firebase Admin SDK running in HTTP/local fallback mode: {e}")
    firestore_client = None


def get_remote_or_cached_config(doc_name: str) -> Dict[str, Any]:
    """
    Fetches configuration document with a 5-minute in-memory cache.
    Sources from Firestore first, falling back to seed JSON files.
    """
    now = time.time()
    if doc_name in _CONFIG_CACHE and now < _CONFIG_CACHE_EXPIRY.get(doc_name, 0):
        return _CONFIG_CACHE[doc_name]

    # 1. Try Firestore Admin SDK
    if firestore_client is not None:
        try:
            doc_ref = firestore_client.collection("config").document(doc_name)
            doc_snap = doc_ref.get()
            if doc_snap.exists:
                data = doc_snap.to_dict() or {}
                _CONFIG_CACHE[doc_name] = data
                _CONFIG_CACHE_EXPIRY[doc_name] = now + CONFIG_CACHE_TTL
                return data
        except Exception as e:
            logger.warning(f"Firestore fetch failed for config/{doc_name}: {e}")

    # 2. Local seed JSON fallback
    seed_path = os.path.join(os.path.dirname(__file__), "..", "seed", f"config.{doc_name}.json")
    if os.path.exists(seed_path):
        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _CONFIG_CACHE[doc_name] = data
                _CONFIG_CACHE_EXPIRY[doc_name] = now + CONFIG_CACHE_TTL
                return data
        except Exception as e:
            logger.warning(f"Seed file load failed for config.{doc_name}.json: {e}")

    return {}


def get_appliance_catalog() -> List[Dict[str, Any]]:
    """Loads appliance reference catalog with in-memory caching."""
    now = time.time()
    if "applianceCatalog" in _CONFIG_CACHE and now < _CONFIG_CACHE_EXPIRY.get("applianceCatalog", 0):
        return _CONFIG_CACHE["applianceCatalog"]

    if firestore_client is not None:
        try:
            docs = firestore_client.collection("applianceCatalog").stream()
            items = [d.to_dict() for d in docs]
            if items:
                _CONFIG_CACHE["applianceCatalog"] = items
                _CONFIG_CACHE_EXPIRY["applianceCatalog"] = now + CONFIG_CACHE_TTL
                return items
        except Exception as e:
            logger.warning(f"Firestore stream failed for applianceCatalog: {e}")

    seed_path = os.path.join(os.path.dirname(__file__), "..", "seed", "applianceCatalog.json")
    if os.path.exists(seed_path):
        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                items = json.load(f)
                _CONFIG_CACHE["applianceCatalog"] = items
                _CONFIG_CACHE_EXPIRY["applianceCatalog"] = now + CONFIG_CACHE_TTL
                return items
        except Exception as e:
            logger.warning(f"Seed file load failed for applianceCatalog.json: {e}")

    return []


def get_device_doc(device_id: str) -> Optional[Dict[str, Any]]:
    """Checks registered devices in Firestore or seed/devices.json."""
    if firestore_client is not None:
        try:
            doc = firestore_client.collection("devices").document(device_id).get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            logger.warning(f"Firestore device check failed for {device_id}: {e}")

    seed_path = os.path.join(os.path.dirname(__file__), "..", "seed", "devices.json")
    if os.path.exists(seed_path):
        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                devices = json.load(f)
                for d in devices:
                    if d.get("id") == device_id:
                        return d
        except Exception as e:
            logger.warning(f"Seed devices check failed: {e}")

    return None


def get_device_count() -> int:
    """Returns the total number of registered devices in allow-list."""
    if firestore_client is not None:
        try:
            coll = firestore_client.collection("devices")
            count_query = coll.count()
            results = count_query.get()
            return int(results[0][0].value)
        except Exception:
            pass

    seed_path = os.path.join(os.path.dirname(__file__), "..", "seed", "devices.json")
    if os.path.exists(seed_path):
        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                devices = json.load(f)
                return len(devices)
        except Exception:
            pass
    return 1


def check_rate_limit(device_id: str) -> bool:
    """
    Token bucket rate limit: allows ~1 request per 2 seconds (0.5 tokens/s)
    with a burst capacity of 2 tokens.
    """
    with _rate_lock:
        now = time.time()
        bucket = _DEVICE_RATE_BUCKETS.setdefault(device_id, {"tokens": 2.0, "last_updated": now})
        elapsed = now - bucket["last_updated"]
        bucket["last_updated"] = now
        bucket["tokens"] = min(2.0, bucket["tokens"] + elapsed * 0.5)

        if bucket["tokens"] >= 1.0:
            bucket["tokens"] -= 1.0
            return True
        return False


def get_appliance_specs_map() -> Dict[str, Dict[str, Any]]:
    """Maps dynamic catalog items to scanner specifications keyed by type and YOLO class."""
    catalog = get_appliance_catalog()
    specs: Dict[str, Dict[str, Any]] = {}
    for item in catalog:
        key = (item.get("yoloClass") or item.get("type") or "").lower()
        type_key = (item.get("type") or "").lower()
        wattage = item.get("defaultWattage", 500)
        spec = {
            "display_name": item.get("name", "Household Appliance"),
            "wattage_range": (int(wattage * 0.7), int(wattage * 1.4)),
            "typical_wattage": wattage,
            "daily_hours": item.get("defaultDailyHours", 4),
            "duty_cycle": item.get("dutyCycle", 0.5),
            "tip": item.get("tip", "Switch off at socket when not in use.")
        }
        if key:
            specs[key] = spec
        if type_key:
            specs[type_key] = spec
    return specs


def get_yolo_model():
    """Lazy loads the YOLOv8 model weights on the first invocation (thread-safe)."""
    global _yolo_model
    with _model_lock:
        if _yolo_model is None:
            try:
                from ultralytics import YOLO
                custom_weights = os.path.join(os.path.dirname(__file__), "appliance_best.pt")
                weights_path = os.environ.get("YOLO_WEIGHTS_PATH")
                if not weights_path:
                    if os.path.exists(custom_weights):
                        weights_path = custom_weights
                    elif os.path.exists("appliance_best.pt"):
                        weights_path = "appliance_best.pt"
                    else:
                        weights_path = "yolov8n.pt"

                logger.info(f"Loading YOLOv8 weights: {weights_path}")
                _yolo_model = YOLO(weights_path)
            except Exception as e:
                logger.info(f"YOLOv8 model lazy loading notice: {e}")
                _yolo_model = None
    return _yolo_model


app = FastAPI(
    title="Mission LiFE - ML & IoT Microservice",
    version="1.0.0",
    description="YOLOv8 Appliance Vision Scanner & ESP32 Smart-Meter Hardware Bridge"
)

# Restrict CORS to GitHub Pages deployment and local dev origins
CORS_ORIGINS_ENV = os.environ.get("CORS_ORIGINS", "")
extra_origins = [o.strip() for o in CORS_ORIGINS_ENV.split(",") if o.strip()]
ALLOWED_ORIGINS = [
    "https://pratitdedhia.github.io",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000"
] + extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Device-Key", "X-Device-Api-Key", "Authorization", "X-Request-ID"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Structured request logging with correlated request IDs and timing."""
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())[:8]
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        response.headers["X-Request-ID"] = request_id
        logger.info(f"[{request_id}] {request.method} {request.url.path} -> {response.status_code} ({process_time:.1f}ms)")
        return response
    except Exception as exc:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"[{request_id}] {request.method} {request.url.path} FAILED ({process_time:.1f}ms): {exc}", exc_info=True)
        raise


# -----------------------------------------------------------------------------
# ROOT & HEALTH ENDPOINTS
# -----------------------------------------------------------------------------
@app.get("/")
def root():
    """Microservice root index returning metadata and deployment git SHA."""
    return {
        "service": "mission-life-microservice",
        "version": "1.0.0",
        "git_sha": GIT_SHA,
        "status": "healthy"
    }


@app.get("/health")
def health_check():
    """Health check reporting Firestore connectivity, device allow-list count, and uptime."""
    uptime = time.time() - SERVICE_START_TIME
    return {
        "status": "ok",
        "service": "mission-life-microservice",
        "version": "1.0.0",
        "git_sha": GIT_SHA,
        "uptime_seconds": round(uptime, 2),
        "firestore_connected": firestore_client is not None,
        "device_count": get_device_count(),
        "buffered_telemetry_count": len(TELEMETRY_LEDGER)
    }


# -----------------------------------------------------------------------------
# HARDWARE TELEMETRY PYDANTIC SCHEMAS (Wokwi ESP32 Compatible)
# -----------------------------------------------------------------------------
class HardwareTelemetry(BaseModel):
    """
    Pydantic data model matching the JSON structure dispatched by the
    Wokwi ESP32 simulator:
    {"user_id": "usr_citizen_pooja", "device_id": "appliance_ac_01", "current_wattage": 1450}
    Validates user_id and device_id with strict regex to block path injection.
    """
    user_id: str = Field(..., pattern=r"^[A-Za-z0-9_-]{1,64}$", description="Target User UID")
    device_id: str = Field(..., pattern=r"^[A-Za-z0-9_-]{1,64}$", description="Appliance / Smart Meter Sensor ID")
    current_wattage: int = Field(..., ge=0, le=15000, description="Active Power Consumption in Watts (0-15000W)")
    voltage: Optional[float] = Field(230.0, ge=100.0, le=300.0, description="RMS Grid Voltage (100-300V)")
    current: Optional[float] = Field(None, ge=0.0, le=65.0, description="Current Draw (0-65A)")
    frequency: Optional[float] = Field(50.0, ge=45.0, le=55.0, description="Grid Frequency (45-55Hz)")
    timestamp: Optional[int] = Field(default_factory=lambda: int(time.time()), description="Epoch Timestamp")
    source_type: Optional[str] = Field("wokwi_simulated", description="Source classification: wokwi_simulated or meter_measured")
    location: Optional[Dict[str, Any]] = Field(None, description="Optional location fields when authorized")


class TelemetryResponse(BaseModel):
    status: str
    user_id: str
    device_id: str
    current_wattage: int
    power_watts: float
    power_factor: float
    current_hourly_cost_inr: float
    is_peak_hours: bool
    nudge_message: str
    nudge_rule: Optional[str] = "EFFICIENT_GRID_DRAW"
    current_time_ist: Optional[str] = None
    saved_to_firestore: bool
    source_type: str = "wokwi_simulated"
    is_simulated: bool = True


# -----------------------------------------------------------------------------
# FIRESTORE PERSISTENCE HELPER
# -----------------------------------------------------------------------------
async def save_hardware_telemetry_to_firestore(
    user_id: str,
    device_id: str,
    current_wattage: int,
    power_watts: float,
    voltage: float,
    current: float,
    power_factor: float,
    hourly_cost_inr: float,
    is_peak: bool,
    nudge: str,
    timestamp: int,
    source_type: str = "wokwi_simulated",
    location: Optional[Dict[str, Any]] = None,
    nudge_rule: Optional[str] = None,
    current_time_ist: Optional[str] = None,
    is_simulated: bool = True
) -> bool:
    """
    Persists incoming smart meter telemetry to Firestore and durable disk store under:
      - `users/{user_id}/telemetry/{doc_id}` (Telemetry log)
      - `users/{user_id}/appliances/{device_id}` (Active appliance live wattage)
    Uses collision-safe document IDs ({device_id}_{ts_ms}_{counter}).
    """
    record = {
        "user_id": user_id,
        "device_id": device_id,
        "current_wattage": current_wattage,
        "power_watts": power_watts,
        "voltage": voltage,
        "current": current,
        "power_factor": power_factor,
        "current_hourly_cost_inr": hourly_cost_inr,
        "is_peak_hours": is_peak,
        "nudge_message": nudge,
        "nudge_rule": nudge_rule,
        "current_time_ist": current_time_ist,
        "timestamp": timestamp,
        "source": "Wokwi ESP32 Telemetry Bridge" if is_simulated else "Smart Meter Hardware Bridge",
        "source_type": source_type,
        "is_simulated": is_simulated,
        "iso_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(timestamp))
    }
    if location:
        record["location"] = location

    # Buffer locally in circular buffer and durable disk store
    TELEMETRY_LEDGER.append(record)
    if len(TELEMETRY_LEDGER) > 100:
        TELEMETRY_LEDGER.pop(0)
    append_to_persistent_ledger(record)

    # Native Firebase Admin SDK write only (Unauthenticated REST fallback completely removed)
    if firestore_client is not None:
        try:
            doc_id = generate_doc_id(device_id, timestamp)
            firestore_client.collection("users").document(user_id)\
                .collection("telemetry").document(doc_id).set(record)

            firestore_client.collection("users").document(user_id)\
                .collection("appliances").document(device_id).set({
                    "device_id": device_id,
                    "wattage": current_wattage,
                    "last_active": timestamp,
                    "status": "online"
                }, merge=True)
            return True
        except Exception as admin_err:
            logger.error(f"Firestore Admin SDK write error for {device_id}: {admin_err}")
            return False

    logger.warning("Firestore Admin SDK not connected; telemetry retained in persistent memory ledger.")
    return False


# -----------------------------------------------------------------------------
# APPLIANCE SCAN ENDPOINT (/api/scan)
# -----------------------------------------------------------------------------
@app.post("/api/scan")
async def scan_appliance(file: UploadFile = File(...)):
    """
    Accepts an uploaded image of a household appliance.
    Enforces 5MB size limit, magic byte image validation, and dimension scaling.
    Uses OpenCV and YOLOv8 to detect appliances, returning transparent results.
    """
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

    # 1. Size check
    contents = await file.read(MAX_FILE_SIZE + 1)
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Uploaded file exceeds maximum allowed size of 5MB."
        )

    # 2. Magic byte verification (JPEG, PNG, WebP)
    is_jpeg = contents.startswith(b"\xff\xd8\xff")
    is_png = contents.startswith(b"\x89PNG\r\n\x1a\n")
    is_webp = contents.startswith(b"RIFF") and len(contents) >= 12 and contents[8:12] == b"WEBP"

    if not (is_jpeg or is_png or is_webp):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported media type. Only JPEG, PNG, and WebP images are permitted."
        )

    # 3. Image decoding
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to decode image payload."
        )

    # 4. Limit decoded dimensions (max 1280px)
    max_dim = 1280
    h, w = image.shape[:2]
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        image = cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        height, width = image.shape[:2]
    else:
        height, width = h, w

    detected_appliances = []
    appliance_specs = get_appliance_specs_map()
    emission_config = get_remote_or_cached_config("emissionFactors")
    grid_co2_factor = float(emission_config.get("gridCo2PerKwh", 0.71))

    # 5. Lazy loaded YOLO model check
    yolo = get_yolo_model()
    if yolo is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Appliance vision model is currently unavailable."
        )

    CUSTOM_CLASS_MAPPING = {
        "air": "air_conditioner",
        "air conditioner": "air_conditioner",
        "hot water shower machine": "water_heater_geyser",
        "microwave oven": "microwave",
        "electric cooker": "induction_cooktop",
        "electriccooker": "induction_cooktop",
        "super kettle": "induction_cooktop",
        "refrigerator": "refrigerator",
        "microwave": "microwave",
        "tv": "television",
        "television": "television",
        "fan": "ceiling_fan",
        "washing machine": "washing_machine",
        "laptop": "laptop",
    }

    try:
        results = yolo(image, verbose=False)
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0].item())
                class_name = yolo.names.get(cls_id, "").lower()
                conf = float(box.conf[0].item())

                # 1. Direct custom/standard alias mapping
                mapped_key = CUSTOM_CLASS_MAPPING.get(class_name)
                appliance_key = None
                if mapped_key and mapped_key in appliance_specs:
                    appliance_key = mapped_key
                else:
                    for candidate in appliance_specs:
                        if candidate in class_name or class_name in candidate:
                            appliance_key = candidate
                            break

                if appliance_key and conf >= 0.25:
                    specs = appliance_specs[appliance_key]
                    x1, y1, x2, y2 = [round(v, 1) for v in box.xyxy[0].tolist()]

                    daily_kwh = (specs["typical_wattage"] * specs["daily_hours"] * specs["duty_cycle"]) / 1000.0
                    monthly_co2_kg = round(daily_kwh * 30 * grid_co2_factor, 2)

                    detected_appliances.append({
                        "label": specs["display_name"],
                        "confidence": round(conf, 3),
                        "bounding_box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                        "estimated_wattage": specs["typical_wattage"],
                        "daily_hours_typical": specs["daily_hours"],
                        "monthly_co2e_kg": monthly_co2_kg,
                        "energy_saving_nudge": specs["tip"]
                    })
    except Exception as e:
        logger.error(f"Inference error during scan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error executing appliance computer vision analysis."
        )

    if not detected_appliances:
        return {
            "success": True,
            "detection": "none",
            "image_dimensions": {"width": width, "height": height},
            "appliances_detected_count": 0,
            "detected_appliances": [],
            "total_estimated_instant_wattage": 0,
            "estimated_monthly_carbon_kg_co2e": 0.0,
            "message": "No appliance recognised, pick manually",
            "supported_classes": list(appliance_specs.keys())
        }

    total_wattage = sum(a["estimated_wattage"] for a in detected_appliances)
    total_monthly_co2 = sum(a["monthly_co2e_kg"] for a in detected_appliances)

    return {
        "success": True,
        "detection": "detected",
        "image_dimensions": {"width": width, "height": height},
        "appliances_detected_count": len(detected_appliances),
        "detected_appliances": detected_appliances,
        "total_estimated_instant_wattage": total_wattage,
        "estimated_monthly_carbon_kg_co2e": round(total_monthly_co2, 2),
        "overall_efficiency_verdict": "Moderate Load - Optimize temperature and avoid standby leakage.",
        "mission_life_action": "Set thermostat 1°C higher or turn off at socket when unused."
    }


# -----------------------------------------------------------------------------
# HARDWARE TELEMETRY BRIDGE (/api/hardware)
# -----------------------------------------------------------------------------
@app.post("/api/hardware", response_model=TelemetryResponse)
async def receive_hardware_telemetry(payload: HardwareTelemetry, request: Request):
    """
    Receives real-time smart-meter telemetry via HTTP POST
    from the Wokwi ESP32 simulator or physical IoT microcontroller.
    Enforces device allow-list, token bucket rate limiting (~1 req / 2s),
    constant-time API key verification, and registry-governed simulation tags.
    """
    # 1. Device allow-list check
    device = get_device_doc(payload.device_id)
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device '{payload.device_id}' is not registered in the device allow-list."
        )

    # 2. Token bucket rate limit check (~1 req / 2s per device)
    if not check_rate_limit(payload.device_id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded for device '{payload.device_id}'. Maximum 1 request per 2 seconds allowed."
        )

    # 3. Resolve owner and simulated status strictly from device registry
    # Payload CANNOT unilaterally set is_simulated
    is_simulated = bool(device.get("simulated", False))
    owner_uid = device.get("ownerUid") or payload.user_id

    # 4. Security / Header key check (Constant-time comparison)
    if not is_simulated:
        client_key = request.headers.get("X-Device-Key") or request.headers.get("X-Device-Api-Key")
        expected_key = device.get("apiKey") or os.environ.get("DEVICE_API_KEY")
        if not client_key or not expected_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized device telemetry: missing X-Device-Key header."
            )
        if not hmac.compare_digest(client_key.encode("utf-8"), expected_key.encode("utf-8")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized device telemetry: invalid X-Device-Key header."
            )

    # 5. Map power calculations from dynamic tariffs config
    power_watts = float(payload.current_wattage)
    voltage = payload.voltage if payload.voltage and payload.voltage > 0 else 230.0
    current = payload.current if payload.current is not None else round(power_watts / voltage, 2)
    apparent_power = voltage * current
    power_factor = min(1.0, round(power_watts / apparent_power, 2)) if apparent_power > 0 else 0.95

    tariffs_config = get_remote_or_cached_config("tariffs")
    tariff_rate = float(tariffs_config.get("averageTariffInrPerKwh", 6.50))
    kwh_hourly = power_watts / 1000.0
    hourly_cost_inr = round(kwh_hourly * tariff_rate, 2)

    # 6. Evaluate nudge using dynamic nudge rules
    nudge_config = get_remote_or_cached_config("nudgeRules")
    nudge_eval = evaluate_telemetry_nudge(
        power_watts=power_watts,
        raw_timestamp=payload.timestamp,
        rules=nudge_config
    )
    is_peak = nudge_eval["is_peak"]
    nudge = nudge_eval["nudge_message"]
    nudge_rule = nudge_eval["nudge_rule"]
    current_time_ist = nudge_eval["current_time_ist"]

    # 7. Save to Firestore under verified owner_uid
    saved = await save_hardware_telemetry_to_firestore(
        user_id=owner_uid,
        device_id=payload.device_id,
        current_wattage=payload.current_wattage,
        power_watts=power_watts,
        voltage=voltage,
        current=current,
        power_factor=power_factor,
        hourly_cost_inr=hourly_cost_inr,
        is_peak=is_peak,
        nudge=nudge,
        timestamp=payload.timestamp or nudge_eval["timestamp_utc"],
        source_type="wokwi_simulated" if is_simulated else "meter_measured",
        location=payload.location,
        nudge_rule=nudge_rule,
        current_time_ist=current_time_ist,
        is_simulated=is_simulated
    )

    return TelemetryResponse(
        status="success",
        user_id=owner_uid,
        device_id=payload.device_id,
        current_wattage=payload.current_wattage,
        power_watts=power_watts,
        power_factor=power_factor,
        current_hourly_cost_inr=hourly_cost_inr,
        is_peak_hours=is_peak,
        nudge_message=nudge,
        nudge_rule=nudge_rule,
        current_time_ist=current_time_ist,
        saved_to_firestore=saved,
        source_type="wokwi_simulated" if is_simulated else "meter_measured",
        is_simulated=is_simulated
    )


@app.get("/api/hardware/verify-nudge")
def verify_nudge(
    power_watts: float = 1450.0,
    hour_ist: Optional[int] = None,
    minute_ist: Optional[int] = 0,
    second_ist: Optional[int] = 0
):
    """
    Development verification helper to test nudge evaluation across different hours.
    Allows simulating specific IST times to verify peak boundary rules.
    """
    tz = get_kolkata_tz()
    if hour_ist is not None:
        now_ist = datetime.now(tz)
        sim_dt = datetime(now_ist.year, now_ist.month, now_ist.day, hour_ist, minute_ist or 0, second_ist or 0, tzinfo=tz)
        raw_ts = sim_dt.timestamp()
    else:
        raw_ts = datetime.now(timezone.utc).timestamp()

    nudge_config = get_remote_or_cached_config("nudgeRules")
    result = evaluate_telemetry_nudge(power_watts=power_watts, raw_timestamp=raw_ts, rules=nudge_config)
    return {
        "status": "success",
        "power_watts": power_watts,
        "simulated_hour_ist": hour_ist,
        "is_peak_hours": result["is_peak"],
        "nudge_rule": result["nudge_rule"],
        "current_time_ist": result["current_time_ist"],
        "base_message": result["base_message"],
        "nudge_message": result["nudge_message"],
        "boundary_spec": f"Peak window: {nudge_config.get('peakStartHour', 18)}:00:00 to {nudge_config.get('peakEndHour', 22)}:00:00 Asia/Kolkata"
    }


@app.get("/api/hardware/latest")
def get_latest_telemetry(user_id: Optional[str] = None):
    """Retrieves the latest buffered telemetry for inspection and frontend synchronization."""
    if user_id and not ID_REGEX.match(user_id):
        raise HTTPException(status_code=422, detail="Invalid user_id parameter.")

    history = load_persistent_ledger(user_id=user_id, limit=1)
    latest = history[-1] if history else (TELEMETRY_LEDGER[-1] if TELEMETRY_LEDGER else None)
    return {"count": len(history), "latest": latest}


@app.get("/api/hardware/history")
def get_hardware_history(
    user_id: Optional[str] = None,
    limit: int = 100,
    exclude_simulated: bool = False
):
    """Retrieves persisted time-series hardware readings from durable ledger."""
    if user_id and not ID_REGEX.match(user_id):
        raise HTTPException(status_code=422, detail="Invalid user_id parameter.")

    records = load_persistent_ledger(user_id=user_id, limit=limit)
    if exclude_simulated:
        records = [r for r in records if not r.get("is_simulated", False)]
    return {
        "user_id": user_id,
        "count": len(records),
        "records": records,
        "source_disclaimer": "Wokwi simulated readings are tagged with is_simulated=True"
    }


@app.get("/api/hardware/analytics")
def get_hardware_analytics(
    user_id: Optional[str] = None,
    baseline_daily_kwh: float = 8.5
):
    """Data-backed electricity and carbon analytics using configured CEA emission factor."""
    if user_id and not ID_REGEX.match(user_id):
        raise HTTPException(status_code=422, detail="Invalid user_id parameter.")

    records = load_persistent_ledger(user_id=user_id, limit=500)
    emission_config = get_remote_or_cached_config("emissionFactors")
    grid_co2_factor = float(emission_config.get("gridCo2PerKwh", 0.71))

    if not records:
        return {
            "user_id": user_id,
            "status": "insufficient_data",
            "message": "Insufficient telemetry coverage to compute energy metrics.",
            "data_coverage_percent": 0.0,
            "instantaneous_watts": 0,
            "voltage": 230.0,
            "current_amps": 0.0,
            "total_kwh": 0.0,
            "co2_kg_estimate": 0.0,
            "is_simulated": True
        }

    sorted_records = sorted(records, key=lambda x: x.get("timestamp", 0))
    is_simulated = any(r.get("is_simulated", True) for r in sorted_records)

    total_kwh = 0.0
    monitored_seconds = 0
    gap_count = 0

    for i in range(len(sorted_records) - 1):
        t1 = sorted_records[i].get("timestamp", 0)
        t2 = sorted_records[i + 1].get("timestamp", 0)
        dt = t2 - t1

        if dt <= 0:
            continue
        elif dt > 60:
            gap_count += 1
            continue
        else:
            w1 = float(sorted_records[i].get("current_wattage", 0))
            w2 = float(sorted_records[i + 1].get("current_wattage", 0))
            avg_w = (w1 + w2) / 2.0
            interval_kwh = (avg_w * dt) / (3600.0 * 1000.0)
            total_kwh += interval_kwh
            monitored_seconds += dt

    first_t = sorted_records[0].get("timestamp", 0)
    last_t = sorted_records[-1].get("timestamp", 0)
    span_seconds = max(1, last_t - first_t)
    coverage_pct = min(100.0, round((monitored_seconds / span_seconds) * 100.0, 1)) if span_seconds > 0 else 0.0

    co2_kg = round(total_kwh * grid_co2_factor, 3)
    latest_rec = sorted_records[-1]

    savings_info = {}
    if monitored_seconds >= 60 and coverage_pct >= 50.0:
        expected_baseline_kwh = (baseline_daily_kwh / 86400.0) * monitored_seconds
        kwh_saved = max(0.0, round(expected_baseline_kwh - total_kwh, 3))
        est_points = min(50, int(kwh_saved * 10))
        savings_info = {
            "status": "valid",
            "baseline_daily_kwh": baseline_daily_kwh,
            "expected_baseline_kwh": round(expected_baseline_kwh, 3),
            "kwh_saved": kwh_saved,
            "estimated_points_reward": est_points,
            "reward_rule_version": "2026.1-SAVINGS",
            "reward_status": "estimated_until_audited"
        }
    else:
        savings_info = {
            "status": "insufficient_coverage",
            "message": "Telemetry coverage < 50% or duration < 1 min. Baseline comparison unavailable.",
            "estimated_points_reward": 0
        }

    return {
        "user_id": user_id,
        "status": "success",
        "is_simulated": is_simulated,
        "source_label": "Simulated (Wokwi ESP32 Bridge)" if is_simulated else "Meter Measured Telemetry",
        "grid_emission_factor": grid_co2_factor,
        "grid_emission_factor_unit": "kg CO2e / kWh",
        "grid_emission_factor_source": emission_config.get("source", "Central Electricity Authority (CEA) v20.0 (Dec 2024)"),
        "instantaneous_watts": latest_rec.get("current_wattage", 0),
        "voltage": latest_rec.get("voltage", 230.0),
        "current_amps": latest_rec.get("current", 0.0),
        "total_kwh": round(total_kwh, 4),
        "co2_kg_estimate": co2_kg,
        "monitored_seconds": monitored_seconds,
        "data_coverage_percent": coverage_pct,
        "gaps_detected_count": gap_count,
        "samples_count": len(sorted_records),
        "baseline_savings": savings_info,
        "latest_nudge": latest_rec.get("nudge_message")
    }


@app.get("/api/insights")
def get_insights(
    role: str = "citizen",
    user_id: Optional[str] = None,
    time_range: str = "30d",
    interval: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    district: Optional[str] = "all",
    campus: Optional[str] = "all"
):
    """
    Unified Role-Governed Insights API with server-side authorization:
    - Enforces role-based boundaries.
    - Converts all time series grouping into Asia/Kolkata (IST).
    - Uses configured CEA grid emission factor.
    """
    clean_role = (role or "citizen").lower()
    valid_roles = ["citizen", "student", "campus_leader", "solar_vendor", "solar_partner", "admin"]
    if clean_role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid profile role: {role}")

    if user_id and not ID_REGEX.match(user_id):
        raise HTTPException(status_code=422, detail="Invalid user_id parameter.")

    # RBAC Data Isolation Check: Non-admins cannot request aggregate insights without user_id
    if clean_role in ["citizen", "student"] and not user_id:
        raise HTTPException(status_code=403, detail="Access denied: Authenticated user_id required for citizen/student insights.")

    tz = get_kolkata_tz()
    now_ist = datetime.now(tz)

    if time_range == "today":
        start_dt = datetime(now_ist.year, now_ist.month, now_ist.day, 0, 0, 0, tzinfo=tz)
        end_dt = now_ist
        chosen_interval = interval or "hourly"
    elif time_range == "7d":
        start_dt = now_ist - timedelta(days=7)
        end_dt = now_ist
        chosen_interval = interval or "daily"
    elif time_range == "30d":
        start_dt = now_ist - timedelta(days=30)
        end_dt = now_ist
        chosen_interval = interval or "daily"
    elif time_range == "12m":
        start_dt = now_ist - timedelta(days=365)
        end_dt = now_ist
        chosen_interval = interval or "monthly"
    elif time_range == "custom" and start_date:
        try:
            start_dt = datetime.fromisoformat(start_date).replace(tzinfo=tz)
            end_dt = datetime.fromisoformat(end_date).replace(tzinfo=tz) if end_date else now_ist
        except (ValueError, TypeError) as parse_err:
            logger.warning(f"Invalid date format in custom range query: {parse_err}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid ISO date format for start_date or end_date."
            )
        chosen_interval = interval or "daily"
    else:
        start_dt = now_ist - timedelta(days=30)
        end_dt = now_ist
        chosen_interval = interval or "daily"

    start_ts = start_dt.timestamp()
    end_ts = end_dt.timestamp()

    target_uid = user_id if clean_role in ["citizen", "student"] else None
    raw_records = load_persistent_ledger(user_id=target_uid, limit=1000)
    
    records = [
        r for r in raw_records
        if start_ts <= float(r.get("timestamp", 0)) <= end_ts
    ]
    records = sorted(records, key=lambda x: x.get("timestamp", 0))

    total_kwh = 0.0
    monitored_seconds = 0
    gap_count = 0

    for i in range(len(records) - 1):
        t1 = float(records[i].get("timestamp", 0))
        t2 = float(records[i + 1].get("timestamp", 0))
        dt = t2 - t1
        if dt <= 0:
            continue
        elif dt > 60:
            gap_count += 1
            continue
        else:
            w1 = float(records[i].get("current_wattage", 0))
            w2 = float(records[i + 1].get("current_wattage", 0))
            avg_w = (w1 + w2) / 2.0
            interval_kwh = (avg_w * dt) / (3600.0 * 1000.0)
            total_kwh += interval_kwh
            monitored_seconds += dt

    span_seconds = max(1.0, end_ts - start_ts)
    coverage_pct = min(100.0, round((monitored_seconds / span_seconds) * 100.0, 1))

    latest_reading = records[-1] if records else (TELEMETRY_LEDGER[-1] if TELEMETRY_LEDGER else None)
    instantaneous_watts = float(latest_reading.get("current_wattage", 0)) if latest_reading else 0.0
    is_simulated = latest_reading.get("is_simulated", True) if latest_reading else True

    emission_config = get_remote_or_cached_config("emissionFactors")
    grid_co2_factor = float(emission_config.get("gridCo2PerKwh", 0.71))
    co2_kg = round(total_kwh * grid_co2_factor, 3)

    return {
        "status": "success",
        "role": clean_role,
        "user_id": user_id,
        "time_range": time_range,
        "interval": chosen_interval,
        "start_date": start_dt.isoformat(),
        "end_date": end_dt.isoformat(),
        "data_freshness_ist": now_ist.strftime("%I:%M:%S %p IST (%d %b %Y)"),
        "timezone": "Asia/Kolkata",
        "units": {
            "instantaneous_power": "Watts (W)",
            "accumulated_energy": "Kilowatt-Hours (kWh)",
            "carbon_emissions": "kg CO2e",
            "grid_emission_factor": f"{grid_co2_factor} kg CO2e / kWh"
        },
        "power_telemetry": {
            "instantaneous_watts": instantaneous_watts,
            "voltage": float(latest_reading.get("voltage", 230.0)) if latest_reading else 230.0,
            "current_amps": float(latest_reading.get("current", 0.0)) if latest_reading else 0.0,
            "accumulated_energy_kwh": round(total_kwh, 4),
            "estimated_grid_co2_kg": co2_kg,
            "monitored_seconds": monitored_seconds,
            "sample_coverage_percent": coverage_pct,
            "gaps_detected_count": gap_count,
            "samples_count": len(records),
            "is_simulated": is_simulated,
            "source_label": "Simulated (Wokwi ESP32 Bridge)" if is_simulated else "Meter Measured Telemetry"
        },
        "forecasting": {
            "status": "insufficient_history" if len(records) < 70 else "ready",
            "message": "Not enough historical data to forecast yet (Requires at least 7 active monitoring days; currently 1 day tracked)." if len(records) < 70 else "7-day linear trailing forecast available",
            "projected_next_month_kwh": None
        }
    }
