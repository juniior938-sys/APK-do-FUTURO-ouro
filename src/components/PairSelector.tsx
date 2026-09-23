import React from 'react';
import { SUPPORTED_SYMBOLS, SymbolSpec, getSymbolSpec } from '../types/symbols';
import { Check, ChevronDown, Sparkles, TrendingUp, Layers } from 'lucide-react';

interface PairSelectorProps {
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  allowedSymbols?: string[];
  onToggleAllowedSymbol?: (symbol: string) => void;
}

export const PairSelector: React.FC<PairSelectorProps> = ({
  activeSymbol,
  onSelectSymbol,
  allowedSymbols,
  onToggleAllowedSymbol,
}) => {
  const currentSpec = getSymbolSpec(activeSymbol);
  const symbolsList = Object.values(SUPPORTED_SYMBOLS);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mr-1 shrink-0">
        <Layers className="w-3 h-3 text-amber-400" />
        <span>Paridade:</span>
      </span>

      {symbolsList.map((spec) => {
        const isSelected = spec.symbol === currentSpec.symbol || spec.symbol === activeSymbol;
        const isAllowed = allowedSymbols ? allowedSymbols.includes(spec.symbol) : true;

        return (
          <button
            key={spec.symbol}
            onClick={() => onSelectSymbol(spec.symbol)}
            title={`${spec.name} - Spread típico: ${spec.typicalSpreadPips} pips`}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              isSelected
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105 ring-1 ring-amber-300'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <span>{spec.icon}</span>
            <span>{spec.symbol}</span>
            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />}
          </button>
        );
      })}
    </div>
  );
};

interface PairModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  allowedSymbols: string[];
  onToggleAllowedSymbol: (symbol: string) => void;
}

export const PairSelectorModal: React.FC<PairModalProps> = ({
  isOpen,
  onClose,
  activeSymbol,
  onSelectSymbol,
  allowedSymbols,
  onToggleAllowedSymbol,
}) => {
  if (!isOpen) return null;

  const categories: { key: string; label: string; icon: string }[] = [
    { key: 'metals', label: 'Metais Preciosos', icon: '🪙' },
    { key: 'forex', label: 'Moedas Forex Majors', icon: '💱' },
    { key: 'crypto', label: 'Criptoativos 24/7', icon: '₿' },
    { key: 'indices', label: 'Índices Norte-Americanos', icon: '📈' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Paridades & Ativos para Negociação</h2>
              <p className="text-xs text-slate-400">Selecione o ativo principal ou habilite a cesta de pares do robô HFT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {categories.map((cat) => {
            const symbols = Object.values(SUPPORTED_SYMBOLS).filter((s) => s.category === cat.key);
            if (symbols.length === 0) return null;

            return (
              <div key={cat.key} className="space-y-2">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs border-b border-slate-800/80 pb-1">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {symbols.map((spec) => {
                    const isCurrent = activeSymbol.startsWith(spec.symbol);
                    const isAllowed = allowedSymbols.includes(spec.symbol);

                    return (
                      <div
                        key={spec.symbol}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                          isCurrent
                            ? 'border-amber-500/60 bg-amber-500/10 text-white'
                            : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{spec.icon}</span>
                            <div>
                              <div className="font-bold text-xs text-white font-mono">{spec.symbol}</div>
                              <div className="text-[10px] text-slate-400">{spec.name}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSymbol(spec.symbol);
                              onClose();
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                              isCurrent
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isCurrent ? 'Ativo Agora' : 'Operar'}
                          </button>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Spread: <b className="text-amber-400">{spec.typicalSpreadPips} pips</b></span>
                          <span>Contrato: <b className="text-slate-300">{spec.contractSize}</b></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-end bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
