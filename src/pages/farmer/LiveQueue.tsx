import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, BellRing, MapPin, ChevronLeft, Ticket, Navigation, CheckCircle2 } from 'lucide-react';

export default function LiveQueue() {
  const navigate = useNavigate();
  
  // Simulated real-time queue position
  const [position, setPosition] = useState(7);
  const [totalInQueue, setTotalInQueue] = useState(28);
  const [estWaitTime, setEstWaitTime] = useState(35); // mins
  const [status, setStatus] = useState<'WAITING' | 'CALLED' | 'PROCESSING'>('WAITING');
  
  // Simulate queue movement over time for demo purposes
  useEffect(() => {
    const timer = setInterval(() => {
      setPosition((prev) => {
        if (prev <= 1) {
          setStatus('CALLED');
          setEstWaitTime(0);
          return 0; // It's their turn
        }
        setEstWaitTime(Math.max((prev - 1) * 5, 0)); // 5 mins per person
        return prev - 1;
      });
      setTotalInQueue((prev) => (prev > 10 ? prev - 1 : prev));
    }, 15000); // Move 1 spot every 15 seconds for demo
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto w-full pb-24 md:pb-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">Live Queue Status</h1>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-0 bg-white mb-6">
        <div className="p-6 bg-green-700 text-white text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 mb-4 px-3 py-1 font-medium tracking-wide">
            {status === 'WAITING' ? '● IN QUEUE' : status === 'CALLED' ? '● PLEASE PROCEED' : '● PROCESSING'}
          </Badge>
          
          <p className="text-green-100 text-sm mb-1 uppercase tracking-wider font-semibold">Your Token Number</p>
          <h2 className="text-4xl font-extrabold tracking-widest font-mono">KSP-1042</h2>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3 text-slate-700">
              <MapPin className="w-5 h-5 text-green-700" />
              <div>
                <p className="font-bold text-sm">Krishnapur Centre</p>
                <p className="text-xs text-slate-500">Counter 3</p>
              </div>
            </div>
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
              <Navigation className="w-4 h-4 text-green-700" />
            </Button>
          </div>
          
          {status === 'CALLED' ? (
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center animate-pulse">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <BellRing className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">It's Your Turn!</h3>
              <p className="text-green-700 text-sm">Please proceed to Weighment Counter 3 immediately.</p>
            </div>
          ) : (
            <>
              <div className="flex divide-x border rounded-xl overflow-hidden mb-6">
                <div className="flex-1 p-4 text-center bg-slate-50">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Queue Position</p>
                  <p className="text-3xl font-black text-slate-900">{position}</p>
                </div>
                <div className="flex-1 p-4 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Est. Wait Time</p>
                  <p className="text-3xl font-black text-green-700">{estWaitTime}<span className="text-lg font-bold">m</span></p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Total Farmers in Queue:</span>
                </div>
                <span>{totalInQueue}</span>
              </div>
            </>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 px-1">Your Progress</h3>
        
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative">
          <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-slate-100"></div>
          
          <div className="flex items-start gap-4 mb-6 relative">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Check-in Completed</p>
              <p className="text-xs text-slate-500">10:15 AM</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 mb-6 relative">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Quality Check Passed</p>
              <p className="text-xs text-slate-500">Grade A (Moisture 13%) • 10:25 AM</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 relative">
            <div className={`w-6 h-6 rounded-full shrink-0 z-10 ring-4 ring-white flex items-center justify-center ${status === 'CALLED' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
              <span className="text-[10px] font-bold">3</span>
            </div>
            <div>
              <p className={`font-bold text-sm ${status === 'CALLED' ? 'text-blue-700' : 'text-slate-400'}`}>Weighment</p>
              <p className="text-xs text-slate-500">{status === 'CALLED' ? 'Ready for you now' : 'Waiting for turn'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
