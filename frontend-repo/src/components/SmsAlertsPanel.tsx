import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  AlertTriangle, 
  CloudRain, 
  CheckCircle, 
  Clock, 
  Smartphone,
  Check,
  ChevronRight,
  BellRing
} from 'lucide-react';
import { Language, SmsAlert } from '../types';
import { translations } from '../data/translations';
import { alertsAPI } from '../services/api';

interface SmsAlertsPanelProps {
  language: Language;
  alerts: SmsAlert[];
  onTriggerTestSms: (alert: SmsAlert) => void;
  onPreviewSms: (alert: SmsAlert) => void;
}

export const SmsAlertsPanel: React.FC<SmsAlertsPanelProps> = ({
  language,
  alerts,
  onTriggerTestSms,
  onPreviewSms,
}) => {
  const t = translations[language];
  const [subPhone, setSubPhone] = useState('');
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subPhone.trim()) return;
    setIsSubmitting(true);
    setSubStatus(null);
    try {
      const res = await alertsAPI.subscribe({ phone: subPhone.trim(), crop: 'Citrus & Mixed Crops' });
      setSubStatus(`✅ Subscribed! ${res?.message || 'SMS Alerts Active'}`);
      setSubPhone('');
    } catch (err: any) {
      setSubStatus('⚠️ Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="sms-panel" className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl border border-agri-200/80">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-agri-100 text-agri-800">
            <MessageSquare className="w-4 h-4 text-agri-700" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              {t.smsPanelTitle}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {t.smsPanelSubtitle}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-agri-800 bg-agri-50 px-2.5 py-1 rounded-full border border-agri-200 self-start sm:self-auto">
          Active SMS Gateway
        </span>
      </div>

      {/* Subscribe to SMS Form */}
      <form onSubmit={handleSubscribe} className="mt-4 p-3 rounded-2xl bg-agri-50/70 border border-agri-200/60 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-agri-950">
          <BellRing className="w-3.5 h-3.5 text-agri-600" />
          <span>Subscribe to Daily Micro-Climate & Risk SMS Alerts</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="tel"
            placeholder="Enter mobile number (+91...)"
            value={subPhone}
            onChange={(e) => setSubPhone(e.target.value)}
            className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-1 focus:ring-agri-600 outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 py-2 rounded-xl bg-agri-800 hover:bg-agri-900 text-white text-xs font-bold shrink-0 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Subscribe'}
          </button>
        </div>
        {subStatus && (
          <p className="text-[11px] font-semibold text-agri-900 animate-fade-in">{subStatus}</p>
        )}
      </form>

      {/* SMS Feed List */}
      <div className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3.5 rounded-2xl border transition-all ${
              alert.urgency === 'high'
                ? 'bg-rose-50/60 border-rose-200/80 hover:border-rose-300'
                : 'bg-slate-50/80 border-slate-200/80 hover:border-agri-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className={`text-xs font-bold ${
                alert.urgency === 'high' ? 'text-rose-900' : 'text-slate-900'
              }`}>
                {alert.title[language]}
              </span>
              <span className="text-[10px] text-slate-500 whitespace-nowrap flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                {alert.timestamp}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {alert.message[language]}
            </p>

            {alert.actionRequired && (
              <div className="mt-2 text-[11px] text-agri-950 font-semibold bg-white/80 p-2 rounded-xl border border-slate-200/60">
                👉 <strong>Action:</strong> {alert.actionRequired[language]}
              </div>
            )}

            {/* Quick SMS Trigger Actions */}
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onPreviewSms(alert)}
                className="text-[11px] text-agri-800 hover:text-agri-950 font-bold flex items-center gap-1"
              >
                <Smartphone className="w-3 h-3" />
                <span>Preview on Phone</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerTestSms(alert)}
                className="px-2.5 py-1 rounded-lg bg-agri-700 hover:bg-agri-800 text-white text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-all"
              >
                <Send className="w-3 h-3" />
                <span>{t.sendTestSms}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
