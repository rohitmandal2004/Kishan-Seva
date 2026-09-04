import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Scale, FileCheck, Settings, LogOut, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OperatorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/operator/dashboard' },
    { icon: Users, label: 'Queue Management', path: '/operator/queue' },
    { icon: FileCheck, label: 'Quality Checks', path: '/operator/quality' },
    { icon: Scale, label: 'Weighment', path: '/operator/weighment' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-[#0a192f] text-slate-300 flex flex-col hidden md:flex shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 text-white mb-2">
            <Building2 className="w-8 h-8 text-blue-400" />
            <span className="font-bold text-xl tracking-tight">Kishan Seva</span>
          </div>
          <div className="text-xs text-blue-400/80 font-medium tracking-wider uppercase">Operator Portal</div>
        </div>

        <div className="px-6 py-4 border-b border-white/10 mb-6">
          <p className="text-sm text-slate-400">Centre</p>
          <p className="font-semibold text-white">Krishnapur (KSP-001)</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white font-medium shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-8 shrink-0">
          <h1 className="font-bold text-slate-800 text-lg">
            {navItems.find(n => n.path === currentPath)?.label || 'Operator Portal'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">Ramesh Kumar (EMP-421)</span>
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
              RK
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50/50 relative">
          <Outlet />
        </main>
      </div>

      {/* Mobile Nav Warning (Simplified for demo) */}
      <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
        <Building2 className="w-16 h-16 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Desktop Required</h2>
        <p className="text-slate-500">The Operator Portal is designed for tablet and desktop interfaces used at procurement centres.</p>
        <Button className="mt-8" onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    </div>
  );
}
