export type AccountMode = 'demo' | 'real';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type ConnectionProtocol = 'simulation' | 'mt5_local_bridge' | 'metaapi_cloud';
export type ExnessAccountType = 'raw_spread' | 'zero' | 'standard' | 'standard_cent' | 'pro';

export interface ExnessAccountSpec {
  id: ExnessAccountType;
  name: string;
  badge: string;
  typicalSpreadPips: number;
  minSpreadPips: number;
  maxSpreadPips: number;
  commissionPerLotUsd: number;
  symbol: string;
  contractSizeOz: number; // 100 for standard/raw/zero/pro, 1 for Cent
  description: string;
  isCentAccount: boolean;
}

export interface BrokerCredentials {
  brokerName: string;
  server: string;
  serverHost?: string;
  serverPort?: number;
  login: string;
  password?: string;
  accountMode: AccountMode;
  accountType: ExnessAccountType;
  leverage: number;
  protocol: ConnectionProtocol;
  bridgeUrl?: string;
  metaApiToken?: string;
  metaApiAccountId?: string;
  isCustomBroker?: boolean;
  proxyShieldUrl?: string;
}

export interface AccountInfo {
  login: string;
  broker: string;
  server: string;
  accountType: ExnessAccountType;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  floatingProfit: number;
  closedProfitToday: number;
  leverage: number;
  connected: boolean;
}

export type OrderType = 'BUY' | 'SELL';
export type OrderExecutionType = 'MARKET' | 'LIMIT' | 'STOP';

export interface Position {
  ticket: number;
  symbol: string;
  type: OrderType;
  volume: number; // lots
  openPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  profit: number; // in USD
  pips: number;
  openTime: string;
  openTimestamp?: number;
  comment?: string;
}

export interface ClosedTrade {
  ticket: number;
  symbol: string;
  type: OrderType;
  volume: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  closeTime: string;
  openTime?: string;
  openTimestamp?: number;
  closeTimestamp?: number;
  pips?: number;
  commission?: number;
  durationSeconds?: number;
  reason: 'TP' | 'SL' | 'MANUAL' | 'BOT_KILL';
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = 'M1' | 'M5' | 'M15' | 'H1' | 'H4' | 'D1';

export type StrategyType = 'gold_trend_surfer' | 'london_ny_breakout' | 'mean_reversion_scalp' | 'custom_prompt_split';

export interface BotStrategyConfig {
  id: StrategyType;
  name: string;
  description: string;
  timeframe: Timeframe;
  lotSize: number;
  autoLotRiskPct: number;
  useAutoLot: boolean;
  takeProfitPips: number;
  stopLossPips: number;
  trailingStopPips: number;
  maxSpreadPips: number;
  maxDailyLossUsd: number;
  maxOpenTrades: number;
  tradingHoursStart: number; // UTC hour e.g. 7 (London)
  tradingHoursEnd: number;   // UTC hour e.g. 21 (NY close)
}

export interface BotSignal {
  id: string;
  timestamp: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'STAND_DOWN' | 'PULL_ORDERS';
  confidence: number;
  price: number;
  reason: string;
  indicators: {
    rsi: number;
    emaFast: number;
    emaSlow: number;
    spread: number;
  };
}

export interface BotLog {
  id: string;
  time: string;
  level: 'info' | 'trade' | 'warning' | 'error';
  message: string;
}
