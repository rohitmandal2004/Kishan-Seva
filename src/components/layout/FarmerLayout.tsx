import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, MapPin, CalendarClock, Ticket, Bell, LogOut, PhoneCall,
  User, CreditCard, BookOpen, HelpCircle, ShieldCheck, Leaf, Sun, CheckCircle2, Droplets, ArrowDownToLine, Menu, X
} from 'lucide-react';
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications = store.getNotificationsForFarmer(farmer?.id, user?.email);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('[Kishan Seva] Error signing out:', err);
    }
    navigate('/farmer/login', { replace: true });
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/farmer/dashboard' },
    { icon: CalendarClock, label: 'Book Slot', path: '/farmer/book' },
    { icon: Ticket, label: 'Live Queue', path: '/farmer/queue', badge: activeBooking ? 'Active' : undefined },
    { icon: MapPin, label: 'Procurement Centres', path: '/farmer/centres' },
    { icon: BookOpen, label: 'My Bookings', path: '/farmer/bookings' },
    { icon: CreditCard, label: 'Payments', path: '/farmer/payments' },
    { icon: User, label: 'My Profile', path: '/farmer/profile' },
    { icon: Bell, label: 'Notifications', path: '/farmer/notifications', count: 2 },
    { icon: HelpCircle, label: 'Help & Support', path: '/farmer/support' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen md:h-screen md:overflow-hidden pb-20 md:pb-0 flex flex-col font-sans relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white/95 backdrop-blur-md px-3.5 py-2.5 flex justify-between items-center sticky top-0 z-40 border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="p-1 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs shrink-0">
            <img src="/logo.svg" alt="Kishan Seva" className="h-9 w-9 object-contain" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-[#143d23] text-sm leading-none block truncate">Kishan <span className="text-emerald-600">Seva</span></span>
            <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{farmer?.full_name || t('role_farmer_title')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
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
        <aside className="hidden md:flex w-56 lg:w-64 shrink-0 flex-col bg-[#0A2E1A] text-white h-full overflow-y-auto shadow-2xl relative z-50 border-r border-emerald-950">
          <div className="px-5 py-6 flex items-center gap-3">
            <img src="/logo.svg" alt="Kishan Seva" className="h-10 w-10 object-contain drop-shadow-md" />
            <div>
              <span className="font-black text-white text-lg tracking-tight leading-tight block">Kishan Seva</span>
              <p className="text-emerald-400 text-[10px] font-bold tracking-wide">Farmer Portal</p>
              <p className="text-slate-300 text-[8px] leading-tight mt-1">Empowering Farmers<br/>A Better Tomorrow</p>
            </div>
          </div>

          {/* Farmer Profile Snippet */}
          <div className="mx-4 mb-4 p-3 rounded-2xl border border-white/10 bg-white/5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-emerald-400 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                {farmer?.full_name ? farmer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'KS'}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-white truncate">{farmer?.full_name || user?.email || 'Farmer'}</p>
                <p className="text-[10px] text-emerald-300/80 font-mono truncate">{farmer?.farmer_code || '—'}</p>
              </div>
            </div>
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[10px] text-slate-300">Land: <strong className="text-white">{farmer?.land_area_acres || 0} Acres</strong></span>
              <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>
            {/* Background pattern */}
            <Leaf className="absolute -bottom-4 -right-2 w-16 h-16 text-white/5" />
          </div>
          
          <div className="flex-1 px-3 space-y-0.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-emerald-800/60 text-emerald-400 font-bold border border-emerald-700/50' 
                      : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {item.count && (
                    <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/5 mt-2">
            {/* Promo Banner */}
            <div className="mt-2 rounded-xl overflow-hidden relative border border-emerald-900/50 shadow-inner h-24">
              <img src="/sidebar-promo.jpg" alt="Promo" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A2E1A] via-[#0A2E1A]/60 to-transparent"></div>
              <div className="absolute bottom-2 left-2 flex items-center gap-2 z-10">
                <img src="/logo.svg" className="w-5 h-5 opacity-90" />
                <span className="text-[10px] font-bold text-emerald-100 leading-tight drop-shadow-md">भारत का किसान<br/>देश की शान</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 md:overflow-y-auto flex flex-col relative bg-[#F5F8F6]">
          {/* Desktop Top Bar */}
          <div className="hidden md:flex bg-white/95 backdrop-blur-md px-6 py-3 border-b border-slate-200 sticky top-0 z-40 items-center justify-between shadow-xs">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button className="text-emerald-800 hover:bg-emerald-50 p-2 rounded-lg transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Good Morning,</p>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-black text-slate-900 leading-none">
                    Namaste, {farmer?.full_name?.split(' ')[0]} 🙏
                  </h1>
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Farmer
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-1">
                  Farmer Code: <span className="font-mono text-slate-900">{farmer?.farmer_code || 'N/A'}</span> <span className="text-slate-300 mx-1">|</span> Village: {farmer?.village || 'Not set'}, {farmer?.district || 'India'}
                </p>
              </div>
            </div>

            {/* Weather Widget */}
            <div className="flex items-center gap-4 bg-slate-50/80 px-4 py-2 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
                <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />
                <div>
                  <p className="text-lg font-black text-slate-900 leading-none">28°C</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Clear Sky</p>
                </div>
                <div className="flex flex-col gap-0.5 ml-2">
                  <span className="text-[9px] text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {farmer?.district || 'India'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-[10px] font-semibold text-slate-600">
                <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-blue-500" /> Humidity 42%</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Good for Harvesting</span>
                <span className="flex items-center gap-1.5"><ArrowDownToLine className="w-3.5 h-3.5 text-emerald-700" /> Grade A (14% Moisture)</span>
              </div>
            </div>

            {/* Right side (Profile & Notifications) */}
            <div className="flex items-center gap-4 ml-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><title>Bell Ring</title><g><animateTransform attributeName="transform" type="rotate" values="0 12 5;10 12 5;-10 12 5;7 12 5;-5 12 5;2 12 5;0 12 5;0 12 5" keyTimes="0;0.05;0.12;0.19;0.26;0.33;0.42;1" dur="2.6s" repeatCount="indefinite"></animateTransform><path d="M18 9.6a6 6 0 1 0-12 0c0 4.4-1.5 5.5-1.9 6.1a.6.6 0 0 0 .5.9h14.8a.6.6 0 0 0 .5-.9c-.4-.6-1.9-1.7-1.9-6.1Z"></path></g><path d="M10.1 19.6a2.2 2.2 0 0 0 3.8 0"><animateTransform attributeName="transform" type="rotate" values="0 12 17;14 12 17;-14 12 17;10 12 17;-7 12 17;3 12 17;0 12 17;0 12 17" keyTimes="0;0.07;0.15;0.22;0.29;0.36;0.45;1" dur="2.6s" repeatCount="indefinite"></animateTransform></path></svg>
                </button>
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-xs text-emerald-600 font-semibold hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm font-medium">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-emerald-50/30' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-sm text-slate-900">{n.title}</span>
                              <span className="text-[10px] text-slate-400 font-medium">Recently</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-tight">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <Link to="/farmer/dashboard" onClick={() => setShowNotifications(false)} className="block p-2 text-center text-xs font-bold text-emerald-700 bg-slate-50 hover:bg-slate-100 transition-colors">
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>
              <div className="relative">
                <div 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 py-1.5 px-2 rounded-full border border-slate-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0A2E1A] text-white font-bold flex items-center justify-center text-xs">
                    {farmer?.full_name ? farmer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'KS'}
                  </div>
                  <svg className="w-4 h-4 text-slate-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                      <div className="w-10 h-10 rounded-full bg-[#0A2E1A] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {farmer?.full_name ? farmer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'KS'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 truncate">{farmer?.full_name || 'Farmer'}</p>
                        <p className="text-xs text-slate-500 truncate">{farmer?.farmer_code || user?.email || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="p-2 space-y-1">
                      <Link to="/farmer/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors">
                        <User className="w-4 h-4" />
                        Update Profile
                      </Link>
                      
                      <div className="px-3 py-2">
                        <span className="text-xs text-slate-400 font-semibold mb-1.5 block">Language / भाषा</span>
                        <LanguageSelector variant="dropdown" className="w-full text-slate-700 bg-slate-50 border-slate-200" />
                      </div>
                      
                      <div className="h-px bg-slate-100 my-1"></div>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-left">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Kishan Seva" className="h-8 w-8 object-contain" />
                <span className="font-extrabold text-[#143d23] text-sm">Kishan Seva</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm">
                {farmer?.full_name ? farmer.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'KS'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{farmer?.full_name || 'Farmer'}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{farmer?.farmer_code || '—'}</p>
              </div>
            </div>
            <div className="flex-1 py-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors ${
                      isActive 
                        ? 'text-emerald-700 bg-emerald-50/80 border-r-4 border-emerald-600' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.count && (
                      <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t border-slate-100">
              <LanguageSelector variant="dropdown" className="w-full mb-4" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation with Enhanced Touch Targets & Active Indicator */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 grid grid-cols-4 items-center px-1 py-1 pb-[max(0.6rem,env(safe-area-inset-bottom))] z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {navItems.slice(0, 4).map((item) => {
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
