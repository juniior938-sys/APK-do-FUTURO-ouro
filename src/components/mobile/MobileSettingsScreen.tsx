import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Cpu,
  ShieldCheck,
  Globe,
  Moon,
  HelpCircle,
  FileText,
  MessageSquare,
  LogOut,
  KeyRound,
  Check,
} from 'lucide-react';

interface MobileSettingsScreenProps {
  onBack: () => void;
}

export const MobileSettingsScreen: React.FC<MobileSettingsScreenProps> = ({ onBack }) => {
  const [pushAlerts, setPushAlerts] = useState(true);
  const [aiSignals, setAiSignals] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-14 left-4 right-4 z-50 p-2.5 rounded-xl bg-emerald-500 text-black text-xs font-black text-center shadow-lg animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* TOP HEADER: < CONFIGURAÇÕES */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#080e1c] shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xs font-semibold">Voltar</span>
        </button>

        <h1 className="text-sm font-black tracking-wider uppercase text-white">
          Configurações
        </h1>

        <div className="w-8" />
      </div>

      {/* SETTINGS CONTENT (100% IDENTICAL TO SCREEN 3) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {/* GROUP 1: NOTIFICAÇÕES */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
            Notificações
          </h2>
          <div className="rounded-2xl bg-[#091224] border border-slate-800/90 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
            {/* Push Alerts */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Push Alerts</span>
              <button
                type="button"
                onClick={() => {
                  setPushAlerts(!pushAlerts);
                  showToast(pushAlerts ? 'Alertas desativados' : 'Alertas ativados com som!');
                }}
                className={`relative w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                  pushAlerts ? 'bg-amber-400' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transition-transform transform ${
                    pushAlerts ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sinais IA */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Sinais IA</span>
              <button
                type="button"
                onClick={() => {
                  setAiSignals(!aiSignals);
                  showToast(aiSignals ? 'Sinais IA pausados' : 'Sinais IA ao vivo ativados!');
                }}
                className={`relative w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                  aiSignals ? 'bg-amber-400' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transition-transform transform ${
                    aiSignals ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* GROUP 2: CONTA */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
            Conta
          </h2>
          <div className="rounded-2xl bg-[#091224] border border-slate-800/90 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
            {/* Gerenciamento de Assinatura */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                Gerenciamento de Assinatura
              </span>
              <span className="text-[11px] font-black text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full">
                (Premium Ativo)
              </span>
            </div>

            {/* ID do Usuário */}
            <div className="p-3.5 flex items-center justify-between font-mono">
              <span className="text-xs font-bold text-slate-200">ID do Usuário</span>
              <span className="text-xs font-black text-slate-300">#78921</span>
            </div>

            {/* Alterar Senha */}
            <button
              type="button"
              onClick={() => showToast('Link de redefinição de senha enviado para o e-mail')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-200">Alterar Senha</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Sair */}
            <button
              type="button"
              onClick={() => showToast('Sessão encerrada com segurança')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
            >
              <span className="text-xs font-bold text-rose-400">Sair</span>
              <LogOut className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>

        {/* GROUP 3: PREFERÊNCIAS */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
            Preferências
          </h2>
          <div className="rounded-2xl bg-[#091224] border border-slate-800/90 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
            {/* Moeda Base */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Moeda Base</span>
              <span className="text-xs font-black text-cyan-400 font-mono">USD</span>
            </div>

            {/* Idioma */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Idioma</span>
              <span className="text-xs font-semibold text-slate-300">Português</span>
            </div>

            {/* Tema */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Tema</span>
              <span className="text-xs font-semibold text-slate-300">Modo Escuro - Ativo</span>
            </div>
          </div>
        </div>

        {/* GROUP 4: SUPORTE */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
            Suporte
          </h2>
          <div className="rounded-2xl bg-[#091224] border border-slate-800/90 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
            <button
              type="button"
              onClick={() => showToast('Central de Ajuda: Documentação e Vídeo Tutoriais')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-200">Central de Ajuda</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => showToast('Termos de Serviço: Gestão de Risco e Política de Execução')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-200">Termos de Serviço</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => showToast('Envie seu feedback diretamente aos desenvolvedores')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-200">Feedback</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
