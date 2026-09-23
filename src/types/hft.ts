export type ActionKind =
  | 'KILL'
  | 'PULL_QUOTES'
  | 'WIDEN'
  | 'QUOTE_BOTH_SIDES'
  | 'QUOTE_WIDE'
  | 'STAND_DOWN';

export type LadderRung = 'RUN' | 'REDUCE' | 'HOLD_LATE' | 'RULES_ONLY' | 'KILL';

export type RegimeType = 'trending' | 'mean_reverting' | 'high_vol' | 'crisis';
export type DirectionType = 'up' | 'down' | 'neutral';

export interface BatteryAnswers {
  regime: {
    choice: RegimeType;
    confidence: number;
    probabilities: Record<RegimeType, number>;
  };
  direction: {
    choice: DirectionType;
    confidence: number;
    probabilities: Record<DirectionType, number>;
  };
  toxic_flow: {
    noul: number; // 0.0 to 1.0
  };
  liquidity_stressed: {
    noul: number; // 0.0 to 1.0
  };
  quote_environment: {
    score: number; // 0.0 to 3.0
    confidence: number;
    legend: Record<string, string>;
  };
  inventory_pressure: {
    score: number; // 0.0 to 3.0
    legend: Record<string, string>;
  };
  execution_health: {
    score: number; // 0.0 to 3.0
    legend: Record<string, string>;
  };
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface HFTOrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  mid: number;
  spread: number;
  spreadBps: number;
  spreadPips: number;
  imbalance: number; // -1.0 to 1.0
}

export interface HFTAction {
  kind: ActionKind;
  reason: string;
  skew: number; // -1.0 to 1.0
  direction_leg?: 'buy' | 'sell' | null;
  bidPrice?: number;
  askPrice?: number;
  quoteSize?: number;
}

export interface HFTTickRecord {
  tick: number;
  timestamp: number;
  timeStr: string;
  mid: number;
  spreadPips: number;
  regime: RegimeType;
  regimeConf: number;
  direction: DirectionType;
  toxicFlow: number;
  quoteEnv: number;
  execHealth: number;
  action: ActionKind;
  actionReason: string;
  directionLeg?: 'buy' | 'sell' | null;
  skew: number;
  rung: LadderRung;
  latencyMs: number;
  inventory: number;
  inventoryUsd: number;
  floatingPnl: number;
  fill?: string;
  fillPrice?: number;
  fillQty?: number;
}

export interface HFTRiskLimits {
  maxPositionUsd: number;       // default $2,500
  maxDailyLossUsd: number;      // default $150
  maxDrawdownPct: number;       // default 0.05 (5%)
  maxOrderNotionalUsd: number;  // default $500
  maxSpreadPips: number;        // default 3.5 pips
  maxInventoryLots: number;     // default 1.0 lot
  maxDecisionLatencyMs: number; // default 500ms
  asGamma: number;              // risk aversion default 0.10
  asKappa: number;              // order book liquidity 1.5
  asHorizonS: number;           // 60s
  tickIntervalMs: number;       // 300ms, 500ms, 1000ms
  hftLotSize: number;           // default 0.05
}

export interface HFTStats {
  ticksCount: number;
  fillsCount: number;
  pullsCount: number;
  widensCount: number;
  legsCount: number;
  avgLatencyMs: number;
  totalVolumeLots: number;
  realizedPnl: number;
  winRate: number;
  maxDrawdownRecorded: number;
}
