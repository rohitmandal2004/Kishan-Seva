import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Search, ShieldCheck, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMockStore } from '@/services/useMockStore';

export default function QualityCheck() {
  const navigate = useNavigate();
  const store = useMockStore();
  const bookings = store.getBookings().filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  
  const [selectedTokenId, setSelectedTokenId] = useState<string>(bookings[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedBooking = bookings.find(b => b.id === selectedTokenId) || bookings[0];

  const [moisture, setMoisture] = useState('13.8');
  const [foreignMatter, setForeignMatter] = useState('1.1');
  const [brokenGrain, setBrokenGrain] = useState('2.0');
  const [inspectorName, setInspectorName] = useState('Subhasish Das (Chief Quality Inspector)');

  const numMoisture = parseFloat(moisture) || 0;
  const grade: 'Grade A' | 'Common' | 'Rejected' = 
    numMoisture <= 14.0 ? 'Grade A' : numMoisture <= 17.0 ? 'Common' : 'Rejected';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setLoading(true);
    setTimeout(() => {
      store.updateBookingStatus(selectedBooking.id, 'WEIGHMENT', {
        moisture_percent: numMoisture,
        foreign_matter_percent: parseFloat(foreignMatter) || 1.0,
        broken_grain_percent: parseFloat(brokenGrain) || 2.0,
        grade,
        inspector_name: inspectorName,
        timestamp: new Date().toISOString(),
        certificate_id: `QC-KSP-${Math.floor(1000 + Math.random() * 9000)}`
      });

      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/operator/weighment');
      }, 1200);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto w-full font-sans">
      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mandi Lab Module</span>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">Digital Grain Assay & Quality Testing</h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated moisture assay, foreign matter inspection, and official Grade certification.</p>
        </div>
      </div>

      {success ? (
        <Card className="p-12 border-2 border-emerald-500 bg-emerald-50/80 shadow-lg text-center rounded-3xl animate-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-900/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Inspection Certified: {grade}
          </span>
          <h3 className="text-2xl font-black text-emerald-900 mt-3 mb-2">Quality Check Approved!</h3>
          <p className="text-xs text-emerald-700">Digital Certificate issued. Forwarding batch to Electronic Weighbridge...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Token Selector & Govt Norms */}
          <div className="md:col-span-1 space-y-4">
            <Card className="p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
              <Label className="text-xs font-bold text-slate-700 block mb-2">Select Vehicle Token</Label>
              <select
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
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
                    <span className="text-slate-500">Token ID:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedBooking.token_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Farmer:</span>
                    <span className="font-bold text-slate-800">{selectedBooking.farmer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Crop:</span>
                    <span className="font-bold text-emerald-700">{selectedBooking.crop_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expected:</span>
                    <span className="font-bold">{selectedBooking.expected_quantity_q} Quintals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle:</span>
                    <span className="font-mono font-bold">{selectedBooking.vehicle_number}</span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4 border border-amber-200 bg-amber-50/70 text-amber-900 rounded-2xl shadow-xs">
              <div className="flex gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold mb-1">Official FCI Quality Standards</p>
                  <ul className="space-y-1 text-amber-800/90 text-[11px]">
                    <li>• Moisture &le; 14.0%: <strong>Grade A (Full MSP)</strong></li>
                    <li>• Moisture 14.1% - 17.0%: <strong>Common Grade</strong></li>
                    <li>• Moisture &gt; 17.0%: <strong>Dryer Required</strong></li>
                    <li>• Foreign Matter Max: <strong>1.5%</strong></li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Lab Form & Live Grade Meter */}
          <div className="md:col-span-2">
            <Card className="p-6 border border-slate-200 shadow-xs bg-white rounded-3xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center border border-blue-100">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Lab Moisture & Assay Entry</h3>
                  <p className="text-xs text-slate-500">Record certified sensor readings</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Live Moisture Slider & Input */}
                <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-extrabold text-slate-800">Moisture Content (%)</Label>
                    <span className="text-xl font-black font-mono text-blue-700">{moisture}%</span>
                  </div>
                  
                  <input 
                    type="range" 
                    min="10.0" 
                    max="22.0" 
                    step="0.1"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                    <span>10% (Dry)</span>
                    <span className="text-emerald-700">14% (Standard Max)</span>
                    <span className="text-amber-600">17% (Tolerable)</span>
                    <span className="text-red-500">22% (High)</span>
                  </div>

                  {/* Dynamic Grade Result Pill */}
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Automated Grade:</span>
                    <Badge className={`text-xs font-extrabold px-3 py-1 border-0 ${
                      grade === 'Grade A' ? 'bg-emerald-600 text-white' :
                      grade === 'Common' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {grade}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Foreign Matter / Refraction (%)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={foreignMatter}
                      onChange={(e) => setForeignMatter(e.target.value)}
                      className="h-11 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Broken Grain / Discolored (%)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={brokenGrain}
                      onChange={(e) => setBrokenGrain(e.target.value)}
                      className="h-11 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Certifying Lab Officer</Label>
                  <Input 
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="h-11 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="pt-3">
                  <Button 
                    type="submit" 
                    disabled={loading || !selectedBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl text-xs shadow-md gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Issue Quality Certificate & Send to Weighbridge <ArrowRight className="w-4 h-4" />
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
