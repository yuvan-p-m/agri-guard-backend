from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Disease Detection Schemas
class DiseaseResponse(BaseModel):
    disease: str
    confidence: float
    severity: str
    treatment: str
    pesticide_dose: str
    prediction_id: int

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
