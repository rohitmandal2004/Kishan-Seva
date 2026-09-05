import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, User, FileText, CheckCircle2, ChevronRight, 
  BellRing, ArrowRight, Scale, Play, QrCode, Camera, X, Volume2, Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useMockStore } from '@/services/useMockStore';
import { playMandiChime, speakAnnouncement } from '@/services/soundAndSpeech';
import { toast } from 'sonner';

export default function OperatorQueue() {
  const navigate = useNavigate();
  const store = useMockStore();
  const bookings = store.getBookings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);

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
      playMandiChime();
      speakAnnouncement(`Attention please. Token number ${waiting.token_number}, vehicle ${waiting.vehicle_number || 'tractor'}, please proceed to inspection bay.`, 'en');
      store.advanceBooking(waiting.id);
      toast.success(`Calling Token ${waiting.token_number} (${waiting.farmer_name})`);
    } else {
      toast.info('No waiting tokens in queue to call');
    }
  };

  const handleCallSpecificToken = (item: any) => {
    playMandiChime();
    speakAnnouncement(`Calling token number ${item.token_number}. Farmer ${item.farmer_name}, please proceed to weighbridge platform.`, 'en');
    store.advanceBooking(item.id);
    toast.success(`Calling Token ${item.token_number}`);
  };

  const handleQrSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tokenQuery = qrInput.trim().toUpperCase();
    const found = bookings.find(b => b.token_number.toUpperCase() === tokenQuery);
    if (found) {
      playMandiChime();
      speakAnnouncement(`Token ${found.token_number} verified. Welcome ${found.farmer_name}. Gate access granted.`, 'en');
      store.advanceBooking(found.id);
      setScanMessage(`Verified: ${found.token_number} - ${found.farmer_name}`);
      toast.success(`Token ${found.token_number} checked in successfully!`);
      setTimeout(() => {
        setScanMessage(null);
        setShowQrScanner(false);
        setQrInput('');
      }, 1400);
    } else {
      setScanMessage('Invalid Token Number. Please verify QR.');
      setTimeout(() => setScanMessage(null), 2000);
    }
  };

  const handleSimulateCameraScan = () => {
    const target = bookings.find(b => b.status === 'BOOKED') || bookings[0];
    if (target) {
      setQrInput(target.token_number);
      playMandiChime();
      speakAnnouncement(`Token ${target.token_number} verified. Gate access approved.`, 'en');
      store.advanceBooking(target.id);
      setScanMessage(`Scan Successful: ${target.token_number} (${target.farmer_name})`);
      toast.success(`Camera scanned token: ${target.token_number}`);
      setTimeout(() => {
        setScanMessage(null);
        setShowQrScanner(false);
        setQrInput('');
      }, 1400);
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
        <div className="flex items-center gap-2.5">
          <Button 
            onClick={() => setShowQrScanner(true)}
            variant="outline"
            className="border-emerald-600 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold h-11 px-4 rounded-xl shadow-xs gap-2 text-xs"
          >
            <QrCode className="w-4 h-4 text-emerald-700" />
            Scan Gate QR Pass
          </Button>

          <Button 
            onClick={handleCallNext} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-5 rounded-xl shadow-md gap-2 text-xs"
          >
            <BellRing className="w-4 h-4" />
            Call Next Farmer 🔊
          </Button>
        </div>
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
                      onClick={() => handleCallSpecificToken(item)}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs h-8 rounded-xl font-bold gap-1"
                    >
                      <Volume2 className="w-3 h-3" /> Call Token
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Camera QR Code Scanner & Verification Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setShowQrScanner(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Mandi Gate Security Check-in
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Scan Digital Gate Pass QR
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Align farmer's mobile screen or printed pass with the camera viewfinder.
              </p>
            </div>

            {/* Simulated Camera Viewfinder */}
            <div className="relative w-full aspect-square max-w-[260px] mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-inner flex flex-col items-center justify-center mb-4">
              {/* Corner markers */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400"></div>
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400"></div>

              {/* Laser Scanning Line Animation */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce shadow-lg shadow-emerald-500"></div>

              <Camera className="w-10 h-10 text-emerald-400/40 mb-2" />
              <p className="text-[10px] font-mono text-emerald-300/80">OPTICAL QR ENGINE ACTIVE</p>

              {scanMessage && (
                <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-3 text-center animate-in fade-in">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-white">{scanMessage}</p>
                </div>
              )}
            </div>

            {/* Quick Simulate Scan Button */}
            <Button
              onClick={handleSimulateCameraScan}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-10 mb-3 gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Simulate Camera Scan (Incoming Vehicle)
            </Button>

            {/* Manual Token Code Entry Fallback */}
            <form onSubmit={handleQrSubmit} className="pt-2 border-t border-slate-100 flex gap-2">
              <Input
                placeholder="Or type token (e.g. KS-2026-001)"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="text-xs h-10 rounded-xl"
              />
              <Button 
                type="submit"
                variant="outline"
                className="text-xs h-10 rounded-xl font-bold px-4 border-slate-300"
              >
                Verify
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
