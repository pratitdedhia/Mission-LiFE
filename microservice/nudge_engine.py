"""
Mission LiFE - Nudge Evaluation Engine
Time-of-Day (ToD) Grid Awareness & Real-Time Nudge Generator
Config-driven from Firestore `config/nudgeRules` or `seed/config.nudgeRules.json`.
"""

import os
import json
from datetime import datetime, timezone, timedelta, time as time_obj
from typing import Dict, Any, Optional


def get_kolkata_tz():
    """Returns Asia/Kolkata timezone object safely across all platforms."""
    try:
        from zoneinfo import ZoneInfo
        return ZoneInfo("Asia/Kolkata")
    except Exception:
        return timezone(timedelta(hours=5, minutes=30), name="Asia/Kolkata")


def load_default_nudge_rules() -> Dict[str, Any]:
    """Reads default nudge rules from seed configuration file."""
    seed_path = os.path.join(os.path.dirname(__file__), "..", "seed", "config.nudgeRules.json")
    if os.path.exists(seed_path):
        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "highLoadThresholdWatts": 1200,
        "peakStartHour": 18,
        "peakEndHour": 22,
        "peakNudgeTemplate": "⚠️ HIGH LOAD WARNING: {{wattage}}W running during Peak Grid Hours (6-10 PM). Defer high-wattage cycles to avoid premium ToD tariffs.",
        "offPeakNudgeTemplate": "⚡ High electricity usage detected ({{wattage}}W). Switch off idle appliances to conserve energy.",
        "efficientNudgeTemplate": "🟢 Efficient Grid Draw ({{wattage}}W). Optimal consumption profile."
    }


def evaluate_telemetry_nudge(
    power_watts: float,
    raw_timestamp: Optional[float] = None,
    rules: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Evaluates live energy nudge strictly based on Asia/Kolkata local time
    using dynamic configuration rules.
    Converts timestamps from UTC to Asia/Kolkata before checking the window;
    does NOT use the server's raw UTC hour.
    
    Boundary:
      peakStartHour:00:00 <= current_time < peakEndHour:00:00 (Inclusive at start, Exclusive at end).
    """
    active_rules = rules or load_default_nudge_rules()
    threshold = float(active_rules.get("highLoadThresholdWatts", 1200))
    peak_start_h = int(active_rules.get("peakStartHour", 18))
    peak_end_h = int(active_rules.get("peakEndHour", 22))

    peak_tmpl = active_rules.get(
        "peakNudgeTemplate",
        "⚠️ HIGH LOAD WARNING: {{wattage}}W running during Peak Grid Hours (6-10 PM). Defer high-wattage cycles to avoid premium ToD tariffs."
    )
    off_peak_tmpl = active_rules.get(
        "offPeakNudgeTemplate",
        "⚡ High electricity usage detected ({{wattage}}W). Switch off idle appliances to conserve energy."
    )
    eff_tmpl = active_rules.get(
        "efficientNudgeTemplate",
        "🟢 Efficient Grid Draw ({{wattage}}W). Optimal consumption profile."
    )

    ts = float(raw_timestamp) if raw_timestamp is not None else datetime.now(timezone.utc).timestamp()
    if ts > 1e11:
        ts = ts / 1000.0

    tz_kolkata = get_kolkata_tz()
    dt_kolkata = datetime.fromtimestamp(ts, tz=timezone.utc).astimezone(tz_kolkata)
    
    current_time = dt_kolkata.time()
    peak_start = time_obj(peak_start_h, 0, 0)
    peak_end = time_obj(peak_end_h, 0, 0)
    is_peak = (peak_start <= current_time < peak_end)
    
    time_str = dt_kolkata.strftime("%I:%M:%S %p IST")
    wattage_str = f"{power_watts:.0f}"
    
    if is_peak and power_watts > threshold:
        rule = "PEAK_HIGH_LOAD"
        base_message = peak_tmpl.replace("{{wattage}}", wattage_str)
    elif power_watts > threshold:
        rule = "OFF_PEAK_HIGH_LOAD"
        base_message = off_peak_tmpl.replace("{{wattage}}", wattage_str)
    else:
        rule = "EFFICIENT_GRID_DRAW"
        base_message = eff_tmpl.replace("{{wattage}}", wattage_str)
        
    dev_tag = f"[Time: {time_str} | Rule: {rule}]"
    full_nudge = f"{base_message} {dev_tag}"
    
    return {
        "is_peak": is_peak,
        "nudge_rule": rule,
        "base_message": base_message,
        "nudge_message": full_nudge,
        "current_time_ist": time_str,
        "timestamp_utc": int(ts)
    }
