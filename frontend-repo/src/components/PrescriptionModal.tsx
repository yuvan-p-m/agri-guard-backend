import React from 'react';
import { 
  FileCheck, 
  Printer, 
  Download, 
  X, 
  Sprout, 
  ShieldCheck, 
  User, 
  Calendar, 
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Language, DiseaseDiagnosis, UserProfile } from '../types';
import { translations } from '../data/translations';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosis: DiseaseDiagnosis;
  user: UserProfile;
  acreage: number;
  language: Language;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  diagnosis,
  user,
  acreage,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-200 flex flex-col max-h-[92vh]">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-agri-900 text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-agri-700 text-citrus-300">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight font-sans">
                AgriGuard Digital Health Prescription
              </h3>
              <p className="text-[11px] text-agri-200 font-mono">
                RX #{Math.floor(100000 + Math.random() * 900000)} • AI Diagnosis Report
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Printable Body */}
        <div id="printable-prescription" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800">
          
          {/* Header Info Block */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Farmer Name / ID:</p>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{user.name}</p>
              <p className="text-slate-600 font-mono mt-0.5">{user.phone}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Date & Field Area:</p>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{todayStr}</p>
              <p className="text-agri-800 font-bold mt-0.5">{acreage} {t.acresUnit} ({user.district}, {user.state})</p>
            </div>
          </div>

          {/* Disease Identified */}
          <div className="p-4 rounded-2xl bg-agri-50/80 border border-agri-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-agri-950 uppercase tracking-wide">
                Primary Diagnosis
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white">
                {diagnosis.confidence}% Confidence
              </span>
            </div>
            <h4 className="text-lg font-black text-slate-900 mt-1">
              {diagnosis.diseaseName[language]}
            </h4>
            <p className="text-xs text-agri-800 italic font-mono mt-0.5">
              Pathogen: {diagnosis.scientificName} ({diagnosis.pathogenType})
            </p>
          </div>

          {/* Prescribed Dosages Breakdown */}
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
              Prescribed Treatment & Dosages (For {acreage} {t.acresUnit})
            </h5>
            
            <div className="space-y-3">
              {/* Organic Remedies */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Protocol A: Organic Bio-Treatment</span>
                </div>
                {diagnosis.organicProtocol.remedies.map((rem) => {
                  const calc = rem.dosageFormula(acreage);
                  return (
                    <div key={rem.id} className="text-xs text-slate-700 mt-1 pl-5">
                      <strong className="text-slate-900">{rem.name}:</strong> {calc.amount} in {calc.waterVolume} water.
                      <p className="text-[11px] text-slate-500 mt-0.5">{rem.instructions}</p>
                    </div>
                  );
                })}
              </div>

              {/* Chemical Remedies */}
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40">
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Protocol B: Targeted Chemical Remedial</span>
                </div>
                {diagnosis.chemicalProtocol.remedies.map((rem) => {
                  const calc = rem.dosageFormula(acreage);
                  return (
                    <div key={rem.id} className="text-xs text-slate-700 mt-1 pl-5">
                      <strong className="text-slate-900">{rem.name}:</strong> {calc.amount} in {calc.waterVolume} water.
                      <p className="text-[11px] text-slate-500 mt-0.5">{rem.instructions} • Timing: {rem.schedule}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Safety & PHI */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Agronomic Safety Notice:</p>
              <p className="text-[11px] mt-0.5">
                Always spray during early morning (6:30 AM - 9:30 AM). Wear protective face masks & nitrile gloves. Keep harvest waiting period (PHI) in mind.
              </p>
            </div>
          </div>

          {/* Digital Signature & Stamp */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-agri-700" />
              <div>
                <p className="font-bold text-slate-800">Verified by AgriGuard AI</p>
                <p className="text-[10px]">CIB-RC & Agronomy Standard Compliant</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] text-slate-400">AUTHENTICATED DIGITAL REPORT</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
