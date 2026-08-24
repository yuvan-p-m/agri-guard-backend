# System Architecture

## Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Farmer    │         │   Weather    │         │   E-comm    │
│   Mobile    │         │   API        │         │   Platform  │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │                       │                        │
       └───────────┬───────────┴────────────┬───────────┘
                   │                        │
              ┌────▼────────────────────────▼───┐
              │   FastAPI Backend Server         │
              │  ├─ Auth (JWT)                  │
              │  ├─ Disease Detection API       │
              │  ├─ Crop Recommendation        │
              │  ├─ Sensor Ingest              │
              │  ├─ Risk Engine                │
              │  ├─ SMS Alert Trigger          │
              │  └─ Feedback Loop              │
              └────┬─────────────────────┬──────┘
                   │                     │
         ┌─────────▼──┐      ┌──────────▼──────┐
         │ PostgreSQL │      │ AI Models       │
         │ Database   │      │ (PyTorch, SKL)  │
         └────────────┘      └─────────────────┘
                   │
                   │
         ┌─────────▼──────────┐
         │ MQTT IoT Gateway   │
         │ (Sensor data)      │
         └────────────────────┘
```

## Components

### 1. Frontend (React)
- Login/Register page
- Dashboard (overview of alerts, sensors)
- Disease Detection page (image upload)
- Crop Recommendation page (form-based)
- Disease History timeline
- Feedback submission page

### 2. Backend (FastAPI)
- **Auth**: JWT-based login, password hashing (bcrypt)
- **Disease Detection**: Image upload → PyTorch inference
- **Crop Recommendation**: Soil type + weather → ML model
- **Sensor Integration**: MQTT listener for NPK, pH, moisture, temp
- **Weather Service**: OpenWeather API for location-based forecast
- **Risk Engine**: Combine sensor data + weather + past records → early warning score
- **SMS Service**: Twilio integration for alert delivery
- **Pesticide Advisor**: Dosage calculation based on crop × disease × area
- **E-commerce Link**: Map recommendations to product URLs
- **Feedback Loop**: Collect farmer feedback, log performance metrics

### 3. AI/ML Models
- **Disease Detection**: PyTorch CNN (MobileNet or ResNet50) trained on PlantVillage dataset
- **Crop Recommendation**: Scikit-learn classifier (soil type × weather → crop)
- **Early Detection**: Rule-based engine (sensor trends + weather patterns)

### 4. Database Schema

```
Farmers
├── id (PK)
├── phone
├── location (lat, lng)
├── soil_type
└── farm_size

DiseaseRecords
├── id (PK)
├── farmer_id (FK)
├── image_path
├── predicted_disease
├── confidence
├── timestamp

SensorReadings
├── id (PK)
├── farmer_id (FK)
├── npk
├── ph
├── moisture
├── temperature
├── humidity
└── timestamp

Feedback
├── id (PK)
├── farmer_id (FK)
├── prediction_id (FK)
├── worked (yes/no)
├── actual_disease
├── comment
└── timestamp
```

## Data Flow

1. **Disease Detection Flow**:
   - Farmer uploads leaf image via mobile
   - Backend receives image → passes to PyTorch model
   - Model returns disease + confidence
   - API returns result + pesticide recommendation
   - Link to e-commerce for purchase

2. **Early Warning Flow**:
   - Sensors stream temp/humidity/NPK to MQTT gateway
   - Backend subscribes to MQTT, stores readings
   - Weather API fetches 5-day forecast
   - Risk engine calculates score (rule-based or ML)
   - If risk > threshold → trigger SMS alert

3. **Feedback Loop**:
   - After 3-7 days, app prompts: "Did the treatment work?"
   - Farmer confirms + optionally corrects disease name
   - Feedback stored in DB
   - Weekly job: retrain model using confirmed samples
   - New model deployed with version bump

## APIs

See [api-list.md](api-list.md) for full endpoint reference.

## Deployment

- **Local**: Docker Compose (backend + postgres + frontend)
- **Cloud**: AWS EC2 or Google Cloud Run for backend + Firebase or AWS RDS for DB
