import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ExternalLink, 
  Landmark, 
  CheckCircle2, 
  Smartphone, 
  Building2, 
  X, 
  Wheat, 
  MapPin, 
  AlertCircle,
  Tag
} from 'lucide-react';
import schemesData from '../data/schemes.json';
import type { Language, UserProfile } from '../types';
import { useAppTranslation } from '../i18n';

export interface GovtScheme {
  name: string;
  full_name: string;
  benefit: string;
  eligible_crops: string;
  state: string;
  category: string;
  apply: string;
}

interface GovtSchemesTabProps {
  language?: Language;
  user?: UserProfile;
}

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'income support', label: 'Income Support' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'soil health', label: 'Soil Health' },
  { id: 'organic farming', label: 'Organic Farming' },
  { id: 'credit', label: 'Credit & Loans' },
  { id: 'horticulture', label: 'Horticulture' },
  { id: 'water and sustainability', label: 'Water & Sustainability' },
  { id: 'infrastructure', label: 'Infrastructure & Post Harvest' },
  { id: 'market access', label: 'Market Access & Digital' },
  { id: 'mechanization', label: 'Mechanization' },
  { id: 'food security', label: 'Food Security' },
  { id: 'irrigation', label: 'Irrigation' },
  { id: 'advisory', label: 'Advisory & Extension' },
];

const CROPS = [
  { id: 'all', label: 'All Crops' },
  { id: 'citrus', label: 'Citrus (Orange, Lemon)' },
  { id: 'rice', label: 'Rice / Paddy' },
  { id: 'wheat', label: 'Wheat' },
  { id: 'cotton', label: 'Cotton' },
  { id: 'sugarcane', label: 'Sugarcane' },
  { id: 'pulses', label: 'Pulses' },
  { id: 'oilseeds', label: 'Oilseeds' },
  { id: 'millets', label: 'Millets' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'grapes', label: 'Grapes' },
  { id: 'pomegranate', label: 'Pomegranate' },
  { id: 'lentil', label: 'Lentil / Chickpea / Pulses' },
];

const STATES = [
  { id: 'all', label: 'All States (Pan-India)' },
  { id: 'andhra pradesh', label: 'Andhra Pradesh' },
  { id: 'assam', label: 'Assam' },
  { id: 'bihar', label: 'Bihar' },
  { id: 'chhattisgarh', label: 'Chhattisgarh' },
  { id: 'gujarat', label: 'Gujarat' },
  { id: 'haryana', label: 'Haryana' },
  { id: 'himachal pradesh', label: 'Himachal Pradesh' },
  { id: 'jharkhand', label: 'Jharkhand' },
  { id: 'karnataka', label: 'Karnataka' },
  { id: 'kerala', label: 'Kerala' },
  { id: 'madhya pradesh', label: 'Madhya Pradesh' },
  { id: 'maharashtra', label: 'Maharashtra' },
  { id: 'odisha', label: 'Odisha' },
  { id: 'punjab', label: 'Punjab' },
  { id: 'rajasthan', label: 'Rajasthan' },
  { id: 'tamil nadu', label: 'Tamil Nadu' },
  { id: 'telangana', label: 'Telangana' },
  { id: 'uttar pradesh', label: 'Uttar Pradesh' },
  { id: 'uttarakhand', label: 'Uttarakhand' },
  { id: 'west bengal', label: 'West Bengal' },
];

