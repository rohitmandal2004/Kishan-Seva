import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, FileText, CheckCircle2, ChevronRight, BellRing, ArrowRight, Scale, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useMockStore } from '@/services/useMockStore';

export default function OperatorQueue() {
  const navigate = useNavigate();
  const store = useMockStore();
  const bookings = store.getBookings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = bookings.filter((b) => {
    const matchesSearch = b.token_number.toLowerCase().includes(search.toLowerCase()) ||
                          b.farmer_name.toLowerCase().includes(search.toLowerCase()) ||
                          b.crop_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCallNext = () => {
    const waiting = bookings.find(b => b.status === 'BOOKED' || b.status === 'CHECKED_IN');
    if (waiting) {
      store.advanceBooking(waiting.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Yard Management</span>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">Live Mandi Token Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5">Call vehicles to weighbridge, verify documents, and initiate digital assays.</p>
        </div>
        <Button 
          onClick={handleCallNext} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl shadow-md gap-2 text-xs"
        >
          <BellRing className="w-4 h-4" />
          Call Next Farmer In Queue
        </Button>
      </div>

      <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 text-sm">Active Queue</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs font-bold">
              {filtered.length} Tokens
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Search token, farmer or crop..." 
                className="pl-8 h-9 bg-white border-slate-200 rounded-full text-xs w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-full text-xs overflow-x-auto no-scrollbar max-w-full">
              {['ALL', 'BOOKED', 'CHECKED_IN', 'QUALITY_TESTING', 'WEIGHMENT', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 ${
                    statusFilter === st ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Token Table List */}
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-sm font-semibold">No tokens match this filter.</p>
            </div>
          ) : (
            filtered.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/80 ${
                  item.status === 'QUALITY_TESTING' ? 'bg-amber-50/30' : item.status === 'WEIGHMENT' ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-xs shadow-xs border ${
                    item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    item.status === 'WEIGHMENT' ? 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse' :
                    item.status === 'QUALITY_TESTING' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    <span className="text-[9px] uppercase font-mono text-slate-500">#{index + 1}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-slate-900 font-mono text-sm tracking-wide">{item.token_number}</span>
                      <Badge className={`text-[10px] px-2 py-0.5 rounded-full font-bold border-0 ${
                        item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'WEIGHMENT' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'QUALITY_TESTING' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> {item.farmer_name}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-emerald-700">{item.crop_name} ({item.expected_quantity_q} Q)</span>
                      <span>•</span>
                      <span className="font-mono text-slate-400">{item.vehicle_number}</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions per token */}
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => store.advanceBooking(item.id)}
                    className="text-xs h-8 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-100 gap-1"
                    title="Advance to next workflow stage"
                  >
                    <Play className="w-3 h-3 fill-current" /> Advance
                  </Button>

                  {item.status === 'QUALITY_TESTING' ? (
                    <Button 
                      size="sm"
                      onClick={() => navigate('/operator/quality')}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 rounded-xl font-bold gap-1"
                    >
                      Enter Lab Data <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  ) : item.status === 'WEIGHMENT' ? (
                    <Button 
                      size="sm"
                      onClick={() => navigate('/operator/weighment')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 rounded-xl font-bold gap-1"
                    >
                      Weighbridge <Scale className="w-3.5 h-3.5" />
                    </Button>
                  ) : item.status === 'COMPLETED' ? (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> e-J-Form Done
                    </span>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => store.advanceBooking(item.id)}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs h-8 rounded-xl font-bold"
                    >
                      Call Token
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
