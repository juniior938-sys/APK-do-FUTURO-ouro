import {
  HFTOrderBook,
  OrderBookLevel,
  BatteryAnswers,
  HFTAction,
  LadderRung,
  HFTRiskLimits,
  RegimeType,
  DirectionType,
  HFTTickRecord,
} from '../types/hft';
import { GOLD_CONTRACT_SIZE, GOLD_PIP_SIZE } from '../utils/goldMath';

export const DEFAULT_HFT_LIMITS: HFTRiskLimits = {
  maxPositionUsd: 5000.0,
  maxDailyLossUsd: 150.0,
  maxDrawdownPct: 0.05, // 5%
  maxOrderNotionalUsd: 1000.0,
  maxSpreadPips: 3.5,
  maxInventoryLots: 0.50,
  maxDecisionLatencyMs: 350.0,
  asGamma: 0.10, // risk aversion
  asKappa: 1.5,  // order book liquidity parameter
  asHorizonS: 60.0,
  tickIntervalMs: 500, // 500ms default HFT loop
  hftLotSize: 0.02,
};

/**
 * Generates Level 2 Order Book for Gold (XAUUSD)
 */
export function generateL2Book(mid: number, baseSpreadPips: number = 2.0): HFTOrderBook {
  const halfSpread = (baseSpreadPips * GOLD_PIP_SIZE) / 2;
  const bestBid = Math.round((mid - halfSpread) * 100) / 100;
  const bestAsk = Math.round((mid + halfSpread) * 100) / 100;

  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  let cumBid = 0;
  let cumAsk = 0;

  for (let i = 0; i < 5; i++) {
    const step = i * 0.10;
    const bidPx = Math.round((bestBid - step) * 100) / 100;
    const askPx = Math.round((bestAsk + step) * 100) / 100;

    // Depth in gold lots (e.g. 1.2 to 8.5 lots per level)
    const bidSz = Math.round((1.5 + Math.sin(Date.now() / 3000 + i) * 0.8 + Math.random() * 2.5) * 10) / 10;
    const askSz = Math.round((1.5 + Math.cos(Date.now() / 3000 + i) * 0.8 + Math.random() * 2.5) * 10) / 10;

    cumBid += bidSz;
    cumAsk += askSz;

    bids.push({ price: bidPx, size: bidSz, total: Math.round(cumBid * 10) / 10 });
    asks.push({ price: askPx, size: askSz, total: Math.round(cumAsk * 10) / 10 });
  }

  const top3BidSz = bids.slice(0, 3).reduce((sum, b) => sum + b.size, 0);
  const top3AskSz = asks.slice(0, 3).reduce((sum, a) => sum + a.size, 0);
  const imbalance = (top3BidSz + top3AskSz) > 0 ? (top3BidSz - top3AskSz) / (top3BidSz + top3AskSz) : 0;

  const actualSpread = Math.round((bestAsk - bestBid) * 100) / 100;
  const spreadBps = mid > 0 ? (actualSpread / mid) * 10000 : 0;
  const spreadPips = Math.round((actualSpread / GOLD_PIP_SIZE) * 10) / 10;

  return {
    bids,
    asks,
    mid,
    spread: actualSpread,
    spreadBps: Math.round(spreadBps * 10) / 10,
    spreadPips,
    imbalance: Math.round(imbalance * 1000) / 1000,
  };
}

/**
 * Evaluates the 7-Question Decision Battery for HFT Gold
 */
