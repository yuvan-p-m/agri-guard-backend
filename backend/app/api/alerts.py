from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/alerts", tags=["SMS & Alerts"])

class SMSService:
    """SMS alert service (Twilio integration placeholder)"""
    
    @staticmethod
    def send_sms(phone: str, message: str) -> bool:
        """
        Send SMS via Twilio API
        TODO: Integrate with Twilio using settings.SMS_API_KEY
        """
        try:
            # Placeholder - actual implementation would call Twilio API
            logger.info(f"SMS sent to {phone}: {message[:50]}...")
            return True
        except Exception as e:
            logger.error(f"SMS send error: {str(e)}")
            return False

@router.post("/subscribe")
async def subscribe_to_alerts(
    phone: str,
    crop: str,
    alert_types: list = ["disease_risk", "weather_warning"],
    current_user: dict = Depends(get_current_user)
):
    """Subscribe to SMS alerts"""
    
    try:
        farmer_id = current_user["user_id"]
        
        # Verify phone format
        if not phone.startswith("+"):
            phone = "+91" + phone[-10:]  # Add India country code if missing
        
        # Subscription would be saved to database
        logger.info(f"Farmer {farmer_id} subscribed to alerts for {crop}")
        
        # Send welcome SMS
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

@router.post("/send-risk-alert")
async def send_risk_alert(
    phone: str,
    disease: str,
    risk_level: str,
    preventive_measure: str,
    days_until_outbreak: int,
    current_user: dict = Depends(get_current_user)
):
    """Send disease risk alert SMS"""
    
    try:
        farmer_id = current_user["user_id"]
        
        if not phone.startswith("+"):
            phone = "+91" + phone[-10:]
        
        # Build alert message
        message = f"⚠️ ALERT: High risk of {disease} detected! Days until outbreak: {days_until_outbreak}. Action: {preventive_measure}. Reply to chat for details."
        
        # Send SMS
        success = SMSService.send_sms(phone, message)
        
        if success:
            logger.info(f"Risk alert sent to farmer {farmer_id} for {disease}")
            return {
                "status": "sent",
                "phone": phone,
                "disease": disease,
                "risk_level": risk_level,
                "message": message
            }
        else:
            raise Exception("SMS send failed")
    
    except Exception as e:
        logger.error(f"Risk alert error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send alert"
        )

@router.post("/send-weather-alert")
async def send_weather_alert(
    phone: str,
    alert_message: str,
    current_user: dict = Depends(get_current_user)
):
    """Send weather warning SMS"""
    
    try:
        farmer_id = current_user["user_id"]
        
        if not phone.startswith("+"):
            phone = "+91" + phone[-10:]
        
        message = f"🌧️ WEATHER ALERT: {alert_message}"
        
        success = SMSService.send_sms(phone, message)
        
        if success:
            logger.info(f"Weather alert sent to farmer {farmer_id}")
            return {
                "status": "sent",
                "phone": phone,
                "message": message
            }
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
    
    return {
        "templates": templates,
        "note": "Customize these templates for your farm"
    }
