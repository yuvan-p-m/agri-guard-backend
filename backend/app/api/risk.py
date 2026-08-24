from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from db.session import get_db
from db.models import DiseaseRecord, SensorReading, RiskScore, Farmer
from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/risk", tags=["Early Detection"])

class RiskEngine:
    @staticmethod
    def calculate_risk_score(farmer_id: int, db: Session) -> dict:
        """
        Calculate early disease risk score based on:
        1. Recent sensor data (humidity > 75% → high risk for fungal diseases)
        2. Weather forecast (rainfall + humidity)
        3. Disease history (recurring patterns)
        """
        
        try:
            # Get latest sensor readings (last 3 days)
            three_days_ago = datetime.utcnow() - timedelta(days=3)
            recent_sensors = db.query(SensorReading).filter(
                SensorReading.farmer_id == farmer_id,
                SensorReading.timestamp >= three_days_ago
            ).order_by(SensorReading.timestamp.desc()).all()
            
            if not recent_sensors:
                return {
                    "overall_risk_score": 0.3,
                    "high_risk_diseases": [],
                    "reason": "Insufficient sensor data"
                }
            
            # Calculate average conditions
            avg_humidity = sum(r.humidity for r in recent_sensors) / len(recent_sensors)
            avg_temp = sum(r.temperature for r in recent_sensors) / len(recent_sensors)
            
            # Get past disease records
            past_diseases = db.query(DiseaseRecord).filter(
                DiseaseRecord.farmer_id == farmer_id
            ).order_by(DiseaseRecord.timestamp.desc()).limit(10).all()
            
            high_risk_diseases = []
            
            # Rule-based risk assessment
            overall_score = 0.0
            
            # Early Blight risk (Potato, Tomato): needs humidity > 75% and temp 15-25°C
            if avg_humidity > 75 and 15 <= avg_temp <= 25:
                risk = min(0.95, (avg_humidity - 65) / 35)
                high_risk_diseases.append({
                    "disease": "Early Blight",
                    "probability": risk,
                    "days_until_outbreak": 3,
                    "preventive_measures": "Improve drainage, spray Chlorothalonil, remove infected leaves"
                })
                overall_score = max(overall_score, risk)
            
            # Powdery Mildew risk: temp 15-27°C, low humidity OK
            if 15 <= avg_temp <= 27:
                risk = 0.6
                high_risk_diseases.append({
                    "disease": "Powdery Mildew",
                    "probability": risk,
                    "days_until_outbreak": 5,
                    "preventive_measures": "Improve air circulation, spray sulfur-based fungicides"
                })
                overall_score = max(overall_score, risk)
            
            # Leaf Spot risk: humidity > 70%, temp > 20°C
            if avg_humidity > 70 and avg_temp > 20:
                risk = min(0.85, (avg_humidity - 60) / 40)
                high_risk_diseases.append({
                    "disease": "Leaf Spot",
                    "probability": risk,
                    "days_until_outbreak": 4,
                    "preventive_measures": "Copper fungicides, remove affected leaves, improve water drainage"
                })
                overall_score = max(overall_score, risk)
            
            # Check if past diseases are recurring (high risk)
            if past_diseases:
                most_recent_disease = past_diseases[0].predicted_disease
                recent_same = [d for d in past_diseases if d.predicted_disease == most_recent_disease]
                if len(recent_same) > 2:  # Recurring pattern
                    overall_score = min(0.95, overall_score + 0.1)
                    logger.warning(f"Recurring disease detected for farmer {farmer_id}: {most_recent_disease}")
            
            return {
                "overall_risk_score": overall_score,
                "high_risk_diseases": high_risk_diseases,
                "avg_humidity": avg_humidity,
                "avg_temperature": avg_temp,
                "reason": "Based on sensor data and historical records"
            }
        
        except Exception as e:
            logger.error(f"Risk calculation error: {str(e)}")
            return {
                "overall_risk_score": 0.5,
                "high_risk_diseases": [],
                "error": str(e)
            }

@router.get("/early-warning")
async def get_early_warning(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get early disease risk prediction"""
    
    try:
        farmer_id = current_user["user_id"]
        
        # Calculate risk
        risk_data = RiskEngine.calculate_risk_score(farmer_id, db)
        
        # Save to database
        risk_record = RiskScore(
            farmer_id=farmer_id,
            overall_score=risk_data["overall_risk_score"],
            high_risk_diseases=risk_data.get("high_risk_diseases", [])
        )
        db.add(risk_record)
        db.commit()
        
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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get risk score history"""
    
    farmer_id = current_user["user_id"]
    
    history = db.query(RiskScore).filter(
        RiskScore.farmer_id == farmer_id
    ).order_by(RiskScore.calculated_at.desc()).limit(limit).all()
    
    return {
        "total": len(history),
        "history": [
            {
                "id": r.id,
                "score": r.overall_score,
                "calculated_at": r.calculated_at,
                "high_risk_count": len(r.high_risk_diseases)
            }
            for r in history
        ]
    }
