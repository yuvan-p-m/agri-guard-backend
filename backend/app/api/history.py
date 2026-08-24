from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from db.session import get_db
from db.models import DiseaseRecord, SensorReading, RiskScore, Feedback
from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/history", tags=["Farm History"])

@router.get("/dashboard")
async def get_farm_history_dashboard(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive farm history dashboard"""
    
    try:
        farmer_id = current_user["user_id"]
        
        # Get statistics
        all_diseases = db.query(DiseaseRecord).filter(
            DiseaseRecord.farmer_id == farmer_id
        ).all()
        
        all_feedback = db.query(Feedback).filter(
            Feedback.farmer_id == farmer_id
        ).all()
        
        recent_sensors = db.query(SensorReading).filter(
            SensorReading.farmer_id == farmer_id
        ).order_by(SensorReading.timestamp.desc()).limit(10).all()
        
        # Calculate statistics
        total_detections = len(all_diseases)
        diseases_with_positive_feedback = sum(1 for f in all_feedback if f.worked)
        unique_diseases = set(d.predicted_disease for d in all_diseases)
        
        # Find most recurring disease
        most_recurring = None
        if all_diseases:
            disease_counts = {}
            for d in all_diseases:
                disease_counts[d.predicted_disease] = disease_counts.get(d.predicted_disease, 0) + 1
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
            "recent_sensor_count": len(recent_sensors),
            "last_sensor_reading": {
                "timestamp": recent_sensors[0].timestamp if recent_sensors else None,
                "temperature": recent_sensors[0].temperature if recent_sensors else None,
                "humidity": recent_sensors[0].humidity if recent_sensors else None
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
async def get_disease_history(
    limit: int = 50,
    days: int = 365,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get disease detection history"""
    
    farmer_id = current_user["user_id"]
    since_date = datetime.utcnow() - timedelta(days=days)
    
    records = db.query(DiseaseRecord).filter(
        DiseaseRecord.farmer_id == farmer_id,
        DiseaseRecord.timestamp >= since_date
    ).order_by(DiseaseRecord.timestamp.desc()).limit(limit).all()
    
    return {
        "total": len(records),
        "period_days": days,
        "records": [
            {
                "id": r.id,
                "disease": r.predicted_disease,
                "confidence": r.confidence,
                "severity": r.severity,
                "treatment": r.treatment,
                "timestamp": r.timestamp,
                "image_path": r.image_path
            }
            for r in records
        ]
    }

@router.get("/sensor-readings")
async def get_sensor_history(
    limit: int = 100,
    days: int = 30,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sensor reading history"""
    
    farmer_id = current_user["user_id"]
    since_date = datetime.utcnow() - timedelta(days=days)
    
    readings = db.query(SensorReading).filter(
        SensorReading.farmer_id == farmer_id,
        SensorReading.timestamp >= since_date
    ).order_by(SensorReading.timestamp.desc()).limit(limit).all()
    
    # Calculate statistics
    if readings:
        avg_temp = sum(r.temperature for r in readings) / len(readings)
        avg_humidity = sum(r.humidity for r in readings) / len(readings)
        avg_moisture = sum(r.moisture for r in readings) / len(readings)
    else:
        avg_temp = avg_humidity = avg_moisture = 0
    
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
                "id": r.id,
                "timestamp": r.timestamp,
                "device_id": r.device_id,
                "temperature": r.temperature,
                "humidity": r.humidity,
                "moisture": r.moisture,
                "npk": r.npk,
                "ph": r.ph
            }
            for r in readings
        ]
    }

@router.get("/trends")
async def get_farm_trends(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get farm trends over time"""
    
    farmer_id = current_user["user_id"]
    
    # Last 12 months disease count
    past_year = datetime.utcnow() - timedelta(days=365)
    diseases_year = db.query(DiseaseRecord).filter(
        DiseaseRecord.farmer_id == farmer_id,
        DiseaseRecord.timestamp >= past_year
    ).all()
    
    # Group by month
    monthly_data = {}
    for record in diseases_year:
        month_key = record.timestamp.strftime("%Y-%m")
        monthly_data[month_key] = monthly_data.get(month_key, 0) + 1
    
    # Disease frequency
    disease_frequency = {}
    for record in diseases_year:
        disease_frequency[record.predicted_disease] = disease_frequency.get(record.predicted_disease, 0) + 1
    
    return {
        "diseases_past_year": len(diseases_year),
        "monthly_breakdown": monthly_data,
        "disease_frequency": disease_frequency,
        "trend": "Improving" if len(diseases_year) < 5 else "Stable" if len(diseases_year) < 15 else "Concerning"
    }

@router.get("/summary")
async def get_history_summary(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overall farm history summary"""
    
    farmer_id = current_user["user_id"]
    
    diseases = db.query(DiseaseRecord).filter(DiseaseRecord.farmer_id == farmer_id).all()
    feedbacks = db.query(Feedback).filter(Feedback.farmer_id == farmer_id).all()
    sensors = db.query(SensorReading).filter(SensorReading.farmer_id == farmer_id).all()
    
    return {
        "summary": {
            "total_disease_detections": len(diseases),
            "unique_diseases": len(set(d.predicted_disease for d in diseases)),
            "feedback_submitted": len(feedbacks),
            "correct_predictions": sum(1 for f in feedbacks if f.worked),
            "sensor_readings_collected": len(sensors),
            "days_since_first_detection": (datetime.utcnow() - diseases[0].timestamp).days if diseases else 0
        },
        "achievements": [
            {"title": "First Detection", "unlocked": len(diseases) >= 1},
            {"title": "Feedback Expert", "unlocked": len(feedbacks) >= 5},
            {"title": "Sensor Master", "unlocked": len(sensors) >= 50},
            {"title": "Disease Tracker", "unlocked": len(set(d.predicted_disease for d in diseases)) >= 3},
            {"title": "Prediction Ace", "unlocked": sum(1 for f in feedbacks if f.worked) >= len(feedbacks) and len(feedbacks) > 0}
        ]
    }
