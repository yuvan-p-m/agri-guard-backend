from fastapi import APIRouter, Depends, HTTPException, status

from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/alerts", tags=["SMS & Alerts"])

class SMSService:
    """SMS alert service (Twilio integration placeholder)"""
    
    @staticmethod
    def send_sms(phone: str, message: str) -> bool:
        try:
            logger.info(f"SMS sent to {phone}: {message[:50]}...")
            return True
        except Exception as e:
            logger.error(f"SMS send error: {str(e)}")
            return False

from pydantic import BaseModel
from typing import Optional, List

class SubscribePayload(BaseModel):
    phone: str
    crop: Optional[str] = "Citrus (Orange / Lemon)"
    alert_types: Optional[List[str]] = ["disease_risk", "weather_warning"]

class WeatherAlertPayload(BaseModel):
    phone: str
    alert_message: str

@router.post("/subscribe")
async def subscribe_to_alerts(payload: SubscribePayload):
    """Subscribe to SMS alerts"""
    try:
        phone = payload.phone
        crop = payload.crop or "Citrus (Orange / Lemon)"
        alert_types = payload.alert_types or ["disease_risk", "weather_warning"]

        if not phone.startswith("+"):
            phone = "+91" + phone[-10:]
        
        logger.info(f"Farmer subscribed to alerts for {crop}")
        welcome_msg = f"Welcome to SIH Agri-Smart! You'll now receive alerts for {crop}. Reply STOP to unsubscribe."
        SMSService.send_sms(phone, welcome_msg)
        
        return {
            "status": "subscribed",
            "phone": phone,
            "crop": crop,
            "alert_types": alert_types,
            "next_alert_date": "Every day at 6:00 AM",
            "message": "Subscription confirmed! You'll receive SMS alerts."
        }
    except Exception as e:
        logger.error(f"Alert subscription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to subscribe to alerts"
        )

@router.post("/send-weather-alert")
async def send_weather_alert(payload: WeatherAlertPayload):
    """Send weather warning SMS"""
    try:
        phone = payload.phone
        if not phone.startswith("+"):
            phone = "+91" + phone[-10:]
        
        message = f"🌧️ WEATHER ALERT: {payload.alert_message}"
        success = SMSService.send_sms(phone, message)
        
        if success:
            logger.info(f"Weather alert sent to farmer {phone}")
            return {"status": "sent", "phone": phone, "message": message}
        else:
            raise Exception("SMS send failed")
    except Exception as e:
        logger.error(f"Weather alert error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send alert"
        )

@router.get("/message-templates")
async def get_message_templates(
    current_user: dict = Depends(get_current_user)
):
    """Get pre-defined alert message templates"""
    templates = {
        "disease_alert": "⚠️ {disease} risk detected in next {days} days. Action: {action}",
        "weather_warning": "🌧️ Heavy rain expected. Ensure drainage to prevent {disease}",
        "treatment_reminder": "📋 Time for 2nd spray of {pesticide} on {date}",
        "good_news": "✅ No disease detected. Your crop is healthy!",
        "urgent": "🚨 URGENT: {disease} outbreak confirmed. Take immediate action: {action}"
    }
    return {"templates": templates, "note": "Customize these templates for your farm"}
