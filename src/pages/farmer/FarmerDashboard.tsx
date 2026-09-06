import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, MapPin, ChevronRight, Leaf, Sprout, 
  FileText, Sun, CloudRain, ArrowRight, ShieldCheck, 
  Banknote, Download, QrCode, CheckCircle2, AlertCircle, X, Sparkles, Navigation,
  CalendarClock, Ticket, User, Users, PhoneCall
} from 'lucide-react';
import { useMockStore } from '@/services/useMockStore';
import { BookingRecord } from '@/services/mockStore';
import { useSupabase } from '@/context/SupabaseContext';
import { evaluateCentreRecommendations } from '@/services/recommendationEngine';
import QRCode from 'react-qr-code';

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
    <div className="relative w-full h-full flex flex-col">
      {/* Absolute background for the top right hero effect */}
      <div className="absolute top-0 right-0 w-[500px] h-[250px] z-0 pointer-events-none opacity-40">
        <img src="/hero-bg.jpg" alt="Farmer Background" className="w-full h-full object-cover" style={{ maskImage: 'linear-gradient(to bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }} />
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto w-full pb-24 md:pb-6 font-sans relative z-10 space-y-4">

        {/* Decision Card 1: Active Booking Tracker (if present) */}
        {activeBooking && (
          <Card className="p-4 sm:p-5 border border-emerald-200 bg-white shadow-sm rounded-2xl relative overflow-hidden">
            {/* Subtle green outline effect */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600"></div>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center shadow-inner">
                  <Sprout className="w-6 h-6 text-emerald-100" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1 inline-block border border-emerald-100">
                    YOUR ACTIVE PROCUREMENT PASS
                  </span>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {activeBooking.crop_name} • {activeBooking.expected_quantity_q} Quintals
                    </h2>
                    <Badge className="bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 mr-1 inline" /> {activeBooking.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/farmer/queue">
                  <Button className="bg-[#0A2E1A] hover:bg-emerald-900 text-white rounded-lg text-xs font-bold px-5 h-10 shadow-md gap-2 transition-colors">
                    Track in Live Queue <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" className="border-slate-300 text-slate-700 rounded-lg text-xs font-bold px-4 h-10 gap-2 bg-white hover:bg-slate-50 shadow-sm transition-colors">
                  <Calendar className="w-4 h-4 text-slate-400" /> View Booking Details
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs px-2">
              <div className="flex gap-3 items-start">
                <div className="mt-0.5 p-1.5 bg-slate-50 rounded-md border border-slate-100 text-slate-400"><FileText className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Token Number</p>
                  <p className="text-sm font-black text-slate-800 mt-0.5">{activeBooking.token_number}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="mt-0.5 p-1.5 bg-slate-50 rounded-md border border-slate-100 text-slate-400"><MapPin className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Mandi Centre</p>
                  <p className="font-bold text-slate-800 mt-0.5 text-[11px] leading-tight pr-4">{activeBooking.centre_name}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="mt-0.5 p-1.5 bg-slate-50 rounded-md border border-slate-100 text-slate-400"><CalendarClock className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Scheduled Slot</p>
                  <p className="font-bold text-slate-800 mt-0.5 text-[11px]">{activeBooking.slot_time}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Today, {activeBooking.slot_date}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="mt-0.5 p-1.5 bg-slate-50 rounded-md border border-slate-100 text-slate-400"><Ticket className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Vehicle</p>
                  <p className="font-bold text-slate-800 mt-0.5 text-[11px]">{activeBooking.vehicle_number || '—'}</p>
                  {!activeBooking.vehicle_number && <p className="text-[10px] text-slate-400 font-medium">Not added</p>}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Decision Card 2: AI Recommended Centre Card */}
        {bestCentreRec && (
          <Card className="p-4 sm:p-5 border border-slate-200 bg-white shadow-sm rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-200"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mb-1 border border-emerald-100">
                    RECOMMENDED FOR TODAY'S HARVEST
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {bestCentreRec.centre.name}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Best match based on your crop and location</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-full shadow-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{bestCentreRec.journey_score}/100 Match Score</span>
                  <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ml-1">Excellent</span>
                </div>
                <Link to={`/farmer/book?centre=${bestCentreRec.centre.id}`}>
                  <Button className="bg-[#0A2E1A] hover:bg-emerald-900 text-white rounded-lg text-xs font-bold px-5 h-10 shadow-md gap-2 transition-colors">
                    Book New Slot <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs px-2">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><MapPin className="w-4 h-4" /></div>
                <div>
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Distance</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{bestCentreRec.distance_km} km ({bestCentreRec.travel_time_mins} min drive)</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><Users className="w-4 h-4" /></div>
                <div>
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Current Queue</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{bestCentreRec.current_queue} vehicle waiting</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><Clock className="w-4 h-4" /></div>
                <div>
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Predicted Wait</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">~ {bestCentreRec.predicted_wait_mins} mins</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600"><ShieldCheck className="w-4 h-4" /></div>
                <div>
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Yard Capacity</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{bestCentreRec.centre.daily_capacity_quintals} Q/day</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-[11px] text-emerald-900 bg-[#E8F5E9] border border-[#C8E6C9] px-4 py-2.5 rounded-lg">
              <span className="font-semibold flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white"><CheckCircle2 className="w-3 h-3" /></div>
                {bestCentreRec.explanation?.tradeoff || bestCentreRec.explanation?.reasons?.[0] || 'Good choice based on your location and crop.'}
              </span>
              <Link to="/farmer/centres" className="text-emerald-700 font-bold hover:underline shrink-0 text-[11px] flex items-center gap-1">
                Compare all mandis <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        )}

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 border border-slate-200 shadow-sm bg-white rounded-2xl relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100/50">
                <Leaf className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Total Produce Procured</span>
                <p className="text-xl font-black text-slate-900 leading-tight truncate">{totalQuintalsSold.toFixed(1)} <span className="text-xs font-semibold text-slate-500">Quintals</span></p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 ml-[60px] font-medium">Book a slot to start selling</p>
            <div className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-blue-50/80 flex items-center justify-center text-blue-500">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card className="p-5 border border-slate-200 shadow-sm bg-white rounded-2xl relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/50">
                <Banknote className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Total DBT Disbursed</span>
                <p className="text-xl font-black text-slate-900 leading-tight truncate">₹{totalAmountReceived.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 ml-[60px] font-medium">Payments appear after procurement</p>
            <div className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-amber-50/80 flex items-center justify-center text-amber-500">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card className="p-5 border border-slate-200 shadow-sm bg-white rounded-2xl relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100/50 flex items-center justify-center text-green-600 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Registered Land</span>
                <p className="text-xl font-black text-slate-900 leading-tight truncate">{farmer.land_area_acres || 0} <span className="text-xs font-semibold text-slate-500">Acres</span></p>
              </div>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold ml-[60px] flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Verified Land Record</p>
            <div className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-blue-50/80 flex items-center justify-center text-blue-500">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card className="p-5 border border-slate-200 shadow-sm bg-white rounded-2xl relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/50">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Active Crops</span>
                <p className="text-xl font-black text-slate-900 leading-tight truncate">{farmer.crop_name || 'None'}</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 ml-[60px] font-medium">Main Crop</p>
            <div className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-green-50/80 flex items-center justify-center text-green-600">
              <Sprout className="w-3.5 h-3.5" />
            </div>
          </Card>
        </div>

        {/* Bottom 3-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left Promo Banner */}
          <div className="md:col-span-5 rounded-2xl overflow-hidden relative border border-slate-200 shadow-sm min-h-[140px] group cursor-pointer bg-slate-900">
            <img src="/promo-tractor.jpg" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-center">
              <h3 className="text-white font-extrabold text-lg sm:text-xl leading-tight mb-3 tracking-wide">Better Prices<br/>Fair Process<br/>Stronger Farmers</h3>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/20 hover:bg-white/30 px-3.5 py-1.5 rounded-full border border-white/30 backdrop-blur-md w-fit transition-all hover:pr-3">
                Find More Procurement Centres <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="md:col-span-4 p-5 border border-slate-200 shadow-sm bg-white rounded-2xl">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4">Quick Actions</h3>
            <div className="grid grid-cols-5 gap-2">
              <Link to="/farmer/book" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-xl bg-[#F5F8F6] border border-slate-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-600 font-semibold text-center leading-tight">Book New Slot</span>
              </Link>
              <Link to="/farmer/queue" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-xl bg-[#F5F8F6] border border-slate-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-600 font-semibold text-center leading-tight">View Queue</span>
              </Link>
              <Link to="/farmer/centres" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-xl bg-[#F5F8F6] border border-slate-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-50 group-hover:border-amber-200 transition-colors shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-600 font-semibold text-center leading-tight">Find Centres</span>
              </Link>
              <Link to="/farmer/dashboard" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-xl bg-[#F5F8F6] border border-slate-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-50 group-hover:border-purple-200 transition-colors shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-600 font-semibold text-center leading-tight">My Bookings</span>
              </Link>
              <Link to="/farmer/dashboard" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-xl bg-[#F5F8F6] border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-100 group-hover:border-slate-300 transition-colors shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-600 font-semibold text-center leading-tight">Update Profile</span>
              </Link>
            </div>
          </Card>

          {/* Kisan Helpline */}
          <Card className="md:col-span-3 p-5 border border-emerald-100 shadow-sm bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 rounded-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-center space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/50 shadow-inner">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-800">Kisan Helpline</span>
                  <p className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">1800-180-1551</p>
                  <span className="bg-emerald-700 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase inline-block mt-1 tracking-wider shadow-xs">TOLL FREE</span>
                </div>
              </div>
              <p className="text-[10px] text-emerald-800/80 font-medium leading-relaxed w-[80%] pt-1 border-t border-emerald-200/50">
                Get support for bookings, payments and more.
              </p>
            </div>
            <Leaf className="absolute -bottom-6 -right-6 w-32 h-32 text-emerald-600/10 -rotate-12" />
          </Card>
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
              <div className="bg-white p-1 rounded-lg border border-emerald-200 shrink-0">
                <QRCode 
                  value={`MSP-RECEIPT-${selectedReceipt.weighment_data.slip_number}-${selectedReceipt.weighment_data.net_weight_q}Q`} 
                  size={48}
                  level="L"
                />
              </div>
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
