import React from 'react';

interface PairBadgeIconProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PairBadgeIcon: React.FC<PairBadgeIconProps> = ({ symbol, size = 'md' }) => {
  const clean = symbol.toUpperCase().replace(/[^A-Z]/g, '');

  const dimensions = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size];

  // Specific visual pair flags
  if (clean.includes('AUDUSD')) {
    return (
      <div className={`relative ${dimensions} flex items-center justify-center shrink-0`}>
        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-700 bg-blue-900 shadow-sm flex items-center justify-center">
          <span className="text-[10px]">🇦🇺</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full overflow-hidden border border-slate-700 bg-red-900 shadow-sm flex items-center justify-center">
          <span className="text-[8px]">🇺🇸</span>
        </div>
      </div>
    );
  }

  if (clean.includes('USDJPY')) {
    return (
      <div className={`relative ${dimensions} flex items-center justify-center shrink-0`}>
        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-700 bg-red-900 shadow-sm flex items-center justify-center">
          <span className="text-[10px]">🇺🇸</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full overflow-hidden border border-slate-700 bg-white shadow-sm flex items-center justify-center">
          <span className="text-[8px]">🇯🇵</span>
        </div>
      </div>
    );
  }

  if (clean.includes('EURCHF')) {
    return (
      <div className={`relative ${dimensions} flex items-center justify-center shrink-0`}>
        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-700 bg-blue-900 shadow-sm flex items-center justify-center">
          <span className="text-[10px]">🇪🇺</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full overflow-hidden border border-slate-700 bg-red-900 shadow-sm flex items-center justify-center">
          <span className="text-[8px]">🇨🇭</span>
        </div>
      </div>
    );
  }

  if (clean.includes('BTC')) {
    return (
      <div className={`relative ${dimensions} flex items-center justify-center shrink-0`}>
        <div className="w-6 h-6 rounded-full overflow-hidden border border-amber-500/80 bg-gradient-to-tr from-amber-600 to-amber-400 shadow-md shadow-amber-500/20 flex items-center justify-center text-slate-950 font-black text-[11px]">
          ₿
        </div>
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full overflow-hidden border border-slate-800 bg-slate-900 shadow-sm flex items-center justify-center">
          <span className="text-[7px]">🇺🇸</span>
        </div>
      </div>
    );
  }

  if (clean.includes('XAU')) {
    return (
      <div className={`relative ${dimensions} flex items-center justify-center shrink-0`}>
        <div className="w-6 h-6 rounded-full overflow-hidden border border-amber-400 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 shadow-md shadow-amber-500/20 flex items-center justify-center text-slate-950 font-black text-[9px]">
          XAU
        </div>
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full overflow-hidden border border-slate-800 bg-slate-900 shadow-sm flex items-center justify-center">
          <span className="text-[7px]">🇺🇸</span>
        </div>
      </div>
    );
  }

  if (clean.includes('EURUSD')) {
    return (
      <div className={`relative ${dimensions} flex items-center justify-center shrink-0`}>
        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-700 bg-blue-900 shadow-sm flex items-center justify-center">
          <span className="text-[10px]">🇪🇺</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full overflow-hidden border border-slate-700 bg-red-900 shadow-sm flex items-center justify-center">
          <span className="text-[8px]">🇺🇸</span>
        </div>
      </div>
    );
  }

  if (clean.includes('GBPJPY')) {
    return (
      <div className={`relative ${dimensions} flex items-center justify-center shrink-0`}>
        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-700 bg-blue-900 shadow-sm flex items-center justify-center">
          <span className="text-[10px]">🇬🇧</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full overflow-hidden border border-slate-700 bg-white shadow-sm flex items-center justify-center">
          <span className="text-[8px]">🇯🇵</span>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className={`w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200 shrink-0`}>
      {symbol.slice(0, 3)}
    </div>
  );
};
