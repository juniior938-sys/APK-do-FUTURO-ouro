import { ExnessAccountType, ExnessAccountSpec } from '../types/mt5';

/**
 * Precision Mathematics for XAUUSD (Gold vs US Dollar) in MetaTrader 5 / Exness
 * Standard MT5 Gold Contract: 1.00 Lot = 100 Troy Ounces
 * Cent Account Gold Contract: 1.00 Cent Lot = 1 Troy Ounce (1/100th)
 * Tick Size: 0.01 USD
 * 1 Pip = 0.10 USD (10 Points)
 * 1 Point = 0.01 USD
 */

export const GOLD_CONTRACT_SIZE = 100; // 100 oz per standard lot
export const GOLD_CENT_CONTRACT_SIZE = 1; // 1 oz per cent lot (Exness Standard Cent)
export const GOLD_PIP_SIZE = 0.10; // 0.10 in price = 1 pip (10 points)

export const EXNESS_ACCOUNT_SPECS: Record<ExnessAccountType, ExnessAccountSpec> = {
  raw_spread: {
    id: 'raw_spread',
    name: 'Exness Raw Spread',
    badge: 'Raw 0.0 Pips',
    typicalSpreadPips: 0.1,
    minSpreadPips: 0.0,
    maxSpreadPips: 0.3,
    commissionPerLotUsd: 7.0, // $3.50 per side = $7.00/lot
    symbol: 'XAUUSD',
    contractSizeOz: 100,
    description: 'Spreads brutos a partir de 0.0 pips no XAUUSD + comissão fixa baixa ($7/lote). Ideal para robôs HFT e scalping ultrarrápido.',
    isCentAccount: false,
  },
  zero: {
    id: 'zero',
    name: 'Exness Zero',
    badge: 'Zero Spread 0.0',
    typicalSpreadPips: 0.0,
    minSpreadPips: 0.0,
    maxSpreadPips: 0.2,
    commissionPerLotUsd: 8.0, // $4.00 per side = $8.00/lot
    symbol: 'XAUUSDz',
    contractSizeOz: 100,
    description: 'Spread ZERO em 95% do dia no Ouro com execução a mercado e comissão a partir de $8/lote.',
    isCentAccount: false,
  },
  standard: {
    id: 'standard',
    name: 'Exness Standard',
    badge: 'Sem Comissão (1.2 pips)',
    typicalSpreadPips: 1.3,
    minSpreadPips: 1.0,
    maxSpreadPips: 2.0,
    commissionPerLotUsd: 0.0,
    symbol: 'XAUUSDm',
    contractSizeOz: 100,
    description: 'Conta mais popular da Exness. Sem comissão de negociação, spread médio de 1.2 a 1.6 pips no Ouro.',
    isCentAccount: false,
  },
  standard_cent: {
    id: 'standard_cent',
    name: 'Exness Standard Cent',
    badge: 'Micro Cent (1 oz/lot)',
    typicalSpreadPips: 1.8,
    minSpreadPips: 1.4,
    maxSpreadPips: 2.8,
    commissionPerLotUsd: 0.0,
    symbol: 'XAUUSDc',
    contractSizeOz: 1, // 1 cent lot = 1 troy ounce (1/100 of standard)
    description: 'Conta Cent para depósitos menores ($10-$100). 1 lote Cent = 1 onça (0.01 do padrão). Saldo em centavos (USC). Spread estável de ~1.8 pips.',
    isCentAccount: true,
  },
  pro: {
    id: 'pro',
    name: 'Exness Pro',
    badge: 'Pro (0.7 pips, Zero Com)',
    typicalSpreadPips: 0.7,
    minSpreadPips: 0.5,
    maxSpreadPips: 1.2,
    commissionPerLotUsd: 0.0,
    symbol: 'XAUUSD',
    contractSizeOz: 100,
    description: 'Execução instantânea ou a mercado com spreads reduzidos a partir de 0.6 pips e ZERO comissão.',
    isCentAccount: false,
  },
};

/**
 * Computes realistic spread in pips according to Exness live market profile
 */
