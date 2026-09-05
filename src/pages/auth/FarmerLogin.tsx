import { useState, useEffect } from 'react';
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

export default function FarmerLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signIn, isLoaded, setActive } = useSignIn();
  const { signOut: clerkSignOut } = useClerk();
  const { user, farmer, isConfigured, isProfileLoading } = useSupabase();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isConfigured && user && user.role === 'FARMER' && !isProfileLoading) {
      if (farmer) {
        navigate('/farmer/dashboard');
      } else {
        navigate('/farmer/register');
      }
    }
  }, [user, farmer, isConfigured, isProfileLoading, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length < 5) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      if (!isLoaded) return;

      // Clear any existing stale sessions before trying to sign in
      await clerkSignOut();

      // Start the sign-in process with Clerk using Email OTP
      await signIn.create({
        identifier: cleanEmail,
        strategy: 'email_code',
      });
      
      toast.success(`OTP sent to ${cleanEmail}`);
      setStep('OTP');
    } catch (err: any) {
      console.error(err);
      // If the user doesn't exist, Clerk returns an error (usually form_identifier_not_found)
      if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        toast.error('Account not found. Please register your profile first.');
      } else {
        toast.error(err.errors?.[0]?.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    try {
      if (!isLoaded) return;

      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: otp,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast.success('Welcome back to Kishan Seva!');
        // Navigation is handled automatically by the useEffect listening to the `user` state
      } else {
        throw new Error('Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.errors?.[0]?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
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
                  onClick={() => { setStep('EMAIL'); setOtp(''); }}
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
              <p className="text-[11px] text-slate-500 font-semibold text-center">
                Check your email inbox for the 6-digit verification code
              </p>
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
