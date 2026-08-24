from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Farmer(Base):
    __tablename__ = "farmers"
    
    id = Column(Integer, primary_key=True)
    phone = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String)
    location_lat = Column(Float)
    location_lng = Column(Float)
    soil_type = Column(String)
    farm_size_acres = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DiseaseRecord(Base):
    __tablename__ = "disease_records"
    
    id = Column(Integer, primary_key=True)
    farmer_id = Column(Integer)
    image_path = Column(String)
    predicted_disease = Column(String)
    confidence = Column(Float)
    severity = Column(String)
    treatment = Column(String)
    pesticide_dose = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class SensorReading(Base):
    __tablename__ = "sensor_readings"
    
    id = Column(Integer, primary_key=True)
    farmer_id = Column(Integer, nullable=True)
    device_id = Column(String)
    npk = Column(JSON)  # {"n": 45, "p": 22, "k": 35}
    ph = Column(Float)
    moisture = Column(Float)
    temperature = Column(Float)
    humidity = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True)
    farmer_id = Column(Integer)
    prediction_id = Column(Integer)
    worked = Column(Boolean)
    actual_disease = Column(String, nullable=True)
    comment = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class WeatherCache(Base):
    __tablename__ = "weather_cache"
    
    id = Column(Integer, primary_key=True)
    location_lat = Column(Float)
    location_lng = Column(Float)
    forecast = Column(JSON)
    cached_at = Column(DateTime, default=datetime.utcnow)

class RiskScore(Base):
    __tablename__ = "risk_scores"
    
    id = Column(Integer, primary_key=True)
    farmer_id = Column(Integer)
    overall_score = Column(Float)
    high_risk_diseases = Column(JSON)
    calculated_at = Column(DateTime, default=datetime.utcnow)
