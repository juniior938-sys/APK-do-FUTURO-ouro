import React, { useState } from 'react';
import { ForexSignal, SignalAction, MarketAlert, AlertFilterType, EconomicEvent } from '../types/signals';
import { SignalCard } from './SignalCard';
import { AlertManagementPanel } from './AlertManagementPanel';
import { MT5VerticalScaleBox } from './MT5VerticalScaleBox';
import { EconomicNewsFeed } from './EconomicNewsFeed';
import { AIAnalysisModal } from './AIAnalysisModal';
import { audioAlerts } from '../utils/audioAlerts';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Radio,
  ChevronDown,
  ChevronUp,
  BellRing,
  Layers,
  Sparkles,
  Flame,
  Bot,
} from 'lucide-react';

interface SignalsDashboardProps {
  signals: ForexSignal[];
  alerts?: MarketAlert[];
  onExecuteSignal: (signal: ForexSignal) => void;
  onSelectSymbol: (symbol: string) => void;
  onGenerateNewSignal: (symbol?: string, action?: SignalAction) => void;
  isGoldenOverlap?: boolean;
  totalPips?: number;
  winRatePct?: number;
  onClearAlerts?: () => void;
  onDismissAlert?: (id: string) => void;
  onCopyAlert?: (alert: MarketAlert) => void;
}

