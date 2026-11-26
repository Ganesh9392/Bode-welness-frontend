import React from 'react';

export interface LogoProps {
  variant?: 'full' | 'compact';
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

const FULL_SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-20 h-20',
  md: 'w-24 h-24 sm:w-28 sm:h-28',
  lg: 'w-28 h-28 sm:w-32 sm:h-32',
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  tone = 'light',
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  if (variant === 'compact') {
    const titleColor = tone === 'dark' ? 'text-bode-forest' : 'text-bode-ivory';
    const subColor = tone === 'dark' ? 'text-bode-emerald' : 'text-bode-gold';

    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        <img
          src="/bode-logo-v2.jpeg"
          alt="BODE Wellness Spa"
          className="w-9 h-9 rounded-lg object-cover bg-bode-ivory border border-bode-gold/30 shrink-0 shadow-sm"
        />
        <div className="flex flex-col leading-none">
          <span
            className={`font-serif tracking-[0.22em] font-semibold uppercase text-base sm:text-lg ${titleColor}`}
          >
            BODE
          </span>
          {showSubtitle && (
            <span
              className={`font-sans tracking-[0.28em] font-medium uppercase mt-0.5 text-[9px] ${subColor}`}
            >
              Wellness Spa
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src="/bode-logo-v2.jpeg"
        alt="BODE Wellness Spa"
        className={`${FULL_SIZE_CLASSES[size]} rounded-xl object-cover bg-bode-ivory border border-bode-gold/30 shadow-sm`}
      />
    </div>
  );
};
