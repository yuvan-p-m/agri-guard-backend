import logging
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from core.logger import setup_logging
from core.config import settings
from db.session import init_db

# Import API routes
from api import auth, disease, crop, sensors, weather, risk, feedback, pesticides, ecommerce, alerts, history

load_dotenv()
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SIH Agri-Smart API",
    description="AI-powered crop disease detection & recommendation system",
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
    auth.router,
    auth.root_router,
    disease.router,
    crop.router,
    sensors.router,
    weather.router,
    risk.router,
    feedback.router,
    pesticides.router,
    ecommerce.router,
    alerts.router,
    history.router
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
    return {"status": "ok", "message": "API is running", "version": "1.0.0"}

@app.get("/")
def root():
    """Root endpoint - API info"""
    return {
        "name": "SIH Agri-Smart API",
        "version": "1.0.0",
        "description": "AI-powered crop disease detection & recommendation system",
        "docs": "/docs",
        "endpoints": {
            "auth": "/auth",
            "disease": "/disease",
            "crop": "/crop",
            "sensors": "/sensors",
            "weather": "/weather",
            "risk": "/risk",
            "feedback": "/feedback",
            "pesticides": "/pesticides",
            "ecommerce": "/ecommerce",
            "alerts": "/alerts",
            "history": "/history"
        }
    }

@app.on_event("startup")
async def startup():
    logger.info("SIH Agri-Smart API starting...")
    init_db()
    logger.info("Database initialized")

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
