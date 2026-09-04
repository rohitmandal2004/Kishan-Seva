import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { SupabaseAuthService } from '@/services/supabaseAuth.service';
import { mockStore } from '@/services/mockStore';

export default function FarmerRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: mockStore.getFarmer().phone || '9876543210',
    email: '',
    aadhaar: '',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    village: 'Basirhat',
    land_area_acres: '4.3',
    crop_name: 'Paddy (Dhan)',
    crop_area: '3.5',
    expected_quantity: '45'
  });

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }
    
    setLoading(true);
    try {
      await SupabaseAuthService.registerFarmer({
        full_name: formData.full_name,
        phone: formData.phone,
        state: formData.state,
        district: formData.district,
        village: formData.village,
        land_area_acres: parseFloat(formData.land_area_acres) || 4.0
      });
      navigate('/farmer/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col md:flex-row">
      {/* Sidebar / Info Panel */}
      <div className="w-full md:w-1/3 bg-green-900 text-white p-8 md:p-12 flex flex-col relative overflow-hidden">
        <Link to="/farmer/login" className="flex items-center gap-2 text-green-100 hover:text-white mb-12 z-10 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        
        <div className="z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
              <img src="/logo.svg" alt="Kishan Seva" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white leading-none">Kishan <span className="text-emerald-400">Seva</span></h1>
              <p className="text-xs text-green-200 mt-0.5">Farmer Registration</p>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Farmer Registration</h2>
          <p className="text-green-100 text-lg mb-8">Join Kishan Seva and get guaranteed MSP prices for your produce.</p>
          
          <ul className="space-y-6">
            <li className={`flex items-start gap-4 transition-opacity ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${step > 1 ? 'bg-green-500 text-white' : step === 1 ? 'bg-white text-green-900' : 'bg-green-800 text-green-300'}`}>
                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <div>
                <h4 className="font-semibold text-lg">Basic Details</h4>
                <p className="text-green-200 text-sm">Name and contact information</p>
              </div>
            </li>
            
            <li className={`flex items-start gap-4 transition-opacity ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${step > 2 ? 'bg-green-500 text-white' : step === 2 ? 'bg-white text-green-900' : 'bg-green-800 text-green-300'}`}>
                {step > 2 ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <div>
                <h4 className="font-semibold text-lg">Identity Verification</h4>
                <p className="text-green-200 text-sm">Aadhaar details for authenticity</p>
              </div>
            </li>
            
            <li className={`flex items-start gap-4 transition-opacity ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${step === 3 ? 'bg-white text-green-900' : 'bg-green-800 text-green-300'}`}>
                3
              </div>
              <div>
                <h4 className="font-semibold text-lg">Land & Crops</h4>
                <p className="text-green-200 text-sm">Add your cultivation details</p>
              </div>
            </li>
          </ul>
        </div>
        
        {/* Decorative background */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-800 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 p-6 md:p-12 flex flex-col justify-center max-w-3xl mx-auto w-full">
        <div className="flex justify-end items-center gap-3 text-emerald-800 mb-8 hidden md:flex">
          <div className="p-2 rounded-2xl bg-white border-2 border-emerald-100 shadow-md">
            <img src="/logo.svg" alt="Kishan Seva" className="h-14 w-14 object-contain" />
          </div>
          <span className="text-2xl font-black text-[#143d23]">Kishan <span className="text-emerald-600">Seva</span></span>
        </div>

        <Card className="p-8 shadow-sm border-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold text-slate-900 border-b pb-2">Basic Details</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name (as per Aadhaar)</Label>
                    <Input id="full_name" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Enter your full name" className="h-12"/>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number</Label>
                      <Input id="phone" required disabled value={formData.phone} className="h-12 bg-slate-50"/>
                      <p className="text-[10px] text-slate-500">Verified via OTP</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address (Optional)</Label>
                      <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Enter email" className="h-12"/>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold text-slate-900 border-b pb-2">Identity Verification</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aadhaar">Aadhaar Number</Label>
                    <Input id="aadhaar" required value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value.replace(/\D/g, '')})} maxLength={12} placeholder="Enter 12 digit Aadhaar number" className="h-12 tracking-widest"/>
                    <p className="text-xs text-slate-500">Your Aadhaar details are securely stored and will not be displayed publicly.</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100 flex gap-3 mt-4">
                    <div className="mt-0.5">ℹ️</div>
                    <p>For the purpose of this demonstration, identity verification is simulated. No real KYC checks are performed against UIDAI databases.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold text-slate-900 border-b pb-2">Land & Crops</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select value={formData.state} onValueChange={(val) => setFormData({...formData, state: val})}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="West Bengal">West Bengal</SelectItem>
                          <SelectItem value="Bihar">Bihar</SelectItem>
                          <SelectItem value="Punjab">Punjab</SelectItem>
                          <SelectItem value="Haryana">Haryana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Input id="district" required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} placeholder="e.g. North 24 Parganas" className="h-12"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="village">Village</Label>
                      <Input id="village" required value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} placeholder="e.g. Basirhat" className="h-12"/>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="land_area">Total Land Area (Acres)</Label>
                      <Input id="land_area" required type="number" step="0.1" value={formData.land_area_acres} onChange={e => setFormData({...formData, land_area_acres: e.target.value})} placeholder="e.g. 4.5" className="h-12"/>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t mt-4">
                    <Label className="mb-4 block text-base">Primary Crop Detail</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="crop_name" className="text-xs">Crop Name</Label>
                        <Select value={formData.crop_name} onValueChange={(val) => setFormData({...formData, crop_name: val})}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select crop" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Paddy (Dhan)">Paddy (Dhan)</SelectItem>
                            <SelectItem value="Wheat (Gehu)">Wheat (Gehu)</SelectItem>
                            <SelectItem value="Mustard (Sarson)">Mustard (Sarson)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crop_area" className="text-xs">Area (Acres)</Label>
                        <Input id="crop_area" type="number" step="0.1" value={formData.crop_area} onChange={e => setFormData({...formData, crop_area: e.target.value})} placeholder="0.0" className="h-10"/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expected_quantity" className="text-xs">Est. Yield (Qtl)</Label>
                        <Input id="expected_quantity" type="number" step="1" value={formData.expected_quantity} onChange={e => setFormData({...formData, expected_quantity: e.target.value})} placeholder="0" className="h-10"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t mt-8">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={handleBack} className="h-12 px-6">
                  Back
                </Button>
              ) : (
                <div></div> // Empty div for flex spacing
              )}
              
              <Button type="submit" className="h-12 px-8 bg-green-700 hover:bg-green-800" disabled={loading}>
                {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                {step < 3 ? 'Continue' : 'Complete Registration'}
              </Button>
            </div>
            
            {step === 3 && (
              <div className="text-center mt-4">
                <p className="text-[11px] text-slate-500">By completing registration, I agree to the <a href="#" className="text-green-700 hover:underline">Terms & Conditions</a>.</p>
              </div>
            )}
            
          </form>
        </Card>
      </div>
    </div>
  );
}
