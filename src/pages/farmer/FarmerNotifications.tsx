import { Card } from '@/components/ui/card';
import { useMockStore } from '@/services/useMockStore';
import { useSupabase } from '@/context/SupabaseContext';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function FarmerNotifications() {
  const store = useMockStore();
  const { farmer, user } = useSupabase();
  const notifications = store.getNotificationsForFarmer(farmer?.id, user?.email);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Updates on your slot bookings, quality checks, and DBT payments.</p>
        </div>
        <button className="text-emerald-700 text-xs font-bold hover:underline flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" /> Mark all as read
        </button>
      </div>

      <Card className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">You have no new notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(n => (
              <div key={n.id} className={`p-4 md:p-5 flex items-start gap-4 transition-colors ${!n.read ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}`}>
                <div className={`p-2 rounded-full mt-1 ${!n.read ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm ${!n.read ? 'font-black text-emerald-950' : 'font-bold text-slate-800'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">Just now</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
