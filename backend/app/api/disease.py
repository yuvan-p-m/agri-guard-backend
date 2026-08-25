from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
import os
from datetime import datetime

from db.firestore_db import create_disease_record, get_disease_records
from schemas.common import DiseaseResponse
from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/disease", tags=["Disease Detection"])

class AIInferenceService:
    @staticmethod
    def predict_disease(image_path: str) -> dict:
        """
        AI inference service model
        Expected return: {"disease": "Early Blight", "confidence": 0.94, "severity": "medium"}
        """
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
    current_user: dict = Depends(get_current_user)
):
    """Predict disease from leaf image and save to Firestore"""
    
    try:
        farmer_id = current_user.get("user_id", "1")
        
        # Save uploaded image
        os.makedirs("uploads", exist_ok=True)
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        image_path = f"uploads/{farmer_id}_{timestamp}.jpg"
        
        with open(image_path, "wb") as f:
            f.write(await file.read())
        
        logger.info(f"Image saved: {image_path} for farmer {farmer_id}")
        
        # Call AI model
        prediction = AIInferenceService.predict_disease(image_path)
        
        # Save to Firestore
        record_data = {
            "farmer_id": str(farmer_id),
            "image_path": image_path,
            "predicted_disease": prediction["disease"],
            "confidence": prediction["confidence"],
            "severity": prediction["severity"],
            "treatment": prediction["treatment"],
            "pesticide_dose": prediction["pesticide_dose"]
        }
        
        record = create_disease_record(record_data)
        doc_id = str(record.get("id"))
        logger.info(f"Prediction saved to Firestore: {doc_id} - {prediction['disease']}")
        
        return DiseaseResponse(
            disease=prediction["disease"],
            confidence=prediction["confidence"],
            severity=prediction["severity"],
            treatment=prediction["treatment"],
            pesticide_dose=prediction["pesticide_dose"],
            prediction_id=doc_id
        )
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process image"
        )

@router.get("/history")
async def disease_history(
    current_user: dict = Depends(get_current_user)
):
    """Get farmer's disease history from Firestore"""
    
    farmer_id = current_user.get("user_id")
    records = get_disease_records(farmer_id=farmer_id, limit=30)
    
    return {
        "total": len(records),
        "records": [
            {
                "id": r.get("id"),
                "disease": r.get("predicted_disease") or r.get("disease"),
                "confidence": r.get("confidence"),
                "timestamp": r.get("timestamp"),
                "image_path": r.get("image_path")
            }
            for r in records
        ]
    }
