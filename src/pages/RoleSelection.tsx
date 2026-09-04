import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Building2, Shield, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/services/i18n';
import { LanguageSelector } from '@/components/ui/language-selector';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative">
      {/* Top Bar with Home Link and Language Selector */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-600 hover:text-emerald-700 font-semibold transition-colors bg-white px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> {t('back_to_home')}
        </Link>
        <LanguageSelector variant="pill" className="shadow-sm" />
      </div>

      {/* Header with Prominent Large Brand Logo */}
      <div className="mb-8 sm:mb-10 text-center max-w-2xl px-2">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="p-2.5 sm:p-3 rounded-3xl bg-white border-2 border-emerald-100 shadow-lg hover:scale-105 transition-transform shrink-0">
            <img 
              src="/logo.svg" 
              alt="Kishan Seva Official Emblem" 
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" 
            />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#143d23] leading-none">
              Kishan <span className="text-emerald-600">Seva</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
              {t('brand_subtitle')}
            </p>
          </div>
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] sm:text-xs font-bold mb-3 border border-emerald-200 shadow-sm">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-600 animate-pulse"></span> 
          {t('sso_gateway')}
        </div>
        
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('roles_title')}
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-lg mx-auto">
          {t('roles_subtitle')}
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 max-w-5xl w-full">
        {/* Farmer Card */}
        <Card 
          onClick={() => navigate('/farmer/login')}
          className="p-5 sm:p-7 border-2 border-emerald-100 hover:border-emerald-600 transition-all duration-300 cursor-pointer bg-white hover:shadow-2xl group flex flex-col justify-between rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full -z-0 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Leaf className="w-8 h-8" />
              </div>
              <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {t('role_farmer_subtitle')}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-3 mb-2">{t('role_farmer_title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {t('role_farmer_desc')}
            </p>
          </div>

          <div className="relative z-10">
            <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/> {t('f_check_1')}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/> {t('f_check_2')}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/> {t('f_check_3')}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/> {t('f_check_4')}</li>
            </ul>
            <Button className="w-full mt-6 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-11 shadow-md hover:shadow-lg transition-all">
              {t('enter_farmer_portal')}
            </Button>
          </div>
        </Card>

        {/* Operator Card */}
        <Card 
          onClick={() => navigate('/operator/dashboard')}
          className="p-5 sm:p-7 border-2 border-blue-100 hover:border-blue-600 transition-all duration-300 cursor-pointer bg-white hover:shadow-2xl group flex flex-col justify-between rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-bl-full -z-0 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3.5 rounded-2xl bg-blue-100 text-blue-800 border border-blue-200">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="w-11 h-11 rounded-full bg-blue-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {t('role_operator_subtitle')}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-3 mb-2">{t('role_operator_title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {t('role_operator_desc')}
            </p>
          </div>

          <div className="relative z-10">
            <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0"/> {t('op_check_1')}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0"/> {t('op_check_2')}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0"/> {t('op_check_3')}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0"/> {t('op_check_4')}</li>
            </ul>
            <Button className="w-full mt-6 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold h-11 shadow-md hover:shadow-lg transition-all">
              {t('enter_operator_portal')}
            </Button>
          </div>
        </Card>

        {/* Admin Card */}
        <Card 
          onClick={() => navigate('/admin/dashboard')}
          className="p-5 sm:p-7 border-2 border-purple-100 hover:border-purple-600 transition-all duration-300 cursor-pointer bg-white hover:shadow-2xl group flex flex-col justify-between rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-50 rounded-bl-full -z-0 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3.5 rounded-2xl bg-purple-100 text-purple-800 border border-purple-200">
                <Shield className="w-8 h-8" />
              </div>
              <div className="w-11 h-11 rounded-full bg-purple-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {t('role_admin_subtitle')}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-3 mb-2">{t('role_admin_title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {t('role_admin_desc')}
            </p>
          </div>

          <div className="relative z-10">
            <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0"/> {t('adm_check_1')}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0"/> {t('adm_check_2')}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0"/> {t('adm_check_3')}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0"/> {t('adm_check_4')}</li>
            </ul>
            <Button className="w-full mt-6 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold h-11 shadow-md hover:shadow-lg transition-all">
              {t('enter_admin_portal')}
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-10 text-center text-xs text-slate-500">
        {t('need_help')} <strong className="text-slate-800 font-bold">1800-180-1551</strong>
      </div>
    </div>
  );
}
