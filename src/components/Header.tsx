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
  Radio,
  Globe,
  Bell,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AccountInfo, ConnectionStatus } from '../types/mt5';
import { EXNESS_ACCOUNT_SPECS } from '../utils/goldMath';
import { getSymbolSpec } from '../types/symbols';

export type AppTab = 'signals' | 'alerts' | 'macro';

export interface HeaderProps {
  account: AccountInfo;
  status: ConnectionStatus;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenBrokerConfig: () => void;
  onOpenDailyReport?: () => void;
  onOpenPairsModal?: () => void;
  onOpenAndroidApk?: () => void;
  onEmergencyFlatten: () => void;
  hasOpenPositions: boolean;
  isHftRunning?: boolean;
  activeSymbol: string;
  isStealthShieldActive?: boolean;
  isAudioEnabled?: boolean;
  onToggleAudio?: () => void;
  unreadAlertsCount?: number;
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
  isAudioEnabled = true,
  onToggleAudio,
  unreadAlertsCount = 0,
}) => {
  const currentSymbolSpec = getSymbolSpec(activeSymbol);

  return (
    <header className="border-b border-slate-800 bg-black/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Wordmark & Live Forex Hub */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <span className="text-base tracking-tighter">{currentSymbolSpec.icon || '🪙'}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Forex Signal Sentinel
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline font-bold">
                Stop & Take Ao Vivo
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-200 font-medium">{account.broker || 'Corretora MT5'}</span>
              <span>·</span>
              <button
                type="button"
                onClick={onOpenPairsModal}
                className="text-amber-400 font-semibold hover:text-amber-300 underline underline-offset-2 flex items-center gap-0.5 cursor-pointer"
                title="Trocar paridade / moeda"
              >
                <span>{activeSymbol}</span>
              </button>
              <span>·</span>
              <span className="tabular-nums">1:{account.leverage}</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Primary Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('signals')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'signals'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Painel de Sinais</span>
          </button>

          <button
            onClick={() => onTabChange('alerts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer relative ${
              activeTab === 'alerts'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
            <span>Painel de Alertas</span>
            {unreadAlertsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse absolute -top-0.5 -right-0.5" />
            )}
          </button>

          <button
            onClick={() => onTabChange('macro')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'macro'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Sentinela Macro</span>
          </button>
        </nav>

        {/* Zone 3: Quick Audio toggle, Broker Server & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          {onToggleAudio && (
            <button
              type="button"
              onClick={onToggleAudio}
              className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                isAudioEnabled
                  ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
              title={isAudioEnabled ? 'Silenciar bips de alerta' : 'Ativar bips sonoros de alerta'}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* Paridades Quick Button */}
          {onOpenPairsModal && (
            <button
              type="button"
              onClick={onOpenPairsModal}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="Trocar Paridades / Moedas"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Pares</span>
              <span className="text-[10px] bg-black px-1 py-0.5 rounded text-slate-300 font-mono">
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
              title="Instalar no Celular (Android APK / PWA)"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">App</span>
            </button>
          )}

          {/* Broker Server Config */}
          <button
            onClick={onOpenBrokerConfig}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer"
            title="Configurar servidor MT5 e MetaAPI Cloud"
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
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="Fechar imediatamente todas as posições abertas"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Fechar Tudo</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden items-center justify-around px-3 py-2 bg-black border-t border-slate-800 gap-2">
        <button
          onClick={() => onTabChange('signals')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center ${
            activeTab === 'signals' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400'
          }`}
        >
          Sinais
        </button>
        <button
          onClick={() => onTabChange('alerts')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center ${
            activeTab === 'alerts' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Alertas
        </button>
        <button
          onClick={() => onTabChange('macro')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center ${
            activeTab === 'macro' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Macro
        </button>
      </div>
    </header>
  );
};
