import React, { useState, useEffect } from 'react';
import { MobileDeviceChassis } from './MobileDeviceChassis';
import { BottomTabBar, MobileTab } from './BottomTabBar';
import { HomeScreen } from './HomeScreen';
import { SignalListScreen } from './SignalListScreen';
import { SettingsScreen } from './SettingsScreen';
import { ProcessingSignalScreen } from './ProcessingSignalScreen';
import { ProfileScreen } from './ProfileScreen';
import { ForexSignal, SignalTimeframe } from '../../types/signals';
import { generateInitialSignals, createNewSignal } from '../../services/signalEngine';
import { audioAlerts } from '../../utils/audioAlerts';

export type AppDisplayMode = 'single_mobile' | 'quad_screens' | 'fullscreen_mobile';

export const MobileApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [displayMode, setDisplayMode] = useState<AppDisplayMode>('single_mobile');
  const [selectedTimeframe, setSelectedTimeframe] = useState<SignalTimeframe>('M5');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSD');
  const [signals, setSignals] = useState<ForexSignal[]>(() => generateInitialSignals());
  const [isProcessingModal, setIsProcessingModal] = useState<boolean>(false);
  const [selectedSignalForDetail, setSelectedSignalForDetail] = useState<ForexSignal | null>(null);
  const [symbolFilter, setSymbolFilter] = useState<string | undefined>(undefined);

  // Live real-time BTC and Gold price simulation
  const [btcPrice, setBtcPrice] = useState(64850.0);
  const [xauPrice, setXauPrice] = useState(2345.5);

  useEffect(() => {
    const interval = setInterval(() => {
      // Gentle micro-tick on BTC and XAU
      setBtcPrice((prev) => {
        const delta = (Math.random() - 0.48) * 15;
        return Number((prev + delta).toFixed(2));
      });
      setXauPrice((prev) => {
        const delta = (Math.random() - 0.48) * 0.4;
        return Number((prev + delta).toFixed(2));
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const handleGenerateClick = () => {
    try {
      audioAlerts.playTestBeep();
    } catch {}
    setIsProcessingModal(true);
  };

  const handleViewCompleteSignal = (sig: ForexSignal) => {
    // Add to signals list if not already present
    setSignals((prev) => {
      if (prev.some((s) => s.id === sig.id)) return prev;
      return [sig, ...prev];
    });
    setIsProcessingModal(false);
    setActiveTab('sinal');
    setSymbolFilter(sig.symbol);
  };

  const handleOpenSignalListWithFilter = (sym?: string) => {
    setSymbolFilter(sym);
    setActiveTab('sinal');
  };

  // Render the current active view for single phone
  const renderActiveScreen = () => {
    if (isProcessingModal) {
      return (
        <ProcessingSignalScreen
          onBack={() => setIsProcessingModal(false)}
          onViewCompleteSignal={handleViewCompleteSignal}
          initialSignal={selectedSignalForDetail}
          selectedTimeframe={selectedTimeframe}
          selectedSymbol={selectedSymbol}
          onSelectTimeframe={setSelectedTimeframe}
          onSelectSymbol={setSelectedSymbol}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onGenerateClick={handleGenerateClick}
            onOpenSignalList={handleOpenSignalListWithFilter}
            onOpenProfile={() => setActiveTab('perfil')}
            selectedTimeframe={selectedTimeframe}
            onSelectTimeframe={setSelectedTimeframe}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
            recentSignals={signals}
          />
        );
      case 'sinal':
        return (
          <SignalListScreen
            signals={signals}
            onBack={() => setActiveTab('home')}
            onSelectSignal={(sig) => {
              setSelectedSignalForDetail(sig);
              setIsProcessingModal(true);
            }}
            initialSymbolFilter={symbolFilter}
          />
        );
      case 'config':
        return (
          <SettingsScreen
            onBack={() => setActiveTab('home')}
            onOpenProfile={() => setActiveTab('perfil')}
          />
        );
      case 'perfil':
        return (
          <ProfileScreen
            onBack={() => setActiveTab('home')}
            onOpenSignalList={() => setActiveTab('sinal')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#02060d] text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-amber-500/20 selection:text-amber-300">
      {/* Top Floating Control Bar (Desktop / Preview toolbar) */}
      <header className="w-full bg-[#050d18]/90 border-b border-slate-800/80 backdrop-blur-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-50 select-none">
        {/* Brand & Live BTC/USD Ticker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              IA
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white hidden sm:inline">
              TRADER IA MOBILE
            </span>
          </div>

          {/* Real-time Ticker: BTC/USD */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 text-xs">
            <span className="font-bold text-amber-400">BTC/USD</span>
            <span className="font-mono font-bold text-white tabular-nums">
              ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Real-time Ticker: XAU/USD */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-cyan-500/40 text-xs">
            <span className="font-bold text-cyan-300">XAU/USD</span>
            <span className="font-mono font-bold text-white tabular-nums">
              ${xauPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Display Mode Switcher (100% faithful to the requested image) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDisplayMode('single_mobile')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              displayMode === 'single_mobile'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📱 Modo Mobile
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode('quad_screens')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              displayMode === 'quad_screens'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🖼️ 4 Telas (Como na Imagem)
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode('fullscreen_mobile')}
            className={`hidden sm:inline-block px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              displayMode === 'fullscreen_mobile'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⛶ Tela Cheia
          </button>
        </div>

        {/* Global Timeframe Quick Switcher */}
        <div className="flex items-center gap-1 text-[11px] font-bold">
          <span className="text-slate-400 text-[10px] hidden lg:inline mr-1 uppercase">Sinais:</span>
          {(['M1', 'M5', 'M15', 'M30', 'H1', 'H4'] as SignalTimeframe[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => {
                try {
                  audioAlerts.playTestBeep();
                } catch {}
                setSelectedTimeframe(tf);
              }}
              className={`px-2 py-0.5 rounded transition-all ${
                selectedTimeframe === tf
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </header>

      {/* Main View Area */}
      <main className="w-full flex-1 flex items-center justify-center p-2 sm:p-4 overflow-x-auto">
        {/* MODE 1: SINGLE INTERACTIVE MOBILE PHONE */}
        {displayMode === 'single_mobile' && (
          <div className="w-full max-w-sm my-auto">
            <MobileDeviceChassis>
              {renderActiveScreen()}
              {!isProcessingModal && (
                <BottomTabBar activeTab={activeTab} onChangeTab={setActiveTab} />
              )}
            </MobileDeviceChassis>
          </div>
        )}

        {/* MODE 2: QUAD SCREENS (EXACTLY LIKE THE REFERENCE IMAGE) */}
        {displayMode === 'quad_screens' && (
          <div className="w-full overflow-x-auto py-4">
            <div className="flex items-center justify-center gap-6 min-w-[1400px] px-6">
              {/* Phone 1: Home */}
              <div className="w-[340px] shrink-0">
                <MobileDeviceChassis>
                  <HomeScreen
                    onGenerateClick={() => {
                      setDisplayMode('single_mobile');
                      setIsProcessingModal(true);
                    }}
                    onOpenSignalList={(sym) => {
                      setDisplayMode('single_mobile');
                      handleOpenSignalListWithFilter(sym);
                    }}
                    onOpenProfile={() => {
                      setDisplayMode('single_mobile');
                      setActiveTab('perfil');
                    }}
                    selectedTimeframe={selectedTimeframe}
                    onSelectTimeframe={setSelectedTimeframe}
                    selectedSymbol={selectedSymbol}
                    onSelectSymbol={setSelectedSymbol}
                    recentSignals={signals}
                  />
                  <BottomTabBar activeTab="home" onChangeTab={setActiveTab} />
                </MobileDeviceChassis>
                <p className="text-center text-xs font-bold text-amber-400 mt-2 uppercase tracking-wider">
                  1. Home
                </p>
              </div>

              {/* Phone 2: Sinais Gerados */}
              <div className="w-[340px] shrink-0">
                <MobileDeviceChassis>
                  <SignalListScreen
                    signals={signals}
                    onBack={() => {
                      setDisplayMode('single_mobile');
                      setActiveTab('home');
                    }}
                    onSelectSignal={(sig) => {
                      setDisplayMode('single_mobile');
                      setSelectedSignalForDetail(sig);
                      setIsProcessingModal(true);
                    }}
                    initialSymbolFilter={symbolFilter}
                  />
                  <BottomTabBar activeTab="sinal" onChangeTab={setActiveTab} />
                </MobileDeviceChassis>
                <p className="text-center text-xs font-bold text-cyan-400 mt-2 uppercase tracking-wider">
                  2. Sinais Gerados
                </p>
              </div>

              {/* Phone 3: Configurações */}
              <div className="w-[340px] shrink-0">
                <MobileDeviceChassis>
                  <SettingsScreen
                    onBack={() => {
                      setDisplayMode('single_mobile');
                      setActiveTab('home');
                    }}
                    onOpenProfile={() => {
                      setDisplayMode('single_mobile');
                      setActiveTab('perfil');
                    }}
                  />
                  <BottomTabBar activeTab="config" onChangeTab={setActiveTab} />
                </MobileDeviceChassis>
                <p className="text-center text-xs font-bold text-slate-300 mt-2 uppercase tracking-wider">
                  3. Configurações
                </p>
              </div>

              {/* Phone 4: Processando Sinal IA */}
              <div className="w-[340px] shrink-0">
                <MobileDeviceChassis>
                  <ProcessingSignalScreen
                    onBack={() => {
                      setDisplayMode('single_mobile');
                      setActiveTab('home');
                    }}
                    onViewCompleteSignal={(sig) => {
                      setDisplayMode('single_mobile');
                      handleViewCompleteSignal(sig);
                    }}
                    selectedTimeframe={selectedTimeframe}
                    selectedSymbol={selectedSymbol}
                    onSelectTimeframe={setSelectedTimeframe}
                    onSelectSymbol={setSelectedSymbol}
                  />
                </MobileDeviceChassis>
                <p className="text-center text-xs font-bold text-amber-400 mt-2 uppercase tracking-wider">
                  4. Processando Sinal IA
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: FULLSCREEN MOBILE (NO CHASSIS BEZEL) */}
        {displayMode === 'fullscreen_mobile' && (
          <div className="w-full max-w-md h-[844px] max-h-[95vh] bg-[#040b15] rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
            <div className="relative flex-1 flex flex-col overflow-hidden pt-2">
              {renderActiveScreen()}
              {!isProcessingModal && (
                <BottomTabBar activeTab={activeTab} onChangeTab={setActiveTab} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
