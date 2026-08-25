import React, { useState, useEffect } from 'react';
import { Sprout } from 'lucide-react';
import type { 
  Language, 
  UserProfile, 
  WeatherInfo, 
  DiseaseDiagnosis, 
  HistoryRecord, 
  CartItem, 
  EcomProduct,
  Order,
  HardwareState
} from './types';
import { translations } from './data/translations';
import { cropDiseases } from './data/cropDiseases';
import { demoProfiles, sampleWeatherStations, initialHistoryRecords } from './data/sampleHistory';
import { ecommerceProducts } from './data/ecommerceProducts';

import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { NavigationTabs, type DashboardTab } from './components/NavigationTabs';
import { DiagnosticHub } from './components/DiagnosticHub';
import { EarlyDetectionCard } from './components/EarlyDetectionCard';
import { TreatmentDosageCard } from './components/TreatmentDosageCard';
import { HistoryLog } from './components/HistoryLog';
import { WeatherSoilCard } from './components/WeatherSoilCard';
import { AgriStoreCatalog } from './components/AgriStoreCatalog';
import { IoTSensorsTab } from './components/IoTSensorsTab';
import { PrescriptionModal } from './components/PrescriptionModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { ProfileFarmSettings } from './components/ProfileFarmSettings';
import { weatherAPI } from './services/api';

