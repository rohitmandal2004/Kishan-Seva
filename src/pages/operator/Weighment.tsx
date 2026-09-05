import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, CheckCircle2, FileText, Download, Loader2, 
  ArrowRight, ShieldCheck, QrCode, Building2, Printer, ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMockStore } from '@/services/useMockStore';
import { OFFICIAL_MSP_RATES, BookingRecord } from '@/services/mockStore';
import { SupabaseDataService } from '@/services/supabaseData.service';

export default function Weighment() {
  const navigate = useNavigate();
  const store = useMockStore();
  const bookings = store.getBookings().filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  
  const [selectedTokenId, setSelectedTokenId] = useState<string>(bookings[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<BookingRecord | null>(null);

  const selectedBooking = bookings.find(b => b.id === selectedTokenId) || bookings[0];

  const [gross, setGross] = useState('62.5');
  const [tare, setTare] = useState('17.5');
  const [net, setNet] = useState(45.0);

  const mspRate = OFFICIAL_MSP_RATES.find(m => m.crop === selectedBooking?.crop_name)?.rate_per_quintal || 2183;

  useEffect(() => {
    const g = parseFloat(gross) || 0;
    const t = parseFloat(tare) || 0;
    setNet(Math.max(0, parseFloat((g - t).toFixed(2))));
  }, [gross, tare]);

  const handlingCharge = 450;
  const grossPayable = net * mspRate;
  const netPayable = Math.max(0, grossPayable - handlingCharge);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setLoading(true);
    try {
      const slipNum = `J-FORM-KSP-${Math.floor(1000 + Math.random() * 9000)}`;
      const dbtRef = `DBT/RBI/${Date.now().toString().slice(-8)}`;

      await SupabaseDataService.updateBookingStatus(selectedBooking.id, 'COMPLETED', selectedBooking.quality_data || {
        booking_id: selectedBooking.id,
        moisture_percent: 13.8,
        foreign_matter_percent: 1.1,
        broken_grain_percent: 2.0,
        grade: 'Grade A',
        inspector_name: 'Subhasish Das',
        timestamp: new Date().toISOString(),
        certificate_id: 'QC-KSP-2026-AUTO'
      }, {
        booking_id: selectedBooking.id,
        gross_weight_q: parseFloat(gross) || 62.5,
        tare_weight_q: parseFloat(tare) || 17.5,
        net_weight_q: net,
        msp_rate_per_q: mspRate,
        gross_amount: grossPayable,
        moisture_deduction: 0,
        handling_charge: handlingCharge,
        net_payable: netPayable,
        slip_number: slipNum,
        weighbridge_operator: 'Pradip Ghosh (ID: WB-992)',
        timestamp: new Date().toISOString(),
        dbt_status: 'DISBURSED',
        transaction_ref: dbtRef
      });

      const updated = store.getBookings().find(b => b.id === selectedBooking.id);
      setCompletedBooking(updated || null);
      setLoading(false);
      toast.success('e-J-Form generated successfully!');
    } catch {
      toast.error('Failed to generate e-J-Form');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-24 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mandi Weighbridge Console</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Electronic Weighbridge & e-J-Form</h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated gross/tare scale recording and DBT payment dispatch.</p>
        </div>
      </div>

      {completedBooking && completedBooking.weighment_data ? (
        /* Official Electronic J-Form (Receipt) */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="p-0 border border-slate-200 shadow-xl bg-white rounded-3xl overflow-hidden max-w-2xl mx-auto">
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white text-center relative overflow-hidden">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-emerald-100">
                Procurement & Weighment Successfully Certified
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-2">Official e-J-Form Generated</h2>
              <p className="text-xs text-emerald-200 font-mono mt-0.5">
                Receipt #{completedBooking.weighment_data.slip_number}
              </p>
            </div>
            
            <div className="p-5 sm:p-8 bg-slate-50 space-y-6">
              {/* Slip Content */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <img src="/logo.svg" alt="Kishan Seva" className="h-10 w-10 sm:h-14 sm:w-14 object-contain shrink-0" />
                    <div>
                      <p className="font-extrabold text-slate-900 leading-none text-xs sm:text-sm">Government of India</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400">Department of Food & Public Distribution</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-slate-700 text-[10px] sm:text-[11px] block">{(completedBooking.weighment_data.timestamp || new Date().toISOString()).split('T')[0]}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">● DBT Disbursed</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-600">
                  <div>Farmer: <strong className="text-slate-900">{completedBooking.farmer_name}</strong></div>
                  <div>Token: <strong className="text-slate-900 font-mono">{completedBooking.token_number}</strong></div>
                  <div>Centre: <strong className="text-slate-900">{completedBooking.centre_name}</strong></div>
                  <div>Crop: <strong className="text-emerald-800">{completedBooking.crop_name}</strong></div>
                  <div>Gross Weight: <strong className="text-slate-900">{completedBooking.weighment_data.gross_weight_q} Q</strong></div>
                  <div>Tare Weight: <strong className="text-slate-900">{completedBooking.weighment_data.tare_weight_q} Q</strong></div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center text-sm font-bold text-emerald-900">
                  <span>Net Accepted Produce:</span>
                  <span className="text-base">{completedBooking.weighment_data.net_weight_q.toFixed(2)} Quintals</span>
                </div>

                <div className="space-y-1 pt-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>MSP Rate Applicable:</span>
                    <span className="font-bold text-slate-800">₹{completedBooking.weighment_data.msp_rate_per_q} / Quintal</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Mandi Handling & Bagging Deduction:</span>
                    <span className="text-slate-800">-₹{completedBooking.weighment_data.handling_charge}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-extrabold text-slate-900">
                    <span>Net Amount Disbursed:</span>
                    <span className="text-emerald-700 font-mono text-xl">₹{completedBooking.weighment_data.net_payable.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 font-mono flex justify-between border-t border-slate-100">
                  <span>Transaction Ref: {completedBooking.weighment_data.transaction_ref}</span>
                  <span>Officer: {completedBooking.weighment_data.weighbridge_operator}</span>
                </div>
              </div>
              
              {/* Slip Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => window.print()}
                  variant="outline"
                  className="flex-1 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 h-11 rounded-xl text-xs font-bold gap-2"
                >
                  <Printer className="w-4 h-4" /> Print e-J-Form Slip
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-xl text-xs font-bold gap-2 shadow-sm" 
                  onClick={() => {
                    setCompletedBooking(null);
                    navigate('/operator/queue');
                  }}
                >
                  Call Next Farmer In Queue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Weighbridge Recording Form */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Token & Farmer Specs */}
          <div className="md:col-span-1 space-y-4">
            <Card className="p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
              <Label className="text-xs font-bold text-slate-700 block mb-2">Select Weighed Token</Label>
              <select
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 mb-4"
              >
                {bookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.token_number} — {b.farmer_name}
                  </option>
                ))}
              </select>

              {selectedBooking && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Token:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedBooking.token_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Farmer:</span>
                    <span className="font-bold text-slate-800">{selectedBooking.farmer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Crop:</span>
                    <span className="font-bold text-emerald-800">{selectedBooking.crop_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle:</span>
                    <span className="font-mono font-bold">{selectedBooking.vehicle_number}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">QC Status:</span>
                    <span className="text-emerald-700 font-bold">● {selectedBooking.quality_data?.grade || 'Grade A'}</span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4 border border-blue-200 bg-blue-50/70 text-blue-900 rounded-2xl shadow-xs">
              <p className="text-xs font-bold mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" /> Weighbridge Calibration Notice
              </p>
              <p className="text-[11px] text-blue-800/90 leading-relaxed">
                Platform Scale #1 calibrated and certified by Dept. of Legal Metrology. CCTV recording active.
              </p>
            </Card>
          </div>

          {/* Right: Electronic Weight Capture */}
          <div className="md:col-span-2">
            <Card className="p-6 border border-slate-200 shadow-xs bg-white rounded-3xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center border border-emerald-100">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Electronic Scale Recording</h3>
                  <p className="text-xs text-slate-500">Capture Gross (Loaded) and Tare (Empty) weights</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Gross Weight (Loaded Vehicle in Q)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={gross}
                      onChange={(e) => setGross(e.target.value)}
                      placeholder="e.g. 62.5"
                      className="h-11 rounded-xl text-xs font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Tare Weight (Empty Vehicle in Q)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={tare}
                      onChange={(e) => setTare(e.target.value)}
                      placeholder="e.g. 17.5"
                      className="h-11 rounded-xl text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Net Produce Computed Banner */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Computed Net Produce</span>
                    <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                      {net.toFixed(2)} <span className="text-sm font-medium text-slate-500">Quintals</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">MSP Rate</span>
                    <p className="text-lg font-bold text-emerald-700 font-mono">
                      ₹{mspRate}/Q
                    </p>
                  </div>
                </div>

                {/* Financial Payout Breakdown */}
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                  <div className="flex justify-between text-emerald-900">
                    <span>Gross Value ({net} Q × ₹{mspRate}):</span>
                    <span className="font-bold">₹{grossPayable.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Govt. Mandi Handling & Stacking Charge:</span>
                    <span>-₹{handlingCharge}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-emerald-200 font-extrabold text-sm text-emerald-900">
                    <span>Net DBT Disbursable Amount:</span>
                    <span className="text-base font-mono text-emerald-800 font-black">₹{netPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={loading || !selectedBooking || net <= 0}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-12 rounded-xl text-xs shadow-md gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Confirm Weight & Issue Official e-J-Form Slip <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
