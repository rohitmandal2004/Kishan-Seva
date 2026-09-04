import { Card } from '@/components/ui/card';
import { Users, Truck, CheckCircle2, Clock, AlertTriangle, ArrowRight, Play, Scale, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useMockStore } from '@/services/useMockStore';

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const store = useMockStore();
  const allBookings = store.getBookings();
  const activeBookings = allBookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  const completedBookings = allBookings.filter(b => b.status === 'COMPLETED');
  
  const totalProcuredQ = completedBookings.reduce((sum, b) => sum + (b.weighment_data?.net_weight_q || b.expected_quantity_q), 0);
  const currentlyServing = activeBookings.find(b => b.status === 'QUALITY_TESTING' || b.status === 'WEIGHMENT') || activeBookings[0];
  const nextInQueue = activeBookings.filter(b => b.id !== currentlyServing?.id)[0];

  return (
    <div className="max-w-6xl mx-auto w-full font-sans">
      {/* Date & Centre Status */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Operational Console</span>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">Today's Mandi Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">Krishnapur Procurement Centre (KSP-001) • Automated Assay & Weighbridge</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="font-extrabold text-xs tracking-wider uppercase">Live Queue Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <Card className="p-4 sm:p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Queue</span>
            <div className="p-2 sm:p-2.5 bg-blue-50 text-blue-700 rounded-xl shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{activeBookings.length}</p>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Vehicles in yard</p>
        </Card>
        
        <Card className="p-4 sm:p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
            <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-700 rounded-xl shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{completedBookings.length + 42}</p>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Processed today</p>
        </Card>
        
        <Card className="p-4 sm:p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Procured</span>
            <div className="p-2 sm:p-2.5 bg-amber-50 text-amber-700 rounded-xl shrink-0">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{(totalProcuredQ + 1450).toFixed(0)} <span className="text-xs sm:text-sm font-medium text-slate-400">Q</span></p>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Metric Quintals</p>
        </Card>

        <Card className="p-4 sm:p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Turnaround</span>
            <div className="p-2 sm:p-2.5 bg-purple-50 text-purple-700 rounded-xl shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">4.5 <span className="text-xs sm:text-sm font-medium text-slate-400">min</span></p>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Avg. duration</p>
        </Card>
      </div>

      {/* Currently Serving Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="p-0 border border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Now At Weighbridge / Lab</p>
                <div className="flex items-baseline gap-3">
                  <h4 className="text-4xl font-black text-emerald-400 font-mono tracking-wider">
                    {currentlyServing ? currentlyServing.token_number : 'KSP-1042'}
                  </h4>
                  <span className="text-lg font-bold text-slate-200">
                    {currentlyServing ? currentlyServing.farmer_name : 'Rohit Mandal'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {currentlyServing ? `${currentlyServing.crop_name} (${currentlyServing.expected_quantity_q} Q) • Vehicle: ${currentlyServing.vehicle_number}` : 'Paddy (Grade A)'}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  {currentlyServing ? currentlyServing.status.replace('_', ' ') : 'PROCESSING'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-800 text-slate-300 flex flex-wrap justify-between items-center gap-3">
              <p className="text-xs font-medium">
                Next in Yard: <strong className="text-white ml-1">{nextInQueue ? `${nextInQueue.token_number} (${nextInQueue.farmer_name})` : 'Queue Clear'}</strong>
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/operator/quality')}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-8 px-4 gap-1.5 shadow-sm"
                >
                  <FileCheck className="w-3.5 h-3.5" /> Quality Check
                </Button>
                <Button 
                  onClick={() => navigate('/operator/weighment')}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-8 px-4 gap-1.5 shadow-sm"
                >
                  <Scale className="w-3.5 h-3.5" /> Start Weighment
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Action Navigation */}
        <div className="space-y-4">
          <Card className="p-5 border border-slate-200 bg-white rounded-2xl shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-sm mb-3">Operator Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/operator/queue" className="block">
                <Button variant="outline" className="w-full justify-between rounded-xl h-10 text-xs font-bold border-slate-200 text-slate-800 hover:bg-slate-50">
                  <span>Manage Active Queue</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Button>
              </Link>
              <Link to="/operator/quality" className="block">
                <Button variant="outline" className="w-full justify-between rounded-xl h-10 text-xs font-bold border-slate-200 text-slate-800 hover:bg-slate-50">
                  <span>Moisture Assay Testing</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Button>
              </Link>
              <Link to="/operator/weighment" className="block">
                <Button variant="outline" className="w-full justify-between rounded-xl h-10 text-xs font-bold border-slate-200 text-slate-800 hover:bg-slate-50">
                  <span>Gross / Tare Weighment</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Button>
              </Link>
            </div>
          </Card>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
            <p className="font-bold mb-0.5">QC Protocol Reminder</p>
            <p className="text-blue-800/90 leading-relaxed text-[11px]">
              Take 3 random representative core samples across each tractor trolley before entering moisture percentage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
