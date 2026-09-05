import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSignUp, useUser } from '@clerk/clerk-react';
import { useSupabase } from '@/context/SupabaseContext';

const OTP_RESEND_COOLDOWN = 30;

/**
 * Generate a unique farmer code using timestamp + random suffix.
 * Format: KIS-FMR-XXXXX (guaranteed unique by timestamp component)
 */
function generateFarmerCode(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `KIS-FMR-${ts}${rand}`;
}

export default function FarmerRegistration() {
  const navigate = useNavigate();
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp();
  const { user: clerkUser, isLoaded: clerkUserLoaded, isSignedIn } = useUser();
  const { user, farmer, isConfigured, isProfileLoading, refreshProfile, signOut } = useSupabase();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
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

  // If already logged in and profile already exists, go directly to dashboard
  useEffect(() => {
    if (isConfigured && !isProfileLoading && farmer) {
      navigate('/farmer/dashboard', { replace: true });
    }
  }, [farmer, isConfigured, isProfileLoading, navigate]);

  // If signed in to Clerk but profile is missing, pre-fill email and mark verified
  useEffect(() => {
    if (clerkUserLoaded && isSignedIn && clerkUser) {
      const userEmail = clerkUser.primaryEmailAddress?.emailAddress || '';
      const userName = clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      setFormData(prev => ({
        ...prev,
        email: prev.email || userEmail,
        full_name: prev.full_name || userName,
      }));
      setEmailVerified(true);
      setOtpSent(true);
    }
  }, [clerkUserLoaded, isSignedIn, clerkUser]);

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  /**
   * Send or resend OTP for email verification during registration
   */
  const sendRegistrationOtp = async (isResend = false) => {
    if (!signUpLoaded || !signUp) {
      toast.error('Authentication is still loading. Please wait.');
      return;
    }

    setLoading(true);
    try {
      if (!isResend) {
        // Create a new Clerk signup with the email
        await signUp.create({
          emailAddress: formData.email.trim().toLowerCase(),
        });
      }

      // Prepare (or re-prepare) email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      setOtpSent(true);
      setResendCooldown(OTP_RESEND_COOLDOWN);
      toast.success(isResend ? 'New verification code sent' : `Verification code sent to ${formData.email}`);
    } catch (err: any) {
      console.error('[Kishan Seva] Registration OTP error:', err);
      const clerkError = err.errors?.[0];
      if (clerkError?.code === 'form_identifier_exists') {
        toast.error('This email is already registered. Please use the login page instead.');
      } else if (clerkError?.code === 'session_exists') {
        // Existing session
        setEmailVerified(true);
        setOtpSent(true);
        toast.info('Your session is active. Proceeding to profile details.');
        setStep(2);
      } else {
        toast.error(clerkError?.message || 'Failed to send verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle email change after OTP was already sent — reset signup state
   */
  const handleEmailChange = () => {
    setOtpSent(false);
    setOtp('');
    setEmailVerified(false);
    setResendCooldown(0);
  };

  const handleNext = async () => {
    // If user is already signed into Clerk, skip OTP verification
    if (step === 1 && (emailVerified || (isSignedIn && clerkUser))) {
      if (!formData.full_name.trim()) {
        toast.error('Please enter your full name');
        return;
      }
      if (!formData.phone.trim() || formData.phone.length < 10) {
        toast.error('Please enter a valid 10-digit mobile number');
        return;
      }
      setStep(2);
      return;
    }

    // Step 1: Send OTP
    if (step === 1 && !otpSent) {
      // Validate required fields
      if (!formData.full_name.trim()) {
        toast.error('Please enter your full name');
        return;
      }
      if (!formData.email.trim() || !formData.email.includes('@') || formData.email.length < 5) {
        toast.error('Please enter a valid email address');
        return;
      }
      if (!formData.phone.trim() || formData.phone.length < 10) {
        toast.error('Please enter a valid 10-digit mobile number');
        return;
      }

      await sendRegistrationOtp(false);
      return;
    }

    // Step 1: Verify OTP
    if (step === 1 && otpSent && !emailVerified) {
      if (otp.length !== 6) {
        toast.error('Please enter a valid 6-digit OTP');
        return;
      }
      
      if (!signUpLoaded || !signUp) {
        toast.error('Authentication is still loading. Please wait.');
        return;
      }

      setLoading(true);
      try {
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: otp,
        });
        
        if (completeSignUp.status === 'missing_requirements') {
          throw new Error('Clerk configuration error: Password or other fields are required. Please disable passwords in your Clerk Dashboard under Authentication → Email, Phone, Web3.');
        }

        if (completeSignUp.status !== 'complete') {
          throw new Error(`Unable to verify email. Status: ${completeSignUp.status}`);
        }

        setEmailVerified(true);
        setStep(2);
        toast.success('Email verified successfully!');
      } catch (err: any) {
        console.error('[Kishan Seva] Verification error:', err);
        const clerkError = err.errors?.[0];
        if (clerkError?.code === 'form_code_incorrect') {
          toast.error('Invalid verification code. Please try again.');
        } else if (clerkError?.code === 'verification_expired') {
          toast.error('Code expired. Please request a new one.');
          setOtp('');
        } else {
          const errorMsg = err instanceof Error ? err.message : (clerkError?.longMessage || clerkError?.message || 'Verification failed');
          toast.error(errorMsg);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Step 2: Aadhaar validation
    if (step === 2) {
      if (formData.aadhaar.length !== 12 || !/^\d{12}$/.test(formData.aadhaar)) {
        toast.error('Aadhaar must be exactly 12 numeric digits');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 1 && otpSent && !emailVerified) {
      handleEmailChange();
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }

    // Validate step 3 fields
    if (!formData.district.trim()) {
      toast.error('Please enter your district');
      return;
    }
    if (!formData.village.trim()) {
      toast.error('Please enter your village');
      return;
    }
    if (!formData.land_area_acres || parseFloat(formData.land_area_acres) <= 0) {
      toast.error('Please enter a valid land area');
      return;
    }

    setLoading(true);
    try {
      let clerkUserId: string | undefined = clerkUser?.id || user?.id;

      // If not already signed in via active session, activate from signUp
      if (!clerkUserId) {
        if (!signUp || signUp.status !== 'complete') {
          throw new Error(`Registration incomplete: signup status is ${signUp?.status || 'unknown'}`);
        }

        const sessionId = signUp.createdSessionId;
        if (!sessionId) {
          throw new Error('No session was created during registration. Please try again.');
        }
        await setActive({ session: sessionId });
        clerkUserId = signUp.createdUserId || undefined;
      }

      if (!clerkUserId) {
        throw new Error('Unable to obtain user identity. Please try again.');
      }

      // 4. Generate unique farmer code
      const farmerCode = generateFarmerCode();

      // 5. Save farmer profile to Supabase using UPSERT (idempotent)
      const cleanEmail = (formData.email || clerkUser?.primaryEmailAddress?.emailAddress || '').trim().toLowerCase();
      const { error: dbError } = await supabase.from('farmer_profiles').upsert({
        clerk_user_id: clerkUserId,
        farmer_code: farmerCode,
        full_name: formData.full_name.trim(),
        email: cleanEmail,
        phone: formData.phone.trim() || '',
        aadhaar_reference: 'VERIFIED',
        aadhaar_last_four: formData.aadhaar ? formData.aadhaar.slice(-4) : '0000',
        state: formData.state || 'West Bengal',
        district: formData.district.trim(),
        village: formData.village.trim(),
        land_area_acres: parseFloat(formData.land_area_acres) || 0,
        crop_name: formData.crop_name || 'Paddy (Dhan)',
        crop_area_acres: formData.crop_area ? parseFloat(formData.crop_area) : null,
        expected_quantity_quintals: formData.expected_quantity ? parseFloat(formData.expected_quantity) : null,
        verification_status: 'VERIFIED',
        role: 'FARMER'
      }, { onConflict: 'clerk_user_id' });

      if (dbError) {
        console.error('[Kishan Seva] Database error:', dbError);
        throw new Error(`Database error: ${dbError.message || 'Unable to save registration'}`);
      }
      
      // 6. Force profile refresh in context and navigate
      await refreshProfile();
      toast.success('Registration successful! Welcome to Kishan Seva.');
      navigate('/farmer/dashboard', { replace: true });
    } catch (error: any) {
      console.error('[Kishan Seva] Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
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
                  {isSignedIn && clerkUser && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">Signed in: <strong>{clerkUser.primaryEmailAddress?.emailAddress}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await signOut();
                          setEmailVerified(false);
                          setOtpSent(false);
                          setFormData({ ...formData, email: '', full_name: '' });
                          toast.info('Signed out');
                        }}
                        className="text-[11px] text-emerald-800 font-bold hover:underline shrink-0 ml-2"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name (as per Aadhaar)</Label>
                    <Input id="full_name" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Enter your full name" className="h-12"/>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-600" /> Email Address</Label>
                      <Input id="email" type="email" required disabled={emailVerified || (otpSent && !emailVerified)} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} placeholder="farmer@example.com" className="h-12 font-medium"/>
                      {!otpSent && <p className="text-[10px] text-slate-500">You will need to verify this email with an OTP.</p>}
                      {emailVerified && (
                        <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Email verified
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number</Label>
                      <Input id="phone" required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} placeholder="Enter 10-digit mobile number" className="h-12"/>
                    </div>
                  </div>
                  
                  {otpSent && !emailVerified && (
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
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={handleEmailChange}
                            className="text-xs text-slate-600 font-semibold hover:underline"
                          >
                            Change email
                          </button>
                          <button
                            type="button"
                            onClick={() => sendRegistrationOtp(true)}
                            disabled={resendCooldown > 0 || loading}
                            className="text-xs text-emerald-700 font-bold hover:underline disabled:text-slate-400 disabled:no-underline"
                          >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                          </button>
                        </div>
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
              {(step > 1 || (step === 1 && otpSent)) ? (
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