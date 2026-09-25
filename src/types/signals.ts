export type SignalAction = 'BUY' | 'SELL' | 'STRONG_BUY' | 'STRONG_SELL' | 'WAIT';
export type SignalStatus = 'ACTIVE' | 'TRIGGERED' | 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'CLOSED_NEWS' | 'EXPIRED';
export type SignalTimeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4';

export interface ForexSignal {
  id: string;
  symbol: string;
  name: string;
  action: SignalAction;
  status: SignalStatus;
  timeframe: SignalTimeframe;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskReward: string;
  confidence: number; // e.g. 94%
  pipsRisk: number;
  pipsTarget1: number;
  pipsTarget2: number;
  pipsTarget3: number;
  strategy: string;
  rationale: string;
  sources: {
    worldTimeServer: {
      session: string;
      overlap: boolean;
      status: 'OPTIMAL' | 'MODERATE' | 'LOW_LIQUIDITY';
    };
    dailyFx: {
      calendarEvent?: string;
      impact: 'HIGH' | 'MED' | 'LOW' | 'NONE';
      forecastBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    };
    forexFactory: {
      redFolderWarning: boolean;
      minutesToNews: number | null;
      shieldState: 'SAFE_TO_TRADE' | 'HIGH_VOLATILITY_ALERT' | 'STAND_ASIDE';
    };
    investingCom: {
      sentimentBullishPct: number;
      centralBankTone: string;
    };
  };
  createdAt: number;
  updatedAt: number;
  pipsCurrent: number;
  exitReason?: string;
  alertSent?: boolean;
}

export interface MarketAlert {
  id: string;
  signalId: string;
  symbol: string;
  type: 'ENTRY' | 'EXIT_TP' | 'EXIT_SL' | 'EXIT_NEWS' | 'NEWS_WARNING';
  action: SignalAction;
  price: number;
  message: string;
  timestamp: number;
  pips?: number;
  source: 'WorldTimeServer' | 'DailyFX' | 'ForexFactory' | 'Investing.com' | 'Technical';
  soundPlayed?: boolean;
}

export interface MacroNewsEvent {
  id: string;
  timeUtc: string;
  currency: string;
  title: string;
  impact: 'HIGH' | 'MED' | 'LOW';
  actual: string;
  forecast: string;
  previous: string;
  source: 'DailyFX' | 'ForexFactory' | 'Investing.com';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  affectedPairs: string[];
}

export interface TradingSessionInfo {
  name: 'Sydney' | 'Tokyo' | 'London' | 'New York';
  city: string;
  country: string;
  openUtc: number; // hour in UTC
  closeUtc: number; // hour in UTC
  timezoneOffsetHours: number; // relative to UTC
  isOpen: boolean;
  timeUntilNextEvent: string; // e.g. "Fecha em 2h 15m" ou "Abre em 4h 30m"
  volatilityRating: 'Alta' | 'Média' | 'Baixa';
  keyPairs: string[];
  localTimeFormatted: string;
}

export interface RegisteredSiteInfo {
  id: 'worldtimeserver' | 'dailyfx' | 'forexfactory' | 'investing';
  name: string;
  url: string;
  category: string;
  roleDescription: string;
  status: 'ONLINE' | 'SYNCED';
  lastPing: string;
  features: string[];
}

export type AlertFilterType = 'ALL' | 'BUY' | 'SELL' | 'EXIT_TP' | 'EXIT_SL' | 'NEWS_WARNING';
export type SoundNoiseLevel = 'high' | 'medium' | 'low' | 'mute';
export type MarketNoiseFilter = 'all' | 'moderate' | 'strict';

export interface AlertSoundSettings {
  noiseLevel: SoundNoiseLevel;
  volume: number; // 0.0 to 1.0
  marketNoiseFilter: MarketNoiseFilter;
  buySoundEnabled: boolean;
  sellSoundEnabled: boolean;
  tpSoundEnabled: boolean;
  slSoundEnabled: boolean;
  newsSoundEnabled: boolean;
}

export interface EconomicEvent {
  id: string;
  time: string;
  date: string;
  currency: string;
  title: string;
  impact: 'HIGH' | 'MED' | 'LOW';
  forecast?: string;
  previous?: string;
  actual?: string;
  source: 'Investing.com' | 'ForexFactory';
  isHighVolatility: boolean;
  affectedPairs: string[];
  minutesUntil?: number;
  volatilityHoursLabel?: string;
}

export interface AIMarketAnalysisResult {
  symbol: string;
  timeframe: string;
  action: SignalAction;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  confidence: number;
  riskReward: string;
  strategy: string;
  technicalSummary: string;
  newsImpactSummary: string;
  aiRationale: string;
  highVolatilityWarning?: string;
  timestamp: number;
  source: 'Gemini-3.8-Flash' | 'InstitutionalEngine';
}
