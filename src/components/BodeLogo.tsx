import React from 'react';

interface BodeLogoProps {
  variant?: 'light' | 'dark' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const BodeLogo: React.FC<BodeLogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const isLight = variant === 'light';
  const isGold = variant === 'gold';

  const titleColor = isLight ? 'text-bode-ivory' : isGold ? 'text-bode-gold' : 'text-bode-forest';
  const subColor = isLight ? 'text-bode-gold' : isGold ? 'text-bode-forest' : 'text-bode-emerald';

  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 44 : 32;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl';
  const subTextSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Elegant Wellness Crest Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:rotate-6"
        >
          {/* Subtle Outer Ring */}
          <circle
            cx="32"
            cy="32"
            r="30"
            stroke={isLight ? '#C2A253' : '#105C47'}
            strokeWidth="1.5"
            strokeDasharray="2 3"
            strokeOpacity="0.7"
          />
          {/* Inner Solid Ring */}
          <circle
            cx="32"
            cy="32"
            r="26"
            stroke={isLight ? '#F8F5E9' : '#073F32'}
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          {/* Sacred Lotus / Botanical Spa Leaves */}
          <path
            d="M32 14C32 14 36.5 24 36.5 29C36.5 32 34.5 34 32 34C29.5 34 27.5 32 27.5 29C27.5 24 32 14 32 14Z"
            fill="#C2A253"
          />
          <path
            d="M32 34C32 34 23 27 19 32C16 35.8 19 40 23 40C27 40 32 34 32 34Z"
            fill={isLight ? '#F8F5E9' : '#073F32'}
            fillOpacity="0.85"
          />
          <path
            d="M32 34C32 34 41 27 45 32C48 35.8 45 40 41 40C37 40 32 34 32 34Z"
            fill={isLight ? '#F8F5E9' : '#073F32'}
            fillOpacity="0.85"
          />
          {/* Lotus Base / Petal */}
          <path
            d="M24 43C28 47 36 47 40 43C37 49 27 49 24 43Z"
            fill="#C2A253"
          />
          <circle cx="32" cy="34" r="2.5" fill="#C2A253" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-serif tracking-[0.22em] font-semibold uppercase ${textSize} ${titleColor}`}
        >
          BODE
        </span>
        {showSubtitle && (
          <span
            className={`font-sans tracking-[0.3em] font-medium uppercase mt-0.5 ${subTextSize} ${subColor}`}
          >
            Wellness Spa
          </span>
        )}
      </div>
    </div>
  );
};
