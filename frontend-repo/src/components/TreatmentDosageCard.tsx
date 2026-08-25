import React, { useState } from 'react';
import { 
  Droplet, 
  Leaf, 
  FlaskConical, 
  Calendar, 
  AlertOctagon, 
  Check, 
  ShoppingCart, 
  HelpCircle,
  Clock,
  Shield,
  Layers
} from 'lucide-react';
import { Language, DiseaseDiagnosis, RemedyItem } from '../types';
import { translations } from '../data/translations';

interface TreatmentDosageCardProps {
  diagnosis: DiseaseDiagnosis;
  language: Language;
  acreage: number;
  onNavigateToStore: () => void;
}

export const TreatmentDosageCard: React.FC<TreatmentDosageCardProps> = ({
  diagnosis,
  language,
  acreage,
  onNavigateToStore,
}) => {
  const [activeProtocol, setActiveProtocol] = useState<'organic' | 'chemical'>('organic');
  const t = translations[language];

  const currentProtocol = 
    activeProtocol === 'organic' 
      ? diagnosis.organicProtocol 
      : diagnosis.chemicalProtocol;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-agri-200/80">
      
      {/* Title & Field Acreage Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-agri-700" />
            <span>{t.treatmentTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.dosageForField}: <strong className="text-agri-800 font-bold">{acreage} {t.acresUnit}</strong>
          </p>
        </div>

        {/* Protocol Switcher: Organic vs Chemical */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveProtocol('organic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeProtocol === 'organic'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Organic</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveProtocol('chemical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeProtocol === 'chemical'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Chemical</span>
          </button>
        </div>
      </div>

      {/* Protocol Overview Banner */}
      <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
        <p className="text-xs text-slate-700 font-medium leading-relaxed">
          {currentProtocol.overview[language]}
        </p>
      </div>

      {/* Remedy Items with Dynamic Dosage Calculation */}
      <div className="mt-4 space-y-4">
        {currentProtocol.remedies.map((remedy, idx) => {
          const calculated = remedy.dosageFormula(acreage);

          return (
            <div 
              key={remedy.id}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white to-agri-50/30 border border-agri-200/80 shadow-2xs hover:border-agri-400 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-agri-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {remedy.name}
                    </h4>
                    {remedy.activeIngredient && (
                      <p className="text-[11px] text-slate-500 font-mono">
                        Active Ingredient: {remedy.activeIngredient}
                      </p>
                    )}
                  </div>
                </div>

                {remedy.phiDays !== undefined && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                    PHI: {remedy.phiDays} Days
                  </span>
                )}
              </div>

              {/* Exact Calculated Dosage Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5 p-3 rounded-xl bg-agri-100/70 border border-agri-200">
                <div>
                  <span className="text-[11px] font-bold text-agri-900 block">
                    {t.dosageFormula} ({acreage} {t.acresUnit}):
                  </span>
                  <p className="text-sm font-black text-agri-950 mt-0.5">
                    💊 {calculated.amount}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-agri-900 block">
                    {t.waterVolume}:
                  </span>
                  <p className="text-sm font-black text-agri-950 mt-0.5">
                    💧 {calculated.waterVolume}
                  </p>
                </div>
              </div>

              {/* Application Details */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                <p className="flex items-start gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-agri-600 shrink-0 mt-0.5" />
                  <span><strong>Method:</strong> {remedy.instructions}</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-agri-600 shrink-0 mt-0.5" />
                  <span><strong>{t.applicationSchedule}:</strong> {remedy.schedule}</span>
                </p>
                {remedy.safetyCaution && (
                  <p className="flex items-start gap-1.5 text-rose-800 bg-rose-50/80 p-2 rounded-lg border border-rose-200/80 font-medium">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>{t.safetyWarning}:</strong> {remedy.safetyCaution}</span>
                  </p>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Preventative Agronomic Tips */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-800 mb-2">
          🛡️ Preventative Agronomic Practices:
        </p>
        <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
          {diagnosis.preventativeTips[language].map((tip, idx) => (
            <li key={idx} className="leading-relaxed">{tip}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onNavigateToStore}
          className="mt-5 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-black shadow-sm transition-all inline-flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Order Recommended Remedies in Agri-Store →</span>
        </button>
      </div>

    </div>
  );
};
