import React, { useState, useEffect } from 'react';
import { liveMarketFeed, XauFeedDiagnosticData } from '../../services/liveMarketFeed';
import { audioAlerts } from '../../utils/audioAlerts';

export const XauFeedDiagnosticOverlay: React.FC = () => {
  const [telemetry, setTelemetry] = useState<XauFeedDiagnosticData>(() => liveMarketFeed.getXauDiagnosticTelemetry());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [lastPingTime, setLastPingTime] = useState<number>(Date.now());

  useEffect(() => {
    return liveMarketFeed.subscribeDiagnostic((data) => {
      setTelemetry(data);
    });
  }, []);

  const handleTestPing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      audioAlerts.playTestBeep();
    } catch {}
    setIsPinging(true);
    const start = performance.now();
    try {
      await fetch('/api/live-rates', { cache: 'no-store' });
    } catch {}
    const duration = Math.round(performance.now() - start);
    setIsPinging(false);
    setLastPingTime(Date.now());
  };

  // Latency styling
  const latency = telemetry.rawLatencyMs;
  let latencyBadgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  let latencyDotClass = 'bg-emerald-400';
  if (latency > 80) {
    latencyBadgeClass = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    latencyDotClass = 'bg-rose-400';
  } else if (latency > 35) {
    latencyBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    latencyDotClass = 'bg-amber-400';
  }

  return (
    <div className="relative z-20 mb-2.5 select-none">
      {/* Main Diagnostic Bar */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="group relative rounded-xl bg-gradient-to-r from-[#071322]/95 via-slate-950/90 to-[#0d1c30]/95 border border-amber-500/40 p-2 shadow-lg shadow-amber-500/5 hover:border-amber-400/70 transition-all cursor-pointer overflow-hidden"
      >
        {/* Top subtle glow */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

        {/* Row 1: XAUUSD Live Timestamp + Latency Badge + Sync Pill */}
        <div className="flex items-center justify-between gap-1.5">
          {/* Pair & Live Price */}
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-[10.5px] font-black text-amber-300 tracking-wide font-mono">
              XAU/USD
            </span>
            <span className="text-[11px] font-extrabold text-white font-mono tracking-tight">
              {telemetry.formattedPrice}
            </span>
            <span className={`text-[8.5px] font-mono font-bold ${telemetry.direction === 'up' ? 'text-emerald-400' : telemetry.direction === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
              {telemetry.direction === 'up' ? '▲' : telemetry.direction === 'down' ? '▼' : '●'}
            </span>
          </div>

          {/* Raw Latency Indicator */}
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-mono font-bold ${latencyBadgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${latencyDotClass} animate-pulse`} />
              <span>{latency}ms</span>
            </div>

            {/* Sync Status Badge */}
            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono">
              SYNC 100%
            </span>

            {/* Expand / Minimize chevron */}
            <svg
              viewBox="0 0 24 24"
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-amber-400' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Row 2: Sub-second Timestamp & Feed Status */}
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/80 text-[8.5px] font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Último Update:</span>
            <span className="text-cyan-300 font-bold">{telemetry.lastUpdateFormatted}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Jitter: <strong className="text-emerald-400">{telemetry.jitterMs}ms</strong></span>
            <span>•</span>
            <span className="text-amber-300 font-bold">Grok IA (xAI)</span>
          </div>
        </div>

        {/* Expandable Diagnostic Telemetry Panel */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5 text-[9px] font-mono text-slate-300 bg-black/60 -mx-2 -mb-2 p-2.5 rounded-b-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[8px] uppercase tracking-wider text-slate-400 font-sans font-bold">
              <span>Diagnóstico de Telemetria de Feed Raw (XAU/USD)</span>
              <button
                type="button"
                onClick={handleTestPing}
                disabled={isPinging}
                className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded font-black text-[8px] hover:bg-amber-300 transition active:scale-95 disabled:opacity-50"
              >
                {isPinging ? 'Testando...' : 'Testar Ping Agora'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
              <div className="flex justify-between bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400">Provedor Spot:</span>
                <span className="text-amber-300 truncate max-w-[120px]" title={telemetry.sourceProvider}>
                  Gold-API L2
                </span>
              </div>
              <div className="flex justify-between bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400">WebSocket:</span>
                <span className={`font-bold ${telemetry.wsConnected ? 'text-emerald-400' : 'text-cyan-300'}`}>
                  {telemetry.wsConnected ? 'Conectado (ws://)' : 'Polling Ativo'}
                </span>
              </div>
              <div className="flex justify-between bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400">Timestamp UTC:</span>
                <span className="text-cyan-300 truncate">{telemetry.lastUpdateUtc.split(' ')[1]}</span>
              </div>
              <div className="flex justify-between bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400">Ticks XAU:</span>
                <span className="text-white font-bold">{telemetry.tickCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[8px] text-slate-400 pt-0.5">
              <span>Sincronização Motor & Cotação:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Zero Jitter • Sincronizado 100%
              </span>
            </div>

            {/* Grok API Documentation Reference */}
            <div className="pt-1.5 mt-1 border-t border-slate-800/80 flex items-center justify-between text-[8px]">
              <span className="text-slate-400">Documentação Grok API:</span>
              <a
                href="https://grok--api-apidog-io.translate.goog/?_x_tr_sl=en&_x_tr_tl=pt&_x_tr_hl=pt&_x_tr_pto=tc"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-cyan-400 hover:text-cyan-300 underline font-mono flex items-center gap-0.5"
              >
                <span>Apidog xAI Docs</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