export const GovtSchemesTab: React.FC<GovtSchemesTabProps> = ({ user }) => {
  const { t } = useAppTranslation();
  const schemes: GovtScheme[] = schemesData as GovtScheme[];

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedCrop !== 'all' ||
    selectedState !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCrop('all');
    setSelectedState('all');
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'income support':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'insurance':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'soil health':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'organic farming':
        return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'credit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'horticulture':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'water and sustainability':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'infrastructure':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'market access':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mechanization':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'food security':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'irrigation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advisory':
        return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Real-time instant filtering
  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme) => {
      // 1. Search Bar: scheme name, full name, benefit, category, apply keyword
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          scheme.name.toLowerCase().includes(q) ||
          scheme.full_name.toLowerCase().includes(q) ||
          scheme.benefit.toLowerCase().includes(q) ||
          scheme.category.toLowerCase().includes(q) ||
          scheme.eligible_crops.toLowerCase().includes(q) ||
          scheme.apply.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all') {
        if (scheme.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 3. Eligible Crops filter
      if (selectedCrop !== 'all') {
        const cropLower = selectedCrop.toLowerCase();
        const schemeCrops = scheme.eligible_crops.toLowerCase();
        // If scheme applies to 'all', it covers this crop; otherwise check crop substring
        const matchesCrop = schemeCrops === 'all' || schemeCrops.includes(cropLower);
        if (!matchesCrop) return false;
      }

      // 4. State filter
      if (selectedState !== 'all') {
        const stateLower = selectedState.toLowerCase();
        const schemeState = scheme.state.toLowerCase();
        const matchesState = schemeState === 'all' || schemeState.includes(stateLower);
        if (!matchesState) return false;
      }

      return true;
    });
  }, [schemes, searchQuery, selectedCategory, selectedCrop, selectedState]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-12">
      {/* Top Banner & Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-100 text-agri-800 text-xs font-black mb-2 border border-agri-200">
              <Landmark className="w-3.5 h-3.5 text-agri-700" />
              <span>{t('schemesHeaderTitle', 'Direct Benefit Transfer & Welfare Programs')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('tabGovtSchemes', 'Government Schemes')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium max-w-2xl leading-relaxed">
              {t('schemesHeaderSubtitle', 'Explore subsidies, crop insurance, financial credit, and soil health programs offered by the Central and State Governments for Indian farmers.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-2xl bg-agri-50 border border-agri-200 text-agri-900 font-extrabold text-xs">
              {t('schemesFound', 'Schemes')}: {filteredSchemes.length} / {schemes.length}
            </span>
          </div>
        </div>

        {/* Top Section: Search Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('schemesSearchPlaceholder', 'Search scheme by name, benefit keyword, or eligibility...')}
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Below that: Filter Row with Dropdowns */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-agri-600" />
              {t('filterCategory', 'Category')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Eligible Crops Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Wheat className="w-3 h-3 text-amber-600" />
              {t('eligibleCropsLabel', 'Eligible Crops')}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all"
            >
              {CROPS.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.label}
                </option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-rose-500" />
              {t('eligibleStateLabel', 'State')}
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all"
            >
              {STATES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={!isFiltered}
              className={`w-full py-2.5 px-4 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 ${
                isFiltered
                  ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-95 shadow-sm'
                  : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('clearFilters', 'Clear All Filters')}</span>
            </button>
          </div>
        </div>

        {/* Active filter pills */}
        {isFiltered && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                Search: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-agri-100 text-agri-800 text-xs font-semibold">
                Category: {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                <button type="button" onClick={() => setSelectedCategory('all')} className="hover:text-agri-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCrop !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-semibold">
                Crop: {CROPS.find((c) => c.id === selectedCrop)?.label}
                <button type="button" onClick={() => setSelectedCrop('all')} className="hover:text-amber-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedState !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 text-xs font-semibold">
                State: {STATES.find((s) => s.id === selectedState)?.label}
                <button type="button" onClick={() => setSelectedState('all')} className="hover:text-sky-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Below filters: Scheme cards grid */}
      {filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredSchemes.map((scheme) => {
            const isWebLink = scheme.apply.includes('.') && !scheme.apply.includes(' ');
            const isPlayStoreApp = scheme.apply.toLowerCase().includes('app') || scheme.apply.toLowerCase().includes('play store');

            return (
              <div
                key={scheme.name}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/90 hover:border-agri-300 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Category Badge & Coverage */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${getCategoryBadgeClass(
                        scheme.category
                      )}`}
                    >
                      {scheme.category}
                    </span>

                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-slate-400" />
                      {scheme.state === 'all' ? 'Pan-India' : scheme.state}
                    </span>
                  </div>

                  {/* Scheme Short Name & Full Name */}
                  <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-agri-700 transition-colors">
                    {scheme.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-1 leading-snug">
                    {scheme.full_name}
                  </p>

                  {/* Benefit Main Body */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0 mt-0.5" />
                      <span>{scheme.benefit}</span>
                    </div>
                  </div>

                  {/* Crop Eligibility Tag */}
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <Wheat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-semibold text-slate-600">{t('eligibleCropsLabel', 'Eligible Crops')}:</span>
                    <span className="text-slate-700 capitalize font-bold truncate">
                      {scheme.eligible_crops === 'all' ? t('allCrops', 'All Crops') : scheme.eligible_crops.split(',').slice(0, 3).join(', ') + (scheme.eligible_crops.split(',').length > 3 ? '...' : '')}
                    </span>
                  </div>
                </div>

                {/* Apply link/website at bottom */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  {isWebLink ? (
                    <a
                      href={`https://${scheme.apply}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-2xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-black shadow-md shadow-agri-700/20 transition-all group/btn"
                    >
                      <span className="truncate">{t('applyWebsite', 'Portal')}: {scheme.apply}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5 shrink-0 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                  ) : (
                    <div className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                      <span className="truncate">{t('applyWebsite', 'Apply')}: {scheme.apply}</span>
                      {isPlayStoreApp ? (
                        <Smartphone className="w-3.5 h-3.5 ml-1.5 text-slate-500 shrink-0" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 ml-1.5 text-slate-500 shrink-0" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 sm:p-14 text-center shadow-xl border border-slate-200 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">
            {t('noSchemesFound', 'No government schemes matched your current filter criteria.')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            {t('noSchemesFoundSub', 'We could not find any government schemes matching your search or dropdown criteria. Try resetting your filters.')}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-black shadow-md shadow-agri-700/20 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('clearFilters', 'Clear All Filters')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
