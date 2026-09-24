import React, { useState } from 'react';
import { MarketAlert } from '../types/signals';
import { audioAlerts } from '../utils/audioAlerts';
import {
  Bell,
  Volume2,
  VolumeX,
  Play,
  Trash2,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sliders,
  Copy,
  Check,
} from 'lucide-react';

interface AlertsHistoryTabProps {
  alerts: MarketAlert[];
  onClearAlerts: () => void;
}

export const AlertsHistoryTab: React.FC<AlertsHistoryTabProps> = ({
  alerts,
  onClearAlerts,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(audioAlerts.isEnabled());
  const [volume, setVolume] = useState(audioAlerts.getVolume());
  const [telegramWebhook, setTelegramWebhook] = useState(() => {
    try {
      return localStorage.getItem('sentinel_webhook_url') || '';
    } catch {
      return '';
    }
  });
  const [webhookSaved, setWebhookSaved] = useState(false);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioAlerts.setEnabled(next);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioAlerts.setVolume(val);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('sentinel_webhook_url', telegramWebhook);
    } catch {}
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Audio Engine Configuration Card */}
      <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Sintetizador de Áudio & Alertas Sonoros em Tempo Real
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Acione bips sonoros automáticos sempre que uma nova oportunidade de entrada ou saída for gerada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSound}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Áudio Ativado</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Áudio Silenciado</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Volume & Sound Test Controls */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-medium text-slate-400">Volume:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!soundEnabled}
              className="w-32 accent-amber-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-300">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Sound Preview Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 mr-1">Testar Alertas:</span>

            <button
              onClick={() => audioAlerts.playEntryBuy()}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-emerald-400 flex items-center gap-1"
            >
              <Play className="w-2.5 h-2.5" />
              <span>Entrada Compra</span>
            </button>

            <button
              onClick={() => audioAlerts.playEntrySell()}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-rose-400 flex items-center gap-1"
            >
              <Play className="w-2.5 h-2.5" />
              <span>Entrada Venda</span>
            </button>

            <button
              onClick={() => audioAlerts.playTakeProfit()}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-amber-300 flex items-center gap-1"
            >
              <Play className="w-2.5 h-2.5" />
              <span>Take Profit</span>
            </button>

            <button
              onClick={() => audioAlerts.playStopLoss()}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-purple-400 flex items-center gap-1"
            >
              <Play className="w-2.5 h-2.5" />
              <span>Stop Loss</span>
            </button>

            <button
              onClick={() => audioAlerts.playNewsWarning()}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-blue-400 flex items-center gap-1"
            >
              <Play className="w-2.5 h-2.5" />
              <span>Alerta Notícia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Webhook & Telegram Integration */}
      <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            Notificações no Celular (Telegram / Webhook Discord)
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Receba cada alerta de entrada e saída diretamente no seu smartphone através do seu canal do Telegram ou Webhook do Discord.
        </p>

        <form onSubmit={handleSaveWebhook} className="flex gap-2">
          <input
            type="text"
            value={telegramWebhook}
            onChange={(e) => setTelegramWebhook(e.target.value)}
            placeholder="Cole seu Webhook URL (ex: https://api.telegram.org/botTOKEN/sendMessage ou Discord Webhook)"
            className="flex-1 bg-black border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            {webhookSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Salvo!</span>
              </>
            ) : (
              <span>Salvar Webhook</span>
            )}
          </button>
        </form>
      </div>

      {/* Triggered Alerts History Feed */}
      <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Histórico de Alertas Recentes</h3>
            <p className="text-xs text-slate-400">
              {alerts.length} eventos disparados durante a sessão atual.
            </p>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={onClearAlerts}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Histórico</span>
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-xs text-slate-500">
            Nenhum alerta disparado ainda. Conforme as cotações atingirem os alvos ou stop losses, eles serão registrados aqui.
          </div>
        ) : (
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {alerts.map((al) => {
              const isEntry = al.type === 'ENTRY';
              const isTP = al.type === 'EXIT_TP';
              const isSL = al.type === 'EXIT_SL';

              let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
              if (isEntry) {
                badgeStyle = al.action.includes('BUY')
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30';
              } else if (isTP) {
                badgeStyle = 'bg-emerald-500/30 text-emerald-200 border-emerald-500/40 font-bold';
              } else if (isSL) {
                badgeStyle = 'bg-rose-500/30 text-rose-300 border-rose-500/40 font-bold';
              }

              return (
                <div
                  key={al.id}
                  className="p-3 rounded-lg bg-black/50 border border-slate-800 flex items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${badgeStyle}`}
                    >
                      {al.type.replace('_', ' ')}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200">{al.message}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(al.timestamp).toLocaleTimeString('pt-BR')} · Preço: {al.price} · Fonte: {al.source}
                      </div>
                    </div>
                  </div>

                  {al.pips !== undefined && al.pips !== 0 && (
                    <div
                      className={`font-mono text-xs font-bold shrink-0 ${
                        al.pips > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {al.pips > 0 ? `+${al.pips}` : al.pips} pips
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
