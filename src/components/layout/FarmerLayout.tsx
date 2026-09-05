import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MapPin, CalendarClock, Ticket, Bell, LogOut, Sun, PhoneCall } from 'lucide-react';
import { useMockStore } from '@/services/useMockStore';
import { useSupabase } from '@/context/SupabaseContext';
import { useLanguage } from '@/services/i18n';
import { LanguageSelector } from '@/components/ui/language-selector';

export default function FarmerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, farmer, signOut } = useSupabase();
  const currentPath = location.pathname;
  const store = useMockStore();
  const activeBooking = store.getActiveFarmerBookingForFarmer(farmer, user?.email, user?.id);
  const { t } = useLanguage();
  const [sunlightMode, setSunlightMode] = useState(false);

  const toggleSunlightMode = () => {
    setSunlightMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('sunlight-mode');
      } else {
        document.documentElement.classList.remove('sunlight-mode');
      }
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('[Kishan Seva] Error signing out:', err);
    }
    navigate('/farmer/login', { replace: true });
  };

  const navItems = [
    { icon: Home, label: t('nav_dashboard'), path: '/farmer/dashboard' },
    { icon: CalendarClock, label: t('nav_book_slot'), path: '/farmer/book' },
    { icon: Ticket, label: t('nav_live_queue'), path: '/farmer/queue', badge: activeBooking ? 'Active' : undefined },
    { icon: MapPin, label: t('nav_centres'), path: '/farmer/centres' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen md:h-screen md:overflow-hidden pb-20 md:pb-0 flex flex-col font-sans relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white/95 backdrop-blur-md px-3.5 py-2.5 flex justify-between items-center sticky top-0 z-40 border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs shrink-0">
            <img src="/logo.svg" alt="Kishan Seva" className="h-9 w-9 object-contain" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-[#143d23] text-sm leading-none block truncate">Kishan <span className="text-emerald-600">Seva</span></span>
            <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{farmer?.full_name || t('role_farmer_title')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleSunlightMode}
            type="button"
            className={`p-2 rounded-full transition-colors ${sunlightMode ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-100 text-slate-600'}`}
            title="Toggle Outdoor High-Contrast Sunlight Mode"
          >
            <Sun className="w-4 h-4" />
          </button>
          <LanguageSelector variant="compact" />
          <Link to="/farmer/queue" className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors" title="Live Queue">
            <Bell className="w-5 h-5" />
            {activeBooking && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
            )}
          </Link>
          <button 
            onClick={handleLogout}
            type="button"
            className="p-2 rounded-full hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row w-full md:overflow-hidden">
        {/* Desktop & Tablet Sidebar */}
        <aside className="hidden md:flex w-56 lg:w-64 shrink-0 flex-col bg-[#0f2e1b] text-white h-full overflow-y-auto border-r border-emerald-900/60 shadow-xl">
          <div className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
            <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
              <img src="/logo.svg" alt="Kishan Seva" className="h-14 w-14 object-contain" />
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight leading-tight block">Kishan Seva</span>
              <p className="text-emerald-300 text-[10px] font-bold tracking-wide">{t('role_farmer_title')}</p>
            </div>
          </div>

          {/* Farmer Profile Snippet */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                {farmer?.full_name ? farmer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'KS'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{farmer?.full_name || user?.email || 'Farmer'}</p>
                <p className="text-[10px] text-emerald-300/80 font-mono truncate">{farmer?.farmer_code || '—'}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between text-[10px] text-emerald-200">
              <span>Land: <strong>{farmer?.land_area_acres || 0} Acres</strong></span>
              <span className={`font-semibold ${farmer?.verification_status === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>● {farmer?.verification_status === 'VERIFIED' ? 'Verified' : 'Pending'}</span>
            </div>
          </div>
          
          <div className="flex-1 px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40' 
                      : 'text-emerald-100/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-emerald-300 font-semibold">Language / भाषा</span>
              <LanguageSelector variant="compact" />
            </div>

            <button
              onClick={toggleSunlightMode}
              type="button"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                sunlightMode 
                  ? 'bg-amber-400 text-slate-950 font-bold' 
                  : 'bg-white/5 hover:bg-white/10 text-emerald-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5" />
                <span>Sunlight Mode (धूप)</span>
              </span>
              <span className="text-[10px] uppercase font-mono">{sunlightMode ? 'ON' : 'OFF'}</span>
            </button>

            <button 
              onClick={handleLogout}
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-200/90 hover:bg-red-500/20 hover:text-white transition-all cursor-pointer text-left group"
              title="Sign out of Farmer Portal"
            >
              <LogOut className="w-4 h-4 text-red-300 group-hover:text-red-200 transition-colors" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 md:overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating 1-Tap Toll-Free Kisan Call Centre Helpline */}
      <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40">
        <a
          href="tel:18001801551"
          className="flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full bg-[#143d23] hover:bg-[#0f2e1b] text-white shadow-xl border border-emerald-400/40 text-[11px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 group backdrop-blur-md"
          title="Toll-Free Kisan Call Centre Helpline (1800-180-1551)"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300">
            <PhoneCall className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-bounce" />
          </div>
          <span className="hidden sm:inline">Kisan Helpline:</span>
          <span className="font-mono text-amber-300 font-black">1800-180-1551</span>
          <span className="text-[9px] bg-emerald-700/60 px-1.5 py-0.5 rounded text-emerald-200 font-semibold">TOLL-FREE</span>
        </a>
      </div>

      {/* Mobile Bottom Navigation with Enhanced Touch Targets & Active Indicator */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 grid grid-cols-4 items-center px-1 py-1 pb-[max(0.6rem,env(safe-area-inset-bottom))] z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all relative select-none ${
                isActive 
                  ? 'text-emerald-800 bg-emerald-50/80 font-bold' 
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-700' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[72px] text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