export const SignalsDashboard: React.FC<SignalsDashboardProps> = ({
  signals,
  alerts = [],
  onExecuteSignal,
  onSelectSymbol,
  onGenerateNewSignal,
  onClearAlerts,
  onDismissAlert,
  onCopyAlert,
}) => {
  const [localSignals, setLocalSignals] = useState<ForexSignal[]>(signals);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedAlertFilter, setSelectedAlertFilter] = useState<AlertFilterType>('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [isAlertManagerOpen, setIsAlertManagerOpen] = useState(false);
  const [showMT5ScaleBox, setShowMT5ScaleBox] = useState(true);
  const [showEconomicNews, setShowEconomicNews] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Keep localSignals in sync if parent signals array updates length
  React.useEffect(() => {
    setLocalSignals(signals);
  }, [signals.length]);

  // Selected signal for MT5 Vertical Scale box
  const targetGoMoneySignal = localSignals.find((s) => s.id === 'sig-xauusd-targetgomoney') || localSignals[0];
  const [activeSignalId, setActiveSignalId] = useState<string>(targetGoMoneySignal?.id || '');

  const activeFocusSignal = localSignals.find((s) => s.id === activeSignalId) || targetGoMoneySignal || localSignals[0];

  const handleUpdateSignalValues = (updated: Partial<ForexSignal>) => {
    setLocalSignals((prev) =>
      prev.map((sig) => (sig.id === activeFocusSignal.id ? { ...sig, ...updated } : sig))
    );
  };

  const handleAddAISignal = (newSignal: ForexSignal) => {
    setLocalSignals((prev) => [newSignal, ...prev]);
    setActiveSignalId(newSignal.id);
    setSelectedSymbol('ALL');
    if (newSignal.action.includes('BUY')) {
      audioAlerts.playEntryBuy();
    } else {
      audioAlerts.playEntrySell();
    }
  };

  // Filter signals cleanly
  const filteredSignals = localSignals.filter((sig) => {
    if (selectedSymbol !== 'ALL' && sig.symbol !== selectedSymbol) return false;
    if (selectedAction === 'BUY' && !sig.action.includes('BUY')) return false;
    if (selectedAction === 'SELL' && !sig.action.includes('SELL')) return false;
    return true;
  });

  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const pairs = ['XAUUSD.pc', 'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'AUDUSD'];
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
      const randomAction: SignalAction = Math.random() > 0.5 ? 'BUY' : 'SELL';
      onGenerateNewSignal(randomPair, randomAction);
      setIsScanning(false);
    }, 500);
  };

  const activeCount = localSignals.filter(
    (s) => s.status !== 'TP3_HIT' && s.status !== 'SL_HIT'
  ).length;

  return (
    <div className="space-y-4">
      {/* TOP HERO: SINAIS DE TRADING COM STOP LOSS E TAKE PROFIT */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 shadow-md">
        {/* Title & Quick Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Sinais de Trading com Stop Loss e Take Profit</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {activeCount} Ao Vivo
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Calibrado com os números da escala vertical do MT5: Entrada Ciano, Stop Vermelho e Take 1, 2 e 3
              </p>
            </div>
          </div>

          {/* Action Right: AI Analysis Button, Economic News Toggle, Scale View & Scan */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* AI MARKET ANALYSIS BUTTON */}
            <button
              type="button"
              onClick={() => setIsAIModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-black text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              title="Análise com Inteligência Artificial em tempo real do mercado Forex e gerador de sinais"
            >
              <Sparkles className="w-4 h-4 text-black animate-spin" style={{ animationDuration: '3s' }} />
              <span>IA Análise & Sinais</span>
            </button>

            {/* Economic News Feed Toggle */}
            <button
              type="button"
              onClick={() => setShowEconomicNews(!showEconomicNews)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                showEconomicNews
                  ? 'bg-rose-950/50 text-rose-300 border-rose-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
              title="Exibir ou ocultar feed de notícias econômicas (ForexFactory e Investing.com)"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Notícias & Volatilidade</span>
              {showEconomicNews ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              type="button"
              onClick={() => setShowMT5ScaleBox(!showMT5ScaleBox)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                showMT5ScaleBox
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showMT5ScaleBox ? 'Ocultar Escala MT5' : 'Ver Escala MT5'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAlertManagerOpen(!isAlertManagerOpen)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                isAlertManagerOpen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              <span>Alertas</span>
              {isAlertManagerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleManualScan}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700 shadow-sm"
              title="Escanear novas confluências no mercado"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{isScanning ? 'Analisando...' : 'Escanear'}</span>
            </button>
          </div>
        </div>

        {/* Clean Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
          {/* Paridades Pills */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-500" />
              <span>Par:</span>
            </span>
            {['ALL', 'XAUUSD.pc', 'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'AUDUSD'].map((sym) => {
              const isSelected = selectedSymbol === sym;
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => {
                    setSelectedSymbol(sym);
                    const match = localSignals.find((s) => s.symbol === sym);
                    if (match) setActiveSignalId(match.id);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  {sym === 'ALL' ? 'Todos' : sym}
                </button>
              );
            })}
          </div>

          {/* Tipo de Sinal (Compra / Venda / Todos) */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSelectedAction('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedAction === 'ALL'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setSelectedAction('BUY')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                selectedAction === 'BUY'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Compras</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedAction('SELL')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                selectedAction === 'SELL'
                  ? 'bg-rose-500/20 text-rose-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-3 h-3 text-rose-400" />
              <span>Vendas</span>
            </button>
          </div>
        </div>
      </div>

      {/* COMPONENTE FEED DE NOTÍCIAS ECONÔMICAS & HORÁRIOS DE ALTA VOLATILIDADE */}
      {showEconomicNews && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <EconomicNewsFeed
            onFilterPairsByNews={(currency) => {
              // Highlight matching currency pair
              if (currency === 'USD') setSelectedSymbol('XAUUSD.pc');
              else if (currency === 'EUR') setSelectedSymbol('EURUSD');
              else if (currency === 'GBP') setSelectedSymbol('GBPUSD');
              else if (currency === 'JPY') setSelectedSymbol('USDJPY');
            }}
          />
        </div>
      )}

      {/* PAINEL DESTACADO DA ESCALA VERTICAL MT5 (TARGET GO MONEY) */}
      {showMT5ScaleBox && activeFocusSignal && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <MT5VerticalScaleBox
            signal={activeFocusSignal}
            onExecute={onExecuteSignal}
            onUpdateSignalValues={handleUpdateSignalValues}
          />
        </div>
      )}

      {/* SINAIS BENTO GRID */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
          <span>Outros Pares & Sinais Monitorados:</span>
          <span className="font-mono text-[11px] text-slate-500">{filteredSignals.length} pares listados</span>
        </div>

        {filteredSignals.length === 0 ? (
          <div className="p-10 text-center rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
            <Radio className="w-7 h-7 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">Nenhum sinal com os filtros atuais</h3>
            <p className="text-xs text-slate-500">Clique em Escanear ou use a IA para gerar novas análises.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredSignals.map((signal) => (
              <div
                key={signal.id}
                onClick={() => setActiveSignalId(signal.id)}
                className={`cursor-pointer transition-all ${
                  signal.id === activeFocusSignal.id ? 'ring-1 ring-cyan-400/60 rounded-xl' : ''
                }`}
              >
                <SignalCard
                  signal={signal}
                  onExecute={onExecuteSignal}
                  onSelectSymbol={onSelectSymbol}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPONENTE DE GERENCIAMENTO DE ALERTAS (DESPOLUÍDO & RECOLHÍVEL) */}
      {isAlertManagerOpen && (
        <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertManagementPanel
            alerts={alerts}
            selectedTypeFilter={selectedAlertFilter}
            onSelectTypeFilter={setSelectedAlertFilter}
            onClearAlerts={onClearAlerts}
            onDismissAlert={onDismissAlert}
            onCopyAlert={onCopyAlert}
          />
        </div>
      )}

      {/* MODAL DE ANÁLISE COM IA EM TEMPO REAL & GERADOR DE SINAIS */}
      <AIAnalysisModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onAddSignalToApp={handleAddAISignal}
        activeSymbol={activeFocusSignal?.symbol || 'XAUUSD.pc'}
      />
    </div>
  );
};
