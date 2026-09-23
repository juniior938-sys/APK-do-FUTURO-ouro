import React, { useState, useRef, useMemo } from 'react';
import { Candle, Timeframe, Position } from '../types/mt5';
import { IndicatorValues } from '../services/marketData';
import { formatGoldPrice } from '../utils/goldMath';
import { BarChart2, Eye, EyeOff } from 'lucide-react';

interface XAUUSDChartProps {
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  indicators: IndicatorValues;
  currentPrice: number;
  openPositions: Position[];
}

export const XAUUSDChart: React.FC<XAUUSDChartProps> = ({
  candles,
  timeframe,
  onTimeframeChange,
  indicators,
  currentPrice,
  openPositions,
}) => {
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const [showVWAP, setShowVWAP] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Layout measurements
  const height = 440;
  const paddingRight = 75;
  const paddingBottom = 40;
  const paddingTop = 25;
  const chartHeight = height - paddingBottom - paddingTop;
  const volumeHeight = 65;

  const visibleCandles = useMemo(() => {
    return candles.slice(-55); // Show last 55 candles for crisp spacing
  }, [candles]);

  const { minPrice, maxPrice, priceRange, maxVolume } = useMemo(() => {
    if (!visibleCandles.length) {
      return { minPrice: 2640, maxPrice: 2670, priceRange: 30, maxVolume: 1000 };
    }
    let min = Math.min(...visibleCandles.map((c) => c.low));
    let max = Math.max(...visibleCandles.map((c) => c.high));

    // Include indicators in min/max scale if enabled
    if (showBB && indicators.bollinger) {
      min = Math.min(min, indicators.bollinger.lower);
      max = Math.max(max, indicators.bollinger.upper);
    }

    const pad = Math.max((max - min) * 0.08, 1.5);
    const maxVol = Math.max(...visibleCandles.map((c) => c.volume), 10);
    return {
      minPrice: min - pad,
      maxPrice: max + pad,
      priceRange: max + pad - (min - pad),
      maxVolume: maxVol,
    };
  }, [visibleCandles, showBB, indicators]);

  const getY = (price: number) => {
    return paddingTop + (1 - (price - minPrice) / priceRange) * chartHeight;
  };

  const timeframes: Timeframe[] = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];

  const hoveredCandle = hoverIndex !== null && visibleCandles[hoverIndex] ? visibleCandles[hoverIndex] : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm">
      {/* Chart Top Toolbar */}
      <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white tracking-wide">XAUUSD</span>
            <span className="text-[10px] text-amber-400 font-mono font-semibold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
              OURO / SPOT
            </span>
          </div>

          {/* Timeframe selector tabs */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-0.5 rounded-lg border border-slate-800">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  timeframe === tf
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Indicators and view toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
              showEMA
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>EMA 9/21/50</span>
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
              showBB
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Bollinger (20,2)</span>
          </button>

          <button
            onClick={() => setShowVWAP(!showVWAP)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
              showVWAP
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>VWAP</span>
          </button>
        </div>
      </div>

      {/* Hover Information Bar */}
      <div className="px-4 py-1.5 bg-slate-950/80 border-b border-slate-800/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono">
        {hoveredCandle ? (
          <>
            <span className="text-slate-400">
              {new Date(hoveredCandle.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>Abertura: <b className="text-slate-200">{formatGoldPrice(hoveredCandle.open)}</b></span>
            <span>Máxima: <b className="text-emerald-400">{formatGoldPrice(hoveredCandle.high)}</b></span>
            <span>Mínima: <b className="text-rose-400">{formatGoldPrice(hoveredCandle.low)}</b></span>
            <span>Fechamento: <b className={hoveredCandle.close >= hoveredCandle.open ? 'text-emerald-400' : 'text-rose-400'}>{formatGoldPrice(hoveredCandle.close)}</b></span>
            <span>Vol: <b className="text-slate-300">{hoveredCandle.volume}</b></span>
          </>
        ) : (
          <>
            <span className="text-slate-400">XAUUSD Tempo Real:</span>
            <span>RSI(14): <b className={`tabular-nums ${indicators.rsi >= 70 ? 'text-rose-400' : indicators.rsi <= 30 ? 'text-emerald-400' : 'text-amber-400'}`}>{indicators.rsi}</b></span>
            <span>EMA 9: <b className="text-blue-400 tabular-nums">{formatGoldPrice(indicators.emaFast)}</b></span>
            <span>EMA 21: <b className="text-purple-400 tabular-nums">{formatGoldPrice(indicators.emaSlow)}</b></span>
            <span>VWAP: <b className="text-amber-400 tabular-nums">{formatGoldPrice(indicators.vwap)}</b></span>
          </>
        )}
      </div>

      {/* SVG Interactive Canvas */}
      <div ref={containerRef} className="relative w-full h-[440px] bg-slate-950 select-none">
        <svg
          className="w-full h-full"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const candleAreaWidth = rect.width - paddingRight;
            const step = candleAreaWidth / visibleCandles.length;
            const idx = Math.floor(mouseX / step);
            if (idx >= 0 && idx < visibleCandles.length) {
              setHoverIndex(idx);
            }
          }}
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const price = minPrice + ratio * priceRange;
            const y = getY(price);
            return (
              <g key={ratio}>
                <line
                  x1="0"
                  y1={y}
                  x2={`calc(100% - ${paddingRight}px)`}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={`calc(100% - ${paddingRight - 8}px)`}
                  y={y + 4}
                  className="fill-slate-500 font-mono text-[10px]"
                >
                  {formatGoldPrice(price)}
                </text>
              </g>
            );
          })}

          {/* Bollinger Bands Overlay */}
          {showBB && (
            <>
              <line
                x1="0"
                y1={getY(indicators.bollinger.upper)}
                x2={`calc(100% - ${paddingRight}px)`}
                y2={getY(indicators.bollinger.upper)}
                stroke="#a855f7"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                opacity="0.6"
              />
              <line
                x1="0"
                y1={getY(indicators.bollinger.lower)}
                x2={`calc(100% - ${paddingRight}px)`}
                y2={getY(indicators.bollinger.lower)}
                stroke="#a855f7"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                opacity="0.6"
              />
            </>
          )}

          {/* VWAP Overlay */}
          {showVWAP && (
            <line
              x1="0"
              y1={getY(indicators.vwap)}
              x2={`calc(100% - ${paddingRight}px)`}
              y2={getY(indicators.vwap)}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.8"
            />
          )}

          {/* Open Positions Levels */}
          {openPositions.map((pos) => {
            const posY = getY(pos.openPrice);
            const isBuy = pos.type === 'BUY';
            const color = isBuy ? '#10b981' : '#f43f5e';
            return (
              <g key={pos.ticket}>
                <line
                  x1="0"
                  y1={posY}
                  x2={`calc(100% - ${paddingRight}px)`}
                  y2={posY}
                  stroke={color}
                  strokeWidth="1.5"
                />
                <rect
                  x={`calc(100% - ${paddingRight - 2}px)`}
                  y={posY - 9}
                  width="70"
                  height="18"
                  rx="4"
                  fill={color}
                />
                <text
                  x={`calc(100% - ${paddingRight - 6}px)`}
                  y={posY + 4}
                  fill="#ffffff"
                  className="font-mono text-[9px] font-bold"
                >
                  {pos.type} {pos.volume}L
                </text>

                {/* Stop Loss Level if set */}
                {pos.sl > 0 && (
                  <line
                    x1="0"
                    y1={getY(pos.sl)}
                    x2={`calc(100% - ${paddingRight}px)`}
                    y2={getY(pos.sl)}
                    stroke="#ef4444"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Take Profit Level if set */}
                {pos.tp > 0 && (
                  <line
                    x1="0"
                    y1={getY(pos.tp)}
                    x2={`calc(100% - ${paddingRight}px)`}
                    y2={getY(pos.tp)}
                    stroke="#22c55e"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                )}
              </g>
            );
          })}

          {/* Candlesticks & Volume Bars */}
          {visibleCandles.map((candle, idx) => {
            const count = visibleCandles.length;
            const xPercent = (idx + 0.5) / count;
            const isBullish = candle.close >= candle.open;
            const color = isBullish ? '#10b981' : '#f43f5e';

            const candleHighY = getY(candle.high);
            const candleLowY = getY(candle.low);
            const candleOpenY = getY(candle.open);
            const candleCloseY = getY(candle.close);

            const bodyTop = Math.min(candleOpenY, candleCloseY);
            const bodyHeight = Math.max(Math.abs(candleCloseY - candleOpenY), 1.5);

            // Volume bar calculation
            const volBarHeight = (candle.volume / maxVolume) * volumeHeight;
            const volBarY = height - paddingBottom - volBarHeight;

            return (
              <g key={candle.time}>
                {/* Volume Bar */}
                <rect
                  x={`calc(${xPercent * 100}% - 4px)`}
                  y={volBarY}
                  width="7"
                  height={volBarHeight}
                  fill={isBullish ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}
                />

                {/* Candlestick Wick */}
                <line
                  x1={`calc(${xPercent * 100}%)`}
                  y1={candleHighY}
                  x2={`calc(${xPercent * 100}%)`}
                  y2={candleLowY}
                  stroke={color}
                  strokeWidth="1.2"
                />

                {/* Candlestick Body */}
                <rect
                  x={`calc(${xPercent * 100}% - 5px)`}
                  y={bodyTop}
                  width="10"
                  height={bodyHeight}
                  fill={color}
                  rx="1"
                />
              </g>
            );
          })}

          {/* Current Live Price Marker */}
          {(() => {
            const liveY = getY(currentPrice);
            return (
              <g>
                <line
                  x1="0"
                  y1={liveY}
                  x2={`calc(100% - ${paddingRight}px)`}
                  y2={liveY}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <rect
                  x={`calc(100% - ${paddingRight - 2}px)`}
                  y={liveY - 10}
                  width="72"
                  height="20"
                  rx="4"
                  fill="#f59e0b"
                />
                <text
                  x={`calc(100% - ${paddingRight - 6}px)`}
                  y={liveY + 4}
                  fill="#020617"
                  className="font-mono text-[10px] font-bold"
                >
                  {formatGoldPrice(currentPrice)}
                </text>
              </g>
            );
          })()}

          {/* Hover Crosshair */}
          {hoverIndex !== null && (
            <>
              <line
                x1={`calc(${(hoverIndex + 0.5) / visibleCandles.length * 100}%)`}
                y1="0"
                x2={`calc(${(hoverIndex + 0.5) / visibleCandles.length * 100}%)`}
                y2={height - paddingBottom}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};
