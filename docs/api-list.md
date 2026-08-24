# API Specification

Base URL: `http://localhost:8000/api/v1`

## Authentication

### POST /auth/register
Register a new farmer.

**Request:**
```json
{
  "phone": "+919876543210",
  "password": "securepass123",
  "name": "Raj Kumar",
  "location_lat": 28.7041,
  "location_lng": 77.1025,
  "soil_type": "loamy"
}
```

**Response:**
```json
{
  "id": 1,
  "phone": "+919876543210",
  "name": "Raj Kumar",
  "access_token": "eyJ0eXA..."
}
```

### POST /auth/login
Login farmer.

**Request:**
```json
{
  "phone": "+919876543210",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXA...",
  "token_type": "bearer"
}
```

---

## Disease Detection

### POST /disease/predict
Upload leaf image and get disease prediction.

**Request:** (multipart/form-data)
- `file`: leaf image (jpg, png)

**Response:**
```json
{
  "disease": "Early Blight",
  "confidence": 0.94,
  "severity": "medium",
  "treatment": "Spray Chlorothalonil",
  "pesticide_dose": "2.5ml per liter",
  "ecommerce_links": {
    "amazon": "https://...",
    "flipkart": "https://..."
  },
  "prediction_id": 123
}
```

### GET /disease/history
Get farmer's past disease records.

**Response:**
```json
{
  "records": [
    {
      "id": 1,
      "disease": "Early Blight",
      "date": "2024-08-20",
      "confidence": 0.94,
      "image_url": "https://..."
    }
  ]
}
```

---

## Crop Recommendation

### POST /crop/recommend
Get crop recommendation based on soil & location.

**Request:**
```json
{
  "soil_type": "loamy",
  "soil_ph": 6.5,
  "soil_npk": {"n": 40, "p": 20, "k": 30},
  "farm_size_acres": 2
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "rank": 1,
      "crop": "Wheat",
      "suitability_score": 0.92,
      "expected_yield": "45 quintals/acre",
      "water_requirement": "60cm"
    },
    {
      "rank": 2,
      "crop": "Barley",
      "suitability_score": 0.87,
      "expected_yield": "40 quintals/acre",
      "water_requirement": "45cm"
    }
  ]
}
```

---

## Sensor Data

### POST /sensors/reading
Submit sensor reading from IoT device.

**Request:**
```json
{
  "device_id": "SENSOR_001",
  "npk": {"n": 45, "p": 22, "k": 35},
  "ph": 6.8,
  "moisture": 65,
  "temperature": 28,
  "humidity": 72
}
```

**Response:**
```json
{
  "status": "ok",
  "reading_id": 456
}
```

### GET /sensors/latest
Get latest 10 sensor readings.

**Response:**
```json
{
  "readings": [
    {
      "id": 456,
      "timestamp": "2024-08-24T15:30:00Z",
      "npk": {"n": 45, "p": 22, "k": 35},
      "ph": 6.8,
      "moisture": 65,
      "temperature": 28,
      "humidity": 72
    }
  ]
}
```

---

## Weather & Early Detection

### GET /weather/forecast
Get 7-day weather forecast for farmer's location.

**Response:**
```json
{
  "location": "New Delhi",
  "forecast": [
    {
      "date": "2024-08-25",
      "temp_max": 32,
      "temp_min": 24,
      "humidity": 75,
      "rainfall_mm": 5,
      "disease_risk": "high",
      "risk_reason": "High humidity favors early blight"
    }
  ]
}
```

### GET /risk/early-warning
Get early disease risk prediction.

**Response:**
```json
{
  "overall_risk_score": 0.78,
  "high_risk_diseases": [
    {
      "disease": "Early Blight",
      "probability": 0.85,
      "days_until_outbreak": 3,
      "preventive_measures": "Spray Mancozeb, improve drainage"
    }
  ]
}
```

---

## SMS Alerts

### POST /alerts/subscribe
Subscribe to SMS alerts.

**Request:**
```json
{
  "phone": "+919876543210",
  "crop": "Potato",
  "alert_types": ["disease_risk", "weather_warning", "treatment_reminder"]
}
```

**Response:**
```json
{
  "status": "subscribed",
  "next_alert_date": "2024-08-25T10:00:00Z"
}
```

---

## Pesticide Advisor

### POST /pesticides/recommend-dose
Get pesticide dosage recommendation.

**Request:**
```json
{
  "disease": "Early Blight",
  "pesticide_name": "Chlorothalonil",
  "farm_size_acres": 2,
  "crop": "Potato"
}
```

**Response:**
```json
{
  "pesticide": "Chlorothalonil",
  "total_quantity_ml": 500,
  "dilution_ratio": "1:200",
  "spray_schedule": {
    "first_spray": "now",
    "second_spray": "7 days later",
    "third_spray": "14 days later"
  },
  "safety_notes": "Wear gloves, avoid spray near water sources"
}
```

---

## Farmer Feedback Loop

### POST /feedback/submit
Submit feedback on a prediction.

**Request:**
```json
{
  "prediction_id": 123,
  "worked": true,
  "actual_disease": "Early Blight",
  "comment": "Treatment worked perfectly, disease cleared in 5 days"
}
```

**Response:**
```json
{
  "feedback_id": 789,
  "status": "recorded",
  "model_improvement_impact": "Your feedback will help improve our model"
}
```

### GET /feedback/impact
See how your feedback improved the model.

**Response:**
```json
{
  "total_feedback_given": 12,
  "helpful_feedback": 11,
  "model_accuracy_before": 0.87,
  "model_accuracy_after": 0.91,
  "accuracy_improvement": 4.6
}
```

---

## Error Responses

All errors return:
```json
{
  "detail": "Error message",
  "error_code": "INVALID_INPUT"
}
```

**Status Codes:**
- `200`: OK
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Server Error
