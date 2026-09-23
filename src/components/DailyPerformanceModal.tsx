import React, { useState, useMemo } from 'react';
import {
  AccountInfo,
  ClosedTrade,
  Position,
  Candle,
  ExnessAccountType,
} from '../types/mt5';
import { EXNESS_ACCOUNT_SPECS, formatUsd, formatGoldPrice } from '../utils/goldMath';
import { generateHFTDailyPdf } from '../utils/pdfReportGenerator';
import { TradesTimelineChart } from './TradesTimelineChart';
import {
  X,
  FileDown,
  TrendingUp,
  Activity,
  Layers,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  Clock,
} from 'lucide-react';

interface DailyPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountInfo;
  accountType: ExnessAccountType;
  closedTrades: ClosedTrade[];
  positions: Position[];
  candles: Candle[];
  currentPrice: number;
}

export const DailyPerformanceModal: React.FC<DailyPerformanceModalProps> = ({
  isOpen,
  onClose,
  account,
  accountType,
  closedTrades,
  positions,
  candles,
  currentPrice,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  const spec = EXNESS_ACCOUNT_SPECS[accountType || account.accountType || 'raw_spread'];
  const isCent = spec.isCentAccount;

  // Compute Daily Aggregate Metrics
  const metrics = useMemo(() => {
    const totalTrades = closedTrades.length;
    const winningTrades = closedTrades.filter((t) => t.profit > 0);
    const losingTrades = closedTrades.filter((t) => t.profit < 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;

    const buyTrades = closedTrades.filter((t) => t.type === 'BUY');
    const sellTrades = closedTrades.filter((t) => t.type === 'SELL');

    const closedVolume = closedTrades.reduce((acc, t) => acc + t.volume, 0);
    const openVolume = positions.reduce((acc, p) => acc + p.volume, 0);
    const totalVolume = Math.round((closedVolume + openVolume) * 100) / 100;

    const netRealizedPnL = closedTrades.reduce((acc, t) => acc + t.profit, 0);
    const grossProfit = winningTrades.reduce((acc, t) => acc + t.profit, 0);
    const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.profit, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 1.0;

    const totalCommission = closedTrades.reduce(
      (acc, t) => acc + (t.commission !== undefined ? t.commission : spec.commissionPerLotUsd * t.volume),
      0
    );

    const bestTrade = closedTrades.reduce((best, t) => (t.profit > (best?.profit ?? -Infinity) ? t : best), closedTrades[0]);
    const worstTrade = closedTrades.reduce((worst, t) => (t.profit < (worst?.profit ?? Infinity) ? t : worst), closedTrades[0]);

    const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;

    return {
      totalTrades,
      winningTradesCount: winningTrades.length,
      losingTradesCount: losingTrades.length,
      winRate,
      buyCount: buyTrades.length,
      sellCount: sellTrades.length,
      totalVolume,
      netRealizedPnL,
      grossProfit,
      grossLoss,
      profitFactor,
      totalCommission,
      bestTrade,
      worstTrade,
      avgWin,
      avgLoss,
    };
  }, [closedTrades, positions, spec]);

  // Filtered table rows based on search
  const filteredTrades = useMemo(() => {
    if (!searchQuery.trim()) return closedTrades;
    const q = searchQuery.toLowerCase();
    return closedTrades.filter(
      (t) =>
        t.ticket.toString().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.reason.toLowerCase().includes(q) ||
        (t.closeTime && t.closeTime.toLowerCase().includes(q))
    );
  }, [closedTrades, searchQuery]);

  // Handle PDF Download
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = generateHFTDailyPdf({
        account,
        accountType,
        closedTrades,
        positions,
        currentPrice,
      });
      const fileName = `Exness_XAUUSD_HFT_Daily_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      setPdfSuccessMessage('Relatório PDF baixado com sucesso!');
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Erro ao gerar relatório PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* MODAL HEADER */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Performance Diária HFT & Linha do Tempo 24H
              </h2>
            </div>
            {/* Clean unboxed metadata with separators */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
              <span className="text-amber-300 font-semibold">{spec.name}</span>
              <span aria-hidden="true">·</span>
              <span>Símbolo: {spec.symbol}</span>
              <span aria-hidden="true">·</span>
              <span>Servidor: {account.server}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">
                {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Download PDF Report Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 active:scale-[0.98] transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <FileDown className="w-4 h-4 text-slate-950" />
              <span>{isGeneratingPdf ? 'Gerando PDF...' : 'Baixar Relatório PDF'}</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF SUCCESS NOTIFICATION */}
        {pdfSuccessMessage && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-6 py-2 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">{pdfSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setPdfSuccessMessage(null)}
              className="text-emerald-400 hover:text-emerald-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* SCROLLABLE CONTENT BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* 1. EXECUTIVE KPI METRICS GRID (Total trades, Win rate, Volume, PnL) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Total Trades */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-medium">Total de Trades</span>
                <Layers className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {metrics.totalTrades}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono flex items-center gap-1.5">
                <span className="text-emerald-400">{metrics.buyCount} Buys</span>
                <span>/</span>
                <span className="text-rose-400">{metrics.sellCount} Sells</span>
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-medium">Taxa de Acerto (Win Rate)</span>
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    metrics.winRate >= 70 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {metrics.winRate.toFixed(1)}%
                </span>
                <span className="text-[11px] text-slate-500">alvo: &gt;70%</span>
              </div>
              {/* Visual Win Rate Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    metrics.winRate >= 70 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, metrics.winRate))}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono flex justify-between">
                <span>{metrics.winningTradesCount} vitórias</span>
                <span>{metrics.losingTradesCount} perdas</span>
              </div>
            </div>

            {/* Total Volume */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-medium">Volume Total Negociado</span>
                <DollarSign className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {metrics.totalVolume.toFixed(2)}{' '}
                <span className="text-xs text-slate-400 font-sans font-normal">lotes</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                {isCent
                  ? `${(metrics.totalVolume * 100).toFixed(0)} oz (Conta Cent)`
                  : `${(metrics.totalVolume * 100).toFixed(0)} oz ouro troy`}
              </div>
            </div>

            {/* Net Realized PnL */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-medium">Lucro Líquido Realizado</span>
                <span className="text-[10px] text-slate-500 font-mono">Hoje</span>
              </div>
              <div
                className={`text-2xl font-bold font-mono tabular-nums ${
                  metrics.netRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatUsd(metrics.netRealizedPnL, true)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono flex justify-between">
                <span>Comissões: -${metrics.totalCommission.toFixed(2)}</span>
                <span className="text-slate-300">
                  PF: {metrics.profitFactor >= 99 ? '∞' : metrics.profitFactor.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* SECONDARY METRICS STRIP */}
          <div className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-3 flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans">Lucro Flutuante (Aberto):</span>
              <span
                className={`font-bold ${
                  account.floatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatUsd(account.floatingProfit, true)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans">Média Ganho:</span>
              <span className="text-emerald-400 font-bold">+${metrics.avgWin.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans">Média Perda:</span>
              <span className="text-rose-400 font-bold">-${metrics.avgLoss.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans">Melhor Trade:</span>
              <span className="text-emerald-400 font-bold">
                {metrics.bestTrade ? `+$${metrics.bestTrade.profit.toFixed(2)}` : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans">Pior Trade:</span>
              <span className="text-rose-400 font-bold">
                {metrics.worstTrade ? `${formatUsd(metrics.worstTrade.profit)}` : '—'}
              </span>
            </div>
          </div>

          {/* 2. INTERACTIVE 24-HOUR TIMELINE VIEW */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Linha do Tempo Interativa de Execuções (Últimas 24 Horas)
              </h3>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Passe o mouse sobre os pontos para inspecionar cada ordem executada
              </span>
            </div>

            <TradesTimelineChart
              candles={candles}
              closedTrades={closedTrades}
              openPositions={positions}
              currentPrice={currentPrice}
              selectedTicket={selectedTicket}
              onSelectTrade={(ticket) => setSelectedTicket(ticket)}
            />
          </div>

          {/* 3. TRADES LEDGER TABLE (Below Timeline) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Histórico de Trades do Dia ({filteredTrades.length} registros)
                </h3>
                <p className="text-xs text-slate-400">
                  Clique em qualquer linha para focar e destacar o trade na linha do tempo acima.
                </p>
              </div>

              {/* Table search filter */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar ticket, tipo, motivo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/90 text-slate-400 text-[11px] font-semibold sticky top-0 border-b border-slate-800 z-10">
                    <tr>
                      <th className="py-2.5 px-4">Ticket</th>
                      <th className="py-2.5 px-3">Horário</th>
                      <th className="py-2.5 px-3">Tipo</th>
                      <th className="py-2.5 px-3">Lotes</th>
                      <th className="py-2.5 px-3">Entrada</th>
                      <th className="py-2.5 px-3">Saída</th>
                      <th className="py-2.5 px-3">Pips</th>
                      <th className="py-2.5 px-3">PnL Líquido</th>
                      <th className="py-2.5 px-4 text-right">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredTrades.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-500 font-sans text-xs">
                          Nenhum trade encontrado para o filtro informado.
                        </td>
                      </tr>
                    ) : (
                      filteredTrades.map((t) => {
                        const isWin = t.profit >= 0;
                        const isSelected = selectedTicket === t.ticket;

                        return (
                          <tr
                            key={t.ticket}
                            onClick={() => setSelectedTicket(t.ticket)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-amber-500/15 border-l-2 border-amber-400'
                                : 'hover:bg-slate-900/70'
                            }`}
                          >
                            <td className="py-2 px-4 text-slate-300 font-semibold">#{t.ticket}</td>
                            <td className="py-2 px-3 text-slate-400 font-sans text-[11px]">
                              {t.closeTime || '—'}
                            </td>
                            <td className="py-2 px-3 font-sans font-semibold">
                              {t.type === 'BUY' ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <ArrowUpRight className="w-3 h-3" /> BUY
                                </span>
                              ) : (
                                <span className="text-rose-400 flex items-center gap-1">
                                  <ArrowDownRight className="w-3 h-3" /> SELL
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-300">{t.volume.toFixed(2)}L</td>
                            <td className="py-2 px-3 text-slate-300">${t.openPrice.toFixed(2)}</td>
                            <td className="py-2 px-3 text-slate-300">${t.closePrice.toFixed(2)}</td>
                            <td className="py-2 px-3">
                              <span className={(t.pips || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {(t.pips || 0) >= 0 ? '+' : ''}
                                {(t.pips || 0).toFixed(1)}p
                              </span>
                            </td>
                            <td className="py-2 px-3 font-bold">
                              <span className={isWin ? 'text-emerald-400' : 'text-rose-400'}>
                                {formatUsd(t.profit, true)}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-right">
                              <span className="font-sans text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                                {t.reason}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Motor de Microestrutura HFT Ativo · Exness.com API</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Baixar Relatório PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer transition-colors text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
