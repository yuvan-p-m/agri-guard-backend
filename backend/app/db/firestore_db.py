"""
Firestore Database Service Layer
Supports real Google Cloud Firestore via Firebase Admin SDK with fallback to Mock In-Memory Firestore.
"""
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from core.firebase import get_firestore_db, is_firebase_initialized

logger = logging.getLogger(__name__)

# Standard demo password hash for 'password123'
_DEMO_PW_HASH = "$2b$12$4SmmPL.R8uGTrLBuWGco7e0slbLqm7X9rY0sqtgP0GJtSE0KjF1fK"

# In-memory collections for mock mode
_mock_db: Dict[str, Dict[str, Dict[str, Any]]] = {
    "users": {
        "demo-user-1": {
            "id": "demo-user-1",
            "full_name": "Rajesh Kumar",
            "name": "Rajesh Kumar",
            "email": "kisan@farm.com",
            "password_hash": _DEMO_PW_HASH,
            "phone": "+91 98765 43210",
            "crop_type": "Citrus (Orange / Lemon)",
            "location": "Nagpur, Maharashtra",
            "role": "farmer",
            "farm_size_acres": 4.5,
            "farm_unit": "Acres",
            "state": "Maharashtra",
            "district": "Nagpur"
        },
        "demo-user-2": {
            "id": "demo-user-2",
            "full_name": "Farmer Partner",
            "name": "Farmer Partner",
            "email": "farmer@example.com",
            "password_hash": _DEMO_PW_HASH,
            "phone": "+91 91234 56789",
            "crop_type": "Citrus (Orange / Lemon)",
            "location": "Nagpur, Maharashtra",
            "role": "farmer",
            "farm_size_acres": 2.5,
            "farm_unit": "Acres",
            "state": "Maharashtra",
            "district": "Nagpur"
        }
    },
    "feedback": {},
    "weather_cache": {},
    "risk_scores": {},
}

import os
import json

LOCAL_DB_PATH = os.path.join(os.path.dirname(__file__), "local_db.json")

