import React, { useState } from 'react';
import { audioAlerts } from '../../utils/audioAlerts';

interface CenterOrbButtonProps {
  onClick: () => void;
  isGenerating?: boolean;
}

export const CenterOrbButton: React.FC<CenterOrbButtonProps> = ({
  onClick,
  isGenerating = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    try {
      audioAlerts.playTestBeep();
    } catch {}
    onClick();
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-3 select-none">
      {/* Outer ambient blur glow */}
      <div className="absolute w-56 h-56 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />
      <div className="absolute w-44 h-44 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

      {/* Main Interactive Button Frame */}
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 outline-none focus:outline-none ${
          isPressed ? 'scale-95' : 'hover:scale-[1.02]'
        }`}
        style={{
          background: 'radial-gradient(circle, #081d33 0%, #030e1c 65%, #020712 100%)',
          boxShadow: '0 0 35px rgba(34, 211, 238, 0.25), inset 0 0 20px rgba(8, 145, 178, 0.4)',
        }}
      >
        {/* Animated Circular Orbit Arcs SVG */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            <linearGradient id="orbArcCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="orbArcGold" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
            </linearGradient>

            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="#0e304f"
            strokeWidth="2"
            strokeDasharray="4 6"
            opacity="0.6"
          />

          {/* Cyan Glowing Arc (Left/Top) */}
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="url(#orbArcCyan)"
            strokeWidth="3.5"
            strokeDasharray="140 440"
            strokeLinecap="round"
            filter="url(#arcGlow)"
            className={isGenerating ? 'animate-spin' : ''}
            style={{
              transformOrigin: 'center',
              animationDuration: '6s',
              animationTimingFunction: 'linear',
            }}
          />

          {/* Gold Glowing Arc (Right/Bottom) */}
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="url(#orbArcGold)"
            strokeWidth="3.5"
            strokeDasharray="110 470"
            strokeDashoffset="-200"
            strokeLinecap="round"
            filter="url(#arcGlow)"
            className={isGenerating ? 'animate-spin' : ''}
            style={{
              transformOrigin: 'center',
              animationDuration: '8s',
              animationTimingFunction: 'linear',
              animationDirection: 'reverse',
            }}
          />

          {/* Inner Dashed Ring */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="3 7"
            opacity="0.4"
          />

          {/* Glowing Orbiting Dots */}
          <circle cx="100" cy="8" r="3" fill="#22d3ee" filter="url(#arcGlow)" />
          <circle cx="192" cy="100" r="3" fill="#fbbf24" filter="url(#arcGlow)" />
        </svg>

        {/* Center Circular Badge */}
        <div
          className="relative w-20 h-20 rounded-full flex flex-col items-center justify-center mb-2"
          style={{
            background: 'radial-gradient(circle, #0284c7 0%, #032b49 70%, #021224 100%)',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.4), inset 0 0 12px rgba(34, 211, 238, 0.5)',
            border: '2px solid rgba(56, 189, 248, 0.6)',
          }}
        >
          {/* Brain / Microchip Icon Silhouette */}
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 text-cyan-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity="0.4" />
            <rect x="7" y="7" width="10" height="10" rx="2" stroke="#22d3ee" strokeWidth="2" fill="#032541" />
            <circle cx="12" cy="12" r="2" fill="#38bdf8" />
          </svg>

          {/* "IA" label inside badge */}
          <span className="text-[11px] font-black tracking-widest text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] -mt-0.5">
            IA
          </span>
        </div>

        {/* Inscribed Call to Action Text (Exact wording as in screenshot) */}
        <div className="flex flex-col items-center text-center px-4 z-10">
          <span className="text-[10px] font-extrabold tracking-wider text-slate-100 uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
            GERAR NOVO SINAL
          </span>
          <span className="text-[9px] font-bold tracking-widest text-cyan-300 uppercase drop-shadow-[0_0_6px_rgba(34,211,238,0.6)] mt-0.5">
            EM TEMPO REAL
          </span>
        </div>
      </button>
    </div>
  );
};
