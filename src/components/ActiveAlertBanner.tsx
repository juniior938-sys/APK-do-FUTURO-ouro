import React from 'react';
import { MarketAlert } from '../types/signals';
import { Bell, CheckCircle2, AlertTriangle, X, Copy, ExternalLink, ShieldAlert } from 'lucide-react';

interface ActiveAlertBannerProps {
  alert: MarketAlert | null;
  onDismiss: () => void;
  onCopySignal?: (alert: MarketAlert) => void;
}

export const ActiveAlertBanner: React.FC<ActiveAlertBannerProps> = ({
  alert,
  onDismiss,
  onCopySignal,
}) => {
  if (!alert) return null;

  const isEntry = alert.type === 'ENTRY';
  const isTP = alert.type === 'EXIT_TP';
  const isSL = alert.type === 'EXIT_SL';
  const isNews = alert.type === 'EXIT_NEWS' || alert.type === 'NEWS_WARNING';

  let borderBg = 'border-amber-500/60 bg-gradient-to-r from-amber-950/80 via-black to-slate-950';
  let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  let title = 'ALERTA DE MERCADO';
  let Icon = Bell;

  if (isEntry) {
    const isBuy = alert.action.includes('BUY');
    if (isBuy) {
      borderBg = 'border-emerald-500/70 bg-gradient-to-r from-emerald-950/80 via-black to-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.25)]';
      badgeColor = 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50';
      title = '🟢 ALERTA DE ENTRADA (COMPRA DETECTADA)';
      Icon = CheckCircle2;
    } else {
      borderBg = 'border-rose-500/70 bg-gradient-to-r from-rose-950/80 via-black to-slate-950 shadow-[0_0_20px_rgba(244,63,94,0.25)]';
      badgeColor = 'bg-rose-500/25 text-rose-300 border-rose-500/50';
      title = '🔴 ALERTA DE ENTRADA (VENDA DETECTADA)';
      Icon = AlertTriangle;
    }
  } else if (isTP) {
    borderBg = 'border-emerald-500/80 bg-gradient-to-r from-emerald-950/90 via-black to-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.3)]';
    badgeColor = 'bg-emerald-500/30 text-emerald-200 border-emerald-400';
    title = '🏆 ALERTA DE SAÍDA: TAKE PROFIT BATIDO!';
    Icon = CheckCircle2;
  } else if (isSL) {
    borderBg = 'border-rose-600/80 bg-gradient-to-r from-rose-950/90 via-black to-slate-950';
    badgeColor = 'bg-rose-500/30 text-rose-300 border-rose-500';
    title = '🛡️ ALERTA DE SAÍDA: STOP LOSS DE SEGURANÇA';
    Icon = ShieldAlert;
  } else if (isNews) {
    borderBg = 'border-amber-500/80 bg-gradient-to-r from-amber-950/90 via-black to-slate-950';
    badgeColor = 'bg-amber-500/30 text-amber-200 border-amber-400';
    title = '⚠️ ALERTA FOREX FACTORY / DAILYFX (PASTA VERMELHA)';
    Icon = AlertTriangle;
  }

  return (
    <div
      role="alert"
      className={`relative w-full border-b transition-all duration-300 px-4 py-3 z-30 ${borderBg}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-black/60 border border-white/10 shrink-0 mt-0.5 sm:mt-0 animate-pulse">
            <Icon className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                {title}
              </span>
              <span className="font-mono text-xs font-bold text-white tracking-wide">
                {alert.symbol}
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date(alert.timestamp).toLocaleTimeString('pt-BR')}
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
              {alert.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {onCopySignal && (
            <button
              onClick={() => onCopySignal(alert)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-all border border-white/10"
              title="Copiar parâmetros da ordem para MetaTrader"
            >
              <Copy className="w-3.5 h-3.5 text-amber-300" />
              <span>Copiar Sinal MT5</span>
            </button>
          )}

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dispensar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
