from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.session import get_db
from db.models import SensorReading
from schemas.common import SensorReading as SensorReadingSchema
from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/sensors", tags=["Sensor Integration"])

@router.post("/reading")
async def add_sensor_reading(
    payload: SensorReadingSchema,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add sensor reading (IoT device data)"""
    
    try:
        farmer_id = current_user["user_id"]
        
        # Create sensor record
        reading = SensorReading(
            farmer_id=farmer_id,
            device_id=payload.device_id,
            npk={"n": payload.npk.n, "p": payload.npk.p, "k": payload.npk.k},
            ph=payload.ph,
            moisture=payload.moisture,
            temperature=payload.temperature,
            humidity=payload.humidity
        )
        
        db.add(reading)
        db.commit()
        db.refresh(reading)
        
        logger.info(f"Sensor reading saved: {reading.id} for farmer {farmer_id} from device {payload.device_id}")
        
        return {
            "status": "ok",
            "reading_id": reading.id,
            "timestamp": reading.timestamp
        }
    
    except Exception as e:
        logger.error(f"Sensor reading error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save sensor reading"
        )

@router.get("/latest")
async def get_latest_readings(
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get latest sensor readings for farmer"""
    
    farmer_id = current_user["user_id"]
    
    readings = db.query(SensorReading).filter(
        SensorReading.farmer_id == farmer_id
    ).order_by(SensorReading.timestamp.desc()).limit(limit).all()
    
    return {
        "total": len(readings),
        "readings": [
            {
                "id": r.id,
                "device_id": r.device_id,
                "timestamp": r.timestamp,
                "npk": r.npk,
                "ph": r.ph,
                "moisture": r.moisture,
                "temperature": r.temperature,
                "humidity": r.humidity
            }
            for r in readings
        ]
    }

@router.get("/status")
async def sensor_status(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current sensor health status"""
    
    farmer_id = current_user["user_id"]
    
    # Get latest reading
    latest = db.query(SensorReading).filter(
        SensorReading.farmer_id == farmer_id
    ).order_by(SensorReading.timestamp.desc()).first()
    
    if not latest:
        return {
            "status": "no_data",
            "message": "No sensor data yet"
        }
    
    from datetime import datetime, timedelta
    time_diff = datetime.utcnow() - latest.timestamp
    
    # Device is healthy if data received in last 1 hour
    is_healthy = time_diff < timedelta(hours=1)
    
    return {
        "status": "healthy" if is_healthy else "offline",
        "last_reading": latest.timestamp,
        "minutes_ago": int(time_diff.total_seconds() / 60),
        "latest_values": {
            "npk": latest.npk,
            "ph": latest.ph,
            "moisture": latest.moisture,
            "temperature": latest.temperature,
            "humidity": latest.humidity
        }
    }
