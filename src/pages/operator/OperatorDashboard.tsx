import { Card } from '@/components/ui/card';
import { Users, Truck, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function OperatorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      {/* Date & Quick Status */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Today's Overview</h2>
          <p className="text-slate-500">3 October 2026 • Slot 2 (10:00 AM - 11:00 AM)</p>
        </div>
        <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-semibold text-sm tracking-wide uppercase">Queue Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-0 shadow-sm bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Queue</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-1">28</h3>
          <p className="text-sm text-slate-500">Farmers currently waiting</p>
        </Card>
        
        <Card className="p-6 border-0 shadow-sm bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Processed</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-1">112</h3>
          <p className="text-sm text-slate-500">Farmers processed today</p>
        </Card>
        
        <Card className="p-6 border-0 shadow-sm bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Procured</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-1">1,450</h3>
          <p className="text-sm text-slate-500">Quintals total procured</p>
        </Card>

        <Card className="p-6 border-0 shadow-sm bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Time</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-1">4.2m</h3>
          <p className="text-sm text-slate-500">Per farmer processing</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Action Area */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Current Queue Status</h3>
          <Card className="p-0 border-0 shadow-sm bg-white overflow-hidden mb-6">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Currently Serving</p>
                <div className="flex items-baseline gap-4">
                  <h4 className="text-4xl font-black text-green-400 font-mono tracking-wider">KSP-1034</h4>
                  <span className="text-xl text-slate-300">Ramesh Singh</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Stage</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                  Weighment
                </span>
              </div>
            </div>
            <div className="p-6 flex justify-between items-center bg-slate-800">
              <p className="text-slate-300 font-medium">Waiting next: <span className="text-white font-bold ml-1">KSP-1035 (Sunil Das)</span></p>
              <Button className="bg-blue-600 hover:bg-blue-700 font-bold px-8" onClick={() => navigate('/operator/queue')}>
                Manage Queue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Alerts & Notifications */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4">System Alerts</h3>
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <div className="divide-y divide-slate-100">
              <div className="p-4 flex gap-3">
                <div className="text-amber-500 shrink-0 mt-0.5"><AlertTriangle className="w-5 h-5"/></div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Capacity Warning</p>
                  <p className="text-xs text-slate-500 mb-1">Godown A is reaching 90% capacity for Paddy.</p>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">10 mins ago</span>
                </div>
              </div>
              <div className="p-4 flex gap-3">
                <div className="text-blue-500 shrink-0 mt-0.5"><Clock className="w-5 h-5"/></div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Slot 3 Starting Soon</p>
                  <p className="text-xs text-slate-500 mb-1">20 farmers are scheduled for 11:00 AM slot.</p>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">25 mins ago</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
