import React, { useState } from 'react';
import { 
  Sprout, 
  Server,
  CloudRain, 
  Sun, 
  Cloud, 
  CloudLightning,
  ShieldCheck,
  Languages,
  MapPin,
  Bell
} from 'lucide-react';
import type { Language, UserProfile, WeatherInfo } from '../types';
import { languageNames, supportedLanguages } from '../i18n';
import { useAppTranslation } from '../i18n';
import { ServerEndpointModal } from './ServerEndpointModal';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  user: UserProfile;
  weather: WeatherInfo;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  isMobileNavOpen: boolean;
  onToggleMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  user,
  weather,
  unreadNotifications,
  onOpenNotifications,
  isMobileNavOpen,
  onToggleMobileNav,
}) => {
  const { t } = useAppTranslation();
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  const getWeatherIcon = (type: WeatherInfo['iconType']) => {
    switch (type) {
      case 'rain': return <CloudRain className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'storm': return <CloudLightning className="w-4 h-4 text-purple-600 animate-pulse" />;
      case 'sun': return <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />;
      case 'cloud': 
      default: return <Cloud className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-agri-200/60 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleMobileNav}
              aria-label={t.toggleNavigation}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/85 text-slate-700 shadow-sm transition-all hover:bg-agri-50 hover:text-agri-800 md:hidden"
            >
              <span className="relative block h-4 w-5">
                <span className={`absolute left-0 right-0 h-0.5 rounded-full bg-current transition-all ${isMobileNavOpen ? 'top-1.5 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 right-0 h-0.5 rounded-full bg-current transition-all ${isMobileNavOpen ? 'opacity-0' : 'top-1.5'}`} />
                <span className={`absolute left-0 right-0 h-0.5 rounded-full bg-current transition-all ${isMobileNavOpen ? 'top-1.5 -rotate-45' : 'top-3'}`} />
              </span>
            </button>

            {/* Brand Logo */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-agri-600 to-agri-800 flex items-center justify-center shadow-md shadow-agri-700/20 text-white transform hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-citrus-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-agri-950 font-sans">
                  Agri<span className="text-agri-600">Guard</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-agri-100 text-agri-800 border border-agri-300">
                  <ShieldCheck className="w-3 h-3 text-agri-600" /> AI v2.4
                </span>
              </div>
            </div>
          </div>

          {/* Location & Live Field Weather Pill */}
          <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-agri-50/90 border border-agri-200/80 text-xs shadow-inner">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-agri-700" />
              <span>{weather.city}:</span>
              <span className="text-agri-800 font-extrabold">{weather.tempC}°C</span>
            </div>
            <div className="h-3 w-px bg-agri-300" />
            <div className="text-slate-600 font-medium">
              {t.humidity}: <strong className="text-slate-800">{weather.humidity}%</strong>
            </div>
            <div className="h-3 w-px bg-agri-300" />
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
              weather.fungalRiskLevel === 'High' || weather.fungalRiskLevel === 'Severe' 
                ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' 
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {weather.fungalRiskLevel} Risk
            </span>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Language Switcher */}
            <label className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-inner" title={t.preferredLanguage}>
              <Languages className="w-3.5 h-3.5 text-slate-700 ml-1.5 mr-1 hidden sm:inline" />
              <span className="sr-only">{t.preferredLanguage}</span>
              <select
                value={language}
                onChange={(event) => onLanguageChange(event.target.value as Language)}
                aria-label={t.preferredLanguage}
                className="max-w-[6.5rem] cursor-pointer bg-transparent px-1 py-1 text-xs font-bold text-slate-800 outline-none sm:max-w-none"
              >
                {supportedLanguages.map((supportedLanguage) => (
                  <option key={supportedLanguage} value={supportedLanguage}>
                    {languageNames[supportedLanguage]}
                  </option>
                ))}
              </select>
            </label>

            {/* Agricultural Advisory Notifications */}
            <button
              type="button"
              onClick={() => setIsServerModalOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:text-agri-800 hover:bg-agri-50 border border-slate-200 transition-colors"
              title={t.backendApiServer}
              aria-label={t.backendApiServer}
            >
              <Server className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
            </button>

            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-700 hover:text-agri-800 hover:bg-agri-50 border border-slate-200 transition-colors"
              title={t.openAlerts}
              aria-label={t.openAlerts}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Farmer Profile Badge */}
            <div className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-agri-100/90 border border-agri-300 text-agri-950">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-agri-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-black text-agri-950 leading-tight truncate max-w-[100px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-agri-800 font-bold truncate max-w-[100px]">
                  {user.farmSize} {user.farmUnit}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
      <ServerEndpointModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
      />
    </header>
  );
};
