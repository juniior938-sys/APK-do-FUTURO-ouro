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
  Wifi,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Smartphone,
  CheckCircle2,
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

  // Best Bid & Ask
  const bestBid = orderBook.bids[0]?.price ?? orderBook.mid - 0.15;
  const bestAsk = orderBook.asks[0]?.price ?? orderBook.mid + 0.15;

  // Direction Helper
  const isDirectionUp = battery.direction.choice === 'up';
  const isDirectionDown = battery.direction.choice === 'down';

  return (
    <div className="space-y-4 font-sans select-none">
      {/* ── BENTO GRID COMPACTO ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        
        {/* CARD 1: PnL DIÁRIO (Destaque Principal) */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                PnL Diário (Resultado Total)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800/80 text-slate-300 border border-slate-700/60">
                Hoje
              </span>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
              isPnlPositive 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {isPnlPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPnlPositive ? 'LUCRO' : 'LOSS'}</span>
            </div>
          </div>

          <div className="my-3">
            <div className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
              isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {totalDailyPnl > 0 ? `+${formatUsd(totalDailyPnl)}` : formatUsd(totalDailyPnl)}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px]">Flutuante:</span>
                <span className={`font-bold ${floatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {floatingPnl > 0 ? `+${formatUsd(floatingPnl)}` : formatUsd(floatingPnl)}
                </span>
              </div>
              <div className="text-slate-700">|</div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px]">Realizado:</span>
                <span className={`font-bold ${dailyClosedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {dailyClosedProfit > 0 ? `+${formatUsd(dailyClosedProfit)}` : formatUsd(dailyClosedProfit)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Blindagem de Conta Ativa
            </span>
            <span className="font-mono text-slate-400">
              Fills: <b className="text-slate-200">{stats.fillsCount}</b>
            </span>
          </div>
        </div>

        {/* CARD 2: STATUS DE CONEXÃO & CONTROLE DO MOTOR HFT */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Status & Conexão
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px]">
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`} />
              <span className="text-slate-200 uppercase font-bold text-[10px]">
                {connectionStatus === 'connected' ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 my-2 font-mono">
            <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/70 text-center">
              <span className="text-[10px] text-slate-500 block">Par</span>
              <b className="text-amber-400 text-xs">{activeSymbol}</b>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/70 text-center">
              <span className="text-[10px] text-slate-500 block">Degrau</span>
              <b className={`text-xs ${
                currentRung === 'RUN' ? 'text-emerald-400' : 'text-amber-400'
              }`}>{currentRung}</b>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/70 text-center">
              <span className="text-[10px] text-slate-500 block">Latência</span>
              <b className="text-slate-200 text-xs">~{stats.avgLatencyMs.toFixed(0)}ms</b>
            </div>
          </div>

          {/* Master Start/Pause Button */}
          <button
            type="button"
            onClick={onToggleHft}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
              isHftRunning
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/20'
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

        {/* CARD 3: BOTÃO DE EMERGÊNCIA (KILL SWITCH) */}
        <div className="md:col-span-3 bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-900/40 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              Botão de Emergência
            </span>
          </div>

          <p className="text-[11px] text-slate-400 my-1 leading-snug">
            Cancela cotações ativas e fecha todas as ordens imediatamente no clique.
          </p>

          <button
            type="button"
            onClick={onKillSwitch}
            className="w-full py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-900/40"
            title="Zerar todas as ordens e posições abertas agora"
          >
            <AlertOctagon className="w-4 h-4 fill-white/20" />
            <span>KILL SWITCH · ZERAR</span>
          </button>
        </div>
      </div>

      {/* ── SEGUNDA LINHA BENTO: PREÇO, SPREAD & AÇÃO ATUAL DO ROBÔ ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        
        {/* CARD 4: COTAÇÃO REAL & SPREAD */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">{activeSymbol} Cotação em Tempo Real</span>
            </div>
            
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-slate-400">Spread:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                {orderBook.spreadPips.toFixed(1)} pips
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-emerald-400/80 uppercase font-sans font-semibold block">Compra (Bid)</span>
              <span className="text-lg sm:text-xl font-bold text-emerald-400 tabular-nums">
                {bestBid.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-rose-400/80 uppercase font-sans font-semibold block">Venda (Ask)</span>
              <span className="text-lg sm:text-xl font-bold text-rose-400 tabular-nums">
                {bestAsk.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[11px]">
            <span className="text-slate-500 font-sans">Intervalo:</span>
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
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    limits.tickIntervalMs === sp.val
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 5: AÇÃO INSTITUCIONAL & MICROESTRUTURA BÁSICA */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">Decisão Algorítmica Atual</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              <span>Inventário:</span>
              <b className="text-slate-200">{inventoryLots.toFixed(2)} Lotes</b>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-white">
                  {currentAction.kind.replace(/_/g, ' ')}
                </span>
                {currentAction.direction_leg && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300">
                    LEG {currentAction.direction_leg.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {currentAction.reason || 'Analisando livro de ordens e microestrutura de mercado...'}
              </p>
            </div>

            <div className="shrink-0 pl-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDirectionUp
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isDirectionDown
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {isDirectionUp ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : isDirectionDown ? (
                  <ArrowDownRight className="w-5 h-5" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>

          {/* Minimalist Micro-stats Bar */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-center">
            <div>
              <span className="text-slate-500 block font-sans">Regime</span>
              <span className="text-slate-300 font-bold capitalize">{battery.regime.choice}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-sans">Fluxo Tóxico</span>
              <span className={`font-bold ${battery.toxic_flow.noul > 0.6 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {battery.toxic_flow.noul.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-sans">Execução Broker</span>
              <span className="text-slate-300 font-bold">{battery.execution_health.score.toFixed(1)}/3.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BARRA INFERIOR DISCRETA: PARIDADES & ATALHOS ÚTEIS ── */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex-1 w-full sm:w-auto overflow-hidden">
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
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white font-medium text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Relatório 24H</span>
            </button>
          )}

          {onOpenAndroidApk && (
            <button
              type="button"
              onClick={onOpenAndroidApk}
              className="px-2.5 py-1.5 rounded-lg bg-sky-950/50 hover:bg-sky-900/60 border border-sky-800/50 text-sky-300 hover:text-white font-medium text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>App Android</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
