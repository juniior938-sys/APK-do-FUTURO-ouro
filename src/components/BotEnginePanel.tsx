import React, { useState } from 'react';
import { BotStrategyConfig, BotSignal, BotLog, StrategyType } from '../types/mt5';
import { formatGoldPrice, formatUsd } from '../utils/goldMath';
import { Play, Square, Bot, ShieldAlert, Cpu, Sparkles, CheckCircle2, AlertTriangle, Clock, Activity, Zap } from 'lucide-react';

interface BotEnginePanelProps {
  isRunning: boolean;
  onToggleBot: () => void;
  config: BotStrategyConfig;
  onUpdateConfig: (cfg: BotStrategyConfig) => void;
  currentSignal: BotSignal | null;
  logs: BotLog[];
  dailyPnl: number;
}

export const BotEnginePanel: React.FC<BotEnginePanelProps> = ({
  isRunning,
  onToggleBot,
  config,
  onUpdateConfig,
  currentSignal,
  logs,
  dailyPnl,
}) => {
  const isLossBreached = dailyPnl <= -config.maxDailyLossUsd;

  const handleStrategyChange = (type: StrategyType) => {
    let name = 'Gold Trend Surfer';
    let desc = 'Seguidor de tendência com cruzamento de médias móveis exponenciais (EMA 9/21) e confirmação de MACD.';
    let sl = 30;
    let tp = 60;

    if (type === 'london_ny_breakout') {
      name = 'London & NY Breakout';
      desc = 'Opera rompimentos de máxima e mínima nas aberturas das sessões de Londres (08:00 UTC) e Nova York (13:30 UTC).';
      sl = 40;
      tp = 80;
    } else if (type === 'mean_reversion_scalp') {
      name = 'Mean Reversion Scalper';
      desc = 'Escalpe rápido em M1/M5 buscando retorno à média quando o RSI está em níveis extremos (<30 ou >70) e toca as Bandas de Bollinger.';
      sl = 20;
      tp = 35;
    }

    onUpdateConfig({
      ...config,
      id: type,
      name,
      description: desc,
      stopLossPips: sl,
      takeProfitPips: tp,
    });
  };

  return (
    <div className="space-y-4">
      {/* Bot Master Control Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isRunning
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-800 border border-slate-700 text-slate-400'
              }`}
            >
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Robô XAUUSD (MT5 Auto-Trade)</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide ${
                    isRunning
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isRunning ? 'ATIVO & EXECUTANDO' : 'DESLIGADO'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Estratégia selecionada: <span className="text-amber-400 font-semibold">{config.name}</span>
              </p>
            </div>
          </div>

          {/* Master Start / Stop Button */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {isLossBreached ? (
              <div className="px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Trava de Perda Diária Atingida (${config.maxDailyLossUsd})</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onToggleBot}
                className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md ${
                  isRunning
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
                }`}
              >
                {isRunning ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Desligar Robô MT5</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Ligar Robô MT5 (Auto-Trade)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Strategy Selection & Risk Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Strategy Presets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm border-b border-slate-800 pb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Estratégias para Ouro</span>
          </h3>

          <div className="space-y-2">
            {[
              {
                id: 'gold_trend_surfer' as StrategyType,
                title: 'Gold Trend Surfer',
                tag: 'Tendência M5/M15',
                desc: 'Cruzamento de EMA 9/21 com filtro de MACD. Busca pegar expansões direcionais.',
              },
              {
                id: 'london_ny_breakout' as StrategyType,
                title: 'London/NY Breakout',
                tag: 'Rompimento Horário',
                desc: 'Opera a volatilidade de abertura de Londres e Wall Street em rompimentos de máximas.',
              },
              {
                id: 'mean_reversion_scalp' as StrategyType,
                title: 'Mean Reversion Scalper',
                tag: 'Retorno à Média',
                desc: 'Escalpe rápido nas pontas de Bollinger e RSI sobrecomprado/sobrevendido.',
              },
            ].map((strat) => (
              <div
                key={strat.id}
                onClick={() => handleStrategyChange(strat.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  config.id === strat.id
                    ? 'border-amber-500/60 bg-amber-500/10 text-slate-100 shadow-sm'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs">{strat.title}</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {strat.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{strat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Strict Risk Engine */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 text-xs">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm border-b border-slate-800 pb-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Motor de Risco MT5</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-medium">
                <span>Lote Padrão do Robô:</span>
                <span className="font-mono text-amber-400 font-bold">{config.lotSize.toFixed(2)} Lots</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.50"
                step="0.01"
                value={config.lotSize}
                onChange={(e) => onUpdateConfig({ ...config, lotSize: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Stop Loss (Pips):</span>
                <input
                  type="number"
                  value={config.stopLossPips}
                  onChange={(e) => onUpdateConfig({ ...config, stopLossPips: parseInt(e.target.value) || 20 })}
                  className="w-full bg-transparent font-mono text-rose-400 font-bold text-sm focus:outline-none"
                />
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Take Profit (Pips):</span>
                <input
                  type="number"
                  value={config.takeProfitPips}
                  onChange={(e) => onUpdateConfig({ ...config, takeProfitPips: parseInt(e.target.value) || 40 })}
                  className="w-full bg-transparent font-mono text-emerald-400 font-bold text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Perda Diária Máx ($):</span>
                <input
                  type="number"
                  value={config.maxDailyLossUsd}
                  onChange={(e) => onUpdateConfig({ ...config, maxDailyLossUsd: parseFloat(e.target.value) || 50 })}
                  className="w-full bg-transparent font-mono text-amber-400 font-bold text-sm focus:outline-none"
                />
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Spread Máximo (Pips):</span>
                <input
                  type="number"
                  step="0.5"
                  value={config.maxSpreadPips}
                  onChange={(e) => onUpdateConfig({ ...config, maxSpreadPips: parseFloat(e.target.value) || 3.5 })}
                  className="w-full bg-transparent font-mono text-slate-200 font-bold text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              ✓ <b className="text-slate-200">Trailing Stop Ativo:</b> Move o Stop Loss para o 0x0 ao atingir +20 pips e persegue o lucro a cada 10 pips.
            </div>
          </div>
        </div>

        {/* Column 3: Current Signal & AI Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 text-xs flex flex-col">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm border-b border-slate-800 pb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Sinal & Análise da Rodada</span>
          </h3>

          {currentSignal ? (
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  currentSignal.action === 'BUY'
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                    : currentSignal.action === 'SELL'
                    ? 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                    : 'border-slate-800 bg-slate-950/50 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Ação Sugerida</div>
                  <div className="text-xl font-bold font-mono tracking-tight">{currentSignal.action}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Confiança</div>
                  <div className="text-lg font-bold font-mono text-amber-400">
                    {(currentSignal.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono text-[11px]">
                <div className="text-slate-400 font-sans font-medium text-[10px]">Justificativa do Algoritmo:</div>
                <p className="text-slate-200 text-xs font-sans leading-relaxed">{currentSignal.reason}</p>
                <div className="pt-2 border-t border-slate-800/80 flex justify-between text-slate-400 text-[10px]">
                  <span>RSI: {currentSignal.indicators.rsi}</span>
                  <span>Spread: {currentSignal.indicators.spread.toFixed(1)} pips</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 text-center font-mono">
                Última avaliação: {currentSignal.timestamp}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Activity className="w-8 h-8 text-slate-700 animate-pulse mb-2" />
              <span>Aguardando próxima vela para gerar sinal...</span>
            </div>
          )}
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Histórico de Atividade do Robô (Tempo Real)</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">{logs.length} eventos registrados</span>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded-lg border flex items-center justify-between ${
                log.level === 'trade'
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                  : log.level === 'warning'
                  ? 'border-amber-500/30 bg-amber-950/20 text-amber-300'
                  : log.level === 'error'
                  ? 'border-rose-500/30 bg-rose-950/20 text-rose-300'
                  : 'border-slate-800/60 bg-slate-950/40 text-slate-300'
              }`}
            >
              <span>{log.message}</span>
              <span className="text-slate-500 text-[10px] ml-4 shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
