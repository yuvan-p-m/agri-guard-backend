# AgriGuard

AI-powered crop disease detection, crop recommendation, IoT monitoring, weather intelligence, and farming alerts.

## Features

* **Plant Disease Detection** — ResNet50-based disease classification from leaf images
* **Crop Recommendation** — Random Forest model using soil and environmental parameters
* **IoT Monitoring** — ESP32 sensor data through Firebase Realtime Database
* **Weather Intelligence** — Weather data and disease/risk-related alerts
* **Market & Mandi Data** — Market prices and forecasting
* **Pesticide Recommendations** — Disease-specific treatment and dosage guidance
* **Risk Analysis** — Crop disease progression and environmental risk assessment
* **Alerts** — Weather, sensor, and farming alerts including SMS notifications
* **Disease History** — Store and review previous diagnoses
* **Farmer Feedback** — Collect feedback related to recommendations and diagnoses
* **Multilingual Web Interface** — Support for multiple languages

## Tech Stack

### Backend

* FastAPI
* PyTorch / Torchvision
* ResNet50
* Scikit-learn
* Firebase Firestore
* Firebase Realtime Database
* Google Gemini
* OpenWeather
* SMS service

### Frontend

* React
* TypeScript
* Vite
* Firebase
* Axios
* Tailwind CSS
* Lucide React

### IoT

* ESP32
* Firebase Realtime Database
* Soil and environmental sensors

## Project Structure

```text
sih-agri-smart/
├── backend/          # FastAPI backend, APIs, ML services and integrations
├── frontend-repo/    # AgriGuard React web application
├── ai/               # Disease and crop models
├── data/             # Datasets and sample data
├── docs/             # Documentation
└── scripts/          # Setup and automation scripts
```

## Backend Setup

```bash
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

The backend health endpoint is:

```text
GET /health
```

## Frontend Setup

```bash
cd frontend-repo

npm install
npm run dev
```

For a production build:

```bash
npm run build
```

## Disease Model

The backend uses a locally stored ResNet50 model for plant disease classification.

The model expects RGB images and uses ImageNet normalization with a `224 × 224` input size.

The model checkpoint and label map are stored under:

```text
ai/disease_model/
├── resnet50_plant_disease.pth
└── label_map.json
```

If the disease model is unavailable, the API returns an appropriate service-unavailable response instead of producing a fabricated prediction.

## Configuration

Backend configuration is provided through environment variables.

Do not commit:

```text
.env
serviceAccountKey.json
```

Use environment-specific configuration for API keys, Firebase credentials, weather services, Gemini, SMS services, and other secrets.

## Production

The current application is designed as a **web application** consisting of:

```text
React/Vite frontend
        │
        ▼
FastAPI backend
        │
        ├── ResNet50 disease model
        ├── Crop recommendation model
        ├── Firebase
        ├── Weather services
        ├── Market/mandi services
        ├── Gemini
        └── SMS/alert services
```

Android/Capacitor packaging is not part of the current deployment.

## License

MIT
