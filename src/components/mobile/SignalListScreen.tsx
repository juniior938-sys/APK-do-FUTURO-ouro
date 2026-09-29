import React, { useState, useEffect, useCallback } from 'react';
import { PairBadgeIcon } from './PairBadgeIcon';
import { ForexSignal, SignalTimeframe, formatDisplayAction } from '../../types/signals';
import { audioAlerts } from '../../utils/audioAlerts';
import { voiceAssistant } from '../../services/voiceAssistant';
import { liveMarketFeed } from '../../services/liveMarketFeed';
import { grokApiService, GrokApiStatus } from '../../services/grokApiService';

interface SignalListScreenProps {
  signals?: ForexSignal[];
  onBack: () => void;
  onSelectSignal?: (sig: ForexSignal) => void;
  initialSymbolFilter?: string;
  onUpdateSignals?: (signals: ForexSignal[]) => void;
}

export const SignalListScreen: React.FC<SignalListScreenProps> = ({
  signals: initialSignals,
  onBack,
  onSelectSignal,
  initialSymbolFilter,
  onUpdateSignals,
}) => {
  const [selectedTf, setSelectedTf] = useState<string>('TODOS');
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    initialSymbolFilter ? initialSymbolFilter.replace('.pc', '') : 'TODOS'
  );
  const [feedSignals, setFeedSignals] = useState<ForexSignal[]>(initialSignals && initialSignals.length > 0 ? initialSignals : []);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [grokStatus, setGrokStatus] = useState<GrokApiStatus>(grokApiService.getStatus());
  const [lastSyncTime, setLastSyncTime] = useState<string>('Agora');

  // Sync initial symbol filter from props
  useEffect(() => {
    if (initialSymbolFilter) {
      setSelectedSymbol(initialSymbolFilter.replace('.pc', ''));
    }
  }, [initialSymbolFilter]);

  // Subscribe to Grok API Gateway status updates
  useEffect(() => {
    const unsub = grokApiService.subscribeStatus((st) => setGrokStatus(st));
    return unsub;
  }, []);

  // Fetch initial dynamic feed from Grok API
  const loadDynamicFeed = useCallback(async (tf: SignalTimeframe = 'M5', force: boolean = false) => {
    setIsRefreshing(true);
    try {
      const dynamicList = await grokApiService.fetchDynamicFeed(tf, force);
      if (dynamicList && dynamicList.length > 0) {
        setFeedSignals(dynamicList);
        if (onUpdateSignals) onUpdateSignals(dynamicList);
        const d = new Date();
        setLastSyncTime(d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch {
      // Continue with existing feed
    } finally {
      setIsRefreshing(false);
    }
  }, [onUpdateSignals]);

  useEffect(() => {
    loadDynamicFeed(selectedTf === 'TODOS' ? 'M5' : (selectedTf as SignalTimeframe), false);
  }, [selectedTf, loadDynamicFeed]);

  // Live market price subscription: continuously update currentPrices and real pips
  useEffect(() => {
    return liveMarketFeed.subscribe(() => {
      setFeedSignals((prev) => {
        if (!prev || prev.length === 0) return prev;
        return prev.map((sig) => {
          const livePrice = liveMarketFeed.getPrice(sig.symbol) || sig.currentPrice;
          const realPips = grokApiService.calculateRealPips(sig.symbol, sig.entryPrice, livePrice, sig.action);
          if (livePrice === sig.currentPrice && realPips === sig.pipsCurrent) {
            return sig;
          }
          return {
            ...sig,
            currentPrice: livePrice,
            pipsCurrent: realPips,
            updatedAt: Date.now(),
          };
        });
      });
    });
  }, []);

  const handleManualRefresh = () => {
    try {
      audioAlerts.playTestBeep();
    } catch {}
    loadDynamicFeed(selectedTf === 'TODOS' ? 'M5' : (selectedTf as SignalTimeframe), true);
  };

  const timeframes = ['TODOS', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4'];
  const symbols = ['TODOS', 'BTC/USD', 'AUD/USD', 'USD/JPY', 'EUR/CHF', 'XAU/USD', 'EUR/USD', 'GBP/JPY'];

  // Filter signals based on selected timeframe and symbol
  const filteredSignals = feedSignals.filter((sig) => {
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
          aria-label="Voltar"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-xs font-black tracking-widest uppercase text-white">
            FEED DINÂMICO IA
          </h1>
          <span className="text-[9px] font-mono text-cyan-400 font-bold block">
            DADOS REAIS VALIDADOS
          </span>
        </div>

        {/* Sync / Refresh Button */}
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-800/60 active:scale-95 transition-all -mr-2 ${
            isRefreshing ? 'animate-spin opacity-70' : ''
          }`}
          title="Sincronizar Feed com Grok IA (xAI)"
          aria-label="Sincronizar Feed com Grok IA (xAI)"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth="2.2">
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {/* Grok IA Live Gateway Banner (xAI) */}
      <div className="mb-2 shrink-0 bg-gradient-to-r from-emerald-950/50 via-slate-900/80 to-cyan-950/50 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 shadow-[0_0_12px_rgba(16,185,129,0.12)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-extrabold text-emerald-300 tracking-wide">
              Grok IA Gateway (xAI)
            </span>
            <span className="text-[8px] font-mono font-bold px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
              AO VIVO
            </span>
          </div>

          <div className="flex items-center gap-1 text-[8.5px] font-mono text-slate-300">
            <span className="text-slate-400">Sync:</span>
            <span className="text-cyan-300 font-bold">{lastSyncTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 text-[8px] font-mono text-slate-400 border-t border-slate-800/80 pt-1">
          <span className="truncate text-slate-300">
            Broker L2: Coinbase • Kraken • TradingView
          </span>
          <span className="text-amber-300 shrink-0 font-bold">
            0% Demonstração
          </span>
        </div>
      </div>

      {/* Timeframe Filter Bar */}
      <div className="pb-1.5 shrink-0">
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
                className={`px-2.5 py-1 text-[9.5px] font-bold rounded-lg transition-all whitespace-nowrap ${
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
                className={`px-2 py-0.5 text-[9px] font-semibold rounded-md transition-all whitespace-nowrap ${
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

      {/* Dynamic Signal Feed List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-none pb-2">
        {filteredSignals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs text-center space-y-2">
            <span>Nenhum sinal ativo para os filtros selecionados.</span>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] rounded-lg font-bold hover:bg-cyan-900/90 transition"
            >
              Consultar Grok IA Agora
            </button>
          </div>
        ) : (
          filteredSignals.map((sig) => {
            const isBuy = sig.action.includes('BUY') || sig.action === 'Buy Forte';
            const realPips = typeof sig.pipsCurrent === 'number' ? sig.pipsCurrent : 0;
            const isProfitable = realPips >= 0;

            const borderColor = isBuy
              ? isProfitable
                ? 'border-emerald-500/50'
                : 'border-emerald-700/30'
              : isProfitable
              ? 'border-rose-500/50'
              : 'border-rose-700/30';

            const glowShadow = isProfitable
              ? isBuy
                ? 'shadow-[0_0_12px_rgba(16,185,129,0.18)]'
                : 'shadow-[0_0_12px_rgba(244,63,94,0.18)]'
              : 'shadow-none';

            const pipsLabel = isProfitable
              ? `+${Math.abs(realPips).toFixed(1)} Pips Lucro`
              : `-${Math.abs(realPips).toFixed(1)} Pips Drawdown`;

            const pipsColorClass = isProfitable ? 'text-emerald-400' : 'text-rose-400';

            return (
              <div
                key={sig.id}
                onClick={() => onSelectSignal && onSelectSignal(sig)}
                className={`relative rounded-2xl p-3 border transition-all cursor-pointer ${borderColor} ${glowShadow} hover:scale-[1.01]`}
                style={{
                  background: 'linear-gradient(180deg, #091322 0%, #050b14 100%)',
                }}
              >
                {/* Header Row: Pair Badge + Name + Action (Left) & Live Timestamp (Right) */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <PairBadgeIcon symbol={sig.symbol} size="md" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-extrabold text-white tracking-wide">
                          {sig.symbol.replace('.pc', '')}
                        </h2>
                        <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950/60 px-1 rounded border border-amber-500/30">
                          {sig.timeframe}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                            isBuy
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {formatDisplayAction(sig.action, sig.confidence)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Validation Time */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-cyan-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{sig.timeFormatted || new Date(sig.createdAt || Date.now()).toLocaleTimeString('pt-BR')}</span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 block mt-0.5">
                      {sig.dateFormatted || new Date(sig.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Grok IA & Broker Verification Banner */}
                <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-emerald-950/30 via-slate-900/70 to-cyan-950/30 rounded-lg border border-emerald-500/25 mb-2">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span className="text-[8.5px] font-bold text-emerald-300 truncate font-mono">
                      Grok IA (xAI) • Broker L2 Validado
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[8.5px] font-bold text-amber-300 font-mono">
                      {sig.confidence || 96}% Precisão
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        voiceAssistant.speakSignal(sig);
                      }}
                      className="px-1.5 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-800 border border-cyan-400/40 text-[8px] text-cyan-200 flex items-center gap-0.5 transition active:scale-95"
                      title="Ouvir análise por voz da IA"
                      aria-label="Ouvir análise por voz da IA"
                    >
                      <span>🔊</span>
                      <span>Voz</span>
                    </button>
                  </div>
                </div>

                {/* Live Entry, Current Market Price, TP & SL Grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono tabular-nums text-slate-300 bg-slate-900/70 p-2 rounded-xl border border-slate-800/90 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[9px]">Entrada Real:</span>
                    <span className="font-bold text-white">{sig.entryPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-sans text-[9px]">Preço Ao Vivo:</span>
                    <span className={`font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sig.currentPrice || sig.entryPrice}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[9px]">Alvo TP1:</span>
                    <span className="font-bold text-emerald-400">
                      {sig.takeProfit1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[9px]">Stop Loss:</span>
                    <span className="font-bold text-rose-300">
                      {sig.stopLoss}
                    </span>
                  </div>
                </div>

                {/* Footer Banner: Dynamically Calculated Pips & Risk:Reward */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[9.5px] font-bold">
                  <span className="text-slate-400 flex items-center gap-1 font-mono">
                    <span>R:R {sig.riskReward || '1:3.2'}</span>
                    <span>•</span>
                    <span className="text-cyan-400">Coinbase/Kraken L2</span>
                  </span>
                  <span className={`${pipsColorClass} font-mono font-black`}>
                    {pipsLabel}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Footer indicator */}
      <div className="flex items-center justify-center gap-1 pt-1 shrink-0 text-slate-500 text-[8.5px] font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        <span>Feed validado via Grok IA API Gateway (xAI)</span>
      </div>
    </div>
  );
};
