import React, { useState, useEffect } from 'react';
import {
  Store,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Sparkles,
  BarChart2,
  Clock,
  Landmark,
  Layers
} from 'lucide-react';
import type { Language, UserProfile, MandiRecord, PriceForecastResponse, CropAlertResponse } from '../types';
import { marketplaceAPI } from '../services/api';
import { useAppTranslation } from '../i18n';

interface MarketplaceTabProps {
  language: Language;
  user: UserProfile;
}

const INDIAN_STATES = [
  'Tamil Nadu',
  'Maharashtra',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Kerala',
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Rajasthan',
  'Gujarat',
  'Bihar',
  'West Bengal',
  'Odisha',
  'Assam'
];

const CROPS_LIST = [
  { id: 'rice', label: 'Rice (Paddy)' },
  { id: 'wheat', label: 'Wheat' },
  { id: 'maize', label: 'Maize (Corn)' },
  { id: 'tomato', label: 'Tomato' },
  { id: 'onion', label: 'Onion' },
  { id: 'potato', label: 'Potato' },
  { id: 'cotton', label: 'Cotton' },
  { id: 'sugarcane', label: 'Sugarcane' },
  { id: 'groundnut', label: 'Groundnut (Peanut)' },
  { id: 'mustard', label: 'Mustard' },
  { id: 'soybean', label: 'Soybean' },
  { id: 'chilli', label: 'Dry Chilli' },
  { id: 'turmeric', label: 'Turmeric' },
  { id: 'banana', label: 'Banana' },
  { id: 'mango', label: 'Mango' },
  { id: 'coconut', label: 'Coconut' },
  { id: 'garlic', label: 'Garlic' },
  { id: 'ginger', label: 'Ginger' },
  { id: 'bajra', label: 'Bajra (Pearl Millet)' },
  { id: 'jowar', label: 'Jowar (Sorghum)' },
  { id: 'ragi', label: 'Ragi (Finger Millet)' },
  { id: 'barley', label: 'Barley' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'jute', label: 'Jute' },
  { id: 'sunflower', label: 'Sunflower' },
  { id: 'apple', label: 'Apple' },
  { id: 'grapes', label: 'Grapes' },
  { id: 'orange', label: 'Orange' },
  { id: 'papaya', label: 'Papaya' },
  { id: 'pomegranate', label: 'Pomegranate' },
  { id: 'watermelon', label: 'Watermelon' },
  { id: 'blackgram', label: 'Black Gram (Urad)' },
  { id: 'chickpea', label: 'Chickpea (Chana)' },
  { id: 'lentil', label: 'Lentil (Masoor)' },
  { id: 'mungbean', label: 'Mung Bean (Moong)' },
  { id: 'pigeonpeas', label: 'Pigeon Pea (Tur/Arhar)' },
  { id: 'sesame', label: 'Sesame (Til)' },
  { id: 'okra', label: "Okra (Lady's Finger)" }
];

