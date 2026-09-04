import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react';
import { SupabaseAuthService } from '@/services/supabaseAuth.service';
import { mockStore } from '@/services/mockStore';
import { useLanguage } from '@/services/i18n';
import { LanguageSelector } from '@/components/ui/language-selector';
import { SupabaseStatusBadge } from '@/components/ui/supabase-status-dialog';

export default function FarmerLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickDemoLogin = () => {
    mockStore.login('9876543210');
    navigate('/farmer/dashboard');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await SupabaseAuthService.sendOtp(phone);
      setStep('OTP');
      setOtp('123456'); // Auto-fill for convenience
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter a valid 6-digit OTP (Enter 123456)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { isNewUser } = await SupabaseAuthService.verifyOtp(phone, otp);
      if (isNewUser) {
        navigate('/farmer/register');
      } else {
        navigate('/farmer/dashboard');
      }
    } catch {
      setError('Invalid OTP. Please enter 123456 for the demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Top Bar with Language Selector and Supabase Badge */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 font-semibold transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" /> {t('back_to_home')}
        </Link>
        <div className="flex items-center gap-2">
          <SupabaseStatusBadge />
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
            {t('login_auth_badge')}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3 mb-1">
            {t('farmer_login_title')}
          </h2>
          <p className="text-slate-500 text-xs">
            {t('farmer_login_subtitle')}
          </p>
        </div>

        {/* Quick Demo Login Highlight */}
        <div className="mb-6 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <p className="text-xs font-bold text-emerald-900 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> {t('demo_account')}
            </p>
            <p className="text-[11px] text-emerald-700">Rohit Mandal (Basirhat, WB)</p>
          </div>
          <Button 
            onClick={handleQuickDemoLogin}
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl h-8 px-3 shadow-xs justify-center"
          >
            {t('one_click_login')} ⚡
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200 text-center">
            {error}
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                {t('mobile_label')}
              </Label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
                  +91
                </span>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder={t('mobile_placeholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  className="h-11 rounded-xl text-sm font-semibold tracking-wide"
                />
              </div>
              <p className="text-[11px] text-slate-400">Demo number: <strong>9876543210</strong></p>
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
                  onClick={() => setStep('PHONE')}
                  className="text-xs text-emerald-700 font-semibold hover:underline"
                >
                  {t('change_number')}
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-1">{t('otp_desc')} +91 {phone}</p>
              <Input 
                id="otp" 
                type="text" 
                placeholder="• • • • • •" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="h-12 rounded-xl text-center text-xl font-bold tracking-[0.3em]"
              />
              <p className="text-[11px] text-emerald-700 font-semibold text-center">Demo OTP: 123456</p>
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
