import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Scale, FileCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMockStore } from '@/services/useMockStore';
import { useLanguage } from '@/services/i18n';
import { LanguageSelector } from '@/components/ui/language-selector';

export default function OperatorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const store = useMockStore();
  const { t } = useLanguage();

  const waitingCount = store.getBookings().filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length;

  const navItems = [
    { icon: LayoutDashboard, label: t('nav_dashboard'), path: '/operator/dashboard' },
    { icon: Users, label: t('queue_management'), path: '/operator/queue', badge: waitingCount },
    { icon: FileCheck, label: t('moisture_assay'), path: '/operator/quality' },
    { icon: Scale, label: t('weighbridge_tab'), path: '/operator/weighment' },
  ];

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col md:flex-row font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#0a192f] text-white px-4 py-2.5 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-2xl bg-white/10 border border-white/20">
            <img src="/logo.svg" alt="Kishan Seva" className="h-11 w-11 object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base leading-tight block">Kishan Seva</span>
            <p className="text-[10px] text-blue-300 font-semibold">{t('role_operator_title')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector variant="compact" />
          <Link to="/roles">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 text-xs h-8 px-2">
              <LogOut className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className="w-64 bg-[#0a192f] text-slate-300 flex flex-col hidden md:flex shrink-0 h-screen sticky top-0 border-r border-slate-800 shadow-xl">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 text-white mb-2">
            <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
              <img src="/logo.svg" alt="Kishan Seva" className="h-14 w-14 object-contain" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight leading-none block">Kishan Seva</span>
              <span className="text-[10px] text-blue-400 font-bold tracking-wider uppercase mt-1 block">
                {t('role_operator_title')}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-white/5 border-b border-white/10">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Station Centre</p>
          <p className="font-bold text-xs text-white mt-0.5">Krishnapur Centre (KSP-001)</p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Electronic Weighbridge Active</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.badge !== undefined && (
                  <span className="ml-auto px-2 py-0.5 bg-blue-500/30 text-blue-200 text-[10px] font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-slate-400 font-semibold">Language / ভাষা</span>
            <LanguageSelector variant="compact" />
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={() => navigate('/roles')}
          >
            <LogOut className="w-4 h-4 mr-2.5" />
            {t('nav_switch_role')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 shadow-xs">
          <h1 className="font-extrabold text-slate-900 text-base">
            {navItems.find(n => n.path === currentPath)?.label || t('operator_console_title')}
          </h1>
          <div className="flex items-center gap-4">
            <LanguageSelector variant="compact" />
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">Ramesh Kumar</p>
              <p className="text-[10px] text-slate-400 font-mono">Senior Weighbridge Officer (EMP-421)</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 text-blue-800 font-extrabold text-xs flex items-center justify-center shadow-xs">
              RK
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50/60 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Bar for Operators */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center px-2 py-2 z-40 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${isActive ? 'text-blue-700 font-bold' : 'text-slate-400'}`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[9px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
