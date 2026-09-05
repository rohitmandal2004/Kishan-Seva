import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, MapPin, ChevronRight, Leaf, Sprout, 
  FileText, Sun, CloudRain, ArrowRight, ShieldCheck, 
  Banknote, Download, QrCode, CheckCircle2, AlertCircle, X, Sparkles, Navigation
} from 'lucide-react';
import { useMockStore } from '@/services/useMockStore';
import { BookingRecord } from '@/services/mockStore';
import { useSupabase } from '@/context/SupabaseContext';
import { evaluateCentreRecommendations } from '@/services/recommendationEngine';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const store = useMockStore();
  const { farmer, user } = useSupabase();
  const activeBooking = store.getActiveFarmerBookingForFarmer(farmer, user?.email, user?.id);
  const allBookings = store.getFarmerBookingsForFarmer(farmer, user?.email, user?.id);
  const completedBookings = allBookings.filter(b => b.status === 'COMPLETED');
  const centres = store.getCentres();
  
  const [selectedReceipt, setSelectedReceipt] = useState<BookingRecord | null>(null);

  // Route is guarded by RequireRole; render nothing while farmer resolves
  if (!farmer) {
    return null;
  }

  // Evaluate recommendation for farmer's location
  const recommendations = evaluateCentreRecommendations(
    centres,
    { latitude: farmer.latitude || 22.6168, longitude: farmer.longitude || 88.4369 },
    'Paddy (Grade A)'
  );
  const bestCentreRec = recommendations[0];

  const totalQuintalsSold = completedBookings.reduce((sum, b) => sum + (b.weighment_data?.net_weight_q || b.expected_quantity_q), 0);
  const totalAmountReceived = completedBookings.reduce((sum, b) => sum + (b.weighment_data?.net_payable || 0), 0);

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto w-full pb-24 md:pb-6 font-sans">
      {/* Welcome Hero Banner - Fixed/Sticky at top of page, static as content scrolls */}
      <div className="sticky top-0 z-30 flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 bg-gradient-to-r from-[#143d23] to-[#0f2e1b] text-white p-4 sm:p-5 rounded-2xl shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 text-[11px] font-semibold mb-1.5 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {farmer.verification_status === 'VERIFIED' ? 'Verified Farmer' : 'Registration Pending'} • {farmer.district || 'India'}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Namaste, {farmer.full_name} 🙏
          </h1>
          <p className="text-[11px] text-emerald-200 mt-0.5 max-w-md">
            Farmer Code: <span className="font-mono font-bold text-white">{farmer.farmer_code}</span>
            {farmer.village && <> • Village: {farmer.village}, {farmer.district}</>}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center gap-3 shrink-0">
          <Sun className="w-6 h-6 text-amber-400 animate-spin-slow" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-lg font-black text-white leading-none">28°C</p>
              <span className="text-[9px] text-emerald-200 bg-emerald-900/60 px-1.5 py-0.5 rounded font-mono">Humidity 42%</span>
            </div>
            <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">☀️ Optimal Drying • Grade A (&lt;14% Moisture)</p>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Decision Card 1: Active Booking Tracker (if present) */}
      {activeBooking && (
        <Card className="p-4 sm:p-5 mb-4 border-2 border-emerald-500 bg-gradient-to-br from-white to-emerald-50/50 shadow-md rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-emerald-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                ● Your Active Procurement Pass
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                {activeBooking.crop_name} • {activeBooking.expected_quantity_q} Quintals
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white font-bold text-xs px-3 py-1">
                {activeBooking.status.replace('_', ' ')}
              </Badge>
              <Link to="/farmer/queue">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold px-4 h-8 shadow-xs gap-1.5">
                  Track in Live Queue <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Token Number</p>
              <p className="text-sm font-black font-mono text-emerald-800 mt-0.5">{activeBooking.token_number}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Mandi Centre</p>
              <p className="font-bold text-slate-800 mt-0.5 text-[11px] truncate">{activeBooking.centre_name}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Scheduled Slot</p>
              <p className="font-bold text-slate-800 mt-0.5 text-[11px]">{activeBooking.slot_time}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Vehicle</p>
              <p className="font-bold text-slate-800 mt-0.5 text-[11px]">{activeBooking.vehicle_number || '—'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Decision Card 2: AI Recommended Centre Card */}
      {bestCentreRec && (
        <Card className="p-4 sm:p-5 mb-4 border-2 border-emerald-200 bg-white shadow-md rounded-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <Sparkles className="w-4 h-4 text-emerald-700" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Recommended For Today's Harvest
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {bestCentreRec.centre.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-emerald-700 text-white font-mono text-xs font-black px-3 py-1 rounded-full shadow-xs">
                {bestCentreRec.journey_score}/100 Match Score
              </span>
              <Link to={`/farmer/book?centre=${bestCentreRec.centre.id}`}>
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold px-4 h-8 shadow-xs gap-1">
                  Book Slot <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Distance</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{bestCentreRec.distance_km} km ({bestCentreRec.travel_time_mins} min drive)</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Current Queue</p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">{bestCentreRec.current_queue} Vehicles waiting</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Predicted Wait</p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">~{bestCentreRec.predicted_wait_mins} mins</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Yard Capacity</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{bestCentreRec.centre.daily_capacity_quintals} Q/day</p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-900 bg-emerald-50/70 p-2.5 rounded-xl">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {bestCentreRec.explanation.tradeoff || bestCentreRec.explanation.reasons[0]}
            </span>
            <Link to="/farmer/centres" className="text-emerald-700 font-bold hover:underline shrink-0 text-[10px]">
              Compare all mandis &rarr;
            </Link>
          </div>
        </Card>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="p-3 sm:p-4 border border-slate-200 shadow-sm bg-white rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Produce Procured</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <Sprout className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900">{totalQuintalsSold.toFixed(1)} <span className="text-[10px] sm:text-xs font-medium text-slate-400">Quintals</span></p>
          {totalQuintalsSold > 0 ? (
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">● e-Weighbridge Verified</p>
          ) : (
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Book a slot to start selling</p>
          )}
        </Card>

        <Card className="p-3 sm:p-4 border border-slate-200 shadow-sm bg-white rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Total DBT Disbursed</span>
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900">₹{totalAmountReceived.toLocaleString('en-IN')}</p>
          {totalAmountReceived > 0 ? (
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">● Credited to your bank account</p>
          ) : (
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Payments appear after procurement</p>
          )}
        </Card>

        <Card className="p-3 sm:p-4 border border-slate-200 shadow-sm bg-white rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Land</span>
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900">{farmer.land_area_acres || 0} <span className="text-[10px] sm:text-xs font-medium text-slate-400">Acres</span></p>
          {farmer.land_area_acres > 0 ? (
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5">● Verified Land Record</p>
          ) : (
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Update your profile to add land</p>
          )}
        </Card>
      </div>

      {/* Quick Navigation Action Grid */}
      <h3 className="font-extrabold text-slate-900 text-sm mb-2">Quick Farmer Services</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <Link to="/farmer/book" className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center text-center group">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="font-bold text-[11px] text-slate-800">Book New Slot</span>
          <span className="text-[9px] text-slate-400 mt-0.5">Select time & crop</span>
        </Link>

        <Link to="/farmer/queue" className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center text-center group">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <QrCode className="w-4 h-4" />
          </div>
          <span className="font-bold text-[11px] text-slate-800">Live Token</span>
          <span className="text-[9px] text-slate-400 mt-0.5">Queue tracker</span>
        </Link>

        <Link to="/farmer/centres" className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center text-center group">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="font-bold text-[11px] text-slate-800">Find Mandis</span>
          <span className="text-[9px] text-slate-400 mt-0.5">Live queue depths</span>
        </Link>

        <div 
          onClick={() => completedBookings.length > 0 && setSelectedReceipt(completedBookings[0])}
          className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-bold text-[11px] text-slate-800">e-J-Form</span>
          <span className="text-[9px] text-slate-400 mt-0.5">Weighment slips</span>
        </div>
      </div>

      {/* Recent Procurement History */}
      <Card className="p-4 border border-slate-200 bg-white rounded-2xl shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Recent Procurement History</h3>
            <p className="text-[11px] text-slate-500">Transactions, assays & payment confirmations</p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700">All Records</span>
        </div>

        <div className="space-y-2">
          {allBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-7 h-7 text-emerald-300" />
              </div>
              <p className="text-slate-700 text-sm font-bold mb-1">No procurement history yet</p>
              <p className="text-slate-400 text-xs mb-4">Book your first slot to sell your harvest at guaranteed MSP prices.</p>
              <Link to="/farmer/book">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold px-6 h-9 shadow-xs gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Book Your First Slot
                </Button>
              </Link>
            </div>
          ) : (
            allBookings.map((b) => (
              <div 
                key={b.id} 
                className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`px-2 py-1.5 rounded-lg font-mono text-[11px] font-bold shrink-0 ${
                    b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {b.token_number}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{b.crop_name} • {b.expected_quantity_q} Q</h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span>{b.centre_name}</span>
                      <span>•</span>
                      <span>{b.slot_date}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    b.status === 'COMPLETED' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {b.status}
                  </span>

                  {b.weighment_data ? (
                    <Button 
                      onClick={() => setSelectedReceipt(b)}
                      size="sm" 
                      variant="outline" 
                      className="text-[11px] h-7 rounded-full border-slate-300 text-slate-700 gap-1 hover:border-emerald-600 hover:text-emerald-700 px-2.5"
                    >
                      <FileText className="w-3 h-3" /> View e-Slip
                    </Button>
                  ) : (
                    <Link to="/farmer/queue">
                      <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] h-7 rounded-full px-3">
                        Track
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Advisory & Guidelines */}
      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-[11px] text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5 text-xs">Government Procurement Advisory (2026 Kharif/Rabi Season)</p>
          <p className="text-amber-800/90 leading-relaxed">
            Ensure produce moisture is dried below 14% for Grade A certification. 
            All weighments are CCTV monitored. Payment via DBT to Aadhaar-seeded bank within 48 hours.
          </p>
        </div>
      </div>

      {/* e-J-Form / Weighment Receipt Modal */}
      {selectedReceipt && selectedReceipt.weighment_data && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto print-clean-card">
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 print-hide"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Slip Header */}
            <div className="text-center border-b-2 border-emerald-800/20 pb-4 mb-4 relative">
              <div className="flex justify-center mb-1">
                <img src="/logo.svg" alt="Kishan Seva" className="h-14 w-14 object-contain" />
              </div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base uppercase tracking-wider">
                Government of India • भारत सरकार
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold">
                Ministry of Agriculture & Farmers Welfare • कृषि एवं किसान कल्याण मंत्रालय
              </p>
              <div className="mt-2 inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Official Electronic J-Form / सरकारी जे-फॉर्म (e-J-Form)</span>
              </div>
            </div>

            {/* Security Hologram & Verification Bar */}
            <div className="mb-4 p-2.5 bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-[10px]">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>PFMS Direct Benefit Transfer Guaranteed</span>
              </div>
              <span className="font-mono text-slate-500 font-bold">
                SECURITY HASH: #PFMS-2026-{(selectedReceipt.id || '9821').slice(-6)}
              </span>
            </div>

            {/* Detailed Bilingual Procurement Breakdown */}
            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Slip / Parchi Number (पर्ची संख्या):</span>
                <span className="font-mono font-black text-slate-900">{selectedReceipt.weighment_data.slip_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Farmer Name (किसान का नाम):</span>
                <span className="font-bold text-slate-900">{selectedReceipt.farmer_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Mandi Yard (खरीद केंद्र / मंडी):</span>
                <span className="font-bold text-slate-900">{selectedReceipt.centre_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Crop Procured (फसल विवरण):</span>
                <span className="font-bold text-emerald-800">{selectedReceipt.crop_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Gross Weight (लदा हुआ धर्मकांटा वजन):</span>
                <span className="font-bold font-mono">{selectedReceipt.weighment_data.gross_weight_q} Q</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Tare Weight (खाली वाहन धर्मकांटा वजन):</span>
                <span className="font-bold font-mono">{selectedReceipt.weighment_data.tare_weight_q} Q</span>
              </div>
              
              <div className="flex justify-between py-2 border-y-2 border-emerald-600 bg-emerald-50 px-2.5 rounded-lg font-bold text-emerald-950">
                <div>
                  <span className="block font-black text-xs sm:text-sm">Certified Net Weight / शुद्ध अनाज वजन</span>
                  <span className="text-[10px] text-emerald-800 font-normal">Approx. {Math.round(selectedReceipt.weighment_data.net_weight_q * 2)} Bori (बोरी)</span>
                </div>
                <span className="text-sm sm:text-base font-mono font-black text-emerald-900 self-center">
                  {selectedReceipt.weighment_data.net_weight_q} Quintals
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Government MSP Rate (न्यूनतम समर्थन मूल्य):</span>
                <span className="font-bold font-mono">₹{selectedReceipt.weighment_data.msp_rate_per_q} / Quintal</span>
              </div>

              <div className="flex justify-between py-2.5 bg-slate-900 text-white px-3 rounded-xl font-extrabold text-sm">
                <div>
                  <span className="block text-slate-300 text-[11px]">Total Net Remittance (कुल देय राशि)</span>
                  <span className="text-[9px] text-emerald-400 font-normal">Directly Credited to Aadhaar-Linked Bank</span>
                </div>
                <span className="text-amber-300 font-mono text-base sm:text-lg self-center">
                  ₹{selectedReceipt.weighment_data.net_payable.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between py-1 text-[11px] text-emerald-700 font-semibold">
                <span>DBT Payout Status:</span>
                <span>● {selectedReceipt.weighment_data.dbt_status} ({selectedReceipt.weighment_data.transaction_ref})</span>
              </div>
            </div>

            {/* Official Digital Stamp Box */}
            <div className="p-3 border-2 border-dashed border-emerald-600/40 rounded-2xl bg-emerald-50/40 flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-700 flex items-center justify-center text-emerald-800 font-black text-[9px] text-center leading-tight">
                  MSP<br/>PASS
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-emerald-900">Department of Food & Public Distribution</p>
                  <p className="text-[9px] text-emerald-800">Electronic Verification Valid Across All Nationalised Banks</p>
                </div>
              </div>
              <QrCode className="w-9 h-9 text-slate-800 shrink-0" />
            </div>

            <div className="pt-2 border-t border-slate-200 flex gap-3 print-hide">
              <Button 
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-10 gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" /> Download / Print Official Slip
              </Button>
              <Button 
                onClick={() => setSelectedReceipt(null)}
                variant="outline" 
                className="rounded-xl text-xs font-bold h-10 px-5"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
