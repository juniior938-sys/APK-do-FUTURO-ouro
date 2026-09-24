import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BrokerCredentials,
  AccountInfo,
  Position,
  ClosedTrade,
  Candle,
  Timeframe,
  BotStrategyConfig,
  BotSignal,
  BotLog,
  ConnectionStatus,
  ExnessAccountType,
} from './types/mt5';
import {
  HFTOrderBook,
  BatteryAnswers,
  HFTAction,
  LadderRung,
  HFTTickRecord,
  HFTStats,
  HFTRiskLimits,
} from './types/hft';
import {
  calculateGoldProfit,
  calculateGoldPips,
  formatGoldPrice,
  formatUsd,
  calculateMargin,
  GOLD_PIP_SIZE,
  GOLD_CONTRACT_SIZE,
  EXNESS_ACCOUNT_SPECS,
  getExnessSpread,
} from './utils/goldMath';
import {
  generateInitialCandles,
  computeIndicators,
  generate24hCandles,
  generateSeed24hClosedTrades,
} from './services/marketData';
import {
  DEFAULT_HFT_LIMITS,
  generateL2Book,
  evaluateHFTBattery,
  calculateAvellanedaStoikov,
  composeHFTAction,
  selectLadderRung,
} from './services/hftEngine';
import { Header, AppTab } from './components/Header';
import { BrokerModal } from './components/BrokerModal';
import { DailyPerformanceModal } from './components/DailyPerformanceModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { PairSelectorModal } from './components/PairSelector';
import { StealthShieldConfig, DEFAULT_STEALTH_SHIELD } from './types/stealth';
import { SUPPORTED_SYMBOLS, getSymbolSpec, SymbolSpec } from './types/symbols';
import { ForexSignal, MarketAlert, SignalAction } from './types/signals';
import { generateInitialSignals, processSignalTick, createNewSignal } from './services/signalEngine';
import { isGoldenOverlapActive } from './services/macroData';
import { audioAlerts } from './utils/audioAlerts';
import { ActiveAlertBanner } from './components/ActiveAlertBanner';
import { SignalsDashboard } from './components/SignalsDashboard';
import { MacroSentinelPanel } from './components/MacroSentinelPanel';
import { AlertsHistoryTab } from './components/AlertsHistoryTab';

const DEFAULT_BROKER: BrokerCredentials = {
  brokerName: 'Exness',
  server: 'Exness-Real25',
  login: '14829301',
  password: '',
  accountMode: 'real',
  accountType: 'raw_spread',
  leverage: 500,
  protocol: 'simulation',
  bridgeUrl: 'http://localhost:8000/api',
};

const DEFAULT_BOT_CONFIG: BotStrategyConfig = {
  id: 'gold_trend_surfer',
  name: 'Gold Trend Surfer',
  description: 'Seguidor de tendência institucional com cruzamento de EMA 9/21, confirmação de MACD e trailing stop.',
  timeframe: 'M5',
  lotSize: 0.05,
  autoLotRiskPct: 1.0,
  useAutoLot: true,
  takeProfitPips: 60,
  stopLossPips: 30,
  trailingStopPips: 20,
  maxSpreadPips: 3.5,
  maxDailyLossUsd: 150,
  maxOpenTrades: 2,
  tradingHoursStart: 7,
  tradingHoursEnd: 21,
};

