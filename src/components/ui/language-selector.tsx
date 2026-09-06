import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, Language, LANGUAGES } from '@/services/i18n';

interface LanguageSelectorProps {
  variant?: 'compact' | 'pill' | 'buttons' | 'dropdown';
  className?: string;
}

export function LanguageSelector({ variant = 'pill', className = '' }: LanguageSelectorProps) {
  const { lang, setLanguage } = useLanguage();

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-1 bg-black/20 p-0.5 rounded-full backdrop-blur-xs border border-white/20 text-xs ${className}`}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
              lang === l.code
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            {l.nativeName}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative flex items-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2 ${className}`}>
        <Globe className="w-4 h-4 text-emerald-200 mr-2" />
        <select 
          value={lang} 
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-transparent text-xs font-semibold text-emerald-50 outline-none cursor-pointer appearance-none w-full"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="bg-emerald-900 text-white">
              {l.nativeName}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-200">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 p-0.5 rounded-full text-xs shadow-xs ${className}`}>
      <span className="pl-2 pr-1 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </span>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLanguage(l.code)}
          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
            lang === l.code
              ? 'bg-[#143d23] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {l.nativeName}
        </button>
      ))}
    </div>
  );
}