export function evaluateHFTBattery(
  book: HFTOrderBook,
  inventoryLots: number,
  recentPrices: number[],
  recentLatencies: number[]
): BatteryAnswers {
  // Volatility & Momentum
  const lastPrice = recentPrices[recentPrices.length - 1] || book.mid;
  const firstPrice = recentPrices[0] || lastPrice;
  const priceChange = lastPrice - firstPrice;

  // 1. Regime: trending, mean_reverting, high_vol, crisis
  let regime: RegimeType = 'mean_reverting';
  let regimeConf = 0.82;
  if (Math.abs(priceChange) > 3.0) {
    regime = 'trending';
    regimeConf = 0.88;
  } else if (book.spreadPips > 3.8) {
    regime = 'high_vol';
    regimeConf = 0.76;
  }

  // 2. Direction: up, down, neutral
  let direction: DirectionType = 'neutral';
  let dirConf = 0.65;
  if (book.imbalance > 0.25 || priceChange > 0.8) {
    direction = 'up';
    dirConf = 0.60 + Math.min(0.35, Math.abs(book.imbalance) * 0.4);
  } else if (book.imbalance < -0.25 || priceChange < -0.8) {
    direction = 'down';
    dirConf = 0.60 + Math.min(0.35, Math.abs(book.imbalance) * 0.4);
  }

  // 3. Toxic Flow (0.0 to 1.0)
  const toxicFlow = Math.max(0.05, Math.min(0.95, 0.25 + Math.abs(book.imbalance) * 0.45 + (book.spreadPips > 3.0 ? 0.2 : 0)));

  // 4. Liquidity Stressed (0.0 to 1.0)
  const liquidityStressed = Math.max(0.05, Math.min(0.95, (book.spreadPips / 4.0) * 0.6 + (Math.abs(book.imbalance) > 0.5 ? 0.3 : 0)));

  // 5. Quote Environment (Score 0 to 3)
  // 0: Do not quote, 1: Marginal, 2: Standard, 3: Excellent
  let quoteScore = 2.4;
  if (toxicFlow > 0.65 || liquidityStressed > 0.70) {
    quoteScore = 0.6;
  } else if (toxicFlow > 0.45 || book.spreadPips > 3.0) {
    quoteScore = 1.4;
  } else if (book.spreadPips <= 2.2 && Math.abs(book.imbalance) < 0.3) {
    quoteScore = 2.8;
  }
  const quoteConf = 0.84;

  // 6. Inventory Pressure (Score 0 to 3)
  // 0: None, 1: Mild, 2: Skew hard, 3: Reduce now
  const invAbs = Math.abs(inventoryLots);
  let invPressureScore = 0.2;
  if (invAbs >= 0.30) {
    invPressureScore = 2.8;
  } else if (invAbs >= 0.15) {
    invPressureScore = 1.9;
  } else if (invAbs >= 0.05) {
    invPressureScore = 0.9;
  }

  // 7. Execution Health (Score 0 to 3)
  // 0: Broken, 1: Degraded, 2: Normal, 3: Optimal
  const avgLatency = recentLatencies.length ? recentLatencies.reduce((a, b) => a + b, 0) / recentLatencies.length : 15;
  let execHealthScore = 2.9;
  if (avgLatency > 400) {
    execHealthScore = 0.5;
  } else if (avgLatency > 200) {
    execHealthScore = 1.5;
  } else if (avgLatency > 80) {
    execHealthScore = 2.2;
  }

  return {
    regime: {
      choice: regime,
      confidence: Math.round(regimeConf * 100) / 100,
      probabilities: {
        trending: regime === 'trending' ? 0.8 : 0.1,
        mean_reverting: regime === 'mean_reverting' ? 0.8 : 0.1,
        high_vol: regime === 'high_vol' ? 0.8 : 0.1,
        crisis: 0.05,
      },
    },
    direction: {
      choice: direction,
      confidence: Math.round(dirConf * 100) / 100,
      probabilities: {
        up: direction === 'up' ? dirConf : (1 - dirConf) / 2,
        down: direction === 'down' ? dirConf : (1 - dirConf) / 2,
        neutral: direction === 'neutral' ? 0.7 : 0.15,
      },
    },
    toxic_flow: { noul: Math.round(toxicFlow * 100) / 100 },
    liquidity_stressed: { noul: Math.round(liquidityStressed * 100) / 100 },
    quote_environment: {
      score: Math.round(quoteScore * 100) / 100,
      confidence: quoteConf,
      legend: { '0': 'Do not quote', '1': 'Marginal', '2': 'Standard', '3': 'Excellent' },
    },
    inventory_pressure: {
      score: Math.round(invPressureScore * 100) / 100,
      legend: { '0': 'None', '1': 'Mild', '2': 'Skew hard', '3': 'Reduce now' },
    },
    execution_health: {
      score: Math.round(execHealthScore * 100) / 100,
      legend: { '0': 'Broken', '1': 'Degraded', '2': 'Normal', '3': 'Optimal' },
    },
  };
}

/**
 * Avellaneda-Stoikov Reservation Price and Spread Calculation for Gold
 */
export function calculateAvellanedaStoikov(
  mid: number,
  inventoryLots: number,
  sigma: number,
  limits: HFTRiskLimits
): { reservationPrice: number; halfSpread: number; optBid: number; optAsk: number; skew: number } {
  const { asGamma, asKappa, asHorizonS } = limits;

  // Reservation price: r = mid - q * gamma * sigma^2 * (T - t)
  // When long (q > 0), reservation price drops below mid to attract selling our inventory
  const inventoryFactor = inventoryLots * asGamma * (sigma * sigma) * asHorizonS;
  const reservationPrice = Math.round((mid - inventoryFactor) * 100) / 100;

  // Half spread: delta = gamma * sigma^2 * (T - t) + (2 / gamma) * ln(1 + gamma / kappa)
  const inventorySpreadTerm = asGamma * (sigma * sigma) * asHorizonS;
  const liquiditySpreadTerm = (2.0 / asGamma) * Math.log(1.0 + asGamma / asKappa);
  const rawHalfSpread = Math.max(0.10, Math.min(1.50, inventorySpreadTerm + liquiditySpreadTerm));

  const optBid = Math.round((reservationPrice - rawHalfSpread) * 100) / 100;
  const optAsk = Math.round((reservationPrice + rawHalfSpread) * 100) / 100;

  // Skew normalized between -1.0 (sell-skewed) and +1.0 (buy-skewed)
  const skew = inventoryLots > 0 ? -Math.min(1.0, inventoryLots / limits.maxInventoryLots) : Math.min(1.0, -inventoryLots / limits.maxInventoryLots);

  return {
    reservationPrice,
    halfSpread: Math.round(rawHalfSpread * 100) / 100,
    optBid,
    optAsk,
    skew: Math.round(skew * 100) / 100,
  };
}

