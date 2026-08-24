# Frontend-Backend Integration Guide

## Current Status
✅ Frontend: Fully built with demo data
✅ Backend: All 11 APIs ready

## What to Do Now

### Step 1: Replace Demo Auth with Real API

In `src/App.tsx`, update the login handler:

```typescript
// OLD (Demo)
const handleLoginSuccess = (profile: UserProfile) => {
  setUser(profile);
  setCurrentPage('dashboard');
};

// NEW (Real API)
const handleLoginSuccess = async (phone: string, password: string) => {
  try {
    const response = await authAPI.login({ phone, password });
    localStorage.setItem('access_token', response.data.access_token);
    
    // Fetch farmer profile
    const farmerData = await diseaseAPI.history(); // or create /farmer endpoint
    setUser({
      name: phone,
      phone: phone,
      isLoggedIn: true,
      farmSize: 4.5,
      ...farmerData
    });
    setCurrentPage('dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Step 2: Connect Disease Detection

In `DiagnosticHub.tsx`, replace mock prediction with real API:

```typescript
// Before: setActiveDiagnosis(mockResult);
// After:
const handleUploadImage = async (file: File) => {
  setIsAnalyzing(true);
  try {
    const result = await diseaseAPI.predict(file);
    setActiveDiagnosis(result.data);
    setIsAnalyzed(true);
  } catch (error) {
    console.error('Prediction failed:', error);
  } finally {
    setIsAnalyzing(false);
  }
};
```

### Step 3: Connect Sensor Data

In `IoTSensorsTab.tsx`:

```typescript
// Replace mock sensor data with real data
useEffect(() => {
  const fetchSensorData = async () => {
    const data = await sensorAPI.getLatest();
    setSensorReadings(data.readings);
  };
  fetchSensorData();
  // Poll every 30 seconds
  const interval = setInterval(fetchSensorData, 30000);
  return () => clearInterval(interval);
}, []);
```

### Step 4: Connect Weather & Risk Alerts

In `WeatherSoilCard.tsx` & `EarlyDetectionCard.tsx`:

```typescript
// Fetch weather
const weatherData = await weatherAPI.forecast();
setWeather(weatherData);

// Fetch risk score
const riskData = await riskAPI.earlyWarning();
setRiskLevel(riskData.overall_risk_score);
```

### Step 5: Connect E-Commerce

In `AgriStoreCatalog.tsx`:

```typescript
// Fetch products from backend
const products = await ecommerceAPI.getPesticides();
setProducts(products);
```

### Step 6: Connect SMS Alerts

In `SmsAlertsPanel.tsx`:

```typescript
// Subscribe to alerts
await alertsAPI.subscribe(phone, crop, ['disease_risk', 'weather_warning']);

// Send manual alert
await alertsAPI.sendRiskAlert(phone, disease, riskLevel, preventiveAction);
```

### Step 7: Connect Feedback Loop

In `HistoryLog.tsx`:

```typescript
// Submit feedback on past predictions
const handleFeedback = async (predictionId, worked, actualDisease) => {
  await feedbackAPI.submit({
    prediction_id: predictionId,
    worked: worked,
    actual_disease: actualDisease,
    comment: userComment
  });
};
```

## Backend API Endpoints Ready

| Feature | Endpoint | Method |
|---------|----------|--------|
| Auth | `/auth/login`, `/auth/register` | POST |
| Disease | `/disease/predict`, `/disease/history` | POST, GET |
| Crop Recommendation | `/crop/recommend` | POST |
| Sensors | `/sensors/reading`, `/sensors/latest` | POST, GET |
| Weather | `/weather/forecast`, `/weather/current` | GET |
| Risk | `/risk/early-warning`, `/risk/history` | GET |
| Feedback | `/feedback/submit`, `/feedback/impact` | POST, GET |
| Pesticides | `/pesticides/recommend-dose` | POST |
| E-Commerce | `/ecommerce/products/{name}` | GET |
| Alerts | `/alerts/subscribe`, `/alerts/send-risk-alert` | POST |
| History | `/history/dashboard`, `/history/trends` | GET |

## Token Management

Add to `src/services/api.js`:

```javascript
// Intercept requests to add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 - auto logout on token expiry
apiClient.interceptors.response.use(null, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  }
  return Promise.reject(error);
});
```

## Environment Setup

Update `frontend-repo/.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=30000
```

For Android Emulator:
```
VITE_API_BASE_URL=http://10.0.2.2:8000/api/v1
```

For deployed backend:
```
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

## Testing Flow

1. Start backend: `uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Test login (register new farmer first)
4. Upload image → should call `/disease/predict`
5. Check sensor panel → should fetch from `/sensors/latest`
6. Check weather → should fetch from `/weather/forecast`
7. Check risk alerts → should fetch from `/risk/early-warning`

## Common Issues

### 401 Unauthorized
- Token expired or not sent. Check localStorage for `access_token`
- Verify Authorization header format: `Bearer {token}`

### CORS Error
- Backend CORS middleware already allows all origins
- If still failing, check backend is running on port 8000

### 404 Not Found
- Endpoint path doesn't match. Check API prefix: `/api/v1`
- Example: POST `/api/v1/auth/login` NOT `/auth/login`

### Data Type Mismatch
- Frontend expects fields that backend doesn't return
- Update response schemas in backend or TypeScript interfaces in frontend
