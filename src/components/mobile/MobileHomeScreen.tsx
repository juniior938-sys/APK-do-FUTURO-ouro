import React from 'react';
import { User, Cpu, Sparkles, Star, Zap } from 'lucide-react';
import { ForexSignal } from '../../types/signals';

interface MobileHomeScreenProps {
  timeString?: string;
  onGenerateClick: () => void;
  onSelectSignal: (signal: ForexSignal) => void;
  onProfileClick: () => void;
  signals: ForexSignal[];
}

export const MobileHomeScreen: React.FC<MobileHomeScreenProps> = ({
  timeString = '10:09 AM',
  onGenerateClick,
  onSelectSignal,
  onProfileClick,
  signals,
}) => {
  // Select top highlight signals
  const recentSignals = signals.slice(0, 5);

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto px-4 pt-2 pb-3 relative">
      {/* BACKGROUND SINE-WAVE GRAPHIC (Golden & Cyan ribbons matching the screenshot) */}
      <div className="absolute top-10 left-0 right-0 h-40 pointer-events-none overflow-hidden opacity-85 z-0">
        <svg
          viewBox="0 0 400 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-20 60 C 60 10, 140 100, 220 50 C 300 0, 360 80, 420 40"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_8px_rgba(234,179,8,0.7)]"
          />
          <path
            d="M-20 68 C 50 18, 130 92, 210 46 C 290 8, 350 72, 420 36"
            stroke="url(#goldGradient2)"
            strokeWidth="1.2"
            opacity="0.8"
          />
          <path
            d="M-20 75 C 70 25, 150 105, 230 55 C 310 12, 370 85, 420 45"
            stroke="url(#cyanGradient)"
            strokeWidth="1"
            opacity="0.5"
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
            <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* TOP HEADER: Bem-vindo, Trader! + Profile Icon */}
      <div className="relative z-10 flex items-center justify-between mt-1 mb-2">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            <span>Bem-vindo, Trader!</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-wide mt-0.5">{timeString}</p>
        </div>

        {/* Profile Circle Button (Golden Border & Avatar) */}
        <button
          type="button"
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/20 via-slate-900 to-amber-400/30 border-2 border-amber-400/80 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 transition-transform cursor-pointer"
          title="Ver Perfil do Trader"
        >
          <User className="w-5 h-5 text-amber-300" />
        </button>
      </div>

      {/* CENTER GLOWING ORBITAL ACTION ORB (100% IDENTICAL TO SCREEN 1) */}
      <div className="relative z-10 my-auto py-5 flex flex-col items-center justify-center">
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Outer glowing ambient halo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-transparent to-amber-500/20 blur-2xl animate-pulse" />

          {/* Rotating Ring 1: Cyan arc */}
          <div
            className="absolute inset-1 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400/60 animate-spin"
            style={{ animationDuration: '9s' }}
          />

          {/* Rotating Ring 2: Gold arc opposite direction */}
          <div
            className="absolute inset-4 rounded-full border-2 border-transparent border-b-amber-400 border-l-amber-400/70 animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '7s' }}
          />

          {/* Secondary Concentric Glow Rings */}
          <div className="absolute inset-8 rounded-full border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]" />
          <div className="absolute inset-10 rounded-full border border-amber-400/30" />

          {/* Main Action Push Button: GERAR NOVO SINAL EM TEMPO REAL */}
          <button
            type="button"
            onClick={onGenerateClick}
            className="relative z-20 w-36 h-36 rounded-full bg-gradient-to-b from-[#0e1c31] via-[#091527] to-[#040a16] border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.45),inset_0_0_20px_rgba(6,182,212,0.2)] flex flex-col items-center justify-center p-3 text-center transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
          >
            {/* Inner AI Glowing Emblem */}
            <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center mb-1.5 shadow-[0_0_15px_rgba(6,182,212,0.6)] group-hover:border-cyan-300">
              <div className="flex items-center justify-center font-black text-xs text-cyan-300 tracking-wider">
                <Cpu className="w-6 h-6 text-cyan-300 animate-pulse" />
              </div>
            </div>

            {/* Glowing Text */}
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-100 group-hover:text-cyan-200 leading-tight">
              Gerar Novo Sinal
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 leading-tight">
              Em Tempo Real
            </span>

            {/* Sparkle badge */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center font-black shadow-lg shadow-amber-400/50">
              <Sparkles className="w-3.5 h-3.5 fill-black" />
            </div>
          </button>
        </div>

        {/* Sub-label under orb */}
        <p className="text-[11px] font-medium text-slate-400 text-center mt-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>IA Ativa · M1 a H4 · BTCUSD & Forex</span>
        </p>
      </div>

      {/* HORIZONTAL SECTION: "Últimos Sinais" (MATCHING SCREEN 1) */}
      <div className="relative z-10 mt-auto pt-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
            Últimos Sinais
          </h2>
          <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
            <Zap className="w-3 h-3 fill-cyan-400" />
            <span>Sem Repintura</span>
          </span>
        </div>

        {/* Scrollable Horizontal Cards */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {recentSignals.map((sig) => {
            const isBuy = sig.action.includes('BUY');
            const flagEmoji = sig.symbol.includes('BTC')
              ? '₿'
              : sig.symbol.includes('XAU')
              ? '🥇'
              : sig.symbol.includes('EUR')
              ? '🇪🇺'
              : sig.symbol.includes('GBP')
              ? '🇬🇧'
              : sig.symbol.includes('JPY')
              ? '🇯🇵'
              : sig.symbol.includes('AUD')
              ? '🇦🇺'
              : '🌐';

            const displayPair = sig.symbol
              .replace('.pc', '')
              .replace(/(.{3})(.{3})/, '$1/$2');

            return (
              <button
                key={sig.id}
                type="button"
                onClick={() => onSelectSignal(sig)}
                className={`min-w-[130px] p-2.5 rounded-2xl bg-[#091222]/90 border text-left transition-all hover:scale-102 active:scale-98 cursor-pointer shrink-0 shadow-lg ${
                  isBuy
                    ? 'border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/30'
                    : 'border-rose-500/40 hover:border-rose-400 shadow-rose-950/30'
                }`}
              >
                {/* Header: Flag + Symbol */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{flagEmoji}</span>
                  <span className="text-xs font-black text-white">{displayPair}</span>
                </div>

                {/* Action Tag: Buy / Sell */}
                <div className="mb-1.5">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isBuy
                        ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-950/90 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {isBuy ? 'Buy' : 'Sell'}
                  </span>
                </div>

                {/* Entry & TP Values */}
                <div className="space-y-0.5 text-[10px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entry:</span>
                    <span className="font-semibold text-slate-100">{sig.entryPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">TP:</span>
                    <span className="font-semibold text-emerald-400">{sig.takeProfit1}</span>
                  </div>
                </div>

                {/* 5 Stars Footer */}
                <div className="flex items-center gap-1 mt-2 pt-1 border-t border-slate-800/60">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[9px] font-bold text-amber-300">5 Estrelas</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
