"""
Shared sensor data service — single source of truth for live IoT sensor readings.

Fetches data from Firebase Realtime Database (ESP32 7-in-1 RS485 soil sensor)
and interprets raw values into agronomic status + farmer-facing messages.

Used by: IoT Sensor Tab (Part 1), Crop Recommendation (Part 2), Disease Progression Risk (Part 3).
Do NOT duplicate the Firebase-fetch logic elsewhere.
"""

import os
import logging
import requests
from typing import Optional

logger = logging.getLogger(__name__)

FIREBASE_RTDB_SENSOR_URL = os.getenv(
    "FIREBASE_RTDB_SENSOR_URL",
    "https://esp32-19748-default-rtdb.asia-southeast1.firebasedatabase.app/sensors.json"
)

# ─── Agronomic Reference Ranges ───────────────────────────────────────────────
# Standard agronomic thresholds for status classification.
# Values of exactly 0 are treated as "sensor not connected / no reading" unless
# explicitly valid (pump is a boolean flag, rain can genuinely be 0).

SENSOR_RANGES = {
    "ph": {
        "unit": "",
        "optimal": (6.0, 7.5),
        "low": (0.01, 6.0),
        "high": (7.5, 14.0),
        "zero_means_no_reading": True,
        "explanation": {
            "Optimal": "Soil pH is in the ideal range for most crops — nutrients are readily available.",
            "Low": "Soil is acidic — consider liming to raise pH for better nutrient absorption.",
            "High": "Soil is alkaline — iron and zinc availability may be reduced.",
            "Critical": "pH is extremely out of range — soil amendment urgently needed.",
            "No reading": "pH sensor shows no reading — check probe connection."
        }
    },
    "humidity": {
        "unit": "%",
        "optimal": (40, 70),
        "low": (0.01, 40),
        "high": (70, 100),
        "zero_means_no_reading": True,
        "explanation": {
            "Optimal": "Air humidity supports healthy transpiration and leaf function.",
            "Low": "Low humidity — crops may wilt; increase irrigation if possible.",
            "High": "High humidity — elevated risk of fungal diseases like mildew.",
            "Critical": "Extreme humidity level — monitor closely for disease outbreaks.",
            "No reading": "Humidity sensor shows no reading — check hardware connection."
        }
    },
    "temperature": {
        "unit": "°C",
        "optimal": (18, 30),
        "low": (0.01, 18),
        "high": (30, 55),
        "zero_means_no_reading": True,
        "explanation": {
            "Optimal": "Temperature is comfortable for most crops — good growing conditions.",
            "Low": "Cool conditions — cold-sensitive crops may suffer; consider protective covers.",
            "High": "Hot conditions — crops may face heat stress; ensure adequate watering.",
            "Critical": "Temperature is extreme — immediate protective action recommended.",
            "No reading": "Temperature sensor shows no reading — check probe."
        }
    },
    "moisture": {
        "unit": "%",
        "optimal": (40, 60),
        "low": (0.01, 40),
        "high": (60, 100),
        "zero_means_no_reading": True,
        "explanation": {
            "Optimal": "Soil moisture is ideal — roots have good water access without waterlogging.",
            "Low": "Soil is dry — irrigation needed to prevent water stress.",
            "High": "Soil is waterlogged — reduce irrigation; ensure drainage to prevent root rot.",
            "Critical": "Extreme moisture level — check irrigation system and field drainage.",
            "No reading": "Soil moisture sensor shows no reading — check hardware connection."
        }
    },
    "ec": {
        "unit": "µS/cm",
        "optimal": (50, 200),
        "low": (0.01, 50),
        "high": (200, 2000),
        "zero_means_no_reading": True,
        "explanation": {
            "Optimal": "Electrical conductivity indicates balanced soil salinity — nutrients available.",
            "Low": "Low EC suggests nutrient-poor soil — consider fertilizer application.",
            "High": "High EC indicates salt buildup — flush soil with clean water if persistent.",
            "Critical": "Extreme EC value — soil salinity may be toxic to roots.",
            "No reading": "EC sensor shows no reading — check electrode connection."
        }
    },
    "nitrogen": {
        "unit": "mg/kg",
        "optimal": (80, 200),
        "low": (0.01, 80),
        "high": (200, 500),
        "zero_means_no_reading": True,
        "explanation": {
            "Optimal": "Nitrogen level supports healthy leaf growth and chlorophyll production.",
            "Low": "Nitrogen deficient — apply urea or organic nitrogen source for green growth.",
            "High": "Excess nitrogen — may cause excessive vegetative growth at the expense of fruit.",
            "Critical": "Extreme nitrogen level — adjust fertilization immediately.",
            "No reading": "Nitrogen sensor shows no reading — check RS485 connection."
        }
    },
    "phosphorous": {
        "unit": "mg/kg",
        "optimal": (40, 100),
        "low": (0.01, 40),
        "high": (100, 500),
        "zero_means_no_reading": True,
        "explanation": {
            "Optimal": "Phosphorus level supports strong root development and flowering.",
            "Low": "Phosphorus deficient — apply DAP or rock phosphate for root and bloom health.",
            "High": "Excess phosphorus — can lock out other micronutrients like zinc.",
            "Critical": "Extreme phosphorus level — review fertilization plan.",
            "No reading": "Phosphorus sensor shows no reading — check RS485 connection."
        }
    },
    "potassium": {
        "unit": "mg/kg",
        "optimal": (100, 250),
        "low": (0.01, 100),
        "high": (250, 500),
        "zero_means_no_reading": True,
        "explanation": {
            "Optimal": "Potassium level supports strong cell walls, disease resistance, and fruit quality.",
            "Low": "Potassium deficient — apply MOP or SOP for better fruit and stress tolerance.",
            "High": "Excess potassium — may interfere with magnesium and calcium uptake.",
            "Critical": "Extreme potassium level — adjust fertilization.",
            "No reading": "Potassium sensor shows no reading — check RS485 connection."
        }
    },
    "rain": {
        "unit": "",
        "optimal": (0, 1),  # Boolean-like: 0 = no rain, 1 = rain detected
        "low": None,
        "high": None,
        "zero_means_no_reading": False,  # Rain = 0 genuinely means no rain
        "explanation": {
            "Optimal": "No rain currently detected — safe for spray operations.",
            "High": "Rain detected — delay chemical spraying; ensure field drainage.",
            "No reading": "Rain sensor unavailable."
        }
    },
    "pump": {
        "unit": "",
        "optimal": (0, 1),
        "low": None,
        "high": None,
        "zero_means_no_reading": False,  # Pump = 0 genuinely means pump off
        "explanation": {
            "Optimal": "Pump is off — no active irrigation.",
            "High": "Pump is on — irrigation system is actively running.",
            "No reading": "Pump status unavailable."
        }
    }
}


