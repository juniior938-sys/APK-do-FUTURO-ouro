import React from 'react';

export const WaveRibbon: React.FC = () => {
  return (
    <div className="absolute top-12 left-0 right-0 h-44 overflow-hidden pointer-events-none select-none z-0 opacity-80">
      <svg
        viewBox="0 0 400 160"
        className="w-full h-full"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="goldWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="cyanWaveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
          </linearGradient>

          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Wavy line threads mimicking mathematical sine-harmonic ribbons */}
        {Array.from({ length: 9 }).map((_, i) => {
          const offset = i * 4;
          const yStart = 60 + i * 2.5;
          const yMid1 = 40 + i * 4.5;
          const yMid2 = 90 - i * 3;
          const yEnd = 50 + i * 2;
          const strokeCol = i % 2 === 0 ? 'url(#goldWaveGrad)' : 'url(#cyanWaveGrad)';
          const strokeWidth = i === 4 ? 1.4 : 0.8;
          const opacity = 0.25 + (i / 9) * 0.55;

          return (
            <path
              key={i}
              d={`M -20 ${yStart} C 90 ${yMid1}, 210 ${yMid2}, 420 ${yEnd}`}
              stroke={strokeCol}
              strokeWidth={strokeWidth}
              opacity={opacity}
              fill="none"
              filter={i === 4 ? 'url(#softGlow)' : undefined}
            />
          );
        })}

        {/* Complementary counter-wave */}
        {Array.from({ length: 6 }).map((_, i) => {
          const yStart = 85 - i * 2;
          const yMid1 = 110 - i * 3.5;
          const yMid2 = 45 + i * 4;
          const yEnd = 95 - i * 2;
          return (
            <path
              key={`c-${i}`}
              d={`M -10 ${yStart} C 120 ${yMid1}, 250 ${yMid2}, 410 ${yEnd}`}
              stroke="url(#goldWaveGrad)"
              strokeWidth="0.75"
              opacity={0.3 + i * 0.1}
              fill="none"
            />
          );
        })}
      </svg>
    </div>
  );
};
