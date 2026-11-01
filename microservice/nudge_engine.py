"""
Mission LiFE - Nudge Evaluation Engine
Time-of-Day (ToD) Grid Awareness & Real-Time Nudge Generator

Rules & Boundaries:
- Timezone: Asia/Kolkata (IST = UTC+05:30).
- Configured Peak Window: 6:00 PM – 10:00 PM Asia/Kolkata (18:00:00 - 22:00:00).
- Boundary Definition: Inclusive at 6:00 PM (18:00:00), Exclusive at 10:00 PM (22:00:00).
- Peak Load Rule (PEAK_HIGH_LOAD): In peak window AND power_watts > 1200W.
- Off-Peak High Load Rule (OFF_PEAK_HIGH_LOAD): Outside peak window AND power_watts > 1200W.
  Notice: Strictly omits any mention of peak hours or premium ToD tariffs.
- Efficient Profile Rule (EFFICIENT_GRID_DRAW): power_watts <= 1200W.
- Dev Verification: Attaches local IST time and triggered rule identifier.
"""

from datetime import datetime, timezone, timedelta, time as time_obj
from typing import Dict, Any, Optional


def get_kolkata_tz():
    """Returns Asia/Kolkata timezone object safely across all platforms."""
    try:
        from zoneinfo import ZoneInfo
        return ZoneInfo("Asia/Kolkata")
    except Exception:
        return timezone(timedelta(hours=5, minutes=30), name="Asia/Kolkata")


def evaluate_telemetry_nudge(power_watts: float, raw_timestamp: Optional[float] = None) -> Dict[str, Any]:
    """
    Evaluates live energy nudge strictly based on Asia/Kolkata local time.
    Converts timestamps from UTC to Asia/Kolkata before checking the window;
    does NOT use the server's raw UTC hour.
    
    Boundary:
      18:00:00 <= current_time < 22:00:00 (Inclusive at 6 PM, Exclusive at 10 PM).
    """
    ts = float(raw_timestamp) if raw_timestamp is not None else datetime.now(timezone.utc).timestamp()
    if ts > 1e11:
        ts = ts / 1000.0

    tz_kolkata = get_kolkata_tz()
    dt_kolkata = datetime.fromtimestamp(ts, tz=timezone.utc).astimezone(tz_kolkata)
    
    current_time = dt_kolkata.time()
    peak_start = time_obj(18, 0, 0)
    peak_end = time_obj(22, 0, 0)
    is_peak = (peak_start <= current_time < peak_end)
    
    time_str = dt_kolkata.strftime("%I:%M:%S %p IST")
    
    if is_peak and power_watts > 1200:
        rule = "PEAK_HIGH_LOAD"
        base_message = f"⚠️ HIGH LOAD WARNING: {power_watts:.0f}W running during Peak Grid Hours (6-10 PM). Defer high-wattage cycles to avoid premium ToD tariffs."
    elif power_watts > 1200:
        rule = "OFF_PEAK_HIGH_LOAD"
        base_message = f"⚡ High Demand detected ({power_watts:.0f}W). Switch off idle appliances to conserve energy."
    else:
        rule = "EFFICIENT_GRID_DRAW"
        base_message = f"🟢 Efficient Grid Draw ({power_watts:.0f}W). Optimal consumption profile."
        
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
