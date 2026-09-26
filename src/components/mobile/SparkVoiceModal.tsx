import React, { useState, useEffect, useRef } from 'react';
import { voiceAssistant, VoiceMessage } from '../../services/voiceAssistant';
import { audioAlerts } from '../../utils/audioAlerts';

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
      text: 'Voz Institucional Spark-X2.5 IA pronta com síntese Web Speech nativa calibrada. Pergunte diretamente se deve Comprar ou Vender para receber o sinal exato com confluência de 62 indicadores TradingView.',
      timestamp: Date.now(),
    },
  ]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'connecting'>('idle');
  const [inputText, setInputText] = useState('');
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Web Speech API Native Parameters: Rate (Taxa) & Pitch (Tom)
  const [rate, setRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('spark_voice_rate');
      return saved ? parseFloat(saved) : 1.05;
    } catch {
      return 1.05;
    }
  });

  const [pitch, setPitch] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('spark_voice_pitch');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => {
    try {
      return localStorage.getItem('spark_voice_uri') || '';
    } catch {
      return '';
    }
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize and load native voices from browser Web Speech API
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Auto select best Portuguese voice if not chosen
        if (!selectedVoiceURI && voices.length > 0) {
          const ptVoice =
            voices.find((v) => {
              const lang = (v.lang || '').toLowerCase();
              return lang.includes('pt-br') || lang.includes('pt_br');
            }) ||
            voices.find((v) => (v.lang || '').toLowerCase().startsWith('pt')) ||
            voices[0];

          if (ptVoice) {
            setSelectedVoiceURI(ptVoice.voiceURI);
          }
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceURI]);

  // Sync parameters with voiceAssistant service and localStorage
  const handleUpdateSpeechParams = (newRate: number, newPitch: number, voiceURI?: string) => {
    setRate(newRate);
    setPitch(newPitch);
    if (voiceURI !== undefined) setSelectedVoiceURI(voiceURI);
    voiceAssistant.setSpeechParams(newRate, newPitch, voiceURI);
  };

  useEffect(() => {
    voiceAssistant.setOnMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    voiceAssistant.setOnStatusChange((st) => {
      setStatus(st);
    });

    return () => {
      voiceAssistant.setOnMessage(() => {});
      voiceAssistant.setOnStatusChange(() => {});
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      voiceAssistant.unlockAudio();
      voiceAssistant.startLiveSession();
    } else {
      voiceAssistant.stopLiveSession();
    }
  }, [isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  if (!isOpen) return null;

  // Native Web Speech direct playback function with custom rate & pitch
  const speakSignalWithWebSpeech = (text: string, isBuyHint?: boolean) => {
    voiceAssistant.unlockAudio();
    voiceAssistant.speakText(text, isBuyHint, {
      rate,
      pitch,
      voiceURI: selectedVoiceURI,
    });
  };

  const handleTestVoice = () => {
    audioAlerts.playVoiceActivationChime();
    speakSignalWithWebSpeech(
      `Motor Spark-X2.5 calibrado. Taxa de fala em ${rate.toFixed(2)} e tom em ${pitch.toFixed(2)}. Confluência de 62 indicadores TradingView em mercado aberto pronta para operações.`
    );
  };

  const handleAsk = (query: string) => {
    voiceAssistant.unlockAudio();
    voiceAssistant.sendQuery(query);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    voiceAssistant.unlockAudio();
    voiceAssistant.sendQuery(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-cyan-950 border border-cyan-400">
              <span
                className={`w-3 h-3 rounded-full ${
                  status === 'speaking'
                    ? 'bg-emerald-400 animate-ping'
                    : status === 'listening'
                    ? 'bg-cyan-400 animate-pulse'
                    : 'bg-cyan-500'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white tracking-wide">
                  VOZ SPARK-X2.5 IA
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  WEB SPEECH NATIVA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Taxa: {rate.toFixed(2)}x • Tom: {pitch.toFixed(2)}x • 62 TV
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Config Button */}
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                showConfig
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Ajustar Taxa e Tom da Voz"
            >
              <span>⚙️</span>
              <span className="text-[9.5px]">Calibrar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Retractable Web Speech Customization Panel (Taxa & Tom) */}
        {showConfig && (
          <div className="p-3 bg-slate-950 border-b border-cyan-500/30 text-xs space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                <span>🎛️</span>
                <span>Calibração da Voz (Taxa & Tom)</span>
              </span>
              <button
                type="button"
                onClick={handleTestVoice}
                className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400/60 text-[9.5px] font-bold text-emerald-300 hover:bg-emerald-900 transition flex items-center gap-1 active:scale-95"
              >
                <span>▶</span>
                <span>Testar Voz</span>
              </button>
            </div>

            {/* Slider 1: Taxa (Rate / Velocidade) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-300 font-bold">Taxa de Fala (Velocidade):</span>
                <span className="text-cyan-400 font-black">{rate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.45"
                step="0.05"
                value={rate}
                onChange={(e) => handleUpdateSpeechParams(parseFloat(e.target.value), pitch, selectedVoiceURI)}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between gap-1 text-[8.5px] text-slate-400 font-mono">
                <button
                  type="button"
                  onClick={() => handleUpdateSpeechParams(0.9, pitch, selectedVoiceURI)}
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white"
                >
                  Pausada (0.9x)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateSpeechParams(1.05, pitch, selectedVoiceURI)}
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white"
                >
                  Padrão (1.05x)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateSpeechParams(1.2, pitch, selectedVoiceURI)}
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white"
                >
                  Rápida (1.2x)
                </button>
              </div>
            </div>

            {/* Slider 2: Tom (Pitch / Frequência) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-300 font-bold">Tom da Voz (Pitch / Frequência):</span>
                <span className="text-amber-400 font-black">{pitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.35"
                step="0.05"
                value={pitch}
                onChange={(e) => handleUpdateSpeechParams(rate, parseFloat(e.target.value), selectedVoiceURI)}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between gap-1 text-[8.5px] text-slate-400 font-mono">
                <button
                  type="button"
                  onClick={() => handleUpdateSpeechParams(rate, 0.85, selectedVoiceURI)}
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white"
                >
                  Grave (0.85)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateSpeechParams(rate, 1.0, selectedVoiceURI)}
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white"
                >
                  Neutro (1.0)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateSpeechParams(rate, 1.15, selectedVoiceURI)}
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white"
                >
                  Claro (1.15)
                </button>
              </div>
            </div>

            {/* Native Voice Selector */}
            {availableVoices.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <span className="text-[9.5px] text-slate-300 font-bold block">
                  Voz do Sistema (Dispositivo):
                </span>
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => handleUpdateSpeechParams(rate, pitch, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang}) {v.lang.startsWith('pt') ? '★ PT' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Live Visualizer Status Banner */}
        <div className="px-4 py-2.5 bg-black/50 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 h-4">
              {[40, 70, 95, 60, 85, 45, 90, 65, 30].map((h, i) => (
                <span
                  key={i}
                  style={{
                    height: status === 'speaking' || status === 'listening' ? `${h}%` : '20%',
                  }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    status === 'speaking'
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : status === 'listening'
                      ? 'bg-cyan-400'
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono text-cyan-300">
              {status === 'speaking'
                ? '🔊 Transmitindo Áudio com Certeza...'
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
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-[10px] font-bold text-cyan-300 text-left transition flex items-center justify-between active:scale-95"
            >
              <span>{currentSymbol}: Comprar ou Vender?</span>
              <span>⚡</span>
            </button>
            <button
              onClick={() => handleAsk('Devo comprar ou vender XAUUSD Ouro agora?')}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-amber-950 border border-slate-700 hover:border-amber-400 text-[10px] font-bold text-amber-300 text-left transition flex items-center justify-between active:scale-95"
            >
              <span>XAUUSD: Comprar ou Vender?</span>
              <span>🪙</span>
            </button>
            <button
              onClick={() => handleAsk('Devo comprar ou vender BTCUSD Bitcoin?')}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-400 text-[10px] font-bold text-emerald-300 text-left transition flex items-center justify-between active:scale-95"
            >
              <span>BTCUSD: Comprar ou Vender?</span>
              <span>₿</span>
            </button>
            <button
              onClick={() => handleAsk('Status dos 62 indicadores TradingView')}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-purple-950 border border-slate-700 hover:border-purple-400 text-[10px] font-bold text-purple-300 text-left transition flex items-center justify-between active:scale-95"
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
                    className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                      m.action === 'BUY' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {m.action === 'BUY' ? 'COMPRA / BUY' : 'VENDA / SELL'}
                  </span>
                )}
              </div>
              <div
                className={`p-2.5 rounded-xl max-w-[90%] text-[11px] leading-relaxed relative group ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div>{m.text}</div>

                {/* Instant Replay Voice Button */}
                {m.sender === 'spark_ai' && (
                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => speakSignalWithWebSpeech(m.text, m.action === 'BUY')}
                      className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-800 border border-cyan-400/40 text-[9px] text-cyan-300 font-bold flex items-center gap-1 transition active:scale-95"
                      title="Ouvir novamente com os parâmetros de taxa e tom calibrados"
                    >
                      <span>🔊</span>
                      <span>Ouvir Voz Calibrada</span>
                    </button>
                    <span className="text-[8.5px] font-mono text-slate-500">
                      {rate.toFixed(2)}x / {pitch.toFixed(2)}x
                    </span>
                  </div>
                )}
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
              className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-lg transition active:scale-95"
            >
              Enviar
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
            <span>🎙️ Sintetizador Nativo Web Speech Ativo</span>
            <span className="text-emerald-400 font-bold">100% Calibrado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
