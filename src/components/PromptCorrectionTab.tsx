import React, { useState } from 'react';
import { BrokerCredentials } from '../types/mt5';
import { generateCorrectedPrompt } from '../utils/promptTemplate';
import { Copy, Check, Download, Sparkles, Terminal, Shield, ArrowRight, Server, Key, AlertCircle } from 'lucide-react';

interface PromptCorrectionTabProps {
  credentials: BrokerCredentials;
  onUpdateCredentials: (creds: BrokerCredentials) => void;
  symbol: string;
  onUpdateSymbol: (sym: string) => void;
}

export const PromptCorrectionTab: React.FC<PromptCorrectionTabProps> = ({
  credentials,
  onUpdateCredentials,
  symbol,
  onUpdateSymbol,
}) => {
  const [copied, setCopied] = useState(false);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [maxDailyLoss, setMaxDailyLoss] = useState<number>(150);
  const [maxSpread, setMaxSpread] = useState<number>(3.5);
  const [defaultLot, setDefaultLot] = useState<number>(0.05);

  const promptText = generateCorrectedPrompt({
    broker: credentials,
    symbol,
    timeframe: 'M5',
    riskPercent,
    maxDailyLossUsd: maxDailyLoss,
    maxSpreadPips: maxSpread,
    defaultLot,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([promptText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt_mt5_xauusd_${credentials.brokerName.toLowerCase() || 'corretora'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
                <Terminal className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white">
                Prompt Corrigido para MT5 & XAUUSD (Operação Direta da Web)
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              O prompt original que você enviou foi desenhado exclusivamente para a corretora americana <b>Alpaca</b> (ações e Bitcoin em dólares).
              Abaixo está o prompt 100% corrigido e reestruturado para a <b>API do MetaTrader 5 (MT5)</b>, adaptado para as especificações contratuais do <b>XAUUSD (Ouro 100oz)</b> com os seus dados de corretora injetados!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado para a Área de Transferência!' : 'Copiar Prompt Completo'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-2 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .md</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Grid: O que mudou */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="text-rose-400 font-bold flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>1. Corretora: Alpaca ➔ MT5</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            A Alpaca usa chaves REST <code className="text-slate-400">PK...</code> e não opera Forex/Ouro. O MT5 utiliza <b>Servidor, Login e Senha</b> com execução via terminal nativo ou MetaAPI Cloud.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="text-amber-400 font-bold flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>2. Ativo: BTC/USD ➔ XAUUSD</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            No Ouro, 1 lote = 100 onças troy. 1 pip equivale a $0.10 de oscilação ($10 por pip em 1.00 lote). As travas de alavancagem e margem foram recalculadas.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>3. Operação Direta do Site</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Navegadores não executam arquivos <code className="text-slate-400">.exe</code> do MT5 diretamente. Foi adicionada a ponte <b>FastAPI/Python Local</b> e o conector <b>MetaAPI Cloud</b>.
          </p>
        </div>
      </div>

      {/* Live Form to customize Prompt Variables */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Server className="w-4 h-4 text-amber-400" />
          <span>Personalizar Dados da Sua Corretora no Prompt</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Nome da Corretora:</label>
            <input
              type="text"
              value={credentials.brokerName}
              onChange={(e) => onUpdateCredentials({ ...credentials, brokerName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
              placeholder="Ex: Exness"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Servidor MT5:</label>
            <input
              type="text"
              value={credentials.server}
              onChange={(e) => onUpdateCredentials({ ...credentials, server: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
              placeholder="Ex: Exness-Real25"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Login MT5 (Número da Conta):</label>
            <input
              type="text"
              value={credentials.login}
              onChange={(e) => onUpdateCredentials({ ...credentials, login: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
              placeholder="Ex: 14258963"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Símbolo do Ouro:</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => onUpdateSymbol(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
              placeholder="XAUUSD, GOLD, XAUUSDm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Lote Inicial Padrão:</label>
            <input
              type="number"
              step="0.01"
              value={defaultLot}
              onChange={(e) => setDefaultLot(parseFloat(e.target.value) || 0.05)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Perda Máxima Diária ($ USD):</label>
            <input
              type="number"
              value={maxDailyLoss}
              onChange={(e) => setMaxDailyLoss(parseFloat(e.target.value) || 150)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Spread Máximo Aceitável (Pips):</label>
            <input
              type="number"
              step="0.5"
              value={maxSpread}
              onChange={(e) => setMaxSpread(parseFloat(e.target.value) || 3.5)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Full Prompt Display Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <span className="font-mono text-xs text-slate-300 font-medium">
            Código do Prompt (Pronto para colar no Claude Code / Terminal)
          </span>
          <button
            onClick={handleCopy}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        <pre className="p-6 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px] select-all bg-slate-950">
          {promptText}
        </pre>
      </div>
    </div>
  );
};
