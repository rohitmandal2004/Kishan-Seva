import { Link } from 'react-router-dom';
import { Home, Leaf, Building2, Shield, Phone, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/services/i18n';
import { LanguageSelector } from '@/components/ui/language-selector';

export default function NotFound() {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 flex flex-col justify-center items-center p-6 relative">
      {/* Top Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 font-semibold transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs"
        >
          <Home className="w-4 h-4 text-emerald-600" /> {t('nav_home')}
        </Link>
        <LanguageSelector variant="pill" />
      </div>

      <Card className="w-full max-w-2xl p-8 sm:p-10 shadow-xl border border-slate-200/80 rounded-3xl bg-white text-center">
        {/* Large Logo */}
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-3xl bg-white border-2 border-emerald-100 shadow-md">
            <img src="/logo.svg" alt="Kishan Seva" className="w-20 h-20 object-contain" />
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase tracking-wider mb-3 border border-amber-200">
          <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
          {lang === 'bn' ? 'ত্রুটি ৪০৪ • পৃষ্ঠা পাওয়া যায়নি' : lang === 'hi' ? 'त्रुटि 404 • पृष्ठ नहीं मिला' : 'Error 404 • Route Not Found'}
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
          {lang === 'bn' 
            ? 'পৃষ্ঠাটি খুঁজে পাওয়া যায়নি' 
            : lang === 'hi' 
            ? 'यह पृष्ठ उपलब्ध नहीं है' 
            : 'Page or Route Not Found'}
        </h1>

        <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          {lang === 'bn'
            ? 'আপনি যে পাতাটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা ঠিকানাটি ভুল হয়েছে। নিচের লিঙ্কগুলি থেকে আপনার কাঙ্ক্ষিত পোর্টালে সরাসরি প্রবেশ করুন।'
            : lang === 'hi'
            ? 'आप जिस पृष्ठ की तलाश कर रहे हैं वह हटा दिया गया है या पता गलत है। कृपया नीचे दिए गए विकल्पों में से चुनें।'
            : 'The page you requested may have moved or the URL might have a typo. Please select one of the authorized digital procurement portals below:'}
        </p>

        {/* Portal Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8 text-left">
          <Link 
            to="/farmer/dashboard" 
            className="p-4 rounded-2xl border-2 border-emerald-100 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Leaf className="w-5 h-5 text-emerald-700" />
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs font-bold text-emerald-900">{t('role_farmer_title')}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Slot booking & Live Queue</p>
          </Link>

          <Link 
            to="/operator/dashboard" 
            className="p-4 rounded-2xl border-2 border-blue-100 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-5 h-5 text-blue-700" />
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs font-bold text-blue-900">{t('role_operator_title')}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Gate check-in & Weighbridge</p>
          </Link>

          <Link 
            to="/admin/dashboard" 
            className="p-4 rounded-2xl border-2 border-purple-100 hover:border-purple-600 bg-purple-50/40 hover:bg-purple-50 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-purple-700" />
              <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs font-bold text-purple-900">{t('role_admin_title')}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Targets & Financial logs</p>
          </Link>
        </div>

        {/* Home Button */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-[#143d23] hover:bg-[#0b2415] text-white rounded-xl px-6 h-11 text-xs font-bold gap-2 shadow-sm">
              <Home className="w-4 h-4" />
              {lang === 'bn' ? 'মূল পাতায় ফিরে যান' : lang === 'hi' ? 'मुख्य पृष्ठ पर जाएं' : 'Return to Kishan Seva Home'}
            </Button>
          </Link>
          <Link to="/roles" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 rounded-xl px-6 h-11 text-xs font-bold">
              {lang === 'bn' ? 'পোর্টাল নির্বাচন করুন' : lang === 'hi' ? 'भूमिका चयन' : 'Select Portal Role'}
            </Button>
          </Link>
        </div>

        {/* Helpline */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-center gap-2">
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Kisan Call Centre Toll-Free Helpline: <strong className="text-slate-800 font-bold">1800-180-1551</strong></span>
        </div>
      </Card>
    </div>
  );
}
