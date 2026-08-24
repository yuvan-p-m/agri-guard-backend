from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
import os
from datetime import datetime

from db.session import get_db
from db.models import DiseaseRecord
from schemas.common import DiseaseResponse
from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/disease", tags=["Disease Detection"])

# Placeholder for AI inference service (your friend's model)
class AIInferenceService:
    @staticmethod
    def predict_disease(image_path: str) -> dict:
        """
        Call your friend's trained model here
        Expected return: {"disease": "Early Blight", "confidence": 0.94, "severity": "medium"}
        """
        # TODO: Integrate friend's model
        return {
            "disease": "Early Blight",
            "confidence": 0.94,
            "severity": "medium",
            "treatment": "Spray Chlorothalonil",
            "pesticide_dose": "2.5ml per liter"
        }

@router.post("/predict", response_model=DiseaseResponse)
async def predict_disease(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Predict disease from leaf image"""
    
    try:
        farmer_id = current_user["user_id"]
        
        # Save uploaded image
        os.makedirs("uploads", exist_ok=True)
        timestamp = datetime.utcnow().isoformat()
        image_path = f"uploads/{farmer_id}_{timestamp}.jpg"
        
        with open(image_path, "wb") as f:
            f.write(await file.read())
        
        logger.info(f"Image saved: {image_path} for farmer {farmer_id}")
        
        # Call AI model (your friend's model)
        prediction = AIInferenceService.predict_disease(image_path)
        
        # Save to database
        record = DiseaseRecord(
            farmer_id=farmer_id,
            image_path=image_path,
            predicted_disease=prediction["disease"],
            confidence=prediction["confidence"],
            severity=prediction["severity"],
            treatment=prediction["treatment"],
            pesticide_dose=prediction["pesticide_dose"]
        )
        
        db.add(record)
        db.commit()
        db.refresh(record)
        
        logger.info(f"Prediction saved: {record.id} - {prediction['disease']}")
        
        return DiseaseResponse(
            disease=prediction["disease"],
            confidence=prediction["confidence"],
            severity=prediction["severity"],
            treatment=prediction["treatment"],
            pesticide_dose=prediction["pesticide_dose"],
            prediction_id=record.id
        )
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process image"
        )

@router.get("/history")
async def disease_history(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get farmer's disease history"""
    
    farmer_id = current_user["user_id"]
    records = db.query(DiseaseRecord).filter(
        DiseaseRecord.farmer_id == farmer_id
    ).order_by(DiseaseRecord.timestamp.desc()).all()
    
    return {
        "total": len(records),
        "records": [
            {
                "id": r.id,
                "disease": r.predicted_disease,
                "confidence": r.confidence,
                "timestamp": r.timestamp,
                "image_path": r.image_path
            }
            for r in records
        ]
    }
