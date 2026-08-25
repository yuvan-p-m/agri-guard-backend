import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  MapPin, 
  Locate, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Radio, 
  Compass, 
  Navigation,
  Check
} from 'lucide-react';

export interface GpsTelemetry {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  timestamp: string | null;
  resolvedAddress: string | null;
}

interface GpsLocationTrackerProps {
  locationValue: string;
  onLocationChange: (loc: string) => void;
  onCoordinatesChange: (lat: number, lon: number, accuracy?: number) => void;
  autoPrompt?: boolean;
  className?: string;
  label?: string;
}

export const GpsLocationTracker: React.FC<GpsLocationTrackerProps> = ({
  locationValue,
  onLocationChange,
  onCoordinatesChange,
  autoPrompt = true,
  className = '',
  label = 'Farm / Field Location',
}) => {
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'tracking' | 'granted' | 'denied' | 'unsupported' | 'error'>('idle');
  const [telemetry, setTelemetry] = useState<GpsTelemetry>({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    speed: null,
    timestamp: null,
    resolvedAddress: null,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showTelemetryDetails, setShowTelemetryDetails] = useState<boolean>(true);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  const isInitialPromptTriggered = useRef<boolean>(false);

  // Reverse geocoding helper
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.district || addr.state_district || '';
        const state = addr.state || '';
        const country = addr.country || '';
        
        let placeName = '';
        if (city && state) {
          placeName = `${city}, ${state}`;
        } else if (city) {
          placeName = city;
        } else if (state) {
          placeName = `${state}, ${country}`;
        } else {
          placeName = data.display_name?.split(',').slice(0, 2).join(',') || `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
        }

        return { placeName, raw: addr };
      }
    } catch {
      // Offline or network restricted fallback
    }
    return { placeName: `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`, raw: null };
  };

  // Main function to request and track GPS coordinates
  const trackGpsLocation = useCallback(async (isManualClick: boolean = false) => {
    if (!navigator.geolocation) {
      setGpsStatus('unsupported');
      setStatusMessage('Geolocation is not supported on this device/browser.');
      return;
    }

    setGpsStatus('requesting');
    setStatusMessage('Requesting GPS device permission & satellite fix...');

    const handleSuccess = async (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy, altitude, speed } = pos.coords;
      const formattedTimestamp = new Date(pos.timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const { placeName } = await reverseGeocode(latitude, longitude);

      setTelemetry({
        latitude,
        longitude,
        accuracy,
        altitude: altitude !== null ? Math.round(altitude) : null,
        speed: speed !== null ? Math.round(speed * 3.6) : null,
        timestamp: formattedTimestamp,
        resolvedAddress: placeName,
      });

      setGpsStatus('granted');
      setStatusMessage(`📍 Live GPS Locked: ${placeName} (±${Math.round(accuracy)}m accuracy)`);
      onCoordinatesChange(latitude, longitude, accuracy);

      // If user has not typed a custom name or if it's default, update input
      if (!isManualOverride || isManualClick) {
        onLocationChange(placeName);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setGpsStatus('denied');
          setStatusMessage('GPS permission denied in browser. Please allow location or enter location manually below.');
          break;
        case error.POSITION_UNAVAILABLE:
          setGpsStatus('error');
          setStatusMessage('GPS signal unavailable. You can enter your farm location manually below.');
          break;
        case error.TIMEOUT:
          setGpsStatus('error');
          setStatusMessage('GPS request timed out. Retrying...');
          break;
        default:
          setGpsStatus('error');
          setStatusMessage('Unable to acquire GPS fix. Please enter location manually.');
          break;
      }
    };

    // 1. Get quick one-time position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 5000,
    });

    // 2. Start continuous active tracking
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        () => {}, // Silent error on watch retry
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch {
      // Ignored
    }
  }, [isManualOverride, onCoordinatesChange, onLocationChange]);

  // Trigger permission request on mount if autoPrompt is true
  useEffect(() => {
    if (autoPrompt && !isInitialPromptTriggered.current) {
      isInitialPromptTriggered.current = true;
      trackGpsLocation(false);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [autoPrompt, trackGpsLocation]);

  return (
    <div className={`space-y-2.5 ${className}`}>
      
      {/* GPS Tracking Live Status Card */}
      <div className={`rounded-2xl p-3 border transition-all ${
        gpsStatus === 'granted' 
          ? 'bg-emerald-500/10 border-emerald-400/40 shadow-xs'
          : gpsStatus === 'requesting'
          ? 'bg-amber-500/10 border-amber-400/40 animate-pulse'
          : gpsStatus === 'denied'
          ? 'bg-rose-500/10 border-rose-300'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {gpsStatus === 'granted' && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              )}
              {gpsStatus === 'requesting' && (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 animate-pulse"></span>
              )}
              {(gpsStatus === 'denied' || gpsStatus === 'error') && (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              )}
              {gpsStatus === 'idle' && (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400"></span>
              )}
            </span>

            <div className="flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${
                gpsStatus === 'granted' ? 'text-emerald-600' : gpsStatus === 'requesting' ? 'text-amber-600' : 'text-slate-500'
              }`} />
              <span className="text-xs font-black tracking-tight text-slate-800">
                {gpsStatus === 'granted' 
                  ? 'Live GPS Tracking Active' 
                  : gpsStatus === 'requesting' 
                  ? 'Requesting GPS Permission...' 
                  : gpsStatus === 'denied'
                  ? 'GPS Permission Denied'
                  : 'GPS Device Location'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => trackGpsLocation(true)}
            disabled={gpsStatus === 'requesting'}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-agri-800 bg-white hover:bg-agri-50 border border-agri-300 px-2.5 py-1 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Refresh GPS Coordinates"
          >
            {gpsStatus === 'requesting' ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-agri-600" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 text-agri-700" />
                <span>{gpsStatus === 'granted' ? 'Re-Track GPS' : 'Allow GPS'}</span>
              </>
            )}
          </button>
        </div>

        {/* Live GPS Telemetry Pill / Details */}
        {telemetry.latitude !== null && telemetry.longitude !== null && (
          <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px]">
            <div className="flex items-center gap-2 font-mono text-slate-700">
              <Navigation className="w-3 h-3 text-emerald-600 transform rotate-45 shrink-0" />
              <span className="font-bold">
                {telemetry.latitude.toFixed(5)}° N, {telemetry.longitude.toFixed(5)}° E
              </span>
              {telemetry.accuracy && (
                <span className={`px-1.5 py-0.2 rounded-md font-semibold text-[10px] ${
                  telemetry.accuracy <= 20 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  ±{Math.round(telemetry.accuracy)}m
                </span>
              )}
            </div>

            {telemetry.timestamp && (
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Fix at {telemetry.timestamp}</span>
              </div>
            )}
          </div>
        )}

        {/* Informative helper message / banner */}
        {statusMessage && (
          <p className={`mt-1.5 text-[11px] font-semibold flex items-center gap-1 ${
            gpsStatus === 'granted' 
              ? 'text-emerald-700' 
              : gpsStatus === 'denied' 
              ? 'text-rose-600' 
              : 'text-slate-600'
          }`}>
            {gpsStatus === 'granted' ? (
              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
            ) : gpsStatus === 'denied' ? (
              <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
            ) : null}
            <span>{statusMessage}</span>
          </p>
        )}
      </div>

      {/* Manual Location Input (User can type or edit manually anytime) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-slate-800">
            {label} <span className="text-slate-400 font-normal">(Auto-tracked or type manually)</span>
          </label>
          {isManualOverride && (
            <span className="text-[10px] text-agri-700 font-bold bg-agri-50 px-1.5 py-0.5 rounded border border-agri-200">
              Custom Location
            </span>
          )}
        </div>

        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={locationValue}
            onChange={(e) => {
              setIsManualOverride(true);
              onLocationChange(e.target.value);
            }}
            placeholder="e.g. Nagpur / Coimbatore / Punjab"
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/70 text-slate-900 focus:bg-white transition-colors"
          />
        </div>
        <p className="mt-1 text-[10px] text-slate-500">
          💡 GPS coordinates are saved to deliver localized crop disease warnings and weather forecasting.
        </p>
      </div>

    </div>
  );
};
