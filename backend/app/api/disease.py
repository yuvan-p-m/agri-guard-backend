from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, Query, Request
import os
from datetime import datetime

from db.firestore_db import create_disease_record, get_disease_records, save_prediction_to_firestore
from schemas.common import DiseaseResponse
from core.security import get_current_user
from core.logger import get_logger
from services.model_service import DiseaseModelService, ModelUnavailableError

logger = get_logger(__name__)
router = APIRouter(prefix="/disease", tags=["Disease Detection"])

from typing import Optional
from fastapi import Request

async def get_optional_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return {"user_id": "anonymous_farmer"}
    try:
        from fastapi.security import HTTPAuthorizationCredentials
        token = auth_header.replace("Bearer ", "").strip()
        user = await get_current_user(HTTPAuthorizationCredentials(scheme="Bearer", credentials=token))
        return user if user else {"user_id": "anonymous_farmer"}
    except Exception:
        return {"user_id": "anonymous_farmer"}

@router.post("/predict")
async def predict_disease(
    file: UploadFile = File(...),
    language: Optional[str] = Query(None),
    request: Request = None
):
    """Predict disease from leaf image using PyTorch EfficientNet-B3 model and save to Firestore"""

    try:
        user = await get_optional_user(request) if request else {"user_id": "anonymous_farmer"}
        farmer_id = user.get("user_id", "anonymous_farmer")
        contents = await file.read()

        # Save uploaded image
        os.makedirs("uploads", exist_ok=True)
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        image_path = f"uploads/{farmer_id}_{timestamp}.jpg"

        with open(image_path, "wb") as f:
            f.write(contents)

        logger.info(f"Image saved: {image_path} for farmer {farmer_id}")

        # Call PyTorch AI model
        prediction = DiseaseModelService.predict_image(contents)
        disease_name = prediction["disease"]
        confidence = prediction["confidence"]

        # Save to Firestore collection "predictions"
        prediction_firestore_data = {
            "userId": str(farmer_id),
            "disease": disease_name,
            "confidence": confidence,
            "imageUrl": image_path,
            "status": "success"
        }
        save_prediction_to_firestore(prediction_firestore_data)

        # Save to Firestore collection "disease_records" for history tab
        record_data = {
            "farmer_id": str(farmer_id),
            "image_path": image_path,
            "predicted_disease": disease_name,
            "confidence": confidence,
            "severity": "high" if confidence > 85 else "medium",
            "treatment": f"Apply recommended protocol for {disease_name.replace('___', ' ').replace('_', ' ')}",
            "pesticide_dose": "2.5ml per liter water"
        }

        record = create_disease_record(record_data)
        doc_id = str(record.get("id"))
        logger.info(f"Prediction saved to Firestore: {doc_id} - {disease_name}")

        # Part 3: Disease Progression Risk Assessment via Gemini AI
        # Note: this is a condition-based risk estimate using current live field + weather data via Gemini reasoning,
        # not a time-series forecast (no historical readings yet).
        from services.sensor_service import fetch_live_sensor_data
        from services.gemini_service import get_disease_progression_risk
        from api.weather import WeatherService

        sensor_data = fetch_live_sensor_data() or {}
        try:
            weather_data = WeatherService.fetch_weather() or {}
        except Exception as w_err:
            logger.warning(f"Weather fetch notice during disease prediction: {w_err}")
            weather_data = {}

        req_lang = language or (request.query_params.get("language") if request else None) or (request.headers.get("x-language") if request else None) or "en"
        try:
            progression_risk = get_disease_progression_risk(
                disease_name=disease_name,
                confidence=confidence,
                sensor_data=sensor_data,
                weather_data=weather_data,
                language=req_lang
            )
        except Exception as err:
            logger.error(f"Error computing disease progression risk: {err}")
            progression_risk = {
                "risk": "Risk Assessment Unavailable",
                "message": "Unable to calculate progression risk at this time.",
                "treatment": None,
                "pesticide_recommendation": None
            }

        return {
            "disease": disease_name,
            "confidence": confidence,
            "status": "success",
            "disease_prediction": {
                "disease": disease_name,
                "confidence": confidence,
                "status": "success"
            },
            "progression_risk": progression_risk,
            "pesticide_recommendation": progression_risk.get("pesticide_recommendation") or progression_risk.get("treatment") if isinstance(progression_risk, dict) else None,
            "treatment": progression_risk.get("treatment") or progression_risk.get("pesticide_recommendation") if isinstance(progression_risk, dict) else None,
            "sensor_snapshot": sensor_data,
            "weather_snapshot": weather_data
        }

    except ModelUnavailableError as e:
        logger.error("Disease model unavailable: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image: {str(e)}"
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
