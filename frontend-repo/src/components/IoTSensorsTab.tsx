import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  Wifi, 
  BatteryCharging, 
  RefreshCw, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Sun, 
  Sparkles, 
  Activity, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import type { HardwareState, Language, IoTSensorData } from '../types';
import { translations } from '../data/translations';

interface IoTSensorsTabProps {
  language: Language;
  onNavigateToDiagnosis?: () => void;
  onNavigateToStore?: () => void;
  hardwareState: HardwareState;
  onPairHardware: () => void;
}

export const IoTSensorsTab: React.FC<IoTSensorsTabProps> = ({
  language,
  onNavigateToDiagnosis,
  onNavigateToStore,
  hardwareState,
  onPairHardware,
}) => {
  const t = translations[language];
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Just now');

  // Live telemetry state (simulating real-time sensor node readings)
  const [telemetry, setTelemetry] = useState<IoTSensorData>({
    deviceId: hardwareState.deviceId || 'ESP32-AGRI-01',
    nodeName: 'ESP32 / Arduino Node #01',
    lastUpdated: 'Live Stream: 2 seconds ago',
    isOnline: hardwareState.isConnected,
    batteryLevel: 94,
    signalStrengthDbm: -68,
    ambientTempC: 28.5,
    soilTempC: 24.2,
    ambientHumidityPct: 78,
    soilMoisturePct: 65,
    soilMoistureStatus: 'Adequate',
    rainStatus: 'No Rain',
    rainIntensityMmHr: 0.0,
    solarRadiationWm2: 740,
    npk: {
      nitrogenMgKg: 140,
      nitrogenStatus: 'Sufficient',
      phosphorusMgKg: 35,
      phosphorusStatus: 'Low',
      potassiumMgKg: 210,
      potassiumStatus: 'Optimal',
    },
    aiAdvisory: {
      en: 'High soil moisture (65%) combined with warm ambient temperature (28.5°C) elevates fungal spore propagation risk by 40%. Ensure field furrows are drained. Phosphorus is below optimal (35 mg/kg); apply Organic Rock Phosphate or SSP during next irrigation cycle.',
      hi: 'मिट्टी की 65% नमी और 28.5°C तापमान से फफूंद के बीजाणु फैलने का खतरा 40% बढ़ जाता है। खेत में जल निकासी सुनिश्चित करें। फास्फोरस 35 mg/kg पर कम है; अगली सिंचाई में सिंगल सुपर फॉस्फेट या रॉक फॉस्फेट दें।',
      ta: 'மண்ணின் ஈரப்பதம் (65%) மற்றும் 28.5°C வெப்பம் இணைந்து பூஞ்சை தொற்று அபாயத்தை 40% அதிகரிக்கிறது. வயல் வடிகால் வசதியை உறுதி செய்யவும். பாஸ்பரஸ் சத்து குறைவாக உள்ளது (35 mg/kg); அடுத்த பாசனத்தில் இயற்கை பாஸ்பேட் உரம் இடவும்.'
    }
  });

  useEffect(() => {
    setTelemetry((current) => ({
      ...current,
      deviceId: hardwareState.deviceId || 'ESP32-AGRI-01',
      nodeName: hardwareState.deviceName,
      isOnline: hardwareState.isConnected,
      lastUpdated: hardwareState.isConnected ? 'Live Stream: just connected' : 'Waiting for hardware connection',
    }));
  }, [hardwareState]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate real micro-climate fluctuations
      const tempDelta = (Math.random() * 0.8 - 0.4);
      const humDelta = Math.floor(Math.random() * 5 - 2);
      const moistureDelta = Math.floor(Math.random() * 4 - 2);
      const nDelta = Math.floor(Math.random() * 6 - 3);
      const pDelta = Math.floor(Math.random() * 4 - 2);
      const kDelta = Math.floor(Math.random() * 6 - 3);

      setTelemetry(prev => ({
        ...prev,
        ambientTempC: parseFloat((prev.ambientTempC + tempDelta).toFixed(1)),
        soilTempC: parseFloat((prev.soilTempC + tempDelta * 0.5).toFixed(1)),
        ambientHumidityPct: Math.min(95, Math.max(50, prev.ambientHumidityPct + humDelta)),
        soilMoisturePct: Math.min(90, Math.max(30, prev.soilMoisturePct + moistureDelta)),
        npk: {
          ...prev.npk,
          nitrogenMgKg: Math.max(100, prev.npk.nitrogenMgKg + nDelta),
          phosphorusMgKg: Math.max(20, prev.npk.phosphorusMgKg + pDelta),
          potassiumMgKg: Math.max(150, prev.npk.potassiumMgKg + kDelta),
        }
      }));

      setLastRefreshedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* ========================================================= */}
      {/* A. STATUS & HARDWARE CONNECTION HEADER                    */}
      {/* ========================================================= */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-agri-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-2xs ${hardwareState.isConnected ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${hardwareState.isConnected ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                <span>{hardwareState.isConnected ? `● Connected: ${hardwareState.deviceId}` : '● Status: Disconnected'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono border border-slate-200">
                <Wifi className="w-3.5 h-3.5 text-agri-700" />
                <span>{t.iotProtocol}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.iotTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium max-w-2xl leading-relaxed">
              {hardwareState.isConnected ? t.iotSubtitle : 'No device connected. Pair your ESP32/Arduino prototype node to stream live telemetry.'}
            </p>
          </div>

          {/* Device Power & Refresh Button */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
              <BatteryCharging className="w-4 h-4 text-emerald-600" />
              <span>{telemetry.batteryLevel}% Solar</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700">
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              <span>{hardwareState.isConnected ? '-65' : '--'} dBm</span>
            </div>

            {!hardwareState.isConnected && (
              <button
                type="button"
                onClick={onPairHardware}
                className="px-4 py-2 rounded-2xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-black shadow-md shadow-agri-700/25 transition-all flex items-center gap-1.5"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Pair Hardware Node</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-2xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-black shadow-md shadow-agri-700/25 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-75"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Reading Sensors...' : t.iotRefreshBtn}</span>
            </button>

          </div>

        </div>

        {/* Live Stream Telemetry Bar */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">{telemetry.lastUpdated}</span>
            <span className="text-slate-400">• Last Sync: {lastRefreshedTime}</span>
          </div>
            <span className="font-mono text-[11px] text-agri-800 bg-agri-50 px-2 py-0.5 rounded-md border border-agri-200 font-bold">
            {hardwareState.isConnected ? `MAC ID: ${hardwareState.deviceId}` : 'Hardware ID: Not paired'}
          </span>
            {hardwareState.isConnected && hardwareState.lastPing && (
              <span className="text-[11px] font-semibold text-emerald-700">Last active: {hardwareState.lastPing}</span>
            )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* B. LIVE SENSOR TELEMETRY CARDS (GRID LAYOUT)              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Ambient & Soil Temperature (DHT22 / DS18B20) */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/90 flex flex-col justify-between space-y-4 hover:border-agri-400 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    {t.iotTempHumSensor}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Digital Probe Sensor</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                {t.iotThermalOptimal}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 block">{t.iotAmbientTemp}</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                  {telemetry.ambientTempC}°C
                </span>
                <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">Normal Field Range</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 block">{t.iotSoilTemp}</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                  {telemetry.soilTempC}°C
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Root Zone Temp</span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-agri-50/70 rounded-2xl border border-agri-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>{t.iotRelativeHumidity}:</span>
              </span>
              <span className="font-black text-agri-950 text-sm font-mono">{telemetry.ambientHumidityPct}%</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
            Optimal chlorophyll synthesis active within 22°C - 32°C.
          </p>
        </div>

        {/* Card 2: Capacitive Soil Moisture Sensor */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/90 flex flex-col justify-between space-y-4 hover:border-agri-400 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    {t.iotSoilMoistureSensor}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Capacitive V2.0 Probe</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                {t.iotMoistureAdequate}
              </span>
            </div>

            {/* Large Moisture Percentage & Dial */}
            <div className="p-4 bg-gradient-to-br from-blue-50/70 to-emerald-50/70 rounded-2xl border border-blue-200 mt-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {telemetry.soilMoisturePct}%
                </span>
                <span className="text-xs font-bold text-blue-900 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                  Volumetric Water Content
                </span>
              </div>

              {/* Progress Gauge */}
              <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-600 rounded-full transition-all duration-700"
                  style={{ width: `${telemetry.soilMoisturePct}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1.5">
                <span>0% Dry</span>
                <span>60% Optimal</span>
                <span>100% Saturated</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Root aeration status: Normal. No water stress detected.</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
            Next recommended drip irrigation cycle: in 14 hours.
          </p>
        </div>

        {/* Card 3: Rain & Precipitation Optical Sensor */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/90 flex flex-col justify-between space-y-4 hover:border-agri-400 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
                  <CloudRain className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    {t.iotRainSensor}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Optical Tipping-Bucket</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-300">
                {t.iotNoRain}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Rain Intensity:</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {telemetry.rainIntensityMmHr} mm/hr
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Surface Wetness:</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Dry Canopy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Solar PAR Light:</span>
                <span className="text-xs font-black text-slate-900 font-mono">
                  {telemetry.solarRadiationWm2} W/m²
                </span>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium leading-relaxed">
                Clear sky condition. Safe for morning foliar spray application.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
            Hardware rain-trip triggers automatic SMS alerts within 30s.
          </p>
        </div>

      </div>

      {/* Card 4: NPK Soil Nutrient Sensor (Full Width Component) */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200/90 space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                {t.iotNpkSensor}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Real-time Soil Macronutrient Electro-Chemical Telemetry (mg/kg dry soil)
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-agri-900 bg-agri-50 px-3 py-1 rounded-xl border border-agri-200 self-start sm:self-auto">
            RS485 Modbus Interface Active
          </span>
        </div>

        {/* 3 NPK Nutrients Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Nitrogen (N) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">{t.iotNitrogen}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                {t.iotSufficient}
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {telemetry.npk.nitrogenMgKg} <span className="text-xs text-slate-500 font-normal">mg/kg</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (telemetry.npk.nitrogenMgKg / 200) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Optimal vegetative leaf growth support.</p>
          </div>

          {/* Phosphorus (P) */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950">{t.iotPhosphorus}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 border border-amber-300">
                Low (Deficit)
              </span>
            </div>
            <div className="text-2xl font-black text-amber-950 font-mono">
              {telemetry.npk.phosphorusMgKg} <span className="text-xs text-amber-700 font-normal">mg/kg</span>
            </div>
            <div className="w-full h-2.5 bg-amber-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (telemetry.npk.phosphorusMgKg / 80) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-amber-900 font-bold">⚠️ Root development booster needed.</p>
          </div>

          {/* Potassium (K) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">{t.iotPotassium}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                {t.iotOptimal}
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {telemetry.npk.potassiumMgKg} <span className="text-xs text-slate-500 font-normal">mg/kg</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (telemetry.npk.potassiumMgKg / 300) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Strong cellular wall & fruit size retention.</p>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* C. HARDWARE-DRIVEN AI ACTION ADVISORIES                   */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-agri-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-agri-700/60 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-citrus-400/20 text-citrus-300 border border-citrus-400/30 text-xs font-black">
            <Sparkles className="w-4 h-4 text-citrus-300" />
            <span>{t.iotAiAdvisoryTitle}</span>
          </div>

          <p className="text-xs sm:text-sm text-agri-100 leading-relaxed font-medium max-w-4xl">
            {telemetry.aiAdvisory[language]}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onNavigateToDiagnosis && (
              <button
                type="button"
                onClick={onNavigateToDiagnosis}
                className="px-4 py-2.5 rounded-xl bg-citrus-500 hover:bg-citrus-400 text-slate-950 text-xs font-black shadow-md transition-all flex items-center gap-1.5 transform hover:scale-105"
              >
                <span>Run Vision Scan for Fungal Spores</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onNavigateToStore && (
              <button
                type="button"
                onClick={onNavigateToStore}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Order Organic Phosphate Inputs 🛒</span>
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
