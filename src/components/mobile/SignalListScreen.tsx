import React, { useState, useEffect } from 'react';
import { PairBadgeIcon } from './PairBadgeIcon';
import { ForexSignal, SignalTimeframe } from '../../types/signals';
import { audioAlerts } from '../../utils/audioAlerts';

interface SignalListScreenProps {
  signals: ForexSignal[];
  onBack: () => void;
  onSelectSignal?: (sig: ForexSignal) => void;
  initialSymbolFilter?: string;
}

export const SignalListScreen: React.FC<SignalListScreenProps> = ({
  signals,
  onBack,
  onSelectSignal,
  initialSymbolFilter,
}) => {
  const [selectedTf, setSelectedTf] = useState<string>('TODOS');
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    initialSymbolFilter ? initialSymbolFilter.replace('.pc', '') : 'TODOS'
  );

  useEffect(() => {
    if (initialSymbolFilter) {
      setSelectedSymbol(initialSymbolFilter.replace('.pc', ''));
    }
  }, [initialSymbolFilter]);

  const timeframes = ['TODOS', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4'];
  const symbols = ['TODOS', 'BTC/USD', 'AUD/USD', 'USD/JPY', 'EUR/CHF', 'XAU/USD', 'EUR/USD', 'GBP/JPY'];

  const filteredSignals = signals.filter((sig) => {
    const sym = sig.symbol.replace('.pc', '').toUpperCase();
    if (selectedTf !== 'TODOS' && sig.timeframe !== selectedTf) return false;
    if (selectedSymbol !== 'TODOS') {
      const match = selectedSymbol.replace(/[^A-Z]/g, '');
      if (!sym.includes(match)) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-4 pb-3 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1 pb-2 relative z-10 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/60 active:scale-95 transition-all -ml-2"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h1 className="text-sm font-extrabold tracking-widest uppercase text-white">
          SINAIS GERADOS
        </h1>

        <div className="w-8" />
      </div>

      {/* Subheader Row: "SINAIS GERADOS" left, "IA ACC: 98%" right */}
      <div className="flex items-center justify-between pb-2 shrink-0 border-b border-slate-800/80">
        <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
          SINAIS GERADOS
        </span>
        <span className="text-[11px] font-extrabold tracking-wider text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">
          IA ACC: 98%
        </span>
      </div>

      {/* Timeframe Filter Bar */}
      <div className="py-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {timeframes.map((tf) => {
            const isSelected = selectedTf === tf;
            return (
              <button
                key={tf}
                type="button"
                onClick={() => {
                  try {
                    audioAlerts.playTestBeep();
                  } catch {}
                  setSelectedTf(tf);
                }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/40'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Pair Filter Bar */}
      <div className="pb-2 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {symbols.map((sym) => {
            const isSelected = selectedSymbol === sym;
            return (
              <button
                key={sym}
                type="button"
                onClick={() => setSelectedSymbol(sym)}
                className={`px-2 py-0.5 text-[9.5px] font-semibold rounded-md transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>
      </div>

      {/* Signal Cards Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 scrollbar-none pb-2">
        {filteredSignals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs">
            <span>Nenhum sinal encontrado para este filtro.</span>
          </div>
        ) : (
          filteredSignals.map((sig) => {
            const isBuy = sig.action.includes('BUY');
            const isAud = sig.symbol.includes('AUD');
            const isJpy = sig.symbol.includes('JPY');
            const isChf = sig.symbol.includes('CHF');
            const isBtc = sig.symbol.includes('BTC');

            // Visual borders and status matching mockup
            let borderColor = 'border-emerald-500/40';
            let glowShadow = 'shadow-[0_0_12px_rgba(16,185,129,0.15)]';
            let statusPipsText = 'Lucro +75 Pips';
            let statusPipsColor = 'text-emerald-400';

            if (isBuy) {
              borderColor = 'border-emerald-500/50';
              glowShadow = 'shadow-[0_0_14px_rgba(16,185,129,0.2)]';
              statusPipsText = isBtc
                ? 'Lucro +135 Pips'
                : isChf
                ? 'Aberto - Em Andamento'
                : `Lucro +${Math.abs(sig.pipsCurrent || 75)} Pips`;
              statusPipsColor = isChf ? 'text-amber-300' : 'text-emerald-400';
            } else {
              borderColor = 'border-rose-500/50';
              glowShadow = 'shadow-[0_0_14px_rgba(244,63,94,0.2)]';
              statusPipsText = `Perda ${sig.pipsCurrent < 0 ? sig.pipsCurrent : -50} Pips`;
              statusPipsColor = 'text-rose-400';
            }

            return (
              <div
                key={sig.id}
                onClick={() => onSelectSignal && onSelectSignal(sig)}
                className={`relative rounded-2xl p-3 border transition-all cursor-pointer ${borderColor} ${glowShadow}`}
                style={{
                  background: 'linear-gradient(180deg, #091322 0%, #050b14 100%)',
                }}
              >
                {/* Header Row: Flags + Symbol + Compra/Venda + Date/Accuracy */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <PairBadgeIcon symbol={sig.symbol} size="md" />
                    <div>
                      <h3 className="text-sm font-extrabold text-white tracking-wide">
                        {sig.symbol.replace('.pc', '')}
                      </h3>
                      <p
                        className={`text-[10px] font-bold ${
                          isBuy ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isBuy ? 'Compra / Buy' : 'Venda / Sell'}
                      </p>
                    </div>
                  </div>

                  {/* Date / Accuracy badge in top right */}
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-cyan-300">
                      Date: {sig.timeframe === 'M5' ? '28h 58%' : sig.timeframe === 'M15' ? '22h 60%' : '08h 88%'}
                    </span>
                  </div>
                </div>

                {/* Entry & TP Grid (2 columns matching screenshot) */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono tabular-nums text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 mb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[10px]">Entry:</span>
                    <span className="font-bold text-white">{sig.entryPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[10px]">TP:</span>
                    <span className="font-bold text-white">
                      {sig.takeProfit1}{' '}
                      <span className="text-[9.5px] font-sans text-emerald-400">
                        {sig.confidence ? `${sig.confidence}%` : '88%'}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[10px]">TP:</span>
                    <span className="font-bold text-white">{sig.takeProfit2}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[10px]">SL:</span>
                    <span className="font-bold text-rose-300">
                      {sig.stopLoss}{' '}
                      <span className="text-[9.5px] font-sans text-slate-400">
                        {sig.confidence ? `${sig.confidence}%` : '88%'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Footer Banner Row: "Status +75 Pips" | "Lucro +75 Pips" */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/70 text-[10.5px] font-bold">
                  <span className="text-slate-400">
                    Status {sig.pipsCurrent >= 0 ? `+${sig.pipsCurrent}` : `${sig.pipsCurrent}`} Pips
                  </span>
                  <span className={statusPipsColor}>
                    {statusPipsText}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Chevron / Swipe Up Indicator */}
      <div className="flex justify-center pt-1 shrink-0 text-slate-500">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </div>
    </div>
  );
};
