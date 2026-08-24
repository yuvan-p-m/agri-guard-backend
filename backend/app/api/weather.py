from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import requests
from core.config import settings
from db.session import get_db
from db.models import Farmer, WeatherCache
from core.security import get_current_user
from core.logger import get_logger
from datetime import datetime, timedelta

logger = get_logger(__name__)
router = APIRouter(prefix="/weather", tags=["Weather Integration"])

class WeatherService:
    @staticmethod
    def fetch_forecast(lat: float, lng: float) -> dict:
        """
        Fetch weather forecast from OpenWeather API
        Expected return: 5-day forecast with temp, humidity, rainfall, disease risk
        """
        try:
            # TODO: Integrate with OpenWeather API using settings.WEATHER_API_KEY
            # For now, return mock data
            
            logger.info(f"Fetching weather for location: {lat}, {lng}")
            
            return {
                "location": "Sample Location",
                "forecast": [
                    {
                        "date": (datetime.utcnow() + timedelta(days=i)).strftime("%Y-%m-%d"),
                        "temp_max": 32 + i,
                        "temp_min": 24 - i,
                        "humidity": 70 + i * 2,
                        "rainfall_mm": 5 * i,
                        "disease_risk": "high" if (70 + i * 2) > 75 else "medium" if (70 + i * 2) > 65 else "low",
                        "risk_reason": "High humidity favors fungal diseases" if (70 + i * 2) > 75 else "Moderate conditions"
                    }
                    for i in range(5)
                ]
            }
        except Exception as e:
            logger.error(f"Weather fetch error: {str(e)}")
            return None

@router.get("/forecast")
async def get_weather_forecast(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get 5-day weather forecast for farmer's location"""
    
    try:
        farmer_id = current_user["user_id"]
        
        # Get farmer location
        farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
        if not farmer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farmer not found"
            )
        
        # Check if cached forecast is still valid (< 3 hours old)
        cached = db.query(WeatherCache).filter(
            WeatherCache.location_lat == farmer.location_lat,
            WeatherCache.location_lng == farmer.location_lng
        ).order_by(WeatherCache.cached_at.desc()).first()
        
        if cached and (datetime.utcnow() - cached.cached_at) < timedelta(hours=3):
            logger.info(f"Using cached weather for farmer {farmer_id}")
            return cached.forecast
        
        # Fetch fresh forecast
        forecast = WeatherService.fetch_forecast(farmer.location_lat, farmer.location_lng)
        
        if forecast:
            # Cache the forecast
            cache = WeatherCache(
                location_lat=farmer.location_lat,
                location_lng=farmer.location_lng,
                forecast=forecast
            )
            db.add(cache)
            db.commit()
            logger.info(f"Weather forecast cached for farmer {farmer_id}")
        
        return forecast
    
    except Exception as e:
        logger.error(f"Weather forecast error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch weather forecast"
        )

@router.get("/current")
async def get_current_weather(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current weather conditions"""
    
    try:
        farmer_id = current_user["user_id"]
        
        farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
        if not farmer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farmer not found"
            )
        
        # Get latest sensor reading for comparison
        from db.models import SensorReading
        latest_sensor = db.query(SensorReading).filter(
            SensorReading.farmer_id == farmer_id
        ).order_by(SensorReading.timestamp.desc()).first()
        
        # TODO: Call OpenWeather API for current conditions
        current = {
            "location": f"Lat: {farmer.location_lat}, Lng: {farmer.location_lng}",
            "temperature": 28,
            "humidity": 72,
            "wind_speed": 12,
            "rainfall_mm": 0,
            "condition": "Partly Cloudy"
        }
        
        # Compare with sensor data if available
        if latest_sensor:
            current["sensor_temperature"] = latest_sensor.temperature
            current["sensor_humidity"] = latest_sensor.humidity
        
        return current
    
    except Exception as e:
        logger.error(f"Current weather error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch current weather"
        )
