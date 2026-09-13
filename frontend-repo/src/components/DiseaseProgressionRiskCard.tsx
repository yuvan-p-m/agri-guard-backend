import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Thermometer,
  Droplets,
  Activity,
  Info,
  Clock,
  CloudRain,
  Wind,
  Layers,
  Flame
} from 'lucide-react';
import type { Language, ProgressionRisk } from '../types';
import type { RawSensorData } from '../services/sensorService';
import { useAppTranslation } from '../i18n';

interface DiseaseProgressionRiskCardProps {
  progressionRisk: ProgressionRisk | null;
  sensorSnapshot?: RawSensorData | Record<string, any> | null;
  weatherSnapshot?: Record<string, any> | null;
  language: Language;
  isLoading?: boolean;
}

export const DiseaseProgressionRiskCard: React.FC<DiseaseProgressionRiskCardProps> = ({
  progressionRisk,
  sensorSnapshot,
  weatherSnapshot,
  language,
  isLoading,
}) => {
  const { t } = useAppTranslation();

  // Skeleton loader while Gemini reasoning is in flight
  if (isLoading) {
    return (
      <div className="backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200 bg-white/95 space-y-4 animate-pulse">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-200" />
            <div className="space-y-1.5">
              <div className="w-36 h-3 bg-slate-200 rounded" />
              <div className="w-56 h-5 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="w-24 h-7 rounded-full bg-slate-200" />
        </div>
        <div className="p-4 rounded-2xl bg-slate-100/80 space-y-2">
          <div className="w-full h-4 bg-slate-200 rounded" />
          <div className="w-4/5 h-4 bg-slate-200 rounded" />
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-around">
          <div className="w-24 h-4 bg-slate-200 rounded" />
          <div className="w-24 h-4 bg-slate-200 rounded" />
          <div className="w-24 h-4 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  // If no progression risk has been calculated yet
  if (!progressionRisk) {
    return null;
  }

  const riskLevel = typeof progressionRisk.risk === 'string' && progressionRisk.risk ? progressionRisk.risk : 'Low Risk';
  const isHealthy = riskLevel === 'No Risk';

  const getRiskTheme = () => {
    switch (riskLevel) {
      case 'No Risk':
        return {
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
          cardBorder: 'border-emerald-200',
          cardBg: 'bg-gradient-to-br from-white via-emerald-50/20 to-white',
          heading: 'text-emerald-900',
        };
      case 'Low Risk':
        return {
          badge: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
          cardBorder: 'border-blue-200',
          cardBg: 'bg-gradient-to-br from-white via-blue-50/20 to-white',
          heading: 'text-blue-900',
        };
      case 'Medium Risk':
        return {
          badge: 'bg-amber-100 text-amber-950 border-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          cardBorder: 'border-amber-200',
          cardBg: 'bg-gradient-to-br from-white via-amber-50/20 to-white',
          heading: 'text-amber-950',
        };
      case 'Severe Outbreak Risk':
        return {
          badge: 'bg-red-600 text-white border-red-700 animate-pulse shadow-md',
          icon: <Flame className="w-5 h-5 text-red-600" />,
          cardBorder: 'border-red-400',
          cardBg: 'bg-gradient-to-br from-white via-red-50/40 to-white',
          heading: 'text-red-950',
        };
      case 'High Risk':
      default:
        return {
          badge: 'bg-rose-100 text-rose-950 border-rose-300 animate-pulse',
          icon: <AlertOctagon className="w-5 h-5 text-rose-600" />,
          cardBorder: 'border-rose-300',
          cardBg: 'bg-gradient-to-br from-white via-rose-50/30 to-white',
          heading: 'text-rose-950',
        };
    }
  };

  const theme = getRiskTheme();
  const safeRiskBadgeKey = `risk${riskLevel.replace(/\s+/g, '')}`;

  const weatherTemp = weatherSnapshot?.tempC ?? weatherSnapshot?.temp ?? weatherSnapshot?.current?.temp ?? null;
  const weatherHum = weatherSnapshot?.humidity ?? weatherSnapshot?.current?.humidity ?? null;
  const weatherCond = weatherSnapshot?.condition ?? weatherSnapshot?.current?.condition ?? null;
  const weatherRainProb = weatherSnapshot?.rainfallChance ?? weatherSnapshot?.rain_prob ?? null;
  const weatherWind = weatherSnapshot?.windSpeedKmH ?? weatherSnapshot?.wind_speed ?? null;

  return (
    <div
      className={`backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border ${theme.cardBorder} ${theme.cardBg} space-y-4 animate-slide-up`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-white shadow-sm border border-slate-200">
            {theme.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                {t('pathologyMicroclimateReasoning', 'Pathology & Micro-Climate Reasoning')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-agri-50 text-agri-800 text-[10px] font-bold border border-agri-200">
                <Sparkles className="w-3 h-3 text-agri-600" /> {t('poweredByGemini', 'Powered by Gemini AI')}
              </span>
            </div>
            <h3 className={`text-lg sm:text-xl font-black ${theme.heading} tracking-tight`}>
              {t('progressionTitle', 'Disease Progression Risk Assessment')}
            </h3>
          </div>
        </div>

        {/* Risk Level Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black border shadow-xs ${theme.badge}`}
        >
          <span>{t(safeRiskBadgeKey, riskLevel)}</span>
        </span>
      </div>

      {/* Progression Stage & Vulnerability Window Sub-Badges */}
      {!isHealthy && (progressionRisk.progression_stage || progressionRisk.vulnerability_window) && (
        <div className="flex flex-wrap items-center gap-2">
          {progressionRisk.progression_stage && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('stageLabel', 'Stage')}: <strong>{progressionRisk.progression_stage}</strong></span>
            </span>
          )}
          {progressionRisk.vulnerability_window && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('vulnerabilityWindowLabel', 'Vulnerability Window')}: <strong>{progressionRisk.vulnerability_window}</strong></span>
            </span>
          )}
        </div>
      )}

      {/* Gemini Reasoning Message */}
      <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs space-y-2">
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
          {progressionRisk.message || 'Pathology and risk analysis assessed.'}
        </p>
      </div>

      {/* Pathology & Microclimate Evidence Factors */}
      {!isHealthy && Array.isArray(progressionRisk.pathology_factors) && progressionRisk.pathology_factors.length > 0 && (
        <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2">
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-agri-600" />
            {t('pathologyFactorsTitle', 'Micro-Climate & Biological Progression Factors:')}
          </span>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {progressionRisk.pathology_factors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-agri-600 font-bold mt-0.5">•</span>
                <span className="leading-snug font-medium">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dual Telemetry Evaluated Proof: IoT Sensors + OpenWeather */}
      {!isHealthy && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* IoT Sensor Proof */}
          <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/70 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider">
                📡 {t('liveIotSensorProof', 'IoT Sensor Telemetry')}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-200 text-blue-900 rounded">
                Firebase
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-medium text-slate-700">
              <div><span className="text-slate-500">Hum:</span> <strong>{sensorSnapshot?.humidity ?? '--'}%</strong></div>
              <div><span className="text-slate-500">Temp:</span> <strong>{sensorSnapshot?.temperature ?? '--'}°C</strong></div>
              <div><span className="text-slate-500">Moist:</span> <strong>{sensorSnapshot?.moisture ?? '--'}%</strong></div>
            </div>
          </div>

          {/* OpenWeather Proof */}
          <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200/70 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-teal-900 uppercase tracking-wider flex items-center gap-1">
                <CloudRain className="w-3 h-3 text-teal-700" />
                {t('liveWeatherProof', 'Live Weather Telemetry')}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-teal-200 text-teal-900 rounded">
                OpenWeather
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-medium text-slate-700">
              <div><span className="text-slate-500">Air:</span> <strong>{weatherTemp !== null ? `${weatherTemp}°C` : '--'}</strong></div>
              <div><span className="text-slate-500">Rain%:</span> <strong>{weatherRainProb !== null ? `${weatherRainProb}%` : '--'}</strong></div>
              <div className="truncate"><span className="text-slate-500">Wind:</span> <strong>{weatherWind !== null ? `${weatherWind}k` : '--'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Condition-based Framing Note */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium leading-tight">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          {t('conditionRiskEstimateNote', 'Condition-based epidemiological progression estimated from live field sensors + weather telemetry via Gemini AI.')}
        </span>
      </div>
    </div>
  );
};

