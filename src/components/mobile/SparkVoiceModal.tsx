import React, { useState, useEffect, useRef } from 'react';
import { voiceAssistant, VoiceMessage } from '../../services/voiceAssistant';

interface SparkVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol?: string;
}

export const SparkVoiceModal: React.FC<SparkVoiceModalProps> = ({
  isOpen,
  onClose,
  currentSymbol = 'EURUSD',
}) => {
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'welcome',
      sender: 'spark_ai',
      text: 'Voz Institucional Spark-X2.5 IA pronta. Pergunte diretamente se deve Comprar ou Vender para receber o sinal exato no tempo certo com confluência de 62 indicadores TradingView.',
      timestamp: Date.now(),
    },
  ]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'connecting'>('idle');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    voiceAssistant.setOnMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    voiceAssistant.setOnStatusChange((st) => {
      setStatus(st);
      setIsLiveActive(voiceAssistant.isLive());
    });

    return () => {
      voiceAssistant.setOnMessage(() => {});
      voiceAssistant.setOnStatusChange(() => {});
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Connect Live voice session
      voiceAssistant.startLiveSession().then((started) => {
        setIsLiveActive(started);
      });
    } else {
      voiceAssistant.stopLiveSession();
      setIsLiveActive(false);
    }
  }, [isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  if (!isOpen) return null;

  const handleAsk = (query: string) => {
    voiceAssistant.sendQuery(query);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    voiceAssistant.sendQuery(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-cyan-950 border border-cyan-400">
              <span className={`w-3 h-3 rounded-full ${status === 'speaking' ? 'bg-emerald-400 animate-ping' : status === 'listening' ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-500'}`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white tracking-wide">
                  VOZ SPARK-X2.5 IA
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  LIVE API
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                62 Indicadores TradingView • Mercado Aberto
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Live Visualizer Status Banner */}
        <div className="px-4 py-3 bg-black/50 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 h-4">
              {[40, 70, 95, 60, 85, 45, 90, 65, 30].map((h, i) => (
                <span
                  key={i}
                  style={{
                    height: status === 'speaking' || status === 'listening' ? `${h}%` : '20%',
                  }}
                  className={`w-1 rounded-full transition-all duration-150 ${status === 'speaking' ? 'bg-emerald-400' : status === 'listening' ? 'bg-cyan-400' : 'bg-slate-600'}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono text-cyan-300">
              {status === 'speaking'
                ? '🔊 IA Respondendo com Certeza...'
                : status === 'listening'
                ? '🎙️ Ouvindo sua voz em tempo real...'
                : status === 'connecting'
                ? '⚡ Conectando Live Audio...'
                : 'Pronto para responder'}
            </span>
          </div>

          <span className="text-[10px] font-bold text-amber-300 font-mono">
            96% Precisão
          </span>
        </div>

        {/* Quick Query Direct Chips */}
        <div className="p-2.5 bg-slate-950 border-b border-slate-800/80">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Perguntas Rápidas de Alta Certeza:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleAsk(`Devo comprar ou vender ${currentSymbol}?`)}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-[10px] font-bold text-cyan-300 text-left transition flex items-center justify-between"
            >
              <span>{currentSymbol}: Comprar ou Vender?</span>
              <span>⚡</span>
            </button>
            <button
              onClick={() => handleAsk('Devo comprar ou vender XAUUSD Ouro agora?')}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-amber-950 border border-slate-700 hover:border-amber-400 text-[10px] font-bold text-amber-300 text-left transition flex items-center justify-between"
            >
              <span>XAUUSD: Comprar ou Vender?</span>
              <span>🪙</span>
            </button>
            <button
              onClick={() => handleAsk('Devo comprar ou vender BTCUSD Bitcoin?')}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-400 text-[10px] font-bold text-emerald-300 text-left transition flex items-center justify-between"
            >
              <span>BTCUSD: Comprar ou Vender?</span>
              <span>₿</span>
            </button>
            <button
              onClick={() => handleAsk('Status dos 62 indicadores TradingView')}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-purple-950 border border-slate-700 hover:border-purple-400 text-[10px] font-bold text-purple-300 text-left transition flex items-center justify-between"
            >
              <span>62 Indicadores TradingView</span>
              <span>📊</span>
            </button>
          </div>
        </div>

        {/* Conversation Box */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 min-h-[160px] text-xs font-sans">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {m.sender === 'user' ? 'Você' : 'Spark-X2.5 IA'}
                </span>
                {m.action && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-black ${m.action === 'BUY' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}`}
                  >
                    {m.action === 'BUY' ? 'COMPRA / BUY' : 'VENDA / SELL'}
                  </span>
                )}
              </div>
              <div
                className={`p-2.5 rounded-xl max-w-[90%] text-[11px] leading-relaxed ${m.sender === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'}`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar & Mic Status */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form onSubmit={handleSendText} className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite ou fale: 'Comprar ou vender EURUSD?'"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-lg transition"
            >
              Enviar
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
            <span>🎙️ Microfone ativo e confluência em tempo real</span>
            <span className="text-emerald-400 font-bold">100% Mercado Aberto</span>
          </div>
        </div>
      </div>
    </div>
  );
};
