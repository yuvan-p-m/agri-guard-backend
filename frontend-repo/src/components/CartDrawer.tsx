import React from 'react';
import { 
  ShoppingCart, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import type { Language, CartItem, UserProfile } from '../types';
import { translations } from '../data/translations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  user: UserProfile;
  language: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  user,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = 0; // Free farm delivery
  const total = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-[110] overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        
        {/* Cart Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-agri-50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-agri-700" />
            <h3 className="font-black text-base text-slate-900">
              {t.cartTotal} ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-semibold">Your farm supplies cart is empty.</p>
              <p className="text-xs text-slate-400">Click "Add to Cart" or "Buy Now" on any recommended remedy or Agri-Store product.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.product.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">
                      {item.product.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {item.product.packSize} • ₹{item.product.price} each
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-5 h-5 rounded-md bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-5 h-5 rounded-md bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between items-end">
                    <span className="text-xs font-black text-slate-900">
                      ₹{item.product.price * item.quantity}
                    </span>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Delivery Address Preview Banner */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>Delivery Destination:</span>
                </p>
                <p className="text-emerald-900 mt-0.5 font-medium">
                  {user.name} • {user.district}, {user.state} ({user.phone})
                </p>
              </div>

              {/* Trust Badge */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-agri-700 shrink-0" />
                <span>100% CIB-RC Certified Agricultural Products • Free Returns</span>
              </div>
            </div>
          )}
        </div>

        {/* Cart Checkout Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">₹{subtotal}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
              <span>Farm Delivery:</span>
              <span>FREE</span>
            </div>
            <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>Total Amount:</span>
              <span className="text-lg text-agri-950">₹{total}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-black text-sm shadow-md shadow-agri-700/25 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <span>{t.checkout} (₹{total})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
