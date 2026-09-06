import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileCheck, AlertCircle, Loader2, ArrowRight, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMockStore } from '@/services/useMockStore';
import { SupabaseDataService } from '@/services/supabaseData.service';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const qualityCheckSchema = z.object({
  moisture: z.coerce.number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),
  foreignMatter: z.coerce.number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),
  brokenGrain: z.coerce.number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),
  rejectionReason: z.string().optional(),
  inspectorName: z.string().min(3, "Inspector name must be at least 3 characters")
}).refine(data => {
  if (data.moisture > 17.0 && !data.rejectionReason) {
    return false;
  }
  return true;
}, {
  message: "Rejection reason is required when moisture > 17.0%",
  path: ["rejectionReason"]
});

type QualityCheckFormData = z.infer<typeof qualityCheckSchema>;

export default function QualityCheck() {
  const navigate = useNavigate();
  const store = useMockStore();
  const bookings = store.getBookings().filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  
  const [selectedTokenId, setSelectedTokenId] = useState<string>(bookings[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedBooking = bookings.find(b => b.id === selectedTokenId) || bookings[0];

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QualityCheckFormData>({
    resolver: zodResolver(qualityCheckSchema),
    defaultValues: {
      moisture: 13.8,
      foreignMatter: 1.1,
      brokenGrain: 2.0,
      rejectionReason: 'Moisture exceeds permissible 17% limit',
      inspectorName: 'Subhasish Das (Chief Quality Inspector)',
    },
  });

  const moistureVal = watch('moisture') || 0;
  const grade: 'Grade A' | 'Common' | 'Rejected' = 
    moistureVal <= 14.0 ? 'Grade A' : moistureVal <= 17.0 ? 'Common' : 'Rejected';

  const onSubmit = async (data: QualityCheckFormData) => {
    if (!selectedBooking) return;

    setLoading(true);
    try {
      const nextStatus = grade === 'Rejected' ? 'CANCELLED' : 'WEIGHMENT';
      await SupabaseDataService.updateBookingStatus(selectedBooking.id, nextStatus, {
        booking_id: selectedBooking.id,
        moisture_percent: data.moisture,
        foreign_matter_percent: data.foreignMatter,
        broken_grain_percent: data.brokenGrain,
        grade,
        inspector_name: data.inspectorName,
        certificate_id: `QC-KSP-${Math.floor(1000 + Math.random() * 9000)}`,
        rejection_reason: grade === 'Rejected' ? data.rejectionReason : undefined
      });

      setLoading(false);
      setSuccess(true);
      if (grade === 'Rejected') {
        toast.error('Produce batch marked as Rejected');
      } else {
        toast.success('Quality Certificate issued successfully!');
      }
      setTimeout(() => {
        if (grade === 'Rejected') {
          navigate('/operator/queue');
        } else {
          navigate('/operator/weighment');
        }
      }, 1200);
    } catch {
      toast.error('Failed to issue certificate');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full font-sans pb-20">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mandi Lab Module</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Digital Grain Assay & Quality Testing</h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated moisture assay, foreign matter inspection, and official Grade certification.</p>
        </div>
      </div>

      {success ? (
        <Card className={`p-12 border-2 text-center rounded-3xl animate-in zoom-in-95 ${
          grade === 'Rejected' ? 'border-red-500 bg-red-50/80' : 'border-emerald-500 bg-emerald-50/80 shadow-lg'
        }`}>
          <div className={`w-20 h-20 text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg ${
            grade === 'Rejected' ? 'bg-red-600 shadow-red-900/30' : 'bg-emerald-600 shadow-emerald-900/30'
          }`}>
            {grade === 'Rejected' ? <XCircle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
            grade === 'Rejected' ? 'bg-red-200 text-red-900' : 'bg-emerald-100 text-emerald-800'
          }`}>
            Inspection Certified: {grade}
          </span>
          <h3 className={`text-2xl font-black mt-3 mb-2 ${grade === 'Rejected' ? 'text-red-950' : 'text-emerald-900'}`}>
            {grade === 'Rejected' ? 'Produce Batch Rejected' : 'Quality Check Approved!'}
          </h3>
          <p className={`text-xs ${grade === 'Rejected' ? 'text-red-700' : 'text-emerald-700'}`}>
            {grade === 'Rejected' ? 'Notification sent to farmer with reason.' : 'Digital Certificate issued. Forwarding batch to Electronic Weighbridge...'}
          </p>
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
                    <li>• Moisture &gt; 17.0%: <strong>Rejected / Dryer Required</strong></li>
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

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Live Moisture Slider & Visual Meter Gauge */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-xs font-extrabold text-slate-900">Moisture Content (%) / अनाज में नमी</Label>
                      <p className="text-[10px] text-slate-500">Government FAQ standard: &le; 14.0% for Grade A MSP</p>
                    </div>
                    <span className="text-2xl font-black font-mono text-blue-700">{moistureVal.toFixed(1)}%</span>
                  </div>

                  {/* Visual Color-Coded Gauge Bar */}
                  <div className="space-y-1">
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex relative">
                      <div className="bg-emerald-500 w-[40%]" title="10-14%: Grade A"></div>
                      <div className="bg-amber-400 w-[30%]" title="14-17%: Common"></div>
                      <div className="bg-red-500 w-[30%]" title=">17%: Rejection"></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-emerald-700">🟢 &le;14.0% Grade A</span>
                      <span className="text-amber-700">🟡 14.1-17.0% Common</span>
                      <span className="text-red-700">🔴 &gt;17.0% Drying Needed</span>
                    </div>
                  </div>
                  
                  <Controller
                    control={control}
                    name="moisture"
                    render={({ field }) => (
                      <input 
                        type="range" 
                        min="10.0" 
                        max="22.0" 
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    )}
                  />
                  {errors.moisture && <p className="text-red-500 text-xs mt-1">{errors.moisture.message}</p>}

                  {/* Dynamic Grade Result Pill */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Automated Grade Assessment:</span>
                    <Badge className={`text-xs font-extrabold px-3 py-1 border-0 ${
                      grade === 'Grade A' ? 'bg-emerald-600 text-white' :
                      grade === 'Common' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {grade === 'Grade A' ? 'Grade A (Full MSP ₹2,320)' : grade === 'Common' ? 'Common Grade (Permissible)' : 'Rejected (Moisture Too High)'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Foreign Matter / अपद्रव्य (कचरा) %</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      {...register('foreignMatter')}
                      className={`h-11 rounded-xl text-xs font-bold ${errors.foreignMatter ? 'border-red-500' : ''}`}
                    />
                    {errors.foreignMatter && <p className="text-red-500 text-[10px]">{errors.foreignMatter.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Broken Grain / खंडित दाना %</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      {...register('brokenGrain')}
                      className={`h-11 rounded-xl text-xs font-bold ${errors.brokenGrain ? 'border-red-500' : ''}`}
                    />
                    {errors.brokenGrain && <p className="text-red-500 text-[10px]">{errors.brokenGrain.message}</p>}
                  </div>
                </div>

                {grade === 'Rejected' && (
                  <div className="space-y-1.5 p-3.5 bg-red-50 rounded-2xl border border-red-200">
                    <Label className="text-xs font-bold text-red-900">Rejection Reason Required</Label>
                    <Input
                      type="text"
                      {...register('rejectionReason')}
                      placeholder="Specify reason for grain rejection..."
                      className={`h-11 rounded-xl text-xs font-medium border-red-200 bg-white ${errors.rejectionReason ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {errors.rejectionReason && <p className="text-red-500 text-[10px]">{errors.rejectionReason.message}</p>}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Certifying Lab Officer</Label>
                  <Input 
                    type="text"
                    {...register('inspectorName')}
                    className={`h-11 rounded-xl text-xs font-medium ${errors.inspectorName ? 'border-red-500' : ''}`}
                  />
                  {errors.inspectorName && <p className="text-red-500 text-[10px]">{errors.inspectorName.message}</p>}
                </div>

                <div className="pt-3">
                  <Button 
                    type="submit" 
                    disabled={loading || !selectedBooking}
                    className={`w-full font-bold h-12 rounded-xl text-xs shadow-md gap-2 text-white ${
                      grade === 'Rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    {grade === 'Rejected' 
                      ? 'Confirm Rejection & Cancel Token' 
                      : 'Issue Quality Certificate & Send to Weighbridge'} <ArrowRight className="w-4 h-4" />
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
