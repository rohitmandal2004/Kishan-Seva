import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSignUp, useClerk } from '@clerk/clerk-react';

export default function FarmerRegistration() {
  const navigate = useNavigate();
  const { signUp, isLoaded, setActive } = useSignUp();
  const { signOut } = useClerk();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    aadhaar: '',
    state: 'West Bengal',
    district: '',
    village: '',
    land_area_acres: '',
    crop_name: 'Paddy (Dhan)',
    crop_area: '',
    expected_quantity: ''
  });

  const handleNext = async () => {
    if (step === 1 && !otpSent) {
      if (!formData.full_name || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      setLoading(true);
      try {
        if (!isLoaded) return;
        
        // Ensure any existing session is signed out before creating a new one
        await signOut();
        
        // 1. Create Clerk user
        await signUp.create({
          emailAddress: formData.email,
        });

        // 2. Prepare email verification
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        
        setOtpSent(true);
        toast.success(`Verification code sent to ${formData.email}`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.errors?.[0]?.message || 'Failed to start registration. Email might be in use.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 1 && otpSent) {
      if (otp.length !== 6) {
        toast.error('Please enter a valid 6-digit OTP');
        return;
      }
      
      setLoading(true);
      try {
        if (!isLoaded) return;
        
        // 3. Verify OTP
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: otp,
        });
        
        if (completeSignUp.status === 'missing_requirements') {
          throw new Error('Clerk configuration error: Password or other fields are required. Please disable passwords in your Clerk Dashboard under Authentication -> Email, Phone, Web3.');
        }

        if (completeSignUp.status !== 'complete') {
          throw new Error(`Unable to verify email. Status: ${completeSignUp.status}`);
        }

        // Keep session inactive until profile is fully completed in step 3
        setStep(2);
        toast.success('Email verified successfully!');
      } catch (err: any) {
        console.error("Clerk Verification Error:", err);
        // If it's our custom error string, use it. Otherwise, look for Clerk API error.
        const errorMsg = err instanceof Error ? err.message : (err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid verification code');
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 2) {
      if (formData.aadhaar.length !== 12) {
        toast.error('Aadhaar must be exactly 12 digits');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 1 && otpSent) setOtpSent(false);
    else if (step === 2) { setStep(1); setOtpSent(true); }
    else if (step === 3) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }
    
    setLoading(true);
    try {
      if (!isLoaded || !signUp.createdSessionId) {
        throw new Error(`Clerk registration incomplete: ${signUp?.status || 'No session ID'}`);
      }

      // Activate the Clerk session
      await setActive({ session: signUp.createdSessionId });

      // Save farmer profile to Supabase
      const code = `KIS-FMR-${Math.floor(10000 + Math.random() * 90000)}`;
      const { error: dbError } = await supabase.from('farmer_profiles').upsert({
        clerk_user_id: signUp.createdUserId,
        farmer_code: code,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || '',
        aadhaar_reference: 'VERIFIED',
        aadhaar_last_four: formData.aadhaar.slice(-4),
        state: formData.state,
        district: formData.district,
        village: formData.village,
        land_area_acres: parseFloat(formData.land_area_acres) || 4.0,
        verification_status: 'VERIFIED',
        role: 'FARMER'
      }, { onConflict: 'clerk_user_id' });

      if (dbError) {
        throw new Error('Failed to create farmer profile in database: ' + dbError.message);
      }
      
      toast.success('Registration successful! Welcome to Kishan Seva.');
      navigate('/farmer/dashboard');
    } catch (error: any) {
      console.error("Profile creation error:", error);
      toast.error(error.message || 'Profile creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col md:flex-row font-sans">
      {/* Sidebar / Info Panel */}
      <div className="w-full md:w-1/3 bg-green-900 text-white p-5 sm:p-8 md:p-12 flex flex-col relative overflow-hidden">
        <Link to="/farmer/login" className="flex items-center gap-2 text-green-100 hover:text-white mb-6 md:mb-12 z-10 w-fit text-xs sm:text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        
        <div className="z-10">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="p-2 rounded-2xl bg-white/10 backdrop-blur border border-white/20 shrink-0">
              <img src="/logo.svg" alt="Kishan Seva" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-none">Kishan <span className="text-emerald-400">Seva</span></h1>
              <p className="text-xs text-green-200 mt-0.5">Farmer Registration</p>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4">Farmer Registration</h2>
          <p className="text-green-100 text-xs sm:text-sm md:text-base mb-4 md:mb-8">Join Kishan Seva and get guaranteed MSP prices for your produce.</p>
          
          <ul className="space-y-3 sm:space-y-4 md:space-y-6">
            <li className={`flex items-start gap-3 sm:gap-4 transition-opacity ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-xs sm:text-sm ${step > 1 ? 'bg-green-500 text-white' : step === 1 ? 'bg-white text-green-900' : 'bg-green-800 text-green-300'}`}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div>
                <h4 className="font-semibold text-sm sm:text-base md:text-lg leading-tight">Basic Details & OTP</h4>
                <p className="text-green-200 text-xs">Name and email verification</p>
              </div>
            </li>
            
            <li className={`flex items-start gap-3 sm:gap-4 transition-opacity ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-xs sm:text-sm ${step > 2 ? 'bg-green-500 text-white' : step === 2 ? 'bg-white text-green-900' : 'bg-green-800 text-green-300'}`}>
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div>
                <h4 className="font-semibold text-sm sm:text-base md:text-lg leading-tight">Identity Verification</h4>
                <p className="text-green-200 text-xs">Aadhaar details for authenticity</p>
              </div>
            </li>
            
            <li className={`flex items-start gap-3 sm:gap-4 transition-opacity ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-xs sm:text-sm ${step === 3 ? 'bg-white text-green-900' : 'bg-green-800 text-green-300'}`}>
                3
              </div>
              <div>
                <h4 className="font-semibold text-sm sm:text-base md:text-lg leading-tight">Land & Crops</h4>
                <p className="text-green-200 text-xs">Add your cultivation details</p>
              </div>
            </li>
          </ul>
        </div>
        
        {/* Decorative background */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-800 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 p-4 sm:p-6 md:p-12 flex flex-col justify-center max-w-3xl mx-auto w-full">
        <div className="justify-end items-center gap-3 text-emerald-800 mb-8 hidden md:flex">
          <div className="p-2 rounded-2xl bg-white border-2 border-emerald-100 shadow-md">
            <img src="/logo.svg" alt="Kishan Seva" className="h-14 w-14 object-contain" />
          </div>
          <span className="text-2xl font-black text-[#143d23]">Kishan <span className="text-emerald-600">Seva</span></span>
        </div>

        <Card className="p-5 sm:p-8 shadow-sm border border-slate-200/80 rounded-3xl bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold text-slate-900 border-b pb-2">Basic Details</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name (as per Aadhaar)</Label>
                    <Input id="full_name" required disabled={otpSent} value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Enter your full name" className="h-12"/>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-600" /> Email Address</Label>
                      <Input id="email" type="email" required disabled={otpSent} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} placeholder="farmer@example.com" className="h-12 font-medium"/>
                      {!otpSent && <p className="text-[10px] text-slate-500">You will need to verify this email with an OTP.</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number</Label>
                      <Input id="phone" required type="tel" disabled={otpSent} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} placeholder="Enter 10-digit mobile number" className="h-12"/>
                    </div>
                  </div>
                  
                  {otpSent && (
                    <div className="mt-6 p-5 border border-emerald-100 bg-emerald-50/50 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="text-emerald-800 font-bold">Enter 6-digit OTP sent to {formData.email}</Label>
                        <Input 
                          id="otp" 
                          required 
                          value={otp} 
                          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                          maxLength={6} 
                          placeholder="● ● ● ● ● ●" 
                          className="h-14 text-center text-2xl font-black tracking-[0.3em] bg-white border-emerald-200 focus-visible:ring-emerald-500"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}
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
                    <Label className="mb-4 block text-base font-semibold">Primary Crop Detail</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t mt-8">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={handleBack} className="h-11 sm:h-12 px-6 justify-center">
                  Back
                </Button>
              ) : (
                <div className="hidden sm:block"></div>
              )}
              
              <Button type="submit" className="h-11 sm:h-12 px-8 bg-green-700 hover:bg-green-800 text-white font-bold justify-center shadow-md" disabled={loading}>
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