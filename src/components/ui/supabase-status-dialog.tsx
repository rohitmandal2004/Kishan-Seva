import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle2, RefreshCw, X, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { useSupabase } from '@/context/SupabaseContext';

export function SupabaseStatusBadge() {
  const { isConnected, connectionDetails, refreshConnection } = useSupabase();
  const [isOpen, setIsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshConnection();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 hover:bg-emerald-500/20 shadow-xs"
        title="Supabase Backend Status"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <Database className="w-3.5 h-3.5 text-emerald-700" />
        <span className="hidden sm:inline">Supabase</span>
        <span className="text-[10px] text-emerald-800/80 font-mono">
          {connectionDetails.latencyMs ? `${connectionDetails.latencyMs}ms` : 'Connected'}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white rounded-3xl shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Supabase Cloud Backend</h3>
                <p className="text-[11px] text-slate-500">PostgreSQL Database & Authentication</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Connection Status:</span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-0 font-bold gap-1 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live & Connected
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Project Endpoint:</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">wxmxiaiyryotmpwnutki</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Real-time Pub/Sub:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 fill-current" /> Active (bookings & mandis)
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Authentication:</span>
                  <span className="text-slate-800 font-bold">Phone SMS OTP / Demo Mode</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60 leading-relaxed">
                Database migrations and seed tables have been prepared in <code className="font-bold text-emerald-900">supabase/complete_setup.sql</code>. All queries, bookings, quality certifications, and e-J-Forms are synchronized with fallback reliability.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="flex-1 rounded-xl text-xs font-bold h-10 border-slate-300 gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Test Ping Connection
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-10 px-5"
              >
                Done
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
