import React, { useState } from 'react';
import {
  X,
  Server,
  Key,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  Cpu,
  Layers,
  PlusCircle,
  Shield,
  Wifi,
  Radio,
  ExternalLink,
  Info,
} from 'lucide-react';
import { BrokerCredentials, ConnectionProtocol, AccountMode, ExnessAccountType } from '../types/mt5';
import { EXNESS_ACCOUNT_SPECS } from '../utils/goldMath';
import { SUPPORTED_SYMBOLS } from '../types/symbols';

interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: BrokerCredentials;
  onSave: (creds: BrokerCredentials) => void;
  isConnecting: boolean;
}

const BROKER_PRESETS = [
  { name: 'Exness', defaultServer: 'Exness-Real25', demoServer: 'Exness-Trial', symbol: 'XAUUSDm', isCustom: false },
  { name: 'IC Markets', defaultServer: 'ICMarketsSC-Live01', demoServer: 'ICMarketsSC-Demo01', symbol: 'XAUUSD', isCustom: false },
  { name: 'XM Global', defaultServer: 'XMGlobal-Real 54', demoServer: 'XMGlobal-Demo 02', symbol: 'GOLD', isCustom: false },
  { name: 'Pepperstone', defaultServer: 'Pepperstone-Live01', demoServer: 'Pepperstone-Demo01', symbol: 'XAUUSD', isCustom: false },
  { name: 'FBS', defaultServer: 'FBS-Real-1', demoServer: 'FBS-Demo', symbol: 'XAUUSD', isCustom: false },
  { name: 'RoboForex', defaultServer: 'RoboForex-Pro', demoServer: 'RoboForex-Demo', symbol: 'XAUUSD', isCustom: false },
  { name: 'FTMO', defaultServer: 'FTMO-Server', demoServer: 'FTMO-Demo', symbol: 'XAUUSD', isCustom: false },
  { name: 'Qualquer Corretora', defaultServer: 'Custom-Server-Live', demoServer: 'Custom-Server-Demo', symbol: 'XAUUSD', isCustom: true },
];

