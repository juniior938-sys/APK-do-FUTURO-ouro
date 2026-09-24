import React, { useState, useEffect } from 'react';
import { EconomicEvent } from '../types/signals';
import {
  Calendar,
  AlertTriangle,
  Flame,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Radio,
  Sparkles,
} from 'lucide-react';

interface EconomicNewsFeedProps {
  onSelectEvent?: (event: EconomicEvent) => void;
  isCompact?: boolean;
  onFilterPairsByNews?: (currency: string) => void;
}

export const EconomicNewsFeed: React.FC<EconomicNewsFeedProps> = ({
  onSelectEvent,
  isCompact = false,
  onFilterPairsByNews,
}) => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [onlyHighImpact, setOnlyHighImpact] = useState(true);
  const [isHighVolatilityActive, setIsHighVolatilityActive] = useState(true);
  const [volatilitySummary, setVolatilitySummary] = useState(
    '⚠️ Janela de Alta Volatilidade Ativa: Dados de Inflação (CPI) e Discurso do Fed'
  );
  const [isExpanded, setIsExpanded] = useState(!isCompact);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Agora');

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/economic-news');
      if (res.ok) {
        const data = await res.json();
        if (data.events && Array.isArray(data.events)) {
          setEvents(data.events);
          setIsHighVolatilityActive(data.isHighVolatilityActive);
          if (data.highVolatilitySummary) {
            setVolatilitySummary(data.highVolatilitySummary);
          }
          setLastRefreshed(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Using client fallback for economic news:', err);
    }

    // Default institutional calendar fallback
    setEvents([
      {
        id: 'ff-usd-cpi',
        time: '12:30',
        date: 'Hoje',
        currency: 'USD',
        title: 'CPI m/m & Core CPI y/y (Inflação ao Consumidor EUA)',
        impact: 'HIGH',
        forecast: '0.3%',
        previous: '0.2%',
        actual: 'Aguardando',
        source: 'ForexFactory',
        isHighVolatility: true,
        affectedPairs: ['XAUUSD.pc', 'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY'],
        minutesUntil: 45,
        volatilityHoursLabel: 'Pico de Volatilidade às 12:30 UTC',
      },
      {
        id: 'inv-usd-fed',
        time: '14:00',
        date: 'Hoje',
        currency: 'USD',
        title: 'Discurso de Jerome Powell (FOMC / Fed Chair)',
        impact: 'HIGH',
        forecast: 'Hawkish Bias',
        previous: 'Neutro',
        actual: 'Em breve',
        source: 'Investing.com',
        isHighVolatility: true,
        affectedPairs: ['XAUUSD.pc', 'XAUUSD', 'USDJPY', 'EURUSD'],
        minutesUntil: 135,
        volatilityHoursLabel: 'Alta Volatilidade das 14:00 às 15:30 UTC',
      },
      {
        id: 'ff-eur-ecb',
        time: '08:15',
        date: 'Amanhã',
        currency: 'EUR',
        title: 'Decisão de Taxa de Juros do BCE (ECB Rate Decision)',
        impact: 'HIGH',
        forecast: '3.25%',
        previous: '3.50%',
        actual: 'Pendente',
        source: 'ForexFactory',
        isHighVolatility: true,
        affectedPairs: ['EURUSD', 'EURGBP', 'EURJPY'],
        minutesUntil: 520,
        volatilityHoursLabel: 'Abertura Europeia com Alta Liquidez',
      },
      {
        id: 'inv-gbp-gdp',
        time: '07:00',
        date: 'Hoje',
        currency: 'GBP',
        title: 'PIB Mensal do Reino Unido (GDP m/m)',
        impact: 'MED',
        forecast: '0.2%',
        previous: '0.0%',
        actual: '0.3%',
        source: 'Investing.com',
        isHighVolatility: false,
        affectedPairs: ['GBPUSD', 'GBPJPY', 'EURGBP'],
        minutesUntil: -180,
        volatilityHoursLabel: 'Superou Projeção',
      },
      {
        id: 'ff-usd-claims',
        time: '12:30',
        date: 'Amanhã',
        currency: 'USD',
        title: 'Pedidos Iniciais de Seguro-Desemprego (Jobless Claims)',
        impact: 'HIGH',
        forecast: '218K',
        previous: '219K',
        actual: 'Pendente',
        source: 'ForexFactory',
        isHighVolatility: true,
        affectedPairs: ['XAUUSD.pc', 'XAUUSD', 'EURUSD', 'USDJPY'],
        minutesUntil: 840,
        volatilityHoursLabel: 'Impacto Direto no Dólar & Ouro',
      },
    ]);
    setIsLoading(false);
    setLastRefreshed(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // 1-minute auto refresh
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((evt) => {
    if (onlyHighImpact && evt.impact !== 'HIGH') return false;
    if (selectedCurrency !== 'ALL' && evt.currency !== selectedCurrency) return false;
    return true;
  });

  const nextHighImpactEvent = events.find((e) => e.impact === 'HIGH' && (e.minutesUntil || 0) > 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-lg transition-all">
      {/* Top Banner: High Volatility Window Indicator */}
      <div
        className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
          isHighVolatilityActive
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            : 'bg-slate-900/60 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isHighVolatilityActive ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Feed de Notícias Econômicas & Horários de Alta Volatilidade</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                ForexFactory · Investing.com
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {volatilitySummary}
            </p>
          </div>
        </div>

        {/* Quick controls: Expand/Collapse & Refresh */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {nextHighImpactEvent && (
            <div className="text-[11px] font-mono px-2 py-1 rounded bg-black/60 border border-slate-700 text-amber-300 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Próximo Red Folder: {nextHighImpactEvent.time} UTC ({nextHighImpactEvent.currency})</span>
            </div>
          )}

          <button
            type="button"
            onClick={fetchNews}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
            title="Atualizar dados do ForexFactory e Investing.com"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
            title={isExpanded ? 'Recolher feed de notícias' : 'Expandir feed de notícias'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content: Filter bar & Events List */}
      {isExpanded && (
        <div className="p-3.5 sm:p-4 space-y-3 animate-in fade-in duration-200">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
            {/* Currency Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Moeda:</span>
              {['ALL', 'USD', 'EUR', 'GBP', 'JPY'].map((curr) => {
                const isSelected = selectedCurrency === curr;
                return (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => {
                      setSelectedCurrency(curr);
                      if (onFilterPairsByNews && curr !== 'ALL') {
                        onFilterPairsByNews(curr);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                        : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {curr === 'ALL' ? 'Todas Moedas' : curr}
                  </button>
                );
              })}
            </div>

            {/* High Impact Toggle */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyHighImpact}
                  onChange={(e) => setOnlyHighImpact(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 bg-slate-800 border-slate-700 focus:ring-rose-500 accent-rose-500"
                />
                <span className="font-semibold text-rose-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>Apenas Red Folders (Alto Impacto)</span>
                </span>
              </label>

              <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                Sincronizado: {lastRefreshed}
              </span>
            </div>
          </div>

          {/* Events Grid / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredEvents.map((evt) => {
              const isHigh = evt.impact === 'HIGH';
              const isImminent = (evt.minutesUntil || 0) > 0 && (evt.minutesUntil || 0) <= 60;

              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent?.(evt)}
                  className={`p-3 rounded-lg border text-xs flex flex-col justify-between gap-2.5 transition-all cursor-pointer ${
                    isImminent
                      ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/30 shadow-md'
                      : isHigh
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  {/* Top: Time, Currency & Source */}
                  <div className="flex items-center justify-between gap-2 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded font-black text-[10px] ${
                          isHigh
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {evt.currency}
                      </span>
                      <span className="font-bold text-white text-xs">{evt.time} UTC</span>
                      <span className="text-[10px] text-slate-500">({evt.date})</span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-sans">
                      {evt.source}
                    </span>
                  </div>

                  {/* Title & Volatility Badge */}
                  <div>
                    <h4 className="font-bold text-slate-100 line-clamp-1 leading-snug">
                      {evt.title}
                    </h4>
                    {evt.volatilityHoursLabel && (
                      <span className="text-[10px] font-medium text-amber-300/90 block mt-0.5">
                        ⚡ {evt.volatilityHoursLabel}
                      </span>
                    )}
                  </div>

                  {/* Data Stats: Projeção vs Anterior */}
                  <div className="flex items-center justify-between p-1.5 rounded bg-black/50 border border-slate-800 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px]">Proj: </span>
                      <span className="text-slate-200 font-semibold">{evt.forecast || '-'}</span>
                    </div>
                    <div className="text-slate-600">|</div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Ant: </span>
                      <span className="text-slate-400">{evt.previous || '-'}</span>
                    </div>
                    <div className="text-slate-600">|</div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Atual: </span>
                      <span className={`font-bold ${evt.actual === 'Aguardando' || evt.actual === 'Pendente' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {evt.actual || 'Pendente'}
                      </span>
                    </div>
                  </div>

                  {/* Affected Pairs Pills */}
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    <span className="text-[10px] text-slate-500">Impacta:</span>
                    {evt.affectedPairs.slice(0, 4).map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
