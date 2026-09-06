import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { useMockStore } from '@/services/useMockStore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSupabase } from '@/context/SupabaseContext';
import { Skeleton } from '@/components/ui/skeleton';

import { greenMapIcon, orangeMapIcon } from '@/lib/leaflet-icons';

export default function AdminOverview() {
  const store = useMockStore();
  const westBengalCenter: [number, number] = [22.9868, 87.8550];

  const centres = store.getCentres();
  const stats = store.getStats();

  const { isProfileLoading } = useSupabase();

  if (isProfileLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 pt-12">
        <Skeleton className="h-16 w-1/3 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Top Command Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Apex State Command Console</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">State Agricultural Procurement Command</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live real-time monitoring across {centres.length} procurement centres in West Bengal.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></div> Live Monitoring Active
          </Badge>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <Card className="p-4 sm:p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Procured Today</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalProcuredQuintals.toLocaleString('en-IN')}</h3>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">Q</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs target
          </p>
        </Card>

        <Card className="p-4 sm:p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Mandis</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{stats.activeCentres}</h3>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">/ {centres.length} Mandis</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-purple-600 font-semibold mt-2 truncate">
            ● Computerized Scales Active
          </p>
        </Card>

        <Card className="p-4 sm:p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicles In Yard</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{stats.inQueueCount}</h3>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">Tokens</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-blue-600 font-semibold mt-2 truncate">
            ● Continuous Processing
          </p>
        </Card>

        <Card className="p-4 sm:p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total DBT Disbursed</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">₹{stats.totalDisbursedCrores}</h3>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">Cr</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-2 truncate">
            ● Direct to Aadhaar Bank
          </p>
        </Card>
      </div>

      <div className="space-y-6">
        {/* State-wide Live Map */}
        <Card className="p-1 border border-slate-200 bg-white rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Live State Procurement Map</h3>
              <p className="text-xs text-slate-500">Real-time status of all designated Mandis</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Active</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span> High Traffic</span>
            </div>
          </div>
          <div className="h-[400px] w-full bg-slate-100 relative z-0">
            <MapContainer 
              center={westBengalCenter} 
              zoom={8} 
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {centres.map((c) => (
                <Marker 
                  key={c.id}
                  position={[c.latitude, c.longitude]}
                  icon={c.status === 'ACTIVE' ? greenMapIcon : orangeMapIcon}
                >
                  <Popup>
                    <div className="font-sans p-1 min-w-[200px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {c.centre_code}
                        </span>
                        <Badge className={`text-[9px] border-0 font-bold ${
                          c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {c.status}
                        </Badge>
                      </div>
                      <p className="font-bold text-sm text-slate-900 leading-tight">{c.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{c.address}, {c.district}</p>
                      
                      <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] bg-slate-50 p-2 rounded border border-slate-100 text-center">
                        <div><p className="text-slate-400 font-semibold mb-0.5">Queue</p><p className="font-bold text-slate-900">{c.current_queue_length} Veh</p></div>
                        <div className="border-l border-slate-200"><p className="text-slate-400 font-semibold mb-0.5">Capacity</p><p className="font-bold text-slate-900">{c.daily_capacity_quintals} Q</p></div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* District Target vs Actuals */}
          <div className="lg:col-span-2">
            <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-xs">
              <h3 className="font-extrabold text-slate-900 text-sm mb-4">District-Wise Procurement Fulfillment (2026 Target)</h3>
              
              <div className="space-y-4">
                {[
                  { district: 'North 24 Parganas', target: '50,000 Q', actual: '42,500 Q', percent: 85, color: 'bg-emerald-600' },
                  { district: 'South 24 Parganas', target: '40,000 Q', actual: '36,800 Q', percent: 92, color: 'bg-emerald-600' },
                  { district: 'Burdwan (East)', target: '80,000 Q', actual: '74,400 Q', percent: 93, color: 'bg-emerald-600' },
                  { district: 'Hooghly', target: '35,000 Q', actual: '26,250 Q', percent: 75, color: 'bg-amber-500' },
                  { district: 'Nadia', target: '30,000 Q', actual: '25,500 Q', percent: 85, color: 'bg-emerald-600' },
                  { district: 'Murshidabad', target: '45,000 Q', actual: '37,000 Q', percent: 82, color: 'bg-emerald-600' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">{item.district}</span>
                      <span className="text-slate-500">{item.actual} / {item.target} ({item.percent}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Live Mandi Feed */}
          <div>
            <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-xs h-full">
              <h3 className="font-extrabold text-slate-900 text-sm mb-3">Live Mandi Operations Feed</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="font-bold text-emerald-900">Weighbridge Certified: KSP-1040</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">50.0 Quintals Paddy • DBT Payout ₹1,08,700 dispatched.</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="font-bold text-blue-900">Moisture Lab Certified: KSP-1042</p>
                  <p className="text-[11px] text-blue-700 mt-0.5">Grade A (13.8% moisture) recorded by Inspector Das.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">New Slot Booked: Habra Depot</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Scheduled for 11:00 AM tomorrow (Mustard harvest).</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