export function getExnessSpread(accountType: ExnessAccountType, randomSeed: number = 0): number {
  const spec = EXNESS_ACCOUNT_SPECS[accountType] || EXNESS_ACCOUNT_SPECS.raw_spread;

  if (accountType === 'zero') {
    // Zero account is 0.0 spread ~85% of time, with momentary micro-widening to 0.1
    const chance = Math.random();
    if (chance > 0.85) return 0.1;
    return 0.0;
  }

  if (accountType === 'raw_spread') {
    // Raw spread fluctuates tightly between 0.0 and 0.2 pips
    const r = Math.sin(randomSeed / 3000) * 0.1 + (Math.random() * 0.15);
    const spread = Math.max(0.0, Math.min(0.3, Math.round(r * 10) / 10));
    return spread;
  }

  if (accountType === 'standard') {
    // Standard spread averages 1.2 - 1.5 pips
    const r = 1.2 + Math.sin(randomSeed / 5000) * 0.3 + (Math.random() * 0.3);
    return Math.round(r * 10) / 10;
  }

  if (accountType === 'standard_cent') {
    // Standard Cent spread averages 1.7 - 2.2 pips
    const r = 1.7 + Math.sin(randomSeed / 5000) * 0.4 + (Math.random() * 0.4);
    return Math.round(r * 10) / 10;
  }

  // Pro
  const r = 0.7 + Math.sin(randomSeed / 4000) * 0.2 + (Math.random() * 0.2);
  return Math.round(r * 10) / 10;
}

/**
 * Calculates profit in USD for XAUUSD taking into account contract size and commission
 */
export function calculateGoldProfit(
  type: 'BUY' | 'SELL',
  openPrice: number,
  currentPrice: number,
  lots: number,
  contractSize: number = GOLD_CONTRACT_SIZE,
  commissionPerLot: number = 0
): number {
  const rawProfit = type === 'BUY'
    ? (currentPrice - openPrice) * contractSize * lots
    : (openPrice - currentPrice) * contractSize * lots;

  const commission = commissionPerLot * lots;
  return Math.round((rawProfit - commission) * 100) / 100;
}

/**
 * Calculates pips between two prices for XAUUSD
 */
export function calculateGoldPips(openPrice: number, currentPrice: number, type: 'BUY' | 'SELL'): number {
  const delta = type === 'BUY' ? (currentPrice - openPrice) : (openPrice - currentPrice);
  return delta / GOLD_PIP_SIZE;
}

/**
 * Calculates required margin for a position in USD
 */
export function calculateMargin(
  price: number,
  lots: number,
  leverage: number,
  contractSize: number = GOLD_CONTRACT_SIZE
): number {
  if (leverage <= 0) return 0;
  return (lots * contractSize * price) / leverage;
}

/**
 * Calculates optimal lot size based on account balance, risk %, and stop loss distance
 */
export function calculateRecommendedLotSize(
  balance: number,
  riskPercent: number,
  stopLossPips: number,
  contractSize: number = GOLD_CONTRACT_SIZE
): number {
  if (balance <= 0 || riskPercent <= 0 || stopLossPips <= 0) {
    return 0.01;
  }
  const maxRiskUsd = (balance * riskPercent) / 100;
  // Per pip value = contractSize * GOLD_PIP_SIZE (e.g. 100 * 0.10 = $10 per pip for standard, 1 * 0.10 = $0.10 for cent)
  const pipValuePerLot = contractSize * GOLD_PIP_SIZE;
  const rawLots = maxRiskUsd / (stopLossPips * pipValuePerLot);
  const roundedLots = Math.max(0.01, Math.floor(rawLots * 100) / 100);
  return Math.min(roundedLots, contractSize === 1 ? 500.0 : 50.0);
}

/**
 * Formats price in standard Gold format (2 decimal places)
 */
export function formatGoldPrice(price: number): string {
  if (isNaN(price)) return '0.00';
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats currency in USD with sign
 */
export function formatUsd(amount: number, showSign: boolean = false): string {
  if (isNaN(amount)) return '$0.00';
  const prefix = showSign && amount > 0 ? '+' : '';
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${prefix}${amount < 0 ? '-' : ''}${formatted}`;
}
