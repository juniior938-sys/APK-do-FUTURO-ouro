import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  EyeOff,
  Zap,
  Radio,
  Sliders,
  AlertTriangle,
  Lock,
  Cpu,
  RefreshCw,
  Server,
  Activity,
} from 'lucide-react';
import { StealthShieldConfig } from '../types/stealth';

interface StealthShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StealthShieldConfig;
  onSave: (config: StealthShieldConfig) => void;
  currentSpread: number;
}

export const StealthShieldModal: React.FC<StealthShieldModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  currentSpread,
}) => {
  const [form, setForm] = useState<StealthShieldConfig>({ ...config });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Blindagem do Servidor & Anti-Bloqueio</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  {form.enabled ? 'Blindagem Ativa' : 'Desativado'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Proteção algorítmica contra caça de stops, manipulação de spread e bloqueio de LP/Bridge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Master Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Ativar Modo Stealth & Blindagem Total</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Habilita todas as defesas contra leitura de fluxo e profiling de ordens pela corretora.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Module 1: Virtual Stops (Stop Invisível) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <EyeOff className="w-4 h-4 text-amber-400" />
                <span>Stop Loss & Take Profit Invisíveis (Virtual SL/TP)</span>
              </div>
              <input
                type="checkbox"
                checked={form.virtualStopsEnabled}
                onChange={(e) => setForm({ ...form, virtualStopsEnabled: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
              />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              O Stop Loss <b>NÃO é enviado</b> para o livro de ordens da corretora. O robô monitora o tick no seu navegador/servidor e executa saída a mercado no instante exato. A mesa de operações da corretora fica impossibilitada de caçar o seu stop.
            </p>
          </div>

          {/* Module 2: Execution Jitter & Delay Randomizer */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Zap className="w-4 h-4 text-sky-400" />
                <span>Randomização de Delay & Micro-Jitter (Anti-Detecção HFT)</span>
              </div>
              <input
                type="checkbox"
                checked={form.jitterEnabled}
                onChange={(e) => setForm({ ...form, jitterEnabled: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0"
              />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Softwares de risco das corretoras (OneZero / PrimeXM) detectam robôs por milissegundos repetitivos. O Jitter adiciona variações aleatórias humanas para descaracterizar assinatura de bot.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Jitter Mínimo (ms):</label>
                <input
                  type="number"
                  value={form.minJitterMs}
                  onChange={(e) => setForm({ ...form, minJitterMs: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                  min={5}
                  max={50}
                />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Jitter Máximo (ms):</label>
                <input
                  type="number"
                  value={form.maxJitterMs}
                  onChange={(e) => setForm({ ...form, maxJitterMs: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                  min={20}
                  max={200}
                />
              </div>
            </div>
          </div>

          {/* Module 3: Spread Spike Filter */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Filtro Anti-Manipulação de Spread (Rollover & Notícias)</span>
              </div>
              <input
                type="checkbox"
                checked={form.spreadSpikeFilter}
                onChange={(e) => setForm({ ...form, spreadSpikeFilter: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-rose-500 focus:ring-0"
              />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Pausa instantaneamente novas ordens se a corretora inflar o spread além do limite aceitável.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-slate-400 text-[11px]">Trava máxima de spread:</span>
              <input
                type="number"
                step="0.1"
                value={form.maxAllowedSpreadPips}
                onChange={(e) => setForm({ ...form, maxAllowedSpreadPips: Number(e.target.value) })}
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-400 font-mono text-xs"
              />
              <span className="text-slate-400 text-[11px]">pips (Atual: <b className="text-white">{currentSpread.toFixed(1)}</b> pips)</span>
            </div>
          </div>

          {/* Module 4: Proxy Shield & Heartbeat Keepalive */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Heartbeat Keepalive & Failover Automático</span>
              </div>
              <input
                type="checkbox"
                checked={form.autoHeartbeatRetry}
                onChange={(e) => setForm({ ...form, autoHeartbeatRetry: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
              />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Envia pacotes de ping invisíveis a cada 1.500ms para evitar desconexões forçadas ou congelamento de sessão pela corretora.
            </p>
          </div>

          {/* Module 5: Proxy Shield Relay URL (Custom) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Server className="w-4 h-4 text-purple-400" />
                <span>Servidor Proxy / Blindagem de IP (Opcional)</span>
              </div>
              <input
                type="checkbox"
                checked={form.proxyFailoverEnabled}
                onChange={(e) => setForm({ ...form, proxyFailoverEnabled: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-purple-500 focus:ring-0"
              />
            </div>
            <input
              type="text"
              value={form.customProxyServer || ''}
              onChange={(e) => setForm({ ...form, customProxyServer: e.target.value })}
              placeholder="Ex: socks5://185.120.45.10:1080 ou relay.seu-servidor.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs placeholder-slate-600"
            />
            <p className="text-[10px] text-slate-500">
              Caso sua corretora aplique bloqueio por país ou IP, o tráfego de ordens é roteado por este túnel criptografado.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Escudo Criptográfico Ativo</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors text-xs shadow-lg shadow-emerald-500/20"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{saveSuccess ? 'Blindagem Aplicada!' : 'Salvar Blindagem'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
