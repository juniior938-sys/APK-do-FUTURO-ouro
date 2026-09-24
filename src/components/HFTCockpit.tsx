import React from 'react';
import {
  HFTOrderBook,
  BatteryAnswers,
  HFTAction,
  LadderRung,
  HFTTickRecord,
  HFTStats,
  HFTRiskLimits,
} from '../types/hft';
import { ExnessAccountType, ConnectionStatus } from '../types/mt5';
import { StealthShieldConfig } from '../types/stealth';
import { PairSelector } from './PairSelector';
import { formatUsd, EXNESS_ACCOUNT_SPECS } from '../utils/goldMath';
import {
  Zap,
  Play,
  Square,
  AlertOctagon,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Smartphone,
  Gauge,
  Radio,
} from 'lucide-react';

interface HFTCockpitProps {
  isHftRunning: boolean;
  onToggleHft: () => void;
  orderBook: HFTOrderBook;
  battery: BatteryAnswers;
  currentAction: HFTAction;
  currentRung: LadderRung;
  stats: HFTStats;
  tickHistory: HFTTickRecord[];
  limits: HFTRiskLimits;
  onUpdateLimits: (limits: HFTRiskLimits) => void;
  onKillSwitch: () => void;
  inventoryLots: number;
  floatingPnl: number;
  dailyClosedProfit?: number;
  connectionStatus?: ConnectionStatus;
  accountType?: ExnessAccountType;
  onSelectAccountType?: (type: ExnessAccountType) => void;
  onOpenDailyReport?: () => void;
  onOpenPairsModal?: () => void;
  onOpenAndroidApk?: () => void;
  activeSymbol?: string;
  onSelectSymbol?: (symbol: string) => void;
  stealthConfig?: StealthShieldConfig;
}

