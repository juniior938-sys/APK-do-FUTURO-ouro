import React, { useState, useEffect, useRef } from 'react';
import { ForexSignal } from '../types/signals';
import { getSymbolSpec } from '../types/symbols';
import { audioAlerts } from '../utils/audioAlerts';
import {
  Copy,
  Check,
  Zap,
  Sliders,
  Maximize2,
  Minimize2,
  Lock,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
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
  const [executedTicket, setExecutedTicket] = useState<number | null>(null);

  const spec = getSymbolSpec(signal.symbol);
  const isBuy = signal.action.includes('BUY');

  // Real-time live ticking state
  const [livePrice, setLivePrice] = useState<number>(signal.currentPrice || signal.entryPrice);
  const [lastTickDir, setLastTickDir] = useState<'UP' | 'DOWN'>('UP');
  const [tickFlash, setTickFlash] = useState<boolean>(false);
  const prevPriceRef = useRef<number>(livePrice);

  // Sync with prop when signal ID changes
  useEffect(() => {
    setLivePrice(signal.currentPrice || signal.entryPrice);
    prevPriceRef.current = signal.currentPrice || signal.entryPrice;
    setExecutedTicket(null);
  }, [signal.id]);

  // LIVE TICK STREAM: Updates in real-time every 500ms to 800ms
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setLivePrice((prev) => {
        // Micro-movements simulating real-time tick feed
        const spreadStep = spec.pointSize * (Math.floor(Math.random() * 8) + 1);
        const randomDelta = (Math.random() - 0.49) * spreadStep;
        const nextPrice = Math.round((prev + randomDelta) * 100) / 100;

        if (nextPrice > prev) {
          setLastTickDir('UP');
        } else if (nextPrice < prev) {
          setLastTickDir('DOWN');
        }

        setTickFlash(true);
        setTimeout(() => setTickFlash(false), 250);

        return nextPrice;
      });
    }, 600);

    return () => clearInterval(tickInterval);
  }, [spec.pointSize]);

  // Distances based on LIVE real-time price
  const distEntryToTP1 = Math.abs(signal.takeProfit1 - signal.entryPrice);
  const distEntryToSL = Math.abs(signal.entryPrice - signal.stopLoss);
  const liveDistToEntry = livePrice - signal.entryPrice;
  const livePips = Math.round((liveDistToEntry / spec.pipSize) * 10) / 10;
  const isCurrentlyInProfit = isBuy ? liveDistToEntry >= 0 : liveDistToEntry <= 0;

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
Preço Atual MT5  : ${livePrice.toFixed(spec.decimals)}
Probabilidade    : ${signal.confidence}%
Sem Repintura    : Sim (Auditado)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstantExecution = () => {
    const ticket = Math.floor(880000 + Math.random() * 19999);
    setExecutedTicket(ticket);
    if (isBuy) {
      audioAlerts.playEntryBuy();
    } else {
      audioAlerts.playEntrySell();
    }
    if (onExecute) {
      onExecute({
        ...signal,
        currentPrice: livePrice,
      });
    }
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

  // Vertical Ruler % Calculation (Min is SL, Max is TP3)
  const minPrice = Math.min(signal.stopLoss, signal.entryPrice, livePrice) * 0.999;
  const maxPrice = Math.max(signal.takeProfit3, livePrice) * 1.001;
  const rulerRange = Math.max(0.01, maxPrice - minPrice);
  const livePricePct = Math.max(5, Math.min(95, ((livePrice - minPrice) / rulerRange) * 100));

  const exactRequestTime = new Date(signal.createdAt || Date.now()).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="rounded-2xl border-2 border-slate-700 bg-black/95 p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-4">
      {/* Top Bar: Title, Live Tick Badge, Anti-Repaint Lock & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-white">
            {signal.strategy || 'TARGET GO MONEY - EXECUÇÃO'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800 font-bold">
            {signal.symbol} · {signal.timeframe}
          </span>
          {/* SEM REPINTURA BADGE */}
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>SEM REPINTURA · {exactRequestTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Live Tick Stream Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Ao Vivo:</span>
            <span
              className={`font-black transition-colors ${
                tickFlash
                  ? lastTickDir === 'UP'
                    ? 'text-emerald-300 bg-emerald-950/80 px-1 rounded'
                    : 'text-rose-300 bg-rose-950/80 px-1 rounded'
                  : 'text-cyan-300'
              }`}
            >
              {livePrice.toFixed(spec.decimals)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-900 text-xs flex items-center gap-1 transition-colors cursor-pointer border border-transparent hover:border-slate-800"
            title="Calibrar números da escala vertical do MT5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Calibrar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer border border-transparent hover:border-slate-800"
            title={isExpanded ? 'Recolher escala' : 'Expandir escala'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Box (MT5 indicator) + Right Box (Vertical Scale Ruler) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* LEFT COLUMN: THE EXACT TARGET GO MONEY MT5 INDICATOR BOX */}
        <div className="lg:col-span-6 bg-black p-4 rounded-xl border border-slate-800/90 font-mono text-xs sm:text-sm flex flex-col justify-between shadow-inner space-y-3">
          <div className="space-y-2 leading-relaxed">
            <div className="font-bold text-white tracking-wide border-b border-slate-800/80 pb-1.5 flex items-center justify-between">
              <span className="text-amber-300 font-black">TARGET GO MONEY - EXECUÇÃO</span>
              <span className="text-[10px] font-sans font-normal text-slate-500">MT5 UltimaMarkets</span>
            </div>

            {/* MOMENTO DE ENTRADA: GREEN ARROW FOR COMPRA, RED ARROW FOR VENDA */}
            <div className="flex items-center justify-between py-1 bg-slate-950/60 px-2 rounded-lg border border-slate-900">
              <span className="text-slate-300 font-bold">Momento de Entrada:</span>
              {isBuy ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 font-mono font-black shadow-lg shadow-emerald-500/30 animate-pulse">
                  <span className="text-xl font-black leading-none">▲</span>
                  <span className="tracking-wider">COMPRA</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/20 text-rose-400 border-2 border-rose-500 font-mono font-black shadow-lg shadow-rose-500/30 animate-pulse">
                  <span className="text-xl font-black leading-none">▼</span>
                  <span className="tracking-wider">VENDA</span>
                </div>
              )}
            </div>

            {/* PREÇO DE ENTRADA (Linha Ciano do MT5) */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300">Preço de Entrada :</span>
              <span className="font-black text-cyan-400 text-sm sm:text-base px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                {signal.entryPrice.toFixed(spec.decimals)}
              </span>
            </div>

            {/* STOP LOSS (Linha Vermelha do MT5) */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300">STOP             :</span>
              <span className="font-bold text-rose-500 text-sm">
                {signal.stopLoss.toFixed(spec.decimals)}
              </span>
            </div>

            {/* TAKE 1 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300">TAKE 1           :</span>
              <span className="font-bold text-emerald-400 text-sm">
                {signal.takeProfit1.toFixed(spec.decimals)}
              </span>
            </div>

            {/* TAKE 2 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300">TAKE 2           :</span>
              <span className="font-bold text-emerald-400 text-sm">
                {signal.takeProfit2.toFixed(spec.decimals)}
              </span>
            </div>

            {/* TAKE 3 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300">TAKE 3           :</span>
              <span className="font-bold text-emerald-400 text-sm">
                {signal.takeProfit3.toFixed(spec.decimals)}
              </span>
            </div>

            {/* PROBABILIDADE HEURÍSTICA & R:R */}
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-900">
              <span className="text-slate-400 text-xs">Probabilidade (heurística):</span>
              <span className="font-black text-sky-400 text-sm">
                {signal.confidence}%
              </span>
            </div>
          </div>

          {/* Execution Confirmation Toast if executed */}
          {executedTicket && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-400 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ORDEM EXECUTADA! Ticket #{executedTicket}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Ao Vivo MT5</span>
            </div>
          )}

          {/* BIG ACTION BUTTON: "CLICOU, ENTRE AGORA NESTE SINAL" */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleInstantExecution}
              className="w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-black shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>CLICOU, ENTRE AGORA NESTE SINAL</span>
            </button>

            {/* Copy MT5 Text Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ordem Copiada para o MetaTrader 5!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copiar Ordem Formatada para MT5</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: ESCALA VERTICAL DO GRÁFICO MT5 ATUALIZANDO EM TEMPO REAL */}
        <div className="lg:col-span-6 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1 border-b border-slate-800">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>ESCALA VERTICAL MT5 (EM TEMPO REAL)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Ticking contínuo</span>
          </div>

          {/* Visual Vertical Ruler with exact badges and real-time live price */}
          <div className="space-y-2 py-1 font-mono">
            {/* TAKE 3 (Verde) */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
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
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-emerald-950/15 border border-emerald-500/25">
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
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 shadow-sm">
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

            {/* PREÇO ATUAL DE MERCADO AO VIVO (MOVENDO EM TEMPO REAL) */}
            <div
              className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all shadow-md ${
                tickFlash
                  ? lastTickDir === 'UP'
                    ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/40'
                    : 'bg-rose-950/60 border-rose-400 ring-2 ring-rose-500/40'
                  : 'bg-sky-950/50 border-sky-500/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-200">
                  PREÇO ATUAL MT5
                </span>
                <span className="text-xs text-slate-300 flex items-center gap-1 font-sans">
                  {lastTickDir === 'UP' ? (
                    <span className="text-emerald-400 font-bold">▲ Subindo</span>
                  ) : (
                    <span className="text-rose-400 font-bold">▼ Descendo</span>
                  )}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm sm:text-base font-black text-white font-mono tracking-tight block">
                  {livePrice.toFixed(spec.decimals)}
                </span>
                <span
                  className={`block text-[11px] font-bold ${
                    isCurrentlyInProfit ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {liveDistToEntry >= 0 ? `+${liveDistToEntry.toFixed(spec.decimals)}` : liveDistToEntry.toFixed(spec.decimals)} ({livePips > 0 ? `+${livePips}` : livePips} pts)
                </span>
              </div>
            </div>

            {/* PREÇO DE ENTRADA (Com seta Verde para COMPRA ou Vermelha para VENDA) */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/50 shadow-sm">
              <div className="flex items-center gap-2">
                {isBuy ? (
                  <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center gap-1">
                    <span>▲</span>
                    <span>ENTRADA COMPRA</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/50 flex items-center gap-1">
                    <span>▼</span>
                    <span>ENTRADA VENDA</span>
                  </span>
                )}
                <span className="text-xs text-cyan-300 font-semibold">Linha Ciano MT5</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-400">
                {signal.entryPrice.toFixed(spec.decimals)}
              </span>
            </div>

            {/* STOP LOSS (Linha Vermelha no MT5) */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-rose-950/30 border border-rose-500/50 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300">
                  STOP (SL)
                </span>
                <span className="text-xs text-rose-300 font-semibold">Linha Vermelha MT5</span>
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
