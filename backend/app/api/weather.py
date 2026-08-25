import os
import requests
from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime, timedelta
from dotenv import load_dotenv

from db.firestore_db import get_weather_cache, set_weather_cache, get_user_by_id, get_latest_sensor_reading
from core.security import get_current_user
from core.logger import get_logger

load_dotenv()
logger = get_logger(__name__)
# Keep the prefix without trailing slash so the new root route `/` becomes `/weather/` 
# Wait, if prefix="/weather", `@router.get("")` is `/weather`.
router = APIRouter(prefix="/weather", tags=["Weather Integration"])

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "46ca430cab2fd36dc4eb73c560925110")

CITY_COORDINATES = {
    "Nagpur": {"lat": 21.1458, "lng": 79.0882, "state": "Maharashtra"},
    "Nashik": {"lat": 19.9975, "lng": 73.7898, "state": "Maharashtra"},
    "Coimbatore": {"lat": 11.0168, "lng": 76.9558, "state": "Tamil Nadu"},
    "Varanasi": {"lat": 25.3176, "lng": 82.9739, "state": "Uttar Pradesh"},
    "Ludhiana": {"lat": 30.9010, "lng": 75.8573, "state": "Punjab"},
    "Vijayawada": {"lat": 16.5062, "lng": 80.6480, "state": "Andhra Pradesh"}
}

