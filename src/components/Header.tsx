import React from 'react';
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  Terminal,
  Sliders,
  FileCode,
  Bot,
  TrendingUp,
  BarChart3,
  Smartphone,
  Layers,
} from 'lucide-react';
import { AccountInfo, ConnectionStatus } from '../types/mt5';
import { EXNESS_ACCOUNT_SPECS } from '../utils/goldMath';
import { getSymbolSpec } from '../types/symbols';

export interface HeaderProps {
  account: AccountInfo;
  status: ConnectionStatus;
  activeTab: 'hft' | 'terminal' | 'bot' | 'prompt' | 'bridge';
  onTabChange: (tab: 'hft' | 'terminal' | 'bot' | 'prompt' | 'bridge') => void;
  onOpenBrokerConfig: () => void;
  onOpenDailyReport?: () => void;
  onOpenPairsModal?: () => void;
  onOpenAndroidApk?: () => void;
  onEmergencyFlatten: () => void;
  hasOpenPositions: boolean;
  isHftRunning?: boolean;
  activeSymbol: string;
  isStealthShieldActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  account,
  status,
  activeTab,
  onTabChange,
  onOpenBrokerConfig,
  onOpenDailyReport,
  onOpenPairsModal,
  onOpenAndroidApk,
  onEmergencyFlatten,
  hasOpenPositions,
  isHftRunning,
  activeSymbol,
}) => {
  const accountSpec = account.accountType ? EXNESS_ACCOUNT_SPECS[account.accountType] : undefined;
  const currentSymbolSpec = getSymbolSpec(activeSymbol);

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Wordmark & Broker / Symbol Info */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <span className="text-base tracking-tighter">{currentSymbolSpec.icon || 'Au'}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                MT5 Algo Scalper
              </h1>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-200 font-medium">{account.broker || 'Corretora MT5'}</span>
              <span>·</span>
              {/* Pair Switcher pill */}
              <button
                type="button"
                onClick={onOpenPairsModal}
                className="text-amber-400 font-semibold hover:text-amber-300 underline underline-offset-2 flex items-center gap-0.5"
                title="Trocar paridade / moeda"
              >
                <span>{activeSymbol}</span>
              </button>
              <span>·</span>
              <span className="tabular-nums">1:{account.leverage}</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => onTabChange('hft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'hft'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isHftRunning ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>Robô HFT 24/5</span>
          </button>

          <button
            onClick={() => onTabChange('terminal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span>Gráfico & Boleta</span>
          </button>

          <button
            onClick={() => onTabChange('bot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'bot'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span>Estratégias Swing</span>
          </button>

          <button
            onClick={() => onTabChange('prompt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'prompt'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Prompt MT5</span>
          </button>

          <button
            onClick={() => onTabChange('bridge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'bridge'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span>Bridge MT5</span>
          </button>
        </nav>

        {/* Zone 3: Connection, Stealth Shield, APK & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Paridades Quick Button */}
          {onOpenPairsModal && (
            <button
              type="button"
              onClick={onOpenPairsModal}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-amber-300 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="Trocar Paridades / Cesta de Ativos"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Pares</span>
              <span className="text-[10px] bg-slate-900 px-1 py-0.5 rounded text-slate-300 font-mono">
                {activeSymbol.slice(0, 6)}
              </span>
            </button>
          )}

          {/* Android APK Button */}
          {onOpenAndroidApk && (
            <button
              type="button"
              onClick={onOpenAndroidApk}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/40 text-sky-300 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="Instalar como Aplicativo Android (APK / WebAPK)"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">APK Android</span>
            </button>
          )}

          {/* Daily Report Button */}
          {onOpenDailyReport && (
            <button
              type="button"
              onClick={onOpenDailyReport}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="Abrir Relatório Diário HFT & Linha do Tempo 24H"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">24H</span>
            </button>
          )}

          {/* Broker Server Config */}
          <button
            onClick={onOpenBrokerConfig}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
            title="Configurar credenciais e servidor da corretora MT5"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Servidor</span>
            <div
              className={`w-2 h-2 rounded-full ${
                status === 'connected'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                  : status === 'connecting'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
          </button>

          {hasOpenPositions && (
            <button
              onClick={onEmergencyFlatten}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Fechar imediatamente todas as posições abertas"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Fechar Tudo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
