import React, { useState, useEffect } from 'react';
import { voiceAssistant, SpeakingState } from '../../services/voiceAssistant';

export const LiveVoiceAudioHUD: React.FC = () => {
  const [state, setState] = useState<SpeakingState>({
    isSpeaking: false,
    currentText: '',
  });

  useEffect(() => {
    voiceAssistant.setOnSpeakingState((st) => {
      setState(st);
    });
  }, []);

  if (!state.isSpeaking || !state.currentText) return null;

  return (
    <div className="fixed top-3 inset-x-3 z-50 max-w-sm mx-auto animate-fadeIn">
      <div className="p-2.5 rounded-2xl bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 border border-cyan-400 shadow-2xl shadow-cyan-500/30 flex items-center justify-between gap-3">
        {/* Animated Equalizer */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-0.5 h-5 px-1 bg-cyan-900/60 rounded-lg border border-cyan-400/40">
            {[40, 80, 100, 60, 90, 50].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className="w-1 bg-cyan-300 rounded-full animate-pulse"
              />
            ))}
          </div>
          <span className="text-xs font-black text-cyan-300 tracking-wider font-mono">
            VOZ IA
          </span>
        </div>

        {/* Text Scroll */}
        <div className="flex-1 min-w-0">
          <p className="text-[10.5px] font-medium text-slate-200 truncate">
            {state.currentText}
          </p>
          <span className="text-[8.5px] font-mono text-emerald-400 block">
            ● Transmitindo Áudio Spark-X2.5
          </span>
        </div>

        {/* Stop Button */}
        <button
          type="button"
          onClick={() => voiceAssistant.stopSpeaking()}
          className="shrink-0 px-2 py-1 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 hover:text-white text-[10px] font-bold transition active:scale-95"
        >
          Parar
        </button>
      </div>
    </div>
  );
};
