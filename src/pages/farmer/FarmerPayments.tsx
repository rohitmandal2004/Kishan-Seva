import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, IndianRupee, History, Download } from 'lucide-react';
import { useMockStore } from '@/services/useMockStore';
import { useSupabase } from '@/context/SupabaseContext';

export default function FarmerPayments() {
  const store = useMockStore();
  const { farmer, user } = useSupabase();
  const bookings = store.getFarmerBookingsForFarmer(farmer, user?.email, user?.id)
    .filter(b => b.status === 'COMPLETED' && b.weighment_data);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Payment History & DBT Disbursals</h1>
        <p className="text-slate-500 text-sm mt-1">Track your Direct Benefit Transfers (DBT) for accepted produce.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-emerald-200 bg-emerald-50/50 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="font-bold text-emerald-900">Total Received</span>
          </div>
          <h2 className="text-3xl font-black text-emerald-700 font-mono">
            ₹{bookings.reduce((sum, b) => sum + (b.weighment_data?.net_payable || 0), 0).toLocaleString('en-IN')}
          </h2>
        </Card>
        
        <Card className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700">Transactions</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 font-mono">
            {bookings.length}
          </h2>
        </Card>
      </div>

      <Card className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Recent Disbursements</h3>
        </div>
        
        {bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <IndianRupee className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No completed payments found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map(b => (
              <div key={b.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{b.crop_name}</span>
                    <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px]">
                      {b.weighment_data?.net_weight_q.toFixed(2)} Q
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">Token: <span className="font-mono">{b.token_number}</span> • Date: {b.weighment_data?.timestamp?.split('T')[0]}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Ref: {b.weighment_data?.transaction_ref}</p>
                </div>
                
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-lg font-black text-emerald-700 font-mono">₹{b.weighment_data?.net_payable?.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Settled to Bank
                    </p>
                  </div>
                  <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors" title="Download e-Receipt">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
