import React from 'react';
import { 
  Smartphone, 
  X, 
  MessageSquare, 
  Send, 
  Clock, 
  ShieldCheck, 
  PhoneCall, 
  Sparkles,
  CheckCheck
} from 'lucide-react';
import { Language, SmsAlert } from '../types';
import { translations } from '../data/translations';

interface SmsPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: SmsAlert | null;
  phoneNumber: string;
  language: Language;
}

export const SmsPhoneModal: React.FC<SmsPhoneModalProps> = ({
  isOpen,
  onClose,
  alert,
  phoneNumber,
  language,
}) => {
  const t = translations[language];

  if (!isOpen || !alert) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 rounded-[40px] shadow-2xl p-4 border-4 border-slate-700 overflow-hidden flex flex-col items-center">
        
        {/* Smartphone Speaker & Camera Notch */}
        <div className="w-28 h-4 bg-slate-800 rounded-full mb-3 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-950" />
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Smartphone Screen Area */}
        <div className="w-full bg-slate-100 rounded-3xl p-4 text-slate-900 min-h-[440px] flex flex-col justify-between shadow-inner">
          
          {/* SMS App Header */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-agri-700 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  AG
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <span>AG-AGRIGUARD</span>
                    <ShieldCheck className="w-3 h-3 text-agri-600" />
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    To: {phoneNumber}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Delivered
              </span>
            </div>

            {/* Message Bubble Date */}
            <div className="text-center my-3">
              <span className="text-[10px] bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                Today, SMS Alert Gateway
              </span>
            </div>

            {/* Incoming SMS Bubble */}
            <div className="p-3.5 rounded-2xl bg-white shadow-sm border border-slate-200/90 space-y-2">
              <div className="text-xs font-extrabold text-agri-950 flex items-center gap-1.5">
                <span>{alert.title[language]}</span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {alert.message[language]}
              </p>

              {alert.actionRequired && (
                <div className="p-2 rounded-xl bg-agri-50 border border-agri-200 text-[11px] font-semibold text-agri-950">
                  ⚠️ <strong>Action:</strong> {alert.actionRequired[language]}
                </div>
              )}

              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                <span>{alert.timestamp}</span>
                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Quick Reply Bar Simulation */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-300">
              <input
                type="text"
                readOnly
                value="Reply '1' for dosage, '2' to order"
                className="w-full text-[11px] text-slate-500 bg-transparent outline-none cursor-default"
              />
              <div className="w-6 h-6 rounded-full bg-agri-700 text-white flex items-center justify-center">
                <Send className="w-3 h-3" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
              AgriGuard Instant 24/7 SMS Helpline: 1800-AGRI-GUARD
            </p>
          </div>

        </div>

        {/* Smartphone Home Indicator */}
        <div className="w-24 h-1 bg-slate-700 rounded-full mt-3" />

      </div>
    </div>
  );
};
