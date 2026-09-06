import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/context/SupabaseContext';
import { User, MapPin, Phone, ShieldCheck, Mail, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FarmerProfile() {
  const { farmer, user, signOut } = useSupabase();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/farmer/login', { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your Kishan Seva account and Aadhaar linkage.</p>
      </div>

      <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-700 flex items-center justify-center shadow-inner">
            <User className="w-10 h-10" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900">{farmer?.full_name || 'Verified Farmer'}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <span className="text-sm text-slate-500 font-mono">ID: {farmer?.farmer_code || 'KS-DEMO-999'}</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Aadhaar Verified
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Contact Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</p>
                <p className="font-medium text-slate-900">{farmer?.phone || '+91 99XXXXXX99'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                <p className="font-medium text-slate-900">{user?.email || 'farmer@example.com'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Registered Address</p>
                <p className="font-medium text-slate-900">{farmer?.village || 'Village'}, {farmer?.district || 'District'}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Agricultural Details</h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Verified Land</p>
              <p className="font-bold text-slate-900 text-lg">{farmer?.land_area_acres || '4'} Acres</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Crops</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded border border-amber-200">Paddy</span>
                <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded border border-amber-200">Wheat</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleLogout} variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold border border-red-200">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
