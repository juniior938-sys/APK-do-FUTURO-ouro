import React, { useState } from 'react';
import { Position, ClosedTrade } from '../types/mt5';
import { formatGoldPrice, formatUsd } from '../utils/goldMath';
import { CheckCircle2, ShieldCheck, XCircle, ArrowUpRight, ArrowDownRight, History, Layers, BarChart3 } from 'lucide-react';

interface PositionsTableProps {
  positions: Position[];
  closedTrades: ClosedTrade[];
  onClosePosition: (ticket: number, percent?: number) => void;
  onMoveToBreakeven: (ticket: number) => void;
  onOpenDailyReport?: () => void;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({
  positions,
  closedTrades,
  onClosePosition,
  onMoveToBreakeven,
  onOpenDailyReport,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'open' | 'history'>('open');

  const totalOpenProfit = positions.reduce((acc, p) => acc + p.profit, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Table Header & Tabs */}
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('open')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'open'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Posições Abertas ({positions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span>Histórico Fechado ({closedTrades.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeSubTab === 'open' && positions.length > 0 && (
            <div className="text-xs font-mono">
              <span className="text-slate-400 mr-2">Resultado Total:</span>
              <span
                className={`font-bold tabular-nums ${
                  totalOpenProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatUsd(totalOpenProfit, true)}
              </span>
            </div>
          )}

          {onOpenDailyReport && (
            <button
              type="button"
              onClick={onOpenDailyReport}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Abrir Relatório Diário de Performance e Linha do Tempo 24H"
            >
              <BarChart3 className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Relatório & Timeline 24H</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[160px]">
        {activeSubTab === 'open' ? (
          positions.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <Layers className="w-8 h-8 text-slate-700 stroke-[1.5]" />
              <p className="font-medium text-slate-400">Nenhuma posição aberta no momento</p>
              <p className="text-[11px] text-slate-600">
                Utilize a boleta de execução para abrir ordens manuais ou ative o Robô XAUUSD.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Ticket</th>
                  <th className="px-4 py-2.5 font-medium">Tipo</th>
                  <th className="px-4 py-2.5 font-medium">Lote</th>
                  <th className="px-4 py-2.5 font-medium">Abertura</th>
                  <th className="px-4 py-2.5 font-medium">Preço Atual</th>
                  <th className="px-4 py-2.5 font-medium">S/L</th>
                  <th className="px-4 py-2.5 font-medium">T/P</th>
                  <th className="px-4 py-2.5 font-medium text-right">Pips</th>
                  <th className="px-4 py-2.5 font-medium text-right">Lucro USD</th>
                  <th className="px-4 py-2.5 font-medium text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {positions.map((pos) => {
                  const isPositive = pos.profit >= 0;
                  const isBuy = pos.type === 'BUY';
                  const canBreakeven = (isBuy && pos.currentPrice > pos.openPrice + 1.0) || (!isBuy && pos.currentPrice < pos.openPrice - 1.0);

                  return (
                    <tr key={pos.ticket} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-400 tabular-nums">#{pos.ticket}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isBuy
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {pos.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-200 font-bold tabular-nums">{pos.volume.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-300 tabular-nums">{formatGoldPrice(pos.openPrice)}</td>
                      <td className="px-4 py-3 text-slate-100 font-semibold tabular-nums">{formatGoldPrice(pos.currentPrice)}</td>
                      <td className="px-4 py-3 text-slate-400 tabular-nums">
                        {pos.sl > 0 ? formatGoldPrice(pos.sl) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 tabular-nums">
                        {pos.tp > 0 ? formatGoldPrice(pos.tp) : '—'}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pos.pips >= 0 ? `+${pos.pips.toFixed(1)}` : pos.pips.toFixed(1)}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold text-sm tabular-nums ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatUsd(pos.profit, true)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {canBreakeven && (
                            <button
                              type="button"
                              onClick={() => onMoveToBreakeven(pos.ticket)}
                              title="Mover Stop Loss para o preço de abertura (Breakeven / 0x0)"
                              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-semibold transition-colors"
                            >
                              0x0
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onClosePosition(pos.ticket, 50)}
                            title="Fechar 50% do lote da posição"
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] transition-colors"
                          >
                            50%
                          </button>
                          <button
                            type="button"
                            onClick={() => onClosePosition(pos.ticket, 100)}
                            title="Fechar 100% da posição imediatamente"
                            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold transition-colors"
                          >
                            Fechar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          closedTrades.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs">
              Nenhuma ordem encerrada nesta sessão.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Ticket</th>
                  <th className="px-4 py-2.5 font-medium">Tipo</th>
                  <th className="px-4 py-2.5 font-medium">Lote</th>
                  <th className="px-4 py-2.5 font-medium">Entrada</th>
                  <th className="px-4 py-2.5 font-medium">Saída</th>
                  <th className="px-4 py-2.5 font-medium">Motivo</th>
                  <th className="px-4 py-2.5 font-medium">Horário</th>
                  <th className="px-4 py-2.5 font-medium text-right">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {closedTrades.map((trade) => {
                  const isPos = trade.profit >= 0;
                  return (
                    <tr key={trade.ticket} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-2.5 text-slate-400 tabular-nums">#{trade.ticket}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${trade.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-300 tabular-nums">{trade.volume.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-slate-300 tabular-nums">{formatGoldPrice(trade.openPrice)}</td>
                      <td className="px-4 py-2.5 text-slate-300 tabular-nums">{formatGoldPrice(trade.closePrice)}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-slate-400 text-[10px]">{trade.reason}</span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-[10px]">{trade.closeTime}</td>
                      <td className={`px-4 py-2.5 text-right font-bold tabular-nums ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatUsd(trade.profit, true)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
};
