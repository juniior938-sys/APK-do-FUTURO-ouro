import React from 'react';
import { WaveRibbon } from './WaveRibbon';
import { CenterOrbButton } from './CenterOrbButton';
import { PairBadgeIcon } from './PairBadgeIcon';
import { SignalTimeframe, ForexSignal } from '../../types/signals';
import { audioAlerts } from '../../utils/audioAlerts';

interface HomeScreenProps {
  onGenerateClick: () => void;
  onOpenSignalList: (symbolFilter?: string) => void;
  onOpenProfile: () => void;
  selectedTimeframe: SignalTimeframe;
  onSelectTimeframe: (tf: SignalTimeframe) => void;
  recentSignals: ForexSignal[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onGenerateClick,
  onOpenSignalList,
  onOpenProfile,
  selectedTimeframe,
  onSelectTimeframe,
  recentSignals,
}) => {
  const timeframes: SignalTimeframe[] = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4'];

  const handleTfClick = (tf: SignalTimeframe) => {
    try {
      audioAlerts.playTestBeep();
    } catch {}
    onSelectTimeframe(tf);
  };

  return (
    <div className="relative flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden pb-4 px-4 select-none">
      {/* Dynamic Wave Ribbon Graphic at top */}
      <WaveRibbon />

      {/* Top Greeting Header */}
      <div className="relative z-10 flex items-center justify-between pt-1 pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md">
            Bem-vindo, Trader!
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            10:09 AM
          </p>
        </div>

        {/* Profile Avatar Button with Golden Ring */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-md shadow-amber-500/20 active:scale-95 transition-transform"
        >
          <div className="w-full h-full rounded-full bg-[#0a1829] flex items-center justify-center text-amber-300">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
        </button>
      </div>

      {/* Center Interactive Luminous Orb Button */}
      <div className="relative z-10 my-auto py-1">
        <CenterOrbButton onClick={onGenerateClick} />
      </div>

      {/* Timeframe Selector Bar */}
      <div className="relative z-10 mb-3">
        <div className="flex items-center justify-between gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800/80 backdrop-blur-sm">
          {timeframes.map((tf) => {
            const isSelected = selectedTimeframe === tf;
            return (
              <button
                key={tf}
                type="button"
                onClick={() => handleTfClick(tf)}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* "Últimos Sinais" Section */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-300">
            Últimos Sinais
          </h2>
          <button
            type="button"
            onClick={() => onOpenSignalList()}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Ver Todos
          </button>
        </div>

        {/* Horizontal Carousel of Signals */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none snap-x">
          {recentSignals.slice(0, 6).map((sig) => {
            const isBuy = sig.action.includes('BUY');
            return (
              <div
                key={sig.id}
                onClick={() => onOpenSignalList(sig.symbol)}
                className="snap-start shrink-0 w-32 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-md hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 14, 26, 0.95) 100%)',
                }}
              >
                {/* Header: Pair + Flag */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <PairBadgeIcon symbol={sig.symbol} size="sm" />
                    <span className="text-[11px] font-bold text-white tracking-tight">
                      {sig.symbol.replace('.pc', '')}
                    </span>
                  </div>
                </div>

                {/* Action Badge */}
                <div className="mb-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isBuy
                        ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30'
                        : 'text-rose-400 bg-rose-950/60 border border-rose-500/30'
                    }`}
                  >
                    {isBuy ? 'Buy' : 'Sell'}
                  </span>
                </div>

                {/* Entry & TP */}
                <div className="text-[9px] text-slate-400 space-y-0.5 tabular-nums">
                  <div className="flex justify-between">
                    <span>Entry:</span>
                    <span className="text-slate-200 font-medium">{sig.entryPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TP:</span>
                    <span className="text-slate-200 font-medium">{sig.takeProfit1}</span>
                  </div>
                </div>

                {/* Rating Stars: "★ 5 Estrelas" */}
                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-amber-400 font-bold">
                  <span className="flex items-center gap-0.5">
                    ★ <span className="text-[8.5px] text-slate-300 font-normal">5 Estrelas</span>
                  </span>
                  <span className="text-[8px] text-cyan-300 font-mono">
                    {sig.timeframe}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
