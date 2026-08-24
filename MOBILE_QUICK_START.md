# 🚀 Quick Mobile App Commands

## One-Line Setup
```bash
cd frontend-repo && npm run build && npx cap sync android && npx cap open android
```

## Step-by-Step

**1. Build React**
```bash
cd frontend-repo
npm run build
```

**2. Sync to Android**
```bash
npx cap sync android
```

**3. Open in Android Studio**
```bash
npx cap open android
```

**4. Run on Emulator**
- Android Studio → Device Manager → Start Emulator
- Click Run (Green Play Button)
- Select Emulator
- App launches!

## After Code Changes

```bash
# Quick rebuild & sync
npm run build && npx cap sync && npx cap open android
```

## Emulator Backend URL

File: `frontend-repo/android/app/src/main/assets/capacitor.config.json`

```json
{
  "server": {
    "url": "http://10.0.2.2:8000/api/v1"
  }
}
```

Then rebuild!

## Check App is Running

```bash
# List connected devices
adb devices

# View logs
adb logcat

# Install APK manually
adb install path/to/app.apk

# Start app
adb shell am start -n com.sihagrismartdev/.MainActivity
```

## API Base URL Changes

**Web**:
```javascript
'http://localhost:5173'
```

**Emulator**:
```javascript
'http://10.0.2.2:8000/api/v1'
```

**Physical Device (same WiFi)**:
```javascript
'http://192.168.x.x:8000/api/v1'  // Replace x.x with your machine IP
```

Get your IP:
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```

## Generate APK for Sharing

```bash
cd frontend-repo/android
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

## Clean Build (if having issues)

```bash
npm run build
rm -r android
npx cap add android
npx cap sync
npx cap open android
```

---

**Status**: ✅ Ready to build & test!
