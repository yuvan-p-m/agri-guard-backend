import React, { useState } from 'react';
import { 
  Store, 
  Search, 
  Star, 
  ShoppingCart, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Check, 
  Package, 
  Clock, 
  ExternalLink,
  MapPin
} from 'lucide-react';
import type { Language, EcomProduct, Order } from '../types';
import { translations } from '../data/translations';
import { ecommerceProducts } from '../data/ecommerceProducts';

interface AgriStoreCatalogProps {
  language: Language;
  onAddToCart: (product: EcomProduct) => void;
  onInstantBuy: (product: EcomProduct) => void;
  orders: Order[];
  onViewOrderDetails: (order: Order) => void;
  recommendedProductIds?: string[];
}

export const AgriStoreCatalog: React.FC<AgriStoreCatalogProps> = ({
  language,
  onAddToCart,
  onInstantBuy,
  orders,
  onViewOrderDetails,
  recommendedProductIds,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'orders'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const t = translations[language];

  const categories = [
    { id: 'all', label: t.allCategories },
    { id: 'Organic Bio-Fungicide', label: t.catOrganic },
    { id: 'Chemical Fungicide', label: t.catChemical },
    { id: 'Pesticide', label: t.catInsecticide },
    { id: 'Sprayer Equipment', label: t.catEquipment },
  ];

  const handleAddClick = (product: EcomProduct) => {
    onAddToCart(product);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const filteredProducts = ecommerceProducts.filter((product) => {
    const matchesRecommendation = !recommendedProductIds?.length || recommendedProductIds.includes(product.id);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description[language].toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRecommendation && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Store Header Banner */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-agri-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-100 text-agri-800 text-xs font-bold mb-2">
              <Store className="w-4 h-4 text-agri-700" />
              <span>CIB-RC Certified Agricultural Store</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.storeTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium max-w-2xl">
              {t.storeSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 text-emerald-950 text-xs font-bold self-start md:self-auto">
            <Truck className="w-4 h-4 text-emerald-700" />
            <span>{t.freeDelivery}</span>
          </div>
        </div>

        {/* Store Sub-Navigation: Browse Catalog vs My Orders */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start">
            <button
              type="button"
              onClick={() => setActiveSubTab('catalog')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeSubTab === 'catalog'
                  ? 'bg-agri-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.catalogTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSubTab === 'orders'
                  ? 'bg-agri-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{t.myOrdersTab}</span>
              {orders.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeSubTab === 'orders' ? 'bg-citrus-300 text-slate-950' : 'bg-agri-200 text-agri-900'
                }`}>
                  {orders.length}
                </span>
              )}
            </button>
          </div>

          {activeSubTab === 'catalog' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-agri-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Search Bar when in Catalog Mode */}
        {activeSubTab === 'catalog' && (
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pesticides, bio-fertilizers, sprayers, brand names..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-agri-600 focus:ring-1 focus:ring-agri-600 bg-slate-50/60 font-medium"
            />
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* SUB-VIEW 1: BROWSE CATALOG PRODUCTS                      */}
      {/* ======================================================== */}
      {activeSubTab === 'catalog' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
          {filteredProducts.map((product) => {
            const discountPct = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

            return (
              <div
                key={product.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-lg border border-slate-200/90 hover:border-agri-400 hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image & Badges */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 mb-3.5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-white/95 text-slate-800 shadow-sm border border-slate-200">
                        {product.badge}
                      </span>
                      {discountPct > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white shadow-sm">
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category & Rating */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold text-agri-700">{product.category}</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Pack: <strong className="text-slate-800">{product.packSize}</strong> • Vendor: <span className="text-agri-800">{product.vendor}</span>
                  </p>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                    {product.description[language]}
                  </p>
                </div>

                {/* Pricing & Order Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-100">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-black text-slate-900">
                      ₹{product.price}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Save ₹{product.originalPrice - product.price}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleAddClick(product)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        addedIds[product.id]
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
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
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-agri-700 hover:bg-agri-800 text-white shadow-sm transition-all flex items-center justify-center gap-1 hover:scale-[1.02]"
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
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2: MY ORDERS / PURCHASE HISTORY                 */}
      {/* ======================================================== */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4 animate-fade-in">
          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white/95 rounded-3xl border border-slate-200 text-slate-400 space-y-3">
              <Package className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <h3 className="text-base font-bold text-slate-700">No Past Orders Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">You haven't placed any farm supply orders yet. Browse our certified inputs catalog to order.</p>
              <button
                type="button"
                onClick={() => setActiveSubTab('catalog')}
                className="px-4 py-2 rounded-xl bg-agri-700 text-white text-xs font-bold shadow-sm"
              >
                Browse Agri-Store Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => onViewOrderDetails(ord)}
                  className="p-5 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 hover:border-agri-400 shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {ord.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ● {ord.status}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        • {ord.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <Package className="w-3.5 h-3.5 text-agri-700" />
                      <span>{ord.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{ord.shippingAddress.villageTaluka}, {ord.shippingAddress.district} ({ord.paymentMethod})</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-500 font-medium block">Total Paid:</span>
                      <span className="text-base font-black text-agri-950">₹{ord.total}</span>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold group-hover:bg-agri-700 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5 text-citrus-300" />
                      <span>Track Delivery</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
