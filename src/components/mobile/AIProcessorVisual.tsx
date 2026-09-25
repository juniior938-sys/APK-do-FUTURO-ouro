import React from 'react';

interface AIProcessorVisualProps {
  isPulsing?: boolean;
  size?: number;
}

export const AIProcessorVisual: React.FC<AIProcessorVisualProps> = ({
  isPulsing = true,
  size = 190,
}) => {
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />
      <div className="absolute inset-4 rounded-full bg-amber-500/10 blur-xl" />

      {/* Circuit Board SVG */}
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full relative z-10 ${isPulsing ? 'animate-pulse' : ''}`}
        style={{ animationDuration: '3s' }}
      >
        <defs>
          <linearGradient id="cyanGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="chipCenterGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#082f49" />
            <stop offset="60%" stopColor="#031525" />
            <stop offset="100%" stopColor="#020817" />
          </radialGradient>
        </defs>

        {/* Outer Circular Tracks */}
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke="#0284c7"
          strokeWidth="0.8"
          strokeDasharray="4 6"
          opacity="0.3"
        />
        <circle
          cx="100"
          cy="100"
          r="72"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1"
          strokeDasharray="3 5"
          opacity="0.5"
        />

        {/* Radiating Circuit Traces - Top */}
        <path d="M100 60 L100 20" stroke="#38bdf8" strokeWidth="1.6" filter="url(#glow)" fill="none" />
        <circle cx="100" cy="18" r="2.5" fill="#38bdf8" filter="url(#glow)" />
        
        <path d="M90 62 L90 40 L70 24" stroke="#0284c7" strokeWidth="1.3" fill="none" />
        <circle cx="70" cy="24" r="2" fill="#38bdf8" />

        <path d="M110 62 L110 40 L130 24" stroke="#0284c7" strokeWidth="1.3" fill="none" />
        <circle cx="130" cy="24" r="2" fill="#38bdf8" />

        {/* Radiating Circuit Traces - Bottom */}
        <path d="M100 140 L100 180" stroke="#38bdf8" strokeWidth="1.6" filter="url(#glow)" fill="none" />
        <circle cx="100" cy="182" r="2.5" fill="#38bdf8" filter="url(#glow)" />

        <path d="M90 138 L90 160 L70 176" stroke="#0284c7" strokeWidth="1.3" fill="none" />
        <circle cx="70" cy="176" r="2" fill="#38bdf8" />

        <path d="M110 138 L110 160 L130 176" stroke="#0284c7" strokeWidth="1.3" fill="none" />
        <circle cx="130" cy="176" r="2" fill="#38bdf8" />

        {/* Radiating Circuit Traces - Left */}
        <path d="M60 100 L20 100" stroke="#38bdf8" strokeWidth="1.6" filter="url(#glow)" fill="none" />
        <circle cx="18" cy="100" r="2.5" fill="#38bdf8" filter="url(#glow)" />

        <path d="M62 90 L40 90 L24 70" stroke="#0284c7" strokeWidth="1.3" fill="none" />
        <circle cx="24" cy="70" r="2" fill="#38bdf8" />

        <path d="M62 110 L40 110 L24 130" stroke="#0284c7" strokeWidth="1.3" fill="none" />
        <circle cx="24" cy="130" r="2" fill="#38bdf8" />

        {/* Radiating Circuit Traces - Right */}
        <path d="M140 100 L180 100" stroke="#38bdf8" strokeWidth="1.6" filter="url(#glow)" fill="none" />
        <circle cx="182" cy="100" r="2.5" fill="#38bdf8" filter="url(#glow)" />

        <path d="M138 90 L160 90 L176 70" stroke="#0284c7" strokeWidth="1.3" fill="none" />
        <circle cx="176" cy="70" r="2" fill="#38bdf8" />

        <path d="M138 110 L160 110 L176 130" stroke="#0284c7" strokeWidth="1.3" fill="none" />
        <circle cx="176" cy="130" r="2" fill="#38bdf8" />

        {/* Diagonal 45-degree circuit routes */}
        <path d="M72 72 L45 45" stroke="#38bdf8" strokeWidth="1.4" filter="url(#glow)" fill="none" />
        <circle cx="45" cy="45" r="2" fill="#38bdf8" />
        <path d="M45 45 L32 45" stroke="#0284c7" strokeWidth="1.2" fill="none" />
        <circle cx="32" cy="45" r="1.8" fill="#fbbf24" />

        <path d="M128 72 L155 45" stroke="#38bdf8" strokeWidth="1.4" filter="url(#glow)" fill="none" />
        <circle cx="155" cy="45" r="2" fill="#38bdf8" />
        <path d="M155 45 L168 45" stroke="#0284c7" strokeWidth="1.2" fill="none" />
        <circle cx="168" cy="45" r="1.8" fill="#fbbf24" />

        <path d="M72 128 L45 155" stroke="#38bdf8" strokeWidth="1.4" filter="url(#glow)" fill="none" />
        <circle cx="45" cy="155" r="2" fill="#38bdf8" />
        <path d="M45 155 L32 155" stroke="#0284c7" strokeWidth="1.2" fill="none" />
        <circle cx="32" cy="155" r="1.8" fill="#fbbf24" />

        <path d="M128 128 L155 155" stroke="#38bdf8" strokeWidth="1.4" filter="url(#glow)" fill="none" />
        <circle cx="155" cy="155" r="2" fill="#38bdf8" />
        <path d="M155 155 L168 155" stroke="#0284c7" strokeWidth="1.2" fill="none" />
        <circle cx="168" cy="155" r="1.8" fill="#fbbf24" />

        {/* Center Circular Microchip Body */}
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="url(#chipCenterGrad)"
          stroke="url(#cyanGoldGrad)"
          strokeWidth="2.5"
          filter="url(#glow)"
        />

        {/* Inner Tech Ring */}
        <circle
          cx="100"
          cy="100"
          r="32"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeDasharray="2 4"
          opacity="0.8"
        />

        {/* Brain / Microprocessor stylized silhouette */}
        <g transform="translate(100, 100) scale(0.9) translate(-24, -24)" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)">
          {/* Left Hemisphere */}
          <path d="M 21 12 C 16 12 12 16 12 21 C 12 23 13 25 14 26 C 12 28 11 31 12 34 C 13 37 16 39 19 39" />
          <path d="M 18 19 C 20 22 20 26 18 29" />
          <path d="M 14 26 L 20 26" />
          
          {/* Right Hemisphere */}
          <path d="M 27 12 C 32 12 36 16 36 21 C 36 23 35 25 34 26 C 36 28 37 31 36 34 C 35 37 32 39 29 39" />
          <path d="M 30 19 C 28 22 28 26 30 29" />
          <path d="M 34 26 L 28 26" />

          {/* Central Stem */}
          <line x1="24" y1="14" x2="24" y2="36" stroke="#fbbf24" strokeWidth="2" />
        </g>

        {/* Central "IA" Text */}
        <text
          x="100"
          y="104"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13"
          fontWeight="900"
          letterSpacing="1.5"
          fill="#38bdf8"
          filter="url(#glow)"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          IA
        </text>
      </svg>
    </div>
  );
};
