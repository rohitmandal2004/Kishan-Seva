import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, Language, LANGUAGES } from '@/services/i18n';

interface LanguageSelectorProps {
  variant?: 'compact' | 'pill' | 'buttons';
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
