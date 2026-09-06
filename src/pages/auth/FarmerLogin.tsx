import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, ChevronLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/services/i18n';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useSignIn, useClerk } from '@clerk/clerk-react';
import { useSupabase } from '@/context/SupabaseContext';

const OTP_RESEND_COOLDOWN = 30; // seconds

export default function FarmerLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const clerk = useClerk();
  const { signIn, isLoaded, setActive } = useSignIn();
  const { user, farmer, isConfigured, isProfileLoading, refreshProfile, signOut, fetchFarmerProfile } = useSupabase();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-redirect if already logged in with a valid session and profile
  useEffect(() => {
    if (isConfigured && !isProfileLoading && user && user.role === 'FARMER') {
      if (farmer) {
        navigate('/farmer/dashboard', { replace: true });
      }
    }
  }, [user, farmer, isConfigured, isProfileLoading, navigate]);

  const handleSendOtp = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length < 5) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Check isLoaded BEFORE setting loading to avoid stuck state
    if (!isLoaded || !signIn) {
      toast.error('Authentication is still loading. Please wait.');
      return;
    }

    setLoading(true);
    try {
      // Start the sign-in process with Clerk using normalized email identifier
      const result = await signIn.create({
        identifier: cleanEmail,
      });

      // Find the email_code first factor and prepare it
      const emailCodeFactor = result.supportedFirstFactors?.find(
        (f: any) => f.strategy === 'email_code'
      );

      if (!emailCodeFactor) {
        throw new Error('Email OTP is not available for this account. Please check your Clerk dashboard configuration.');
      }

      await signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: (emailCodeFactor as any).emailAddressId,
      });
      
      toast.success(`OTP sent to ${cleanEmail}`);
      setStep('OTP');
      setOtp('');
      setResendCooldown(OTP_RESEND_COOLDOWN);
    } catch (err: any) {
      console.error('[Kishan Seva] Login OTP send error:', err);
      const clerkError = err.errors?.[0];
      const isNotFound = 
        clerkError?.code === 'form_identifier_not_found' ||
        clerkError?.code === 'identifier_not_found' ||
        clerkError?.code?.includes('not_found') ||
        clerkError?.message?.toLowerCase().includes("couldn't find") ||
        clerkError?.message?.toLowerCase().includes("not found");

      if (isNotFound) {
        toast.error('Account not found. Please register first.', {
          action: {
            label: 'Register New Farmer Profile',
            onClick: () => navigate('/farmer/register'),
          },
        });
        return;
      } else if (clerkError?.code === 'session_exists') {
        // User already has an active Clerk session
        toast.info('Active session detected. Checking profile...');
        await refreshProfile();
        if (farmer) {
          navigate('/farmer/dashboard', { replace: true });
        } else {
          navigate('/farmer/register', { replace: true });
        }
        return;
      } else {
        toast.error(clerkError?.message || 'Unable to send verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, isLoaded, signIn, refreshProfile, farmer, navigate]);

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0 || !isLoaded || !signIn) return;
    
    setLoading(true);
    try {
      // Re-prepare the first factor to resend OTP
      const emailCodeFactor = signIn.supportedFirstFactors?.find(
        (f: any) => f.strategy === 'email_code'
      );
      if (!emailCodeFactor) {
        throw new Error('Email code factor not available');
      }
      await signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: (emailCodeFactor as any).emailAddressId,
      });
      setOtp('');
      setResendCooldown(OTP_RESEND_COOLDOWN);
      toast.success('New verification code sent');
    } catch (err: any) {
      console.error('[Kishan Seva] Resend OTP error:', err);
      toast.error(err.errors?.[0]?.message || 'Unable to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [resendCooldown, isLoaded, signIn]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    if (!isLoaded || !signIn) {
      toast.error('Authentication is still loading. Please wait.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: otp,
      });

      if (result.status === 'complete') {
        // Activate the Clerk session
        if (setActive && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }

        const clerkUserId = clerk.user?.id || clerk.session?.user?.id || '';
        const cleanEmail = email.trim().toLowerCase();

        // Query Supabase for farmer profile
        const profile = await fetchFarmerProfile(clerkUserId, cleanEmail);

        if (profile) {
          await refreshProfile();
          toast.success('Welcome back to Kishan Seva!');
          navigate('/farmer/dashboard', { replace: true });
        } else {
          // Clerk user exists, but no farmer profile in Supabase
          toast.info('Your farmer profile is incomplete. Please complete registration.');
          navigate('/farmer/register', { replace: true });
        }
      } else {
        throw new Error('Verification could not be completed. Please try again.');
      }
    } catch (err: any) {
      console.error('[Kishan Seva] OTP verification error:', err);
      const clerkError = err.errors?.[0];
      if (clerkError?.code === 'form_code_incorrect') {
        toast.error('Invalid OTP. Please try again.');
      } else if (clerkError?.code === 'verification_expired') {
        toast.error('OTP expired. Please request a new code.');
        setOtp('');
      } else {
        toast.error(clerkError?.message || err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep('EMAIL');
    setOtp('');
    setResendCooldown(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      {/* Top Bar with Language Selector */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 font-semibold transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" /> {t('back_to_home')}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector variant="pill" className="shadow-xs text-xs" />
        </div>
      </div>

      {/* Prominent Large Logo Branding */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-3.5 mb-6 text-center sm:text-left">
        <div className="p-2 sm:p-2.5 rounded-3xl bg-white border-2 border-emerald-100 shadow-md hover:scale-105 transition-transform shrink-0">
          <img 
            src="/logo.svg" 
            alt="Kishan Seva Official Emblem" 
            className="w-14 h-14 sm:w-20 sm:h-20 object-contain" 
          />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#143d23] leading-none">
            Kishan <span className="text-emerald-600">Seva</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {t('role_farmer_title')}
          </p>
        </div>
      </div>

      <Card className="w-full max-w-md p-5 sm:p-8 shadow-xl border border-slate-200/80 rounded-3xl bg-white relative">
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Email OTP Verification
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3 mb-1">
            {t('farmer_login_title')}
          </h2>
          <p className="text-slate-500 text-xs">
            Enter your email to receive a one-time verification code for secure access.
          </p>
        </div>

        {user && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-900 font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">Active account: <strong>{user.email || user.id}</strong></span>
            </div>
            <p className="text-[11px] text-emerald-700/80 mb-3">
              {farmer 
                ? 'Your profile is loaded and ready.' 
                : 'Authenticated, but farmer profile registration is needed.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => navigate(farmer ? '/farmer/dashboard' : '/farmer/register')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 px-3.5 rounded-xl font-bold shadow-xs"
              >
                {farmer ? 'Go to Dashboard →' : 'Complete Registration →'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={async () => {
                  await signOut();
                  toast.info('Signed out successfully');
                }}
                className="text-xs h-8 px-3 rounded-xl border-slate-300 text-slate-700 hover:bg-white"
              >
                Sign Out
              </Button>
            </div>
          </div>
        )}

        {step === 'EMAIL' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                {t('email_label')}
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="farmer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
                autoFocus
                className="h-11 rounded-xl text-sm font-semibold tracking-wide"
              />
              <p className="text-[10px] text-slate-400">A 6-digit one-time security code will be sent to this email inbox.</p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-11 text-xs font-bold shadow-md gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t('send_otp_btn')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="otp" className="text-xs font-bold text-slate-700">
                  {t('enter_otp')}
                </Label>
                <button 
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-xs text-emerald-700 font-semibold hover:underline"
                >
                  {t('change_email')}
                </button>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Sent to <strong className="text-slate-900">{email}</strong></span>
              </div>
              <Input 
                id="otp" 
                type="text" 
                placeholder="● ● ● ● ● ●" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                autoFocus
                className="h-12 rounded-xl text-center text-xl font-bold tracking-[0.3em]"
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-500 font-semibold">
                  Check your email inbox for the 6-digit code
                </p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-[11px] text-emerald-700 font-bold hover:underline disabled:text-slate-400 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-11 text-xs font-bold shadow-md gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t('verify_continue_btn')}
            </Button>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          First time on the portal?{' '}
          <Link to="/farmer/register" className="text-emerald-700 font-bold hover:underline">
            Register New Farmer Profile
          </Link>
        </div>
      </Card>
      
      <p className="text-[11px] text-slate-400 mt-6 text-center max-w-sm">
        {t('login_gov_footer')}
      </p>
    </div>
  );
}
