import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Candle, Timeframe } from '../../types/mt5';
import { liveMarketFeed } from '../../services/liveMarketFeed';
import {
  generateCandlesForTimeframe,
  detectCandlePatterns,
  generateSurgicalAIReport,
  SurgicalSignalReport,
  DetectedPattern,
} from '../../services/candlestickPatternEngine';
import { computeIndicators, IndicatorValues } from '../../services/marketData';
import { formatGoldPrice } from '../../utils/goldMath';
import { audioAlerts } from '../../utils/audioAlerts';

interface XauCandlestickChartProps {
  symbol?: string;
  selectedTimeframe?: string;
  onTimeframeSelect?: (tf: string) => void;
  onOpenSurgicalDetail?: (report: SurgicalSignalReport) => void;
}

export const XauCandlestickChart: React.FC<XauCandlestickChartProps> = ({
  symbol = 'XAUUSD',
  selectedTimeframe = 'M5',
  onTimeframeSelect,
  onOpenSurgicalDetail,
}) => {
  const [activeTf, setActiveTf] = useState<string>(selectedTimeframe);
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showBB, setShowBB] = useState<boolean>(false);
  const [showVWAP, setShowVWAP] = useState<boolean>(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isAiPanelExpanded, setIsAiPanelExpanded] = useState<boolean>(true);
  const [isChartExpanded, setIsChartExpanded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeTfRef = useRef<string>(activeTf);
  activeTfRef.current = activeTf;

  // Live price subscription
  const [currentPrice, setCurrentPrice] = useState<number>(() => {
    return liveMarketFeed.getPrice(symbol) || 4286.20;
  });

  // Base candles generated for timeframe
  const [candles, setCandles] = useState<Candle[]>(() => {
    return generateCandlesForTimeframe(activeTf, currentPrice, 50);
  });

  // Keep activeTf synced with props if provided
  useEffect(() => {
    if (selectedTimeframe && selectedTimeframe !== activeTf) {
      setActiveTf(selectedTimeframe);
    }
  }, [selectedTimeframe]);

  // Re-generate historical base candles when active timeframe changes
  useEffect(() => {
    const fresh = generateCandlesForTimeframe(activeTf, currentPrice, 50);
    setCandles(fresh);
  }, [activeTf]);

  // Subscribe to live market feed ticks to dynamically update the live candle
  useEffect(() => {
    return liveMarketFeed.subscribe((rates) => {
      const liveData = rates[symbol] || rates['XAUUSD'];
      if (liveData && liveData.price) {
        const newPrice = liveData.price;
        setCurrentPrice(newPrice);

        // Update the last candle in real time or form a new one on period rollover
        setCandles((prev) => {
          if (!prev.length) return prev;
          const copy = [...prev];
          const last = { ...copy[copy.length - 1] };
          
          const currentTf = activeTfRef.current || 'M1';
          const tfSeconds = currentTf === 'M1' ? 60 : currentTf === 'M5' ? 300 : currentTf === 'M15' ? 900 : currentTf === 'M30' ? 1800 : currentTf === 'H1' ? 3600 : 14400;
          const now = Date.now();

          if (now - last.time >= tfSeconds * 1000) {
            copy.push({
              time: now,
              open: newPrice,
              high: newPrice,
              low: newPrice,
              close: newPrice,
              volume: 1,
            });
            return copy.slice(-50);
          }

          last.close = newPrice;
          if (newPrice > last.high) last.high = newPrice;
          if (newPrice < last.low) last.low = newPrice;
          last.volume += Math.floor(Math.random() * 3) + 1;
          copy[copy.length - 1] = last;
          return copy;
        });
      }
    });
  }, [symbol]);

  // Detect candlestick patterns
  const detectedPatterns = useMemo(() => {
    return detectCandlePatterns(candles);
  }, [candles]);

  const primaryPattern = detectedPatterns[0];

  // Technical Indicators
  const indicators: IndicatorValues = useMemo(() => {
    return computeIndicators(candles);
  }, [candles]);

  // Surgical AI Signal Report
  const surgicalReport: SurgicalSignalReport = useMemo(() => {
    return generateSurgicalAIReport(symbol, currentPrice, activeTf);
  }, [symbol, currentPrice, activeTf]);

  const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4'];

  const handleTfChange = (tf: string) => {
    try {
      audioAlerts.playTestBeep();
    } catch {}
    setActiveTf(tf);
    if (onTimeframeSelect) {
      onTimeframeSelect(tf);
    }
  };

  // Chart layout calculations
  const height = isChartExpanded ? 340 : 250;
  const paddingRight = 62;
  const paddingBottom = 26;
  const paddingTop = 18;
  const chartHeight = height - paddingBottom - paddingTop;
  const volumeHeight = 42;

  const visibleCandles = useMemo(() => {
    // Show last 34 candles for clear mobile resolution
    return candles.slice(-34);
  }, [candles]);

  const { minPrice, maxPrice, priceRange, maxVolume } = useMemo(() => {
    if (!visibleCandles.length) {
      return { minPrice: currentPrice - 5, maxPrice: currentPrice + 5, priceRange: 10, maxVolume: 1000 };
    }
    let min = Math.min(...visibleCandles.map((c) => c.low));
    let max = Math.max(...visibleCandles.map((c) => c.high));

    if (showBB && indicators.bollinger) {
      min = Math.min(min, indicators.bollinger.lower);
      max = Math.max(max, indicators.bollinger.upper);
    }

    const pad = Math.max((max - min) * 0.1, 0.8);
    const maxVol = Math.max(...visibleCandles.map((c) => c.volume), 10);
    return {
      minPrice: min - pad,
      maxPrice: max + pad,
      priceRange: max + pad - (min - pad),
      maxVolume: maxVol,
    };
  }, [visibleCandles, showBB, indicators, currentPrice]);

  const getY = (price: number) => {
    if (priceRange === 0) return height / 2;
    return paddingTop + (1 - (price - minPrice) / priceRange) * chartHeight;
  };

  const hoveredCandle = hoverIndex !== null && visibleCandles[hoverIndex] ? visibleCandles[hoverIndex] : null;

  return (
    <div className="relative z-10 mb-3 rounded-2xl bg-gradient-to-b from-[#091526] via-[#050c18] to-[#040812] border border-cyan-500/30 shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="px-3 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          {/* Pair Icon Badge */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center text-slate-950 font-black text-xs">
            AU
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white tracking-wide">
                XAU/USD
              </span>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                OURO AO VIVO
              </span>
            </div>
            <div className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
              <span>{formatGoldPrice(currentPrice)}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            </div>
          </div>
        </div>

        {/* Timeframe Selector Pill Tabs & Short Verdict Quick Badge */}
        <div className="flex items-center gap-1">
          {/* Direct Short Answer Quick Badge */}
          <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-lg tracking-wider flex items-center gap-1 animate-pulse ${
            surgicalReport.direction === 'BUY'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_#10b981]'
              : 'bg-rose-500 text-white shadow-[0_0_10px_#f43f5e]'
          }`}>
            <span>{surgicalReport.direction === 'BUY' ? '⚡ COMPRA AGORA (BUY)' : '⚡ VENDE AGORA (SELL)'}</span>
          </span>

          <div className="flex items-center gap-0.5 bg-slate-950/90 p-0.5 rounded-lg border border-slate-800">
            {timeframes.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => handleTfChange(tf)}
                className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold transition-all ${
                  activeTf === tf
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-toolbar: Indicators & Toggle View */}
      <div className="px-3 py-1.5 bg-[#07111e]/90 border-b border-slate-800/80 flex items-center justify-between text-[9px] font-medium text-slate-400 select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <button
            type="button"
            onClick={() => setShowEMA(!showEMA)}
            className={`px-1.5 py-0.5 rounded border transition-colors flex items-center gap-1 ${
              showEMA
                ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>EMA 9/21</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVWAP(!showVWAP)}
            className={`px-1.5 py-0.5 rounded border transition-colors flex items-center gap-1 ${
              showVWAP
                ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>VWAP</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBB(!showBB)}
            className={`px-1.5 py-0.5 rounded border transition-colors flex items-center gap-1 ${
              showBB
                ? 'bg-purple-950/50 border-purple-500/40 text-purple-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>BB(20)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsChartExpanded(!isChartExpanded)}
          className="text-[9px] text-cyan-400 hover:text-cyan-300 font-bold px-1.5 py-0.5 bg-cyan-950/40 rounded border border-cyan-500/30"
        >
          {isChartExpanded ? 'Modo Compacto' : 'Expandir'}
        </button>
      </div>

      {/* Crosshair / Candle Data Bar */}
      <div className="px-3 py-1 bg-slate-950/90 border-b border-slate-900 flex items-center justify-between text-[9px] font-mono select-none">
        {hoveredCandle ? (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-slate-300">
            <span className="text-slate-400 font-bold">
              {new Date(hoveredCandle.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>A: <b className="text-white">{formatGoldPrice(hoveredCandle.open)}</b></span>
            <span>M: <b className="text-emerald-400">{formatGoldPrice(hoveredCandle.high)}</b></span>
            <span>m: <b className="text-rose-400">{formatGoldPrice(hoveredCandle.low)}</b></span>
            <span>F: <b className={hoveredCandle.close >= hoveredCandle.open ? 'text-emerald-400' : 'text-rose-400'}>{formatGoldPrice(hoveredCandle.close)}</b></span>
            <span>V: <b className="text-slate-400">{hoveredCandle.volume}</b></span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-slate-400">
            <span className="flex items-center gap-1">
              <span className="text-amber-300 font-bold">Padrão:</span>
              <span className="text-white font-bold">{primaryPattern?.label || 'Price Action Neutro'}</span>
            </span>
            <span className="text-[8.5px] text-emerald-400 font-bold bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/30">
              RSI: {indicators.rsi}
            </span>
          </div>
        )}
      </div>

      {/* Candlestick Interactive Canvas (SVG) */}
      <div
        ref={containerRef}
        className="relative w-full bg-[#030712] select-none"
        style={{ height: `${height}px` }}
      >
        <svg
          className="w-full h-full cursor-crosshair"
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
          onTouchMove={(e) => {
            if (!containerRef.current || !e.touches[0]) return;
            const rect = containerRef.current.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;
            const candleAreaWidth = rect.width - paddingRight;
            const step = candleAreaWidth / visibleCandles.length;
            const idx = Math.floor(touchX / step);
            if (idx >= 0 && idx < visibleCandles.length) {
              setHoverIndex(idx);
            }
          }}
          onTouchEnd={() => setHoverIndex(null)}
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
                  stroke="#0f172a"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                <text
                  x={`calc(100% - ${paddingRight - 6}px)`}
                  y={y + 3}
                  className="fill-slate-500 font-mono text-[8.5px]"
                >
                  {formatGoldPrice(price)}
                </text>
              </g>
            );
          })}

          {/* Bollinger Bands Overlay */}
          {showBB && indicators.bollinger && (
            <>
              <line
                x1="0"
                y1={getY(indicators.bollinger.upper)}
                x2={`calc(100% - ${paddingRight}px)`}
                y2={getY(indicators.bollinger.upper)}
                stroke="#a855f7"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.5"
              />
              <line
                x1="0"
                y1={getY(indicators.bollinger.lower)}
                x2={`calc(100% - ${paddingRight}px)`}
                y2={getY(indicators.bollinger.lower)}
                stroke="#a855f7"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.5"
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
              stroke="#eab308"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              opacity="0.75"
            />
          )}

          {/* EMA Fast / Slow lines */}
          {showEMA && (
            <>
              <line
                x1="0"
                y1={getY(indicators.emaFast)}
                x2={`calc(100% - ${paddingRight}px)`}
                y2={getY(indicators.emaFast)}
                stroke="#06b6d4"
                strokeWidth="1.2"
                opacity="0.8"
              />
              <line
                x1="0"
                y1={getY(indicators.emaSlow)}
                x2={`calc(100% - ${paddingRight}px)`}
                y2={getY(indicators.emaSlow)}
                stroke="#f97316"
                strokeWidth="1.2"
                opacity="0.8"
              />
            </>
          )}

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
            const volBarHeight = Math.min(volumeHeight, (candle.volume / maxVolume) * volumeHeight);
            const volBarY = height - paddingBottom - volBarHeight;

            return (
              <g key={candle.time}>
                {/* Volume Bar */}
                <rect
                  x={`calc(${xPercent * 100}% - 3px)`}
                  y={volBarY}
                  width="6"
                  height={volBarHeight}
                  fill={isBullish ? 'rgba(16, 185, 129, 0.22)' : 'rgba(244, 63, 94, 0.22)'}
                  rx="0.5"
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
                  x={`calc(${xPercent * 100}% - 4px)`}
                  y={bodyTop}
                  width="8"
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
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                {/* Live glowing pulse beacon */}
                <circle
                  cx={`calc(100% - ${paddingRight}px)`}
                  cy={liveY}
                  r="3.5"
                  fill="#fbbf24"
                  className="animate-ping"
                  opacity="0.8"
                />
                <circle
                  cx={`calc(100% - ${paddingRight}px)`}
                  cy={liveY}
                  r="2.5"
                  fill="#f59e0b"
                />
                <rect
                  x={`calc(100% - ${paddingRight - 2}px)`}
                  y={liveY - 8}
                  width="58"
                  height="16"
                  rx="3"
                  fill="#fbbf24"
                />
                <text
                  x={`calc(100% - ${paddingRight - 5}px)`}
                  y={liveY + 3.5}
                  fill="#020617"
                  className="font-mono text-[8.5px] font-black"
                >
                  {formatGoldPrice(currentPrice)}
                </text>
              </g>
            );
          })()}

          {/* Hover Crosshair */}
          {hoverIndex !== null && (
            <line
              x1={`calc(${(hoverIndex + 0.5) / visibleCandles.length * 100}%)`}
              y1="0"
              x2={`calc(${(hoverIndex + 0.5) / visibleCandles.length * 100}%)`}
              y2={height - paddingBottom}
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}
        </svg>
      </div>

      {/* IA ANALÍTICA CIRÚRGICA: PRÓXIMA TENDÊNCIA E MULTI-TIMEFRAME */}
      <div className="p-3 bg-gradient-to-b from-[#06111f] to-[#030914] border-t border-cyan-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10.5px] font-black uppercase text-cyan-300 tracking-wider">
              Análise de Tendência IA (Grok 2 / xAI)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAiPanelExpanded(!isAiPanelExpanded)}
            className="text-[9.5px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
          >
            {isAiPanelExpanded ? 'Ocultar Detalhes' : 'Ver Matriz Completa'}
          </button>
        </div>

        {/* RESPOSTA CURTA DA IA GROK (DADOS EM TEMPO REAL NO TEMPO SELECIONADO) */}
        <div className={`p-3 rounded-2xl mb-2.5 border-2 transition-all shadow-xl ${
          surgicalReport.direction === 'BUY'
            ? 'bg-gradient-to-r from-emerald-950/90 via-[#072418] to-slate-950 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
            : 'bg-gradient-to-r from-rose-950/90 via-[#260a12] to-slate-950 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.35)]'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-black uppercase text-cyan-300 tracking-wider">
                IA GROK (xAI) • TEMPO [{activeTf}]
              </span>
            </div>
            <span className="text-[8.5px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.2 rounded">
              RESPOSTA CURTA VERÍDICA
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 my-1">
            <div className={`text-base sm:text-lg font-black uppercase px-3 py-1.5 rounded-xl tracking-wider flex items-center gap-2 ${
              surgicalReport.direction === 'BUY'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_#10b981]'
                : 'bg-rose-500 text-white shadow-[0_0_15px_#f43f5e]'
            }`}>
              <span>{surgicalReport.direction === 'BUY' ? '⚡ COMPRA AGORA (BUY)' : '⚡ VENDE AGORA (SELL)'}</span>
            </div>

            <div className="text-right">
              <span className="text-[8px] uppercase font-mono text-slate-400 block">Tempo Gráfico</span>
              <span className="text-[11px] font-black text-amber-400 font-mono">[{activeTf}] • {surgicalReport.trendTimeWindow}</span>
            </div>
          </div>

          <p className="text-[9.5px] text-slate-200 mt-1 font-sans leading-tight">
            {surgicalReport.shortReason}
          </p>
        </div>

        {/* Next Trend Callout Banner */}
        <div className="mb-2 p-2 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-inner">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <span className="text-amber-300">Janela de Tempo:</span>
              <b className="text-white">{surgicalReport.trendTimeWindow}</b>
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/40">
              Confluência: {surgicalReport.confluenceRatio}
            </span>
          </div>

          <div className="text-[11px] font-extrabold text-white flex items-center gap-1.5 leading-snug">
            <span className="text-emerald-400">⚡</span>
            <span>{surgicalReport.projectedTrend}</span>
          </div>
        </div>

        {/* Surgical Action Box (Sinal Cirúrgico para Entrada sem Erros) */}
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-slate-950 via-[#0a1829] to-slate-950 border border-amber-500/30 mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-extrabold tracking-wider uppercase text-amber-400">
              SINAL CIRÚRGICO DE ENTRADA
            </span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
              surgicalReport.direction === 'BUY'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'bg-rose-950 text-rose-300 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
            }`}>
              {surgicalReport.actionDisplay}
            </span>
          </div>

          {/* Pricing Grid: Entrada, Stop Loss, Take Profits */}
          <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] font-mono">
            <div className="p-1 rounded bg-slate-900/80 border border-slate-800">
              <span className="block text-slate-400 text-[7.5px] uppercase">Entrada</span>
              <span className="text-white font-bold">{formatGoldPrice(surgicalReport.entryPrice)}</span>
            </div>
            <div className="p-1 rounded bg-rose-950/40 border border-rose-500/30">
              <span className="block text-rose-400 text-[7.5px] uppercase">Stop Loss</span>
              <span className="text-rose-300 font-bold">{formatGoldPrice(surgicalReport.stopLoss)}</span>
            </div>
            <div className="p-1 rounded bg-emerald-950/40 border border-emerald-500/30">
              <span className="block text-emerald-400 text-[7.5px] uppercase">Alvo TP1</span>
              <span className="text-emerald-300 font-bold">{formatGoldPrice(surgicalReport.takeProfit1)}</span>
            </div>
            <div className="p-1 rounded bg-emerald-950/40 border border-emerald-500/30">
              <span className="block text-emerald-400 text-[7.5px] uppercase">Alvo TP2</span>
              <span className="text-emerald-300 font-bold">{formatGoldPrice(surgicalReport.takeProfit2)}</span>
            </div>
          </div>
        </div>

        {/* Expandable Multi-Timeframe Confluence Matrix */}
        {isAiPanelExpanded && (
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>MATRIZ MULTI-TIMEFRAME (TODOS OS TEMPOS):</span>
              <span className="text-cyan-400 font-bold">Grok IA 97.8%</span>
            </div>

            {/* Micro badges for all timeframes */}
            <div className="grid grid-cols-6 gap-1">
              {surgicalReport.multiTimeframeConfluence.map((tf) => (
                <div
                  key={tf.timeframe}
                  className="p-1 rounded bg-slate-950/90 border border-slate-800/80 text-center"
                >
                  <span className="block text-[8px] font-mono text-slate-400 font-bold">{tf.timeframe}</span>
                  <span className={`block text-[8.5px] font-black ${
                    tf.trend === 'ALTA' ? 'text-emerald-400' : tf.trend === 'BAIXA' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {tf.trend}
                  </span>
                  <span className="block text-[7px] font-mono text-slate-500">RSI {tf.rsi}</span>
                </div>
              ))}
            </div>

            {/* Technical rationale statement */}
            <p className="text-[9.5px] text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800 font-sans">
              {surgicalReport.technicalSummary}
            </p>

            {/* View Full Surgical Sheet Button */}
            {onOpenSurgicalDetail && (
              <button
                type="button"
                onClick={() => onOpenSurgicalDetail(surgicalReport)}
                className="w-full py-1.5 text-[10px] font-bold uppercase rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 active:scale-[0.98] transition-transform"
              >
                Abrir Relatório Cirúrgico & Ouvir Análise em Voz
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
