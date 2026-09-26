import React, { useState } from 'react';
import { ForexSignal } from '../types/signals';
import { getSymbolSpec } from '../types/symbols';
import { voiceAssistant } from '../services/voiceAssistant';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  AlertOctagon,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SignalCardProps {
  signal: ForexSignal;
  onExecute?: (signal: ForexSignal) => void;
  onSelectSymbol?: (symbol: string) => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({
  signal,
  onExecute,
  onSelectSymbol,
}) => {
  const [copied, setCopied] = useState(false);
  const [showVerticalScale, setShowVerticalScale] = useState(false);
  const spec = getSymbolSpec(signal.symbol);

  const isBuy = signal.action.includes('BUY');

  const handleCopy = () => {
    const text = `TARGET GO MONEY - EXECUÇÃO
Par: ${signal.symbol}
Momento de Entrada: ${isBuy ? 'COMPRA' : 'VENDA'}
Preço de Entrada : ${signal.entryPrice.toFixed(spec.decimals)}
STOP             : ${signal.stopLoss.toFixed(spec.decimals)}
TAKE 1           : ${signal.takeProfit1.toFixed(spec.decimals)}
TAKE 2           : ${signal.takeProfit2.toFixed(spec.decimals)}
TAKE 3           : ${signal.takeProfit3.toFixed(spec.decimals)}
Probabilidade: ${signal.confidence}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (signal.status) {
      case 'TP3_HIT':
        return <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> TP3 BATIDO</span>;
      case 'TP2_HIT':
        return <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> TP2 BATIDO</span>;
      case 'TP1_HIT':
        return <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> TP1 BATIDO</span>;
      case 'SL_HIT':
        return <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1"><AlertOctagon className="w-3 h-3" /> STOP LOSS</span>;
      default:
        return (
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ATIVO MT5
          </span>
        );
    }
  };

  const distToTP1 = Math.abs(signal.takeProfit1 - signal.entryPrice);
  const distToSL = Math.abs(signal.entryPrice - signal.stopLoss);
  const distCurrent = signal.currentPrice - signal.entryPrice;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 relative overflow-hidden group shadow-md">
      {/* Accent top stripe */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3px] ${
          isBuy ? 'bg-cyan-400' : 'bg-rose-500'
        }`}
      />

      {/* Top Header: Symbol, Timeframe & Action Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{spec.icon || '🪙'}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSelectSymbol?.(signal.symbol)}
                className="text-base font-bold font-mono text-white hover:text-amber-400 transition-colors cursor-pointer"
              >
                {signal.symbol}
              </button>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 font-bold">
                {signal.timeframe}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                {signal.strategy || spec.name}
              </span>
            </div>
            {/* Exact Date & Time */}
            <div className="text-[10px] font-mono text-cyan-400/90 mt-0.5">
              📅 {signal.dateTimeFormatted || signal.dateFormatted || new Date(signal.createdAt).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {getStatusBadge()}
          <span className={`text-xs font-mono font-bold ${signal.pipsCurrent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {signal.pipsCurrent >= 0 ? `+${signal.pipsCurrent}` : signal.pipsCurrent} pts
          </span>
        </div>
      </div>

      {/* Spark-X2.5 IA + 62 Indicadores TradingView (Mercado Aberto) */}
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900/90 border border-emerald-500/30 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold text-emerald-300">
            Spark-X2.5 IA • 62 Indicadores TV
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-300 font-bold font-mono">
            {signal.confidence || 96}% Confluência
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              voiceAssistant.speakSignal(signal);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-800 border border-cyan-400/50 text-[10px] text-cyan-200 font-bold transition active:scale-95 shadow-sm"
            title="Ouvir análise por voz da IA"
          >
            <span>🔊</span>
            <span>Voz IA</span>
          </button>
        </div>
      </div>

      {/* Momento de Entrada & Preço de Entrada (Ciano) */}
      <div className="p-2.5 rounded-lg bg-black/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isBuy ? (
            <div className="px-3 py-1 rounded-md font-mono font-black text-xs flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm shadow-emerald-500/20 animate-pulse">
              <span className="text-sm font-black leading-none">▲</span>
              <span>COMPRA</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-md font-mono font-black text-xs flex items-center gap-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-sm shadow-rose-500/20 animate-pulse">
              <span className="text-sm font-black leading-none">▼</span>
              <span>VENDA</span>
            </div>
          )}

          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Preço de Entrada</span>
            <span className="font-mono text-sm font-bold text-cyan-400">
              {signal.entryPrice.toFixed(spec.decimals)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Preço Atual MT5</span>
          <span className="font-mono text-xs font-bold text-slate-200">
            {signal.currentPrice.toFixed(spec.decimals)}
          </span>
        </div>
      </div>

      {/* NÍVEIS DA ESCALA VERTICAL: STOP E TAKE 1 / TAKE 2 / TAKE 3 */}
      <div className="space-y-1.5 font-mono text-xs">
        {/* STOP (SL) */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/20 border border-rose-500/30">
          <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px]">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>STOP (SL):</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-rose-400">-{distToSL.toFixed(spec.decimals)}</span>
            <span className="font-black text-rose-300 text-sm">
              {signal.stopLoss.toFixed(spec.decimals)}
            </span>
          </div>
        </div>

        {/* TAKE 1, TAKE 2, TAKE 3 */}
        <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-emerald-300 font-bold text-[11px] pb-1 border-b border-emerald-500/20">
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>TAKE 1 (TP1):</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400">+{distToTP1.toFixed(spec.decimals)}</span>
              <span className="font-black text-emerald-300 text-sm">
                {signal.takeProfit1.toFixed(spec.decimals)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-slate-400 font-medium">TAKE 2 (TP2):</span>
            <span className="font-bold text-emerald-400">
              {signal.takeProfit2.toFixed(spec.decimals)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">TAKE 3 (TP3 Máx):</span>
            <span className="font-bold text-emerald-400">
              {signal.takeProfit3.toFixed(spec.decimals)}
            </span>
          </div>
        </div>
      </div>

      {/* Probabilidade heurística & R:R */}
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
        <div>
          <span>Probabilidade: </span>
          <span className="text-sky-400 font-bold">{signal.confidence}%</span>
        </div>
        <div>
          <span>R:R: </span>
          <span className="text-amber-300 font-bold">{signal.riskReward}</span>
        </div>
      </div>

      {/* Interactive Escala Vertical Drawer */}
      {showVerticalScale && (
        <div className="p-2.5 rounded-lg bg-black border border-slate-800 space-y-1.5 font-mono text-[11px] animate-in fade-in duration-200">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-1 border-b border-slate-800 flex justify-between">
            <span>Régua da Escala Vertical</span>
            <span>Nível Gráfico</span>
          </div>
          <div className="flex items-center justify-between text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/30">
            <span>TAKE 3 (TP3)</span>
            <span className="font-bold">{signal.takeProfit3.toFixed(spec.decimals)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded">
            <span>TAKE 2 (TP2)</span>
            <span className="font-bold">{signal.takeProfit2.toFixed(spec.decimals)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/40">
            <span>TAKE 1 (TP1)</span>
            <span className="font-bold">{signal.takeProfit1.toFixed(spec.decimals)}</span>
          </div>
          <div className="flex items-center justify-between text-sky-300 bg-sky-950/40 px-2 py-1 rounded border border-sky-500/40 font-bold">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>PREÇO ATUAL</span>
            </span>
            <span>{signal.currentPrice.toFixed(spec.decimals)}</span>
          </div>
          <div className="flex items-center justify-between text-cyan-300 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/40">
            <span>ENTRADA (Linha Ciano)</span>
            <span className="font-bold">{signal.entryPrice.toFixed(spec.decimals)}</span>
          </div>
          <div className="flex items-center justify-between text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-500/40">
            <span>STOP (Linha Vermelha)</span>
            <span className="font-bold">{signal.stopLoss.toFixed(spec.decimals)}</span>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setShowVerticalScale(!showVerticalScale)}
          className="py-2 px-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
          title="Ver régua de escala vertical com números do gráfico"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Escala MT5</span>
          {showVerticalScale ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>Copiar MT5</span>
            </>
          )}
        </button>

        {onExecute && (
          <button
            type="button"
            onClick={() => onExecute(signal)}
            className="py-2 px-3 rounded-lg text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>Entre Agora</span>
          </button>
        )}
      </div>
    </div>
  );
};
