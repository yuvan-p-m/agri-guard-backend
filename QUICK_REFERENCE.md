# 🚀 SIH AGRI-SMART: QUICK REFERENCE CARD

## RIGHT NOW: EVERYTHING IS LIVE!

| Component | URL | Status | Action |
|-----------|-----|--------|--------|
| **Web App** | http://localhost:5174 | ✅ LIVE | Open in browser |
| **Backend API** | http://localhost:8000 | ✅ LIVE | Ready to use |
| **API Docs** | http://localhost:8000/docs | ✅ LIVE | Interactive testing |
| **Health Check** | http://localhost:8000/health | ✅ LIVE | Should return `{"status":"ok"}` |

---

## 🎬 START HERE

### 1️⃣ Open the App
```
http://localhost:5174
```

### 2️⃣ Register a Test Account
```
Name: Test Farmer
Email: test@farm.com
Password: Test123!
Phone: +91-9876543210
Soil: Loamy
```

### 3️⃣ Login with same credentials

### 4️⃣ Explore Features
- Disease Detection (awaiting AI model)
- Crop Recommendation (awaiting ML model)
- Sensor Dashboard
- Weather Forecast
- Risk Alerts
- Farm History

---

## 🔧 DEVELOPER COMMANDS

### View Live Status
```powershell
# Check frontend
curl http://localhost:5174

# Check backend
curl http://localhost:8000/health

# Test API
curl http://localhost:8000/docs
```

### View Logs
```powershell
# Open backend logs
Get-Content "C:\Users\kevin\Documents\sih-agri-smart\backend\app\logs\app.log" -Tail 50
```

### Stop Services
```powershell
# Kill backend (find via port 8000)
taskkill /PID <PID> /F

# Kill frontend (find via port 5174)
taskkill /PID <PID> /F
```

### Restart Backend
```powershell
cd C:\Users\kevin\Documents\sih-agri-smart\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

### Restart Frontend
```powershell
cd C:\Users\kevin\Documents\sih-agri-smart\frontend-repo
npm run dev
```

---

## 📝 API EXAMPLES

### Register Farmer
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farmer",
    "email": "test@farm.com",
    "password": "Test123!",
    "phone": "+91-9876543210",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "soil_type": "Loamy"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@farm.com",
    "password": "Test123!"
  }'
```

### Get Weather Forecast
```bash
curl -X POST http://localhost:8000/api/v1/weather/forecast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "latitude": 28.7041,
    "longitude": 77.1025
  }'
```

---

## 🎯 KEY FILE LOCATIONS

```
C:\Users\kevin\Documents\sih-agri-smart\
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── api/                    # 11 API modules
│   │   ├── core/
│   │   │   ├── config.py           # Settings
│   │   │   ├── security.py         # JWT + Bcrypt
│   │   │   └── logger.py           # Logging
│   │   ├── db/
│   │   │   ├── models.py           # SQLAlchemy models
│   │   │   └── session.py          # DB connection
│   │   └── logs/
│   │       └── app.log             # Application logs
│   ├── database.db                 # SQLite database
│   └── venv/                       # Python virtual environment
│
├── frontend-repo/
│   ├── src/
│   │   ├── pages/                  # 5 main pages
│   │   ├── components/             # 19 components
│   │   └── services/
│   │       └── api.js              # Axios client
│   ├── dist/                       # Built React app
│   ├── android/                    # Capacitor Android project
│   └── capacitor.config.json       # Mobile config
│
└── docs/
    ├── EVERYTHING_RUNNING.md       # Full status report
    ├── SYSTEM_RUNNING.md           # Setup guide
    └── architecture.md             # System design
```

---

## 🧪 TEST FLOW

```
1. Open http://localhost:5174
   ↓
2. Click "Register"
   ↓
3. Fill in farmer details
   ↓
4. Submit → Backend stores in DB
   ↓
5. Redirect to login
   ↓
6. Enter email/password
   ↓
7. Submit → Backend validates, returns JWT
   ↓
8. Frontend stores token, navigates to dashboard
   ↓
9. Dashboard loads, authenticated!
   ↓
10. Try each feature:
    - Disease Detection (upload image)
    - Crop Recommendation (select soil type)
    - Sensor Data (view latest readings)
    - Weather Forecast (shows data)
    - Risk Alerts (shows early warnings)
    - Farm History (analytics)
```

---

## ⚙️ CONFIGURATION

### Backend `.env` File
```
Location: C:\Users\kevin\Documents\sih-agri-smart\backend\.env

SECRET_KEY=your-secret-key-change-for-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=24 * 60

DATABASE_URL=sqlite:///./database.db

# Optional (fill in later):
OPENWEATHER_API_KEY=your-key-here
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
```

### Frontend `.env` File
```
Location: C:\Users\kevin\Documents\sih-agri-smart\frontend-repo\.env

VITE_API_BASE_URL=http://localhost:8000
```

---

## 🚨 COMMON ISSUES & FIXES

### "Port 8000 already in use"
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### "Cannot find module 'core'"
- ✅ Already fixed! (Import path corrected)

### "Database locked"
- Delete `database.db`, restart backend (will recreate)

### "CORS error"
- ✅ Already configured! CORS enabled in backend

### "JWT token invalid"
- Make sure token is in `Authorization: Bearer <token>` header
- Check token hasn't expired (24 hour default)

---

## 📱 MOBILE APP

### Build APK
```bash
cd frontend-repo
npm run build
npx cap add android
npx cap open android
# (Android Studio opens)
# Click Run → Select Emulator
```

### API URL for Mobile
```
Emulator: http://10.0.2.2:8000
Device:   http://<YOUR_PC_IP>:8000
```

---

## 🎉 YOU'RE ALL SET!

- ✅ Frontend: http://localhost:5174
- ✅ Backend: http://localhost:8000
- ✅ Ready for feature development
- ✅ Ready for testing
- ✅ Ready for SIH submission!

**Next**: Get AI models from your friend → Integrate → Deploy

Good luck! 🌾🤖
