import React, { useEffect, useState, useRef, memo } from 'react';
import { liveMarketFeed, LivePriceData, RatesMap } from '../../services/liveMarketFeed';

interface TickerPillProps {
  symbol: string;
  label: string;
  colorClass: string;
  dotColorClass: string;
  showOnMobile?: boolean;
}

const TickerPill: React.FC<TickerPillProps> = memo(({
  symbol,
  label,
  colorClass,
  dotColorClass,
  showOnMobile = true,
}) => {
  const [data, setData] = useState<LivePriceData>(() => liveMarketFeed.getRate(symbol));
  const prevPriceRef = useRef<number>(data.price);

  useEffect(() => {
    // Subscribe directly to liveMarketFeed
    return liveMarketFeed.subscribe((rates: RatesMap) => {
      const item = rates[symbol] || rates[symbol.replace('.pc', '')];
      if (item && item.price !== prevPriceRef.current) {
        prevPriceRef.current = item.price;
        // Schedule update using requestAnimationFrame to prevent layout thrashing and lower CPU usage
        requestAnimationFrame(() => {
          setData(item);
        });
      }
    });
  }, [symbol]);

  const isUp = data.direction === 'up';
  const isDown = data.direction === 'down';

  return (
    <div
      className={`${
        showOnMobile ? 'flex' : 'hidden md:flex'
      } items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs shadow-sm hover:border-slate-700 transition-colors`}
    >
      <span className={`font-bold ${colorClass}`}>{label}</span>
      <span className="font-mono font-bold text-white tabular-nums tracking-tight">
        {data.formatted}
      </span>
      <span
        className={`w-2 h-2 rounded-full ${
          isUp ? 'bg-emerald-400' : isDown ? 'bg-rose-400' : dotColorClass
        } ${isUp || isDown ? 'animate-pulse' : ''}`}
      />
    </div>
  );
});

TickerPill.displayName = 'TickerPill';

export const TopLiveTicker: React.FC = memo(() => {
  return (
    <div className="flex items-center gap-2">
      {/* BTC/USD Real-time Ticker */}
      <TickerPill
        symbol="BTCUSD"
        label="BTC/USD"
        colorClass="text-amber-400"
        dotColorClass="bg-amber-400"
        showOnMobile={true}
      />

      {/* XAU/USD Real-time Ticker */}
      <TickerPill
        symbol="XAUUSD"
        label="XAU/USD"
        colorClass="text-cyan-300"
        dotColorClass="bg-cyan-400"
        showOnMobile={false}
      />

      {/* EUR/USD Real-time Ticker */}
      <TickerPill
        symbol="EURUSD"
        label="EUR/USD"
        colorClass="text-emerald-300"
        dotColorClass="bg-emerald-400"
        showOnMobile={false}
      />
    </div>
  );
});

TopLiveTicker.displayName = 'TopLiveTicker';