export const HFTCockpit: React.FC<HFTCockpitProps> = ({
  isHftRunning,
  onToggleHft,
  orderBook,
  battery,
  currentAction,
  currentRung,
  stats,
  limits,
  onUpdateLimits,
  onKillSwitch,
  inventoryLots,
  floatingPnl,
  dailyClosedProfit = 0,
  connectionStatus = 'connected',
  accountType = 'raw_spread',
  onSelectAccountType,
  onOpenDailyReport,
  onOpenAndroidApk,
  activeSymbol = 'XAUUSD',
  onSelectSymbol,
}) => {
  const currentSpec = EXNESS_ACCOUNT_SPECS[accountType] || EXNESS_ACCOUNT_SPECS.raw_spread;
  const totalDailyPnl = (dailyClosedProfit || 0) + (floatingPnl || 0);
  const isPnlPositive = totalDailyPnl >= 0;

  // Best Bid & Ask with fallbacks
  const bestBid = orderBook.bids[0]?.price ?? (orderBook.mid > 0 ? orderBook.mid - 0.15 : 2842.20);
  const bestAsk = orderBook.asks[0]?.price ?? (orderBook.mid > 0 ? orderBook.mid + 0.15 : 2842.45);

  // Direction Helper
  const isDirectionUp = battery.direction.choice === 'up';
  const isDirectionDown = battery.direction.choice === 'down';

  return (
    <div className="w-full space-y-3 sm:space-y-4 font-sans select-none bg-black text-slate-100">
      {/* ── BENTO GRID RESPONSIVO (FUNDO PRETO PREMIUM) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-3.5">
        
        {/* ── CARD 1: PnL DIÁRIO (DESTAQUE HERO) ── */}
        <div className="sm:col-span-2 lg:col-span-5 bg-[#080808] border border-zinc-800/90 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-all shadow-md">
          {/* Subtle ambient light on black background */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                PnL Diário
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-900 text-zinc-300 border border-zinc-800">
                Hoje
              </span>
            </div>
            
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isPnlPositive 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                : 'bg-rose-950/40 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
            }`}>
              {isPnlPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{isPnlPositive ? '+LUCRO' : '-LOSS'}</span>
            </div>
          </div>

          {/* Main Number with Fluid Typography */}
          <div className="my-3 sm:my-4">
            <div className={`text-3xl sm:text-4xl lg:text-[2.6rem] font-black font-mono tracking-tight tabular-nums ${
              isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {totalDailyPnl > 0 ? `+${formatUsd(totalDailyPnl)}` : formatUsd(totalDailyPnl)}
            </div>
            
            {/* Sub-values with Graceful Flex Wrapping */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 text-[11px]">Flutuante:</span>
                <span className={`font-bold tabular-nums ${floatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {floatingPnl > 0 ? `+${formatUsd(floatingPnl)}` : formatUsd(floatingPnl)}
                </span>
              </div>
              <span className="text-zinc-800 hidden xs:inline">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 text-[11px]">Realizado:</span>
                <span className={`font-bold tabular-nums ${dailyClosedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {dailyClosedProfit > 0 ? `+${formatUsd(dailyClosedProfit)}` : formatUsd(dailyClosedProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="pt-2.5 border-t border-zinc-900 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Blindagem Ativa</span>
            </span>
            <span className="font-mono text-zinc-400">
              Execuções: <b className="text-zinc-200">{stats.fillsCount}</b>
            </span>
          </div>
        </div>

        {/* ── CARD 2: STATUS DE CONEXÃO & CONTROLE DO MOTOR ── */}
        <div className="sm:col-span-1 lg:col-span-4 bg-[#080808] border border-zinc-800/90 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Status & Motor</span>
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black border border-zinc-800 font-mono text-[11px]">
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-400'
              }`} />
              <span className="text-zinc-200 uppercase font-bold text-[10px]">
                {connectionStatus === 'connected' ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* Mini Badges Grid */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 my-3 font-mono">
            <div className="bg-black/90 p-2 rounded-xl border border-zinc-900 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-sans">Ativo</span>
              <b className="text-amber-400 text-xs sm:text-sm font-bold truncate block">{activeSymbol}</b>
            </div>
            <div className="bg-black/90 p-2 rounded-xl border border-zinc-900 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-sans">Degrau</span>
              <b className={`text-xs sm:text-sm font-bold truncate block ${
                currentRung === 'RUN' ? 'text-emerald-400' : 'text-amber-400'
              }`}>{currentRung}</b>
            </div>
            <div className="bg-black/90 p-2 rounded-xl border border-zinc-900 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-sans">Ping</span>
              <b className="text-zinc-200 text-xs sm:text-sm font-bold truncate block">~{stats.avgLatencyMs.toFixed(0)}ms</b>
            </div>
          </div>

          {/* Master Start/Pause Button */}
          <button
            type="button"
            onClick={onToggleHft}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99] ${
              isHftRunning
                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black font-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isHftRunning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Pausar Motor HFT</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Iniciar Motor HFT</span>
              </>
            )}
          </button>
        </div>

        {/* ── CARD 3: BOTÃO DE EMERGÊNCIA (KILL SWITCH) ── */}
        <div className="sm:col-span-1 lg:col-span-3 bg-gradient-to-br from-[#120608] to-[#080808] border border-rose-950/80 hover:border-rose-900/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Emergência</span>
            </span>
            <span className="text-[10px] font-mono text-rose-400/80 px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-900/40">
              1-Clique
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 my-2 sm:my-3 leading-snug">
            Encerra imediatamente ordens abertas e cancela cotações ativas.
          </p>

          <button
            type="button"
            onClick={onKillSwitch}
            className="w-full py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-950/60 border border-rose-500/50"
            title="Zerar todas as ordens e posições abertas agora"
          >
            <AlertOctagon className="w-4 h-4 fill-white/20 shrink-0" />
            <span className="tracking-wide">KILL SWITCH · ZERAR</span>
          </button>
        </div>

        {/* ── CARD 4: COTAÇÃO REAL & SPREAD ── */}
        <div className="sm:col-span-1 lg:col-span-6 bg-[#080808] border border-zinc-800/90 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-zinc-200 truncate">{activeSymbol} Tempo Real</span>
            </div>
            
            <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
              <span className="text-zinc-500">Spread:</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold tabular-nums">
                {orderBook.spreadPips.toFixed(1)} pips
              </span>
            </div>
          </div>

          {/* Bid / Ask Boxes */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 font-mono">
            <div className="bg-black/90 border border-zinc-900 p-2.5 sm:p-3 rounded-xl">
              <span className="text-[10px] text-emerald-400/80 uppercase font-sans font-bold block mb-0.5">
                Compra (Bid)
              </span>
              <span className="text-lg sm:text-2xl font-bold text-emerald-400 tabular-nums">
                {bestBid.toFixed(2)}
              </span>
            </div>
            <div className="bg-black/90 border border-zinc-900 p-2.5 sm:p-3 rounded-xl">
              <span className="text-[10px] text-rose-400/80 uppercase font-sans font-bold block mb-0.5">
                Venda (Ask)
              </span>
              <span className="text-lg sm:text-2xl font-bold text-rose-400 tabular-nums">
                {bestAsk.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Interval Selector */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-900 text-[11px] gap-2">
            <span className="text-zinc-500 font-sans">Velocidade:</span>
            <div className="flex items-center gap-1 font-mono">
              {[
                { label: '200ms', val: 200 },
                { label: '500ms', val: 500 },
                { label: '1.0s', val: 1000 },
              ].map((sp) => (
                <button
                  key={sp.val}
                  type="button"
                  onClick={() => onUpdateLimits({ ...limits, tickIntervalMs: sp.val })}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                    limits.tickIntervalMs === sp.val
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-black text-zinc-400 hover:text-zinc-200 border border-zinc-900'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CARD 5: DECISÃO INSTITUCIONAL & MICROESTRUTURA ── */}
        <div className="sm:col-span-1 lg:col-span-6 bg-[#080808] border border-zinc-800/90 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-zinc-200 truncate">Decisão Algorítmica</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 shrink-0">
              <span className="text-zinc-500">Custódia:</span>
              <b className="text-zinc-200 tabular-nums">{inventoryLots.toFixed(2)} L</b>
            </div>
          </div>

          {/* Action Box */}
          <div className="bg-black/90 border border-zinc-900 p-2.5 sm:p-3 rounded-xl flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold font-mono text-zinc-100 tracking-tight">
                  {currentAction.kind.replace(/_/g, ' ')}
                </span>
                {currentAction.direction_leg && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    LEG {currentAction.direction_leg.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                {currentAction.reason || 'Analisando livro de ordens e fluxo institucional...'}
              </p>
            </div>

            <div className="shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isDirectionUp
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                  : isDirectionDown
                  ? 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}>
                {isDirectionUp ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : isDirectionDown ? (
                  <ArrowDownRight className="w-4 h-4" />
                ) : (
                  <Activity className="w-3.5 h-3.5" />
                )}
              </div>
            </div>
          </div>

          {/* Minimalist Micro-stats Bar */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3 pt-2.5 border-t border-zinc-900 text-[10px] font-mono text-center">
            <div className="bg-black/60 p-1.5 rounded-lg border border-zinc-900/60">
              <span className="text-zinc-500 block font-sans">Regime</span>
              <span className="text-zinc-300 font-bold capitalize truncate block">{battery.regime.choice}</span>
            </div>
            <div className="bg-black/60 p-1.5 rounded-lg border border-zinc-900/60">
              <span className="text-zinc-500 block font-sans">Fluxo Tóxico</span>
              <span className={`font-bold tabular-nums block ${battery.toxic_flow.noul > 0.6 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {battery.toxic_flow.noul.toFixed(2)}
              </span>
            </div>
            <div className="bg-black/60 p-1.5 rounded-lg border border-zinc-900/60">
              <span className="text-zinc-500 block font-sans">Broker</span>
              <span className="text-zinc-300 font-bold tabular-nums block">{battery.execution_health.score.toFixed(1)}/3.0</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── BARRA INFERIOR DISCRETA (FUNDO PRETO & MOBILE SCROLL) ── */}
      <div className="bg-[#080808] border border-zinc-800/90 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs shadow-md">
        <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
          <PairSelector
            activeSymbol={activeSymbol}
            onSelectSymbol={onSelectSymbol || (() => {})}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onOpenDailyReport && (
            <button
              type="button"
              onClick={onOpenDailyReport}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Relatório 24H</span>
            </button>
          )}

          {onOpenAndroidApk && (
            <button
              type="button"
              onClick={onOpenAndroidApk}
              className="px-3 py-1.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/40 text-sky-300 hover:text-white font-medium text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>App Android</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
