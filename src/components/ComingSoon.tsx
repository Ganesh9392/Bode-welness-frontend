import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  phase?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  icon,
  phase = 'Phase 2',
}) => {
  return (
    <div className="bg-white rounded-2xl border border-bode-border shadow-sm p-8 sm:p-12 text-center max-w-xl mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-bode-forest text-bode-gold flex items-center justify-center mx-auto mb-5 shadow-md">
        {icon || <Sparkles className="w-8 h-8" />}
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bode-gold/15 text-bode-goldDark border border-bode-gold/30 text-[11px] font-bold uppercase tracking-wider mb-3">
        <Clock className="w-3.5 h-3.5" />
        Coming Soon — {phase}
      </span>

      <h2 className="font-serif text-2xl font-bold text-bode-forest mb-2">
        {title}
      </h2>

      <p className="text-xs sm:text-sm text-bode-muted leading-relaxed max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
};
