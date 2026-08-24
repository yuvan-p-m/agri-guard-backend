# Capacitor Setup Guide

## Already Done ✅
- Capacitor Core & CLI installed
- `capacitor.config.json` created
- API service configured (connects to backend)

## Next Steps

### 1. Build React App
```bash
cd frontend-repo
npm run build
```

### 2. Initialize Capacitor
```bash
npx cap init
```
When prompted:
- App name: `SIH Agri-Smart`
- App ID: `com.sihagrismartdev`

### 3. Add Android Platform
```bash
npx cap add android
```
(Requires Android Studio installed)

### 4. Add iOS Platform (Mac only)
```bash
npx cap add ios
```
(Requires Xcode installed)

### 5. Sync Code to Mobile
```bash
npx cap sync
```

### 6. Open in Android Studio
```bash
npx cap open android
```
Then run on emulator or connected device.

### 7. Open in Xcode (Mac only)
```bash
npx cap open ios
```

## Important: Update Backend URL

Edit `.env` in frontend-repo:
- **For Web Dev**: `VITE_API_BASE_URL=http://localhost:8000/api/v1`
- **For Android Emulator**: `VITE_API_BASE_URL=http://10.0.2.2:8000/api/v1` (special IP for emulator to reach host)
- **For Android Device (same network)**: `VITE_API_BASE_URL=http://<your-machine-ip>:8000/api/v1`
- **For Production**: Use your deployed backend URL

Then rebuild and sync:
```bash
npm run build
npx cap sync
```

## Testing Flow
1. Backend running: `uvicorn app.main:app --reload`
2. Android emulator open
3. App should connect to backend APIs
