import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Scale, CheckCircle2, FileText, Download, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Weighment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [gross, setGross] = useState('');
  const [tare, setTare] = useState('');
  const [net, setNet] = useState(0);

  const mspPrice = 2183; // Standard MSP for Paddy in INR per Quintal

  useEffect(() => {
    const g = parseFloat(gross) || 0;
    const t = parseFloat(tare) || 0;
    setNet(Math.max(0, g - t));
  }, [gross, tare]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full pb-24">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Weighment & Receipt</h2>
          <p className="text-slate-500">Record final weight and generate procurement slip.</p>
        </div>
        {!success && (
          <Badge className="bg-green-100 text-green-800 font-bold px-3 py-1">
            <CheckCircle2 className="w-4 h-4 mr-1" /> QC Passed
          </Badge>
        )}
      </div>

      {success ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="p-0 border-0 shadow-lg bg-white overflow-hidden max-w-2xl mx-auto">
            <div className="p-8 bg-green-600 text-white text-center relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
              <div className="w-20 h-20 bg-white text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner relative z-10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-2 relative z-10">Procurement Complete</h2>
              <p className="text-green-100 relative z-10">Transaction PR-100428 successful.</p>
            </div>
            
            <div className="p-8 bg-slate-50">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="font-bold text-slate-800 border-b pb-3 mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Net Quantity</span>
                    <span className="font-bold text-slate-900">{net.toFixed(2)} Quintals</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">MSP Rate</span>
                    <span className="font-bold text-slate-900">₹{mspPrice} / Qtl</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t mt-3">
                    <span className="font-bold text-slate-800">Total Payable</span>
                    <span className="font-black text-2xl text-green-700">₹{(net * mspPrice).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button className="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 h-12">
                  <Download className="w-4 h-4 mr-2" /> Download Receipt
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 shadow-sm" onClick={() => navigate('/operator/dashboard')}>
                  Next Farmer <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="p-5 border-0 shadow-sm bg-white">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Farmer Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Token</p>
                  <p className="font-bold text-slate-900 font-mono">KSP-1034</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Farmer Name</p>
                  <p className="font-bold text-slate-900">Ramesh Singh</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Crop</p>
                  <p className="font-bold text-slate-900">Paddy (Dhan)</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">QC Result</p>
                  <Badge className="bg-green-100 text-green-700 mt-1">Grade A (14.5% Moisture)</Badge>
                </div>
              </div>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="p-6 md:p-8 border-0 shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Weighbridge Data</h3>
                  <p className="text-sm text-slate-500">Enter physical weighment details (in Quintals)</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gross" className="text-slate-600">Gross Weight (Crop + Vehicle/Bags)</Label>
                    <Input 
                      id="gross" 
                      type="number" 
                      step="0.01" 
                      required 
                      value={gross} 
                      onChange={e => setGross(e.target.value)}
                      placeholder="e.g. 20.50" 
                      className="h-14 text-xl font-mono text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tare" className="text-slate-600">Tare Weight (Empty Vehicle/Bags)</Label>
                    <Input 
                      id="tare" 
                      type="number" 
                      step="0.01" 
                      required 
                      value={tare} 
                      onChange={e => setTare(e.target.value)}
                      placeholder="e.g. 5.10" 
                      className="h-14 text-xl font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-widest text-sm mb-1">Net Weight</h4>
                    <p className="text-slate-500 text-sm">Gross - Tare</p>
                  </div>
                  <div className="text-right flex items-baseline gap-2">
                    <span className="text-5xl font-black text-indigo-700 font-mono tracking-tighter">
                      {net > 0 ? net.toFixed(2) : '0.00'}
                    </span>
                    <span className="text-xl font-bold text-indigo-400">Qtl</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    type="submit" 
                    className="w-full h-16 text-xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg"
                    disabled={loading || net <= 0}
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <FileText className="w-6 h-6 mr-2" />}
                    Confirm & Generate Receipt
                  </Button>
                  <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Digitally signed by Operator ID EMP-421
                  </p>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
