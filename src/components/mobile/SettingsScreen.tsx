import React, { useState } from 'react';
import { audioAlerts } from '../../utils/audioAlerts';

interface SettingsScreenProps {
  onBack: () => void;
  onOpenProfile?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onOpenProfile,
}) => {
  const [pushAlerts, setPushAlerts] = useState(true);
  const [sinaisIA, setSinaisIA] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('Português');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setInfoMessage(msg);
    setTimeout(() => {
      setInfoMessage(null);
    }, 3500);
  };

  const toggleSound = () => {
    const next = !soundAlerts;
    setSoundAlerts(next);
    audioAlerts.setEnabled(next);
  };

  const handleFeedback = () => {
    showNotification('Obrigado pelo seu feedback! Registrado no sistema.');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-4 pb-3 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1 pb-3 relative z-10 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/60 active:scale-95 transition-all -ml-2"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h1 className="text-sm font-extrabold tracking-widest uppercase text-white">
          CONFIGURAÇÕES
        </h1>

        <div className="w-8" />
      </div>

      {/* Settings Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none pr-0.5">
        {/* Section 1: Notificações */}
        <div>
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 ml-1">
            Notificações
          </h2>
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 divide-y divide-slate-800/70 p-3 shadow-md">
            {/* Push Alerts */}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-white">Push Alerts</span>
              <button
                type="button"
                onClick={() => setPushAlerts(!pushAlerts)}
                className="flex items-center gap-2"
              >
                <span className={`text-[11px] font-bold ${pushAlerts ? 'text-amber-400' : 'text-slate-500'}`}>
                  {pushAlerts ? 'Ativado' : 'Desativado'}
                </span>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    pushAlerts ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-200 ease-in-out ${
                      pushAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Sinais IA */}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-white">Sinais IA</span>
              <button
                type="button"
                onClick={() => setSinaisIA(!sinaisIA)}
                className="flex items-center gap-2"
              >
                <span className={`text-[11px] font-bold ${sinaisIA ? 'text-amber-400' : 'text-slate-500'}`}>
                  {sinaisIA ? 'Ativado' : 'Desativado'}
                </span>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    sinaisIA ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-200 ease-in-out ${
                      sinaisIA ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Beep Sonoro */}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-white">Alertas Sonoros (Pips)</span>
              <button
                type="button"
                onClick={toggleSound}
                className="flex items-center gap-2"
              >
                <span className={`text-[11px] font-bold ${soundAlerts ? 'text-amber-400' : 'text-slate-500'}`}>
                  {soundAlerts ? 'Ativado' : 'Mudo'}
                </span>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    soundAlerts ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-200 ease-in-out ${
                      soundAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Conta */}
        <div>
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 ml-1">
            Conta
          </h2>
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 divide-y divide-slate-800/70 p-3 shadow-md">
            {/* Gerenciamento de Assinatura */}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-white">Gerenciamento de Assinatura</span>
              <span className="text-[11px] font-bold text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Premium Ativo
              </span>
            </div>

            {/* ID do Usuário */}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-white">ID do Usuário</span>
              <span className="text-xs font-mono font-bold text-slate-300">#78921</span>
            </div>

            {/* Alterar Senha */}
            <div
              onClick={() => showNotification('Instruções para redefinição de senha enviadas ao e-mail cadastrado.')}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-800/40 rounded px-1 -mx-1"
            >
              <span className="text-xs font-semibold text-white">Alterar Senha</span>
              <span className="text-slate-500 text-sm">›</span>
            </div>

            {/* Sair */}
            <div
              onClick={() => showNotification('Sessão encerrada com segurança.')}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-rose-950/20 rounded px-1 -mx-1"
            >
              <span className="text-xs font-semibold text-rose-400">Sair</span>
              <span className="text-xs font-bold text-rose-400">Sair</span>
            </div>
          </div>
        </div>

        {/* Section 3: Preferências */}
        <div>
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 ml-1">
            Preferências
          </h2>
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 divide-y divide-slate-800/70 p-3 shadow-md">
            {/* Moeda Base */}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-white">Moeda Base</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-slate-950 text-slate-200 text-xs font-semibold px-2 py-1 rounded border border-slate-800 outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="BRL">BRL (R$)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            {/* Idioma */}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-white">Idioma</span>
              <span className="text-xs font-semibold text-slate-300">{language}</span>
            </div>

            {/* Tema */}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-white">Tema</span>
              <span className="text-xs font-semibold text-cyan-400">Modo Escuro - Ativo</span>
            </div>
          </div>
        </div>

        {/* Section 4: Suporte */}
        <div>
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 ml-1">
            Suporte
          </h2>
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 divide-y divide-slate-800/70 p-3 shadow-md">
            <div
              onClick={() => showNotification('Central de Ajuda 24/7 conectada. Documentação dos sinais carregada.')}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-800/40 rounded px-1 -mx-1"
            >
              <span className="text-xs font-semibold text-white">Central de Ajuda</span>
              <span className="text-slate-500 text-sm">›</span>
            </div>

            <div
              onClick={() => showNotification('Termos de Serviço: Sinais informativos para traders profissionais.')}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-800/40 rounded px-1 -mx-1"
            >
              <span className="text-xs font-semibold text-white">Termos de Serviço</span>
              <span className="text-slate-500 text-sm">›</span>
            </div>

            <div
              onClick={handleFeedback}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-800/40 rounded px-1 -mx-1"
            >
              <span className="text-xs font-semibold text-white">Feedback</span>
              <span className="text-slate-500 text-sm">›</span>
            </div>
          </div>
        </div>

        {infoMessage && (
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs text-center font-medium shadow-lg animate-fade-in">
            {infoMessage}
          </div>
        )}
      </div>
    </div>
  );
};
