import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Users, BellRing, MapPin, ChevronLeft, 
  Ticket, Navigation, CheckCircle2, QrCode, ArrowRight,
  ShieldCheck, AlertTriangle, Play, Smartphone, Download
} from 'lucide-react';
import { useMockStore } from '@/services/useMockStore';

export default function LiveQueue() {
  const navigate = useNavigate();
  const store = useMockStore();
  const activeBooking = store.getActiveFarmerBooking();
  const [smsSent, setSmsSent] = useState(false);

  const handleSimulateAdvance = () => {
    if (activeBooking) {
      store.advanceBooking(activeBooking.id);
    }
  };

  const handleSendSms = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 4000);
  };

  if (!activeBooking) {
    return (
      <div className="p-4 md:p-8 max-w-lg mx-auto w-full pb-24 md:pb-8 min-h-screen font-sans">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/farmer/dashboard')} className="p-2 bg-white rounded-full shadow-xs border border-slate-200">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-extrabold text-slate-900">Live Queue Status</h1>
        </div>

        <Card className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Ticket className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">No Active Token in Queue</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
            You do not currently have a harvest delivery token scheduled for today.
          </p>
          <Link to="/farmer/book">
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold px-6 h-10 shadow-sm gap-2">
              Book a Procurement Slot <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Determine stage index
  const stages = [
    { key: 'BOOKED', label: 'Slot Booked', desc: 'Arrive at centre gate' },
    { key: 'CHECKED_IN', label: 'Gate Entry', desc: 'Token verified by guard' },
    { key: 'QUALITY_TESTING', label: 'Moisture Lab', desc: 'Fair digital assay' },
    { key: 'WEIGHMENT', label: 'Weighbridge', desc: 'Gross & Tare calculation' },
    { key: 'COMPLETED', label: 'Payment Queued', desc: 'e-J-Form issued via DBT' }
  ];

  const currentStageIndex = stages.findIndex(s => s.key === activeBooking.status);

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto w-full pb-24 md:pb-8 min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/farmer/dashboard')} 
            className="p-2 bg-white rounded-full shadow-xs border border-slate-200 hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Live Queue Status</h1>
            <p className="text-[11px] text-slate-500">Real-time GPS & Electronic Token Flow</p>
          </div>
        </div>

        {/* Demo Advance simulation control */}
        <Button 
          onClick={handleSimulateAdvance}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-full text-[11px] font-bold h-8 px-3 shadow-xs gap-1"
          title="Simulate queue moving forward for demo"
        >
          <Play className="w-3 h-3 fill-current" /> Next Step ⚡
        </Button>
      </div>

      {/* Main Digital Ticket Card */}
      <Card className="p-0 overflow-hidden shadow-xl border-0 bg-white rounded-3xl mb-6">
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white text-center relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 text-white px-3 py-0.5 rounded-full">
              ● Official Mandi Pass
            </span>
            <span className="text-xs font-bold text-amber-300">
              {activeBooking.crop_name} ({activeBooking.expected_quantity_q} Q)
            </span>
          </div>

          <p className="text-emerald-200 text-xs mb-1 uppercase tracking-wider font-semibold">Your Token Number</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-widest font-mono text-white drop-shadow-sm">
            {activeBooking.token_number}
          </h2>
          <p className="text-xs text-emerald-200/90 font-mono mt-1">Vehicle: {activeBooking.vehicle_number}</p>
        </div>

        <div className="p-6">
          {/* Status Alert */}
          {activeBooking.status === 'QUALITY_TESTING' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6 flex items-start gap-3 animate-pulse">
              <BellRing className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wide">Please Proceed to Quality Lab Counter 2</h4>
                <p className="text-[11px] text-amber-800 mt-0.5">Automated moisture meter sensor is ready for your vehicle batch sampling.</p>
              </div>
            </div>
          )}

          {activeBooking.status === 'WEIGHMENT' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6 flex items-start gap-3 animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wide">Quality Passed! Drive to Weighbridge</h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">Proceed to Gross Weighbridge Platform 1 for electronic weighment.</p>
              </div>
            </div>
          )}

          {/* Mandi Centre Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5 text-slate-700">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">{activeBooking.centre_name}</p>
                <p className="text-[10px] text-slate-400">Gate 1 • Slot: {activeBooking.slot_time}</p>
              </div>
            </div>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600"
              title="Navigate via GPS"
            >
              <Navigation className="w-4 h-4 text-emerald-700" />
            </a>
          </div>

          {/* 5-Step Visual Progress Stepper */}
          <div className="mb-6">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Procurement Workflow</p>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {stages.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stage.key} className="relative flex items-start gap-3">
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                      isPassed 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : isCurrent 
                        ? 'bg-amber-500 border-amber-500 text-white animate-pulse' 
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <div>
                      <p className={`text-xs font-extrabold ${isCurrent ? 'text-amber-900' : isPassed ? 'text-emerald-800' : 'text-slate-400'}`}>
                        {stage.label}
                        {isCurrent && <span className="ml-2 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">CURRENT</span>}
                      </p>
                      <p className="text-[10px] text-slate-500">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Token Actions */}
          <div className="space-y-2 pt-2">
            <Button 
              onClick={handleSendSms}
              variant="outline"
              className="w-full rounded-xl text-xs font-bold h-10 border-slate-200 text-slate-700 hover:bg-slate-50 gap-2"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              {smsSent ? 'SMS Sent to Registered Mobile! ✓' : 'Send Status via SMS Alert'}
            </Button>
            
            <Button 
              onClick={() => window.print()}
              variant="outline"
              className="w-full rounded-xl text-xs font-bold h-10 border-slate-200 text-slate-700 hover:bg-slate-50 gap-2"
            >
              <Download className="w-4 h-4 text-slate-600" />
              Download Digital Token Pass
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
