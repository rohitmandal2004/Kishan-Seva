import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatedLink } from '@/components/ui/animated-link';
import { 
  Leaf, Clock, ShieldCheck, Banknote, Users, Building2, CalendarCheck, 
  CheckCircle2, Play, Globe, User, ChevronRight, BarChart3, Sprout,
  Search, MapPin, ArrowRight, X, PhoneCall, HelpCircle, ChevronDown, Menu
} from 'lucide-react';
import { OFFICIAL_MSP_RATES } from '@/services/mockStore';
import { useMockStore } from '@/services/useMockStore';
import { useLanguage } from '@/services/i18n';
import { LanguageSelector } from '@/components/ui/language-selector';
import { SupabaseStatusBadge } from '@/components/ui/supabase-status-dialog';

export default function LandingPage() {
  const navigate = useNavigate();
  const store = useMockStore();
  const { lang, t } = useLanguage();
  
  // State
  const [centreSearch, setCentreSearch] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const centres = store.getCentres().filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(centreSearch.toLowerCase()) || 
                          c.district.toLowerCase().includes(centreSearch.toLowerCase()) ||
                          c.address.toLowerCase().includes(centreSearch.toLowerCase());
    const matchesCrop = selectedCropFilter === 'All' || c.accepted_crops.some(cr => cr.toLowerCase().includes(selectedCropFilter.toLowerCase()));
    return matchesSearch && matchesCrop;
  });

  const getCropDisplayName = (cropName: string) => {
    if (lang === 'bn') {
      if (cropName.includes('Paddy (Grade A)')) return 'ধান (গ্রেড এ)';
      if (cropName.includes('Common Paddy')) return 'সাধারণ ধান';
      if (cropName.includes('Wheat')) return 'গম';
      if (cropName.includes('Mustard')) return 'সরিষা';
      if (cropName.includes('Maize')) return 'ভুট্টা';
      if (cropName.includes('Gram')) return 'ছোলা';
      if (cropName.includes('Jute')) return 'পাট';
    } else if (lang === 'hi') {
      if (cropName.includes('Paddy (Grade A)')) return 'धान (ग्रेड ए)';
      if (cropName.includes('Common Paddy')) return 'सामान्य धान';
      if (cropName.includes('Wheat')) return 'गेहूं';
      if (cropName.includes('Mustard')) return 'सरसों';
      if (cropName.includes('Maize')) return 'मक्का';
      if (cropName.includes('Gram')) return 'चना';
    }
    return cropName;
  };

  const faqs = [
    {
      q: lang === 'bn' 
        ? "ডিজিটাল সংগ্রহের জন্য কী কী সরকারি নথি প্রয়োজন?"
        : lang === 'hi' 
        ? "डिजिटल खरीद के लिए कौन से दस्तावेज आवश्यक हैं?" 
        : "What documents are required for digital procurement?",
      a: lang === 'bn'
        ? "আপনার আধার কার্ড, আধার-সংযুক্ত মোবাইল নম্বর, জমির খতিয়ান/দাগ নম্বর এবং সরাসরি ব্যাংক ট্রান্সফারের (DBT) জন্য সক্রিয় ব্যাংক অ্যাকাউন্ট ও IFSC কোড প্রয়োজন।"
        : lang === 'hi'
        ? "आपको केवल अपना आधार नंबर, मोबाइल नंबर (आधार से जुड़ा), भूमि रिकॉर्ड (खाता/खेसरा नंबर) और सीधे डीबीटी ट्रांसफर के लिए सक्रिय बैंक खाता विवरण चाहिए।"
        : "You only need your Aadhaar number, Mobile number (Aadhaar linked), Land record document (Khata/Khesra number), and active Bank Account IFSC for direct DBT transfer."
    },
    {
      q: lang === 'bn'
        ? "সরাসরি ব্যাংক পেমেন্ট (DBT) কীভাবে কৃষকের কাছে পৌঁছায়?"
        : lang === 'hi'
        ? "प्रत्यक्ष लाभ अंतरण (DBT) भुगतान कैसे काम करता है?"
        : "How does Direct Benefit Transfer (DBT) payment work?",
      a: lang === 'bn'
        ? "মন্ডিতে কম্পিউটারাইজড ধর্মকাঁটায় ওজন শেষ হওয়ার সাথে সাথে একটি ডিজিটাল ই-জে-ফর্ম রসিদ তৈরি হয়। ২৪ থেকে ৪৮ ঘণ্টার মধ্যে সরকারি তহবিল সরাসরি আপনার ব্যাংক অ্যাকাউন্টে জমা হয়।"
        : lang === 'hi'
        ? "केंद्र पर इलेक्ट्रॉनिक तौल पूरा होने के बाद, तुरंत ई-जे-फॉर्म बन जाता है। 24 से 48 घंटे के भीतर राशि सीधे आपके आधार से जुड़े बैंक खाते में पहुंच जाती है।"
        : "Once electronic weighment is completed at the centre, an e-J-Form is instantly generated. Funds are credited directly to your Aadhaar-seeded bank account within 24 to 48 hours."
    },
    {
      q: lang === 'bn'
        ? "ফসলে আর্দ্রতার পরিমাণ ১৪% এর বেশি থাকলে কী ব্যবস্থা রয়েছে?"
        : lang === 'hi'
        ? "यदि नमी की मात्रा 14% से अधिक है तो क्या होगा?"
        : "What happens if moisture content is slightly higher than 14%?",
      a: lang === 'bn'
        ? "১৪% আর্দ্রতা পর্যন্ত পুরো সরকারি দর (MSP) সহ গ্রেড এ হিসেবে নেওয়া হয়। ১৪% থেকে ১৭% আর্দ্রতা থাকলে সরকারি নিয়ম অনুযায়ী সামান্য কর্তন প্রযোজ্য হয় অথবা আপনি মন্ডির ড্রায়ার ব্যবহার করতে পারেন।"
        : lang === 'hi'
        ? "14% तक नमी वाले अनाज को पूर्ण एमएसपी के साथ ग्रेड ए माना जाता है। 14-17% नमी होने पर सरकारी मानकों के अनुसार मामूली कटौती लागू होती है, या आप मंडी ड्रायर का उपयोग कर सकते हैं।"
        : "Produce with 14% moisture is accepted as Grade A with full MSP. If moisture is between 14-17%, slight standard deductions apply as per Govt norms, or you may use the mandi grain dryer."
    },
    {
      q: lang === 'bn'
        ? "আমি কি আগে থেকে বুক করা স্লটের তারিখ বা সময় পরিবর্তন করতে পারি?"
        : lang === 'hi'
        ? "क्या मैं अपना बुक किया गया स्लॉट बदल या रद्द कर सकता हूँ?"
        : "Can I reschedule or cancel my booked procurement slot?",
      a: lang === 'bn'
        ? "হ্যাঁ, নির্ধারিত সময়ের ৪ ঘণ্টা আগে পর্যন্ত আপনি কিষাণ ড্যাশবোর্ড থেকে সহজেই আপনার স্লট বিনামূল্যে পরিবর্তন বা বাতিল করতে পারেন।"
        : lang === 'hi'
        ? "हाँ, आप किसान डैशबोर्ड से निर्धारित समय से 4 घंटे पहले तक अपना स्लॉट आसानी से बदल या रद्द कर सकते हैं।"
        : "Yes, you can easily reschedule or cancel your slot up to 4 hours before the scheduled time slot directly through the Farmer Dashboard."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Top Govt of India Notice Bar */}
      <div className="bg-[#0b2415] text-emerald-100 text-xs py-2 px-4 sm:px-6 border-b border-emerald-950">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase shrink-0">
              {t('govt_initiative')}
            </span>
            <span className="text-emerald-200/90 font-medium text-[11px] sm:text-xs truncate max-w-[200px] sm:max-w-none">
              {t('dept_title')}
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="hidden sm:inline-flex items-center gap-1 text-emerald-200 text-xs">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" /> {t('call_centre')} <strong className="text-white font-mono">1800-180-1551</strong>
            </span>
            <LanguageSelector variant="buttons" />
          </div>
        </div>
      </div>

      {/* Main Navigation with Prominent Large Logo & Mobile Responsive Menu */}
      <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-16 py-3 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Prominent Large Logo Container */}
          <div className="p-1.5 sm:p-2 rounded-2xl bg-white border-2 border-emerald-100 shadow-md flex items-center justify-center hover:scale-105 transition-transform shrink-0">
            <img 
              src="/logo.svg" 
              alt="Kishan Seva Official Emblem" 
              className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain" 
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#143d23] tracking-tight leading-none">
              Kishan <span className="text-emerald-600">Seva</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 font-bold tracking-wide mt-0.5 sm:mt-1">
              {t('brand_subtitle')}
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-slate-600">
          <AnimatedLink href="#" className="text-emerald-800 font-bold">
            {t('nav_home')}
          </AnimatedLink>
          <AnimatedLink href="#centres" className="hover:text-emerald-700 transition-colors">
            {t('nav_centres')}
          </AnimatedLink>
          <AnimatedLink href="#msp-rates" className="hover:text-emerald-700 transition-colors">
            {t('nav_msp')}
          </AnimatedLink>
          <AnimatedLink href="#how-it-works" className="hover:text-emerald-700 transition-colors">
            {t('nav_how_it_works')}
          </AnimatedLink>
          <AnimatedLink href="#faqs" className="hover:text-emerald-700 transition-colors">
            {t('nav_faqs')}
          </AnimatedLink>
        </div>

        {/* Action Buttons & Language Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SupabaseStatusBadge />
          <div className="hidden md:block">
            <LanguageSelector variant="pill" />
          </div>

          <Link to="/farmer/centres">
            <Button variant="outline" className="hidden sm:flex rounded-full gap-1.5 border-slate-300 text-slate-700 text-xs h-9 sm:h-10 hover:border-emerald-600 hover:text-emerald-700 font-bold px-3.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> 
              <span className="hidden md:inline">{t('find_mandi_btn')}</span>
              <span className="md:hidden">Mandis</span>
            </Button>
          </Link>
          <Link to="/roles">
            <Button className="bg-[#143d23] hover:bg-[#0b2415] text-white rounded-full px-4 sm:px-5 h-9 sm:h-10 text-xs font-bold gap-1.5 shadow-sm transition-all hover:shadow-md">
              <User className="w-3.5 h-3.5" /> 
              {t('login_btn')}
            </Button>
          </Link>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            title="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 shadow-md animate-in slide-in-from-top-2 duration-200 z-40">
          <div className="flex flex-col space-y-2.5 font-semibold text-sm text-slate-700">
            <a 
              href="#" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-1.5 px-3 rounded-lg hover:bg-emerald-50 text-emerald-800 font-bold"
            >
              {t('nav_home')}
            </a>
            <a 
              href="#centres" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-1.5 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700"
            >
              {t('nav_centres')}
            </a>
            <a 
              href="#msp-rates" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-1.5 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700"
            >
              {t('nav_msp')}
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-1.5 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700"
            >
              {t('nav_how_it_works')}
            </a>
            <a 
              href="#faqs" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-1.5 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700"
            >
              {t('nav_faqs')}
            </a>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <LanguageSelector variant="compact" />
            <Link to="/farmer/centres" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" variant="outline" className="text-xs font-bold gap-1 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {t('find_mandi_btn')}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Live MSP Ticker Bar */}
      <div id="msp-rates" className="bg-amber-50/90 border-b border-amber-200/80 py-2.5 px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-bold text-amber-900 shrink-0 uppercase tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            {t('msp_ticker_label')}
          </span>
          <div className="flex items-center gap-5 overflow-x-auto scrollbar-none py-0.5 text-slate-700">
            {OFFICIAL_MSP_RATES.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 shrink-0 bg-white px-3.5 py-1 rounded-full border border-amber-200 shadow-xs">
                <span className="font-bold text-slate-900">
                  {lang === 'bn' ? getCropDisplayName(item.crop) : lang === 'hi' ? item.crop_hi : item.crop}
                </span>
                <span className="text-emerald-700 font-black font-mono">₹{item.rate_per_quintal.toLocaleString('en-IN')}/Q</span>
                <span className="text-[10px] text-emerald-600 font-bold">+{item.change_percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-emerald-50/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Text Content */}
          <div className="flex-1 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-bold mb-6 border border-emerald-300 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              {t('hero_badge')}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black text-[#112d1b] leading-[1.18] mb-4">
              {t('hero_title_1')} <br />
              <span className="text-emerald-600">{t('hero_title_2')}</span>
            </h1>

            <p className="text-lg font-bold text-slate-800 mb-2">
              {t('hero_subtitle')}
            </p>

            <p className="text-slate-600 mb-8 leading-relaxed text-sm sm:text-base">
              {t('hero_desc')}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link to="/farmer/book">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-7 h-12 rounded-full shadow-lg hover:shadow-xl transition-all gap-2">
                  {t('book_slot_now')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button 
                onClick={() => setIsVideoModalOpen(true)}
                variant="outline" 
                className="text-sm px-6 h-12 rounded-full border-emerald-700 text-emerald-800 hover:bg-emerald-50 gap-2 font-bold bg-white"
              >
                <Play className="w-4 h-4 text-emerald-700 fill-emerald-700" /> 
                {t('watch_tour')}
              </Button>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800"><Leaf className="w-4 h-4"/></div>
                <span className="font-bold text-xs text-slate-800">{t('feat_msp')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800"><Clock className="w-4 h-4"/></div>
                <span className="font-bold text-xs text-slate-800">{t('feat_waiting')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800"><ShieldCheck className="w-4 h-4"/></div>
                <span className="font-bold text-xs text-slate-800">{t('feat_weight')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800"><Banknote className="w-4 h-4"/></div>
                <span className="font-bold text-xs text-slate-800">{t('feat_dbt')}</span>
              </div>
            </div>
          </div>

          {/* Right: Hero Image with Stats Overlay */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
              <img 
                src="/hero-farmer.jpg" 
                alt="Indian farmer walking towards procurement centre" 
                className="w-full h-[380px] lg:h-[460px] object-cover opacity-95"
              />
              
              {/* Overlay Tagline with Authentic Language Localization */}
              <div className="absolute top-5 right-5 text-right bg-black/50 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                <p className="text-white text-lg sm:text-xl font-black italic tracking-wide font-serif">
                  "{t('hero_overlay_tagline')}"
                </p>
                <p className="text-emerald-300 text-[10px] tracking-wider uppercase font-sans font-bold mt-0.5">
                  {t('hero_portal_year')}
                </p>
              </div>

              {/* Bottom Stats Grid */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-6 pt-12">
                <div className="grid grid-cols-4 gap-2 text-white">
                  <div className="text-center">
                    <p className="text-xl lg:text-2xl font-black text-amber-400">10L+</p>
                    <p className="text-[11px] font-semibold text-slate-200">{t('stat_farmers')}</p>
                  </div>
                  <div className="text-center border-l border-white/20">
                    <p className="text-xl lg:text-2xl font-black text-amber-400">1,200+</p>
                    <p className="text-[11px] font-semibold text-slate-200">{t('stat_centres')}</p>
                  </div>
                  <div className="text-center border-l border-white/20">
                    <p className="text-xl lg:text-2xl font-black text-amber-400">₹48,000Cr</p>
                    <p className="text-[11px] font-semibold text-slate-200">{t('stat_dbt')}</p>
                  </div>
                  <div className="text-center border-l border-white/20">
                    <p className="text-xl lg:text-2xl font-black text-emerald-400">100%</p>
                    <p className="text-[11px] font-semibold text-slate-200">{t('stat_transparent')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Procurement Centre Discovery Tool on Landing Page */}
      <section id="centres" className="py-16 px-6 lg:px-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                Live Mandi Locator
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t('mandi_title')}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {t('mandi_subtitle')}
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={centreSearch}
                  onChange={(e) => setCentreSearch(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-full text-xs w-56 sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold bg-slate-50"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full text-xs">
                {[
                  { key: 'All', label: t('all_crops') },
                  { key: 'Paddy', label: t('paddy') },
                  { key: 'Wheat', label: t('wheat') },
                  { key: 'Mustard', label: t('mustard') }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedCropFilter(item.key)}
                    className={`px-3 py-1 rounded-full font-bold transition-colors ${
                      selectedCropFilter === item.key ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Centre Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centres.map((c) => (
              <div key={c.id} className="bg-white border-2 border-slate-200 rounded-3xl p-5 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {c.centre_code}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base mt-1 group-hover:text-emerald-700 transition-colors">
                        {c.name}
                      </h3>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {t('open_status')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-start gap-1.5 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    {c.address}, {c.district}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl text-center mb-4 text-xs border border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">{t('distance_label')}</p>
                      <p className="font-extrabold text-slate-800">{c.distance_km} km</p>
                    </div>
                    <div className="border-x border-slate-200">
                      <p className="text-[10px] text-slate-400 font-semibold">{t('in_queue_label')}</p>
                      <p className="font-extrabold text-emerald-700">{c.current_queue_length} Vehicles</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">{t('est_wait_label')}</p>
                      <p className="font-extrabold text-slate-800">{c.est_wait_time_mins} min</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">{t('accepted_crops_label')}</p>
                    <div className="flex flex-wrap gap-1">
                      {c.accepted_crops.map((cr, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded">
                          {getCropDisplayName(cr)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {t('daily_cap_label')} <strong>{c.daily_capacity_quintals} Q/day</strong>
                  </span>
                  <Link to={`/farmer/book?centre=${c.id}`}>
                    <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold px-4 h-8 gap-1">
                      {t('book_slot_here')} <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/farmer/centres">
              <Button variant="outline" className="rounded-full px-6 text-xs font-bold border-slate-300 text-slate-700 hover:border-emerald-600 hover:text-emerald-700">
                {t('view_all_mandis')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section id="how-it-works" className="py-16 px-6 lg:px-16 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
              {t('steps_badge')}
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-3">
              {t('steps_title')}
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
              {t('steps_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: t('step1_title'),
                desc: t('step1_desc'),
                icon: CalendarCheck,
                badge: 'Online / Mobile'
              },
              {
                step: '02',
                title: t('step2_title'),
                desc: t('step2_desc'),
                icon: Clock,
                badge: 'Zero Waiting'
              },
              {
                step: '03',
                title: t('step3_title'),
                desc: t('step3_desc'),
                icon: ShieldCheck,
                badge: 'Govt Certified'
              },
              {
                step: '04',
                title: t('step4_title'),
                desc: t('step4_desc'),
                icon: Banknote,
                badge: '48h DBT'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="text-3xl font-black text-slate-100 group-hover:text-emerald-100 transition-colors absolute top-4 right-4">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100">
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {item.badge}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-2 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-16 px-6 lg:px-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-emerald-700 font-bold text-xs uppercase tracking-widest mb-1">
              {t('roles_header_badge')}
            </p>
            <h2 className="text-3xl font-black text-slate-900">
              {t('roles_title')}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {t('roles_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Farmer Card */}
            <Link to="/farmer/login" className="group">
              <div className="bg-gradient-to-b from-white to-emerald-50/40 rounded-3xl border-2 border-emerald-100 hover:border-emerald-500 p-6 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-800">
                        <Leaf className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg">{t('role_farmer_title')}</h3>
                        <p className="text-xs text-emerald-700 font-bold">{t('role_farmer_subtitle')}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-emerald-700 text-white rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {t('role_farmer_desc')}
                  </p>
                </div>
                <div className="pt-4 border-t border-emerald-100/80 space-y-2 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600"/> 1-Click OTP Login (Aadhaar/Mobile)</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600"/> Live Token & Wait Time Tracker</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600"/> Download Digital e-J-Form Slip</div>
                </div>
              </div>
            </Link>

            {/* Operator Card */}
            <Link to="/operator/dashboard" className="group">
              <div className="bg-gradient-to-b from-white to-blue-50/40 rounded-3xl border-2 border-slate-200 hover:border-blue-500 p-6 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-800">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg">{t('role_operator_title')}</h3>
                        <p className="text-xs text-blue-700 font-bold">{t('role_operator_subtitle')}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {t('role_operator_desc')}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600"/> Live Token Queue Management</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600"/> Automated Grade Classification</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600"/> Instant Weighment Certificate Gen</div>
                </div>
              </div>
            </Link>

            {/* Admin Card */}
            <Link to="/admin/dashboard" className="group">
              <div className="bg-gradient-to-b from-white to-purple-50/40 rounded-3xl border-2 border-slate-200 hover:border-purple-500 p-6 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-800">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg">{t('role_admin_title')}</h3>
                        <p className="text-xs text-purple-700 font-bold">{t('role_admin_subtitle')}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-purple-700 text-white rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {t('role_admin_desc')}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600"/> State Procurement Heatmaps</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600"/> Mandi Status & Capacity Controls</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600"/> 1-Click CSV Financial Auditing</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faqs" className="py-16 px-6 lg:px-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
              {t('faq_badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {t('faq_heading')}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left font-bold text-slate-900 text-sm flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-emerald-700' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-emerald-50/20 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Walkthrough Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-emerald-800">
              <Play className="w-5 h-5 fill-emerald-600 text-emerald-600" />
              <h3 className="font-bold text-lg">Kishan Seva — Digital Procurement Walkthrough</h3>
            </div>
            <div className="bg-slate-950 rounded-2xl aspect-video flex flex-col items-center justify-center text-white p-6 relative overflow-hidden border border-slate-800">
              <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mb-3 shadow-lg shadow-emerald-900/50">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-base mb-1">Live Interactive Demo Active</h4>
              <p className="text-xs text-slate-300 text-center max-w-md mb-4">
                The Kishan Seva portal is fully interactive. You can book a live slot, test moisture quality assay, process weighing, and view real-time tokens directly!
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    setIsVideoModalOpen(false);
                    navigate('/farmer/book');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs rounded-full font-semibold px-5"
                >
                  Try Booking a Slot
                </Button>
                <Button 
                  onClick={() => {
                    setIsVideoModalOpen(false);
                    navigate('/operator/dashboard');
                  }}
                  variant="outline" 
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs rounded-full font-semibold px-5"
                >
                  Test Mandi Operator Portal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer with Big Logo */}
      <footer className="bg-[#0b2415] text-white pt-14 pb-8 px-6 lg:px-16 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-2.5 rounded-3xl bg-white border-2 border-emerald-200 shadow-md flex items-center justify-center">
                <img src="/logo.svg" alt="Kishan Seva" className="h-18 w-18 object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-black leading-tight">Kishan Seva</h3>
                <p className="text-xs text-emerald-300 font-bold">Smart Agriculture for a Better Tomorrow</p>
              </div>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed max-w-md mb-4">
              {t('footer_initiative')}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-300 font-bold">
              <span>{t('footer_tag1')}</span>
              <span>{t('footer_tag2')}</span>
              <span>{t('footer_tag3')}</span>
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-white mb-3 uppercase tracking-wider">Quick Portals</h4>
            <ul className="space-y-2 text-xs text-emerald-200/80 font-medium">
              <li><Link to="/farmer/login" className="hover:text-white transition-colors">Farmer Login & Registration</Link></li>
              <li><Link to="/farmer/centres" className="hover:text-white transition-colors">Find Nearby Mandi Centres</Link></li>
              <li><Link to="/farmer/book" className="hover:text-white transition-colors">Book Procurement Slot</Link></li>
              <li><Link to="/farmer/queue" className="hover:text-white transition-colors">Live Token Queue Tracking</Link></li>
              <li><Link to="/operator/dashboard" className="hover:text-white transition-colors">Centre Operator Console</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">State Administrator Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-white mb-3 uppercase tracking-wider">Farmer Helpline</h4>
            <p className="text-xs text-emerald-200/80 mb-1.5 font-medium">{t('call_centre')}</p>
            <p className="text-2xl font-black text-amber-400 font-mono mb-3">1800-180-1551</p>
            <p className="text-xs text-emerald-200/80">Email Support: support@kishanseva.gov.in</p>
            <p className="text-xs text-emerald-200/80 mt-1">Krishi Bhawan, New Delhi, 110001</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-emerald-900/80 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-300/70">
          <p>{t('footer_rights')}</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Hyperlinking Policy</span>
            <span className="hover:text-white cursor-pointer">Accessibility Statement</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
