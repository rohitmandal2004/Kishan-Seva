import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface KishanSevaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: 'light' | 'dark';
}

export function KishanSevaLogo({
  className,
  size = 'md',
  showSubtitle = true,
  theme = 'light'
}: KishanSevaLogoProps) {
  
  const sizeClasses = {
    sm: { img: 'w-8 h-8', title: 'text-xl', sub: 'text-[10px]' },
    md: { img: 'w-12 h-12', title: 'text-2xl', sub: 'text-xs' },
    lg: { img: 'w-16 h-16', title: 'text-3xl', sub: 'text-sm' },
    xl: { img: 'w-20 h-20', title: 'text-4xl', sub: 'text-base' }
  };

  const themeClasses = {
    light: {
      wrapper: 'bg-white border-emerald-100 shadow-sm',
      titlePrimary: 'text-[#143d23]',
      titleSecondary: 'text-emerald-600',
      subtitle: 'text-slate-500'
    },
    dark: {
      wrapper: 'bg-emerald-900 border-emerald-800 shadow-md',
      titlePrimary: 'text-white',
      titleSecondary: 'text-emerald-300',
      subtitle: 'text-emerald-100/80'
    }
  };

  const currentSize = sizeClasses[size];
  const currentTheme = themeClasses[theme];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "p-2 rounded-2xl border hover:scale-105 transition-transform shrink-0 flex items-center justify-center relative",
        currentTheme.wrapper
      )}>
        {/* Subtle sparkle animation disabled if prefers-reduced-motion */}
        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 animate-pulse motion-reduce:hidden" />
        <img 
          src="/logo.svg" 
          alt="Kishan Seva Official Emblem" 
          className={cn("object-contain", currentSize.img)} 
        />
      </div>
      <div>
        <h1 className={cn("font-black leading-none tracking-tight", currentSize.title)}>
          <span className={currentTheme.titlePrimary}>Kishan</span>{' '}
          <span className={currentTheme.titleSecondary}>Seva</span>
        </h1>
        {showSubtitle && (
          <p className={cn("font-semibold mt-1", currentSize.sub, currentTheme.subtitle)}>
            SIH 2026 Portal
          </p>
        )}
      </div>
    </div>
  );
}
