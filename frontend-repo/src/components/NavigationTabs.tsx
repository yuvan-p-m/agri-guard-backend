import React from 'react';
import { 
  Sprout, 
  History, 
  CloudRain, 
  Store,
  Cpu,
  UserRound
} from 'lucide-react';

export type DashboardTab = 'diagnosis' | 'history' | 'weather' | 'iot' | 'store' | 'profile';

interface NavigationTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  unreadSmsCount: number;
  cartItemsCount: number;
  isMobileOpen: boolean;
  onCloseMobileNav: () => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  unreadSmsCount,
  cartItemsCount,
  isMobileOpen,
  onCloseMobileNav,
}) => {
  const tabs: { id: DashboardTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'diagnosis',
      label: 'Crop Diagnosis',
      icon: <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-[#4ADE80]" />,
    },
    {
      id: 'history',
      label: 'History & Feedback',
      icon: <History className="w-4 h-4 sm:w-5 sm:h-5 text-[#A16207]" />,
    },
    {
      id: 'weather',
      label: 'Weather Forecast',
      icon: <CloudRain className="w-4 h-4 sm:w-5 sm:h-5 text-[#0284C7]" />,
    },
    {
      id: 'iot',
      label: 'IoT Live Sensors',
      icon: <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />,
    },
    {
      id: 'store',
      label: 'Agri-Store (Supplies)',
      icon: <Store className="w-4 h-4 sm:w-5 sm:h-5 text-[#991B1B]" />,
      badge: cartItemsCount > 0 ? cartItemsCount : undefined,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserRound className="w-4 h-4 sm:w-5 sm:h-5 text-[#475569]" />,
    },
  ];

  return (
    <>
      {/* Desktop: Fixed left navigation rail */}
      <aside className="hidden md:flex fixed left-0 top-[72px] bottom-0 z-[90] w-64 flex-col border-r border-white/30 bg-transparent px-4 py-6 shadow-2xl">
        <div className="mb-5 px-2">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">Farm Command Center</p>
          <p className="mt-1 text-sm font-extrabold text-white">Dashboard Navigation</p>
        </div>
        <nav className="flex flex-col gap-2" aria-label="Dashboard Navigation">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex min-h-12 items-center justify-between gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-left text-sm font-extrabold transition-all whitespace-nowrap relative ${
                    isActive
                      ? 'border-agri-600 bg-[#2D6A4F] text-white shadow-lg shadow-agri-950/20'
                      : 'border-white/40 bg-white/50 text-[#1B4332] shadow-md shadow-agri-950/10 backdrop-blur-[10px] hover:bg-white/70'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    {tab.icon}
                    <span className="truncate">{tab.label}</span>
                  </span>
                  {tab.badge !== undefined && (
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white text-[#1B4332]' : 'bg-rose-500 text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/30 bg-white/20 p-3 text-[11px] font-semibold leading-relaxed text-white/80 backdrop-blur-[10px]">
          Live field intelligence for healthier, more productive crops.
        </div>
      </aside>

      {/* Mobile nav drawer */}
      <div className={`md:hidden fixed inset-0 z-[120] transition-all duration-300 ${isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <button
          type="button"
          aria-label="Close navigation drawer"
          className={`absolute inset-0 bg-slate-950/45 transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onCloseMobileNav}
        />

        <div className={`absolute left-0 top-0 h-full w-[82%] max-w-xs border-r border-white/20 bg-white/85 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-agri-600 to-agri-800 text-white shadow-md">
                <Sprout className="h-4 w-4 text-citrus-300" />
              </div>
              <div>
                <p className="text-lg font-black text-agri-950">Agri<span className="text-agri-600">Guard</span></p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseMobileNav}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white font-black text-slate-700"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-2" aria-label="Mobile Dashboard Navigation">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-extrabold transition-all ${
                    isActive
                      ? 'border-agri-600 bg-agri-700 text-white shadow-lg shadow-agri-900/20'
                      : 'border-white/50 bg-white/80 text-slate-800 shadow-sm hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </span>
                  {tab.badge !== undefined && (
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white text-agri-800' : 'bg-rose-500 text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-agri-200 bg-agri-50/80 p-3 text-[11px] font-semibold leading-relaxed text-agri-900">
            Live field intelligence for healthier, more productive crops.
          </div>
        </div>
      </div>

      {/* Mobile: Bottom Fixed Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-2xl py-1.5 px-2">
        <div className="grid grid-cols-6 gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-agri-900 font-black bg-agri-100/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  <span className={isActive ? 'text-agri-700' : 'text-slate-500'}>
                    {tab.icon}
                  </span>
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] mt-1 truncate max-w-full font-bold leading-tight">
                  {tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
