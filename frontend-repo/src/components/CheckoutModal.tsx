import React, { useEffect, useState } from 'react';
import { 
  X, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  ArrowLeft,
  Smartphone,
  Banknote,
  Sparkles,
  Layers,
  Phone,
  User
} from 'lucide-react';
import type { Language, CartItem, UserProfile, Order } from '../types';
import { translations } from '../data/translations';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: UserProfile;
  language: Language;
  onOrderComplete: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  user,
  language,
  onOrderComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const t = translations[language];

  // Step 1: Delivery Details
  const [fullName, setFullName] = useState<string>(user.name || 'Rajesh Kumar');
  const [phone, setPhone] = useState<string>(user.phone || '+91 98765 43210');
  const [villageTaluka, setVillageTaluka] = useState<string>(user.villageTaluka || 'Ghatkopar Farm Sector, Plot 14');
  const [district, setDistrict] = useState<string>(user.district || 'Nagpur');
  const [stateName, setStateName] = useState<string>(user.state || 'Maharashtra');
  const [pincode, setPincode] = useState<string>(user.pincode || '440001');

  useEffect(() => {
    setFullName(user.name || 'Rajesh Kumar');
    setPhone(user.phone || '+91 98765 43210');
    setVillageTaluka(user.villageTaluka || 'Ghatkopar Farm Sector, Plot 14');
    setDistrict(user.district || 'Nagpur');
    setStateName(user.state || 'Maharashtra');
    setPincode(user.pincode || '440001');
  }, [user]);

  // Step 2: Payment Details
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'KCC'>('COD');
  const [upiId, setUpiId] = useState<string>('rajesh.farmer@oksbi');
  const [kccNumber, setKccNumber] = useState<string>('5043 2891 0023 9812');
  const [kccExpiry, setKccExpiry] = useState<string>('08/28');
  const [kccBank, setKccBank] = useState<string>('State Bank of India (Agri Division)');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = Math.round(subtotal * 0.1); // 10% Govt farmer subsidy
  const deliveryFee = 0; // Free 24hr farm delivery
  const total = subtotal - discount;

  const handlePlaceOrder = () => {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#AG-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      items: [...items],
      subtotal,
      discount,
      total,
      paymentMethod,
      paymentDetails: 
        paymentMethod === 'UPI' 
          ? `UPI: ${upiId}` 
          : paymentMethod === 'KCC' 
          ? `KCC Card ending in ${kccNumber.slice(-4)}` 
          : 'Cash on Delivery at Farm',
      shippingAddress: {
        fullName,
        phone,
        villageTaluka,
        district,
        state: stateName,
        pincode,
      },
      status: 'Confirmed',
      estimatedDelivery: 'Tomorrow by 4:00 PM via Kisan Express Depot',
      trackingSteps: [
        {
          title: t.stepPlaced,
          desc: 'Order received & dispatched to nearest regional agri-depot',
          time: 'Just Now',
          completed: true,
          current: true,
        },
        {
          title: t.stepPacked,
          desc: 'Quality inspection & temperature-controlled packing',
          time: 'Expected today 02:00 PM',
          completed: false,
          current: false,
        },
        {
          title: t.stepInTransit,
          desc: 'Dispatched in GPS-enabled Kisan delivery vehicle',
          time: 'Expected tomorrow 08:30 AM',
          completed: false,
          current: false,
        },
        {
          title: t.stepDelivered,
          desc: 'Safe delivery & inspection at your farm gate',
          time: 'Expected tomorrow 04:00 PM',
          completed: false,
          current: false,
        },
      ]
    };

    onOrderComplete(newOrder);
  };

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-agri-900 to-agri-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-agri-700 flex items-center justify-center text-citrus-300">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight font-sans">
                {t.checkoutTitle}
              </h3>
              <p className="text-[11px] text-agri-200 font-medium">
                {items.length} {items.length === 1 ? 'Item' : 'Items'} • ₹{total} Total Payable
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 pt-4 pb-3 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            
            {/* Step 1 Indicator */}
            <div className={`flex items-center gap-1.5 text-xs font-bold ${
              step === 1 ? 'text-agri-800' : 'text-slate-600'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step >= 1 ? 'bg-agri-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <span className="hidden sm:inline">{t.checkoutStep1}</span>
            </div>

            <div className="w-8 h-0.5 bg-slate-200" />

            {/* Step 2 Indicator */}
            <div className={`flex items-center gap-1.5 text-xs font-bold ${
              step === 2 ? 'text-agri-800' : 'text-slate-600'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step >= 2 ? 'bg-agri-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span className="hidden sm:inline">{t.checkoutStep2}</span>
            </div>

            <div className="w-8 h-0.5 bg-slate-200" />

            {/* Step 3 Indicator */}
            <div className={`flex items-center gap-1.5 text-xs font-bold ${
              step === 3 ? 'text-agri-800' : 'text-slate-600'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step === 3 ? 'bg-agri-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                3
              </span>
              <span className="hidden sm:inline">{t.checkoutStep3}</span>
            </div>

          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5">
          
          {/* ======================================================== */}
          {/* STEP 1: DELIVERY ADDRESS & CONTACT CONFIRMATION          */}
          {/* ======================================================== */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <MapPin className="w-4 h-4 text-agri-700" />
                <span>{t.deliveryAddressTitle}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.fullNameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/60 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.phoneLabel} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/60 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.villageTalukaLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={villageTaluka}
                  onChange={(e) => setVillageTaluka(e.target.value)}
                  placeholder="e.g. Village Shivpuri, Taluka Saoner, Plot No 12"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/60 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.districtLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/60 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.stateLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/60 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.pincodeLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/60 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Delivery Guarantee Pill */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Free 24hr Delivery directly to Farm Gate</span>
                </div>
                <span className="font-bold text-emerald-800">FREE</span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: PAYMENT GATEWAY SELECTION                        */}
          {/* ======================================================== */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <CreditCard className="w-4 h-4 text-agri-700" />
                <span>{t.paymentMethodTitle}</span>
              </div>

              {/* Payment Mode Options */}
              <div className="space-y-2.5">
                
                {/* Option 1: Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'COD'
                      ? 'border-agri-600 bg-agri-50/90 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    paymentMethod === 'COD' ? 'border-agri-700 bg-agri-700 text-white' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'COD' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      💵 {t.payCod}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.payCodDesc}
                    </p>
                  </div>
                </div>

                {/* Option 2: UPI / QR Code */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'UPI'
                      ? 'border-agri-600 bg-agri-50/90 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    paymentMethod === 'UPI' ? 'border-agri-700 bg-agri-700 text-white' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'UPI' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      📱 {t.payUpi}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.payUpiDesc}
                    </p>

                    {/* If UPI Active, show Mock QR Code & Input */}
                    {paymentMethod === 'UPI' && (
                      <div className="mt-3 p-3 bg-white rounded-xl border border-agri-300 flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-24 h-24 bg-slate-900 p-2 rounded-xl flex items-center justify-center text-white shrink-0">
                          <QrCode className="w-20 h-20 text-citrus-400" />
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                          <span className="text-[11px] font-bold text-slate-500 block">Scan with any UPI App</span>
                          <p className="text-xs font-mono font-bold text-agri-950">UPI ID: agriguard@kisanpay</p>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="Or enter your VPA / UPI ID"
                            className="mt-1 w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-slate-50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Option 3: Kisan Credit Card */}
                <div
                  onClick={() => setPaymentMethod('KCC')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'KCC'
                      ? 'border-agri-600 bg-agri-50/90 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    paymentMethod === 'KCC' ? 'border-agri-700 bg-agri-700 text-white' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'KCC' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      💳 {t.payKcc}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.payKccDesc}
                    </p>

                    {/* If KCC Active, show Card Inputs */}
                    {paymentMethod === 'KCC' && (
                      <div className="mt-3 p-3 bg-white rounded-xl border border-agri-300 space-y-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">{t.kccNumberLabel}</label>
                          <input
                            type="text"
                            value={kccNumber}
                            onChange={(e) => setKccNumber(e.target.value)}
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 font-mono font-bold"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">{t.kccExpiryLabel}</label>
                            <input
                              type="text"
                              value={kccExpiry}
                              onChange={(e) => setKccExpiry(e.target.value)}
                              className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">{t.kccBankLabel}</label>
                            <input
                              type="text"
                              value={kccBank}
                              onChange={(e) => setKccBank(e.target.value)}
                              className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: FINAL ORDER REVIEW & PRICE BREAKDOWN             */}
          {/* ======================================================== */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <ShieldCheck className="w-4 h-4 text-agri-700" />
                <span>{t.orderSummaryTitle}</span>
              </div>

              {/* Itemized List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-slate-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Qty: {item.quantity} × ₹{item.product.price}
                      </p>
                    </div>
                    <span className="font-black text-slate-900">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery & Payment Preview Card */}
              <div className="p-3.5 rounded-2xl bg-agri-50 border border-agri-200 text-xs space-y-1.5">
                <div className="flex items-start justify-between">
                  <span className="text-slate-600 font-medium">Deliver To:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {fullName}, {villageTaluka}, {district} ({pincode})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Payment Mode:</span>
                  <span className="font-black text-agri-900">
                    {paymentMethod === 'COD' ? '💵 Cash on Delivery' : paymentMethod === 'UPI' ? '📱 UPI / QR' : '💳 Kisan Credit Card'}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>{t.subtotalLabel}</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>{t.discountLabel}</span>
                  <span>- ₹{discount}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>{t.deliveryFeeLabel}</span>
                  <span>FREE</span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-black text-slate-900">
                  <span>{t.totalPayableLabel}</span>
                  <span className="text-base text-agri-950">₹{total}</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backStepBtn}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
            >
              {t.close}
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev + 1) as any)}
              className="px-5 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-agri-700/20 transition-all flex items-center gap-1.5"
            >
              <span>{step === 1 ? t.nextStepBtn : t.reviewOrderBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-agri-700 to-agri-900 hover:from-agri-800 hover:to-agri-950 text-white text-xs sm:text-sm font-black shadow-lg shadow-agri-900/25 transition-all transform hover:scale-[1.02] flex items-center gap-2"
            >
              <span>{t.confirmPlaceOrderBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
