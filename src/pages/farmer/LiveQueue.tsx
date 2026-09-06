import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Users, BellRing, MapPin, ChevronLeft, 
  Ticket, Navigation, CheckCircle2, QrCode, ArrowRight,
  ShieldCheck, AlertTriangle, Play, Smartphone, Download, FileText,
  Volume2, Share2, WifiOff, Banknote, Sparkles
} from 'lucide-react';
import { useMockStore } from '@/services/useMockStore';
import { SupabaseDataService } from '@/services/supabaseData.service';
import { useSupabase } from '@/context/SupabaseContext';
import { useLanguage } from '@/services/i18n';
import QRCode from 'react-qr-code';
import { calculateQueuePrediction } from '@/services/queuePredictionEngine';
import { playMandiChime, speakAnnouncement, generateWhatsAppShareUrl } from '@/services/soundAndSpeech';

export default function LiveQueue() {
  const navigate = useNavigate();
  const store = useMockStore();
  const { farmer, user } = useSupabase();
  const { lang } = useLanguage();
  
  const activeBooking = store.getActiveFarmerBookingForFarmer(farmer, user?.email, user?.id);
  const centre = activeBooking ? store.getCentreById(activeBooking.centre_id) : null;
  const allBookings = store.getBookings();
  const [smsSent, setSmsSent] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Auto-cache active token for offline presentation at gate
  useEffect(() => {
    if (activeBooking) {
      try {
        localStorage.setItem('kishan_offline_pass', JSON.stringify(activeBooking));
      } catch (e) {
        // quota ignore
      }
    }
  }, [activeBooking]);

  useEffect(() => {
    const unsubscribe = SupabaseDataService.subscribeRealtime(() => {
      // Realtime store updates
    });
    return () => unsubscribe();
  }, []);

  const handleSimulateAdvance = async () => {
    if (activeBooking) {
      await SupabaseDataService.advanceBooking(activeBooking.id);
    }
  };

  const handleSendSms = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 4000);
  };

  // Check for offline cached token if no network / active booking in memory
  const [showOfflinePass, setShowOfflinePass] = useState(false);
  const cachedOfflinePassRaw = localStorage.getItem('kishan_offline_pass');
  const cachedOfflinePass = cachedOfflinePassRaw ? JSON.parse(cachedOfflinePassRaw) : null;

  if (!activeBooking) {
    if (cachedOfflinePass && showOfflinePass) {
      // Use cached offline pass for gate presentation
    } else {
      return (
        <div className="p-4 md:p-8 max-w-lg mx-auto w-full pb-24 md:pb-8 min-h-screen font-sans">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate('/farmer/dashboard')} className="p-2 bg-white rounded-full shadow-xs border border-slate-200">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-extrabold text-slate-900">Live Queue Status</h1>
          </div>

          <Card className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Ticket className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">No Active Token in Queue</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
              You do not currently have a harvest delivery token scheduled for today.
            </p>

            {cachedOfflinePass && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-1">
                  <WifiOff className="w-4 h-4 text-emerald-600" /> Offline Pass Available
                </div>
                <p className="text-[11px] text-emerald-700 mb-3">
                  A previously issued token ({cachedOfflinePass.token_number}) is saved locally on this device.
                </p>
                <Button 
                  onClick={() => setShowOfflinePass(true)}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-9"
                >
                  View Saved Offline Pass
                </Button>
              </div>
            )}

            <Link to="/farmer/book">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold px-6 h-10 shadow-sm gap-2">
                Book a Procurement Slot <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      );
    }
  }

  const currentBooking = activeBooking || cachedOfflinePass;

  // Calculate live queue prediction
  const prediction = calculateQueuePrediction(currentBooking.centre_id, allBookings);

  // Determine stage index
  const stages = [
    { key: 'BOOKED', label: 'Slot Booked / स्लॉट बुक', desc: 'Arrive at Mandi Gate 1 with token QR' },
    { key: 'CHECKED_IN', label: 'Gate Entry / मुख्य प्रवेश द्वार', desc: 'Barrier lifted & token verified by guard' },
    { key: 'QUALITY_TESTING', label: 'Moisture Lab / नमी जांच केंद्र', desc: 'Digital moisture & grain assay sensor' },
    { key: 'WEIGHMENT', label: 'Weighbridge / धर्मकांटा (Dharamkanta)', desc: 'Gross & Tare automated weighment' },
    { key: 'COMPLETED', label: 'DBT Payment / सरकारी भुगतान (e-J-Form)', desc: 'Official e-J-Form issued via RBI PFMS' }
  ];

  const currentStageIndex = stages.findIndex(s => s.key === currentBooking.status);

  // Position calculation
  const centreActiveBookings = allBookings.filter(
    b => b.centre_id === currentBooking.centre_id && b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
  );
  const positionInLine = Math.max(1, centreActiveBookings.findIndex(b => b.id === currentBooking.id) + 1);
  const farmersAhead = Math.max(0, positionInLine - 1);

  const handleListenAudio = () => {
    setIsSpeaking(true);
    playMandiChime();
    const stageLabel = stages[currentStageIndex]?.label || currentBooking.status;
    const waitMins = Math.max(5, Math.round(farmersAhead * 4.5));
    let text = `Kishan Seva token ${currentBooking.token_number}. Current status: ${stageLabel}. Position in line: number ${positionInLine}, with ${farmersAhead} vehicles ahead. Estimated wait time: approximately ${waitMins} minutes at ${currentBooking.centre_name}.`;
    if (lang === 'hi') {
      text = `किसान सेवा टोकन नंबर ${currentBooking.token_number}। वर्तमान स्थिति: ${stageLabel}। कतार में आपका स्थान नंबर ${positionInLine} है, और आपसे आगे ${farmersAhead} वाहन हैं। अनुमानित प्रतीक्षा समय लगभग ${waitMins} मिनट है।`;
    } else if (lang === 'bn') {
      text = `কিষাণ সেবা টোকেন নম্বর ${currentBooking.token_number}। বর্তমান ধাপ: ${stageLabel}। লাইনে আপনার অবস্থান ${positionInLine} নম্বর, এবং সামনে ${farmersAhead} টি গাড়ি রয়েছে। আনুমানিক অপেক্ষা সময় প্রায় ${waitMins} মিনিট।`;
    }
    speakAnnouncement(text, lang as any);
    setTimeout(() => setIsSpeaking(false), 5000);
  };

  const handleWhatsAppShare = () => {
    const url = generateWhatsAppShareUrl({
      tokenNumber: currentBooking.token_number,
      centreName: currentBooking.centre_name,
      slotDate: currentBooking.slot_date,
      slotTime: currentBooking.slot_time,
      cropName: currentBooking.crop_name,
      quantityQ: currentBooking.expected_quantity_q,
      vehicleNumber: currentBooking.vehicle_number,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="p-3 sm:p-4 md:p-8 max-w-lg mx-auto w-full pb-24 md:pb-8 min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={() => navigate('/farmer/dashboard')} 
            className="p-2 bg-white rounded-full shadow-xs border border-slate-200 hover:bg-slate-50 shrink-0"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight truncate">Live Queue Status</h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live GPS & Electronic Token Flow
            </p>
          </div>
        </div>

        {/* Advance simulation control */}
        <Button 
          onClick={handleSimulateAdvance}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-full text-[10px] sm:text-[11px] font-bold h-8 px-2.5 sm:px-3 shadow-xs gap-1 shrink-0"
          title="Advance queue state for testing"
        >
          <Play className="w-3 h-3 fill-current" /> Next Step ⚡
        </Button>
      </div>

      {/* Main Digital Ticket Card */}
      <Card className="p-0 overflow-hidden shadow-xl border-0 bg-white rounded-3xl mb-6">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#143d23] to-[#0f2e1b] text-white text-center relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 gap-2">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest bg-white/20 text-white px-2.5 sm:px-3 py-0.5 rounded-full shrink-0">
              ● Official Mandi Pass
            </span>
            <span className="text-xs font-bold text-amber-300 truncate">
              {currentBooking.crop_name} ({currentBooking.expected_quantity_q} Q)
            </span>
          </div>

          <p className="text-emerald-200 text-[11px] sm:text-xs mb-1 uppercase tracking-wider font-semibold">Your Token Number</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-widest font-mono text-white drop-shadow-sm">
            {currentBooking.token_number}
          </h2>
          <p className="text-[11px] sm:text-xs text-emerald-200/90 font-mono mt-1 mb-4">Vehicle: {currentBooking.vehicle_number || 'Tractor Trolley'}</p>

          <div className="flex justify-center my-3 relative">
            <div className="bg-white p-2.5 rounded-2xl shadow-xl inline-block relative before:absolute before:inset-0 before:ring-4 before:ring-emerald-500/20 before:rounded-2xl">
              <QRCode 
                value={JSON.stringify({
                  token: currentBooking.token_number,
                  f: currentBooking.farmer_id,
                  b: currentBooking.id,
                  c: currentBooking.centre_id,
                  h: `SEC-${(currentBooking.id || '9821').slice(-6)}`
                })} 
                size={160} 
                level="M"
                bgColor="#ffffff"
                fgColor="#022c22"
              />
            </div>
            {/* Corner brackets design element */}
            <div className="absolute top-1 left-[50%] -translate-x-[90px] w-4 h-4 border-t-2 border-l-2 border-emerald-400 opacity-70"></div>
            <div className="absolute top-1 right-[50%] translate-x-[90px] w-4 h-4 border-t-2 border-r-2 border-emerald-400 opacity-70"></div>
            <div className="absolute bottom-1 left-[50%] -translate-x-[90px] w-4 h-4 border-b-2 border-l-2 border-emerald-400 opacity-70"></div>
            <div className="absolute bottom-1 right-[50%] translate-x-[90px] w-4 h-4 border-b-2 border-r-2 border-emerald-400 opacity-70"></div>
          </div>
          
          <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mt-2 animate-pulse">
            Scan at Entry Gate
          </p>

          {/* Quick Voice Audio & WhatsApp Share Buttons inside Ticket */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-white/15">
            <button
              onClick={handleListenAudio}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-xs ${
                isSpeaking 
                  ? 'bg-amber-400 text-slate-950 animate-pulse' 
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
              title="Listen to Queue Status via Voice"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? 'Announcing...' : 'Audio Announcement 🔊'}</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-xs"
              title="Share Delivery Pass with Driver on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Pass</span>
            </button>
          </div>

          {/* Offline Badge */}
          <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] text-emerald-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Pass Available Offline (No Signal Needed)
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Live Position & Prediction Metrics Card */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mb-5 text-center">
            <div className="p-1">
              <p className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400">Position in Line</p>
              <p className="text-base sm:text-lg font-black text-slate-900 font-mono">#{positionInLine}</p>
              <p className="text-[8px] sm:text-[9px] text-slate-500">{farmersAhead} ahead</p>
            </div>
            <div className="p-1 border-x border-slate-200/80">
              <p className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400">Estimated Wait</p>
              <p className="text-base sm:text-lg font-black text-emerald-700 font-mono">~{Math.max(5, Math.round(farmersAhead * 4.5))} min</p>
              <p className="text-[8px] sm:text-[9px] text-emerald-600 font-semibold">{prediction.confidence}</p>
            </div>
            <div className="p-1">
              <p className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400">Yard Speed</p>
              <p className="text-base sm:text-lg font-black text-blue-700 font-mono">{prediction.processing_rate_per_hour} Q/hr</p>
              <p className="text-[8px] sm:text-[9px] text-slate-500">CCTV scale</p>
            </div>
          </div>

          {/* Dynamic Stage Banner Alerts */}
          {currentBooking.status === 'QUALITY_TESTING' && (
            <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl mb-5 space-y-3 animate-pulse">
              <div className="flex items-start gap-3">
                <BellRing className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wide">
                    Please Proceed to Quality Lab Counter 2 (नमी जांच केंद्र)
                  </h4>
                  <p className="text-[11px] text-amber-900 mt-0.5">
                    Automated electronic moisture sensor will sample your vehicle batch for fair grading.
                  </p>
                </div>
              </div>

              {/* Moisture Benchmark Gauge */}
              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs">
                <div className="flex justify-between items-center mb-1.5 font-bold">
                  <span className="text-slate-700">Digital Moisture Benchmark (आर्द्रता मानक):</span>
                  <span className="text-emerald-700 font-mono">Max 14.0% for Grade A MSP</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                  <div className="bg-emerald-500 w-[65%]" title="0 - 14%: Grade A Premium MSP"></div>
                  <div className="bg-amber-400 w-[20%]" title="14.1 - 17%: Common MSP"></div>
                  <div className="bg-red-400 w-[15%]" title=">17%: Sun-Drying Needed"></div>
                </div>
                <div className="flex justify-between text-[9px] font-bold mt-1">
                  <span className="text-emerald-700">🟢 &lt;14.0% (Grade A MSP)</span>
                  <span className="text-amber-700">🟡 14-17% (Common)</span>
                  <span className="text-red-700">🔴 &gt;17% (Drying Needed)</span>
                </div>
              </div>
            </div>
          )}

          {currentBooking.status === 'WEIGHMENT' && (
            <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-5 flex items-start gap-3 animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wide">
                  Quality Passed! Drive to Dharamkanta / धर्मकांटा (Weighbridge Platform 1)
                </h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Proceed to Gross Weighbridge Platform 1. Keep vehicle engine idling on scale.
                </p>
              </div>
            </div>
          )}

          {currentBooking.status === 'COMPLETED' && (
            <div className="space-y-4 mb-5">
              <div className="p-3.5 sm:p-4 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wide">Procurement Completed & Paid via DBT!</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">Electronic J-Form receipt generated. Payout sent to your registered bank account.</p>
                  <Link to="/farmer/dashboard" className="inline-flex items-center gap-1 text-emerald-900 font-bold text-xs mt-2 underline">
                    <FileText className="w-3.5 h-3.5" /> View Official e-J-Form Slip &rarr;
                  </Link>
                </div>
              </div>

              {/* Direct Benefit Transfer (DBT) 4-Step Pipeline Tracker */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-950 via-[#0e351d] to-slate-950 text-white rounded-2xl border border-emerald-500/30 shadow-md">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-white">Direct Benefit Transfer (DBT) Tracker</h4>
                      <p className="text-[10px] text-emerald-300/80">Automated MSP Payout Pipeline • 100% Direct to Bank</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    PFMS #KSP-{(currentBooking.id || '9821').slice(-6)}
                  </span>
                </div>

                {/* 4 Pipeline Milestones */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 pb-3">
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Stage 1
                    </div>
                    <p className="text-xs font-bold text-white">Digital Assay</p>
                    <p className="text-[9px] text-slate-300 mt-0.5">Grade A Certified</p>
                  </div>

                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Stage 2
                    </div>
                    <p className="text-xs font-bold text-white">e-J-Form Slip</p>
                    <p className="text-[9px] text-slate-300 mt-0.5">Govt MSP Assured</p>
                  </div>

                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Stage 3
                    </div>
                    <p className="text-xs font-bold text-white">PFMS Gateway</p>
                    <p className="text-[9px] text-slate-300 mt-0.5">Dispatched to RBI</p>
                  </div>

                  <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-400/30">
                    <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Stage 4
                    </div>
                    <p className="text-xs font-bold text-white">Bank Credit</p>
                    <p className="text-[9px] text-emerald-200 mt-0.5">Expected 24-48 hrs</p>
                  </div>
                </div>

                {/* Settlement calculation */}
                <div className="p-3 bg-black/30 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Payout Remitted</span>
                    <p className="font-mono font-black text-amber-300 text-sm sm:text-base">
                      ₹{( (currentBooking.expected_quantity_q || 40) * 2320 ).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Settlement Target</span>
                    <p className="text-slate-200 font-bold text-xs">Aadhaar-Linked Account</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mandi Centre Header with Navigation & Call Helpdesk */}
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2.5 text-slate-700 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-900 truncate">{currentBooking.centre_name}</p>
                <p className="text-[10px] text-slate-400 truncate">Gate 1 • Slot: {currentBooking.slot_time}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {centre?.contact_number && (
                <a 
                  href={`tel:${centre.contact_number}`} 
                  className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  title="Call Mandi Helpdesk"
                >
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                </a>
              )}
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentBooking.centre_name)}`} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Navigate via GPS"
              >
                <Navigation className="w-4 h-4 text-emerald-700" />
              </a>
            </div>
          </div>

          {/* Mandi Yard 5-Station Physical Route Flow Card */}
          <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Yard Wayfinding Route / प्रांगण दिशा निर्देश
              </span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                Follow Route ➔
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1 text-center text-[9px] font-bold">
              <div className={`p-1.5 rounded-xl border transition-all ${currentStageIndex >= 1 ? 'bg-emerald-100 border-emerald-300 text-emerald-950' : 'bg-white border-slate-200 text-slate-500'}`}>
                <span className="block text-[8px] text-slate-400">Station 1</span>
                <span>Gate 1 (Entry)</span>
              </div>
              <div className={`p-1.5 rounded-xl border transition-all ${currentStageIndex >= 2 ? 'bg-emerald-100 border-emerald-300 text-emerald-950' : currentStageIndex === 1 ? 'bg-amber-100 border-amber-400 text-amber-950 animate-pulse' : 'bg-white border-slate-200 text-slate-500'}`}>
                <span className="block text-[8px] text-slate-400">Station 2</span>
                <span>Lab (Assay)</span>
              </div>
              <div className={`p-1.5 rounded-xl border transition-all ${currentStageIndex >= 3 ? 'bg-emerald-100 border-emerald-300 text-emerald-950' : currentStageIndex === 2 ? 'bg-amber-100 border-amber-400 text-amber-950 animate-pulse' : 'bg-white border-slate-200 text-slate-500'}`}>
                <span className="block text-[8px] text-slate-400">Station 3</span>
                <span>Gross Scale</span>
              </div>
              <div className={`p-1.5 rounded-xl border transition-all ${currentStageIndex >= 4 ? 'bg-emerald-100 border-emerald-300 text-emerald-950' : currentStageIndex === 3 ? 'bg-amber-100 border-amber-400 text-amber-950 animate-pulse' : 'bg-white border-slate-200 text-slate-500'}`}>
                <span className="block text-[8px] text-slate-400">Station 4</span>
                <span>Unload Shed</span>
              </div>
              <div className={`p-1.5 rounded-xl border transition-all ${currentStageIndex >= 4 ? 'bg-emerald-100 border-emerald-300 text-emerald-950' : 'bg-white border-slate-200 text-slate-500'}`}>
                <span className="block text-[8px] text-slate-400">Station 5</span>
                <span>Tare & Exit</span>
              </div>
            </div>
          </div>

          {/* 5-Step Visual Progress Stepper */}
          <div className="mb-6">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">
              Procurement Workflow Status / चरणबद्ध स्थिति
            </p>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {stages.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stage.key} className="relative flex items-start gap-3">
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                      isPassed 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : isCurrent 
                        ? 'bg-amber-500 border-amber-500 text-white animate-pulse' 
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-extrabold ${isCurrent ? 'text-amber-900' : isPassed ? 'text-emerald-800' : 'text-slate-400'}`}>
                        {stage.label}
                        {isCurrent && <span className="ml-2 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">CURRENT</span>}
                      </p>
                      <p className="text-[10px] text-slate-500">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Token Actions */}
          <div className="space-y-2 pt-1">
            <Button 
              onClick={handleSendSms}
              variant="outline"
              className="w-full rounded-xl text-xs font-bold h-11 border-slate-200 text-slate-700 hover:bg-slate-50 gap-2"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              {smsSent ? 'SMS Sent to Registered Mobile! ✓' : 'Send Status via SMS Alert'}
            </Button>
            
            <Button 
              onClick={() => window.print()}
              variant="outline"
              className="w-full rounded-xl text-xs font-bold h-11 border-slate-200 text-slate-700 hover:bg-slate-50 gap-2"
            >
              <Download className="w-4 h-4 text-slate-600" />
              Download Digital Token Pass
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
