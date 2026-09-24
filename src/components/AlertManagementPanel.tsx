import React, { useState, useEffect } from 'react';
import { MarketAlert, AlertFilterType, SoundNoiseLevel, AlertSoundSettings } from '../types/signals';
import { audioAlerts } from '../utils/audioAlerts';
import {
  Bell,
  Volume2,
  Volume1,
  VolumeX,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Play,
  Check,
  Copy,
  Trash2,
  Sliders,
} from 'lucide-react';

interface AlertManagementPanelProps {
  alerts: MarketAlert[];
  selectedTypeFilter: AlertFilterType;
  onSelectTypeFilter: (filter: AlertFilterType) => void;
  onClearAlerts?: () => void;
  onDismissAlert?: (id: string) => void;
  onCopyAlert?: (alert: MarketAlert) => void;
}

export const AlertManagementPanel: React.FC<AlertManagementPanelProps> = ({
  alerts,
  selectedTypeFilter,
  onSelectTypeFilter,
  onClearAlerts,
  onCopyAlert,
}) => {
  const [settings, setSettings] = useState<AlertSoundSettings>(() => audioAlerts.getSettings());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setSettings(audioAlerts.getSettings());
  }, []);

  const handleNoiseLevelChange = (level: SoundNoiseLevel) => {
    audioAlerts.setNoiseLevel(level);
    setSettings(audioAlerts.getSettings());
  };

  const handleVolumeChange = (volPct: number) => {
    audioAlerts.setVolume(volPct / 100);
    setSettings(audioAlerts.getSettings());
  };

  const handleTest = (type: 'buy' | 'sell' | 'tp' | 'sl') => {
    audioAlerts.forceTestSound(type);
  };

  const handleCopy = (al: MarketAlert) => {
    if (onCopyAlert) {
      onCopyAlert(al);
    } else {
      navigator.clipboard.writeText(al.message);
    }
    setCopiedId(al.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredAlerts = alerts.filter((al) => {
    if (selectedTypeFilter === 'ALL') return true;
    if (selectedTypeFilter === 'BUY') return al.action.includes('BUY');
    if (selectedTypeFilter === 'SELL') return al.action.includes('SELL');
    if (selectedTypeFilter === 'EXIT_TP') return al.type === 'EXIT_TP';
    if (selectedTypeFilter === 'EXIT_SL') return al.type === 'EXIT_SL';
    return true;
  });

  return (
    <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-4 space-y-3.5 shadow-lg">
      {/* Top: Header & Noise Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Gerenciamento de Alertas & Notificações</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Filtre por tipo (Compra / Venda) e ajuste o volume sonoro das notificações
          </p>
        </div>

        {/* Noise Levels (Alto, Médio, Baixo, Mudo) */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => handleNoiseLevelChange('high')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              settings.noiseLevel === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'
            }`}
            title="Volume Máximo (95%)"
          >
            <Volume2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Alto</span>
          </button>
          <button
            type="button"
            onClick={() => handleNoiseLevelChange('medium')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              settings.noiseLevel === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
            title="Volume Equilibrado (55%)"
          >
            <Volume1 className="w-3.5 h-3.5 text-amber-400" />
            <span>Médio</span>
          </button>
          <button
            type="button"
            onClick={() => handleNoiseLevelChange('low')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              settings.noiseLevel === 'low' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
            title="Volume Baixo Suave (25%)"
          >
            <Volume1 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Baixo</span>
          </button>
          <button
            type="button"
            onClick={() => handleNoiseLevelChange('mute')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              settings.noiseLevel === 'mute' ? 'bg-slate-800 text-white border border-slate-600' : 'text-slate-400 hover:text-white'
            }`}
            title="Silencioso (Mudo)"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Mudo</span>
          </button>
        </div>
      </div>

      {/* Row: Filter by Type & Audio Quick Tests */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Filtrar:</span>
          <button
            type="button"
            onClick={() => onSelectTypeFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
              selectedTypeFilter === 'ALL'
                ? 'bg-slate-800 text-white font-bold border border-slate-700'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos ({alerts.length})
          </button>

          <button
            type="button"
            onClick={() => onSelectTypeFilter('BUY')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
              selectedTypeFilter === 'BUY'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Compras</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTypeFilter('SELL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
              selectedTypeFilter === 'SELL'
                ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-rose-300 border border-slate-800'
            }`}
          >
            <TrendingDown className="w-3 h-3 text-rose-400" />
            <span>Vendas</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTypeFilter('EXIT_TP')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
              selectedTypeFilter === 'EXIT_TP'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Target className="w-3 h-3 text-amber-400" />
            <span>Take Profit</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTypeFilter('EXIT_SL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
              selectedTypeFilter === 'EXIT_SL'
                ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-purple-300 border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-purple-400" />
            <span>Stop Loss</span>
          </button>
        </div>

        {/* Quick Test Sound Buttons & Volume slider */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px]">Volume:</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={Math.round(settings.volume * 100)}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              className="w-20 h-1.5 bg-slate-800 rounded accent-amber-400 cursor-pointer"
            />
            <span className="font-mono text-slate-300 text-[11px] w-7">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleTest('buy')}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-emerald-950/40 text-emerald-300 text-[10px] font-medium border border-slate-800 flex items-center gap-1 cursor-pointer"
              title="Testar som de Compra"
            >
              <Play className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
              <span>Som Compra</span>
            </button>
            <button
              type="button"
              onClick={() => handleTest('sell')}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-rose-950/40 text-rose-300 text-[10px] font-medium border border-slate-800 flex items-center gap-1 cursor-pointer"
              title="Testar som de Venda"
            >
              <Play className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
              <span>Som Venda</span>
            </button>
          </div>

          {alerts.length > 0 && onClearAlerts && (
            <button
              type="button"
              onClick={onClearAlerts}
              className="p-1 rounded text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
              title="Limpar histórico de alertas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filtered Alerts Feed */}
      {filteredAlerts.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-slate-800/60 max-h-56 overflow-y-auto pr-1">
          {filteredAlerts.slice(0, 5).map((al) => {
            const isBuy = al.action.includes('BUY');
            const isSell = al.action.includes('SELL');
            return (
              <div
                key={al.id}
                className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      isBuy ? 'bg-emerald-500/20 text-emerald-300' : isSell ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {al.action}
                  </span>
                  <span className="font-mono font-bold text-white">{al.symbol}</span>
                  <span className="text-slate-400 truncate max-w-xs">{al.message}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(al.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(al)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === al.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
                    <span>{copiedId === al.id ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
