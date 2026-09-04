import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, Clock, MapPin, CheckCircle2, ChevronLeft, 
  Info, Sprout, Truck, QrCode, ArrowRight, ShieldCheck, Download
} from 'lucide-react';
import { useMockStore } from '@/services/useMockStore';
import { OFFICIAL_MSP_RATES, BookingRecord } from '@/services/mockStore';

export default function SlotBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedCentreId = searchParams.get('centre');
  
  const store = useMockStore();
  const centres = store.getCentres();
  const farmer = store.getFarmer();

  const [selectedCentreId, setSelectedCentreId] = useState<string>(
    preSelectedCentreId || (centres[0]?.id || 'centre-1')
  );
  const [selectedCrop, setSelectedCrop] = useState('Paddy (Grade A)');
  const [quantity, setQuantity] = useState('45');
  const [vehicleNumber, setVehicleNumber] = useState('WB 25 B 4821');
  const [vehicleType, setVehicleType] = useState('Tractor Trolley');
  
  // Dates
  const availableDates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i + 1));
  const [selectedDate, setSelectedDate] = useState<Date>(availableDates[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM - 11:00 AM');

  // Confirmation state
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  const selectedCentre = centres.find(c => c.id === selectedCentreId) || centres[0];
  const selectedMsp = OFFICIAL_MSP_RATES.find(m => m.crop === selectedCrop) || OFFICIAL_MSP_RATES[0];
  const numQuantity = parseFloat(quantity) || 0;
  const estimatedPayout = numQuantity * selectedMsp.rate_per_quintal;

  const slots = [
    { id: 'slot-1', time: '09:00 AM - 10:00 AM', status: 'AVAILABLE', remaining: 15 },
    { id: 'slot-2', time: '10:00 AM - 11:00 AM', status: 'FAST_FILLING', remaining: 4 },
    { id: 'slot-3', time: '11:00 AM - 12:00 PM', status: 'AVAILABLE', remaining: 8 },
    { id: 'slot-4', time: '01:00 PM - 02:00 PM', status: 'AVAILABLE', remaining: 18 },
    { id: 'slot-5', time: '02:00 PM - 03:00 PM', status: 'AVAILABLE', remaining: 20 },
    { id: 'slot-6', time: '03:00 PM - 04:00 PM', status: 'AVAILABLE', remaining: 12 },
  ];

  const handleCreateBooking = () => {
    const booking = store.createBooking({
      centre_id: selectedCentre.id,
      crop_name: selectedCrop,
      expected_quantity_q: numQuantity,
      slot_date: format(selectedDate, 'yyyy-MM-dd'),
      slot_time: selectedSlot,
      vehicle_number: vehicleNumber,
      vehicle_type: vehicleType,
    });
    setConfirmedBooking(booking);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pb-24 md:pb-8 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => window.history.length > 2 ? navigate(-1) : navigate('/farmer/dashboard')} 
          className="p-2 bg-white rounded-full shadow-xs border border-slate-200 hover:bg-slate-50 transition-colors"
          title="Back to Dashboard"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
            Book Procurement Slot
          </h1>
          <p className="text-xs text-slate-500">
            Select your preferred mandi centre, crop details, and harvest delivery time.
          </p>
        </div>
      </div>

      {!confirmedBooking ? (
        <div className="space-y-6">
          {/* Step 1: Centre Selection */}
          <Card className="p-5 border border-slate-200 bg-white rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                1. Select Mandi Procurement Centre
              </h2>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Govt. Certified</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {centres.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCentreId(c.id)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedCentreId === c.id 
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{c.address}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 shrink-0 bg-slate-100 px-2 py-0.5 rounded">
                      {c.distance_km} km
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[10px] text-slate-500">
                    <span>Queue: <strong>{c.current_queue_length} vehicles</strong></span>
                    <span className="text-emerald-700 font-semibold">Wait: ~{c.est_wait_time_mins} min</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Step 2: Crop, Quantity & Estimated Payout */}
          <Card className="p-5 border border-slate-200 bg-white rounded-2xl shadow-xs">
            <h2 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-700" />
              2. Crop Type & Expected Quantity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Select Crop</Label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {OFFICIAL_MSP_RATES.map((m, idx) => (
                    <option key={idx} value={m.crop}>
                      {m.crop} ({m.crop_hi})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Quantity (in Quintals)</Label>
                <Input 
                  type="number"
                  min="1"
                  max="500"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 45"
                  className="h-11 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Transport Vehicle No.</Label>
                <Input 
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. WB 25 B 4821"
                  className="h-11 rounded-xl text-xs font-bold uppercase"
                />
              </div>
            </div>

            {/* Live MSP Calculation Banner */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-xs text-emerald-900 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Official Govt. MSP Guaranteed Rate: <strong>₹{selectedMsp.rate_per_quintal.toLocaleString('en-IN')}/Quintal</strong>
                </p>
                <p className="text-[11px] text-emerald-800/80 mt-0.5">
                  Calculation: {numQuantity} Quintals × ₹{selectedMsp.rate_per_quintal.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Estimated Payout (DBT)</p>
                <p className="text-xl font-black text-emerald-800 font-mono">
                  ₹{estimatedPayout.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </Card>

          {/* Step 3: Date & Time Slot Selection */}
          <Card className="p-5 border border-slate-200 bg-white rounded-2xl shadow-xs">
            <h2 className="font-extrabold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              3. Choose Date & Time Window
            </h2>

            {/* Date Chips */}
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mb-5">
              {availableDates.map((date, idx) => {
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs' 
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                    }`}
                  >
                    <p className={`text-[10px] uppercase font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {format(date, 'EEE')}
                    </p>
                    <p className="text-sm font-black mt-0.5">
                      {format(date, 'd MMM')}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Slot Chips */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Select Time Window</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {slots.map((s) => {
                  const isSelected = selectedSlot === s.time;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSlot(s.time)}
                      className={`p-3 rounded-xl border-2 text-left transition-all flex justify-between items-center ${
                        isSelected 
                          ? 'border-emerald-600 bg-emerald-50 shadow-xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {s.time}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {s.remaining} truck slots remaining
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Booking Summary & Submit CTA */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Review & Generate Pass</p>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {selectedCrop} ({numQuantity} Quintals) at {selectedCentre.name}
              </h3>
              <p className="text-xs text-emerald-400 mt-1">
                Date: {format(selectedDate, 'EEEE, d MMMM yyyy')} • Slot: {selectedSlot}
              </p>
            </div>

            <Button 
              onClick={handleCreateBooking}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 h-12 rounded-full text-xs shadow-lg shadow-emerald-950/50 gap-2 shrink-0"
            >
              Confirm Booking & Generate Token <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* Step 4: Booking Confirmed & Digital Token Generated */
        <div className="max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <Card className="p-0 overflow-hidden border-2 border-emerald-600 shadow-2xl rounded-3xl bg-white text-center">
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-6 relative overflow-hidden">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-400/30">
                Official Digital Token Issued
              </span>
              <h2 className="text-4xl font-black font-mono tracking-widest mt-3 text-amber-300">
                {confirmedBooking.token_number}
              </h2>
              <p className="text-xs text-emerald-200 mt-1 font-medium">Present this token at the Mandi Gate</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Simulated QR Code */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
                <div className="w-36 h-36 bg-white border border-slate-300 rounded-xl flex flex-col items-center justify-center p-2 shadow-xs">
                  <QrCode className="w-28 h-28 text-slate-800" />
                  <span className="text-[8px] font-mono text-slate-400">SCAN TO VERIFY</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-2 border border-slate-200 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Farmer Name:</span>
                  <span className="font-bold text-slate-800">{farmer.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Centre:</span>
                  <span className="font-bold text-slate-800">{confirmedBooking.centre_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Crop & Quantity:</span>
                  <span className="font-bold text-emerald-800">{confirmedBooking.crop_name} ({confirmedBooking.expected_quantity_q} Q)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Slot:</span>
                  <span className="font-bold text-slate-800">{confirmedBooking.slot_date} • {confirmedBooking.slot_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-bold text-slate-800 font-mono">{confirmedBooking.vehicle_number}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={() => navigate('/farmer/queue')}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-11 gap-1.5 shadow-md"
                >
                  Go to Live Queue Tracker <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => window.print()}
                  variant="outline" 
                  className="rounded-xl border-slate-300 text-slate-700 text-xs font-bold h-11"
                  title="Print Token"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
