import { Candle, Timeframe } from '../types/mt5';

export interface IndicatorValues {
  emaFast: number;
  emaSlow: number;
  emaTrend: number;
  rsi: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  vwap: number;
  sessionHigh: number;
  sessionLow: number;
}

/**
 * Generates initial synthetic candles for Gold (XAUUSD)
 */
export function generateInitialCandles(count: number = 80, timeframe: Timeframe = 'M5'): Candle[] {
  const candles: Candle[] = [];
  const tfMinutes = timeframe === 'M1' ? 1 : timeframe === 'M5' ? 5 : timeframe === 'M15' ? 15 : timeframe === 'H1' ? 60 : timeframe === 'H4' ? 240 : 1440;
  const tfMs = tfMinutes * 60 * 1000;
  
  let currentPrice = 2658.40;
  const now = Date.now();
  const startTime = now - count * tfMs;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * tfMs;
    // Gold volatility: 0.8 to 3.5 dollars per candle
    const volatility = 1.2 + Math.sin(i / 10) * 0.8;
    const change = (Math.random() - 0.49) * volatility;
    
    const open = currentPrice;
    const close = Math.round((open + change) * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.random() * volatility * 0.8) * 100) / 100;
    const low = Math.round((Math.min(open, close) - Math.random() * volatility * 0.8) * 100) / 100;
    const volume = Math.floor(120 + Math.random() * 450);

    candles.push({ time, open, high, low, close, volume });
    currentPrice = close;
  }

  return candles;
}

/**
 * Calculates EMA array
 */
export function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  let ema = data[0];
  emaArray.push(ema);

  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
    emaArray.push(ema);
  }
  return emaArray;
}

/**
 * Calculates RSI (14)
 */
export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length <= period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Math.round((100 - (100 / (1 + rs))) * 10) / 10;
}

/**
 * Computes all technical indicators for the current candle set
 */
export function computeIndicators(candles: Candle[]): IndicatorValues {
  const closes = candles.map((c) => c.close);
  const lastIndex = closes.length - 1;
  const currentClose = closes[lastIndex] || 2650;

  const emaFastList = calculateEMA(closes, 9);
  const emaSlowList = calculateEMA(closes, 21);
  const emaTrendList = calculateEMA(closes, 50);

  const rsi = calculateRSI(closes, 14);

  // Bollinger Bands (20, 2)
  const bbPeriod = 20;
  const bbSlice = closes.slice(-bbPeriod);
  const bbMean = bbSlice.reduce((a, b) => a + b, 0) / bbSlice.length;
  const variance = bbSlice.reduce((a, b) => a + Math.pow(b - bbMean, 2), 0) / bbSlice.length;
  const stdDev = Math.sqrt(variance);
  const bbUpper = bbMean + 2 * stdDev;
  const bbLower = bbMean - 2 * stdDev;

  // Session high and low
  const sessionHigh = Math.max(...candles.map((c) => c.high));
  const sessionLow = Math.min(...candles.map((c) => c.low));

  // VWAP
  let cumulativeTPV = 0;
  let cumulativeVol = 0;
  for (const c of candles.slice(-40)) {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumulativeTPV += typicalPrice * c.volume;
    cumulativeVol += c.volume;
  }
  const vwap = cumulativeVol > 0 ? cumulativeTPV / cumulativeVol : currentClose;

  // MACD approximation
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = (ema12[lastIndex] || currentClose) - (ema26[lastIndex] || currentClose);
  const signalLine = macdLine * 0.85;

  return {
    emaFast: Math.round((emaFastList[lastIndex] || currentClose) * 100) / 100,
    emaSlow: Math.round((emaSlowList[lastIndex] || currentClose) * 100) / 100,
    emaTrend: Math.round((emaTrendList[lastIndex] || currentClose) * 100) / 100,
    rsi,
    macd: {
      macdLine: Math.round(macdLine * 100) / 100,
      signalLine: Math.round(signalLine * 100) / 100,
      histogram: Math.round((macdLine - signalLine) * 100) / 100,
    },
    bollinger: {
      upper: Math.round(bbUpper * 100) / 100,
      middle: Math.round(bbMean * 100) / 100,
      lower: Math.round(bbLower * 100) / 100,
    },
    vwap: Math.round(vwap * 100) / 100,
    sessionHigh: Math.round(sessionHigh * 100) / 100,
    sessionLow: Math.round(sessionLow * 100) / 100,
  };
}

/**
 * Generates continuous 24-hour candles for XAUUSD (M15 interval = 96 candles)
 */
