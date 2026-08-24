import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from core.logger import setup_logging
from core.config import settings

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

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "API is running"}

@app.on_event("startup")
async def startup():
    logger.info("SIH Agri-Smart API starting...")

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
