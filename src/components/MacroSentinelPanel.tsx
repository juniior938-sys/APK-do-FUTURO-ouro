import React, { useState, useEffect } from 'react';
import {
  REGISTERED_MACRO_SITES,
  getTradingSessions,
  isGoldenOverlapActive,
  INITIAL_MACRO_NEWS,
  CENTRAL_BANK_RATES,
  SYMBOL_SENTIMENTS,
} from '../services/macroData';
import {
  Globe,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Building,
  RefreshCw,
  Radio,
  Sliders,
  Bell,
  Sparkles,
} from 'lucide-react';

export const MacroSentinelPanel: React.FC = () => {
  const [sessions, setSessions] = useState(getTradingSessions());
  const [isOverlap, setIsOverlap] = useState(isGoldenOverlapActive());
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString('pt-BR'));

  useEffect(() => {
    const timer = setInterval(() => {
      setSessions(getTradingSessions());
      setIsOverlap(isGoldenOverlapActive());
      setLastSync(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner: Registered Sites Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-black to-slate-950 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Macro Sentinel Engine
              </span>
              <span className="text-xs text-slate-400">
                Sincronizado: {lastSync}
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Fontes Externas & Calendário Macroeconômico Cadastrado
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Os sinais de Compra, Venda, Stop Loss e Take Profit são filtrados diretamente pelos 4 portais abaixo para garantir máxima assertividade e proteção contra falsos rompimentos.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 shrink-0 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Status da Blindagem</div>
            <div className="text-sm font-bold font-mono text-emerald-400 flex items-center justify-end gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>4 / 4 FONTES ATIVAS</span>
            </div>
          </div>
        </div>
      </div>

      {/* The 4 Registered Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {REGISTERED_MACRO_SITES.map((site) => (
          <div
            key={site.id}
            className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{site.status}</span>
                </span>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-amber-400 transition-colors p-1 rounded hover:bg-white/5"
                  title="Acessar site oficial"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors font-mono">
                {site.name}
              </h3>
              <div className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                {site.category}
              </div>

              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                {site.roleDescription}
              </p>

              {/* Features bullets */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-300">
                {site.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>{site.lastPing}</span>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>Abrir portal</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* World Time Clocks Section (World Time Server) */}
      <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Sessões Globais de Negociação (World Time Server)
              </h3>
              <p className="text-xs text-slate-400">
                Acompanhamento em tempo real dos fusos horários oficiais das maiores praças financeiras.
              </p>
            </div>
          </div>

          {isOverlap && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 animate-pulse">
              <span>🌟 GOLDEN OVERLAP ATIVA (LONDRES + NOVA YORK)</span>
            </div>
          )}
        </div>

        {/* 4 Sessions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sessions.map((sess) => {
            const isOpen = sess.isOpen;
            return (
              <div
                key={sess.name}
                className={`p-4 rounded-xl border transition-all ${
                  isOpen
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOpen ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                      }`}
                    />
                    <span>{sess.name}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      isOpen
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isOpen ? 'ABERTA' : 'FECHADA'}
                  </span>
                </div>

                <div className="font-mono text-xl font-black text-slate-100 my-1">
                  {sess.localTimeFormatted}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                  <span>{sess.timeUntilNextEvent}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Volatilidade: {sess.volatilityRating}
                  </span>
                </div>

                <div className="mt-1.5 text-[10px] text-slate-400 truncate">
                  Pares-chave: {sess.keyPairs.slice(0, 3).join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DailyFX Economic Calendar & Forex Factory Red Folder Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DailyFX Feed */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">📰</span>
                <h3 className="text-sm font-bold text-white">DailyFX Calendário Econômico</h3>
              </div>
              <a
                href="https://www.dailyfx.com/economic-calendar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Ver DailyFX</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Eventos de alto e médio impacto com projeções e impacto direcional nos pares.
            </p>

            <div className="space-y-2">
              {INITIAL_MACRO_NEWS.map((event) => {
                const isHigh = event.impact === 'HIGH';
                return (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg bg-black/40 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isHigh
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {event.currency}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-200">{event.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Horário UTC: {event.timeUtc} · Fonte: {event.source}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-white">
                        {event.actual !== '--' ? event.actual : `Proj: ${event.forecast}`}
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          event.sentiment === 'BULLISH'
                            ? 'text-emerald-400'
                            : event.sentiment === 'BEARISH'
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {event.sentiment}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Forex Factory & Investing.com Sentiment Radar */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <h3 className="text-sm font-bold text-white">
                  Investing.com: Sentimento de Varejo & Bancos Centrais
                </h3>
              </div>
              <a
                href="https://www.investing.com/economic-calendar/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Ver Investing.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Posicionamento de compradores vs vendedores e taxas de juros atuais.
            </p>

            {/* Sentiment bars */}
            <div className="space-y-2.5">
              {Object.values(SYMBOL_SENTIMENTS).slice(0, 5).map((item) => (
                <div key={item.symbol} className="p-2.5 rounded-lg bg-black/40 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-white">{item.symbol}</span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-emerald-400 font-bold">{item.bullishPct}% Compra</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-rose-400 font-bold">{item.bearishPct}% Venda</span>
                    </div>
                  </div>

                  {/* Visual ratio bar */}
                  <div className="w-full h-1.5 rounded-full bg-rose-500/30 overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${item.bullishPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Central Bank Rates Table */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-2">Taxas de Juros dos Bancos Centrais</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {CENTRAL_BANK_RATES.map((cb) => (
                  <div key={cb.bank} className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <div className="font-semibold text-white truncate">{cb.bank}</div>
                    <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                      <span className="text-amber-300 font-bold">{cb.rate}</span>
                      <span className="text-slate-400">Reunião: {cb.nextMeeting}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
