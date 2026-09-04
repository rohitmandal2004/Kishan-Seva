import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, FileText, CheckCircle2, ChevronRight, BellRing } from 'lucide-react';
import { Input } from '@/components/ui/input';

const mockQueue = [
  { id: '1', token: 'KSP-1034', name: 'Ramesh Singh', crop: 'Paddy', qty: '15 Qtl', status: 'PROCESSING', stage: 'Weighment' },
  { id: '2', token: 'KSP-1035', name: 'Sunil Das', crop: 'Paddy', qty: '12 Qtl', status: 'CALLED', stage: 'QC Pending' },
  { id: '3', token: 'KSP-1036', name: 'Bimal Roy', crop: 'Wheat', qty: '8 Qtl', status: 'WAITING', stage: 'In Queue' },
  { id: '4', token: 'KSP-1037', name: 'Kartik Mondal', crop: 'Paddy', qty: '20 Qtl', status: 'WAITING', stage: 'In Queue' },
  { id: '5', token: 'KSP-1038', name: 'Ashok Kumar', crop: 'Paddy', qty: '10 Qtl', status: 'WAITING', stage: 'In Queue' },
];

export default function OperatorQueue() {
  const [queue, setQueue] = useState(mockQueue);
  const [search, setSearch] = useState('');

  const handleCallNext = () => {
    setQueue(prev => {
      const newQueue = [...prev];
      const nextIndex = newQueue.findIndex(q => q.status === 'WAITING');
      if (nextIndex > -1) {
        newQueue[nextIndex].status = 'CALLED';
      }
      return newQueue;
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Queue Management</h2>
          <p className="text-slate-500">Call farmers, verify documents, and initiate processing.</p>
        </div>
        <Button onClick={handleCallNext} className="bg-blue-600 hover:bg-blue-700 font-bold h-12 px-8 shadow-md">
          <BellRing className="w-5 h-5 mr-2" />
          Call Next Farmer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Queue List */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Live Queue (28 Farmers)</h3>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Search token or name..." 
                  className="pl-9 h-9 bg-white border-slate-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {queue.map((farmer, index) => (
                <div key={farmer.id} className={`p-4 flex items-center justify-between transition-colors hover:bg-slate-50 ${farmer.status === 'PROCESSING' ? 'bg-blue-50/50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-sm shadow-sm border ${
                      farmer.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                      farmer.status === 'CALLED' ? 'bg-green-100 text-green-700 border-green-200 animate-pulse' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      <span className="text-[10px] leading-none uppercase text-slate-500 mb-0.5">Pos</span>
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 tracking-wide">{farmer.token}</span>
                        {farmer.status === 'PROCESSING' && <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] h-5">PROCESSING</Badge>}
                        {farmer.status === 'CALLED' && <Badge className="bg-green-100 text-green-700 border-0 text-[10px] h-5">CALLED</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5"/> {farmer.name}</span>
                        <span>•</span>
                        <span>{farmer.crop} ({farmer.qty})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Stage</p>
                      <p className="text-sm font-semibold text-slate-700">{farmer.stage}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Selected Farmer Details (Mocking the currently processing one) */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 px-1">Currently Processing</h3>
          <Card className="p-6 border-2 border-blue-100 shadow-md bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Token</p>
                <h3 className="text-3xl font-black text-slate-900 font-mono tracking-wider">KSP-1034</h3>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-3 py-1 text-sm">
                In Progress
              </Badge>
            </div>
            
            <div className="space-y-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Farmer Name</p>
                  <p className="font-bold text-slate-900">Ramesh Singh</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Crop & Estimated Quantity</p>
                  <p className="font-bold text-slate-900">Paddy • 15 Quintals</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 justify-between group">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Docs Verified</span>
              </Button>
              <Button className="w-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 justify-between">
                <span>Enter Quality Check</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button className="w-full bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed justify-between">
                <span>Enter Weighment</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
