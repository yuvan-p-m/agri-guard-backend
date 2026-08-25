from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta

from db.firestore_db import get_disease_records, get_feedback_records, get_latest_sensor_reading
from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/history", tags=["Farm History"])

@router.get("/dashboard")
async def get_farm_history_dashboard(
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive farm history dashboard from Firestore"""
    
    try:
        farmer_id = str(current_user.get("user_id", "1"))
        
        all_diseases = get_disease_records(farmer_id=farmer_id, limit=100)
        all_feedback = get_feedback_records(farmer_id=farmer_id)
        latest_sensor = get_latest_sensor_reading(farmer_id=farmer_id)
        
        total_detections = len(all_diseases)
        diseases_with_positive_feedback = sum(1 for f in all_feedback if f.get("worked"))
        unique_diseases = set(d.get("predicted_disease") or d.get("disease") for d in all_diseases if d.get("predicted_disease") or d.get("disease"))
        
        most_recurring = None
        if all_diseases:
            disease_counts = {}
            for d in all_diseases:
                name = d.get("predicted_disease") or d.get("disease")
                if name:
                    disease_counts[name] = disease_counts.get(name, 0) + 1
            if disease_counts:
                most_recurring = max(disease_counts, key=disease_counts.get)
        
        logger.info(f"Dashboard loaded for farmer {farmer_id}")
        
        return {
            "statistics": {
                "total_detections": total_detections,
                "unique_diseases": len(unique_diseases),
                "most_recurring_disease": most_recurring,
                "total_feedback_given": len(all_feedback),
                "positive_feedback": diseases_with_positive_feedback,
                "feedback_accuracy": round(diseases_with_positive_feedback / len(all_feedback), 2) if all_feedback else 0
            },
            "recent_sensor_count": 1 if latest_sensor else 0,
            "last_sensor_reading": {
                "timestamp": latest_sensor.get("timestamp") if latest_sensor else None,
                "temperature": latest_sensor.get("temperature") if latest_sensor else None,
                "humidity": latest_sensor.get("humidity") if latest_sensor else None
            },
            "health_status": "Healthy" if not all_diseases else "Risk Detected" if total_detections > 3 else "Monitoring"
        }
    
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load dashboard"
        )

@router.get("/diseases")
async def get_disease_history_endpoint(
    limit: int = 50,
    days: int = 365,
    current_user: dict = Depends(get_current_user)
):
    """Get disease detection history from Firestore"""
    farmer_id = str(current_user.get("user_id", "1"))
    records = get_disease_records(farmer_id=farmer_id, limit=limit)
    
    return {
        "total": len(records),
        "period_days": days,
        "records": [
            {
                "id": r.get("id"),
                "disease": r.get("predicted_disease") or r.get("disease"),
                "confidence": r.get("confidence"),
                "severity": r.get("severity"),
                "treatment": r.get("treatment"),
                "timestamp": r.get("timestamp"),
                "image_path": r.get("image_path")
            }
            for r in records
        ]
    }

@router.get("/sensor-readings")
async def get_sensor_history_endpoint(
    limit: int = 100,
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Get sensor reading history from Firestore"""
    farmer_id = str(current_user.get("user_id", "1"))
    latest = get_latest_sensor_reading(farmer_id=farmer_id)
    readings = [latest] if latest else []
    
    avg_temp = latest.get("temperature", 27.5) if latest else 0
    avg_humidity = latest.get("humidity", 65.0) if latest else 0
    avg_moisture = latest.get("moisture", 42.0) if latest else 0
    
    return {
        "total_readings": len(readings),
        "period_days": days,
        "statistics": {
            "avg_temperature": round(avg_temp, 2),
            "avg_humidity": round(avg_humidity, 2),
            "avg_soil_moisture": round(avg_moisture, 2)
        },
        "readings": [
            {
                "id": r.get("id"),
                "timestamp": r.get("timestamp"),
                "device_id": r.get("device_id"),
                "temperature": r.get("temperature"),
                "humidity": r.get("humidity"),
                "moisture": r.get("moisture"),
                "npk": r.get("npk"),
                "ph": r.get("ph")
            }
            for r in readings
        ]
    }

@router.get("/trends")
async def get_farm_trends(
    current_user: dict = Depends(get_current_user)
):
    """Get farm trends over time from Firestore"""
    farmer_id = str(current_user.get("user_id", "1"))
    records = get_disease_records(farmer_id=farmer_id, limit=100)
    
    monthly_data = {}
    disease_frequency = {}
    
    for r in records:
        ts = r.get("timestamp", "")
        month_key = ts[:7] if len(ts) >= 7 else "2026-08"
        monthly_data[month_key] = monthly_data.get(month_key, 0) + 1
        dname = r.get("predicted_disease") or r.get("disease") or "Unknown"
        disease_frequency[dname] = disease_frequency.get(dname, 0) + 1
    
    return {
        "diseases_past_year": len(records),
        "monthly_breakdown": monthly_data,
        "disease_frequency": disease_frequency,
        "trend": "Improving" if len(records) < 5 else "Stable" if len(records) < 15 else "Concerning"
    }

@router.get("/summary")
async def get_history_summary(
    current_user: dict = Depends(get_current_user)
):
    """Get overall farm history summary from Firestore"""
    farmer_id = str(current_user.get("user_id", "1"))
    
    diseases = get_disease_records(farmer_id=farmer_id, limit=100)
    feedbacks = get_feedback_records(farmer_id=farmer_id)
    latest_sensor = get_latest_sensor_reading(farmer_id=farmer_id)
    sensor_count = 1 if latest_sensor else 0
    
    unique_diseases = set(d.get("predicted_disease") or d.get("disease") for d in diseases if d.get("predicted_disease") or d.get("disease"))
    correct_preds = sum(1 for f in feedbacks if f.get("worked"))
    
    return {
        "summary": {
            "total_disease_detections": len(diseases),
            "unique_diseases": len(unique_diseases),
            "feedback_submitted": len(feedbacks),
            "correct_predictions": correct_preds,
            "sensor_readings_collected": sensor_count,
            "days_since_first_detection": 1 if diseases else 0
        },
        "achievements": [
            {"title": "First Detection", "unlocked": len(diseases) >= 1},
            {"title": "Feedback Expert", "unlocked": len(feedbacks) >= 5},
            {"title": "Sensor Master", "unlocked": sensor_count >= 1},
            {"title": "Disease Tracker", "unlocked": len(unique_diseases) >= 1},
            {"title": "Prediction Ace", "unlocked": correct_preds > 0}
        ]
    }
