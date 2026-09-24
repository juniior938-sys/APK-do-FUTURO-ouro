import React, { useState } from 'react';
import { ForexSignal } from '../types/signals';
import { getSymbolSpec } from '../types/symbols';
import {
  TrendingUp,
  TrendingDown,
  Copy,
  Check,
  Zap,
  Sliders,
  Maximize2,
  Minimize2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface MT5VerticalScaleBoxProps {
  signal: ForexSignal;
  onExecute?: (signal: ForexSignal) => void;
  onUpdateSignalValues?: (updated: Partial<ForexSignal>) => void;
  isExpandedDefault?: boolean;
}

export const MT5VerticalScaleBox: React.FC<MT5VerticalScaleBoxProps> = ({
  signal,
  onExecute,
  onUpdateSignalValues,
  isExpandedDefault = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isExpandedDefault);

  const spec = getSymbolSpec(signal.symbol);
  const isBuy = signal.action.includes('BUY');

  // Edit form state
  const [editValues, setEditValues] = useState({
    entryPrice: signal.entryPrice,
    stopLoss: signal.stopLoss,
    takeProfit1: signal.takeProfit1,
    takeProfit2: signal.takeProfit2,
    takeProfit3: signal.takeProfit3,
    confidence: signal.confidence,
  });

  const handleCopy = () => {
    const text = `TARGET GO MONEY - EXECUÇÃO
Paridade: ${signal.symbol}
Momento de Entrada: ${isBuy ? 'COMPRA' : 'VENDA'}
Preço de Entrada : ${signal.entryPrice.toFixed(spec.decimals)}
STOP             : ${signal.stopLoss.toFixed(spec.decimals)}
TAKE 1           : ${signal.takeProfit1.toFixed(spec.decimals)}
TAKE 2           : ${signal.takeProfit2.toFixed(spec.decimals)}
TAKE 3           : ${signal.takeProfit3.toFixed(spec.decimals)}
Probabilidade (heurística): ${signal.confidence}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSignalValues) {
      onUpdateSignalValues({
        entryPrice: Number(editValues.entryPrice),
        stopLoss: Number(editValues.stopLoss),
        takeProfit1: Number(editValues.takeProfit1),
        takeProfit2: Number(editValues.takeProfit2),
        takeProfit3: Number(editValues.takeProfit3),
        confidence: Number(editValues.confidence),
      });
    }
    setIsEditing(false);
  };

  // Calculate vertical scale percentage relative to range [minPrice, maxPrice]
  const minPrice = Math.min(signal.stopLoss, signal.entryPrice, signal.currentPrice) * 0.998;
  const maxPrice = Math.max(signal.takeProfit3, signal.currentPrice) * 1.002;
  const range = Math.max(0.0001, maxPrice - minPrice);

  const getPercent = (price: number) => {
    return Math.max(0, Math.min(100, ((price - minPrice) / range) * 100));
  };

  // Distance calculations
  const distEntryToTP1 = Math.abs(signal.takeProfit1 - signal.entryPrice);
  const distEntryToSL = Math.abs(signal.entryPrice - signal.stopLoss);
  const distCurrentToEntry = signal.currentPrice - signal.entryPrice;

  return (
    <div className="rounded-xl border border-slate-700 bg-black/95 p-4 shadow-2xl relative overflow-hidden space-y-4">
      {/* Top Bar: Strategy title & controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            {signal.strategy || 'TARGET GO MONEY - EXECUÇÃO'}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800 font-bold">
            {signal.symbol} · {signal.timeframe}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-900 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            title="Editar valores da escala vertical do MT5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Calibrar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            title={isExpanded ? 'Recolher escala' : 'Expandir escala vertical'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Left side has the exact MT5 box, Right side has the Vertical Scale ruler */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* LEFT COLUMN: THE EXACT TARGET GO MONEY MT5 INDICATOR BOX */}
        <div className="lg:col-span-6 bg-black p-3.5 rounded-lg border border-slate-800/90 font-mono text-xs sm:text-sm flex flex-col justify-between shadow-inner">
          <div className="space-y-1.5 leading-relaxed">
            <div className="font-bold text-white tracking-wide border-b border-slate-800/60 pb-1 flex items-center justify-between">
              <span>TARGET GO MONEY - EXECUÇÃO</span>
              <span className="text-[10px] font-sans font-normal text-slate-500">MT5 UltimaMarkets</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-300">Momento de Entrada:</span>
              <span className={`font-bold flex items-center gap-1 ${isBuy ? 'text-amber-400' : 'text-rose-400'}`}>
                {isBuy ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{isBuy ? 'COMPRA' : 'VENDA'}</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Preço de Entrada :</span>
              <span className="font-bold text-cyan-400">
                {signal.entryPrice.toFixed(spec.decimals)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">STOP             :</span>
              <span className="font-bold text-rose-500">
                {signal.stopLoss.toFixed(spec.decimals)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">TAKE 1           :</span>
              <span className="font-bold text-emerald-400">
                {signal.takeProfit1.toFixed(spec.decimals)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">TAKE 2           :</span>
              <span className="font-bold text-emerald-400">
                {signal.takeProfit2.toFixed(spec.decimals)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">TAKE 3           :</span>
              <span className="font-bold text-emerald-400">
                {signal.takeProfit3.toFixed(spec.decimals)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-900">
              <span className="text-slate-400 text-xs">Probabilidade (heurística):</span>
              <span className="font-bold text-sky-400">
                {signal.confidence}%
              </span>
            </div>
          </div>

          {/* Quick MT5 Action bar */}
          <div className="flex items-center gap-2 pt-3 mt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
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
                  <span>Copiar Ordem MT5</span>
                </>
              )}
            </button>

            {onExecute && (
              <button
                type="button"
                onClick={() => onExecute(signal)}
                className="py-1.5 px-3 rounded text-xs font-bold font-sans bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Executar</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ESCALA VERTICAL DO GRÁFICO MT5 (PREÇO, TP1, TP2, TP3, ENTRADA, SL) */}
        <div className="lg:col-span-6 bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1.5 border-b border-slate-800">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <span>ESCALA VERTICAL MT5 (EIXO DE PREÇO)</span>
            </span>
            <span className="text-[10px] text-slate-500">Níveis de Execução</span>
          </div>

          {/* Visual Vertical Ruler with exact badges from the MT5 screenshot */}
          <div className="space-y-2 py-2 font-mono">
            {/* TAKE 3 (Verde) */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  TAKE 3
                </span>
                <span className="text-xs text-slate-400">Alvo Máximo</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                {signal.takeProfit3.toFixed(spec.decimals)}
              </span>
            </div>

            {/* TAKE 2 (Verde) */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded bg-emerald-950/15 border border-emerald-500/25">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  TAKE 2
                </span>
                <span className="text-xs text-slate-400">Alvo Intermediário</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {signal.takeProfit2.toFixed(spec.decimals)}
              </span>
            </div>

            {/* TAKE 1 (Verde) */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded bg-emerald-950/30 border border-emerald-500/40 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300">
                  TAKE 1
                </span>
                <span className="text-xs text-slate-300 font-semibold">Primeiro Alvo</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-400">
                {signal.takeProfit1.toFixed(spec.decimals)}
              </span>
            </div>

            {/* PREÇO ATUAL DE MERCADO (Moving ticker) */}
            <div className="flex items-center justify-between gap-2 p-2 rounded bg-sky-950/40 border border-sky-500/50 shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                  PREÇO ATUAL
                </span>
                <span className="text-xs text-slate-300">Mercado Ao Vivo</span>
              </div>
              <div className="text-right">
                <span className="text-xs sm:text-sm font-black text-sky-300 font-mono">
                  {signal.currentPrice.toFixed(spec.decimals)}
                </span>
                <span className="block text-[10px] text-emerald-400">
                  {distCurrentToEntry >= 0 ? `+${distCurrentToEntry.toFixed(spec.decimals)}` : distCurrentToEntry.toFixed(spec.decimals)}
                </span>
              </div>
            </div>

            {/* PREÇO DE ENTRADA (Linha Ciano sólida no MT5) */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded bg-cyan-950/30 border border-cyan-500/50 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/30 text-cyan-200">
                  ENTRADA
                </span>
                <span className="text-xs text-cyan-300 font-semibold">Linha Ciano do MT5</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-400">
                {signal.entryPrice.toFixed(spec.decimals)}
              </span>
            </div>

            {/* STOP LOSS (Linha Vermelha no MT5) */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded bg-rose-950/30 border border-rose-500/50 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300">
                  STOP
                </span>
                <span className="text-xs text-rose-300 font-semibold">Linha Vermelha do MT5</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500">
                {signal.stopLoss.toFixed(spec.decimals)}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar at bottom of scale */}
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Risco Stop: <strong className="text-rose-400">-{distEntryToSL.toFixed(spec.decimals)}</strong></span>
            <span>Alvo TP1: <strong className="text-emerald-400">+{distEntryToTP1.toFixed(spec.decimals)}</strong></span>
            <span>R:R: <strong className="text-amber-400">{signal.riskReward}</strong></span>
          </div>
        </div>
      </div>

      {/* MODAL / FORMULÁRIO DE CALIBRAÇÃO DIRETA DA ESCALA MT5 */}
      {isEditing && (
        <form onSubmit={handleSaveEdit} className="p-3.5 rounded-lg bg-slate-900 border border-amber-500/40 space-y-3 font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Calibrar Números da Escala Vertical do Gráfico MT5</span>
            </span>
            <span className="text-[11px] text-slate-400">Digite exatamente o que aparece no seu MT5</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-cyan-400 uppercase mb-1">Preço Entrada</label>
              <input
                type="number"
                step="0.01"
                value={editValues.entryPrice}
                onChange={(e) => setEditValues({ ...editValues, entryPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 rounded bg-black border border-cyan-500/60 text-cyan-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-rose-400 uppercase mb-1">STOP (SL)</label>
              <input
                type="number"
                step="0.01"
                value={editValues.stopLoss}
                onChange={(e) => setEditValues({ ...editValues, stopLoss: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 rounded bg-black border border-rose-500/60 text-rose-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-emerald-400 uppercase mb-1">TAKE 1 (TP1)</label>
              <input
                type="number"
                step="0.01"
                value={editValues.takeProfit1}
                onChange={(e) => setEditValues({ ...editValues, takeProfit1: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 rounded bg-black border border-emerald-500/60 text-emerald-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-emerald-400 uppercase mb-1">TAKE 2 (TP2)</label>
              <input
                type="number"
                step="0.01"
                value={editValues.takeProfit2}
                onChange={(e) => setEditValues({ ...editValues, takeProfit2: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 rounded bg-black border border-emerald-500/60 text-emerald-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-emerald-400 uppercase mb-1">TAKE 3 (TP3)</label>
              <input
                type="number"
                step="0.01"
                value={editValues.takeProfit3}
                onChange={(e) => setEditValues({ ...editValues, takeProfit3: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 rounded bg-black border border-emerald-500/60 text-emerald-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-sky-400 uppercase mb-1">Probabilidade %</label>
              <input
                type="number"
                step="1"
                min="10"
                max="99"
                value={editValues.confidence}
                onChange={(e) => setEditValues({ ...editValues, confidence: parseInt(e.target.value, 10) || 65 })}
                className="w-full px-2 py-1.5 rounded bg-black border border-sky-500/60 text-sky-300 font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                // Load preset from screenshot
                setEditValues({
                  entryPrice: 4258.46,
                  stopLoss: 4240.67,
                  takeProfit1: 4276.25,
                  takeProfit2: 4285.15,
                  takeProfit3: 4294.04,
                  confidence: 65,
                });
              }}
              className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Restaurar Valores Exatos do Gráfico MT5 (4258.46 / 4240.67 / 4276.25)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer"
              >
                Salvar Escala
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
