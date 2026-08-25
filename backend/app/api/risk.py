from fastapi import APIRouter, Depends, HTTPException, status

from db.firestore_db import get_disease_records, get_latest_sensor_reading, save_risk_score, get_latest_risk_score
from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/risk", tags=["Early Detection"])

class RiskEngine:
    @staticmethod
    def calculate_risk_score(farmer_id: str) -> dict:
        """
        Calculate early disease risk score based on Firestore readings & history
        """
        try:
            latest_sensor = get_latest_sensor_reading(farmer_id=farmer_id)
            past_diseases = get_disease_records(farmer_id=farmer_id, limit=10)
            
            avg_humidity = latest_sensor.get("humidity", 65.0) if latest_sensor else 65.0
            avg_temp = latest_sensor.get("temperature", 25.0) if latest_sensor else 25.0
            
            high_risk_diseases = []
            overall_score = 0.3
            
            if avg_humidity > 70 and 15 <= avg_temp <= 28:
                risk = min(0.95, (avg_humidity - 60) / 40)
                high_risk_diseases.append({
                    "disease": "Early Blight",
                    "probability": round(risk, 2),
                    "days_until_outbreak": 3,
                    "preventive_measures": "Improve drainage, spray Chlorothalonil, remove infected leaves"
                })
                overall_score = max(overall_score, risk)
            
            if past_diseases:
                overall_score = min(0.95, overall_score + 0.05)
            
            return {
                "overall_risk_score": round(overall_score, 2),
                "high_risk_diseases": high_risk_diseases,
                "avg_humidity": avg_humidity,
                "avg_temperature": avg_temp,
                "reason": "Based on sensor data and historical records in Firestore"
            }
        
        except Exception as e:
            logger.error(f"Risk calculation error: {str(e)}")
            return {
                "overall_risk_score": 0.3,
                "high_risk_diseases": [],
                "error": str(e)
            }

@router.get("/early-warning")
async def get_early_warning(
    current_user: dict = Depends(get_current_user)
):
    """Get early disease risk prediction from Firestore"""
    
    try:
        farmer_id = str(current_user.get("user_id", "1"))
        risk_data = RiskEngine.calculate_risk_score(farmer_id)
        
        save_risk_score(
            farmer_id=farmer_id,
            overall_score=risk_data["overall_risk_score"],
            high_risk_diseases=risk_data.get("high_risk_diseases", [])
        )
        
        logger.info(f"Risk score calculated for farmer {farmer_id}: {risk_data['overall_risk_score']}")
        return risk_data
    
    except Exception as e:
        logger.error(f"Early warning error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate risk"
        )

@router.get("/history")
async def get_risk_history(
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """Get risk score history from Firestore"""
    farmer_id = str(current_user.get("user_id", "1"))
    latest = get_latest_risk_score(farmer_id=farmer_id)
    history = [latest] if latest else []
    
    return {
        "total": len(history),
        "history": [
            {
                "id": r.get("id"),
                "score": r.get("overall_score"),
                "calculated_at": r.get("calculated_at"),
                "high_risk_count": len(r.get("high_risk_diseases") or [])
            }
            for r in history
        ]
    }
