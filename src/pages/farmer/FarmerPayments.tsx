import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, IndianRupee, History, Download, CreditCard, Edit, Building2 } from 'lucide-react';
import { useMockStore } from '@/services/useMockStore';
import { useSupabase } from '@/context/SupabaseContext';
import { toast } from 'sonner';

export default function FarmerPayments() {
  const store = useMockStore();
  const { farmer, user } = useSupabase();
  const bookings = store.getFarmerBookingsForFarmer(farmer, user?.email, user?.id)
    .filter(b => b.status === 'COMPLETED' && b.weighment_data);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    bankName: farmer?.bank_name || 'State Bank of India',
    accountNumber: farmer?.account_number || 'XXXXX4567',
    ifsc: farmer?.ifsc_code || 'SBIN0001234',
    upiId: farmer?.upi_id || ''
  });

  const [formData, setFormData] = useState(paymentDetails);

  const handleSavePaymentDetails = () => {
    setPaymentDetails(formData);
    setIsDialogOpen(false);
    toast.success('Payment details updated successfully.');
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 print:p-0 print:m-0 print:absolute print:inset-0 print:bg-white">
      <div className="print:hidden">
        <h1 className="text-2xl font-black text-slate-900">Payment History & DBT Disbursals</h1>
        <p className="text-slate-500 text-sm mt-1">Track your Direct Benefit Transfers (DBT) for accepted produce.</p>
      </div>

      <div className="print:hidden grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Payment Details Card */}
        <Card className="col-span-1 md:col-span-3 p-5 border-slate-200 bg-white shadow-sm rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:shadow-md hover:border-emerald-200 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                Primary DBT Account <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px]">Verified</Badge>
              </h3>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" /> {paymentDetails.bankName} • A/C {paymentDetails.accountNumber.slice(-4)}
              </p>
              {paymentDetails.upiId && (
                <p className="text-xs text-slate-400 mt-1 font-mono">UPI: {paymentDetails.upiId}</p>
              )}
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 shrink-0 font-bold">
                <Edit className="w-4 h-4 mr-2" /> Manage Details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-slate-900">Payment Details</DialogTitle>
                <DialogDescription>
                  Update your bank account or UPI details for receiving Direct Benefit Transfers (DBT).
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="bankName" className="font-bold text-slate-700">Bank Name</Label>
                  <Input 
                    id="bankName" 
                    value={formData.bankName} 
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="accountNumber" className="font-bold text-slate-700">Account No.</Label>
                    <Input 
                      id="accountNumber" 
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                      className="rounded-xl border-slate-200"
                      type="password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ifsc" className="font-bold text-slate-700">IFSC Code</Label>
                    <Input 
                      id="ifsc" 
                      value={formData.ifsc}
                      onChange={(e) => setFormData({...formData, ifsc: e.target.value})}
                      className="rounded-xl border-slate-200 uppercase"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="upiId" className="font-bold text-slate-700">UPI ID (Optional)</Label>
                  <Input 
                    id="upiId" 
                    value={formData.upiId}
                    onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                    placeholder="example@upi"
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                <Button onClick={handleSavePaymentDetails} className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>

        <Card className="p-5 border-emerald-200 bg-emerald-50/50 shadow-sm rounded-2xl group hover:shadow-md hover:border-emerald-300 transition-all">
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
        
        <Card className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl group hover:shadow-md hover:border-slate-300 transition-all">
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

      <Card className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white print:border-none print:shadow-none">
        <div className="p-4 border-b border-slate-100 bg-slate-50 print:hidden">
          <h3 className="font-bold text-slate-800">Recent Disbursements</h3>
        </div>
        
        {bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <IndianRupee className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No completed payments found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 print:divide-none">
            {bookings.map(b => (
              <div key={b.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 print:p-0 print:block">
                <div className="print:hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{b.crop_name}</span>
                    <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px]">
                      {b.weighment_data?.net_weight_q.toFixed(2)} Q
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">Token: <span className="font-mono">{b.token_number}</span> • Date: {b.weighment_data?.timestamp?.split('T')?.[0] || 'N/A'}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Ref: {b.weighment_data?.transaction_ref}</p>
                </div>
                
                <div className="flex items-center gap-4 text-right print:hidden">
                  <div>
                    <p className="text-lg font-black text-emerald-700 font-mono group-hover:scale-105 transition-transform origin-right">₹{b.weighment_data?.net_payable?.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Settled to Bank
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      // Small delay to allow any state to settle, though native print is blocking
                      setTimeout(() => window.print(), 100);
                    }}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors print:hidden" 
                    title="Download e-Receipt"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                {/* Print-Only Receipt View */}
                <div className="hidden print:block absolute top-0 left-0 w-full h-full bg-white z-50 p-10">
                  <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                    <h1 className="text-3xl font-black text-slate-900">KISHAN SEVA</h1>
                    <p className="text-lg font-bold text-slate-600">Department of Food & Public Distribution</p>
                    <p className="text-sm text-slate-500">Government of West Bengal</p>
                  </div>
                  
                  <h2 className="text-xl font-bold text-center underline mb-8">e-J-Form / Procurement Receipt</h2>
                  
                  <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                    <div>
                      <p><span className="font-bold">Farmer Name:</span> {b.farmer_name}</p>
                      <p><span className="font-bold">Farmer ID:</span> {b.farmer_code}</p>
                      <p><span className="font-bold">Phone:</span> {b.farmer_phone}</p>
                    </div>
                    <div className="text-right">
                      <p><span className="font-bold">Date:</span> {b.weighment_data?.timestamp?.split('T')?.[0] || 'N/A'}</p>
                      <p><span className="font-bold">Token Number:</span> {b.token_number}</p>
                      <p><span className="font-bold">Slip No:</span> {b.weighment_data?.slip_number}</p>
                    </div>
                  </div>

                  <table className="w-full border-collapse border border-slate-400 mb-8 text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-400 p-2 text-left">Crop details</th>
                        <th className="border border-slate-400 p-2 text-right">Gross Weight</th>
                        <th className="border border-slate-400 p-2 text-right">Tare Weight</th>
                        <th className="border border-slate-400 p-2 text-right">Net Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-400 p-2">{b.crop_name}</td>
                        <td className="border border-slate-400 p-2 text-right">{b.weighment_data?.gross_weight_q.toFixed(2)} Q</td>
                        <td className="border border-slate-400 p-2 text-right">{b.weighment_data?.tare_weight_q.toFixed(2)} Q</td>
                        <td className="border border-slate-400 p-2 text-right font-bold">{b.weighment_data?.net_weight_q.toFixed(2)} Q</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex justify-end mb-12">
                    <div className="w-64">
                      <div className="flex justify-between border-b border-slate-300 py-1">
                        <span>MSP Rate:</span>
                        <span>₹{b.weighment_data?.msp_rate_per_q} / Q</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-300 py-1">
                        <span>Gross Amount:</span>
                        <span>₹{b.weighment_data?.gross_amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-300 py-1 text-red-600">
                        <span>Mandi Charges:</span>
                        <span>- ₹{b.weighment_data?.handling_charge}</span>
                      </div>
                      <div className="flex justify-between border-b-2 border-slate-900 py-2 font-black text-lg">
                        <span>Net Payable:</span>
                        <span>₹{b.weighment_data?.net_payable.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-slate-500 mt-16 pt-8 border-t border-slate-300">
                    <p>This is a computer generated document. DB Transfer Ref: {b.weighment_data?.transaction_ref}</p>
                    <p>Weighbridge Operator: {b.weighment_data?.weighbridge_operator}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