def interpret_sensor_value(key: str, value) -> dict:
    """
    Interpret a single raw sensor value into status + farmer-facing message.

    Returns:
        {
            "value": <raw_value>,
            "unit": <unit_string>,
            "status": "Optimal" | "Low" | "High" | "Critical" | "No reading",
            "explanation": <farmer-facing string>
        }
    """
    config = SENSOR_RANGES.get(key)
    if config is None:
        return {
            "value": value,
            "unit": "",
            "status": "Unknown",
            "explanation": f"No reference range defined for '{key}'."
        }

    unit = config["unit"]

    # Handle missing or None values
    if value is None:
        return {
            "value": None,
            "unit": unit,
            "status": "No reading",
            "explanation": config["explanation"].get("No reading", "Sensor data unavailable.")
        }

    # Convert to float for comparison
    try:
        val = float(value)
    except (ValueError, TypeError):
        return {
            "value": value,
            "unit": unit,
            "status": "No reading",
            "explanation": config["explanation"].get("No reading", "Sensor data unavailable.")
        }

    # Check if zero means "no reading" for this sensor
    if val == 0 and config.get("zero_means_no_reading", False):
        return {
            "value": 0,
            "unit": unit,
            "status": "No reading",
            "explanation": config["explanation"].get("No reading", "Sensor shows no reading — check connection.")
        }

    # Special handling for rain and pump (boolean or analog ADC)
    if key == "pump":
        is_pump_on = bool(val > 0)
        return {
            "value": 1 if is_pump_on else 0,
            "unit": unit,
            "status": "Optimal",
            "explanation": config["explanation"].get("High" if is_pump_on else "Optimal", "Active." if is_pump_on else "Inactive.")
        }

    if key == "rain":
        # In ESP32 analog ADC, 4095 means dry (no rain); lower values (< 2500) indicate moisture/rain.
        # Alternatively, digital 1 means rain, 0 means dry.
        is_raining = (0 < val < 2500) or (val == 1.0)
        return {
            "value": val,
            "unit": unit,
            "status": "High" if is_raining else "Optimal",
            "explanation": config["explanation"].get("High" if is_raining else "Optimal", "Rain detected." if is_raining else "No rain detected.")
        }

    # Standard range classification
    opt_lo, opt_hi = config["optimal"]
    low_range = config.get("low")
    high_range = config.get("high")

    if opt_lo <= val <= opt_hi:
        status = "Optimal"
    elif low_range and low_range[0] <= val < low_range[1]:
        status = "Low"
    elif high_range and high_range[0] < val <= high_range[1]:
        status = "High"
    else:
        status = "Critical"

    return {
        "value": val,
        "unit": unit,
        "status": status,
        "explanation": config["explanation"].get(status, "")
    }


