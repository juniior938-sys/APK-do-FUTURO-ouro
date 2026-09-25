import React, { useState, useEffect } from 'react';
import { AIProcessorVisual } from './AIProcessorVisual';
import { PairBadgeIcon } from './PairBadgeIcon';
import { ForexSignal, SignalTimeframe } from '../../types/signals';
import { audioAlerts } from '../../utils/audioAlerts';

interface ProcessingSignalScreenProps {
  onBack: () => void;
  onViewCompleteSignal: (sig: ForexSignal) => void;
  initialSignal?: ForexSignal | null;
  selectedTimeframe: SignalTimeframe;
  onSelectTimeframe?: (tf: SignalTimeframe) => void;
}

export const ProcessingSignalScreen: React.FC<ProcessingSignalScreenProps> = ({
  onBack,
  onViewCompleteSignal,
  initialSignal,
  selectedTimeframe,
  onSelectTimeframe,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentPair, setCurrentPair] = useState<'BTCUSD' | 'XAUUSD'>('BTCUSD');

  // Realistic Signal generation cycle
  useEffect(() => {
    setProgress(15);
    const t1 = setTimeout(() => {
      setProgress(68);
    }, 600);

    const t2 = setTimeout(() => {
      setProgress(91);
    }, 1300);

    const t3 = setTimeout(() => {
      setProgress(100);
      try {
        audioAlerts.playTakeProfit();
      } catch {}
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentPair, selectedTimeframe]);

  const btcSignal: ForexSignal = {
    id: `sig-btc-realtime-${Date.now()}`,
    symbol: 'BTCUSD',
    name: 'BTC/USD',
    action: 'BUY',
    status: 'ACTIVE',
    timeframe: selectedTimeframe,
    entryPrice: 64850.00,
    currentPrice: 65120.00,
    stopLoss: 63900.00,
    takeProfit1: 66200.00,
    takeProfit2: 67500.00,
    takeProfit3: 69000.00,
    riskReward: '1:3.4',
    confidence: 94,
    pipsRisk: 95,
    pipsTarget1: 135,
    pipsTarget2: 265,
    pipsTarget3: 415,
    strategy: 'AI On-Chain Flow + Orderbook Sniper',
    rationale: 'Volume comprador spot superando resistência em tempo real. Fluxo institucional confirmado.',
    sources: {
      worldTimeServer: { session: 'Global Crypto 24/7', overlap: true, status: 'OPTIMAL' },
      dailyFx: { impact: 'HIGH', forecastBias: 'BULLISH' },
      forexFactory: { redFolderWarning: false, minutesToNews: 45, shieldState: 'SAFE_TO_TRADE' },
      investingCom: { sentimentBullishPct: 94, centralBankTone: 'Alta acumulativa contínua' },
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pipsCurrent: +135,
    alertSent: true,
  };

  const xauSignal: ForexSignal = {
    id: `sig-xau-mockup-${Date.now()}`,
    symbol: 'XAUUSD',
    name: 'XAU/USD',
    action: 'BUY',
    status: 'ACTIVE',
    timeframe: selectedTimeframe,
    entryPrice: 2345.50,
    currentPrice: 2351.20,
    stopLoss: 2338.00,
    takeProfit1: 2360.00,
    takeProfit2: 2372.00,
    takeProfit3: 2385.00,
    riskReward: '1:3.2',
    confidence: 94,
    pipsRisk: 75,
    pipsTarget1: 145,
    pipsTarget2: 265,
    pipsTarget3: 395,
    strategy: 'Deep Institutional Confluence Hunter',
    rationale: 'Ouro rompendo faixa de consolidação com alvo direto em 2360.00.',
    sources: {
      worldTimeServer: { session: 'London & NY', overlap: true, status: 'OPTIMAL' },
      dailyFx: { impact: 'MED', forecastBias: 'BULLISH' },
      forexFactory: { redFolderWarning: false, minutesToNews: 60, shieldState: 'SAFE_TO_TRADE' },
      investingCom: { sentimentBullishPct: 94, centralBankTone: 'Alta volatilidade favorável' },
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pipsCurrent: +95,
    alertSent: true,
  };

  const activeSignal = initialSignal || (currentPair === 'BTCUSD' ? btcSignal : xauSignal);

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto px-4 pb-4 select-none scrollbar-none">
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
          PROCESSANDO SINAL IA
        </h1>

        <div className="w-8" />
      </div>

      {/* Main Visual Center: Glowing AI Microchip */}
      <div className="flex flex-col items-center justify-center my-1 shrink-0">
        <AIProcessorVisual size={160} isPulsing={progress < 100} />

        {/* Status Headline */}
        <h2 className="text-sm font-extrabold tracking-wide text-white mt-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
          {progress < 100 ? 'Gerando Sinal em Tempo Real...' : 'Análise Concluída em Tempo Real!'}
        </h2>

        {/* Glowing Progress Bar */}
        <div className="w-64 h-2 rounded-full bg-slate-900 border border-slate-800 mt-2.5 overflow-hidden p-0.5 relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-300 transition-all duration-300 ease-out shadow-[0_0_10px_#fbbf24]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Real-time Checklist Steps */}
        <div className="w-64 mt-3 space-y-1 text-[11px] font-mono">
          <div className={`flex items-center justify-between transition-colors ${progress >= 68 ? 'text-cyan-300' : 'text-slate-500'}`}>
            <span>Analisando Mercado...</span>
            <span className="font-bold">{progress >= 68 ? '68%...' : `${Math.min(progress, 68)}%...`}</span>
          </div>
          <div className={`flex items-center justify-between transition-colors ${progress >= 91 ? 'text-cyan-300' : 'text-slate-500'}`}>
            <span>Calculando Pontos...</span>
            <span className="font-bold">{progress >= 91 ? '91%...' : progress >= 68 ? `${progress}%...` : '0%...'}</span>
          </div>
          <div className={`flex items-center justify-between transition-colors ${progress >= 100 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <span>Gerando Alerta...</span>
            <span className="font-bold">{progress >= 100 ? '100%!' : 'Aguardando...'}</span>
          </div>
        </div>
      </div>

      {/* Result Card: "NOVO SINAL DISPONÍVEL!" */}
      <div className="shrink-0 my-2">
        {/* Yellow Header Banner with Glow */}
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
            NOVO SINAL DISPONÍVEL!
          </span>
          <span className="text-[10px] bg-slate-900 text-cyan-300 font-mono px-1.5 py-0.2 rounded border border-slate-800">
            {selectedTimeframe}
          </span>
        </div>

        {/* Toggle between BTC/USD and XAU/USD */}
        <div className="flex justify-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setCurrentPair('BTCUSD')}
            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full transition-all ${
              currentPair === 'BTCUSD'
                ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            ₿ BTC/USD
          </button>
          <button
            type="button"
            onClick={() => setCurrentPair('XAUUSD')}
            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full transition-all ${
              currentPair === 'XAUUSD'
                ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            🥇 XAU/USD
          </button>
        </div>

        {/* Card matching Mockup 4 */}
        <div
          className="rounded-2xl p-3 border border-amber-500/40 shadow-[0_0_16px_rgba(251,191,36,0.15)] relative"
          style={{
            background: 'linear-gradient(180deg, #0f1c2d 0%, #07101c 100%)',
          }}
        >
          {/* Header Row: Pair Badge + Name + Compra/Buy */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <PairBadgeIcon symbol={activeSignal.symbol} size="md" />
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-wide">
                  {activeSignal.symbol}
                </h3>
                <p className="text-[10px] font-bold text-emerald-400">
                  Compra / Buy
                </p>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              {activeSignal.strategy.slice(0, 18)}...
            </div>
          </div>

          {/* Pricing Row: Entry, TP, SL (Single clean line matching image) */}
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-200 py-1.5 px-2 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-2">
            <div>
              <span className="text-slate-400 text-[9.5px]">Entry: </span>
              <span className="font-bold">{activeSignal.entryPrice}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9.5px]">TP: </span>
              <span className="font-bold text-emerald-400">{activeSignal.takeProfit1}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9.5px]">SL: </span>
              <span className="font-bold text-rose-400">{activeSignal.stopLoss}</span>
            </div>
          </div>

          {/* IA Accuracy Row */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80 font-bold">
            <span className="text-cyan-300">IA Accuracy, 94%</span>
            <span className="text-emerald-400 text-sm drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">
              94%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons: VOLTAR / VER SINAL COMPLETO */}
      <div className="grid grid-cols-2 gap-3 pt-2 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
        >
          VOLTAR
        </button>

        <button
          type="button"
          onClick={() => onViewCompleteSignal(activeSignal)}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:brightness-105 transition-all active:scale-95"
        >
          VER SINAL COMPLETO
        </button>
      </div>
    </div>
  );
};
