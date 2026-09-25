import React, { useState } from 'react';
import { ChevronLeft, Zap, ArrowUp, ArrowDown, Filter, ChevronUp } from 'lucide-react';
import { ForexSignal, SignalTimeframe } from '../../types/signals';

interface MobileSignalsScreenProps {
  signals: ForexSignal[];
  onBack: () => void;
  onSelectSignal: (signal: ForexSignal) => void;
  onExecuteInstantSignal: (signal: ForexSignal) => void;
}

export const MobileSignalsScreen: React.FC<MobileSignalsScreenProps> = ({
  signals,
  onBack,
  onSelectSignal,
  onExecuteInstantSignal,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('TODOS');
  const [selectedPair, setSelectedPair] = useState<string>('TODOS');

  const timeframes: (SignalTimeframe | 'TODOS')[] = [
    'TODOS',
    'M1',
    'M5',
    'M15',
    'M30',
    'H1',
    'H4',
  ];

  const filtered = signals.filter((s) => {
    if (selectedTimeframe !== 'TODOS' && s.timeframe !== selectedTimeframe) return false;
    if (selectedPair !== 'TODOS' && !s.symbol.includes(selectedPair)) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* TOP HEADER: < SINAIS GERADOS */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#080e1c] shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xs font-semibold">Voltar</span>
        </button>

        <h1 className="text-sm font-black tracking-wider uppercase text-white">
          Sinais Gerados
        </h1>

        <div className="w-8" />
      </div>

      {/* SUB-HEADER: SINAIS GERADOS + IA ACC: 98% */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#091224]/90 border-b border-slate-800/60 shrink-0">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
          Sinais Gerados ({filtered.length})
        </span>
        <span className="text-[10px] font-black font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)]">
          IA ACC: 98%
        </span>
      </div>

      {/* TIMEFRAME PILL SELECTOR (M1, M5, M15, M30, H1, H4) */}
      <div className="px-3 py-1.5 bg-[#060a16] border-b border-slate-800/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {timeframes.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setSelectedTimeframe(tf)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black font-mono transition-all shrink-0 cursor-pointer ${
              selectedTimeframe === tf
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/30'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tf}
          </button>
        ))}

        {/* BTC/USD Quick Filter */}
        <button
          type="button"
          onClick={() => setSelectedPair(selectedPair === 'BTC' ? 'TODOS' : 'BTC')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-black font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
            selectedPair === 'BTC'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
              : 'bg-amber-950/40 text-amber-400 border border-amber-500/40'
          }`}
        >
          <span>₿ BTCUSD</span>
        </button>
      </div>

      {/* SIGNAL CARDS LIST (100% IDENTICAL TO SCREEN 2) */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {filtered.map((sig) => {
          const isBuy = sig.action.includes('BUY');
          const isProfit = sig.pipsCurrent >= 0;
          const isLoss = sig.pipsCurrent < 0;

          // Theme styling based on status/type
          let borderClass = 'border-slate-700';
          let footerBg = 'bg-slate-900/80 text-slate-300';
          let statusText = 'Aberto - Em Andamento';

          if (isProfit && isBuy) {
            borderClass = 'border-emerald-500/70 shadow-emerald-950/40';
            footerBg = 'bg-emerald-950/90 text-emerald-400 border-t border-emerald-500/30';
            statusText = `Lucro +${Math.abs(sig.pipsCurrent)} Pips`;
          } else if (isLoss) {
            borderClass = 'border-rose-500/70 shadow-rose-950/40';
            footerBg = 'bg-rose-950/90 text-rose-400 border-t border-rose-500/30';
            statusText = `Perda -${Math.abs(sig.pipsCurrent)} Pips`;
          } else {
            borderClass = 'border-amber-500/70 shadow-amber-950/40';
            footerBg = 'bg-amber-950/90 text-amber-400 border-t border-amber-500/30';
            statusText = 'Aberto - Em Andamento';
          }

          const flagEmoji = sig.symbol.includes('BTC')
            ? '₿'
            : sig.symbol.includes('XAU')
            ? '🥇'
            : sig.symbol.includes('AUD')
            ? '🇦🇺'
            : sig.symbol.includes('JPY')
            ? '🇯🇵'
            : sig.symbol.includes('EUR')
            ? '🇪🇺'
            : sig.symbol.includes('CHF')
            ? '🇨🇭'
            : sig.symbol.includes('GBP')
            ? '🇬🇧'
            : '🌐';

          const displayPair = sig.symbol
            .replace('.pc', '')
            .replace(/(.{3})(.{3})/, '$1/$2');

          return (
            <div
              key={sig.id}
              className={`rounded-2xl bg-[#091122]/95 border-2 ${borderClass} shadow-xl overflow-hidden transition-all hover:scale-[1.01]`}
            >
              {/* Card Header: Flag + Symbol + Action Badge + Date/IA */}
              <div className="p-3 pb-2 flex items-center justify-between border-b border-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{flagEmoji}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-white">{displayPair}</span>
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                        {sig.timeframe}
                      </span>
                    </div>
                    <span
                      className={`inline-block text-[10px] font-black uppercase mt-0.5 ${
                        isBuy ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isBuy ? 'Compre / Buy' : 'Venda / Sell'}
                    </span>
                  </div>
                </div>

                {/* Right: Date & IA % */}
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400">
                    Date: {new Date(sig.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[10px] font-bold font-mono text-cyan-400">
                    IA: {sig.confidence}%
                  </div>
                </div>
              </div>

              {/* Data Grid: 2 Columns (Entry, TP, TP2, SL) */}
              <div className="p-3 py-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Entry:</span>
                  <span className="font-semibold text-slate-100">{sig.entryPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">TP:</span>
                  <span className="font-bold text-emerald-400">{sig.takeProfit1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">TP2:</span>
                  <span className="font-semibold text-emerald-300">{sig.takeProfit2}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">SL:</span>
                  <span className="font-bold text-rose-400">{sig.stopLoss}</span>
                </div>
              </div>

              {/* Card Footer: Status Banner with Lucro / Perda / Aberto */}
              <div className={`px-3 py-2 flex items-center justify-between text-[11px] font-bold ${footerBg}`}>
                <div className="flex items-center gap-1.5">
                  {isBuy ? (
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>Status {sig.pipsCurrent >= 0 ? `+${sig.pipsCurrent}` : sig.pipsCurrent} Pips</span>
                </div>

                <div className="flex items-center gap-2">
                  <span>{statusText}</span>
                  <button
                    type="button"
                    onClick={() => onSelectSignal(sig)}
                    className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Ver MT5
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Drawer Indicator */}
      <div className="p-1 flex items-center justify-center bg-[#070c18] border-t border-slate-800/60">
        <ChevronUp className="w-4 h-4 text-slate-400 animate-bounce" />
      </div>
    </div>
  );
};
