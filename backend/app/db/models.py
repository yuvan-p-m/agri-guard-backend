from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(15), nullable=True)
    password_hash = Column(Text, nullable=False)
    crop_type = Column(String(50), nullable=True)
    location = Column(String(100), nullable=True)
    role = Column(String(50), default="farmer")
    created_at = Column(DateTime, default=datetime.utcnow)

class Farmer(Base):
    __tablename__ = "farmers"
    
    id = Column(Integer, primary_key=True)
    phone = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String)
    name = Column(String)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    soil_type = Column(String, nullable=True)
    primary_crop = Column(String, nullable=True)
    farm_size_acres = Column(Float, nullable=True)
    farm_unit = Column(String, nullable=True, default="Acres")
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
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
