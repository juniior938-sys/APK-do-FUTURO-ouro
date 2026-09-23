import React, { useState, useMemo, useRef } from 'react';
import { Candle, ClosedTrade, Position } from '../types/mt5';
import { formatGoldPrice, formatUsd } from '../utils/goldMath';
import { ArrowUpRight, ArrowDownRight, Clock, Target, ShieldAlert, CheckCircle2, XCircle, Eye } from 'lucide-react';

export type TimeRangeHours = 24 | 12 | 6 | 1;
export type TradeFilterType = 'all' | 'buy' | 'sell' | 'win' | 'loss' | 'open';

interface TradesTimelineChartProps {
  candles: Candle[];
  closedTrades: ClosedTrade[];
  openPositions: Position[];
  currentPrice: number;
  selectedTicket?: number | null;
  onSelectTrade?: (ticket: number | null) => void;
}

interface HoveredTradeInfo {
  trade: ClosedTrade | Position;
  isOpen: boolean;
  x: number;
  y: number;
}

export const TradesTimelineChart: React.FC<TradesTimelineChartProps> = ({
  candles,
  closedTrades,
  openPositions,
  currentPrice,
  selectedTicket,
  onSelectTrade,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangeHours>(24);
  const [filterType, setFilterType] = useState<TradeFilterType>('all');
  const [hoveredTrade, setHoveredTrade] = useState<HoveredTradeInfo | null>(null);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; time: number; price: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Time window bounds
  const now = Date.now();
  const windowMs = timeRange * 60 * 60 * 1000;
  const minTime = now - windowMs;
  const maxTime = now;

  // Filter candles in window
  const activeCandles = useMemo(() => {
    return candles.filter((c) => c.time >= minTime - 15 * 60 * 1000 && c.time <= maxTime);
  }, [candles, minTime, maxTime]);

  // Price range calculation (Min and Max)
  const { minPrice, maxPrice } = useMemo(() => {
    let min = currentPrice - 2.0;
    let max = currentPrice + 2.0;

    activeCandles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    });

    closedTrades.forEach((t) => {
      const tTime = t.closeTimestamp || t.openTimestamp || 0;
      if (tTime >= minTime) {
        if (t.openPrice < min) min = t.openPrice;
        if (t.openPrice > max) max = t.openPrice;
        if (t.closePrice < min) min = t.closePrice;
        if (t.closePrice > max) max = t.closePrice;
      }
    });

    openPositions.forEach((p) => {
      const pTime = p.openTimestamp || minTime;
      if (pTime >= minTime) {
        if (p.openPrice < min) min = p.openPrice;
        if (p.openPrice > max) max = p.openPrice;
      }
    });

    const padding = (max - min) * 0.12 || 2.0;
    return {
      minPrice: Math.floor((min - padding) * 10) / 10,
      maxPrice: Math.ceil((max + padding) * 10) / 10,
    };
  }, [activeCandles, closedTrades, openPositions, currentPrice, minTime]);

  // Coordinate mapping functions (Width: 1000, Height: 360)
  const chartW = 1000;
  const chartH = 360;
  const padL = 20;
  const padR = 65; // room for right price axis
  const padT = 25;
  const padB = 40; // room for time axis

  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const timeToX = (time: number) => {
    const ratio = Math.max(0, Math.min(1, (time - minTime) / (maxTime - minTime)));
    return padL + ratio * plotW;
  };

  const priceToY = (price: number) => {
    const ratio = (price - minPrice) / (maxPrice - minPrice || 1);
    return padT + (1 - Math.max(0, Math.min(1, ratio))) * plotH;
  };

  const xToTime = (x: number) => {
    const ratio = Math.max(0, Math.min(1, (x - padL) / plotW));
    return minTime + ratio * (maxTime - minTime);
  };

  const yToPrice = (y: number) => {
    const ratio = 1 - Math.max(0, Math.min(1, (y - padT) / plotH));
    return minPrice + ratio * (maxPrice - minPrice);
  };

  // Build continuous price polyline & gradient area
  const { pathD, areaD } = useMemo(() => {
    if (activeCandles.length === 0) return { pathD: '', areaD: '' };

    const points = activeCandles.map((c) => ({
      x: timeToX(c.time),
      y: priceToY(c.close),
    }));

    // Append current live price at now
    points.push({
      x: timeToX(now),
      y: priceToY(currentPrice),
    });

    const pathString = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
    const areaString = `${pathString} L ${timeToX(now).toFixed(1)},${(padT + plotH).toFixed(1)} L ${timeToX(minTime).toFixed(1)},${(padT + plotH).toFixed(1)} Z`;

    return { pathD: pathString, areaD: areaString };
  }, [activeCandles, currentPrice, minTime, maxTime, minPrice, maxPrice]);

  // Horizontal Grid Lines (5 steps)
  const priceGrid = useMemo(() => {
    const count = 5;
    const step = (maxPrice - minPrice) / count;
    const lines = [];
    for (let i = 0; i <= count; i++) {
      const p = minPrice + i * step;
      lines.push({
        price: p,
        y: priceToY(p),
      });
    }
    return lines;
  }, [minPrice, maxPrice]);

  // Vertical Time Grid Lines
  const timeGrid = useMemo(() => {
    const intervals = timeRange === 24 ? 6 : timeRange === 12 ? 4 : timeRange === 6 ? 6 : 4;
    const stepMs = windowMs / intervals;
    const marks = [];
    for (let i = 0; i <= intervals; i++) {
      const t = minTime + i * stepMs;
      const date = new Date(t);
      const label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      marks.push({
        time: t,
        x: timeToX(t),
        label,
      });
    }
    return marks;
  }, [minTime, windowMs, timeRange]);

  // Filtered closed trades
  const visibleClosedTrades = useMemo(() => {
    return closedTrades.filter((t) => {
      const closeT = t.closeTimestamp || t.openTimestamp || 0;
      if (closeT < minTime) return false;

      if (filterType === 'buy') return t.type === 'BUY';
      if (filterType === 'sell') return t.type === 'SELL';
      if (filterType === 'win') return t.profit > 0;
      if (filterType === 'loss') return t.profit < 0;
      if (filterType === 'open') return false;
      return true;
    });
  }, [closedTrades, minTime, filterType]);

  // Filtered open positions
  const visibleOpenPositions = useMemo(() => {
    if (filterType === 'win' || filterType === 'loss') return [];
    if (filterType === 'buy') return openPositions.filter((p) => p.type === 'BUY');
    if (filterType === 'sell') return openPositions.filter((p) => p.type === 'SELL');
    return openPositions;
  }, [openPositions, filterType]);

  // Handle Chart Mouse Move for Crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * chartW;
    const svgY = ((e.clientY - rect.top) / rect.height) * chartH;

    if (svgX >= padL && svgX <= padL + plotW && svgY >= padT && svgY <= padT + plotH) {
      setCrosshair({
        x: svgX,
        y: svgY,
        time: xToTime(svgX),
        price: yToPrice(svgY),
      });
    } else {
      setCrosshair(null);
    }
  };

  const handleMouseLeave = () => {
    setCrosshair(null);
    setHoveredTrade(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Control Bar: Timeframe Zoom & Trade Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/90 px-4 py-2.5 rounded-xl">
        {/* Trade Filter Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-slate-400 font-medium mr-1.5 hidden sm:inline">Exibir:</span>
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'win', label: 'Lucros' },
              { id: 'loss', label: 'Perdas' },
              { id: 'buy', label: 'Compras (BUY)' },
              { id: 'sell', label: 'Vendas (SELL)' },
              { id: 'open', label: 'Abertas' },
            ] as { id: TradeFilterType; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filterType === tab.id
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Time Window Zoom: 24h, 12h, 6h, 1h */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
          {([24, 12, 6, 1] as TimeRangeHours[]).map((hr) => (
            <button
              key={hr}
              type="button"
              onClick={() => setTimeRange(hr)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                timeRange === hr
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {hr}H
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div
        ref={containerRef}
        className="relative bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden select-none"
      >
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full h-auto block cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Price area fill gradient */}
            <linearGradient id="priceAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
              <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing filter for active positions */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Grid Lines (Horizontal Prices) */}
          {priceGrid.map((grid, i) => (
            <g key={`pgrid-${i}`}>
              <line
                x1={padL}
                y1={grid.y}
                x2={padL + plotW}
                y2={grid.y}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2,3"
              />
              <text
                x={padL + plotW + 8}
                y={grid.y + 3.5}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
                className="tabular-nums"
              >
                ${grid.price.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Background Grid Lines (Vertical Time) */}
          {timeGrid.map((grid, i) => (
            <g key={`tgrid-${i}`}>
              <line
                x1={grid.x}
                y1={padT}
                x2={grid.x}
                y2={padT + plotH}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2,3"
              />
              <text
                x={grid.x}
                y={padT + plotH + 18}
                fill="#64748b"
                fontSize="10"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {grid.label}
              </text>
            </g>
          ))}

          {/* Area Fill under Gold Price */}
          {areaD && <path d={areaD} fill="url(#priceAreaGrad)" />}

          {/* Continuous Gold Price Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Current Live Price Horizontal Guideline */}
          <line
            x1={padL}
            y1={priceToY(currentPrice)}
            x2={padL + plotW}
            y2={priceToY(currentPrice)}
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.6"
          />
          {/* Current Price Axis Tag */}
          <g transform={`translate(${padL + plotW}, ${priceToY(currentPrice)})`}>
            <rect x="0" y="-10" width="58" height="20" fill="#f59e0b" rx="4" />
            <text x="29" y="3.5" fill="#020617" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {currentPrice.toFixed(2)}
            </text>
          </g>

          {/* PLOTTED CLOSED TRADES: Connecting Lines and Entry/Exit Dots */}
          {visibleClosedTrades.map((trade) => {
            const openT = trade.openTimestamp || (trade.closeTimestamp ? trade.closeTimestamp - 10 * 60 * 1000 : minTime);
            const closeT = trade.closeTimestamp || (trade.openTimestamp ? trade.openTimestamp + 10 * 60 * 1000 : now);

            const xOpen = timeToX(openT);
            const yOpen = priceToY(trade.openPrice);
            const xClose = timeToX(closeT);
            const yClose = priceToY(trade.closePrice);

            const isWin = trade.profit > 0;
            const isSelected = selectedTicket === trade.ticket;
            const tradeColor = isWin ? '#10b981' : '#f43f5e'; // emerald vs rose

            return (
              <g
                key={`trade-${trade.ticket}`}
                className="cursor-pointer transition-opacity"
                onClick={() => onSelectTrade && onSelectTrade(trade.ticket)}
                onMouseEnter={() => setHoveredTrade({ trade, isOpen: false, x: xClose, y: yClose })}
              >
                {/* Connecting Trade Trajectory Line */}
                <line
                  x1={xOpen}
                  y1={yOpen}
                  x2={xClose}
                  y2={yClose}
                  stroke={tradeColor}
                  strokeWidth={isSelected ? '2.8' : '1.5'}
                  strokeDasharray={trade.type === 'BUY' ? 'none' : '3,2'}
                  opacity={isSelected ? '1' : '0.75'}
                />

                {/* Entry Marker Dot */}
                <circle
                  cx={xOpen}
                  cy={yOpen}
                  r={isSelected ? 4.5 : 3}
                  fill={trade.type === 'BUY' ? '#10b981' : '#f43f5e'}
                  stroke="#020617"
                  strokeWidth="1.2"
                />

                {/* Exit Marker Circle with Outcome Accent */}
                <circle
                  cx={xClose}
                  cy={yClose}
                  r={isSelected ? 6.5 : 4.5}
                  fill={tradeColor}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? '2.5' : '1.2'}
                />

                {/* Selection Halo */}
                {isSelected && (
                  <circle
                    cx={xClose}
                    cy={yClose}
                    r="12"
                    fill="none"
                    stroke={tradeColor}
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                  />
                )}
              </g>
            );
          })}

          {/* PLOTTED OPEN POSITIONS: Active Glowing Rings & Live Extension Line */}
          {visibleOpenPositions.map((pos) => {
            const openT = pos.openTimestamp || minTime;
            const xOpen = timeToX(openT);
            const yOpen = priceToY(pos.openPrice);
            const xLive = timeToX(now);
            const yLive = priceToY(currentPrice);

            const isSelected = selectedTicket === pos.ticket;
            const isFloatingProfit = pos.profit >= 0;
            const posColor = isFloatingProfit ? '#10b981' : '#f43f5e';

            return (
              <g
                key={`pos-${pos.ticket}`}
                className="cursor-pointer"
                onClick={() => onSelectTrade && onSelectTrade(pos.ticket)}
                onMouseEnter={() => setHoveredTrade({ trade: pos, isOpen: true, x: xOpen, y: yOpen })}
              >
                {/* Dotted line to current live price */}
                <line
                  x1={xOpen}
                  y1={yOpen}
                  x2={xLive}
                  y2={yLive}
                  stroke={posColor}
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                  opacity="0.8"
                />

                {/* Open Entry Dot */}
                <circle
                  cx={xOpen}
                  cy={yOpen}
                  r={isSelected ? 6 : 4.5}
                  fill={pos.type === 'BUY' ? '#10b981' : '#f43f5e'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Pulsing Outer Glow */}
                <circle
                  cx={xOpen}
                  cy={yOpen}
                  r="9"
                  fill="none"
                  stroke={posColor}
                  strokeWidth="1.5"
                  opacity="0.85"
                  filter="url(#glow)"
                >
                  <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}

          {/* CROSSHAIR: Vertical Line and Value Badges */}
          {crosshair && (
            <g pointerEvents="none">
              {/* Vertical line */}
              <line
                x1={crosshair.x}
                y1={padT}
                x2={crosshair.x}
                y2={padT + plotH}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              {/* Horizontal line */}
              <line
                x1={padL}
                y1={crosshair.y}
                x2={padL + plotW}
                y2={crosshair.y}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="3,3"
              />

              {/* Time Badge at Bottom */}
              <g transform={`translate(${crosshair.x}, ${padT + plotH + 2})`}>
                <rect x="-35" y="0" width="70" height="18" fill="#1e293b" rx="4" stroke="#475569" strokeWidth="1" />
                <text x="0" y="12" fill="#e2e8f0" fontSize="9.5" textAnchor="middle" fontFamily="sans-serif">
                  {new Date(crosshair.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </text>
              </g>

              {/* Price Badge on Right Axis */}
              <g transform={`translate(${padL + plotW + 2}, ${crosshair.y})`}>
                <rect x="0" y="-9" width="56" height="18" fill="#1e293b" rx="4" stroke="#475569" strokeWidth="1" />
                <text x="28" y="3.5" fill="#e2e8f0" fontSize="9.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                  {crosshair.price.toFixed(2)}
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* FLOATING HOVER INSPECTION TOOLTIP CARD */}
        {hoveredTrade && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 border border-slate-700 shadow-xl rounded-xl p-3 text-xs w-64 backdrop-blur-md transition-all transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(hoveredTrade.x / chartW) * 100}%`,
              top: `${(hoveredTrade.y / chartH) * 100}%`,
            }}
          >
            {/* Header: Ticket & Side */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                {hoveredTrade.trade.type === 'BUY' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5" /> BUY
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-bold">
                    <ArrowDownRight className="w-3.5 h-3.5" /> SELL
                  </span>
                )}
                <span className="text-slate-400 font-mono">#{hoveredTrade.trade.ticket}</span>
              </div>

              {hoveredTrade.isOpen ? (
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 animate-pulse">
                  Posição Aberta
                </span>
              ) : (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                    hoveredTrade.trade.profit >= 0
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {(hoveredTrade.trade as ClosedTrade).reason || 'FECHADA'}
                </span>
              )}
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Lotes / Volume:</span>
                <span className="text-slate-200 font-bold">{hoveredTrade.trade.volume.toFixed(2)} lotes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Entrada:</span>
                <span className="text-slate-200">${hoveredTrade.trade.openPrice.toFixed(2)}</span>
              </div>
              {!hoveredTrade.isOpen && 'closePrice' in hoveredTrade.trade && (
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Saída:</span>
                  <span className="text-slate-200">${(hoveredTrade.trade as ClosedTrade).closePrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-800/80 pt-1.5">
                <span className="text-slate-400 font-sans">Resultado PnL:</span>
                <span
                  className={`font-bold ${
                    hoveredTrade.trade.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatUsd(hoveredTrade.trade.profit, true)}
                </span>
              </div>
              {'pips' in hoveredTrade.trade && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400 font-sans">Variação:</span>
                  <span className="text-slate-300">
                    {(hoveredTrade.trade.pips || 0) >= 0 ? '+' : ''}
                    {(hoveredTrade.trade.pips || 0).toFixed(1)} pips
                  </span>
                </div>
              )}
              {'durationSeconds' in hoveredTrade.trade && (hoveredTrade.trade as ClosedTrade).durationSeconds && (
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="font-sans">Duração:</span>
                  <span>{Math.round((hoveredTrade.trade as ClosedTrade).durationSeconds! / 60)} min</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Summary Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 px-1">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Trade com Lucro (Gain)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span>Trade com Perda (Loss)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/40 inline-block"></span>
            <span>Posição Ativa (Flutuante)</span>
          </div>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          XAUUSD · M15 Microestrutura · Fuso Local
        </div>
      </div>
    </div>
  );
};
