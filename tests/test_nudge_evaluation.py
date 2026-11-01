"""
Test suite for Live Energy Nudge Evaluation
Validates:
1. Asia/Kolkata timezone conversion (no raw UTC leak).
2. Configured peak window: 6:00 PM – 10:00 PM Asia/Kolkata (18:00:00 - 22:00:00).
3. Peak boundary: Inclusive at 6:00 PM, Exclusive at 10:00 PM.
4. Off-peak high load message does NOT mention peak hours or premium peak tariffs.
5. Development verification tags: Current time and triggered rule.
"""

import sys
import os
from datetime import datetime, timezone, timedelta, time as time_obj

# Add microservice to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "microservice"))
from nudge_engine import evaluate_telemetry_nudge, get_kolkata_tz


def test_nudge_evaluation():
    tz = get_kolkata_tz()

    # Case 1: Just before peak window (17:59:59 IST)
    dt_17_59 = datetime(2026, 11, 2, 17, 59, 59, tzinfo=tz)
    res_17_59 = evaluate_telemetry_nudge(power_watts=1645.0, raw_timestamp=dt_17_59.timestamp())
    assert res_17_59["is_peak"] is False, "17:59:59 should NOT be peak"
    assert res_17_59["nudge_rule"] == "OFF_PEAK_HIGH_LOAD"
    assert "High electricity usage detected" in res_17_59["base_message"]
    assert "Peak Grid Hours" not in res_17_59["base_message"]
    assert "ToD tariffs" not in res_17_59["base_message"]
    assert "premium" not in res_17_59["base_message"]
    assert "6-10 PM" not in res_17_59["base_message"]
    assert "Rule: OFF_PEAK_HIGH_LOAD" in res_17_59["nudge_message"]
    print("PASS: Case 1 - 17:59:59 IST correctly off-peak without peak mentions")

    # Case 2: Exact start of peak window (18:00:00 IST - Inclusive)
    dt_18_00 = datetime(2026, 11, 2, 18, 0, 0, tzinfo=tz)
    res_18_00 = evaluate_telemetry_nudge(power_watts=1645.0, raw_timestamp=dt_18_00.timestamp())
    assert res_18_00["is_peak"] is True, "18:00:00 MUST be peak (inclusive boundary)"
    assert res_18_00["nudge_rule"] == "PEAK_HIGH_LOAD"
    assert "Peak Grid Hours (6-10 PM)" in res_18_00["base_message"]
    assert "Rule: PEAK_HIGH_LOAD" in res_18_00["nudge_message"]
    print("PASS: Case 2 - 18:00:00 IST inclusive peak boundary works")

    # Case 3: Middle of peak window (20:30:00 IST)
    dt_20_30 = datetime(2026, 11, 2, 20, 30, 0, tzinfo=tz)
    res_20_30 = evaluate_telemetry_nudge(power_watts=1645.0, raw_timestamp=dt_20_30.timestamp())
    assert res_20_30["is_peak"] is True
    assert res_20_30["nudge_rule"] == "PEAK_HIGH_LOAD"
    print("PASS: Case 3 - 20:30:00 IST peak load works")

    # Case 4: Peak window with low wattage (20:30:00 IST, 350W)
    res_20_30_low = evaluate_telemetry_nudge(power_watts=350.0, raw_timestamp=dt_20_30.timestamp())
    assert res_20_30_low["is_peak"] is True
    assert res_20_30_low["nudge_rule"] == "EFFICIENT_GRID_DRAW"
    assert "Efficient Grid Draw" in res_20_30_low["base_message"]
    print("PASS: Case 4 - Peak window efficient draw works")

    # Case 5: Just before end of peak window (21:59:59 IST)
    dt_21_59 = datetime(2026, 11, 2, 21, 59, 59, tzinfo=tz)
    res_21_59 = evaluate_telemetry_nudge(power_watts=1645.0, raw_timestamp=dt_21_59.timestamp())
    assert res_21_59["is_peak"] is True, "21:59:59 MUST be peak"
    assert res_21_59["nudge_rule"] == "PEAK_HIGH_LOAD"
    print("PASS: Case 5 - 21:59:59 IST within peak window works")

    # Case 6: Exact end of peak window (22:00:00 IST - Exclusive)
    dt_22_00 = datetime(2026, 11, 2, 22, 0, 0, tzinfo=tz)
    res_22_00 = evaluate_telemetry_nudge(power_watts=1645.0, raw_timestamp=dt_22_00.timestamp())
    assert res_22_00["is_peak"] is False, "22:00:00 MUST be off-peak (exclusive boundary)"
    assert res_22_00["nudge_rule"] == "OFF_PEAK_HIGH_LOAD"
    assert "Peak Grid Hours" not in res_22_00["base_message"]
    assert "ToD tariffs" not in res_22_00["base_message"]
    print("PASS: Case 6 - 22:00:00 IST exclusive peak boundary works")

    # Case 7: Middle of the night (02:30:00 IST) - when server UTC raw hour would be 21:00 (which is 9 PM UTC!)
    # Server UTC: 2026-11-01 21:00:00 UTC
    dt_utc_21 = datetime(2026, 11, 1, 21, 0, 0, tzinfo=timezone.utc)
    res_utc = evaluate_telemetry_nudge(power_watts=1645.0, raw_timestamp=dt_utc_21.timestamp())
    # In IST, 21:00 UTC is 02:30 AM IST next day!
    assert res_utc["is_peak"] is False, "02:30 AM IST MUST NOT be flagged as peak, even though UTC hour is 21"
    assert res_utc["nudge_rule"] == "OFF_PEAK_HIGH_LOAD"
    assert "Peak Grid Hours" not in res_utc["base_message"]
    assert "02:30" in res_utc["current_time_ist"]
    print("PASS: Case 7 - UTC hour 21 converted to 02:30 AM IST; no raw UTC leakage")

    print("\nALL 7 LIVE ENERGY NUDGE EVALUATION TESTS PASSED!")


if __name__ == "__main__":
    test_nudge_evaluation()
