# SIH-Agri-Smart: AI-Powered Crop Disease Detection & Recommendation System

**Early Crop Disease Detection for Smart Agriculture**

## 🎯 Problem Statement
Farmers struggle with early disease detection, leading to massive crop loss (30-40%). This platform uses AI + sensor data to detect diseases early and provide actionable recommendations.

## ✨ Key Features

1. **AI Disease Detection** - Upload leaf image + get instant disease diagnosis
2. **Crop Recommendation** - Suggest best crop based on soil type, weather, location
3. **Sensor Integration** - Real-time NPK, pH, moisture, temperature, humidity data
4. **Weather-based Early Warnings** - Predict disease risk 3-7 days in advance
5. **Smart Pesticide Dosage** - AI-recommended quantity based on crop/disease/area
6. **SMS Alerts** - Location-based alerts in farmer's local language
7. **Disease History** - Track past infections and recurring patterns
8. **E-Commerce Integration** - Direct links to buy recommended pesticides/nutrients
9. **Farmer Feedback Loop** - Farmers confirm effectiveness → model improves over time

## 🏗️ Tech Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + Vite
- **AI/ML**: PyTorch (disease detection), scikit-learn (crop recommendation)
- **IoT**: MQTT (sensor gateway)
- **APIs**: OpenWeather, Twilio SMS, E-commerce providers
- **Deployment**: Docker + AWS/GCP

## 📁 Project Structure

```
sih-agri-smart/
├── backend/          # FastAPI server + ML services
├── frontend/         # React web app
├── ai/              # Disease & crop models
├── data/            # Datasets & samples
├── docs/            # Architecture & API docs
└── scripts/         # Setup & automation
```

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📖 Documentation

- [Architecture](docs/architecture.md)
- [API Specification](docs/api-list.md)

## 👥 Team
SIH 26131 Submission

## 📄 License
MIT
