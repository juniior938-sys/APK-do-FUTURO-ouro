import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Calculator, Shield, HelpCircle, Check, AlertTriangle } from 'lucide-react';
import { formatGoldPrice, formatUsd, calculateRecommendedLotSize, GOLD_PIP_SIZE } from '../utils/goldMath';

interface OrderPanelProps {
  bidPrice: number;
  askPrice: number;
  spreadPips: number;
  balance: number;
  leverage: number;
  onPlaceOrder: (order: {
    type: 'BUY' | 'SELL';
    volume: number;
    slPrice: number;
    tpPrice: number;
  }) => void;
  maxSpreadAllowed: number;
}

export const OrderPanel: React.FC<OrderPanelProps> = ({
  bidPrice,
  askPrice,
  spreadPips,
  balance,
  leverage,
  onPlaceOrder,
  maxSpreadAllowed,
}) => {
  const [lotSize, setLotSize] = useState<number>(0.05);
  const [slPips, setSlPips] = useState<number>(30); // 30 pips default ($3.00 gold move)
  const [tpPips, setTpPips] = useState<number>(60); // 60 pips default ($6.00 gold move, 1:2 R:R)
  const [useAutoLot, setUseAutoLot] = useState<boolean>(false);
  const [riskPercent, setRiskPercent] = useState<number>(1.0); // 1% of balance
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Recalculate auto lot size when balance, risk or sl changes
  useEffect(() => {
    if (useAutoLot) {
      const calculated = calculateRecommendedLotSize(balance, riskPercent, slPips);
      setLotSize(calculated);
    }
  }, [useAutoLot, balance, riskPercent, slPips]);

  const handleLotChange = (delta: number) => {
    setLotSize((prev) => {
      const next = Math.max(0.01, Math.round((prev + delta) * 100) / 100);
      return Math.min(next, 20.0);
    });
  };

  const handleSetRR = (ratio: number) => {
    setTpPips(Math.round(slPips * ratio));
  };

  const handleExecute = (type: 'BUY' | 'SELL') => {
    const entryPrice = type === 'BUY' ? askPrice : bidPrice;
    const slPrice =
      type === 'BUY'
        ? Math.round((entryPrice - slPips * GOLD_PIP_SIZE) * 100) / 100
        : Math.round((entryPrice + slPips * GOLD_PIP_SIZE) * 100) / 100;
    const tpPrice =
      type === 'BUY'
        ? Math.round((entryPrice + tpPips * GOLD_PIP_SIZE) * 100) / 100
        : Math.round((entryPrice - tpPips * GOLD_PIP_SIZE) * 100) / 100;

    onPlaceOrder({
      type,
      volume: lotSize,
      slPrice: slPips > 0 ? slPrice : 0,
      tpPrice: tpPips > 0 ? tpPrice : 0,
    });

    setOrderSuccess(`${type} ${lotSize}L executada a ${formatGoldPrice(entryPrice)}`);
    setTimeout(() => setOrderSuccess(null), 2500);
  };

  // Dollar projections
  const riskUsd = lotSize * slPips * 10 * GOLD_PIP_SIZE; // 1 pip = 0.10, 100 oz
  const rewardUsd = lotSize * tpPips * 10 * GOLD_PIP_SIZE;
  const isSpreadExcessive = spreadPips > maxSpreadAllowed;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Boleta de Execução XAUUSD</span>
          </h3>
          <p className="text-[11px] text-slate-400">1 Lote = 100 oz · Alavancagem 1:{leverage}</p>
        </div>

        {isSpreadExcessive && (
          <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3" />
            <span>Spread alto</span>
          </div>
        )}
      </div>

      {/* Instant Action BUY / SELL Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* SELL Button */}
        <button
          onClick={() => handleExecute('SELL')}
          disabled={isSpreadExcessive}
          className="group relative p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 transition-all flex flex-col items-center justify-center text-center disabled:opacity-50"
        >
          <div className="flex items-center gap-1 text-rose-400 font-bold text-sm tracking-wide">
            <ArrowDown className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            <span>VENDER / SELL</span>
          </div>
          <div className="text-lg font-mono font-extrabold text-white mt-1 tabular-nums">
            {formatGoldPrice(bidPrice)}
          </div>
          <div className="text-[10px] text-rose-300/80 mt-0.5">Executar na cotação Bid</div>
        </button>

        {/* BUY Button */}
        <button
          onClick={() => handleExecute('BUY')}
          disabled={isSpreadExcessive}
          className="group relative p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/80 transition-all flex flex-col items-center justify-center text-center disabled:opacity-50"
        >
          <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm tracking-wide">
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            <span>COMPRAR / BUY</span>
          </div>
          <div className="text-lg font-mono font-extrabold text-white mt-1 tabular-nums">
            {formatGoldPrice(askPrice)}
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-0.5">Executar na cotação Ask</div>
        </button>
      </div>

      {orderSuccess && (
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-center font-medium animate-in fade-in">
          ✓ {orderSuccess}
        </div>
      )}

      {/* Lot Size Selector & Auto-Calculator */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-slate-300 font-medium flex items-center gap-1">
            <span>Tamanho do Lote (Volume):</span>
          </label>
          <button
            type="button"
            onClick={() => setUseAutoLot(!useAutoLot)}
            className={`text-[11px] flex items-center gap-1 font-semibold transition-colors ${
              useAutoLot ? 'text-amber-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Calculator className="w-3 h-3" />
            <span>{useAutoLot ? 'Auto-Lote Ativo (% Risco)' : 'Calcular por Risco'}</span>
          </button>
        </div>

        {useAutoLot && (
          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Risco por Operação:</span>
              <span className="font-mono text-amber-400 font-bold">{riskPercent}% do saldo</span>
            </div>
            <div className="flex gap-1.5">
              {[0.5, 1.0, 1.5, 2.0].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setRiskPercent(pct)}
                  className={`flex-1 py-1 rounded text-[11px] font-semibold transition-colors ${
                    riskPercent === pct
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleLotChange(-0.1)}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm"
          >
            -0.1
          </button>
          <button
            type="button"
            onClick={() => handleLotChange(-0.01)}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            -0.01
          </button>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="20.0"
            value={lotSize}
            onChange={(e) => setLotSize(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg h-9 px-3 text-center font-mono font-bold text-amber-400 text-sm focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={() => handleLotChange(0.01)}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            +0.01
          </button>
          <button
            type="button"
            onClick={() => handleLotChange(0.1)}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm"
          >
            +0.1
          </button>
        </div>

        {/* Quick Lot presets */}
        <div className="flex items-center gap-1.5 pt-1">
          {[0.01, 0.05, 0.10, 0.50, 1.00].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setLotSize(preset)}
              className={`flex-1 py-1 rounded text-[11px] font-mono transition-colors ${
                lotSize === preset
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset.toFixed(2)}
            </button>
          ))}
        </div>
      </div>

      {/* Stop Loss & Take Profit with R:R */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {/* Stop Loss */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Stop Loss (Pips):</span>
            <span className="text-rose-400 font-mono font-semibold">-{formatUsd(riskUsd)}</span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="5"
              max="500"
              value={slPips}
              onChange={(e) => setSlPips(Math.max(5, parseInt(e.target.value) || 5))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-100 text-xs focus:outline-none focus:border-rose-500"
            />
            <span className="absolute right-2.5 top-1.5 text-slate-500 font-mono text-[10px]">pips</span>
          </div>
        </div>

        {/* Take Profit */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Take Profit (Pips):</span>
            <span className="text-emerald-400 font-mono font-semibold">+{formatUsd(rewardUsd)}</span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="5"
              max="1000"
              value={tpPips}
              onChange={(e) => setTpPips(Math.max(5, parseInt(e.target.value) || 5))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
            <span className="absolute right-2.5 top-1.5 text-slate-500 font-mono text-[10px]">pips</span>
          </div>
        </div>
      </div>

      {/* Risk:Reward ratio quick set */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
        <span className="text-slate-400">Proporção Risco:Retorno:</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleSetRR(1.0)}
            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
          >
            1:1
          </button>
          <button
            type="button"
            onClick={() => handleSetRR(1.5)}
            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
          >
            1:1.5
          </button>
          <button
            type="button"
            onClick={() => handleSetRR(2.0)}
            className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
          >
            1:2
          </button>
          <button
            type="button"
            onClick={() => handleSetRR(3.0)}
            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
          >
            1:3
          </button>
        </div>
      </div>
    </div>
  );
};
