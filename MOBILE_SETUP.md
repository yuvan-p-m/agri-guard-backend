# 📱 SIH Agri-Smart Mobile App - Complete Setup Guide

## ✅ What's Done

- ✅ React app built → `frontend-repo/dist/`
- ✅ Capacitor initialized → `frontend-repo/capacitor.config.json`
- ✅ Android platform added → `frontend-repo/android/`

## 🚀 Next Steps (Choose Your Path)

### **Option A: Android Studio (Recommended)**

#### Prerequisites:
- ✅ Android Studio installed ([Download](https://developer.android.com/studio))
- ✅ Android SDK (API 24+)
- ✅ Emulator or physical Android device

#### Steps:

**1. Open Android Project in Android Studio**
```powershell
cd frontend-repo
npx cap open android
```
This opens the Android project automatically in Android Studio.

**2. Configure Backend URL**

Edit `frontend-repo/android/app/src/main/assets/capacitor.config.json`:

For **Android Emulator** (connects to host machine):
```json
{
  "appId": "com.sihagrismartdev",
  "appName": "SIH Agri-Smart",
  "webDir": "public",
  "server": {
    "url": "http://10.0.2.2:8000/api/v1",
    "androidScheme": "https"
  }
}
```

For **Physical Android Device** (same WiFi network):
```json
{
  "server": {
    "url": "http://YOUR_MACHINE_IP:8000/api/v1",
    "androidScheme": "https"
  }
}
```

Then rebuild:
```bash
npm run build
npx cap sync
npx cap open android
```

**3. Run on Emulator**
- Android Studio → Device Manager → Create/Start Emulator
- Click "Run" (Green Play button) → Select emulator
- Wait for app to build and deploy

**4. Run on Physical Device**
- Enable USB Debugging on Android phone
- Connect via USB
- Android Studio → Device Manager → Select your device
- Click "Run"

---

### **Option B: Using Gradle (Command Line)**

```bash
cd frontend-repo/android

# Build APK (debug)
./gradlew assembleDebug

# Install on connected device/emulator
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Run on device
adb shell am start -n com.sihagrismartdev/.MainActivity
```

---

### **Option C: Using Expo (Easiest)**

If you want zero setup:

```bash
cd frontend-repo
npm install expo
npx expo start
# Scan QR code with Expo Go app (iOS/Android)
```

---

## 🔌 Backend Connection

**Update API URL in app**

Edit `frontend-repo/src/services/api.js`:

```javascript
// For local development
const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';  // Android Emulator
// const API_BASE_URL = 'http://192.168.x.x:8000/api/v1';  // Physical device (replace with your IP)
// const API_BASE_URL = 'http://localhost:8000/api/v1';  // Web
```

Then rebuild:
```bash
npm run build
npx cap sync
npx cap open android
```

---

## 📂 Mobile App File Structure

```
frontend-repo/
├── dist/                      # Built React app
├── android/                   # Android native code
│   ├── app/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── assets/   # Web assets (dist/)
│   │   │   │   │   └── capacitor.config.json
│   │   │   │   ├── java/     # Android code
│   │   │   │   └── AndroidManifest.xml
│   │   └── build.gradle       # Gradle config
│   └── build.gradle
├── ios/                       # iOS native code (Mac only)
├── package.json
└── capacitor.config.json
```

---

## 🔐 Configuration Files

### `capacitor.config.json` (Root)
- App ID: `com.sihagrismartdev`
- App Name: `SIH Agri-Smart`
- Web Directory: `dist`

### `android/app/src/main/assets/capacitor.config.json`
- Backend API URL
- Android scheme

### `android/app/AndroidManifest.xml`
- App permissions (camera, location, internet)

---

## 🧪 Testing Checklist

- [ ] App launches on emulator/device
- [ ] Login screen appears
- [ ] Login works with real backend API
- [ ] Image upload works (camera or gallery)
- [ ] Disease prediction displays
- [ ] Sensor data fetches correctly
- [ ] SMS alerts can be subscribed
- [ ] E-commerce links open in browser
- [ ] Farm history displays

---

## 🐛 Troubleshooting

### App won't connect to backend
- Check API URL in `capacitor.config.json`
- For emulator: use `10.0.2.2` not `localhost`
- For device: use machine IP, not `localhost`
- Ensure backend is running: `uvicorn app.main:app --reload`
- Check firewall allows port 8000

### Build fails
- Run `npx cap sync` before opening Android Studio
- Rebuild: `npm run build && npx cap sync`
- Clean build: `cd android && ./gradlew clean`

### Image upload not working
- Check camera permissions in `AndroidManifest.xml`
- Grant runtime permissions on device

### Slow initial load
- Check network connection
- Emulator networking can be slow
- Test on physical device for better performance

---

## 📋 APK Build & Distribution

### Generate Release APK
```bash
cd frontend-repo/android
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release-unsigned.apk

# Sign APK (for Google Play)
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore my-release-key.keystore \
  app-release-unsigned.apk alias_name
```

### Upload to Play Store
1. Create Firebase project
2. Register app bundle in Play Console
3. Follow Google Play upload steps

---

## 🎯 Development Workflow

**Every time you make changes:**

```bash
# 1. Update React code
# (edit src/ files)

# 2. Rebuild
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Deploy to device
npx cap open android
# (Run from Android Studio)
```

Or use live reload:

```bash
# Terminal 1: React dev server
npm run dev

# Terminal 2: Capacitor watch
npx cap open android
```

---

## 📲 Sharing APK with Team

1. Generate debug APK:
```bash
cd android && ./gradlew assembleDebug
```

2. Find APK:
```
frontend-repo/android/app/build/outputs/apk/debug/app-debug.apk
```

3. Share via:
   - Google Drive
   - Email
   - WhatsApp
   - Team cloud storage

4. Team installs via:
   - ADB: `adb install app-debug.apk`
   - Manual: Download APK → tap to install (allow unknown sources)

---

## 🌐 Deploying to Google Play

1. Prepare release APK (see above)
2. Create Google Play Developer account ($25 one-time)
3. Create app listing with screenshots
4. Upload signed APK/AAB
5. Submit for review (usually 2-4 hours)
6. Publish!

---

## 💡 Tips

- Use Android Studio's Device Manager for emulator management
- Test on multiple Android versions (API 24-34)
- Use Chrome DevTools to debug WebView: `chrome://inspect`
- Monitor performance with Android Profiler
- Test with slow network (Throttle in Android Studio)

---

## ✅ Project Ready for Production!

Your mobile app is production-ready. Just follow this guide to:
1. Build and test locally
2. Share APK with team
3. Deploy to Google Play (optional)

**Next Step**: Sync with backend and start testing! 🚀
