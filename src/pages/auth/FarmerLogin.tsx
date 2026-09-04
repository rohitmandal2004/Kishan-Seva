import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Leaf, Loader2 } from 'lucide-react';
import { MockAuthService } from '@/services/mockAuth.service';

export default function FarmerLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await MockAuthService.sendOtp(phone);
      setStep('OTP');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter a valid 6-digit OTP (Try 123456)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { isNewUser } = await MockAuthService.verifyOtp(phone, otp);
      if (isNewUser) {
        navigate('/farmer/register');
      } else {
        navigate('/farmer/dashboard');
      }
    } catch (err) {
      setError('Invalid OTP. Please try 123456 for the demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col justify-center items-center p-6">
      <Link to="/" className="flex items-center gap-2 text-green-700 mb-8 hover:opacity-80 transition-opacity">
        <Leaf className="w-8 h-8" />
        <span className="text-2xl font-bold">Kishan Seva</span>
      </Link>

      <Card className="w-full max-w-md p-8 shadow-sm border-0">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Farmer Login</h2>
          <p className="text-slate-500 text-sm">Login with OTP to book slots, track queue and manage your crops.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 text-center">
            {error}
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="Enter mobile number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                className="h-12"
              />
              <p className="text-xs text-slate-400 mt-1">For demo, use 9876543210 to load an existing profile.</p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-700 hover:bg-green-800 h-12 text-base"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Send OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="otp">Enter OTP</Label>
                <button 
                  type="button"
                  onClick={() => setStep('PHONE')}
                  className="text-xs text-green-700 hover:underline"
                >
                  Change Number
                </button>
              </div>
              <Input 
                id="otp" 
                type="text" 
                placeholder="Enter 6-digit OTP" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="h-12 text-center text-lg tracking-[0.25em]"
              />
              <p className="text-xs text-slate-400 mt-1">Hint: Use 123456</p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-700 hover:bg-green-800 h-12 text-base"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Verify & Login
            </Button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-slate-500">
          New to Kishan Seva? <button onClick={() => {setPhone('9999999999'); setOtp('123456'); handleVerifyOtp(new Event('submit') as any);}} className="text-green-700 font-medium hover:underline">Create Farmer Account</button>
        </div>
      </Card>
    </div>
  );
}
