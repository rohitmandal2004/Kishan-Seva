import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, CheckCircle2, ChevronLeft, 
  Sprout, QrCode, ArrowRight, ShieldCheck, Download,
  Sparkles, Share2, TrendingUp, TrendingDown, WifiOff
} from 'lucide-react';
import { useMockStore } from '@/services/useMockStore';
import { OFFICIAL_MSP_RATES, BookingRecord } from '@/services/mockStore';
import { useSupabase } from '@/context/SupabaseContext';
import { SupabaseDataService } from '@/services/supabaseData.service';
import { evaluateCentreRecommendations } from '@/services/recommendationEngine';
import { generateWhatsAppShareUrl } from '@/services/soundAndSpeech';

export default function SlotBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedCentreId = searchParams.get('centre');
  
  const store = useMockStore();
  const { farmer } = useSupabase();
  const centres = store.getCentres();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCrop, setSelectedCrop] = useState('Paddy (Grade A)');
  const [quantity, setQuantity] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Tractor Trolley');
  const [selectedCentreId, setSelectedCentreId] = useState<string>(
    preSelectedCentreId || (centres[1]?.id || centres[0]?.id || 'centre-2')
  );
  const availableDates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i + 1));
  const [selectedDate, setSelectedDate] = useState<Date>(availableDates[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM - 11:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  // Route is guarded by RequireRole; render nothing while farmer resolves
  if (!farmer) {
    return null;
  }

  // Recommendations calculation
  const recommendations = evaluateCentreRecommendations(
    centres,
    { latitude: farmer.latitude || 22.6168, longitude: farmer.longitude || 88.4369 },
    selectedCrop,
    parseFloat(quantity) || 40
  );

  const selectedCentre = centres.find(c => c.id === selectedCentreId) || centres[0];
  const selectedMsp = OFFICIAL_MSP_RATES.find(m => m.crop === selectedCrop) || OFFICIAL_MSP_RATES[0];
  const numQuantity = parseFloat(quantity) || 0;
  const estimatedPayout = numQuantity * selectedMsp.rate_per_quintal;

  const slots = [
    { id: 'slot-1', time: '09:00 AM - 10:00 AM', status: 'AVAILABLE', remaining: 15, rushLevel: 'High', waitMins: '55-70' },
    { id: 'slot-2', time: '10:00 AM - 11:00 AM', status: 'FAST_FILLING', remaining: 4, rushLevel: 'Peak', waitMins: '65-80' },
    { id: 'slot-3', time: '11:00 AM - 12:00 PM', status: 'AVAILABLE', remaining: 8, rushLevel: 'Medium', waitMins: '35-45' },
    { id: 'slot-4', time: '01:00 PM - 02:00 PM', status: 'AVAILABLE', remaining: 18, rushLevel: 'Low', waitMins: '15-20', isRecommended: true },
    { id: 'slot-5', time: '02:00 PM - 03:00 PM', status: 'AVAILABLE', remaining: 20, rushLevel: 'Low', waitMins: '15-20', isRecommended: true },
    { id: 'slot-6', time: '03:00 PM - 04:00 PM', status: 'AVAILABLE', remaining: 12, rushLevel: 'Medium', waitMins: '25-35' },
  ];

  const handleCreateBooking = async () => {
    setIsSubmitting(true);
    try {
      const booking = await SupabaseDataService.createBooking({
        farmer_id: farmer.id || farmer.clerk_user_id || 'farmer',
        farmer_name: farmer.full_name,
        farmer_phone: farmer.phone,
        farmer_email: farmer.email,
        farmer_code: farmer.farmer_code,
        clerk_user_id: farmer.clerk_user_id,
        centre_id: selectedCentre.id,
        crop_name: selectedCrop,
        expected_quantity_q: numQuantity,
        slot_date: format(selectedDate, 'yyyy-MM-dd'),
        slot_time: selectedSlot,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
      });
      setConfirmedBooking(booking);
      try {
        localStorage.setItem('kishan_offline_pass', JSON.stringify(booking));
      } catch (e) {
        // ignore
      }
      setCurrentStep(4);
      toast.success('Procurement slot confirmed & token generated!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to book slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pb-24 md:pb-8 font-sans">
      {/* Header with Step Indicator */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => currentStep > 1 && currentStep < 4 ? setCurrentStep((prev) => (prev - 1) as any) : navigate('/farmer/dashboard')} 
            className="p-2 bg-white rounded-full shadow-xs border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
              Smart Procurement Slot Booking
            </h1>
            <p className="text-xs text-slate-500">
              Guaranteed MSP pricing, algorithmic centre routing, and instant digital token generation.
            </p>
          </div>
        </div>
      </div>

      {/* 4-Step Stepper Header */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-6">
        {[
          { num: 1, title: 'Produce' },
          { num: 2, title: 'Mandi' },
          { num: 3, title: 'Slot' },
          { num: 4, title: 'Token' },
        ].map((s) => {
          const isDone = currentStep > s.num;
          const isCurrent = currentStep === s.num;
          return (
            <div 
              key={s.num}
              className={`p-1.5 sm:p-2.5 rounded-xl border text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
                isCurrent 
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs' 
                  : isDone 
                  ? 'border-emerald-200 bg-white text-emerald-700' 
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 ${
                isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {isDone ? '✓' : s.num}
              </span>
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-tight truncate max-w-full">
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: Produce & Quantity */}
      {currentStep === 1 && (
        <Card className="p-5 sm:p-6 border border-slate-200 bg-white rounded-3xl shadow-xs space-y-6 animate-in fade-in">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Step 1 of 3
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-2 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-700" />
              Produce Details & Transport / उपज व वाहन विवरण
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Select the crop to deliver and transport vehicle details.</p>
          </div>

          {/* Zero Middleman Trust Reassurance Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-2 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold text-[11px]">
              100% Official Government MSP Assured • Direct Aadhaar Bank Payout (DBT) • Zero Middleman Deductions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Select Harvested Crop / फसल</Label>
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
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-slate-700">Expected Quantity (Quintals)</Label>
                <span className="text-[10px] text-slate-400">~2 बोरी/Q</span>
              </div>
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
              <Label className="text-xs font-bold text-slate-700">Transport Vehicle No. / वाहन नंबर</Label>
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
                Govt. MSP Guaranteed Price: <strong>₹{selectedMsp.rate_per_quintal.toLocaleString('en-IN')} / Quintal</strong>
              </p>
              <p className="text-[11px] text-emerald-800/80 mt-0.5">
                Calculation: {numQuantity} Quintals × ₹{selectedMsp.rate_per_quintal.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Estimated Payout (DBT Direct)</p>
              <p className="text-2xl font-black text-emerald-800 font-mono">
                ₹{estimatedPayout.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => setCurrentStep(2)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-11 px-6 shadow-md gap-2"
            >
              Find Best Procurement Centre <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Find Best Centre */}
      {currentStep === 2 && (
        <Card className="p-5 sm:p-6 border border-slate-200 bg-white rounded-3xl shadow-xs space-y-6 animate-in fade-in">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Step 2 of 3
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              Smart Centre Recommendation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked dynamically by travel time, live queue length, and predicted turnaround.
            </p>
          </div>

          <div className="space-y-3">
            {recommendations.slice(0, 4).map((rec) => {
              const isSelected = selectedCentreId === rec.centre.id;
              return (
                <div
                  key={rec.centre.id}
                  onClick={() => setSelectedCentreId(rec.centre.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-1 ring-emerald-600/20' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {rec.centre.centre_code}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900">{rec.centre.name}</h3>
                      {rec.is_optimal && (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                          ★ RECOMMENDED
                        </Badge>
                      )}
                      {!rec.is_optimal && rec.is_nearest && (
                        <Badge className="bg-amber-100 text-amber-900 text-[10px] font-bold border-amber-300">
                          Nearest
                        </Badge>
                      )}
                    </div>
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      {rec.journey_score}/100 Score
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-3">{rec.centre.address}</p>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Distance</span>
                      <p className="font-bold text-slate-800 mt-0.5">{rec.distance_km} km ({rec.travel_time_mins} min)</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Current Queue</span>
                      <p className="font-bold text-slate-800 mt-0.5">{rec.current_queue} Vehicles</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Predicted Wait</span>
                      <p className="font-bold text-emerald-700 mt-0.5">~{rec.predicted_wait_mins} mins</p>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-slate-50 rounded-xl text-[10px] text-slate-600 font-medium">
                    {rec.explanation.tradeoff || rec.explanation.reasons[0]}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="rounded-xl text-xs font-bold h-11 px-6"
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-11 px-6 shadow-md gap-2"
            >
              Proceed to Slot Selection <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Slot Selection */}
      {currentStep === 3 && (
        <Card className="p-5 sm:p-6 border border-slate-200 bg-white rounded-3xl shadow-xs space-y-6 animate-in fade-in">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Step 3 of 3
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              Select Date & Time Window
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Centre: <strong>{selectedCentre.name}</strong> • Crop: <strong>{selectedCrop} ({numQuantity} Q)</strong>
            </p>
          </div>

          {/* Date Picker Chips */}
          <div>
            <Label className="text-xs font-bold text-slate-700 block mb-2">Delivery Date</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {availableDates.map((date, idx) => {
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`p-2 sm:p-2.5 rounded-xl border-2 text-center transition-all ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs' 
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                    }`}
                  >
                    <p className={`text-[10px] uppercase font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {format(date, 'EEE')}
                    </p>
                    <p className="text-xs sm:text-sm font-black mt-0.5">
                      {format(date, 'd MMM')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hourly Peak Traffic & Congestion Barometer */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-900">Yard Traffic & Turnaround Barometer</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full w-fit">
                ⚡ Pro-Tip: Afternoon slots process 65% faster
              </span>
            </div>
            {/* Visual rush bar */}
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div className="h-full bg-red-400 w-1/3" title="09:00 - 11:30 AM: Peak Inflow"></div>
              <div className="h-full bg-emerald-500 w-1/3" title="01:00 - 03:00 PM: Fast Lane / Recommended"></div>
              <div className="h-full bg-amber-400 w-1/3" title="03:00 - 04:00 PM: Moderate Congestion"></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-semibold mt-1.5">
              <span className="text-red-600 font-bold">09:00 - 11:30 AM (Peak Rush)</span>
              <span className="text-emerald-700 font-bold">01:00 - 03:00 PM (Fast Clear ★)</span>
              <span className="text-amber-700 font-bold">03:00 - 04:00 PM (Moderate)</span>
            </div>
          </div>

          {/* Time Window Chips */}
          <div>
            <Label className="text-xs font-bold text-slate-700 block mb-2">Delivery Time Window</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
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
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          s.rushLevel === 'Low' ? 'bg-emerald-100 text-emerald-800' :
                          s.rushLevel === 'Medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {s.rushLevel === 'Low' ? '⚡ Fast Clear' : s.rushLevel === 'Medium' ? '● Normal' : '🔥 Peak Rush'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {s.remaining} slots • ~{s.waitMins}m
                        </span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Summary Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ready to issue digital pass</p>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {selectedCrop} ({numQuantity} Q) at {selectedCentre.name}
              </h3>
              <p className="text-xs text-emerald-400 mt-1">
                Scheduled: {format(selectedDate, 'EEEE, d MMMM yyyy')} • {selectedSlot}
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(2)}
                className="bg-transparent border-slate-700 text-white hover:bg-slate-800 rounded-xl text-xs h-11"
              >
                Back
              </Button>
              <Button 
                onClick={handleCreateBooking}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 h-11 rounded-xl text-xs shadow-lg gap-2"
              >
                {isSubmitting ? 'Generating Token...' : 'Confirm & Generate Token'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: Token Issued */}
      {currentStep === 4 && confirmedBooking && (
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

              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] bg-white/15 px-3 py-1 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                Saved Offline on Device (No Signal Required)
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* QR Code */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
                <div className="w-36 h-36 bg-white border border-slate-300 rounded-xl flex flex-col items-center justify-center p-2 shadow-xs">
                  <QrCode className="w-28 h-28 text-slate-800" />
                  <span className="text-[8px] font-mono text-slate-400">SCAN TO VERIFY</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-2 border border-slate-200 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Farmer:</span>
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

              {/* WhatsApp Share Action with Tractor Driver */}
              <Button 
                onClick={() => {
                  const shareUrl = generateWhatsAppShareUrl({
                    tokenNumber: confirmedBooking.token_number,
                    centreName: confirmedBooking.centre_name,
                    slotDate: confirmedBooking.slot_date,
                    slotTime: confirmedBooking.slot_time,
                    cropName: confirmedBooking.crop_name,
                    quantityQ: confirmedBooking.expected_quantity_q,
                    vehicleNumber: confirmedBooking.vehicle_number,
                  });
                  window.open(shareUrl, '_blank');
                }}
                className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-slate-950 font-black rounded-xl text-xs h-11 gap-2 shadow-md transition-transform active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4" />
                Share Delivery Pass with Driver (WhatsApp)
              </Button>

              <div className="flex gap-3 pt-1">
                <Button 
                  onClick={() => navigate('/farmer/queue')}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-11 gap-1.5 shadow-md"
                >
                  Track in Live Queue Tracker <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => window.print()}
                  variant="outline" 
                  className="rounded-xl border-slate-300 text-slate-700 text-xs font-bold h-11"
                  title="Print Token Pass"
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
