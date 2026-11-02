"""
CI Guard Test: Backend Zero-Hardcoding & Security Checks.
Ensures microservice code adheres to the zero-hardcoding contract, loads configuration
dynamically from Firestore / seed cache, and has no leaked credentials or banned mock user IDs.
"""

import os
import re
import pytest

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MICROSERVICE_DIR = os.path.join(REPO_ROOT, "microservice")


def test_microservice_no_banned_tokens():
    """Ensure no banned mock tokens, credentials, or obsolete user IDs appear in microservice code."""
    banned_tokens = [
        "user_12345",
        "Password123",
        "DEMO_USERS",
        "INITIAL_",
        "geda_esp32_secret_key_2026"
    ]

    target_extensions = (".py", ".ino", ".json")
    violations = []

    for root, dirs, files in os.walk(MICROSERVICE_DIR):
        # Skip git or cache folders
        if "__pycache__" in root or ".pytest_cache" in root:
            continue
        for file in files:
            if file.endswith(target_extensions):
                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, REPO_ROOT)
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    for token in banned_tokens:
                        if token in content:
                            violations.append(f"{rel_path} contains banned token '{token}'")

    assert not violations, "Banned tokens found in microservice:\n" + "\n".join(violations)


def test_microservice_dynamic_config_contracts():
    """Verify microservice main.py implements caching, rate limiting, and device checks."""
    main_py_path = os.path.join(MICROSERVICE_DIR, "main.py")
    assert os.path.exists(main_py_path), "microservice/main.py not found"

    with open(main_py_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Must implement in-memory configuration cache
    assert "get_remote_or_cached_config" in content
    assert "CONFIG_CACHE_TTL" in content

    # Must implement device allow-list check and token bucket rate limiting
    assert "get_device_doc" in content
    assert "check_rate_limit" in content

    # Must expose root and health endpoints with required metrics
    assert "uptime_seconds" in content
    assert "firestore_connected" in content
    assert "device_count" in content
    assert "git_sha" in content


def test_nudge_engine_dynamic_rules():
    """Verify nudge engine supports dynamic rules injection."""
    nudge_py_path = os.path.join(MICROSERVICE_DIR, "nudge_engine.py")
    assert os.path.exists(nudge_py_path), "microservice/nudge_engine.py not found"

    with open(nudge_py_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "load_default_nudge_rules" in content
    assert "highLoadThresholdWatts" in content
    assert "peakStartHour" in content
    assert "peakEndHour" in content