def _load_disk_db() -> dict:
    if os.path.exists(LOCAL_DB_PATH):
        try:
            with open(LOCAL_DB_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading local_db.json: {e}")
    return {}

def _save_disk_db():
    try:
        with open(LOCAL_DB_PATH, "w", encoding="utf-8") as f:
            json.dump(_mock_db, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving to local_db.json: {e}")

# Load saved users from disk
_disk_data = _load_disk_db()
if _disk_data and "users" in _disk_data:
    for u_id, u_data in _disk_data["users"].items():
        _mock_db["users"][u_id] = u_data

def _get_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ----------------------------------------------------
# USER & FARMER OPERATIONS
# ----------------------------------------------------

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    db = get_firestore_db()
    if db and is_firebase_initialized():
        try:
            docs = db.collection("users").where("email", "==", email).limit(1).stream()
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                return data
        except Exception as e:
            logger.error(f"Firestore get_user_by_email error: {e}")

    # Fallback to mock DB
    for doc_id, user in _mock_db["users"].items():
        if user.get("email") == email:
            user_copy = user.copy()
            user_copy["id"] = doc_id
            return user_copy
    return None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    db = get_firestore_db()
    if db and is_firebase_initialized():
        try:
            doc = db.collection("users").document(str(user_id)).get()
            if doc.exists:
                data = doc.to_dict()
                data["id"] = doc.id
                return data
        except Exception as e:
            logger.error(f"Firestore get_user_by_id error: {e}")

    # Fallback mock DB
    str_id = str(user_id)
    if str_id in _mock_db["users"]:
        data = _mock_db["users"][str_id].copy()
        data["id"] = str_id
        return data
    return None

def create_user(user_data: Dict[str, Any], custom_id: Optional[str] = None) -> Dict[str, Any]:
    db = get_firestore_db()
    now = _get_now_iso()
    user_data["created_at"] = user_data.get("created_at") or now
    doc_id = str(custom_id or user_data.get("id") or user_data.get("uid") or str(uuid.uuid4()))

    # Always store in _mock_db for instant fallback resilience and save to disk
    _mock_db["users"][doc_id] = user_data.copy()
    _save_disk_db()

    if db and is_firebase_initialized():
        try:
            db.collection("users").document(doc_id).set(user_data)
            user_data["id"] = doc_id
            return user_data
        except Exception as e:
            logger.error(f"Firestore create_user error: {e}")

    user_data["id"] = doc_id
    return user_data

def update_user(user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    db = get_firestore_db()
    doc_id = str(user_id)
    if db and is_firebase_initialized():
        try:
            db.collection("users").document(doc_id).update(update_data)
            return get_user_by_id(doc_id)
        except Exception as e:
            logger.error(f"Firestore update_user error: {e}")

    # Fallback to mock DB
    if doc_id in _mock_db["users"]:
        _mock_db["users"][doc_id].update(update_data)
        data = _mock_db["users"][doc_id].copy()
        data["id"] = doc_id
        return data
    return None


# ----------------------------------------------------
# DISEASE RECORDS OPERATIONS
# ----------------------------------------------------

def create_disease_record(record: Dict[str, Any]) -> Dict[str, Any]:
    db = get_firestore_db()
    doc_id = str(uuid.uuid4())
    record["timestamp"] = record.get("timestamp") or _get_now_iso()

    if db and is_firebase_initialized():
        try:
            db.collection("disease_records").document(doc_id).set(record)
            record["id"] = doc_id
            return record
        except Exception as e:
            logger.error(f"Firestore create_disease_record error: {e}")

    _mock_db["disease_records"][doc_id] = record
    record["id"] = doc_id
    return record

def get_disease_records(farmer_id: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
    db = get_firestore_db()
    results = []

    if db and is_firebase_initialized():
        try:
            query = db.collection("disease_records")
            if farmer_id:
                query = query.where("farmer_id", "==", str(farmer_id))
            docs = query.limit(limit).stream()
            for doc in docs:
                d = doc.to_dict()
                d["id"] = doc.id
                results.append(d)
            return results
        except Exception as e:
            logger.error(f"Firestore get_disease_records error: {e}")

    # Fallback mock DB
    for doc_id, item in _mock_db["disease_records"].items():
        if farmer_id is None or str(item.get("farmer_id")) == str(farmer_id):
            copy_item = item.copy()
            copy_item["id"] = doc_id
            results.append(copy_item)
    return results[:limit]


# ----------------------------------------------------
# SENSOR READINGS OPERATIONS
# ----------------------------------------------------

def add_sensor_reading(reading: Dict[str, Any]) -> Dict[str, Any]:
    db = get_firestore_db()
    doc_id = str(uuid.uuid4())
    reading["timestamp"] = reading.get("timestamp") or _get_now_iso()

    if db and is_firebase_initialized():
        try:
            db.collection("sensor_readings").document(doc_id).set(reading)
            reading["id"] = doc_id
            return reading
        except Exception as e:
            logger.error(f"Firestore add_sensor_reading error: {e}")

    _mock_db["sensor_readings"][doc_id] = reading
    reading["id"] = doc_id
    return reading

def get_latest_sensor_reading(farmer_id: Optional[str] = None, device_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    db = get_firestore_db()
    if db and is_firebase_initialized():
        try:
            query = db.collection("sensor_readings")
            if farmer_id:
                query = query.where("farmer_id", "==", str(farmer_id))
            if device_id:
                query = query.where("device_id", "==", str(device_id))
            docs = query.limit(10).stream()
            items = []
            for doc in docs:
                d = doc.to_dict()
                d["id"] = doc.id
                items.append(d)
            if items:
                items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
                return items[0]
        except Exception as e:
            logger.error(f"Firestore get_latest_sensor_reading error: {e}")

    # Fallback mock DB
    matches = []
    for doc_id, item in _mock_db["sensor_readings"].items():
        if farmer_id and str(item.get("farmer_id")) != str(farmer_id):
            continue
        if device_id and item.get("device_id") != device_id:
            continue
        item_copy = item.copy()
        item_copy["id"] = doc_id
        matches.append(item_copy)

    if matches:
        matches.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return matches[0]

    # Default mock reading if empty
    return {
        "id": "mock-sensor-1",
        "device_id": device_id or "NODE_01",
        "farmer_id": farmer_id or "1",
        "npk": {"n": 45, "p": 22, "k": 35},
        "ph": 6.8,
        "moisture": 42.0,
        "temperature": 27.5,
        "humidity": 65.0,
        "timestamp": _get_now_iso()
    }


# ----------------------------------------------------
# FEEDBACK OPERATIONS
# ----------------------------------------------------

def add_feedback(feedback: Dict[str, Any]) -> Dict[str, Any]:
    db = get_firestore_db()
    doc_id = str(uuid.uuid4())
    feedback["timestamp"] = feedback.get("timestamp") or _get_now_iso()

    if db and is_firebase_initialized():
        try:
            db.collection("feedback").document(doc_id).set(feedback)
            feedback["id"] = doc_id
            return feedback
        except Exception as e:
            logger.error(f"Firestore add_feedback error: {e}")

    _mock_db["feedback"][doc_id] = feedback
    feedback["id"] = doc_id
    return feedback

def get_feedback_records(farmer_id: Optional[str] = None) -> List[Dict[str, Any]]:
    db = get_firestore_db()
    results = []

    if db and is_firebase_initialized():
        try:
            query = db.collection("feedback")
            if farmer_id:
                query = query.where("farmer_id", "==", str(farmer_id))
            docs = query.stream()
            for doc in docs:
                d = doc.to_dict()
                d["id"] = doc.id
                results.append(d)
            return results
        except Exception as e:
            logger.error(f"Firestore get_feedback_records error: {e}")

    for doc_id, item in _mock_db["feedback"].items():
        if farmer_id is None or str(item.get("farmer_id")) == str(farmer_id):
            copy_item = item.copy()
            copy_item["id"] = doc_id
            results.append(copy_item)
    return results


# ----------------------------------------------------
# WEATHER CACHE OPERATIONS
# ----------------------------------------------------

def get_weather_cache(lat: float, lng: float) -> Optional[Dict[str, Any]]:
    db = get_firestore_db()
    if db and is_firebase_initialized():
        try:
            docs = db.collection("weather_cache").where("location_lat", "==", lat).where("location_lng", "==", lng).limit(1).stream()
            for doc in docs:
                d = doc.to_dict()
                d["id"] = doc.id
                return d
        except Exception as e:
            logger.error(f"Firestore get_weather_cache error: {e}")

    for doc_id, item in _mock_db["weather_cache"].items():
        if abs(item.get("location_lat", 0) - lat) < 0.01 and abs(item.get("location_lng", 0) - lng) < 0.01:
            copy_item = item.copy()
            copy_item["id"] = doc_id
            return copy_item
    return None

def set_weather_cache(lat: float, lng: float, forecast: Any) -> Dict[str, Any]:
    db = get_firestore_db()
    doc_id = f"weather_{lat}_{lng}"
    record = {
        "location_lat": lat,
        "location_lng": lng,
        "forecast": forecast,
        "cached_at": _get_now_iso()
    }

    if db and is_firebase_initialized():
        try:
            db.collection("weather_cache").document(doc_id).set(record)
            record["id"] = doc_id
            return record
        except Exception as e:
            logger.error(f"Firestore set_weather_cache error: {e}")

    _mock_db["weather_cache"][doc_id] = record
    record["id"] = doc_id
    return record


# ----------------------------------------------------
# RISK SCORES OPERATIONS
# ----------------------------------------------------

def save_risk_score(farmer_id: str, overall_score: float, high_risk_diseases: Any) -> Dict[str, Any]:
    db = get_firestore_db()
    doc_id = str(uuid.uuid4())
    record = {
        "farmer_id": str(farmer_id),
        "overall_score": overall_score,
        "high_risk_diseases": high_risk_diseases,
        "calculated_at": _get_now_iso()
    }

    if db and is_firebase_initialized():
        try:
            db.collection("risk_scores").document(doc_id).set(record)
            record["id"] = doc_id
            return record
        except Exception as e:
            logger.error(f"Firestore save_risk_score error: {e}")

    _mock_db["risk_scores"][doc_id] = record
    record["id"] = doc_id
    return record

def get_latest_risk_score(farmer_id: str) -> Optional[Dict[str, Any]]:
    db = get_firestore_db()
    if db and is_firebase_initialized():
        try:
            docs = db.collection("risk_scores").where("farmer_id", "==", str(farmer_id)).limit(10).stream()
            items = []
            for doc in docs:
                d = doc.to_dict()
                d["id"] = doc.id
                items.append(d)
            if items:
                items.sort(key=lambda x: x.get("calculated_at", ""), reverse=True)
                return items[0]
        except Exception as e:
            logger.error(f"Firestore get_latest_risk_score error: {e}")

    matches = [v for k, v in _mock_db["risk_scores"].items() if str(v.get("farmer_id")) == str(farmer_id)]
    if matches:
        matches.sort(key=lambda x: x.get("calculated_at", ""), reverse=True)
        return matches[0]

    return {
        "id": "mock-risk-1",
        "farmer_id": str(farmer_id),
        "overall_score": 18.5,
        "high_risk_diseases": ["Early Blight"],
        "calculated_at": _get_now_iso()
    }
