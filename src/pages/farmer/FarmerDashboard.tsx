import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, MapPin, ChevronRight, Leaf, Sprout, 
  FileText, Sun, CloudRain, ArrowRight, ShieldCheck, 
  Banknote, Download, QrCode, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { useMockStore } from '@/services/useMockStore';
import { BookingRecord } from '@/services/mockStore';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const store = useMockStore();
  const farmer = store.getFarmer();
  const activeBooking = store.getActiveFarmerBooking();
  const allBookings = store.getFarmerBookings();
  const completedBookings = allBookings.filter(b => b.status === 'COMPLETED');
  
  const [selectedReceipt, setSelectedReceipt] = useState<BookingRecord | null>(null);

  const totalQuintalsSold = completedBookings.reduce((sum, b) => sum + (b.weighment_data?.net_weight_q || b.expected_quantity_q), 0);
  const totalAmountReceived = completedBookings.reduce((sum, b) => sum + (b.weighment_data?.net_payable || 0), 0);

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto w-full pb-24 md:pb-6 font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 bg-gradient-to-r from-[#143d23] to-[#0f2e1b] text-white p-4 sm:p-5 rounded-2xl shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 text-[11px] font-semibold mb-1.5 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Aadhaar Verified Farmer • {farmer.district}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Namaste, {farmer.full_name} 🙏
          </h1>
          <p className="text-[11px] text-emerald-200 mt-0.5 max-w-md">
            Farmer Code: <span className="font-mono font-bold text-white">{farmer.farmer_code}</span> • Village: {farmer.village}, {farmer.district}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 flex items-center gap-2.5 shrink-0">
          <Sun className="w-6 h-6 text-amber-400 animate-spin-slow" />
          <div>
            <p className="text-lg font-black text-white leading-none">28°C</p>
            <p className="text-[10px] text-emerald-200">Basirhat • Clear Sky</p>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Main Action Banner: Active Booking or Book Slot */}
      {activeBooking ? (
        <Card className="p-4 sm:p-5 mb-4 border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 shadow-md rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-emerald-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                ● Live Active Token
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
              <p className="font-bold text-slate-800 mt-0.5 text-[11px]">{activeBooking.vehicle_number}</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 mb-4 border border-emerald-200 bg-white shadow-sm rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ready to sell your seasonal harvest?</h3>
              <p className="text-[11px] text-slate-500">Government MSP procurement is active across all centres.</p>
            </div>
          </div>
          <Link to="/farmer/book" className="shrink-0">
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold px-5 h-9 shadow-sm gap-2">
              Book a Slot Now <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
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
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">● Certified e-Weighbridge Verified</p>
        </Card>

        <Card className="p-3 sm:p-4 border border-slate-200 shadow-sm bg-white rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Total DBT Disbursed</span>
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900">₹{totalAmountReceived.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">● Credited to SBI A/c (..4591)</p>
        </Card>

        <Card className="p-3 sm:p-4 border border-slate-200 shadow-sm bg-white rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Land</span>
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900">{farmer.land_area_acres} <span className="text-[10px] sm:text-xs font-medium text-slate-400">Acres</span></p>
          <p className="text-[10px] text-blue-600 font-semibold mt-0.5">● Land Record No: KH-8842/WB</p>
        </Card>
      </div>

      {/* Quick Navigation Action Grid */}
      <h3 className="font-extrabold text-slate-900 text-sm mb-2">Quick Farmer Services</h3>
      <div className="grid grid-cols-4 gap-2.5 mb-4">
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
            <div className="text-center py-6">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-semibold">No procurement history yet.</p>
              <p className="text-slate-400 text-[10px]">Book your first slot to sell your harvest.</p>
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Slip Header */}
            <div className="text-center border-b border-slate-200 pb-4 mb-4">
              <div className="flex justify-center mb-2">
                <img src="/logo.svg" alt="Kishan Seva" className="h-16 w-16 object-contain" />
              </div>
              <h3 className="font-black text-slate-900 text-base uppercase tracking-wider">Government of India</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Food & Civil Supplies Procurement Corporation</p>
              <span className="inline-block mt-2 bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Official Electronic J-Form (Receipt)
              </span>
            </div>

            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Slip Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceipt.weighment_data.slip_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Farmer Name:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.farmer_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Procurement Centre:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.centre_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Crop Procured:</span>
                <span className="font-bold text-emerald-800">{selectedReceipt.crop_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Gross Weight:</span>
                <span className="font-bold">{selectedReceipt.weighment_data.gross_weight_q} Q</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tare (Vehicle) Weight:</span>
                <span className="font-bold">{selectedReceipt.weighment_data.tare_weight_q} Q</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 bg-emerald-50/50 px-2 rounded font-bold text-emerald-900">
                <span>Net Procured Weight:</span>
                <span className="text-sm">{selectedReceipt.weighment_data.net_weight_q} Quintals</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">MSP Rate / Quintal:</span>
                <span className="font-bold">₹{selectedReceipt.weighment_data.msp_rate_per_q}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-300 font-extrabold text-sm text-slate-900">
                <span>Net Payable Amount:</span>
                <span className="text-emerald-700 font-mono text-base">₹{selectedReceipt.weighment_data.net_payable.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 text-[11px] text-emerald-700 font-semibold">
                <span>DBT Status:</span>
                <span>● {selectedReceipt.weighment_data.dbt_status} ({selectedReceipt.weighment_data.transaction_ref})</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex gap-3">
              <Button 
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-10 gap-1.5"
              >
                <Download className="w-4 h-4" /> Download / Print Slip
              </Button>
              <Button 
                onClick={() => setSelectedReceipt(null)}
                variant="outline" 
                className="rounded-xl text-xs font-bold h-10"
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
