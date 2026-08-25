import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  FileCheck, 
  AlertTriangle,
  Info,
  Microscope,
  Award,
  Download
} from 'lucide-react';
import { Language, DiseaseDiagnosis } from '../types';
import { translations } from '../data/translations';

interface EarlyDetectionCardProps {
  diagnosis: DiseaseDiagnosis;
  language: Language;
  onOpenPrescription: () => void;
}

export const EarlyDetectionCard: React.FC<EarlyDetectionCardProps> = ({
  diagnosis,
  language,
  onOpenPrescription,
}) => {
  const t = translations[language];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-agri-200/80 animate-slide-up">
      
      {/* Top Warning Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-citrus-500/15 via-agri-50 to-emerald-50 border border-citrus-300/80 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-citrus-500 text-white shadow-md shadow-citrus-500/30">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-citrus-800">
                {t.earlyWarningBadge}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-agri-900 border border-agri-300 shadow-2xs">
                <Award className="w-3 h-3 text-agri-600" /> {diagnosis.confidence}% {t.confidenceScore}
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium mt-0.5">
              {diagnosis.stage}
            </p>
          </div>
        </div>

        {/* Prescription Button */}
        <button
          onClick={onOpenPrescription}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-agri-800 hover:bg-agri-900 text-white text-xs font-bold shadow-md shadow-agri-800/20 transition-all transform hover:scale-105"
        >
          <FileCheck className="w-3.5 h-3.5 text-citrus-300" />
          <span>{t.printPrescription}</span>
        </button>
      </div>

      {/* Disease Primary Title & Pathogen Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-5 border-b border-slate-100">
        <div className="md:col-span-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider mb-1">
            🌱 {diagnosis.cropName[language]}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {diagnosis.diseaseName[language]}
          </h3>
          <p className="text-xs text-agri-800 italic font-mono mt-1 font-semibold flex items-center gap-1.5">
            <Microscope className="w-3.5 h-3.5 text-agri-600" />
            <span>Pathogen: {diagnosis.scientificName}</span>
          </p>
        </div>

        {/* Pathogen Type & Incubation Matrix */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{t.pathogenType}:</span>
            <span className="font-bold px-2 py-0.5 bg-white rounded-md text-slate-800 border border-slate-200">
              {diagnosis.pathogenType}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{t.incubationTime}:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              {diagnosis.incubationPeriod}
            </span>
          </div>
        </div>
      </div>

      {/* Early Alert Box */}
      <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-950 font-medium leading-relaxed">
          {diagnosis.earlyWarningAlert[language]}
        </p>
      </div>

      {/* Spread Risk Rate vs Early Detection Advantage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        
        {/* Risk Gauge */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/70">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-rose-900 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
              {t.spreadRisk}
            </span>
            <span className="text-sm font-black text-rose-700">
              +{diagnosis.spreadRiskRate}% Loss
            </span>
          </div>
          <div className="w-full h-2 bg-rose-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-600 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, diagnosis.spreadRiskRate * 1.5)}%` }}
            />
          </div>
          <p className="text-[10px] text-rose-700 mt-1.5 font-medium">
            {t.spreadRiskNote}
          </p>
        </div>

        {/* Advantage Box */}
        <div className="p-3.5 rounded-2xl bg-agri-50/80 border border-agri-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
            85%
          </div>
          <div>
            <p className="text-xs font-bold text-agri-950">
              Yield Protected
            </p>
            <p className="text-[11px] text-agri-800 leading-snug">
              Early treatment intervention arrests spore propagation immediately.
            </p>
          </div>
        </div>

      </div>

      {/* Symptoms Detected Breakdown */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-800 mb-2">
          {t.symptomsIdentified}:
        </p>
        <div className="space-y-1.5">
          {diagnosis.symptoms[language].map((sym, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-agri-600 shrink-0 mt-0.5" />
              <span className="font-medium">{sym}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
