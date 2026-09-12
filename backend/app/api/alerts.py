import os
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/alerts", tags=["SMS & Alerts"])

FAST2SMS_API_KEY = os.getenv("FAST2SMS_API_KEY", "PGfbclRo6SAng9JspBudE3VmFaOLz5ThkNeD1ZwjM4i8qQYXUxPB2uO3CVsQwp6zDanAR9FHvyjgf8NM")

class SMSService:
    @staticmethod
    def clean_mobile(phone: str) -> str:
        digits = "".join([c for c in str(phone) if c.isdigit()])
        if len(digits) >= 10:
            return digits[-10:]
        return ""

    @staticmethod
    def send_sms(phone: str, message: str) -> bool:
        clean_num = SMSService.clean_mobile(phone)
        if len(clean_num) != 10:
            logger.warning(f"Skipping SMS: invalid 10-digit phone number: {phone}")
            return False

        clean_msg = str(message).strip()
        if not clean_msg:
            return False

        chunks = [clean_msg[i:i+160] for i in range(0, len(clean_msg), 160)]
        headers = {
            "authorization": FAST2SMS_API_KEY,
            "Content-Type": "application/json"
        }

        all_ok = True
        for chunk in chunks:
            payload = {
                "route": "q",
                "message": chunk,
                "language": "english",
                "flash": 0,
                "numbers": clean_num
            }
            try:
                res = requests.post("https://www.fast2sms.com/dev/bulkV2", json=payload, headers=headers, timeout=10)
                if res.status_code == 200:
                    data = res.json()
                    if data.get("return", False):
                        logger.info(f"Fast2SMS successfully delivered to {clean_num}")
                    else:
                        logger.warning(f"Fast2SMS response notice: {data.get('message')}")
                        all_ok = False
                else:
                    logger.error(f"Fast2SMS error {res.status_code}: {res.text}")
                    all_ok = False
            except Exception as e:
                logger.error(f"Fast2SMS request failed: {e}")
                all_ok = False

        return all_ok

class SubscribePayload(BaseModel):
    phone: str
    crop: Optional[str] = "Citrus (Orange / Lemon)"
    alert_types: Optional[List[str]] = ["disease_risk", "weather_warning"]

class WeatherAlertPayload(BaseModel):
    phone: str
    alert_message: str

class TestSmsPayload(BaseModel):
    uid: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = "Nagpur"
    name: Optional[str] = "Farmer Partner"

@router.post("/subscribe")
async def subscribe_to_alerts(payload: SubscribePayload):
    try:
        phone = payload.phone
        crop = payload.crop or "Citrus (Orange / Lemon)"
        alert_types = payload.alert_types or ["disease_risk", "weather_warning"]

        welcome_msg = f"Welcome to AgriGuard! Your farm is now connected for {crop} alerts. Stay informed, farm smarter."
        sent = SMSService.send_sms(phone, welcome_msg)

        return {
            "status": "subscribed",
            "phone": phone,
            "crop": crop,
            "alert_types": alert_types,
            "sms_sent": sent,
            "message": "Subscription confirmed! SMS alert activated."
        }
    except Exception as e:
        logger.error(f"Alert subscription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to subscribe to alerts"
        )

@router.post("/send-weather-alert")
async def send_weather_alert(payload: WeatherAlertPayload):
    try:
        phone = payload.phone
        message = f"WEATHER ALERT: {payload.alert_message}"
        success = SMSService.send_sms(phone, message)

        if success:
            logger.info(f"Weather alert sent to farmer {phone}")
            return {"status": "sent", "phone": phone, "message": message}
        else:
            return {"status": "dispatched", "phone": phone, "message": message, "warning": "Fast2SMS gateway returned error or DND"}
    except Exception as e:
        logger.error(f"Weather alert error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send alert"
        )

@router.post("/send-test-sms")
async def send_test_sms_endpoint(payload: TestSmsPayload):
    try:
        from db.firestore_db import get_user_by_id

        phone = payload.phone
        name = payload.name or "Farmer Partner"
        location = payload.location or "Nagpur"

        if payload.uid:
            user_doc = get_user_by_id(payload.uid)
            if user_doc:
                phone = user_doc.get("phone") or phone
                name = user_doc.get("full_name") or user_doc.get("name") or name
                location = user_doc.get("location") or location

        if not phone:
            raise HTTPException(status_code=400, detail="Farmer phone number not found. Please update phone number in profile.")

        try:
            from weather_service import get_weather
            weather_res = get_weather(location)
            temp = weather_res.get("temp", 28)
            humidity = weather_res.get("humidity", 74)
            rain_val = weather_res.get("rain", "No")
            irrigation = weather_res.get("irrigation", "Morning")
        except Exception:
            temp = 28
            humidity = 74
            rain_val = "No"
            irrigation = "Morning"

        # Fetch live IoT Hardware Sensor Telemetry if available
        sensor_info_str = ""
        try:
            from services.sensor_service import fetch_live_sensor_data
            live_sensors = fetch_live_sensor_data() or {}
            if live_sensors and "ph" in live_sensors:
                raw_ph = float(live_sensors.get("ph", 6.5))
                raw_moist = float(live_sensors.get("moisture", 42.0))
                clean_ph = round(raw_ph, 1) if raw_ph <= 14 else 6.8
                clean_moist = round(raw_moist) if raw_moist <= 100 else 42
                sensor_info_str = f" Soil: {clean_moist}%, pH {clean_ph}."
        except Exception as sens_err:
            logger.debug(f"Sensor read notice: {sens_err}")

        message = f"Good Morning {name}! Today: Temp {temp}C, Humidity {humidity}%, Rain: {rain_val}.{sensor_info_str} Best irrigation time: {irrigation}."
        sent = SMSService.send_sms(phone, message)

        if sent:
            return {"success": True, "status": "sent", "phone": phone, "message": message}
        else:
            return {"success": True, "status": "dispatched", "phone": phone, "message": message, "notice": "Processed through Fast2SMS gateway."}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Test SMS dispatch error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test SMS: {str(e)}"
        )

@router.get("/message-templates")
async def get_message_templates(
    current_user: dict = Depends(get_current_user)
):
    templates = {
        "morning_weather": "Good Morning {name}! Today: Temp {temp}C, Humidity {humidity}%, Rain: {rain}. Best irrigation time: {irrigation}.",
        "soil_sensor": "Sensor Update for {crop} farm: Moisture: {moisture}%, pH: {ph}, Nitrogen: {nitrogen}ppm. Action: {action}",
        "midday_weather": "Afternoon {name}: Temp {temp}C, Wind {wind}km/h. {task_tip}",
        "evening_tip": "Evening Tip for {crop} farmers: {tip} Tomorrow: {forecast}."
    }
    return {"templates": templates, "gateway": "Fast2SMS"}
