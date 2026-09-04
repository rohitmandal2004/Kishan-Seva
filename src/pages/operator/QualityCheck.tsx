import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Search, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QualityCheck() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [qcData, setQcData] = useState({
    moisture: '',
    foreignMatter: '',
    grade: 'A',
    decision: 'ACCEPT'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/operator/weighment');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Quality Check (QC)</h2>
          <p className="text-slate-500">Record moisture and quality parameters.</p>
        </div>
      </div>

      {success ? (
        <Card className="p-12 border-2 border-green-200 bg-green-50 shadow-sm text-center">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">QC Approved!</h3>
          <p className="text-green-700">Redirecting to Weighment section...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="p-5 border-0 shadow-sm bg-white mb-6">
              <div className="flex items-center gap-2 mb-4 text-slate-700">
                <Search className="w-4 h-4" />
                <h3 className="font-bold">Current Token</h3>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Token Number</p>
                <p className="text-2xl font-black text-slate-900 font-mono mb-4">KSP-1034</p>
                
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Farmer</p>
                <p className="font-bold text-slate-800 mb-4">Ramesh Singh</p>
                
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Crop</p>
                <p className="font-bold text-slate-800">Paddy (Dhan)</p>
                <Badge className="mt-2 bg-blue-100 text-blue-700">15 Qtl Expected</Badge>
              </div>
            </Card>

            <Card className="p-4 border border-amber-200 bg-amber-50 text-amber-800 shadow-sm">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold mb-1">Govt. Quality Norms (Paddy)</p>
                  <ul className="list-disc pl-4 space-y-1 text-amber-700/80">
                    <li>Max Moisture: 17%</li>
                    <li>Foreign Matter: Max 1%</li>
                    <li>Discolored: Max 5%</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="p-6 md:p-8 border-0 shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Enter Parameters</h3>
                  <p className="text-sm text-slate-500">Record the lab test results</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="moisture">Moisture Content (%)</Label>
                    <Input 
                      id="moisture" 
                      type="number" 
                      step="0.1" 
                      required 
                      value={qcData.moisture} 
                      onChange={e => setQcData({...qcData, moisture: e.target.value})}
                      placeholder="e.g. 14.5" 
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foreign">Foreign Matter (%)</Label>
                    <Input 
                      id="foreign" 
                      type="number" 
                      step="0.1" 
                      required 
                      value={qcData.foreignMatter} 
                      onChange={e => setQcData({...qcData, foreignMatter: e.target.value})}
                      placeholder="e.g. 0.5" 
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="grade">Quality Grade</Label>
                    <Select value={qcData.grade} onValueChange={v => setQcData({...qcData, grade: v})}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Grade A (Premium)</SelectItem>
                        <SelectItem value="FAQ">FAQ (Fair Avg Quality)</SelectItem>
                        <SelectItem value="REJECT">Sub-standard (Reject)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="decision">Final Decision</Label>
                    <Select value={qcData.decision} onValueChange={v => setQcData({...qcData, decision: v})}>
                      <SelectTrigger className={`h-12 font-bold ${qcData.decision === 'ACCEPT' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                        <SelectValue placeholder="Select Decision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACCEPT">ACCEPT FOR PROCUREMENT</SelectItem>
                        <SelectItem value="REJECT">REJECT LOT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-6 border-t mt-8">
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 font-bold shadow-md"
                    disabled={loading || !qcData.moisture || !qcData.foreignMatter}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <FileCheck className="w-5 h-5 mr-2" />}
                    Save & Generate QC Slip
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
