import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  MessageSquare, 
  X, 
  ArrowRight, 
  Store, 
  Calendar,
  ShieldCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Language, Order } from '../types';
import { translations } from '../data/translations';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  language: Language;
  onNavigateToStore: () => void;
  onNavigateToDiagnosis: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
  language,
  onNavigateToStore,
  onNavigateToDiagnosis,
}) => {
  const [showTracking, setShowTracking] = useState<boolean>(false);
  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#479556', '#fbbf24', '#2c6037', '#347843']
      });
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[130] overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-200 flex flex-col max-h-[92vh]">
        
        {/* Success Header Banner */}
        <div className="p-6 bg-gradient-to-r from-agri-800 via-agri-700 to-agri-900 text-white text-center relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md text-citrus-300 flex items-center justify-center mx-auto mb-3 shadow-lg border border-white/20">
            <CheckCircle2 className="w-10 h-10 text-citrus-300" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-sans">
            {t.orderSuccessTitle}
          </h2>
          <p className="text-xs sm:text-sm text-agri-100/90 mt-1 max-w-md mx-auto font-medium">
            {t.orderSuccessSubtitle}
          </p>

          <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-mono font-bold text-citrus-200 border border-white/20">
            <span>{t.orderIdLabel} {order.orderNumber}</span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5">
          
          {/* Order Header Summary Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">{t.orderDateLabel}</span>
              <span className="font-extrabold text-slate-900 mt-0.5 block">{order.date}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">{t.paymentMethodLabel}</span>
              <span className="font-extrabold text-agri-900 mt-0.5 block">{order.paymentMethod}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 font-medium block">{t.totalPayableLabel}</span>
              <span className="font-black text-slate-900 text-sm mt-0.5 block">₹{order.total}</span>
            </div>
          </div>

          {/* Delivery Estimation Card */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                {t.estimatedDeliveryLabel}
              </h4>
              <p className="text-xs text-emerald-900 font-medium mt-0.5">
                {order.estimatedDelivery}
              </p>
            </div>
          </div>

          {/* Itemized Order Details */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
              Purchased Items ({order.items.length})
            </h4>
            <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50 max-h-48 overflow-y-auto">
              {order.items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between gap-3 text-xs py-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate max-w-xs">{item.product.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Qty: {item.quantity} • {item.product.packSize}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 whitespace-nowrap">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & SMS Notification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-bold flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-agri-700" />
                <span>{t.shippingToLabel}</span>
              </span>
              <p className="font-extrabold text-slate-900">{order.shippingAddress.fullName}</p>
              <p className="text-slate-600 mt-0.5 font-medium">{order.shippingAddress.villageTaluka}, {order.shippingAddress.district}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </div>

            <div className="p-3 rounded-2xl bg-agri-50 border border-agri-200 text-agri-950 flex flex-col justify-between">
              <div>
                <span className="text-agri-800 font-bold flex items-center gap-1 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-agri-700" />
                  <span>SMS Dispatch Notification:</span>
                </span>
                <p className="text-[11px] font-medium leading-relaxed">
                  {t.orderSmsNotice} <strong>{order.shippingAddress.phone}</strong>.
                </p>
              </div>
              <span className="text-[10px] font-mono text-agri-700 mt-2">
                Tracking Pin: #KP-{order.orderNumber.replace('#AG-', '')}
              </span>
            </div>
          </div>

          {/* Interactive Delivery Tracking Drawer */}
          {showTracking && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white animate-fade-in space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <h4 className="text-xs font-black text-citrus-300 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>{t.trackingTitle} ({order.orderNumber})</span>
                </h4>
                <button
                  onClick={() => setShowTracking(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-4 relative pl-4 border-l-2 border-slate-700 ml-2">
                {order.trackingSteps.map((step, idx) => (
                  <div key={idx} className="relative pl-3">
                    <span className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                      step.completed ? 'bg-emerald-400' : 'bg-slate-600'
                    }`} />
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-xs font-extrabold ${step.completed ? 'text-white' : 'text-slate-400'}`}>
                        {step.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">{step.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Action Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => setShowTracking(!showTracking)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Truck className="w-3.5 h-3.5 text-citrus-400" />
            <span>{t.trackDeliveryBtn}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToStore();
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-all"
            >
              {t.backToStoreBtn}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToDiagnosis();
              }}
              className="px-4 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-black shadow-md shadow-agri-700/20 transition-all flex items-center gap-1"
            >
              <span>{t.returnDashboardBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
