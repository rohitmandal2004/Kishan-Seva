import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, MapPin, CalendarClock, Ticket, Bell, LogOut } from 'lucide-react';
import { useMockStore } from '@/services/useMockStore';
import { useLanguage } from '@/services/i18n';
import { LanguageSelector } from '@/components/ui/language-selector';
import { SupabaseStatusBadge } from '@/components/ui/supabase-status-dialog';

export default function FarmerLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const store = useMockStore();
  const farmer = store.getFarmer();
  const activeBooking = store.getActiveFarmerBooking();
  const { t } = useLanguage();

  // Route guard: must be logged in as farmer
  const session = store.getSession();
  if (!session.isLoggedIn || session.role !== 'FARMER') {
    return <Navigate to="/farmer/login" replace />;
  }
  // Must be registered (have a farmer profile)
  if (!farmer || !farmer.id) {
    return <Navigate to="/farmer/register" replace />;
  }

  const navItems = [
    { icon: Home, label: t('nav_dashboard'), path: '/farmer/dashboard' },
    { icon: CalendarClock, label: t('nav_book_slot'), path: '/farmer/book' },
    { icon: Ticket, label: t('nav_live_queue'), path: '/farmer/queue', badge: activeBooking ? 'Active' : undefined },
    { icon: MapPin, label: t('nav_centres'), path: '/farmer/centres' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen md:h-screen md:overflow-hidden pb-20 md:pb-0 flex flex-col font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white px-3 sm:px-4 py-2.5 flex justify-between items-center sticky top-0 z-40 border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="p-1 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs shrink-0">
            <img src="/logo.svg" alt="Kishan Seva" className="h-9 w-9 sm:h-11 sm:w-11 object-contain" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-[#143d23] text-sm sm:text-base leading-none block truncate">Kishan <span className="text-emerald-600">Seva</span></span>
            <p className="text-[10px] text-slate-400 font-semibold truncate">{t('role_farmer_title')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <SupabaseStatusBadge />
          <LanguageSelector variant="compact" />
          <Link to="/farmer/queue" className="relative p-1.5 rounded-full hover:bg-slate-100 text-slate-600" title="Live Queue">
            <Bell className="w-5 h-5" />
            {activeBooking && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-ping"></div>}
          </Link>
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
                {farmer.full_name ? farmer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'KS'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{farmer.full_name || 'Farmer'}</p>
                <p className="text-[10px] text-emerald-300/80 font-mono truncate">{farmer.farmer_code || '—'}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between text-[10px] text-emerald-200">
              <span>Land: <strong>{farmer.land_area_acres || 0} Acres</strong></span>
              <span className={`font-semibold ${farmer.verification_status === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>● {farmer.verification_status === 'VERIFIED' ? 'Verified' : 'Pending'}</span>
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
              <span className="text-[11px] text-emerald-300 font-semibold">Language / ভাষা</span>
              <LanguageSelector variant="compact" />
            </div>
            <Link 
              to="/roles" 
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-emerald-200/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('nav_switch_role')}
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 md:overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-40 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors relative min-w-[60px] ${isActive ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              {item.badge && (
                <div className="absolute top-0.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              )}
              {isActive && <div className="w-1.5 h-1.5 bg-emerald-700 rounded-full mt-0.5"></div>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
