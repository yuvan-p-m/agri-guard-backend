from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Auth Schemas
class UserRegister(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = ""
    password: str
    confirm_password: str
    crop_type: Optional[str] = "Citrus (Orange / Lemon)"
    location: Optional[str] = "Nagpur"
    role: Optional[str] = "farmer"

class UserLogin(BaseModel):
    email: str
    password: str

# Legacy Alias
class FarmerRegister(BaseModel):
    name: str
    password: str
    phone: Optional[str] = None
    username: Optional[str] = None
    primary_crop: Optional[str] = "Citrus (Orange / Lemon)"
    farm_size_acres: Optional[float] = 2.5
    farm_unit: Optional[str] = "Acres"
    state: Optional[str] = ""
    district: Optional[str] = ""
    location_lat: Optional[float] = 0.0
    location_lng: Optional[float] = 0.0
    soil_type: Optional[str] = ""

class FarmerLogin(BaseModel):
    username_or_phone: Optional[str] = None
    email: Optional[str] = None
    password: str

class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    username: Optional[str] = ""
    phone: Optional[str] = ""
    cropType: Optional[str] = "Citrus (Orange / Lemon)"
    primaryCrop: Optional[str] = "Citrus (Orange / Lemon)"
    location: Optional[str] = "Nagpur"
    role: Optional[str] = "farmer"
    farmSize: Optional[float] = 2.5
    farmUnit: Optional[str] = "Acres"
    state: Optional[str] = ""
    district: Optional[str] = ""
    isLoggedIn: bool = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse

# Disease Detection Schemas
class DiseaseResponse(BaseModel):
    disease: str
    confidence: float
    severity: str
    treatment: str
    pesticide_dose: str
    prediction_id: int
    ecommerce_links: dict = {}

class DiseaseHistory(BaseModel):
    id: int
    disease: str
    confidence: float
    timestamp: datetime
    image_url: Optional[str] = None

# Sensor Schemas
class NPKData(BaseModel):
    n: float
    p: float
    k: float

class SensorReading(BaseModel):
    device_id: str
    npk: NPKData
    ph: float
    moisture: float
    temperature: float
    humidity: float

class SensorReadingResponse(BaseModel):
    id: int
    timestamp: datetime
    npk: dict
    ph: float
    moisture: float
    temperature: float
    humidity: float

# Weather Schemas
class ForecastDay(BaseModel):
    date: str
    temp_max: float
    temp_min: float
    humidity: float
    rainfall_mm: float
    disease_risk: str
    risk_reason: str

class WeatherForecast(BaseModel):
    location: str
    forecast: List[ForecastDay]

# Risk Schemas
class HighRiskDisease(BaseModel):
    disease: str
    probability: float
    days_until_outbreak: int
    preventive_measures: str

class EarlyWarning(BaseModel):
    overall_risk_score: float
    high_risk_diseases: List[HighRiskDisease]

# Feedback Schemas
class FeedbackSubmit(BaseModel):
    prediction_id: int
    worked: bool
    actual_disease: Optional[str] = None
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    feedback_id: int
    status: str
    message: str