/**
 * Policy Engine: turns the 7 Battery answers into an actionable HFT command
 */
export function composeHFTAction(
  answers: BatteryAnswers,
  pricing: ReturnToType<typeof calculateAvellanedaStoikov>,
  inventoryLots: number,
  drawdownPct: number,
  dailyLossUsd: number,
  limits: HFTRiskLimits
): HFTAction {
  // 1. Hard Kill Condition
  if (drawdownPct > limits.maxDrawdownPct) {
    return { kind: 'KILL', reason: `Drawdown ${(drawdownPct * 100).toFixed(1)}% acima do teto de ${(limits.maxDrawdownPct * 100).toFixed(0)}%`, skew: 0 };
  }
  if (dailyLossUsd > limits.maxDailyLossUsd) {
    return { kind: 'KILL', reason: `Perda diária -$${dailyLossUsd.toFixed(2)} ultrapassou limite de -$${limits.maxDailyLossUsd}`, skew: 0 };
  }

  // 2. Toxic Flow: pull resting quotes to avoid being picked off
  if (answers.toxic_flow.noul > 0.60) {
    return { kind: 'PULL_QUOTES', reason: `Fluxo tóxico alto (${answers.toxic_flow.noul.toFixed(2)} > 0.60) - Proteção contra sweep institucional`, skew: pricing.skew };
  }

  // 3. Liquidity Stressed: widen quoted spread
  if (answers.liquidity_stressed.noul > 0.70) {
    return {
      kind: 'WIDEN',
      reason: `Liquidez do book estressada (${answers.liquidity_stressed.noul.toFixed(2)}) - Alargando spread para capturar prêmio`,
      skew: pricing.skew,
      bidPrice: Math.round((pricing.optBid - 0.30) * 100) / 100,
      askPrice: Math.round((pricing.optAsk + 0.30) * 100) / 100,
      quoteSize: limits.hftLotSize,
    };
  }

  // 4. Quote Environment: Score based execution
  const env = answers.quote_environment;
  let actionKind: HFTAction['kind'] = 'STAND_DOWN';
  let reason = `Ambiente de cotação ${env.score.toFixed(1)} abaixo do piso`;

  if (env.score >= 2.0 && env.confidence >= 0.75) {
    actionKind = 'QUOTE_BOTH_SIDES';
    reason = `Book favorável (Score ${env.score.toFixed(1)}/3, Conf ${(env.confidence * 100).toFixed(0)}%) - Cotando compra e venda simultânea`;
  } else if (env.score >= 1.0) {
    actionKind = 'QUOTE_WIDE';
    reason = `Ambiente marginal (Score ${env.score.toFixed(1)}/3) - Cotando com margem de segurança alargada`;
  }

  const action: HFTAction = {
    kind: actionKind,
    reason,
    skew: pricing.skew,
    bidPrice: pricing.optBid,
    askPrice: pricing.optAsk,
    quoteSize: limits.hftLotSize,
  };

  // 5. Directional Leg: executed when direction call is highly confident
  if (action.kind === 'QUOTE_BOTH_SIDES' || action.kind === 'QUOTE_WIDE') {
    const dir = answers.direction;
    if (dir.choice !== 'neutral' && dir.confidence >= 0.68) {
      action.direction_leg = dir.choice === 'up' ? 'buy' : 'sell';
      action.reason += ` + Perna Direcional ${action.direction_leg.toUpperCase()} (${(dir.confidence * 100).toFixed(0)}% conf)`;
    }
  }

  return action;
}

/**
 * Fallback Ladder selector: RUN / REDUCE / HOLD_LATE / RULES_ONLY / KILL
 */
export function selectLadderRung(
  isKill: boolean,
  isLate: boolean,
  confidence: number,
  execHealthScore: number
): LadderRung {
  if (isKill) return 'KILL';
  if (isLate) return 'HOLD_LATE';
  if (confidence < 0.50 || execHealthScore < 1.0) return 'REDUCE';
  return 'RUN';
}

type ReturnToType<T extends (...args: any[]) => any> = ReturnType<T>;
