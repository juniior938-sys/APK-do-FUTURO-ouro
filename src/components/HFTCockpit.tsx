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
import { ExnessAccountType } from '../types/mt5';
import { StealthShieldConfig } from '../types/stealth';
import { PairSelector } from './PairSelector';
import { formatGoldPrice, formatUsd, EXNESS_ACCOUNT_SPECS } from '../utils/goldMath';
import {
  Zap,
  Play,
  Square,
  AlertOctagon,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  Gauge,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  Building2,
  FileText,
  Lock,
  Smartphone,
  Github,
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
  accountType?: ExnessAccountType;
  onSelectAccountType?: (type: ExnessAccountType) => void;
  onOpenDailyReport?: () => void;
  onOpenStealthShield?: () => void;
  onOpenPairsModal?: () => void;
  onOpenAndroidApk?: () => void;
  onOpenGitHubSync?: () => void;
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
  tickHistory,
  limits,
  onUpdateLimits,
  onKillSwitch,
  inventoryLots,
  floatingPnl,
  accountType = 'raw_spread',
  onSelectAccountType,
  onOpenDailyReport,
  onOpenStealthShield,
  onOpenPairsModal,
  onOpenAndroidApk,
  onOpenGitHubSync,
  activeSymbol = 'XAUUSD',
  onSelectSymbol,
  stealthConfig,
}) => {
  const isKill = currentRung === 'KILL' || currentAction.kind === 'KILL';
  const currentSpec = EXNESS_ACCOUNT_SPECS[accountType] || EXNESS_ACCOUNT_SPECS.raw_spread;

  // Helper colors for action
  const getActionColor = (kind: HFTAction['kind']) => {
    switch (kind) {
      case 'QUOTE_BOTH_SIDES':
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
      case 'QUOTE_WIDE':
        return 'bg-blue-500/15 border-blue-500/40 text-blue-300';
      case 'WIDEN':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-300';
      case 'PULL_QUOTES':
        return 'bg-purple-500/15 border-purple-500/40 text-purple-300';
      case 'STAND_DOWN':
        return 'bg-slate-800 border-slate-700 text-slate-400';
      case 'KILL':
        return 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse';
    }
  };

  const getRungColor = (rung: LadderRung) => {
    switch (rung) {
      case 'RUN':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'REDUCE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'HOLD_LATE':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'RULES_ONLY':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'KILL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Top Banner: Master HFT Control & Autonomous Mode */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isHftRunning
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-800 border border-slate-700 text-slate-400'
              }`}
            >
              <Zap className="w-6 h-6 fill-current" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Motor de HFT XAUUSD (100% Automático no Navegador)
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getRungColor(
                    currentRung
                  )}`}
                >
                  DEGRAU: {currentRung}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Loop de microestrutura de alta frequência · Bateria de 7 Julgamentos · Pricing Avellaneda-Stoikov
              </p>
            </div>
          </div>

          {/* Speed & Master Switch */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Speed selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { label: '200ms (Ultra)', val: 200 },
                { label: '500ms (Padrão)', val: 500 },
                { label: '1.0s (Normal)', val: 1000 },
              ].map((sp) => (
                <button
                  key={sp.val}
                  type="button"
                  onClick={() => onUpdateLimits({ ...limits, tickIntervalMs: sp.val })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-colors ${
                    limits.tickIntervalMs === sp.val
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>

            {/* Master Toggle */}
            <button
              type="button"
              onClick={onToggleHft}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                isHftRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
              }`}
            >
              {isHftRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Pausar HFT</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Iniciar HFT Automático</span>
                </>
              )}
            </button>

            {/* Emergency Kill Switch */}
            <button
              type="button"
              onClick={onKillSwitch}
              className="px-3.5 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Zera imediatamente todas as cotações e lotes abertos"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>KILL / ZERAR</span>
            </button>

            {/* Daily Performance & 24H Timeline Button */}
            {onOpenDailyReport && (
              <button
                type="button"
                onClick={onOpenDailyReport}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm whitespace-nowrap"
                title="Abrir Relatório Diário de Performance e Linha do Tempo 24H"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Relatório & Timeline 24H</span>
              </button>
            )}

            {/* Android APK Button */}
            {onOpenAndroidApk && (
              <button
                type="button"
                onClick={onOpenAndroidApk}
                className="px-3.5 py-2.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/70 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm whitespace-nowrap"
                title="Instalar Aplicativo no Android (APK / WebAPK)"
              >
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>Instalar APK Android</span>
              </button>
            )}

            {/* GitHub Export Button */}
            {onOpenGitHubSync && (
              <button
                type="button"
                onClick={onOpenGitHubSync}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm whitespace-nowrap"
                title="Enviar para o GitHub ou Baixar Código em .ZIP"
              >
                <Github className="w-4 h-4 text-white" />
                <span>Enviar p/ GitHub</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bar: Active Pair Selection & Anti-Blocking / Blindagem Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          {/* Pair Selector */}
          <div className="flex-1 min-w-0">
            <PairSelector
              activeSymbol={activeSymbol}
              onSelectSymbol={onSelectSymbol || (() => {})}
            />
          </div>

          {/* Blindagem / Anti-Blocking Widget Button */}
          {onOpenStealthShield && (
            <button
              type="button"
              onClick={onOpenStealthShield}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3 text-xs font-medium transition-all shrink-0 cursor-pointer shadow-sm"
              title="Configurar Blindagem do Servidor e Stops Invisíveis"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">Blindagem do Servidor:</span>
                <span className="font-mono text-emerald-300 text-[11px]">
                  {stealthConfig?.enabled !== false ? 'PROTEÇÃO MÁXIMA ATIVA' : 'PAUSADO'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Stops Virtuais + Jitter + Anti-Spike</span>
              </div>
            </button>
          )}
        </div>

        {/* Micro-Features of the Shield summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/70 flex items-center gap-2">
            <span className="text-amber-400 font-bold">1. Stop Oculto:</span>
            <span className="text-emerald-400">Invisível no L2</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/70 flex items-center gap-2">
            <span className="text-sky-400 font-bold">2. Anti-Detecção:</span>
            <span className="text-emerald-400">Jitter +18~42ms</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/70 flex items-center gap-2">
            <span className="text-purple-400 font-bold">3. Anti-Spike:</span>
            <span className="text-emerald-400">Filtro de Spread</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/70 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">4. Conexão:</span>
            <span className="text-emerald-400">Heartbeat Ativo</span>
          </div>
        </div>
      </div>

      {/* Exness Account Type & Real Spread Profile Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">Exness.com - Perfil de Conta & Spread:</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {currentSpec.name} ({currentSpec.symbol})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {currentSpec.description}
            </p>
          </div>
        </div>

        {/* 1-Click Account Type Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto shrink-0">
          {(['raw_spread', 'zero', 'standard', 'standard_cent', 'pro'] as ExnessAccountType[]).map((type) => {
            const spec = EXNESS_ACCOUNT_SPECS[type];
            const isSelected = accountType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelectAccountType && onSelectAccountType(type)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-amber-500/60 bg-amber-500/20 text-white font-bold shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{spec.name.replace('Exness ', '')}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                  {spec.typicalSpreadPips.toFixed(1)}p
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: L2 Order Book + 7-Question Battery + Real-Time Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 Cols): Level 2 Order Book & Avellaneda-Stoikov */}
        <div className="lg:col-span-5 space-y-4">
          {/* Level 2 Depth of Market */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wide">
                  Livro de Ofertas L2 (XAUUSD)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Imbalance: <b className={`tabular-nums ${orderBook.imbalance > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{orderBook.imbalance > 0 ? '+' : ''}{(orderBook.imbalance * 100).toFixed(1)}%</b>
              </span>
            </div>

            {/* Asks (Sell orders - Red) */}
            <div className="space-y-1 font-mono text-[11px]">
              {orderBook.asks.slice().reverse().map((ask, idx) => (
                <div key={idx} className="relative flex items-center justify-between px-2 py-0.5">
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/10 rounded"
                    style={{ width: `${Math.min(100, (ask.size / 6.0) * 100)}%` }}
                  />
                  <span className="text-rose-400 font-bold tabular-nums z-10">{ask.price.toFixed(2)}</span>
                  <span className="text-slate-300 tabular-nums z-10">{ask.size.toFixed(1)} L</span>
                  <span className="text-slate-500 tabular-nums z-10">{ask.total.toFixed(1)}</span>
                </div>
              ))}
            </div>

            {/* Spread Divider */}
            <div className="my-1.5 py-1.5 px-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400 font-sans font-medium">Spread XAUUSD:</span>
              <span className="text-amber-400 font-bold tabular-nums">{orderBook.spreadPips.toFixed(1)} pips (${orderBook.spread.toFixed(2)})</span>
              <span className="text-slate-500 text-[10px]">Mid {orderBook.mid.toFixed(2)}</span>
            </div>

            {/* Bids (Buy orders - Green) */}
            <div className="space-y-1 font-mono text-[11px]">
              {orderBook.bids.map((bid, idx) => (
                <div key={idx} className="relative flex items-center justify-between px-2 py-0.5">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 rounded"
                    style={{ width: `${Math.min(100, (bid.size / 6.0) * 100)}%` }}
                  />
                  <span className="text-emerald-400 font-bold tabular-nums z-10">{bid.price.toFixed(2)}</span>
                  <span className="text-slate-300 tabular-nums z-10">{bid.size.toFixed(1)} L</span>
                  <span className="text-slate-500 tabular-nums z-10">{bid.total.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Avellaneda-Stoikov & Inventory Skew */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-blue-400" />
                <span>Pricing Avellaneda-Stoikov</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Inventory q: <b>{inventoryLots.toFixed(2)} L</b></span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 font-sans block">Cotação Compra HFT:</span>
                <span className="text-emerald-400 font-bold text-sm tabular-nums">
                  {currentAction.bidPrice ? currentAction.bidPrice.toFixed(2) : orderBook.bids[0]?.price.toFixed(2)}
                </span>
              </div>

              <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 font-sans block">Cotação Venda HFT:</span>
                <span className="text-rose-400 font-bold text-sm tabular-nums">
                  {currentAction.askPrice ? currentAction.askPrice.toFixed(2) : orderBook.asks[0]?.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Skew Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Vies de Desova (Skew):</span>
                <span className="font-mono text-amber-400 font-semibold">{currentAction.skew > 0 ? `+${currentAction.skew.toFixed(2)}` : currentAction.skew.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.max(5, (currentAction.skew + 1) * 50)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): 7-Question Judgment Battery & Live Tick Stream */}
        <div className="lg:col-span-7 space-y-4">
          {/* Current Decision Action Alert */}
          <div className={`p-4 rounded-2xl border transition-all ${getActionColor(currentAction.kind)}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-80">
                  Decisão do Motor HFT Atual
                </span>
                <div className="text-xl font-bold font-mono tracking-tight mt-0.5 flex items-center gap-2">
                  <span>{currentAction.kind}</span>
                  {currentAction.direction_leg && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-950/80 font-mono font-bold text-amber-400">
                      PERNA {currentAction.direction_leg.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right font-mono text-[11px]">
                <div className="opacity-80 font-sans">Latência de Decisão:</div>
                <div className="text-sm font-bold tabular-nums text-white">
                  ~{stats.avgLatencyMs.toFixed(0)} ms
                </div>
              </div>
            </div>

            <p className="text-xs font-sans mt-2 leading-relaxed opacity-90 border-t border-current/20 pt-2">
              {currentAction.reason}
            </p>
          </div>

          {/* The 7-Question Battery Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wide flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Bateria de 7 Julgamentos (Modelo Jev)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">1 chamada · 7 saídas tipadas</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
              {/* 1. Regime */}
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">1. Regime</span>
                <b className="text-white capitalize block mt-0.5">{battery.regime.choice}</b>
                <span className="text-[10px] font-mono text-amber-400">{(battery.regime.confidence * 100).toFixed(0)}% conf</span>
              </div>

              {/* 2. Direction */}
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">2. Direção</span>
                <b className={`capitalize block mt-0.5 ${battery.direction.choice === 'up' ? 'text-emerald-400' : battery.direction.choice === 'down' ? 'text-rose-400' : 'text-slate-300'}`}>
                  {battery.direction.choice.toUpperCase()}
                </b>
                <span className="text-[10px] font-mono text-amber-400">{(battery.direction.confidence * 100).toFixed(0)}% conf</span>
              </div>

              {/* 3. Toxic Flow */}
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">3. Fluxo Tóxico</span>
                <b className={`block mt-0.5 tabular-nums ${battery.toxic_flow.noul > 0.60 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {battery.toxic_flow.noul.toFixed(2)}
                </b>
                <span className="text-[10px] text-slate-500">{battery.toxic_flow.noul > 0.60 ? 'Alerta sweep' : 'Ruído normal'}</span>
              </div>

              {/* 4. Liquidity Stress */}
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">4. Estresse Book</span>
                <b className="text-slate-200 block mt-0.5 tabular-nums">{battery.liquidity_stressed.noul.toFixed(2)}</b>
                <span className="text-[10px] text-slate-500">{battery.liquidity_stressed.noul > 0.70 ? 'Alarga spread' : 'Book líquido'}</span>
              </div>

              {/* 5. Quote Environment */}
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">5. Ambiente Cotação</span>
                <b className="text-amber-400 block mt-0.5 tabular-nums">{battery.quote_environment.score.toFixed(1)} / 3.0</b>
                <span className="text-[10px] text-slate-500">{battery.quote_environment.legend[Math.round(battery.quote_environment.score).toString()]}</span>
              </div>

              {/* 6. Inventory Pressure */}
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">6. Pressão Estoque</span>
                <b className="text-slate-200 block mt-0.5 tabular-nums">{battery.inventory_pressure.score.toFixed(1)} / 3.0</b>
                <span className="text-[10px] text-slate-500">{battery.inventory_pressure.legend[Math.round(battery.inventory_pressure.score).toString()]}</span>
              </div>

              {/* 7. Execution Health */}
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 col-span-2">
                <span className="text-[10px] text-slate-400 block">7. Saúde Execução Broker</span>
                <div className="flex items-center justify-between mt-0.5">
                  <b className="text-emerald-400 tabular-nums">{battery.execution_health.score.toFixed(1)} / 3.0</b>
                  <span className="text-[10px] font-mono text-slate-400">Latência: ~{stats.avgLatencyMs.toFixed(0)}ms</span>
                </div>
                <span className="text-[10px] text-slate-500">{battery.execution_health.legend[Math.round(battery.execution_health.score).toString()]}</span>
              </div>
            </div>
          </div>

          {/* Live Tick-by-Tick Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Feed de Ticks HFT em Tempo Real</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                {stats.ticksCount} ticks processados · {stats.fillsCount} fills executados
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px]">
              {tickHistory.slice(0, 15).map((t) => (
                <div
                  key={t.tick}
                  className="p-1.5 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-center justify-between hover:bg-slate-950 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px]">#{t.tick}</span>
                    <span className="text-slate-200 font-bold tabular-nums">{t.mid.toFixed(2)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        t.action === 'QUOTE_BOTH_SIDES'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : t.action === 'PULL_QUOTES'
                          ? 'text-purple-400 bg-purple-500/10'
                          : t.action === 'WIDEN'
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-slate-400 bg-slate-800'
                      }`}
                    >
                      {t.action}
                    </span>
                    {t.directionLeg && (
                      <span className="text-amber-400 text-[10px]">[{t.directionLeg.toUpperCase()} LEG]</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-slate-400">{t.fill || '-'}</span>
                    <span className="text-slate-500 tabular-nums">{t.latencyMs.toFixed(0)}ms</span>
                    <span className="text-slate-600">{t.timeStr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
