import logging
import sys
from pathlib import Path

from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, status, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Add app directory and backend root to path for imports
sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.logger import setup_logging
from core.config import settings
from core.firebase import init_firebase, is_firebase_initialized

# Import API routes and services
from api import alerts, disease, crop, sensors, weather, risk, feedback, pesticides, history, marketplace
from services.model_service import DiseaseModelService, ModelUnavailableError
from db.firestore_db import save_prediction_to_firestore

load_dotenv()
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SIH Agri-Smart API",
    description="AI-powered crop disease detection & recommendation system with Firebase Integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes across root, /api/v1, and /api prefixes
api_routers = [
    alerts.router,
    disease.router,
    crop.router,
    sensors.router,
    weather.router,
    risk.router,
    feedback.router,
    pesticides.router,
    history.router,
    marketplace.router
]

for r in api_routers:
    app.include_router(r)
    app.include_router(r, prefix="/api/v1")
    app.include_router(r, prefix="/api")


@app.get("/health")
@app.get("/api/v1/health")
@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "API is running",
        "version": "1.0.0",
    }

@app.get("/crop-recommendations")
@app.get("/api/v1/crop-recommendations")
@app.get("/api/crop-recommendations")
async def crop_recommendations_root_endpoint(
    request: Request,
    location: str = "getting location",
    language: Optional[str] = Query(None)
):
    """
    Part 2: GET /crop-recommendations?location=...
    Internally: fetches weather -> fetches sensor snapshot -> calls Gemini -> returns parsed JSON
    """
    from api.crop import execute_crop_recommendations
    req_lang = language or request.query_params.get("language") or request.headers.get("x-language") or "en"
    return await execute_crop_recommendations(location, language=req_lang)

@app.get("/")
def root():
    """Root endpoint - API info"""
    return {
        "name": "SIH Agri-Smart API",
        "version": "1.0.0",
        "description": "AI-powered crop disease detection & recommendation system",
        "docs": "/docs",
        "firebase_active": is_firebase_initialized(),
        "endpoints": {
            "disease": "/disease",
            "crop": "/crop",
            "sensors": "/sensors",
            "weather": "/weather",
            "risk": "/risk",
            "feedback": "/feedback",
            "pesticides": "/pesticides",
            "alerts": "/alerts",
            "history": "/history"
        }
    }

@app.on_event("startup")
async def startup():
    logger.info("SIH Agri-Smart API starting...")
    init_firebase()
    if is_firebase_initialized():
        logger.info("Firebase Admin initialized successfully.")
    else:
        logger.info("Firebase Admin running with mock DB fallback.")

    # Load PyTorch EfficientNet-B3 model ONCE at startup (Frozen)
    try:
        DiseaseModelService.load_model()
    except Exception as e:
        logger.error(f"Startup warning: PyTorch model failed to load: {e}")

    # Load Crop Random Forest model ONCE at startup
    try:
        from services.crop_model_service import CropRandomForestService
        CropRandomForestService.load_model()
    except Exception as e:
        logger.error(f"Startup warning: Crop Random Forest model failed to load: {e}")

    # Start automated 4 daily SMS cron scheduler (APScheduler)
    try:
        from scheduler import start_scheduler
        start_scheduler()
        logger.info("Fast2SMS 4-times daily cron scheduler started.")
    except Exception as e:
        logger.warning(f"SMS scheduler startup notice: {e}")

@app.post("/predict")
@app.post("/api/v1/predict")
@app.post("/api/predict")
async def predict_endpoint(
    request: Request,
    file: UploadFile = File(...),
    language: Optional[str] = Query(None)
):
    """
    POST /predict endpoint
    Accepts multipart image upload ('file'), runs PyTorch EfficientNet-B3 inference,
    saves record to Firestore 'predictions' collection, and returns JSON.
    """
    if not file:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided")

    try:
        contents = await file.read()
        prediction = DiseaseModelService.predict_image(contents)

        # Save to Firestore collection "predictions"
        firestore_record = {
            "userId": "anonymous_farmer",
            "disease": prediction["disease"],
            "confidence": prediction["confidence"],
            "imageUrl": f"uploads/{file.filename}",
        }
        save_prediction_to_firestore(firestore_record)

        # Part 3: Disease Progression Risk Assessment via Gemini AI
        # Note: this is a condition-based risk estimate using current live field + weather data via Gemini reasoning,
        # not a time-series forecast (no historical readings yet).
        from services.sensor_service import fetch_live_sensor_data
        from services.gemini_service import get_disease_progression_risk
        from api.weather import WeatherService

        disease_name = prediction.get("disease", "")
        confidence = float(prediction.get("confidence", 0.0))
        sensor_data = fetch_live_sensor_data() or {}
        try:
            weather_data = WeatherService.fetch_weather() or {}
        except Exception as w_err:
            logger.warning(f"Weather fetch notice in main /predict: {w_err}")
            weather_data = {}

        req_lang = language or request.query_params.get("language") or request.headers.get("x-language") or "en"

        try:
            progression_risk = get_disease_progression_risk(
                disease_name=disease_name,
                confidence=confidence,
                sensor_data=sensor_data,
                weather_data=weather_data,
                language=req_lang
            )
        except Exception as err:
            logger.error(f"Error evaluating disease progression risk: {err}")
            progression_risk = {
                "risk": "Risk Assessment Unavailable",
                "message": "Unable to calculate progression risk at this time.",
                "treatment": None,
                "pesticide_recommendation": None
            }

        return {
            **prediction,
            "disease_prediction": {
                "disease": disease_name,
                "confidence": confidence,
                "status": prediction.get("status", "success")
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
        logger.error(f"Prediction error in /predict: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Prediction failed: {str(e)}")

@app.on_event("shutdown")
async def shutdown():
    logger.info("SIH Agri-Smart API shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