def fetch_live_sensor_data() -> Optional[dict]:
    """
    Fetch current sensor snapshot from Firebase Realtime Database.
    Returns the raw sensor dict or None if unavailable.

    Firebase RTDB path: /sensors.json
    Expected fields: ec, humidity, moisture, nitrogen, ph, phosphorous,
                     potassium, pump, rain, temperature
    """
    url = os.getenv("FIREBASE_RTDB_SENSOR_URL", FIREBASE_RTDB_SENSOR_URL)
    try:
        response = requests.get(url, timeout=6)
        if response.status_code == 200:
            data = response.json()
            if data and isinstance(data, dict):
                logger.info(f"Fetched live sensor data from Firebase RTDB: {data}")
                return data
            else:
                logger.warning("Firebase RTDB returned empty or non-dict sensor data.")
                return None
        else:
            logger.warning(f"Firebase RTDB returned status {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Failed to fetch sensor data from Firebase RTDB: {e}")
        return None


def get_interpreted_sensor_snapshot() -> dict:
    """
    Fetch + interpret all sensor values.
    Returns a dict with raw data, interpreted readings, and hardware warnings.

    This is the SINGLE shared function used across all three integration parts.
    """
    raw_data = fetch_live_sensor_data()

    if raw_data is None:
        return {
            "available": False,
            "raw": None,
            "interpreted": {},
            "hardware_warning": "Unable to connect to sensor hardware — data unavailable.",
            "zero_count": 0
        }

    interpreted = {}
    zero_count = 0
    sensor_keys = ["ec", "humidity", "moisture", "nitrogen", "ph",
                   "phosphorous", "potassium", "pump", "rain", "temperature"]

    for key in sensor_keys:
        value = raw_data.get(key)
        result = interpret_sensor_value(key, value)
        interpreted[key] = result

        # Count sensors with zero/no-reading (exclude pump and rain which can validly be 0)
        if key not in ("pump", "rain") and result["status"] == "No reading":
            zero_count += 1

    hardware_warning = None
    if zero_count >= 3:
        hardware_warning = (
            "Some sensors show no reading — check hardware connection. "
            f"{zero_count} sensors returned 0 or null values."
        )

    return {
        "available": True,
        "raw": raw_data,
        "interpreted": interpreted,
        "hardware_warning": hardware_warning,
        "zero_count": zero_count
    }