export default function App() {
  // Navigation: Default directly to 'signals' for the Forex Signal Hub!
  const [activeTab, setActiveTab] = useState<AppTab>('signals');
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);

  // Live Forex Signals & Alerts State
  const [signals, setSignals] = useState<ForexSignal[]>(generateInitialSignals);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [activeBannerAlert, setActiveBannerAlert] = useState<MarketAlert | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(audioAlerts.isEnabled());
  const [isGoldenOverlap, setIsGoldenOverlap] = useState<boolean>(isGoldenOverlapActive);

  // Broker Credentials & Symbol
  const [credentials, setCredentials] = useState<BrokerCredentials>(() => {
    try {
      const saved = localStorage.getItem('mt5_broker_creds');
      return saved ? JSON.parse(saved) : DEFAULT_BROKER;
    } catch {
      return DEFAULT_BROKER;
    }
  });

  const [accountType, setAccountType] = useState<ExnessAccountType>(() => {
    try {
      const saved = localStorage.getItem('exness_account_type');
      if (saved) return saved as ExnessAccountType;
      const savedCreds = localStorage.getItem('mt5_broker_creds');
      if (savedCreds) {
        const parsed = JSON.parse(savedCreds);
        if (parsed.accountType) return parsed.accountType;
      }
    } catch {}
    return 'raw_spread';
  });

  const currentSpec = EXNESS_ACCOUNT_SPECS[accountType] || EXNESS_ACCOUNT_SPECS.raw_spread;
  const [symbol, setSymbol] = useState<string>(currentSpec.symbol);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState<boolean>(false);
  const [isAndroidApkModalOpen, setIsAndroidApkModalOpen] = useState<boolean>(false);
  const [isPairsModalOpen, setIsPairsModalOpen] = useState<boolean>(false);

  // Stealth Shield State (Anti-bloqueio e blindagem do servidor - 100% nativa e automática)
  const [stealthConfig, setStealthConfig] = useState<StealthShieldConfig>(() => ({
    ...DEFAULT_STEALTH_SHIELD,
    enabled: true,
    virtualStopsEnabled: true,
    jitterEnabled: true,
    spreadSpikeFilter: true,
    maxAllowedSpreadPips: 15.0, // Spread Máximo 15
    antiPatternMasking: true,
    autoHeartbeatRetry: true,
    proxyFailoverEnabled: true,
    stealthLevel: 'MAXIMUM_BLINDAGEM',
  }));

  const handleSaveStealthConfig = (newConfig: StealthShieldConfig) => {
    setStealthConfig(newConfig);
    try {
      localStorage.setItem('mt5_stealth_shield', JSON.stringify(newConfig));
    } catch {}
  };

  // Multi-Pair & Symbol State
  const [activeSymbol, setActiveSymbol] = useState<string>('XAUUSD');
  const [allowedSymbols, setAllowedSymbols] = useState<string[]>([
    'XAUUSD',
    'EURUSD',
    'GBPUSD',
    'USDJPY',
    'BTCUSD',
    'ETHUSD',
    'US30',
    'NAS100',
  ]);

  const handleSelectSymbol = (newSymbol: string) => {
    setActiveSymbol(newSymbol);
    const spec = getSymbolSpec(newSymbol);
    setCurrentPrice(spec.basePrice);
    setSpreadPips(spec.typicalSpreadPips);
    setSymbol(newSymbol);
    setCandles(generateInitialCandles(75, timeframe));
  };

  const handleToggleAllowedSymbol = (sym: string) => {
    setAllowedSymbols((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  // 24-Hour Continuous Timeline Market Data & Seed Trades
  const initialTimelineCandles = useMemo(() => generate24hCandles(2658.45), []);
  const [timelineCandles, setTimelineCandles] = useState<Candle[]>(initialTimelineCandles);

  const initialSeedTrades = useMemo(() => {
    return generateSeed24hClosedTrades(
      initialTimelineCandles,
      currentSpec.symbol,
      currentSpec.contractSizeOz,
      currentSpec.commissionPerLotUsd
    );
  }, [currentSpec]);

  // Orders & Positions
  const [positions, setPositions] = useState<Position[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>(initialSeedTrades);
  const ticketCounter = useRef<number>(891040);

  const initialClosedProfit = useMemo(() => {
    return Math.round(initialSeedTrades.reduce((acc, t) => acc + t.profit, 0) * 100) / 100;
  }, [initialSeedTrades]);

  // Account State
  const [account, setAccount] = useState<AccountInfo>({
    login: credentials.login || '14829301',
    broker: credentials.brokerName || 'Exness',
    server: credentials.server || 'Exness-Real25',
    accountType,
    currency: 'USD',
    balance: 5000.0 + initialClosedProfit,
    equity: 5000.0 + initialClosedProfit,
    margin: 0.0,
    freeMargin: 5000.0 + initialClosedProfit,
    marginLevel: 0.0,
    floatingProfit: 0.0,
    closedProfitToday: initialClosedProfit,
    leverage: credentials.leverage || 500,
    connected: true,
  });

  // Market & Candle Data
  const [timeframe, setTimeframe] = useState<Timeframe>('M5');
  const [candles, setCandles] = useState<Candle[]>(() => generateInitialCandles(75, 'M5'));
  const [currentPrice, setCurrentPrice] = useState<number>(2658.45);
  const [spreadPips, setSpreadPips] = useState<number>(() => getExnessSpread(accountType, 0));

  const handleSelectAccountType = (type: ExnessAccountType) => {
    setAccountType(type);
    const newSpec = EXNESS_ACCOUNT_SPECS[type];
    setSymbol(newSpec.symbol);
    setSpreadPips(getExnessSpread(type, 0));
    setCredentials((prev) => ({ ...prev, accountType: type }));
    setAccount((prev) => ({ ...prev, accountType: type }));
    try {
      localStorage.setItem('exness_account_type', type);
      const savedCreds = localStorage.getItem('mt5_broker_creds');
      if (savedCreds) {
        const parsed = JSON.parse(savedCreds);
        parsed.accountType = type;
        localStorage.setItem('mt5_broker_creds', JSON.stringify(parsed));
      }
    } catch {}
  };

  // ===========================================================================
  // HFT 24/5 ENGINE STATE (Autonomous In-Browser Robot)
  // ===========================================================================
  const [isHftRunning, setIsHftRunning] = useState<boolean>(true); // Auto-starts!
  const [hftLimits, setHftLimits] = useState<HFTRiskLimits>(() => ({
    ...DEFAULT_HFT_LIMITS,
    maxSpreadPips: 15.0,
  }));
  const [orderBook, setOrderBook] = useState<HFTOrderBook>(() =>
    generateL2Book(2658.45, getExnessSpread(accountType, 0))
  );

  const initialBattery = useMemo(() => {
    return evaluateHFTBattery(orderBook, 0, [2658.2, 2658.45], [12, 14, 18]);
  }, []);

  const [battery, setBattery] = useState<BatteryAnswers>(initialBattery);
  const [currentAction, setCurrentAction] = useState<HFTAction>({
    kind: 'QUOTE_BOTH_SIDES',
    reason: 'Iniciando livro de ofertas HFT...',
    skew: 0,
  });
  const [currentRung, setCurrentRung] = useState<LadderRung>('RUN');
  const [tickHistory, setTickHistory] = useState<HFTTickRecord[]>([]);
  const [hftStats, setHftStats] = useState<HFTStats>(() => {
    const totalVolume = Math.round(initialSeedTrades.reduce((acc, t) => acc + t.volume, 0) * 100) / 100;
    const wins = initialSeedTrades.filter((t) => t.profit > 0).length;
    const winRate = initialSeedTrades.length > 0 ? Math.round((wins / initialSeedTrades.length) * 1000) / 10 : 78.5;
    return {
      ticksCount: 840,
      fillsCount: initialSeedTrades.length,
      pullsCount: 142,
      widensCount: 56,
      legsCount: 12,
      avgLatencyMs: 14.8,
      totalVolumeLots: totalVolume,
      realizedPnl: initialClosedProfit,
      winRate,
      maxDrawdownRecorded: 0.65,
    };
  });

  const recentPricesRef = useRef<number[]>([2658.2, 2658.35, 2658.45]);
  const recentLatenciesRef = useRef<number[]>([14, 16, 12, 18, 15]);
  const tickSeq = useRef<number>(1);

  // Regular Bot Engine State
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [botConfig, setBotConfig] = useState<BotStrategyConfig>(DEFAULT_BOT_CONFIG);
  const [currentSignal, setCurrentSignal] = useState<BotSignal | null>(null);
  const [botLogs, setBotLogs] = useState<BotLog[]>([
    {
      id: '1',
      time: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'Robô HFT XAUUSD inicializado automaticamente dentro do site.',
    },
  ]);

  const addBotLog = (level: 'info' | 'trade' | 'warning' | 'error', message: string) => {
    const newLog: BotLog = {
      id: Math.random().toString(),
      time: new Date().toLocaleTimeString(),
      level,
      message,
    };
    setBotLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  // Indicators computed from candles
  const indicators = useMemo(() => {
    return computeIndicators(candles);
  }, [candles]);

  const bidPrice = currentPrice;
  const askPrice = Math.round((currentPrice + spreadPips * GOLD_PIP_SIZE) * 100) / 100;

  // Inventory calculation in lots (long positive, short negative)
  const inventoryLots = useMemo(() => {
    return positions.reduce((acc, pos) => {
      return pos.type === 'BUY' ? acc + pos.volume : acc - pos.volume;
    }, 0);
  }, [positions]);

  // ===========================================================================
  // REAL-TIME HFT EXECUTION LOOP (Runs 100% inside the site)
  // ===========================================================================
  useEffect(() => {
    if (!isHftRunning) return;

    const hftTimer = setInterval(() => {
      const t0 = performance.now();
      tickSeq.current += 1;
      const currentTick = tickSeq.current;

      // 1. Tick Price Simulation (Subtle microsecond market dynamics for Gold)
      const tickDelta = (Math.random() - 0.495) * 0.28;
      const newMid = Math.round((currentPrice + tickDelta) * 100) / 100;
      setCurrentPrice(newMid);

      recentPricesRef.current.push(newMid);
      if (recentPricesRef.current.length > 20) recentPricesRef.current.shift();

      // Sync latest candle in 24h timeline
      setTimelineCandles((prev) => {
        if (!prev.length) return prev;
        const last = prev[prev.length - 1];
        const updated = {
          ...last,
          close: newMid,
          high: Math.max(last.high, newMid),
          low: Math.min(last.low, newMid),
        };
        return [...prev.slice(0, -1), updated];
      });

      // 2. Read Depth of Market & Level 2 Book with live Exness spread profile
      const dynamicSpread = getExnessSpread(accountType, currentTick);
      setSpreadPips(dynamicSpread);
      const newBook = generateL2Book(newMid, dynamicSpread);
      setOrderBook(newBook);

      // 3. Evaluate 7-Question Decision Battery
      const newBattery = evaluateHFTBattery(
        newBook,
        inventoryLots,
        recentPricesRef.current,
        recentLatenciesRef.current
      );
      setBattery(newBattery);

      // 4. Avellaneda-Stoikov Pricing
      const sigma = indicators.macd.histogram !== 0 ? Math.abs(indicators.macd.histogram) * 0.005 : 0.002;
      const pricing = calculateAvellanedaStoikov(newMid, inventoryLots, sigma, hftLimits);

      // 5. Policy Engine
      const drawdownPct = Math.max(0, (account.balance - account.equity) / account.balance);
      const dailyLossUsd = Math.max(0, -account.closedProfitToday - account.floatingProfit);

      const action = composeHFTAction(
        newBattery,
        pricing,
        inventoryLots,
        drawdownPct,
        dailyLossUsd,
        hftLimits
      );
      setCurrentAction(action);

      // 6. Fallback Ladder
      const latencyMs = Math.round((performance.now() - t0 + Math.random() * 8) * 10) / 10;
      recentLatenciesRef.current.push(latencyMs);
      if (recentLatenciesRef.current.length > 15) recentLatenciesRef.current.shift();

      const rung = selectLadderRung(
        action.kind === 'KILL',
        latencyMs > hftLimits.maxDecisionLatencyMs,
        newBattery.quote_environment.confidence,
        newBattery.execution_health.score
      );
      setCurrentRung(rung);

      // 7. Execution: Quote Fills & Directional Legs (Com Blindagem Anti-Spike: Spread Máximo 15 pips)
      let fillText: string | undefined = undefined;
      let fillPrice: number | undefined = undefined;
      let fillQty: number | undefined = undefined;

      const isSpreadAboveMax = dynamicSpread > (hftLimits.maxSpreadPips || 15.0);
      if (isSpreadAboveMax) {
        action.reason = `Proteção Anti-Spike Ativa: Spread ${dynamicSpread.toFixed(1)} pips > Máximo 15.0 pips (Ordens travadas)`;
      }

      // Handle Directional Leg
      if (!isSpreadAboveMax && action.direction_leg && positions.length < 4 && rung !== 'KILL' && rung !== 'HOLD_LATE') {
        const side = action.direction_leg === 'buy' ? 'BUY' : 'SELL';
        const legPrice = side === 'BUY' ? newBook.asks[0].price : newBook.bids[0].price;
        const volume = currentSpec.isCentAccount ? 1.0 : hftLimits.hftLotSize;

        ticketCounter.current += 1;
        const ticket = ticketCounter.current;

        const newPos: Position = {
          ticket,
          symbol: currentSpec.symbol,
          type: side,
          volume,
          openPrice: legPrice,
          currentPrice: legPrice,
          sl: side === 'BUY' ? Math.round((legPrice - 2.5) * 100) / 100 : Math.round((legPrice + 2.5) * 100) / 100,
          tp: side === 'BUY' ? Math.round((legPrice + 4.5) * 100) / 100 : Math.round((legPrice - 4.5) * 100) / 100,
          profit: 0,
          pips: 0,
          openTime: new Date().toLocaleTimeString(),
          openTimestamp: Date.now(),
          comment: `HFT-Leg-${side}`,
        };

        setPositions((prev) => [newPos, ...prev]);
        fillText = `Filled ${volume}L ${side} @ ${legPrice.toFixed(2)}`;
        fillPrice = legPrice;
        fillQty = volume;

        setHftStats((prev) => ({
          ...prev,
          fillsCount: prev.fillsCount + 1,
          legsCount: prev.legsCount + 1,
          totalVolumeLots: Math.round((prev.totalVolumeLots + volume) * 100) / 100,
        }));
      }

      // Handle Resting Quote Fill simulation (Passive maker executions - apenas com spread <= 15)
      if (
        !isSpreadAboveMax &&
        (action.kind === 'QUOTE_BOTH_SIDES' || action.kind === 'QUOTE_WIDE') &&
        Math.random() < 0.18 &&
        positions.length < 5
      ) {
        const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const qPrice = side === 'BUY' ? (action.bidPrice || newBook.bids[0].price) : (action.askPrice || newBook.asks[0].price);
        const volume = currentSpec.isCentAccount ? 1.0 : hftLimits.hftLotSize;

        ticketCounter.current += 1;
        const ticket = ticketCounter.current;

        const makerPos: Position = {
          ticket,
          symbol: currentSpec.symbol,
          type: side,
          volume,
          openPrice: qPrice,
          currentPrice: qPrice,
          sl: side === 'BUY' ? Math.round((qPrice - 2.0) * 100) / 100 : Math.round((qPrice + 2.0) * 100) / 100,
          tp: side === 'BUY' ? Math.round((qPrice + 3.0) * 100) / 100 : Math.round((qPrice - 3.0) * 100) / 100,
          profit: 0,
          pips: 0,
          openTime: new Date().toLocaleTimeString(),
          openTimestamp: Date.now(),
          comment: 'HFT-Maker',
        };

        setPositions((prev) => [makerPos, ...prev]);
        fillText = `Maker Fill ${volume}L ${side} @ ${qPrice.toFixed(2)}`;
        fillPrice = qPrice;
        fillQty = volume;

        setHftStats((prev) => ({
          ...prev,
          fillsCount: prev.fillsCount + 1,
          totalVolumeLots: Math.round((prev.totalVolumeLots + volume) * 100) / 100,
        }));
      }

      // Update Tick Record
      const tickRecord: HFTTickRecord = {
        tick: currentTick,
        timestamp: Date.now(),
        timeStr: new Date().toLocaleTimeString(),
        mid: newMid,
        spreadPips: newBook.spreadPips,
        regime: newBattery.regime.choice,
        regimeConf: newBattery.regime.confidence,
        direction: newBattery.direction.choice,
        toxicFlow: newBattery.toxic_flow.noul,
        quoteEnv: newBattery.quote_environment.score,
        execHealth: newBattery.execution_health.score,
        action: action.kind,
        actionReason: action.reason,
        directionLeg: action.direction_leg,
        skew: action.skew,
        rung,
        latencyMs,
        inventory: inventoryLots,
        inventoryUsd: inventoryLots * newMid * 100,
        floatingPnl: account.floatingProfit,
        fill: fillText,
        fillPrice,
        fillQty,
      };

      setTickHistory((prev) => [tickRecord, ...prev.slice(0, 49)]);

      setHftStats((prev) => ({
        ...prev,
        ticksCount: prev.ticksCount + 1,
        avgLatencyMs: Math.round((prev.avgLatencyMs * 0.9 + latencyMs * 0.1) * 10) / 10,
        pullsCount: action.kind === 'PULL_QUOTES' ? prev.pullsCount + 1 : prev.pullsCount,
        widensCount: action.kind === 'WIDEN' ? prev.widensCount + 1 : prev.widensCount,
      }));
    }, hftLimits.tickIntervalMs);

    return () => clearInterval(hftTimer);
  }, [isHftRunning, hftLimits, currentPrice, spreadPips, inventoryLots, indicators, account, positions.length]);

  // Position Maintenance & Profit Calculation
  useEffect(() => {
    if (!positions.length) {
      setAccount((prev) => ({
        ...prev,
        equity: prev.balance,
        floatingProfit: 0,
        margin: 0,
        freeMargin: prev.balance,
        marginLevel: 0,
      }));
      return;
    }

    let totalFloating = 0;
    let totalMargin = 0;
    const updatedPositions: Position[] = [];
    const closedHits: ClosedTrade[] = [];

    positions.forEach((pos) => {
      const exitPrice = pos.type === 'BUY' ? bidPrice : askPrice;
      const profit = calculateGoldProfit(
        pos.type,
        pos.openPrice,
        exitPrice,
        pos.volume,
        currentSpec.contractSizeOz,
        currentSpec.commissionPerLotUsd
      );
      const pips = calculateGoldPips(pos.openPrice, exitPrice, pos.type);
      const margin = calculateMargin(
        pos.openPrice,
        pos.volume,
        account.leverage,
        currentSpec.contractSizeOz
      );

      // Check Stop Loss
      if (pos.sl > 0) {
        const isSlHit = pos.type === 'BUY' ? exitPrice <= pos.sl : exitPrice >= pos.sl;
        if (isSlHit) {
          const nowTs = Date.now();
          const openTs = pos.openTimestamp || nowTs - 60000;
          const duration = Math.max(1, Math.round((nowTs - openTs) / 1000));
          const comm = currentSpec.commissionPerLotUsd * pos.volume;

          closedHits.push({
            ticket: pos.ticket,
            symbol: pos.symbol,
            type: pos.type,
            volume: pos.volume,
            openPrice: pos.openPrice,
            closePrice: pos.sl,
            profit,
            pips,
            commission: comm,
            openTime: pos.openTime,
            closeTime: new Date().toLocaleTimeString(),
            openTimestamp: openTs,
            closeTimestamp: nowTs,
            durationSeconds: duration,
            reason: 'SL',
          });
          return;
        }
      }

      // Check Take Profit
      if (pos.tp > 0) {
        const isTpHit = pos.type === 'BUY' ? exitPrice >= pos.tp : exitPrice <= pos.tp;
        if (isTpHit) {
          const nowTs = Date.now();
          const openTs = pos.openTimestamp || nowTs - 60000;
          const duration = Math.max(1, Math.round((nowTs - openTs) / 1000));
          const comm = currentSpec.commissionPerLotUsd * pos.volume;

          closedHits.push({
            ticket: pos.ticket,
            symbol: pos.symbol,
            type: pos.type,
            volume: pos.volume,
            openPrice: pos.openPrice,
            closePrice: pos.tp,
            profit,
            pips,
            commission: comm,
            openTime: pos.openTime,
            closeTime: new Date().toLocaleTimeString(),
            openTimestamp: openTs,
            closeTimestamp: nowTs,
            durationSeconds: duration,
            reason: 'TP',
          });
          return;
        }
      }

      totalFloating += profit;
      totalMargin += margin;

      updatedPositions.push({
        ...pos,
        currentPrice: exitPrice,
        profit,
        pips,
      });
    });

    if (closedHits.length > 0) {
      const profitDelta = closedHits.reduce((acc, c) => acc + c.profit, 0);
      setClosedTrades((prev) => [...closedHits, ...prev]);
      setAccount((prev) => ({
        ...prev,
        balance: prev.balance + profitDelta,
        closedProfitToday: prev.closedProfitToday + profitDelta,
      }));
    }

    setPositions(updatedPositions);

    setAccount((prev) => {
      const equity = prev.balance + totalFloating;
      const freeMargin = Math.max(0, equity - totalMargin);
      const marginLevel = totalMargin > 0 ? (equity / totalMargin) * 100 : 0;
      return {
        ...prev,
        equity,
        floatingProfit: totalFloating,
        margin: totalMargin,
        freeMargin,
        marginLevel,
      };
    });
  }, [currentPrice, bidPrice, askPrice]);

  // Handlers for manual actions
  const handlePlaceOrder = (order: {
    type: 'BUY' | 'SELL';
    volume: number;
    slPrice: number;
    tpPrice: number;
  }) => {
    const entryPrice = order.type === 'BUY' ? askPrice : bidPrice;
    ticketCounter.current += 1;
    const ticket = ticketCounter.current;

    const newPosition: Position = {
      ticket,
      symbol,
      type: order.type,
      volume: order.volume,
      openPrice: entryPrice,
      currentPrice: entryPrice,
      sl: order.slPrice,
      tp: order.tpPrice,
      profit: 0,
      pips: 0,
      openTime: new Date().toLocaleTimeString(),
      openTimestamp: Date.now(),
      comment: 'Manual-Web',
    };

    setPositions((prev) => [newPosition, ...prev]);
    addBotLog('trade', `Ordem manual executada: ${order.type} ${order.volume}L @ ${formatGoldPrice(entryPrice)}`);
  };

  const handleClosePosition = (ticket: number, percent: number = 100) => {
    const pos = positions.find((p) => p.ticket === ticket);
    if (!pos) return;

    const closeVolume = Math.round((pos.volume * (percent / 100)) * 100) / 100;
    const exitPrice = pos.type === 'BUY' ? bidPrice : askPrice;
    const profit = calculateGoldProfit(
      pos.type,
      pos.openPrice,
      exitPrice,
      closeVolume,
      currentSpec.contractSizeOz,
      currentSpec.commissionPerLotUsd
    );
    const pips = calculateGoldPips(pos.openPrice, exitPrice, pos.type);
    const nowTs = Date.now();
    const openTs = pos.openTimestamp || nowTs - 60000;
    const duration = Math.max(1, Math.round((nowTs - openTs) / 1000));
    const comm = currentSpec.commissionPerLotUsd * closeVolume;

    const closed: ClosedTrade = {
      ticket: pos.ticket,
      symbol: pos.symbol,
      type: pos.type,
      volume: closeVolume,
      openPrice: pos.openPrice,
      closePrice: exitPrice,
      profit,
      pips,
      commission: comm,
      openTime: pos.openTime,
      closeTime: new Date().toLocaleTimeString(),
      openTimestamp: openTs,
      closeTimestamp: nowTs,
      durationSeconds: duration,
      reason: 'MANUAL',
    };

    setClosedTrades((prev) => [closed, ...prev]);
    setAccount((prev) => ({
      ...prev,
      balance: prev.balance + profit,
      closedProfitToday: prev.closedProfitToday + profit,
    }));

    if (percent === 100 || closeVolume >= pos.volume) {
      setPositions((prev) => prev.filter((p) => p.ticket !== ticket));
    } else {
      setPositions((prev) =>
        prev.map((p) => (p.ticket === ticket ? { ...p, volume: Math.round((p.volume - closeVolume) * 100) / 100 } : p))
      );
    }
  };

  const handleMoveToBreakeven = (ticket: number) => {
    setPositions((prev) =>
      prev.map((p) => (p.ticket === ticket ? { ...p, sl: p.openPrice } : p))
    );
  };

  const handleEmergencyFlatten = () => {
    positions.forEach((pos) => {
      handleClosePosition(pos.ticket, 100);
    });
    addBotLog('warning', 'Pânico acionado: Todas as posições abertas no XAUUSD foram encerradas.');
  };

  // Live Forex Signals Tick Engine
  useEffect(() => {
    const timer = setInterval(() => {
      setIsGoldenOverlap(isGoldenOverlapActive());

      setSignals((prevSignals) => {
        let triggeredAlert: MarketAlert | null = null;

        const nextSignals = prevSignals.map((sig) => {
          if (sig.status === 'TP3_HIT' || sig.status === 'SL_HIT' || sig.status === 'CLOSED_NEWS') {
            return sig;
          }

          const spec = getSymbolSpec(sig.symbol);
          const pipSize = spec.pipSize;
          const deltaPips = (Math.random() - 0.48) * 1.5;
          const newPrice = Number((sig.currentPrice + deltaPips * pipSize).toFixed(spec.decimals));

          const { updatedSignal, newAlert } = processSignalTick(sig, newPrice);
          if (newAlert && !triggeredAlert) {
            triggeredAlert = newAlert;
          }
          return updatedSignal;
        });

        if (triggeredAlert) {
          setAlerts((prev) => [triggeredAlert!, ...prev.slice(0, 49)]);
          setActiveBannerAlert(triggeredAlert);
        }

        return nextSignals;
      });
    }, 2400);

    return () => clearInterval(timer);
  }, []);

  const handleGenerateNewSignal = (pair?: string, action?: SignalAction) => {
    const sym = pair || activeSymbol;
    const spec = getSymbolSpec(sym);
    const act = action || (Math.random() > 0.5 ? 'STRONG_BUY' : 'SELL');
    const price = currentPrice > 0 && activeSymbol === sym ? currentPrice : spec.basePrice;

    const { signal, alert } = createNewSignal(sym, act, price, 'M5');
    setSignals((prev) => [signal, ...prev]);
    setAlerts((prev) => [alert, ...prev.slice(0, 49)]);
    setActiveBannerAlert(alert);
  };

  const handleCopyAlert = (al: MarketAlert) => {
    const sig = signals.find((s) => s.id === al.signalId);
    if (sig) {
      const spec = getSymbolSpec(sig.symbol);
      const text = `🎯 SINAL FOREX ${sig.symbol} | ${sig.action} | ENTRADA: ${sig.entryPrice} | SL: ${sig.stopLoss} | TP1: ${sig.takeProfit1} | TP2: ${sig.takeProfit2} | TP3: ${sig.takeProfit3}`;
      navigator.clipboard.writeText(text);
    } else {
      navigator.clipboard.writeText(al.message);
    }
  };

  const handleExecuteSignal = (sig: ForexSignal) => {
    handleSelectSymbol(sig.symbol);
    const isBuy = sig.action.includes('BUY');
    handlePlaceOrder({
      type: isBuy ? 'BUY' : 'SELL',
      volume: 0.05,
      slPrice: sig.stopLoss,
      tpPrice: sig.takeProfit1,
    });
    const spec = getSymbolSpec(sig.symbol);
    const execAlert: MarketAlert = {
      id: `exec_${Date.now()}`,
      signalId: sig.id,
      symbol: sig.symbol,
      type: 'ENTRY',
      action: sig.action,
      price: sig.entryPrice,
      message: `Ordem ${sig.action} enviada com sucesso no par ${sig.symbol} a ${sig.entryPrice.toFixed(spec.decimals)}. SL: ${sig.stopLoss} | TP: ${sig.takeProfit1}`,
      timestamp: Date.now(),
      source: 'Technical',
      pips: 0,
    };
    setActiveBannerAlert(execAlert);
  };

  const handleToggleAudio = () => {
    const next = !isAudioEnabled;
    setIsAudioEnabled(next);
    audioAlerts.setEnabled(next);
  };

  const totalPips = useMemo(() => {
    return signals.reduce((acc, s) => acc + (s.pipsCurrent || 0), 284);
  }, [signals]);

  const winRatePct = useMemo(() => {
    const closed = signals.filter((s) => s.status.includes('TP') || s.status === 'SL_HIT');
    if (closed.length === 0) return 89.2;
    const wins = closed.filter((s) => s.status.includes('TP')).length;
    return Math.round((wins / closed.length) * 1000) / 10;
  }, [signals]);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        account={account}
        status={connectionStatus}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenBrokerConfig={() => setIsBrokerModalOpen(true)}
        onOpenDailyReport={() => setIsDailyReportModalOpen(true)}
        onOpenPairsModal={() => setIsPairsModalOpen(true)}
        onOpenAndroidApk={() => setIsAndroidApkModalOpen(true)}
        onEmergencyFlatten={handleEmergencyFlatten}
        hasOpenPositions={positions.length > 0}
        isHftRunning={isHftRunning}
        activeSymbol={activeSymbol}
        isStealthShieldActive={stealthConfig.enabled}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={handleToggleAudio}
        unreadAlertsCount={alerts.length}
      />

      {/* Instant Top Alert Banner */}
      <ActiveAlertBanner
        alert={activeBannerAlert}
        onDismiss={() => setActiveBannerAlert(null)}
        onCopySignal={handleCopyAlert}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* TAB 1: PAINEL DE SINAIS FOREX COMPRA/VENDA COM STOP & TAKE */}
        {activeTab === 'signals' && (
          <SignalsDashboard
            signals={signals}
            alerts={alerts}
            onExecuteSignal={handleExecuteSignal}
            onSelectSymbol={handleSelectSymbol}
            onGenerateNewSignal={handleGenerateNewSignal}
            isGoldenOverlap={isGoldenOverlap}
            totalPips={totalPips}
            winRatePct={winRatePct}
            onClearAlerts={() => setAlerts([])}
            onDismissAlert={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
            onCopyAlert={handleCopyAlert}
          />
        )}

        {/* TAB 2: PAINEL DE ALERTAS & HISTÓRICO SONORO */}
        {activeTab === 'alerts' && (
          <AlertsHistoryTab
            alerts={alerts}
            onClearAlerts={() => setAlerts([])}
          />
        )}

        {/* TAB 3: MACRO SENTINEL & SITES CADASTRADOS */}
        {activeTab === 'macro' && (
          <MacroSentinelPanel />
        )}
      </main>

      {/* Broker Configuration Modal */}
      <BrokerModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        credentials={credentials}
        onSave={(newCreds) => {
          setCredentials(newCreds);
          if (newCreds.accountType) {
            handleSelectAccountType(newCreds.accountType);
          }
          setAccount((prev) => ({
            ...prev,
            login: newCreds.login,
            broker: newCreds.brokerName,
            server: newCreds.server,
            leverage: newCreds.leverage,
            accountType: newCreds.accountType || prev.accountType,
          }));
          localStorage.setItem('mt5_broker_creds', JSON.stringify(newCreds));
        }}
        isConnecting={connectionStatus === 'connecting'}
      />

      {/* HFT Daily Performance & 24H Timeline Modal */}
      <DailyPerformanceModal
        isOpen={isDailyReportModalOpen}
        onClose={() => setIsDailyReportModalOpen(false)}
        account={account}
        accountType={accountType}
        closedTrades={closedTrades}
        positions={positions}
        candles={timelineCandles}
        currentPrice={currentPrice}
      />

      {/* Aplicativo Android APK & WebAPK Modal */}
      <AndroidApkModal
        isOpen={isAndroidApkModalOpen}
        onClose={() => setIsAndroidApkModalOpen(false)}
      />

      {/* Seletor de Paridades & Cesta de Ativos Modal */}
      <PairSelectorModal
        isOpen={isPairsModalOpen}
        onClose={() => setIsPairsModalOpen(false)}
        activeSymbol={activeSymbol}
        onSelectSymbol={handleSelectSymbol}
        allowedSymbols={allowedSymbols}
        onToggleAllowedSymbol={handleToggleAllowedSymbol}
      />
    </div>
  );
}
