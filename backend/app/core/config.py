import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API
    API_VERSION: str = "v1"
    ENVIRONMENT: str = os.getenv("FASTAPI_ENV", "development")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Weather API
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    WEATHER_API_BASE_URL: str = os.getenv("WEATHER_API_BASE_URL", "https://api.openweathermap.org")
    
    # SMS Service
    SMS_API_KEY: str = os.getenv("SMS_API_KEY", "")
    SMS_PROVIDER: str = os.getenv("SMS_PROVIDER", "twilio")
    
    # AI Models
    MODEL_PATH: str = os.getenv("MODEL_PATH", "ai/disease_model/model.pt")
    CROP_MODEL_PATH: str = os.getenv("CROP_MODEL_PATH", "ai/crop_model/model.pkl")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "app/logs/app.log")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

settings = get_settings()
