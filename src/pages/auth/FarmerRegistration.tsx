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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KishanSevaLogo } from '@/components/brand/KishanSevaLogo';

const OTP_RESEND_COOLDOWN = 30;

function generateFarmerCode(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `KIS-FMR-${ts}${rand}`;
}

const registrationSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number"),
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be exactly 12 numeric digits"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(2, "District is required"),
  village: z.string().min(2, "Village is required"),
  land_area_acres: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Enter a valid positive land area"),
  crop_name: z.string().min(1, "Crop name is required"),
  crop_area: z.string().optional(),
  expected_quantity: z.string().optional()
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

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
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { register, handleSubmit, control, trigger, setValue, getValues, watch, formState: { errors } } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
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
    }
  });

  const emailValue = watch('email');

  useEffect(() => {
    if (isConfigured && !isProfileLoading && farmer) {
      navigate('/farmer/dashboard', { replace: true });
    }
  }, [farmer, isConfigured, isProfileLoading, navigate]);

  useEffect(() => {
    if (clerkUserLoaded && isSignedIn && clerkUser) {
      const userEmail = clerkUser.primaryEmailAddress?.emailAddress || '';
      const userName = clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      setValue('email', getValues('email') || userEmail);
      setValue('full_name', getValues('full_name') || userName);
      setEmailVerified(true);
      setOtpSent(true);
    }
  }, [clerkUserLoaded, isSignedIn, clerkUser, setValue, getValues]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const sendRegistrationOtp = async (isResend = false) => {
    if (!signUpLoaded || !signUp) {
      toast.error('Authentication is still loading. Please wait.');
      return;
    }

    const cleanEmail = emailValue.trim().toLowerCase();
    setLoading(true);
    setDuplicateEmailError(false);

    try {
      if (!isResend) {
        const { data: existingProfile } = await supabase
          .from('farmer_profiles')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingProfile) {
          setDuplicateEmailError(true);
          toast.error('Email already exists. Please log in instead.', {
            action: { label: 'Go to Login', onClick: () => navigate('/farmer/login') },
          });
          return;
        }

        await signUp.create({ emailAddress: cleanEmail });
      }

      await signUp.prepareVerification({ strategy: 'email_code' });
      
      setOtpSent(true);
      setResendCooldown(OTP_RESEND_COOLDOWN);
      toast.success(isResend ? 'New verification code sent' : `Verification code sent to ${cleanEmail}`);
    } catch (err: any) {
      console.error('[Kishan Seva] Registration OTP error:', err);
      const clerkError = err.errors?.[0];
      const isDuplicate = clerkError?.code === 'form_identifier_exists' || clerkError?.code?.includes('exists');

      if (isDuplicate) {
        setDuplicateEmailError(true);
        toast.error('Email already exists. Please log in instead.', {
          action: { label: 'Go to Login', onClick: () => navigate('/farmer/login') },
        });
      } else if (clerkError?.code === 'session_exists') {
        setEmailVerified(true);
        setOtpSent(true);
        toast.info('Your session is active. Proceeding to profile details.');
        setStep(2);
      } else {
        toast.error(clerkError?.message || 'Failed to send verification code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = () => {
    setOtpSent(false);
    setOtp('');
    setEmailVerified(false);
    setCreatedSessionId(null);
    setDuplicateEmailError(false);
    setResendCooldown(0);
  };

  const onNextStep = async () => {
    if (step === 1 && (emailVerified || (isSignedIn && clerkUser))) {
      const valid = await trigger(['full_name', 'phone']);
      if (valid) setStep(2);
      return;
    }

    if (step === 1 && !otpSent) {
      const valid = await trigger(['full_name', 'email', 'phone']);
      if (valid) await sendRegistrationOtp(false);
      return;
    }

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
        const completeSignUp = await signUp.attemptVerification({ strategy: 'email_code', code: otp });
        
        if (completeSignUp.status === 'missing_requirements') {
          throw new Error('Clerk configuration error: Password or other fields are required.');
        }

        if (completeSignUp.status !== 'complete') {
          throw new Error(`Unable to verify email. Status: ${completeSignUp.status}`);
        }

        if (completeSignUp.createdSessionId) {
          setCreatedSessionId(completeSignUp.createdSessionId);
        }
        setEmailVerified(true);
        setStep(2);
        toast.success('Email verified successfully!');
      } catch (err: any) {
        console.error('[Kishan Seva] Verification error:', err);
        const clerkError = err.errors?.[0];
        if (clerkError?.code === 'form_code_incorrect') {
          toast.error('Invalid OTP. Please try again.');
        } else if (clerkError?.code === 'verification_expired') {
          toast.error('OTP expired. Please request a new code.');
          setOtp('');
        } else {
          toast.error('Verification failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 2) {
      const valid = await trigger(['aadhaar']);
      if (valid) setStep(3);
    }
  };

  const onSubmitFinal = async (data: RegistrationFormData) => {
    if (step < 3) {
      onNextStep();
      return;
    }

    setLoading(true);
    try {
      let clerkUserId: string | undefined = clerkUser?.id || user?.id;

      if (!clerkUserId) {
        const sessionId = createdSessionId || signUp?.createdSessionId;
        if (!sessionId) {
          throw new Error('No session was created during registration. Please try again.');
        }
        if (setActive) {
          await setActive({ session: sessionId });
        }
        clerkUserId = signUp?.createdUserId || undefined;
      }

      if (!clerkUserId) {
        throw new Error('Unable to obtain user identity. Please try again.');
      }

      const cleanEmail = (data.email || clerkUser?.primaryEmailAddress?.emailAddress || '').trim().toLowerCase();
      const cleanPhone = data.phone.trim().replace(/\D/g, '');

      const { data: existingFarmer } = await supabase
        .from('farmer_profiles')
        .select('farmer_code')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

      const farmerCode = existingFarmer?.farmer_code || generateFarmerCode();

      const { data: savedProfile, error: dbError } = await supabase.from('farmer_profiles').upsert({
        clerk_user_id: clerkUserId,
        farmer_code: farmerCode,
        full_name: data.full_name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        aadhaar_reference: 'VERIFIED',
        aadhaar_last_four: data.aadhaar ? data.aadhaar.slice(-4) : '0000',
        state: data.state || 'West Bengal',
        district: data.district.trim(),
        village: data.village.trim(),
        land_area_acres: parseFloat(data.land_area_acres) || 0,
        crop_name: data.crop_name || 'Paddy (Dhan)',
        crop_area_acres: data.crop_area ? parseFloat(data.crop_area) : null,
        expected_quantity_quintals: data.expected_quantity ? parseFloat(data.expected_quantity) : null,
        verification_status: 'VERIFIED',
        role: 'FARMER'
      }, { onConflict: 'clerk_user_id' }).select().single();

      if (dbError) {
        throw new Error(`Unable to save your farmer profile. ${dbError.message || ''}`);
      }
      
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

  const handleBack = () => {
    if (step === 1 && otpSent && !emailVerified) {
      handleEmailChange();
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col md:flex-row font-sans">
      <div className="w-full md:w-1/3 bg-green-900 text-white p-5 sm:p-8 md:p-12 flex flex-col relative overflow-hidden">
        <Link to="/farmer/login" className="flex items-center gap-2 text-green-100 hover:text-white mb-6 md:mb-12 z-10 w-fit text-xs sm:text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        <div className="z-10">
          <div className="mb-4 md:mb-6">
            <KishanSevaLogo size="lg" theme="dark" showSubtitle={false} />
            <p className="text-xs text-green-200 mt-1 ml-1.5 font-bold tracking-wide">Farmer Registration Portal</p>
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
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-800 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      </div>

      <div className="flex-1 p-4 sm:p-6 md:p-12 flex flex-col justify-center max-w-3xl mx-auto w-full">
        <Card className="p-5 sm:p-8 shadow-sm border border-slate-200/80 rounded-3xl bg-white">
          <form onSubmit={handleSubmit(onSubmitFinal)} className="space-y-6">
            
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
                          setValue('email', '');
                          setValue('full_name', '');
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
                    <Input id="full_name" {...register('full_name')} placeholder="Enter your full name" className="h-12"/>
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-600" /> Email Address</Label>
                      <Input id="email" type="email" disabled={emailVerified || (otpSent && !emailVerified)} {...register('email')} onChange={e => { setValue('email', e.target.value.toLowerCase()); setDuplicateEmailError(false); }} placeholder="farmer@example.com" className="h-12 font-medium"/>
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      {duplicateEmailError && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between mt-1">
                          <span>Email already exists.</span>
                          <Link to="/farmer/login" className="font-bold text-emerald-700 hover:underline">
                            Go to Login →
                          </Link>
                        </div>
                      )}
                      {!otpSent && !duplicateEmailError && !errors.email && <p className="text-[10px] text-slate-500">You will need to verify this email with an OTP.</p>}
                      {emailVerified && (
                        <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Email verified
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number</Label>
                      <Input id="phone" type="tel" {...register('phone')} onChange={e => setValue('phone', e.target.value.replace(/\D/g, ''))} placeholder="Enter 10-digit mobile number" className="h-12"/>
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>
                  
                  {otpSent && !emailVerified && (
                    <div className="mt-6 p-5 border border-emerald-100 bg-emerald-50/50 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="text-emerald-800 font-bold">Enter 6-digit OTP sent to {emailValue}</Label>
                        <Input 
                          id="otp" 
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
                    <Input id="aadhaar" {...register('aadhaar')} onChange={e => setValue('aadhaar', e.target.value.replace(/\D/g, ''))} maxLength={12} placeholder="Enter 12 digit Aadhaar number" className="h-12 tracking-widest"/>
                    {errors.aadhaar && <p className="text-red-500 text-xs mt-1">{errors.aadhaar.message}</p>}
                    <p className="text-xs text-slate-500">Your Aadhaar details are securely stored and will not be displayed publicly.</p>
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
                      <Controller
                        control={control}
                        name="state"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        )}
                      />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Input id="district" {...register('district')} placeholder="e.g. North 24 Parganas" className="h-12"/>
                      {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="village">Village</Label>
                      <Input id="village" {...register('village')} placeholder="e.g. Basirhat" className="h-12"/>
                      {errors.village && <p className="text-red-500 text-xs mt-1">{errors.village.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="land_area_acres">Total Land Area (Acres)</Label>
                      <Input id="land_area_acres" type="number" step="0.1" {...register('land_area_acres')} placeholder="e.g. 4.5" className="h-12"/>
                      {errors.land_area_acres && <p className="text-red-500 text-xs mt-1">{errors.land_area_acres.message}</p>}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t mt-4">
                    <Label className="mb-4 block text-base font-semibold">Primary Crop Detail</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="crop_name" className="text-xs">Crop Name</Label>
                        <Controller
                          control={control}
                          name="crop_name"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select crop" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Paddy (Dhan)">Paddy (Dhan)</SelectItem>
                                <SelectItem value="Wheat (Gehu)">Wheat (Gehu)</SelectItem>
                                <SelectItem value="Mustard (Sarson)">Mustard (Sarson)</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.crop_name && <p className="text-red-500 text-xs mt-1">{errors.crop_name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crop_area" className="text-xs">Area (Acres)</Label>
                        <Input id="crop_area" type="number" step="0.1" {...register('crop_area')} placeholder="0.0" className="h-10"/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expected_quantity" className="text-xs">Est. Yield (Qtl)</Label>
                        <Input id="expected_quantity" type="number" step="1" {...register('expected_quantity')} placeholder="0" className="h-10"/>
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
              
              <Button type="button" onClick={step < 3 ? onNextStep : handleSubmit(onSubmitFinal)} className="h-11 sm:h-12 px-8 bg-green-700 hover:bg-green-800 text-white font-bold justify-center shadow-md" disabled={loading}>
                {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                {step < 3 ? 'Continue' : 'Complete Registration'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
