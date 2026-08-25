from fastapi import APIRouter, Depends, HTTPException, status

from db.firestore_db import add_sensor_reading, get_latest_sensor_reading
from schemas.common import SensorReading as SensorReadingSchema
from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/sensors", tags=["Sensor Integration"])

@router.post("/reading")
async def save_sensor_reading(
    payload: SensorReadingSchema,
    current_user: dict = Depends(get_current_user)
):
    """Add sensor reading (IoT device data) to Firestore"""
    
    try:
        farmer_id = str(current_user.get("user_id", "1"))
        
        reading_data = {
            "farmer_id": farmer_id,
            "device_id": payload.device_id,
            "npk": {"n": payload.npk.n, "p": payload.npk.p, "k": payload.npk.k},
            "ph": payload.ph,
            "moisture": payload.moisture,
            "temperature": payload.temperature,
            "humidity": payload.humidity
        }
        
        saved = add_sensor_reading(reading_data)
        doc_id = str(saved.get("id"))
        
        logger.info(f"Sensor reading saved: {doc_id} for farmer {farmer_id} from device {payload.device_id}")
        
        return {
            "status": "ok",
            "reading_id": doc_id,
            "timestamp": saved.get("timestamp")
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
    current_user: dict = Depends(get_current_user)
):
    """Get latest sensor readings for farmer from Firestore"""
    farmer_id = str(current_user.get("user_id", "1"))
    latest = get_latest_sensor_reading(farmer_id=farmer_id)
    
    readings = [latest] if latest else []
    
    return {
        "total": len(readings),
        "readings": [
            {
                "id": r.get("id"),
                "device_id": r.get("device_id"),
                "timestamp": r.get("timestamp"),
                "npk": r.get("npk"),
                "ph": r.get("ph"),
                "moisture": r.get("moisture"),
                "temperature": r.get("temperature"),
                "humidity": r.get("humidity")
            }
            for r in readings
        ]
    }

@router.get("/status")
async def sensor_status(
    current_user: dict = Depends(get_current_user)
):
    """Get current sensor health status"""
    farmer_id = str(current_user.get("user_id", "1"))
    latest = get_latest_sensor_reading(farmer_id=farmer_id)
    
    if not latest:
        return {
            "status": "no_data",
            "message": "No sensor data yet"
        }
    
    return {
        "status": "healthy",
        "last_reading": latest.get("timestamp"),
        "minutes_ago": 2,
        "latest_values": {
            "npk": latest.get("npk"),
            "ph": latest.get("ph"),
            "moisture": latest.get("moisture"),
            "temperature": latest.get("temperature"),
            "humidity": latest.get("humidity")
        }
    }
