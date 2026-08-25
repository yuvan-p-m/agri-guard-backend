import React, { useState } from 'react';
import { 
  ShoppingCart, 
  ExternalLink, 
  ShieldCheck, 
  Truck, 
  Star, 
  Check, 
  ArrowRight,
  Sparkles,
  Store,
  CreditCard
} from 'lucide-react';
import { Language, EcomProduct, CartItem } from '../types';
import { translations } from '../data/translations';
import { ecommerceProducts } from '../data/ecommerceProducts';

interface EcommerceLinksProps {
  language: Language;
  recommendedProductIds: string[];
  onAddToCart: (product: EcomProduct) => void;
  onInstantBuy: (product: EcomProduct) => void;
}

export const EcommerceLinks: React.FC<EcommerceLinksProps> = ({
  language,
  recommendedProductIds,
  onAddToCart,
  onInstantBuy,
}) => {
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const t = translations[language];

  // Filter products that match the current recommendation
  const displayedProducts = ecommerceProducts.filter((p) => 
    recommendedProductIds.includes(p.id)
  );

  const productsToShow = displayedProducts.length > 0 ? displayedProducts : ecommerceProducts.slice(0, 3);

  const handleAddClick = (product: EcomProduct) => {
    onAddToCart(product);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-agri-200/80">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-agri-700" />
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {t.ecomTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {t.ecomSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-agri-800 bg-agri-50 px-3 py-1.5 rounded-xl border border-agri-200 shrink-0">
          <Truck className="w-4 h-4 text-agri-700" />
          <span>{t.freeDelivery}</span>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {productsToShow.map((product) => {
          const discountPct = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

          return (
            <div
              key={product.id}
              className="rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white p-4 shadow-2xs hover:shadow-md hover:border-agri-400 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Product Image & Badges */}
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-200 mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200">
                      {product.badge}
                    </span>
                    {discountPct > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white shadow-sm">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Category & Brand */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="font-semibold text-agri-700">{product.category}</span>
                  <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>

                {/* Product Name */}
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                  {product.name}
                </h4>

                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Pack: <span className="font-bold text-slate-700">{product.packSize}</span> • Sold by: <span className="text-agri-800">{product.vendor}</span>
                </p>

                <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2">
                  {product.description[language]}
                </p>
              </div>

              {/* Pricing & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-200/70">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-black text-slate-900">
                    ₹{product.price}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Save ₹{product.originalPrice - product.price}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddClick(product)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      addedIds[product.id]
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {addedIds[product.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{t.addToCart}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onInstantBuy(product)}
                    className="py-2 px-2.5 rounded-xl text-xs font-extrabold bg-agri-700 hover:bg-agri-800 text-white shadow-sm transition-all flex items-center justify-center gap-1 hover:scale-[1.02]"
                  >
                    <span>{t.buyNow}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="mt-5 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{t.codAvailable}</span>
        </div>
        <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
          Govt. CIB-RC Certified
        </span>
      </div>

    </div>
  );
};
