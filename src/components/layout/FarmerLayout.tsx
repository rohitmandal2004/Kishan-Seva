import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, MapPin, CalendarClock, Bell, User } from 'lucide-react';

export default function FarmerLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: Home, label: 'Home', path: '/farmer/dashboard' },
    { icon: MapPin, label: 'Centres', path: '/farmer/centres' },
    { icon: CalendarClock, label: 'Bookings', path: '/farmer/bookings' },
    { icon: Bell, label: 'Notifications', path: '/farmer/notifications' },
    { icon: User, label: 'Profile', path: '/farmer/profile' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20 md:pb-0 flex flex-col">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white px-4 py-3 flex justify-between items-center sticky top-0 z-10 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white">
            KS
          </div>
          <span className="font-bold text-slate-800">Kishan Seva</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-slate-600" />
          </div>
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-sm">
            RM
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:flex w-64 flex-col bg-white border-r h-[calc(100vh)] sticky top-0 pt-6">
          <div className="px-6 mb-8 flex items-center gap-2 text-green-700">
            <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white">KS</div>
            <span className="font-bold text-xl">Kishan Seva</span>
          </div>
          
          <div className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 w-full relative">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center px-2 py-2 z-50 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg min-w-[64px] transition-colors ${isActive ? 'text-green-700' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-green-100' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