export const BrokerModal: React.FC<BrokerModalProps> = ({
  isOpen,
  onClose,
  credentials,
  onSave,
  isConnecting,
}) => {
  const [formData, setFormData] = useState<BrokerCredentials>({
    ...credentials,
    serverHost: credentials.serverHost || '',
    serverPort: credentials.serverPort || 443,
    isCustomBroker: credentials.isCustomBroker || false,
    proxyShieldUrl: credentials.proxyShieldUrl || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(formData.isCustomBroker || false);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: typeof BROKER_PRESETS[0]) => {
    if (preset.isCustom) {
      setIsCustomMode(true);
      setFormData((prev) => ({
        ...prev,
        brokerName: 'Minha Corretora Personalizada',
        server: prev.accountMode === 'real' ? 'Custom-Real-01' : 'Custom-Demo-01',
        isCustomBroker: true,
        serverHost: prev.serverHost || 'mt5.broker-server.com',
        serverPort: prev.serverPort || 443,
      }));
    } else {
      setIsCustomMode(false);
      setFormData((prev) => ({
        ...prev,
        brokerName: preset.name,
        server: prev.accountMode === 'real' ? preset.defaultServer : preset.demoServer,
        isCustomBroker: false,
      }));
    }
  };

  const handleAccountTypeChange = (type: ExnessAccountType) => {
    setFormData((prev) => ({
      ...prev,
      accountType: type,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      isCustomBroker: isCustomMode,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Configurar Servidor MT5 / Qualquer Corretora</h2>
              <p className="text-xs text-slate-400">Exness, IC Markets, FBS, FTMO ou Servidor Personalizado com Blindagem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-medium">Selecione ou Adicione Corretora:</label>
              {isCustomMode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Modo Servidor Livre / Custom
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BROKER_PRESETS.map((preset) => {
                const isSelected = isCustomMode ? preset.isCustom : formData.brokerName === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-sm'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {preset.isCustom && <PlusCircle className="w-3 h-3 text-emerald-400" />}
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Broker Server Details */}
          {isCustomMode && (
            <div className="p-3.5 rounded-xl bg-emerald-950/15 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Configuração de Servidor Personalizado / IP Direto</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Host / Endereço IP do Servidor MT5:</label>
                  <input
                    type="text"
                    value={formData.serverHost || ''}
                    onChange={(e) => setFormData({ ...formData, serverHost: e.target.value })}
                    placeholder="Ex: mt5.suacorretora.com ou 185.120.45.10"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Porta MT5:</label>
                  <input
                    type="number"
                    value={formData.serverPort || 443}
                    onChange={(e) => setFormData({ ...formData, serverPort: Number(e.target.value) })}
                    placeholder="443 ou 1950"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Você pode conectar em <b>qualquer corretora do mundo</b> digitando o IP/host do servidor MT5 da sua corretora.
              </p>
            </div>
          )}

          {/* Exness Account Type Selector (Raw Spread, Zero, Standard, Cent, Pro) */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-slate-300 font-medium flex items-center justify-between">
              <span>Tipo de Execução / Perfil de Spread:</span>
              <span className="text-[10px] text-amber-400 font-mono">
                {EXNESS_ACCOUNT_SPECS[formData.accountType || 'raw_spread'].badge}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['raw_spread', 'zero', 'standard', 'standard_cent', 'pro'] as ExnessAccountType[]).map((type) => {
                const spec = EXNESS_ACCOUNT_SPECS[type];
                const isSelected = (formData.accountType || 'raw_spread') === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleAccountTypeChange(type)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500/60 bg-amber-500/10 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{spec.name.replace('Exness ', '')}</span>
                      <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-amber-300">
                        {spec.symbol}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-300 mt-1 font-mono">
                      Spread: <b className="text-amber-400">{spec.typicalSpreadPips.toFixed(1)} pips</b>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {spec.commissionPerLotUsd > 0 ? `Comissão: $${spec.commissionPerLotUsd}/lote` : 'Zero comissão'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Mode: Real vs Demo */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, accountMode: 'real' })}
              className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                formData.accountMode === 'real'
                  ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs">Conta Real</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Execução real no broker</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, accountMode: 'demo' })}
              className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                formData.accountMode === 'demo'
                  ? 'border-amber-500/50 bg-amber-950/20 text-amber-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs">Conta Demo</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Ambiente de teste sem risco</div>
            </button>
          </div>

          {/* Connection Protocol */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-slate-300 font-medium">Método de Conexão com o Terminal:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                className={`p-2 rounded-lg border cursor-pointer flex flex-col items-start gap-1 transition-colors ${
                  formData.protocol === 'simulation'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="protocol"
                  value="simulation"
                  checked={formData.protocol === 'simulation'}
                  onChange={() => setFormData({ ...formData, protocol: 'simulation' })}
                  className="sr-only"
                />
                <span className="font-semibold text-xs text-white">Simulador Web</span>
                <span className="text-[10px] text-slate-400">Instantâneo no navegador</span>
              </label>

              <label
                className={`p-2 rounded-lg border cursor-pointer flex flex-col items-start gap-1 transition-colors ${
                  formData.protocol === 'mt5_local_bridge'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="protocol"
                  value="mt5_local_bridge"
                  checked={formData.protocol === 'mt5_local_bridge'}
                  onChange={() => setFormData({ ...formData, protocol: 'mt5_local_bridge' })}
                  className="sr-only"
                />
                <span className="font-semibold text-xs text-white">Bridge Python Local</span>
                <span className="text-[10px] text-slate-400">Terminal MT5 via FastAPI</span>
              </label>

              <label
                className={`p-2 rounded-lg border cursor-pointer flex flex-col items-start gap-1 transition-colors ${
                  formData.protocol === 'metaapi_cloud'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="protocol"
                  value="metaapi_cloud"
                  checked={formData.protocol === 'metaapi_cloud'}
                  onChange={() => setFormData({ ...formData, protocol: 'metaapi_cloud' })}
                  className="sr-only"
                />
                <span className="font-semibold text-xs text-white">MetaAPI Cloud</span>
                <span className="text-[10px] text-slate-400">REST direto na nuvem</span>
              </label>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome da Corretora:</label>
                <input
                  type="text"
                  value={formData.brokerName}
                  onChange={(e) => setFormData({ ...formData, brokerName: e.target.value })}
                  placeholder="Ex: Exness ou Minha Corretora"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome do Servidor MT5:</label>
                <input
                  type="text"
                  value={formData.server}
                  onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                  placeholder="Ex: Exness-Real25 ou ICMarketsSC-Live01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Login / ID da Conta MT5:</label>
                <input
                  type="text"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  placeholder="Ex: 14258963"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Senha MT5:</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Sua senha de trader"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs font-mono pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 text-[10px]"
                  >
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Alavancagem da Conta:</label>
                <select
                  value={formData.leverage}
                  onChange={(e) => setFormData({ ...formData, leverage: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs font-mono"
                >
                  <option value={100}>1:100</option>
                  <option value={200}>1:200</option>
                  <option value={500}>1:500 (Padrão)</option>
                  <option value={1000}>1:1000</option>
                  <option value={2000}>1:2000</option>
                  <option value={0}>Ilimitada (1:2000+)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Blindagem & Túnel Proxy:</label>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-emerald-400 font-semibold text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Anti-Bloqueio Ativo</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Proteção L2</span>
                </div>
              </div>
            </div>

            {/* Protocol Specific Fields */}
            {formData.protocol === 'mt5_local_bridge' && (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <label className="block text-slate-300 font-medium">URL da Ponte Local FastAPI:</label>
                <input
                  type="text"
                  value={formData.bridgeUrl || 'http://localhost:8000/api'}
                  onChange={(e) => setFormData({ ...formData, bridgeUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs font-mono"
                  placeholder="http://localhost:8000/api"
                />
                <p className="text-[10px] text-slate-500">
                  O script Python <code className="text-amber-400">mt5_server.py</code> deve estar rodando na porta 8000 do seu computador ou VPS.
                </p>
              </div>
            )}

            {formData.protocol === 'metaapi_cloud' && (
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/30 text-blue-200 text-[11px] leading-relaxed">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Como obter Token e Account ID na MetaAPI:</span>
                    <ol className="list-decimal list-inside space-y-1 mt-1 text-slate-300">
                      <li>Acesse o painel <a href="https://app.metaapi.cloud" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline font-mono inline-flex items-center gap-0.5">app.metaapi.cloud <ExternalLink className="w-2.5 h-2.5 inline" /></a> e crie uma conta gratuita.</li>
                      <li>Vá em <b>API Access &gt; Tokens</b> e gere seu <b>Token de Acesso</b>.</li>
                      <li>Vá na aba <b>Accounts</b>, clique em <b>+ Add Account</b>, conecte sua conta MT5 e copie o <b>Account ID</b> gerado.</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium">Token MetaAPI:</label>
                    <a
                      href="https://app.metaapi.cloud/token"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5 hover:underline"
                    >
                      <span>Pegar Token</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={formData.metaApiToken || ''}
                    onChange={(e) => setFormData({ ...formData, metaApiToken: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    placeholder="Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium">Account ID MetaAPI:</label>
                    <a
                      href="https://app.metaapi.cloud"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5 hover:underline"
                    >
                      <span>Painel de Contas</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="text"
                    value={formData.metaApiAccountId || ''}
                    onChange={(e) => setFormData({ ...formData, metaApiAccountId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    placeholder="Ex: 8d9a2e1b-3f4c-4e8a-9a1b-c2d3e4f5a6b7"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isConnecting}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Conectando Servidor...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Salvar & Conectar Servidor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
