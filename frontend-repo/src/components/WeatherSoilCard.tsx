import React, { useState } from 'react';
import { 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Activity,
  Layers,
  Thermometer,
  RefreshCw,
  Search,
  AlertCircle
} from 'lucide-react';
import { Language, WeatherInfo } from '../types';
import { translations } from '../data/translations';

interface WeatherSoilCardProps {
  weather: WeatherInfo;
  language: Language;
  isLoading?: boolean;
  isGpsDenied?: boolean;
  onRefreshLocation?: () => void;
  onManualCitySubmit?: (city: string) => void;
}

export const WeatherSoilCard: React.FC<WeatherSoilCardProps> = ({
  weather,
  language,
  isLoading = false,
  isGpsDenied = false,
  onRefreshLocation,
  onManualCitySubmit,
}) => {
  const t = translations[language];
  const [manualInput, setManualInput] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim() && onManualCitySubmit) {
      onManualCitySubmit(manualInput.trim());
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl border border-agri-200/80 relative">
      
      {/* Header & Location Selector */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
            <Thermometer className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                {t.weatherTitle}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live API
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Live GPS Field Telemetry & OpenWeatherMap Forecast
            </p>
          </div>
        </div>

        {/* GPS Location Indicator & Refresh Button */}
        <div className="flex items-center gap-2">
          {onRefreshLocation && (
            <button
              onClick={onRefreshLocation}
              disabled={isLoading}
              title="Refresh Live GPS Location"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1 text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-agri-600' : 'text-slate-600'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold ${
            isGpsDenied 
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <MapPin className={`w-3.5 h-3.5 ${isGpsDenied ? 'text-amber-600' : 'text-emerald-600 animate-bounce'}`} />
            <span>{isGpsDenied ? 'GPS Denied (Manual)' : '📍 Live GPS Active'}</span>
          </div>
        </div>
      </div>

      {/* Conditional Manual City Search Form if GPS Permission is Denied */}
      {isGpsDenied && (
        <form onSubmit={handleManualSubmit} className="mt-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>GPS Location Permission Denied / Unavailable</span>
          </div>
          <p className="text-[11px] text-amber-800 mb-2">
            Since GPS access was denied, enter your farm city name manually to fetch live OpenWeatherMap forecast:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="e.g. Nagpur, Nashik, Chennai, Ludhiana..."
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-amber-300 focus:border-agri-600 bg-white font-medium text-slate-900"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-agri-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Fetching live meteorological telemetry...</p>
        </div>
      ) : (
        <>
          {/* Main Temperature & Condition Display */}
          <div className="flex items-center justify-between mt-4 p-4 rounded-2xl bg-gradient-to-br from-agri-50 via-emerald-50/50 to-blue-50/50 border border-agri-200/80">
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {weather.tempC}°C
              </div>
              <p className="text-xs font-bold text-agri-900 mt-0.5">
                {weather.condition}
              </p>
              <p className="text-[11px] text-slate-600">
                {weather.city}, {weather.state}
              </p>
            </div>

            <div className="text-right">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold ${
                weather.fungalRiskLevel === 'High' || weather.fungalRiskLevel === 'Severe'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {weather.fungalRiskLevel} Fungal Risk
              </span>
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-end gap-1 font-medium">
                <Clock className="w-3 h-3 text-slate-400" />
                {weather.leafWetnessHours}h Leaf Wetness
              </p>
            </div>
          </div>

          {/* 4-Grid Micro-Climate & Soil Metrics */}
          <div className="grid grid-cols-2 gap-2.5 mt-3.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>{t.humidity}</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                {weather.humidity}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.rainfall}</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                {weather.rainfallChance}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Wind className="w-3.5 h-3.5 text-slate-600" />
                <span>Wind Speed</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                {weather.windSpeedKmH} km/h
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Activity className="w-3.5 h-3.5 text-agri-600" />
                <span>Soil Moisture</span>
              </div>
              <div className="text-xs font-extrabold text-agri-950 mt-1 truncate">
                {weather.soilMoisture}
              </div>
            </div>
          </div>

          {/* Local Soil Behavior Advisory */}
          <div className="mt-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">
              {weather.alertSummary}
            </p>
          </div>

          {/* 5-Day Disease & Rain Forecast Breakdown */}
          {weather.forecast && weather.forecast.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2 flex items-center justify-between">
                <span>5-Day Disease Outbreak & Rainfall Forecast</span>
                <span className="text-[10px] text-slate-600 font-normal">Updated Live</span>
              </h4>
              <div className="space-y-1.5">
                {weather.forecast.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-20">{item.date}</span>
                      <span className="text-slate-600 font-medium">{item.temp_min}° - {item.temp_max}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-[11px]">{item.humidity}% Humidity</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        item.disease_risk === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : item.disease_risk === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.disease_risk} Risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};
