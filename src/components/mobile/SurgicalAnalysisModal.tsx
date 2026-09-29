import React, { useState } from 'react';
import { SurgicalSignalReport } from '../../services/candlestickPatternEngine';
import { formatGoldPrice } from '../../utils/goldMath';
import { voiceAssistant } from '../../services/voiceAssistant';
import { audioAlerts } from '../../utils/audioAlerts';

interface SurgicalAnalysisModalProps {
  report: SurgicalSignalReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SurgicalAnalysisModal: React.FC<SurgicalAnalysisModalProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen || !report) return null;

  const isBuy = report.direction === 'BUY';

  const handlePlayVoice = () => {
    try {
      audioAlerts.playTestBeep();
    } catch {}

    if (isPlayingAudio) {
      voiceAssistant.stopAllAudio();
      setIsPlayingAudio(false);
      return;
    }

    const speechText = `Atenção trader. Análise verídica da Inteligência Artificial Grok no tempo ${report.activeTimeframe}. Decisão: ${report.shortVerdict}. Cotação em ${formatGoldPrice(report.entryPrice)}. Próxima tendência: ${report.projectedTrend}. Padrão gráfico: ${report.primaryPattern.label}. Stop Loss cirúrgico em ${formatGoldPrice(report.stopLoss)}. Primeiro Take Profit em ${formatGoldPrice(report.takeProfit1)}. Confluência em ${report.confluenceRatio}.`;

    setIsPlayingAudio(true);
    voiceAssistant
      .speakText(speechText, isBuy)
      .finally(() => setIsPlayingAudio(false));
  };

  const handleClose = () => {
    if (isPlayingAudio) {
      voiceAssistant.stopAllAudio();
      setIsPlayingAudio(false);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#0a1829] via-[#06111f] to-[#030812] border border-cyan-500/40 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5 shadow-md shadow-amber-500/30 flex items-center justify-center text-slate-950 font-black text-sm">
              AU
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-white tracking-wide">
                  ANÁLISE CIRÚRGICA DE IA
                </h3>
                <span className="text-[8.5px] font-black text-cyan-300 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-500/40">
                  GROK 2 / xAI
                </span>
              </div>
              <p className="text-[9.5px] text-slate-400 font-mono">
                {report.symbol} • Cotação: {formatGoldPrice(report.currentPrice)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          {/* Resposta Curta da IA Grok no Tempo Selecionado */}
          <div className={`p-3 rounded-2xl border-2 transition-all shadow-xl ${
            isBuy
              ? 'bg-gradient-to-r from-emerald-950 via-[#072518] to-slate-950 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
              : 'bg-gradient-to-r from-rose-950 via-[#260a12] to-slate-950 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.35)]'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono uppercase text-cyan-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>IA GROK (xAI) • TEMPO [{report.activeTimeframe}]</span>
              </span>
              <span className="text-[8.5px] font-mono text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/40">
                RESPOSTA CURTA
              </span>
            </div>

            <div className="flex items-center justify-between my-1">
              <span className={`text-lg font-black uppercase px-3 py-1 rounded-xl tracking-wider ${
                isBuy ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_#10b981]' : 'bg-rose-500 text-white shadow-[0_0_12px_#f43f5e]'
              }`}>
                {report.shortVerdict}
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {report.trendTimeWindow}
              </span>
            </div>

            <p className="text-[10px] text-slate-200 mt-1 font-sans">
              {report.shortReason}
            </p>
          </div>

          {/* Signal Action & Trend Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-[#07192c] border border-amber-500/40 shadow-lg">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400">
                AÇÃO CIRÚRGICA RECOMENDADA
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-400">
                Precisão: <b className="text-emerald-400">{report.confidence}%</b>
              </span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className={`text-base font-black uppercase px-3 py-1 rounded-xl tracking-wide ${
                isBuy
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                  : 'bg-rose-950 text-rose-300 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
              }`}>
                {report.actionDisplay}
              </span>

              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-1 rounded-lg border border-cyan-500/30">
                R:R {report.riskReward}
              </span>
            </div>

            {/* Projected Next Trend */}
            <div className="pt-2 border-t border-slate-800 text-[11px] text-white font-medium flex items-center gap-1.5 leading-snug">
              <span className="text-amber-400 text-sm">📈</span>
              <span>{report.projectedTrend}</span>
            </div>
          </div>

          {/* Pricing Parameters Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="block text-[8px] font-mono uppercase text-slate-400">Ponto Exato de Entrada</span>
              <span className="text-sm font-black font-mono text-white">{formatGoldPrice(report.entryPrice)}</span>
              <span className="block text-[7.5px] text-slate-500">Execução a Mercado / Limite</span>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/40">
              <span className="block text-[8px] font-mono uppercase text-rose-400">Stop Loss Cirúrgico</span>
              <span className="text-sm font-black font-mono text-rose-300">{formatGoldPrice(report.stopLoss)}</span>
              <span className="block text-[7.5px] text-rose-400/70">Proteção técnica de estrutura</span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
              <span className="block text-[8px] font-mono uppercase text-emerald-400">Take Profit 1 (Conservador)</span>
              <span className="text-sm font-black font-mono text-emerald-300">{formatGoldPrice(report.takeProfit1)}</span>
              <span className="block text-[7.5px] text-emerald-400/70">Alvo 1:1.6 (Realização parcial)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
              <span className="block text-[8px] font-mono uppercase text-emerald-400">Take Profit 2 (Alvo Estrutural)</span>
              <span className="text-sm font-black font-mono text-emerald-300">{formatGoldPrice(report.takeProfit2)}</span>
              <span className="block text-[7.5px] text-emerald-400/70">Alvo 1:3.2 (Expansão de liquidez)</span>
            </div>
          </div>

          {/* Detected Candlestick Pattern Card */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-extrabold uppercase text-cyan-400 tracking-wider">
                Padrão de Candlestick Detectado
              </span>
              <span className="text-[8.5px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/40">
                Confiabilidade: {report.primaryPattern.reliability}
              </span>
            </div>

            <div className="text-xs font-black text-white">
              {report.primaryPattern.label}
            </div>

            <p className="text-[10px] text-slate-300 leading-relaxed">
              {report.primaryPattern.description}
            </p>
          </div>

          {/* Multi-Timeframe Confluence Matrix */}
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-extrabold uppercase text-slate-300 tracking-wider">
                Confluência em Todos os Tempos Gráficos
              </span>
              <span className="text-[8.5px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                {report.confluenceRatio}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {report.multiTimeframeConfluence.map((tf) => (
                <div
                  key={tf.timeframe}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center"
                >
                  <span className="block text-[8.5px] font-mono font-bold text-slate-300">
                    {tf.timeframe}
                  </span>
                  <span className={`block text-[9.5px] font-black ${
                    tf.trend === 'ALTA' ? 'text-emerald-400' : tf.trend === 'BAIXA' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {tf.trend}
                  </span>
                  <span className="block text-[7.5px] font-mono text-slate-400">
                    RSI {tf.rsi}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Surgical Rules Validation Checklist (Zero Erro) */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[9.5px] font-extrabold uppercase text-amber-400 tracking-wider block">
              Checklist de Validação Quântica Sem Erros
            </span>
            <div className="space-y-1.5">
              {report.surgicalRules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[9.5px]">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <span className="text-white font-bold">{rule.rule}: </span>
                    <span className="text-slate-300">{rule.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Explanation Text */}
          <div className="p-3 rounded-2xl bg-[#030914] border border-slate-800 text-[10px] text-slate-300 leading-relaxed font-sans">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[9.5px] mb-1">
              <span>🤖</span>
              <span>PARECER INSTITUCIONAL GROK IA (xAI)</span>
            </div>
            {report.technicalSummary}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={handlePlayVoice}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all ${
              isPlayingAudio
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95'
            }`}
          >
            <span>{isPlayingAudio ? '⏹' : '🔊'}</span>
            <span>{isPlayingAudio ? 'Parar Áudio' : 'Ouvir Análise em Voz'}</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