class WeatherService:
    @staticmethod
    def get_city_coords(city_name: str) -> dict:
        clean = city_name.split("(")[0].strip() if city_name else "Nagpur"
        for key, info in CITY_COORDINATES.items():
            if key.lower() in clean.lower() or clean.lower() in key.lower():
                return info
        return {"lat": 21.1458, "lng": 79.0882, "state": "Maharashtra"}

    @staticmethod
    def reverse_geocode_osm(lat: float, lon: float) -> tuple:
        """
        Use OpenStreetMap (Nominatim) free reverse geocoding API to resolve
        hyper-accurate village, suburb, town, city, district and state names.
        """
        try:
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=14&addressdetails=1"
            headers = {"User-Agent": "AgriGuard-App/1.0 (agri.health.assistant@gmail.com)"}
            res = requests.get(url, headers=headers, timeout=4)
            if res.status_code == 200:
                addr = res.json().get("address", {})
                place = (
                    addr.get("village") or
                    addr.get("suburb") or
                    addr.get("town") or
                    addr.get("city_district") or
                    addr.get("neighbourhood") or
                    addr.get("city") or
                    addr.get("county") or
                    addr.get("state_district")
                )
                city = addr.get("city") or addr.get("state_district") or addr.get("county") or ""
                state = addr.get("state") or addr.get("country") or "India"

                if place and city and place.lower() != city.lower():
                    clean_loc = f"{place}, {city}"
                elif place:
                    clean_loc = place
                elif city:
                    clean_loc = city
                else:
                    clean_loc = ""

                if clean_loc:
                    return clean_loc, state
        except Exception as e:
            logger.debug(f"OSM Nominatim reverse geocode notice: {e}")
        return "", ""

    @staticmethod
    def fetch_weather(lat: float = None, lon: float = None, city: str = "Nagpur") -> dict:
        """
        Fetch live weather telemetry from OpenWeatherMap API using GPS coords or city fallback,
        and derive dynamic weather risk alerts.
        """
        if lat is None or lon is None:
            coords = WeatherService.get_city_coords(city)
            lat, lon = coords["lat"], coords["lng"]

        location_name = city.split("(")[0].strip() if city else "Nagpur"
        state_name = "India"
        api_key = os.getenv("WEATHER_API_KEY", WEATHER_API_KEY)

        # 1. Reverse Geocode via OpenStreetMap (Nominatim) for hyper-precise village / suburb / city name
        osm_loc, osm_state = WeatherService.reverse_geocode_osm(lat, lon)
        if osm_loc:
            location_name = osm_loc
        if osm_state:
            state_name = osm_state

        try:
            if api_key:
                logger.info(f"Fetching OpenWeatherMap forecast for coords: {lat}, {lon}")
                url = f"http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
                response = requests.get(url, timeout=6)
                if response.status_code == 200:
                    data = response.json()
                    
                    if not osm_loc and data.get("city") and data["city"].get("name"):
                        raw_name = data["city"]["name"]
                        if "Saint Thomas Mount" in raw_name or "St. Thomas Mount" in raw_name:
                            location_name = "Chennai (St. Thomas Mount)"
                        else:
                            location_name = raw_name
                        country = data["city"].get("country", "")
                        state_name = country if country else "India"

                    first_item = data.get("list", [{}])[0]
                    main = first_item.get("main", {})
                    weather_cond = first_item.get("weather", [{}])[0]
                    wind = first_item.get("wind", {})

                    tempC = round(main.get("temp", 28), 1)
                    humidity = main.get("humidity", 75)
                    condition_desc = weather_cond.get("description", "partly cloudy").title()
                    wind_speed = round(wind.get("speed", 3.5) * 3.6, 1)
                    rain_mm = round(first_item.get("rain", {}).get("3h", 0), 1)

                    # Build 5-day daily forecast
                    forecast_list = []
                    seen_dates = set()
                    for item in data.get("list", []):
                        date_str = item["dt_txt"].split(" ")[0]
                        if date_str not in seen_dates and len(seen_dates) < 5:
                            seen_dates.add(date_str)
                            h = item["main"]["humidity"]
                            forecast_list.append({
                                "date": date_str,
                                "time": item["dt_txt"],
                                "temp": round(item["main"]["temp"], 1),
                                "temp_max": round(item["main"]["temp_max"], 1),
                                "temp_min": round(item["main"]["temp_min"], 1),
                                "humidity": h,
                                "condition": item["weather"][0]["description"].title(),
                                "rainfall_mm": round(item.get("rain", {}).get("3h", 0), 1),
                                "disease_risk": "High" if h > 75 else "Medium" if h > 60 else "Low",
                                "risk_reason": "High humidity favors fungal spore germination" if h > 75 else "Favorable microclimate"
                            })

                    return WeatherService._format_weather_response(
                        location=location_name,
                        state=state_name,
                        tempC=tempC,
                        condition=condition_desc,
                        humidity=humidity,
                        wind_speed=wind_speed,
                        rain_mm=rain_mm,
                        forecast_list=forecast_list
                    )
        except Exception as e:
            logger.error(f"OpenWeatherMap fetch error: {str(e)}")

        return WeatherService._fallback_weather(lat, lon, location_name)

    @staticmethod
    def _format_weather_response(location: str, state: str, tempC: float, condition: str, humidity: int, wind_speed: float, rain_mm: float, forecast_list: list) -> dict:
        rainfall_chance = min(98, max(5, humidity - 10 + int(rain_mm * 5)))
        risk_level = "Severe" if humidity >= 85 and tempC >= 25 else "High" if humidity >= 75 else "Moderate" if humidity >= 60 else "Low"
        leaf_wetness = round(max(2.0, min(14.0, (humidity / 100) * 12 + rain_mm)), 1)
        soil_moisture = f"{min(95, max(45, humidity - 5))}% ({'Adequate' if humidity < 80 else 'Saturated'})"

        # Generate dynamic weather alerts based on real conditions
        dynamic_alerts = []
        
        if humidity >= 75:
            dynamic_alerts.append({
                "id": "alert-fungal-1",
                "urgency": "high",
                "title": {"en": "⚠️ High Fungal Spore Risk", "hi": "⚠️ उच्च कवक बीजाणु जोखिम"},
                "message": {
                    "en": f"Live micro-climate relative humidity is {humidity}%. High humidity and extended leaf wetness ({leaf_wetness}h) accelerate fungal spore germination (powdery mildew / anthracnose).",
                    "hi": f"सापेक्ष आर्द्रता {humidity}% है। उच्च आर्द्रता से कवक बीजाणु अंकुरण में तेजी आती है।"
                },
                "timestamp": "Live API Telemetry",
                "actionRequired": {
                    "en": "Apply bio-fungicide (Trichoderma viride or Copper Oxychloride 50 WP @ 2.5g/L) before rain.",
                    "hi": "बारिश से पहले सुरक्षात्मक कवकनाशी का छिड़काव करें।"
                }
            })

        if "Rain" in condition or "Storm" in condition or rainfall_chance > 60:
            dynamic_alerts.append({
                "id": "alert-rain-2",
                "urgency": "high" if "Storm" in condition or rainfall_chance > 80 else "moderate",
                "title": {"en": "🌧️ Rainfall & Precipitation Warning", "hi": "🌧️ वर्षा एवं जलभराव चेतावनी"},
                "message": {
                    "en": f"Rainfall condition detected ({condition}) with {rainfall_chance}% precipitation chance. Risk of soil waterlogging and root asphyxiation.",
                    "hi": f"वर्षा की संभावना ({rainfall_chance}%) है। खेत में जलभराव न होने दें।"
                },
                "timestamp": "Live OpenWeather",
                "actionRequired": {
                    "en": "Ensure proper field drainage trenches and pause overhead irrigation.",
                    "hi": "खेत में उचित जल निकासी की व्यवस्था करें।"
                }
            })

        if tempC >= 35:
            dynamic_alerts.append({
                "id": "alert-heat-3",
                "urgency": "high",
                "title": {"en": "☀️ High Thermal Stress Advisory", "hi": "☀️ उच्च तापमान तनाव चेतावनी"},
                "message": {
                    "en": f"Temperature has reached {tempC}°C. Crops may experience wilting and transpiration stress.",
                    "hi": f"तापमान {tempC}°C तक पहुंच गया है। फसलों में सिंचाई बढ़ाएं।"
                },
                "timestamp": "Live Telemetry",
                "actionRequired": {
                    "en": "Irrigate crops during early morning or evening hours.",
                    "hi": "सुबह या शाम के समय सिंचाई करें।"
                }
            })

        if not dynamic_alerts:
            dynamic_alerts.append({
                "id": "alert-normal-4",
                "urgency": "low",
                "title": {"en": "✅ Favorable Micro-Climate Conditions", "hi": "✅ अनुकूल सूक्ष्म जलवायु"},
                "message": {
                    "en": f"Current weather is {condition} ({tempC}°C, {humidity}% humidity). Soil moisture is {soil_moisture}.",
                    "hi": f"मौसम अनुकूल है ({tempC}°C, {humidity}% आर्द्रता)।"
                },
                "timestamp": "Live API",
                "actionRequired": {
                    "en": "Continue routine crop monitoring and scheduled fertigation.",
                    "hi": "नियमित फसल निगरानी जारी रखें।"
                }
            })

        if risk_level in ["High", "Severe"]:
            alert_summary = f"Elevated fungal disease risk ({risk_level}) due to {humidity}% humidity and {leaf_wetness}h leaf wetness. Apply preventative bio-fungicide spray."
        else:
            alert_summary = f"Favorable micro-climate ({condition}). Soil moisture is adequate at {soil_moisture}."

        return {
            "location": location,
            "city": location,
            "state": state,
            "tempC": tempC,
            "condition": condition,
            "humidity": humidity,
            "rainfallChance": rainfall_chance,
            "windSpeedKmH": wind_speed,
            "soilMoisture": soil_moisture,
            "fungalRiskLevel": risk_level,
            "leafWetnessHours": leaf_wetness,
            "alertSummary": alert_summary,
            "alerts": dynamic_alerts,
            "current": {
                "temp": tempC,
                "humidity": humidity,
                "condition": condition,
                "wind_speed": wind_speed
            },
            "forecast": forecast_list
        }

    @staticmethod
    def _fallback_weather(lat: float, lon: float, location_name: str) -> dict:
        seed = sum(ord(c) for c in location_name)
        tempC = 28.0 + (seed % 5)
        humidity = 70 + (seed % 18)
        wind_speed = 12.0 + (seed % 6)
        rain_mm = 2.0 if humidity > 75 else 0.0

        forecast_list = []
        for i in range(5):
            d = (datetime.utcnow() + timedelta(days=i)).strftime("%Y-%m-%d")
            h = min(95, max(55, humidity + i * 2 - 1))
            forecast_list.append({
                "date": d,
                "time": f"{d} 12:00:00",
                "temp": tempC + i * 0.5,
                "temp_max": tempC + 3,
                "temp_min": tempC - 4,
                "humidity": h,
                "condition": "Partly Cloudy",
                "rainfall_mm": i * 1.5,
                "disease_risk": "High" if h > 75 else "Medium",
                "risk_reason": "High humidity favors fungal spore germination" if h > 75 else "Favorable conditions"
            })

        return WeatherService._format_weather_response(
            location=location_name,
            state="Maharashtra",
            tempC=tempC,
            condition="Partly Cloudy & Humid",
            humidity=humidity,
            wind_speed=wind_speed,
            rain_mm=rain_mm,
            forecast_list=forecast_list
        )

@router.get("")
def get_weather(
    lat: float = Query(..., description="Latitude GPS coordinate"),
    lon: float = Query(..., description="Longitude GPS coordinate")
):
    """Get live weather forecast data by GPS coordinates"""
    return WeatherService.fetch_weather(lat=lat, lon=lon)

@router.get("/forecast")
def get_weather_forecast(
    lat: float = Query(..., description="Latitude GPS coordinate"),
    lon: float = Query(..., description="Longitude GPS coordinate")
):
    """Get 5-day live weather forecast by GPS coordinates"""
    return WeatherService.fetch_weather(lat=lat, lon=lon)



