import React, { useState, useEffect } from 'react';
import { Sprout } from 'lucide-react';
import type { 
  Language, 
  UserProfile, 
  WeatherInfo, 
  DiseaseDiagnosis, 
  HistoryRecord, 
  HardwareState
} from './types';
import { useLanguage } from './i18n';
import { cropDiseases } from './data/cropDiseases';
import { sampleWeatherStations, initialHistoryRecords } from './data/sampleHistory';

import { Header } from './components/Header';
import { NavigationTabs, type DashboardTab } from './components/NavigationTabs';
import { DiagnosticHub } from './components/DiagnosticHub';
import { EarlyDetectionCard } from './components/EarlyDetectionCard';
import { TreatmentDosageCard } from './components/TreatmentDosageCard';
import { HistoryLog } from './components/HistoryLog';
import { WeatherSoilCard } from './components/WeatherSoilCard';
import { IoTSensorsTab } from './components/IoTSensorsTab';
import { PrescriptionModal } from './components/PrescriptionModal';
import { ProfileFarmSettings } from './components/ProfileFarmSettings';
import { weatherAPI } from './services/api';

export const App: React.FC = () => {
  // Dashboard tab navigation state
  const [activeTab, setActiveTab] = useState<DashboardTab>('diagnosis');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Global App States
  const { language, setLanguage } = useLanguage();
  const [user, setUser] = useState<UserProfile>({
    id: '',
    name: 'Farmer Partner',
    username: '',
    phone: '',
    language: 'en',
    farmSize: 2.5,
    farmUnit: 'Acres',
    primaryCrop: 'Citrus (Orange / Lemon)',
    state: '',
    district: '',
  });
  const [weather, setWeather] = useState<WeatherInfo>(sampleWeatherStations['Nagpur (Citrus Belt)']);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [isGpsDenied, setIsGpsDenied] = useState<boolean>(false);
  
  // Diagnostic States
  const [activeDiagnosis, setActiveDiagnosis] = useState<DiseaseDiagnosis>(cropDiseases[0]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);
  const [acreage, setAcreage] = useState<number>(4.5);

  // History & Feedback States
  const [history, setHistory] = useState<HistoryRecord[]>(initialHistoryRecords);

  const [hardwareState, setHardwareState] = useState<HardwareState>({
    isConnected: false,
    deviceId: null,
    deviceName: 'AgriGuard Prototype Node (ESP32)',
    lastPing: null,
  });

  // Modals
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState<boolean>(false);

  const { t } = useLanguage();

  // Trigger high-accuracy live GPS tracking
  const requestLiveGpsLocation = (isManualRetry = false) => {
    if ('geolocation' in navigator) {
      setIsWeatherLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGpsDenied(false);
          const { latitude: lat, longitude: lon } = pos.coords;
          fetchLiveWeatherByCoords(lat, lon);
        },
        (err) => {
          console.warn("GPS tracking denied or failed:", err);
          setIsGpsDenied(true);
          setIsWeatherLoading(false);
          if (isManualRetry || !weather.city) {
            fetchLiveWeatherByCity('Nagpur');
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsGpsDenied(true);
      fetchLiveWeatherByCity('Nagpur');
    }
  };

  const handleProfileSave = (profile: UserProfile) => {
    setUser(profile);
    setAcreage(profile.farmSize || 4.5);
  };

  const handlePairHardware = () => {
    const lastPing = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    setHardwareState({
      isConnected: true,
      deviceId: 'ESP32-AgriNode-#01',
      deviceName: 'AgriGuard Prototype Node (ESP32)',
      lastPing,
    });
    setUser((profile) => ({ ...profile, iotDeviceSerial: 'ESP32-AgriNode-#01' }));
  };

  // Language & Location Handlers
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setUser((prev) => ({ ...prev, language: newLang }));
  };

  const fetchLiveWeatherByCoords = async (lat: number, lon: number) => {
    setIsWeatherLoading(true);
    try {
      const data = await weatherAPI.getWeatherByCoords(lat, lon);
      if (data) {
        setWeather(data as WeatherInfo);
        if (data.city || data.location) {
          const locName = data.city || data.location;
          setUser((prev) => ({
            ...prev,
            location: locName,
            district: locName,
            latitude: lat,
            longitude: lon,
          }));
        }
      }
    } catch (err) {
      console.warn("GPS Weather API fetch error, falling back to city lookup:", err);
      fetchLiveWeatherByCity(weather.city || 'Nagpur');
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const fetchLiveWeatherByCity = async (cityName: string) => {
    setIsWeatherLoading(true);
    try {
      const data = await weatherAPI.getWeatherByCity(cityName);
      if (data) {
        setWeather(data as WeatherInfo);
      }
    } catch (err) {
      console.warn("Live Weather API warning:", err);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          fetchLiveWeatherByCoords(lat, lon);
        },
        (err) => {
          console.warn("GPS location permission denied or error, fallback to default city:", err);
          fetchLiveWeatherByCity(weather.city || 'Nagpur');
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      fetchLiveWeatherByCity(weather.city || 'Nagpur');
    }
  }, [activeTab]);

  const handleLocationSelect = (stationName: string) => {
    const cleanCity = stationName.split('(')[0].trim();
    fetchLiveWeatherByCity(cleanCity);
  };

  // AI Diagnostic Analysis
  const handleAnalyze = (diagnosis: DiseaseDiagnosis, customImage?: string) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      setActiveDiagnosis(diagnosis);
      setIsAnalyzing(false);
      setIsAnalyzed(true);

      // Add to history records automatically
      const newRecord: HistoryRecord = {
        id: `hist-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        crop: diagnosis.cropName[language].split('/')[0].trim(),
        diseaseName: diagnosis.diseaseName[language],
        stage: diagnosis.stage,
        severity: diagnosis.spreadRiskRate > 50 ? 'High' : 'Moderate',
        status: 'In Treatment',
        fieldArea: `${acreage} ${t.acresUnit}`,
        treatmentChosen: 'Organic',
        feedback: null,
        confidenceScore: diagnosis.confidence,
        imageThumbnail: customImage || diagnosis.sampleImage
      };

      setHistory((prev) => [newRecord, ...prev]);

      // Scroll smoothly to the diagnosis card
      const resultsEl = document.getElementById('diagnosis-results');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1500);
  };

  // History Feedback & Re-Reference Handlers
  const handleUpdateFeedback = (recordId: string, feedback: 'worked' | 'not_worked') => {
    setHistory((prev) =>
      prev.map((rec) =>
        rec.id === recordId
          ? {
              ...rec,
              feedback,
              status: feedback === 'worked' ? 'Resolved' : 'In Treatment',
              feedbackTimestamp: new Date().toISOString().split('T')[0]
            }
          : rec
      )
    );
  };

  const handleSelectHistoryItem = (record: HistoryRecord) => {
    const matched = cropDiseases.find(
      (d) =>
        d.diseaseName[language].toLowerCase().includes(record.diseaseName.toLowerCase()) ||
        d.cropName[language].toLowerCase().includes(record.crop.toLowerCase())
    );
    if (matched) {
      setActiveDiagnosis(matched);
    }
    setActiveTab('diagnosis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unreadAlertsCount = 0;

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setIsMobileNavOpen(false);
  };

  // Main Farmer Dashboard with isolated tab views
  return (
    <div className="relative min-h-screen max-w-[100vw] overflow-x-hidden font-sans bg-earth-50 text-slate-800 antialiased pb-16 sm:pb-0">
      
      {/* 100% Sharp, Crisp, and Clear Background matching Login page clarity */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/dashboard-bg.jpg')" }}
      >
        {/* Soft edge tint to maintain pristine image clarity while maximizing card contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-agri-950/80 via-agri-950/40 to-agri-950/75" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Sticky Glassmorphism Header */}
        <Header
          language={language}
          onLanguageChange={handleLanguageChange}
          user={user}
          weather={weather}
          unreadNotifications={unreadAlertsCount}
          isMobileNavOpen={isMobileNavOpen}
          onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
          onOpenNotifications={() => {
            setActiveTab('weather');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Tab Navigation (Desktop Top Bar / Mobile Bottom Bar) */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          unreadSmsCount={unreadAlertsCount}
          isMobileOpen={isMobileNavOpen}
          onCloseMobileNav={() => setIsMobileNavOpen(false)}
        />

        {/* Dashboard Content Area */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 md:pl-72 md:pr-8">
          
          {/* ========================================================= */}
          {/* TAB 1: CROP DIAGNOSIS (Default Focused View)               */}
          {/* ========================================================= */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
              
              {/* 1. Input Area: Dual Input Photo & Voice/Symptoms */}
              <DiagnosticHub
                language={language}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                selectedAcreage={acreage}
                onAcreageChange={(val) => setAcreage(val)}
                activeDiagnosis={activeDiagnosis}
                isAnalyzed={isAnalyzed}
                onClearAnalysis={() => setIsAnalyzed(false)}
              />

              {!isAnalyzed && (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-lg border border-agri-200/80 text-center animate-fade-in">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-agri-100 flex items-center justify-center text-2xl">📷</div>
                  <p className="mt-3 text-sm sm:text-base font-bold leading-relaxed text-slate-700">
                    {t.noCropScan}
                  </p>
                </div>
              )}

              {isAnalyzed && (
                <>
                  {/* 2. AI Early Disease Detection Results */}
                  <div id="diagnosis-results">
                    <EarlyDetectionCard
                      diagnosis={activeDiagnosis}
                      language={language}
                      onOpenPrescription={() => setIsPrescriptionOpen(true)}
                    />
                  </div>

                  {/* 3. Precision Treatment & Dosage Recommendations */}
                  <TreatmentDosageCard
                    diagnosis={activeDiagnosis}
                    language={language}
                    acreage={acreage}
                  />
                </>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: DISEASE HISTORY & FEEDBACK                          */}
          {/* ========================================================= */}
          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <HistoryLog
                language={language}
                history={history}
                onUpdateFeedback={handleUpdateFeedback}
                onSelectHistoryItem={handleSelectHistoryItem}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: WEATHER & SMS ADVISORY                              */}
          {/* ========================================================= */}
          {/* ========================================================= */}
          {/* TAB 3: WEATHER FORECAST (GPS LIVE METEOROLOGICAL TELEMETRY) */}
          {/* ========================================================= */}
          {activeTab === 'weather' && (
            <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
              <WeatherSoilCard
                weather={weather}
                language={language}
                isLoading={isWeatherLoading}
                isGpsDenied={isGpsDenied}
                onRefreshLocation={() => requestLiveGpsLocation(true)}
                onManualCitySubmit={(cityName) => fetchLiveWeatherByCity(cityName)}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: IOT SENSOR TELEMETRY (LIVE HARDWARE PROTOTYPE)       */}
          {/* ========================================================= */}
          {activeTab === 'iot' && (
            <IoTSensorsTab
              language={language}
              hardwareState={hardwareState}
              onPairHardware={handlePairHardware}
              onNavigateToDiagnosis={() => {
                setActiveTab('diagnosis');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileFarmSettings language={language} user={user} onSave={handleProfileSave} hardwareState={hardwareState} />
          )}

        </main>

        {/* Global Footer */}
        <footer className="border-t border-white/20 bg-slate-900/80 backdrop-blur-md mt-12 py-6 text-center text-xs text-white/70 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-white">
              <Sprout className="w-4 h-4 text-citrus-400" />
              <span>{t.dashboardFooter}</span>
            </div>
            <p className="text-white/70">
              {t.footerSupport}
            </p>
            <div className="flex items-center gap-3 text-citrus-300 font-semibold">
              <span>{t.footerApproved}</span>
              <span>•</span>
              <span>{t.footerHardware}</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Modals & Drawers */}
      <PrescriptionModal
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
        diagnosis={activeDiagnosis}
        user={user}
        acreage={acreage}
        language={language}
      />

    </div>
  );
};

export default App;
