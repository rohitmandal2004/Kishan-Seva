import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, Users, Truck, LogOut, 
  Settings, Power, BarChart3, Menu, X, ShieldCheck
} from 'lucide-react';
import { useSupabase } from '@/context/SupabaseContext';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, signOut } = useSupabase();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('[Kishan Seva] Error signing out:', err);
    }
    navigate('/roles', { replace: true });
  };

  const navItems = [
    { icon: BarChart3, label: 'Overview', path: '/admin/dashboard' },
    { icon: Building2, label: 'Mandi Management', path: '/admin/centres' },
    { icon: Truck, label: 'Slot & Capacity', path: '/admin/slots' },
    { icon: ShieldCheck, label: 'Audit Logs', path: '/admin/transactions' },
    { icon: Users, label: 'Operators', path: '/admin/operators' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen md:h-screen md:overflow-hidden pb-20 md:pb-0 flex flex-col font-sans relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white px-3.5 py-2.5 flex justify-between items-center sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 -ml-1 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="p-1 rounded-2xl bg-white/10 border border-white/20 shadow-xs shrink-0">
            <img src="/logo.svg" alt="Kishan Seva" className="h-9 w-9 object-contain" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-white text-sm leading-none block truncate">Kishan Seva</span>
            <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">State Admin Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <LanguageSelector variant="compact" />
          <button 
            onClick={handleLogout}
            type="button"
            className="p-2 rounded-full hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row w-full md:overflow-hidden">
        {/* Desktop & Tablet Sidebar */}
        <aside className="hidden md:flex w-56 lg:w-64 shrink-0 flex-col bg-slate-900 text-white h-full overflow-y-auto shadow-2xl relative z-50 border-r border-slate-800">
          <div className="px-5 py-6 flex items-center gap-3">
            <img src="/logo.svg" alt="Kishan Seva" className="h-10 w-10 object-contain drop-shadow-md" />
            <div>
              <span className="font-black text-white text-lg tracking-tight leading-tight block">Kishan Seva</span>
              <p className="text-slate-400 text-[10px] font-bold tracking-wide">State Admin</p>
            </div>
          </div>

          <div className="mx-4 mb-4 p-3 rounded-2xl border border-white/10 bg-white/5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-indigo-400 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                SA
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-white truncate">Admin User</p>
                <p className="text-[10px] text-indigo-300/80 font-mono truncate">{user?.email || 'admin@wb.gov.in'}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Menu</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative overflow-hidden ${
                    isActive 
                      ? 'text-white shadow-md bg-indigo-600' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
          <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 items-center justify-between px-6 shrink-0 shadow-xs z-10">
            <div className="flex items-center gap-3">
              <h1 className="font-extrabold text-slate-900 text-lg">
                {navItems.find(n => n.path === currentPath)?.label || 'State Admin Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSelector variant="dropdown" className="border-slate-200" />
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              <Button onClick={handleLogout} variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold text-sm">
                <Power className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-around items-center px-1.5 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center py-1.5 px-2.5 rounded-2xl transition-all duration-200 min-w-[64px] relative ${
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${isActive ? 'bg-indigo-600 shadow-md' : 'bg-transparent'}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
              </div>
              <span className={`text-[9px] mt-1 font-semibold ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-72 max-w-[80vw] bg-slate-900 h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-left">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Kishan Seva" className="h-8 w-8 object-contain" />
                <span className="font-extrabold text-white text-sm">Kishan Seva</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-slate-400 hover:bg-slate-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm">
                SA
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">Admin User</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email || 'admin@wb.gov.in'}</p>
              </div>
            </div>
            
            <div className="flex-1 py-4 overflow-y-auto">
              <p className="px-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-colors ${
                      isActive 
                        ? 'text-white bg-indigo-600/20 border-r-4 border-indigo-500' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-slate-800">
              <LanguageSelector variant="dropdown" className="w-full mb-4" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