export function generate24hCandles(targetCurrentPrice: number = 2658.45): Candle[] {
  const count = 96; // 96 * 15m = 24 hours
  const tfMs = 15 * 60 * 1000;
  const now = Date.now();
  const startTime = now - count * tfMs;

  const candles: Candle[] = [];
  // Build a realistic intraday pattern: Asian consolidation, London breakout, NY liquidity run, retracement
  let p = targetCurrentPrice - 8.5; // Starts ~8.5 dollars lower 24h ago

  for (let i = 0; i < count; i++) {
    const time = startTime + i * tfMs;
    // Harmonic cycles for session waves
    const cycle1 = Math.sin((i / count) * Math.PI * 3) * 1.8;
    const cycle2 = Math.cos((i / count) * Math.PI * 2) * 1.2;
    const noise = (Math.random() - 0.48) * 1.1;
    
    // Pull towards target price as we near the last candles
    const remainingSteps = count - 1 - i;
    const pull = remainingSteps > 0 ? (targetCurrentPrice - p) / (remainingSteps + 1) : 0;

    const open = Math.round(p * 100) / 100;
    const delta = cycle1 * 0.15 + cycle2 * 0.1 + noise + pull;
    const close = i === count - 1 ? targetCurrentPrice : Math.round((open + delta) * 100) / 100;
    const high = Math.round((Math.max(open, close) + 0.3 + Math.random() * 0.9) * 100) / 100;
    const low = Math.round((Math.min(open, close) - 0.3 - Math.random() * 0.9) * 100) / 100;
    const volume = Math.floor(140 + Math.random() * 480);

    candles.push({ time, open, high, low, close, volume });
    p = close;
  }

  return candles;
}

/**
 * Generates seed realistic 24-hour HFT closed trades aligned with 24-hour candles
 */
export function generateSeed24hClosedTrades(
  candles: Candle[],
  symbol: string = 'XAUUSD',
  contractSizeOz: number = 100,
  commissionPerLot: number = 7.0
): import('../types/mt5').ClosedTrade[] {
  const trades: import('../types/mt5').ClosedTrade[] = [];
  let ticket = 890120;
  const count = candles.length;

  // We place ~28 trades spread out through the 24 hours (approx every 3 to 4 candles)
  for (let i = 2; i < count - 1; i += Math.floor(3 + Math.random() * 2)) {
    ticket++;
    const candle = candles[i];
    const prevCandle = candles[i - 1];
    const isUp = candle.close >= prevCandle.close;
    const isWin = Math.random() < 0.78; // 78% win rate

    const type: 'BUY' | 'SELL' = Math.random() > 0.48 ? (isUp ? 'BUY' : 'SELL') : (isUp ? 'SELL' : 'BUY');
    const volume = contractSizeOz === 1 ? 1.0 : 0.05; // 0.05 lots standard or 1.0 lot cent

    // Entry near candle open
    const openPrice = Math.round((candle.open + (Math.random() - 0.5) * 0.4) * 100) / 100;
    const pipsChange = isWin ? (1.5 + Math.random() * 3.2) : -(1.0 + Math.random() * 2.2);
    const priceDelta = Math.round((pipsChange * 0.10) * 100) / 100;

    const closePrice = type === 'BUY'
      ? Math.round((openPrice + priceDelta) * 100) / 100
      : Math.round((openPrice - priceDelta) * 100) / 100;

    const durationMin = Math.floor(3 + Math.random() * 18);
    const openTimestamp = candle.time + Math.floor(Math.random() * 120000);
    const closeTimestamp = openTimestamp + durationMin * 60 * 1000;

    const rawProfit = type === 'BUY'
      ? (closePrice - openPrice) * contractSizeOz * volume
      : (openPrice - closePrice) * contractSizeOz * volume;

    const comm = commissionPerLot * volume;
    const netProfit = Math.round((rawProfit - comm) * 100) / 100;

    const reason: 'TP' | 'SL' | 'MANUAL' | 'BOT_KILL' = isWin
      ? (Math.random() > 0.3 ? 'TP' : 'MANUAL')
      : (Math.random() > 0.4 ? 'SL' : 'BOT_KILL');

    const openDate = new Date(openTimestamp);
    const closeDate = new Date(closeTimestamp);

    trades.push({
      ticket,
      symbol,
      type,
      volume,
      openPrice,
      closePrice,
      profit: netProfit,
      pips: Math.round(pipsChange * 10) / 10,
      commission: Math.round(comm * 100) / 100,
      openTime: openDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      closeTime: closeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      openTimestamp,
      closeTimestamp,
      durationSeconds: durationMin * 60,
      reason,
    });
  }

  // Sort descending by close timestamp (most recent first)
  return trades.sort((a, b) => (b.closeTimestamp || 0) - (a.closeTimestamp || 0));
}