export const MarketplaceTab: React.FC<MarketplaceTabProps> = ({ language, user }) => {
  const { t } = useAppTranslation();

  const get_initial_crop = () => {
    const raw = (user.primaryCrop || 'Rice').toLowerCase();
    const match = CROPS_LIST.find((c) => raw.includes(c.id) || c.label.toLowerCase().includes(raw));
    return match ? match.id : 'rice';
  };

  const get_initial_state = () => {
    if (user.state && INDIAN_STATES.includes(user.state)) {
      return user.state;
    }
    return 'Tamil Nadu';
  };

  const [selected_state, set_selected_state] = useState<string>(get_initial_state);
  const [selected_crop, set_selected_crop] = useState<string>(get_initial_crop);

  const [mandi_records, set_mandi_records] = useState<MandiRecord[]>([]);
  const [forecast_data, set_forecast_data] = useState<PriceForecastResponse | null>(null);
  const [crop_alert, set_crop_alert] = useState<CropAlertResponse | null>(null);
  const [last_updated, set_last_updated] = useState<string>('');
  const [data_source, set_data_source] = useState<string>('data.gov.in');

  const [is_loading_mandi, set_is_loading_mandi] = useState<boolean>(true);
  const [is_loading_forecast, set_is_loading_forecast] = useState<boolean>(true);
  const [error_message, set_error_message] = useState<string | null>(null);

  const [is_mandi_expanded, set_is_mandi_expanded] = useState<boolean>(true);
  const [is_forecast_expanded, set_is_forecast_expanded] = useState<boolean>(true);

  const [sort_column, set_sort_column] = useState<keyof MandiRecord>('modal_price');
  const [sort_direction, set_sort_direction] = useState<'asc' | 'desc'>('desc');

  const fetch_all_data = async (crop_val: string, state_val: string) => {
    set_is_loading_mandi(true);
    set_is_loading_forecast(true);
    set_error_message(null);

    try {
      const alert_res = await marketplaceAPI.getCropAlert(crop_val);
      if (alert_res && alert_res.status === 'success') {
        set_crop_alert(alert_res);
      }
    } catch (e) {
      console.warn('Crop alert notice:', e);
    }

    try {
      const mandi_res = await marketplaceAPI.getMandiPrices(crop_val, state_val);
      if (mandi_res && mandi_res.records) {
        set_mandi_records(mandi_res.records);
        set_last_updated(mandi_res.last_updated || new Date().toLocaleTimeString());
        set_data_source(mandi_res.source || 'data.gov.in');
      } else {
        set_mandi_records([]);
      }
    } catch (err: any) {
      console.warn('Mandi price load notice:', err);
      set_error_message('No price data available for your crop in your state today. Try again tomorrow.');
    } finally {
      set_is_loading_mandi(false);
    }

    try {
      const forecast_res = await marketplaceAPI.getPriceForecast(crop_val, state_val);
      if (forecast_res && forecast_res.weekly_prices) {
        set_forecast_data(forecast_res);
      } else {
        set_forecast_data(null);
      }
    } catch (err) {
      console.warn('Forecast load notice:', err);
    } finally {
      set_is_loading_forecast(false);
    }
  };

  useEffect(() => {
    fetch_all_data(selected_crop, selected_state);
  }, [selected_crop, selected_state]);

  const handle_sort = (col: keyof MandiRecord) => {
    if (sort_column === col) {
      set_sort_direction((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      set_sort_column(col);
      set_sort_direction('desc');
    }
  };

  const sorted_records = [...mandi_records].sort((a, b) => {
    let val_a = a[sort_column];
    let val_b = b[sort_column];

    if (sort_column === 'min_price' || sort_column === 'max_price' || sort_column === 'modal_price') {
      const num_a = parseFloat(String(val_a).replace(/[^0-9.]/g, '')) || 0;
      const num_b = parseFloat(String(val_b).replace(/[^0-9.]/g, '')) || 0;
      return sort_direction === 'asc' ? num_a - num_b : num_b - num_a;
    }

    const str_a = String(val_a).toLowerCase();
    const str_b = String(val_b).toLowerCase();
    return sort_direction === 'asc' ? str_a.localeCompare(str_b) : str_b.localeCompare(str_a);
  });

  const best_mandi = sorted_records.length > 0
    ? [...sorted_records].sort((a, b) => {
        const num_a = parseFloat(String(a.modal_price).replace(/[^0-9.]/g, '')) || 0;
        const num_b = parseFloat(String(b.modal_price).replace(/[^0-9.]/g, '')) || 0;
        return num_b - num_a;
      })[0]
    : null;

  const lowest_mandi = sorted_records.length > 1
    ? [...sorted_records].sort((a, b) => {
        const num_a = parseFloat(String(a.modal_price).replace(/[^0-9.]/g, '')) || 0;
        const num_b = parseFloat(String(b.modal_price).replace(/[^0-9.]/g, '')) || 0;
        return num_a - num_b;
      })[0]
    : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-12">
      {/* Top Banner & Title */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-2 border border-emerald-200">
              <Store className="w-3.5 h-3.5 text-emerald-700" />
              <span>Agmarknet & data.gov.in Live Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Marketplace & Mandi Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium max-w-2xl leading-relaxed">
              Compare live wholesale mandi prices across your state, analyze 8-week historical trends, and forecast demand to maximize profit.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetch_all_data(selected_crop, selected_state)}
            disabled={is_loading_mandi || is_loading_forecast}
            className="px-5 py-2.5 rounded-2xl bg-agri-700 hover:bg-agri-800 text-white text-xs sm:text-sm font-black shadow-md shadow-agri-700/25 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-4 h-4 ${is_loading_mandi || is_loading_forecast ? 'animate-spin' : ''}`} />
            <span>Refresh Prices</span>
          </button>
        </div>

        {/* Top Filtration Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* State Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-agri-600" />
              <span>Select State:</span>
            </label>
            <select
              value={selected_state}
              onChange={(e) => set_selected_state(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all cursor-pointer"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Crop Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Select Commodity / Crop:</span>
            </label>
            <select
              value={selected_crop}
              onChange={(e) => set_selected_crop(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all cursor-pointer"
            >
              {CROPS_LIST.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  {cp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Metadata info */}
          <div className="space-y-1 flex flex-col justify-end">
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs px-3">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Updated:</span>
              </span>
              <span className="font-mono font-bold text-slate-700 text-[11px]">
                {last_updated || 'Live'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Calendar Alert Banner */}
      {crop_alert && (
        <div className="rounded-3xl border-2 border-amber-200/90 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-5 sm:p-6 shadow-md flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shrink-0 mt-0.5">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm sm:text-base font-black text-amber-950">
                Crop Calendar Advisory — {crop_alert.crop}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                {crop_alert.alert_type.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 font-bold leading-relaxed">
              {crop_alert.message}
            </p>
            <p className="text-xs text-amber-800 font-medium mt-1">
              💡 {crop_alert.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1 — LIVE MANDI PRICE COMPARISON */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Live Mandi Price Comparison
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Real-time APMC market arrivals for {selected_crop.toUpperCase()} in {selected_state}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => set_is_mandi_expanded(!is_mandi_expanded)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            aria-label="Toggle Section"
          >
            {is_mandi_expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {is_mandi_expanded && (
          <div className="space-y-4">
            {/* Best Market Highlight Banner */}
            {best_mandi && (
              <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                    <CheckCircle className="w-5 h-5 text-citrus-300" />
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 block">
                      Best Market Today
                    </span>
                    <p className="text-base sm:text-lg font-black tracking-tight">
                      Best market today: <span className="text-citrus-300">{best_mandi.market}</span> ({best_mandi.district}) at ₹{best_mandi.modal_price}/quintal
                    </p>
                  </div>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-white text-emerald-950 text-xs font-black shadow-sm shrink-0">
                  ₹{best_mandi.modal_price} / Q
                </span>
              </div>
            )}

            {/* Loading / Error states */}
            {is_loading_mandi && (
              <div className="p-10 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-sm font-black text-slate-800">Fetching live mandi rates from data.gov.in...</p>
              </div>
            )}

            {error_message && !is_loading_mandi && sorted_records.length === 0 && (
              <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-center space-y-1 text-rose-900">
                <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
                <p className="text-sm font-black">{error_message}</p>
              </div>
            )}

            {/* Table */}
            {!is_loading_mandi && sorted_records.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-600 uppercase text-[11px] font-black tracking-wider border-b border-slate-200">
                      <th
                        onClick={() => handle_sort('market')}
                        className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <span>Market</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => handle_sort('district')}
                        className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <span>District</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => handle_sort('min_price')}
                        className="py-3 px-4 text-center cursor-pointer hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Min Price</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => handle_sort('max_price')}
                        className="py-3 px-4 text-center cursor-pointer hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Max Price</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => handle_sort('modal_price')}
                        className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Modal Price (₹/Q)</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sorted_records.map((item, idx) => {
                      const is_best = best_mandi && item.market === best_mandi.market && item.modal_price === best_mandi.modal_price;
                      const is_worst = lowest_mandi && item.market === lowest_mandi.market && item.modal_price === lowest_mandi.modal_price;

                      let row_bg = 'bg-white hover:bg-slate-50/80';
                      if (is_best) {
                        row_bg = 'bg-emerald-50/90 hover:bg-emerald-100/80 font-bold border-l-4 border-l-emerald-600';
                      } else if (is_worst) {
                        row_bg = 'bg-rose-50/70 hover:bg-rose-100/70 text-rose-950 border-l-4 border-l-rose-500';
                      }

                      return (
                        <tr key={idx} className={`${row_bg} transition-colors`}>
                          <td className="py-3 px-4 font-black text-slate-900">
                            <div className="flex items-center gap-2">
                              <span>{item.market}</span>
                              {is_best && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                                  Best Price
                                </span>
                              )}
                              {is_worst && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                                  Lowest Rate
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{item.district}</td>
                          <td className="py-3 px-4 text-center font-mono text-slate-700">₹{item.min_price}</td>
                          <td className="py-3 px-4 text-center font-mono text-slate-700">₹{item.max_price}</td>
                          <td className="py-3 px-4 text-right font-mono font-black text-sm text-emerald-950">
                            ₹{item.modal_price}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                            {item.arrival_date}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2 — DEMAND FORECASTING (PRICE TREND) */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Demand Forecasting & 3-Week Price Trend
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                8-week rolling average analysis and predictive forward trajectory
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => set_is_forecast_expanded(!is_forecast_expanded)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            aria-label="Toggle Section"
          >
            {is_forecast_expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {is_forecast_expanded && (
          <div className="space-y-6">
            {is_loading_forecast && (
              <div className="p-10 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-sm font-black text-slate-800">Calculating rolling averages & forecast...</p>
              </div>
            )}

            {forecast_data && !is_loading_forecast && (
              <>
                {/* 3-Week Forward Forecast Prediction Cards */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                      <span>3-Week Forward Rate Projections (₹/Quintal)</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Based on 8-week weighted rolling averages
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {forecast_data.forecast.map((f_price, idx) => {
                      const week_label = `Week +${idx + 1}`;
                      const days_label = `+${(idx + 1) * 7} Days`;
                      const prev_price = idx === 0 
                        ? (forecast_data.weekly_prices[forecast_data.weekly_prices.length - 1]?.price || f_price)
                        : forecast_data.forecast[idx - 1];
                      const diff = f_price - prev_price;
                      const diff_pct = prev_price ? ((diff / prev_price) * 100).toFixed(1) : '0';

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border border-indigo-100 shadow-sm flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-indigo-100/60">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 block">
                                {week_label}
                              </span>
                              <span className="text-[11px] text-slate-500 font-semibold">{days_label}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              diff > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : diff < 0
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {diff > 0 ? `+${diff_pct}%` : diff < 0 ? `${diff_pct}%` : 'Stable'}
                            </span>
                          </div>

                          <div className="mt-3">
                            <div className="text-2xl font-black font-mono text-indigo-950">
                              ₹{f_price.toLocaleString('en-IN')}
                              <span className="text-xs font-semibold text-slate-500 ml-1">/ Q</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                              {diff > 0 ? `▲ ₹${Math.abs(diff)} increase expected` : diff < 0 ? `▼ ₹${Math.abs(diff)} decrease expected` : '→ Steady price levels'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Verdict Card */}
                {(() => {
                  const trend_type = forecast_data.trend;
                  const final_forecast_price = forecast_data.forecast[forecast_data.forecast.length - 1];
                  const pct = forecast_data.pct_change;

                  let card_bg = 'bg-slate-50 border-slate-200 text-slate-900';
                  let badge_color = 'bg-slate-700 text-white';
                  let trend_icon = <Minus className="w-5 h-5" />;

                  if (trend_type === 'RISING') {
                    card_bg = 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-300 text-emerald-950';
                    badge_color = 'bg-emerald-600 text-white';
                    trend_icon = <TrendingUp className="w-5 h-5 text-emerald-600" />;
                  } else if (trend_type === 'FALLING') {
                    card_bg = 'bg-gradient-to-r from-rose-50 via-orange-50 to-rose-50 border-rose-300 text-rose-950';
                    badge_color = 'bg-rose-600 text-white';
                    trend_icon = <TrendingDown className="w-5 h-5 text-rose-600" />;
                  } else {
                    card_bg = 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-blue-300 text-blue-950';
                    badge_color = 'bg-blue-600 text-white';
                    trend_icon = <Minus className="w-5 h-5 text-blue-600" />;
                  }

                  return (
                    <div className={`p-6 rounded-3xl border-2 ${card_bg} shadow-md space-y-4`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-200">
                            {trend_icon}
                          </span>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                              3-Week Outlook Verdict
                            </span>
                            <h4 className="text-lg sm:text-xl font-black">
                              {forecast_data.verdict_title || (trend_type === 'RISING' ? 'Prices rising — Hold your crop' : trend_type === 'FALLING' ? 'Prices falling — Sell now' : 'Prices stable')}
                            </h4>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`px-3.5 py-1 rounded-full text-xs font-black shadow-xs ${badge_color}`}>
                            {pct > 0 ? `+${pct}%` : `${pct}%`} Expected
                          </span>
                          <p className="text-xs font-mono font-black mt-1">
                            Expected price in 3 weeks: ₹{final_forecast_price}/Q
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                        <p className="font-black text-slate-800">
                          🎯 Recommendation: <span className="font-extrabold">{forecast_data.recommendation}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Based on {forecast_data.record_count} price records from last 8 weeks across {selected_state}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