export const App: React.FC = () => {
  // Page Routing State: Page 1 (Auth View) vs Page 2 (Main Dashboard)
  const [currentPage, setCurrentPage] = useState<'auth' | 'dashboard'>('auth');
  
  // Dashboard Tab Navigation State (5 Tabs: diagnosis, history, weather, iot, store)
  const [activeTab, setActiveTab] = useState<DashboardTab>('diagnosis');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Global App States
  const [language, setLanguage] = useState<Language>('en');
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
    isLoggedIn: false,
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

  // E-Commerce & Cart
  const [cart, setCart] = useState<CartItem[]>([
    { product: ecommerceProducts[0], quantity: 1 },
    { product: ecommerceProducts[1], quantity: 1 }
  ]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [storeFilterIds, setStoreFilterIds] = useState<string[] | undefined>(undefined);
  const [hardwareState, setHardwareState] = useState<HardwareState>({
    isConnected: false,
    deviceId: null,
    deviceName: 'AgriGuard Prototype Node (ESP32)',
    lastPing: null,
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord-initial-1',
      orderNumber: '#AG-74291',
      date: '2026-08-21, 10:15 AM',
      items: [
        { product: ecommerceProducts[0], quantity: 2 },
        { product: ecommerceProducts[6], quantity: 1 }
      ],
      subtotal: 989,
      discount: 99,
      total: 890,
      paymentMethod: 'COD',
      paymentDetails: 'Cash on Delivery at Farm Doorstep',
      shippingAddress: {
        fullName: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        villageTaluka: 'Orchard Sector 4, Saoner Road',
        district: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440001',
      },
      status: 'Delivered',
      estimatedDelivery: 'Delivered on 22 Aug 2026',
      trackingSteps: [
        { title: 'Order Placed & Confirmed', desc: 'Order received', time: '21 Aug, 10:15 AM', completed: true, current: false },
        { title: 'Packed & Quality Certified', desc: 'Packed at Nagpur Central Agro Depot', time: '21 Aug, 02:00 PM', completed: true, current: false },
        { title: 'In Transit with Kisan Express', desc: 'Out on delivery route', time: '22 Aug, 09:00 AM', completed: true, current: false },
        { title: 'Delivered to Farm Doorstep', desc: 'Handed over to Rajesh Kumar', time: '22 Aug, 03:45 PM', completed: true, current: true },
      ]
    }
  ]);

  // Checkout & Order Confirmation States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [activeConfirmedOrder, setActiveConfirmedOrder] = useState<Order | null>(null);
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState<boolean>(false);

  // Modals & TTS
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const t = translations[language];

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

  // Auto-track location & fetch live weather on Dashboard Mount
  useEffect(() => {
    if (currentPage === 'dashboard') {
      requestLiveGpsLocation();
    }
  }, [currentPage]);

  // Auth Handlers: Prompt for GPS location permission immediately after sign in
  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setAcreage(profile.farmSize || 4.5);
    if (profile.language) {
      setLanguage(profile.language);
    }
    setCurrentPage('dashboard');
    setActiveTab('diagnosis');
    setIsAnalyzed(false);
    requestLiveGpsLocation();
  };

  const handleLogout = () => {
    setUser({
      id: '',
      name: 'Farmer Partner',
      username: '',
      phone: '',
      language: language,
      farmSize: 2.5,
      farmUnit: 'Acres',
      primaryCrop: 'Citrus (Orange / Lemon)',
      state: '',
      district: '',
      isLoggedIn: false
    });
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setCurrentPage('auth');
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
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
    if (activeTab === 'weather' || currentPage === 'dashboard') {
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
    }
  }, [activeTab, currentPage]);

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

  // Cart operations
  const handleAddToCart = (product: EcomProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleInstantBuy = (product: EcomProduct) => {
    handleAddToCart(product);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Order Placement Handler (from Checkout Modal)
  const handleOrderComplete = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]); // Clear cart
    setIsCheckoutOpen(false);
    setActiveConfirmedOrder(newOrder);
    setIsOrderConfirmationOpen(true);
  };

  // Text-To-Speech (TTS) Narration
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    const textToSpeak = `
      ${activeDiagnosis.diseaseName[language]}. 
      ${activeDiagnosis.earlyWarningAlert[language]}. 
      ${t.dosageForField} ${acreage} ${t.acresUnit}. 
      ${activeDiagnosis.organicProtocol.overview[language]}.
    `;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const unreadAlertsCount = 0;
  const totalCartItemsCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setIsMobileNavOpen(false);
  };

  // ==========================================
  // VIEW 1: Standalone Authentication Page
  // ==========================================
  if (currentPage === 'auth') {
    return (
      <AuthPage
        language={language}
        onLanguageChange={handleLanguageChange}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // ==========================================
  // VIEW 2: Main Farmer Dashboard with isolated tab views
  // ==========================================
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
          onLogout={handleLogout}
          weather={weather}
          cart={cart}
          onOpenCart={() => setIsCartOpen(true)}
          isSpeaking={isSpeaking}
          onToggleSpeech={handleToggleSpeech}
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
          cartItemsCount={totalCartItemsCount}
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
                    No Crop Scan Active: Upload a leaf photo, describe symptoms via voice, or select a sample crop above and click &apos;Analyze Crop with AgriGuard AI&apos; to generate diagnostic findings and dosage recommendations.
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
                    onNavigateToStore={() => {
                      setStoreFilterIds(activeDiagnosis.recommendedProductIds);
                      setActiveTab('store');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
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
              onNavigateToStore={() => {
                setActiveTab('store');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* ========================================================= */}
          {/* TAB 5: AGRI-STORE (FULL SUPPLIES CATALOG & ORDERS)        */}
          {/* ========================================================= */}
          {activeTab === 'store' && (
            <div className="animate-fade-in">
              <AgriStoreCatalog
                language={language}
                onAddToCart={handleAddToCart}
                onInstantBuy={handleInstantBuy}
                recommendedProductIds={storeFilterIds}
                orders={orders}
                onViewOrderDetails={(ord) => {
                  setActiveConfirmedOrder(ord);
                  setIsOrderConfirmationOpen(true);
                }}
              />
            </div>
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
              <span>AgriGuard AI — Agricultural Health, IoT & Early Warning System</span>
            </div>
            <p className="text-white/70">
              Farmer Support in English • हिंदी • தமிழ்
            </p>
            <div className="flex items-center gap-3 text-citrus-300 font-semibold">
              <span>CIB-RC Approved Formulations</span>
              <span>•</span>
              <span>ESP32 Hardware Node Mesh</span>
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

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        user={user}
        language={language}
      />

      {/* Multi-Step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        user={user}
        language={language}
        onOrderComplete={handleOrderComplete}
      />

      {/* Dedicated Order Confirmation Modal / Page */}
      <OrderConfirmationModal
        isOpen={isOrderConfirmationOpen}
        onClose={() => setIsOrderConfirmationOpen(false)}
        order={activeConfirmedOrder}
        language={language}
        onNavigateToStore={() => {
          setActiveTab('store');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToDiagnosis={() => {
          setActiveTab('diagnosis');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );
};

export default App;
