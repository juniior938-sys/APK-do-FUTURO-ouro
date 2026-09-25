import React from 'react';
import { MobileStatusBar } from './MobileStatusBar';

interface MobileDeviceChassisProps {
  children: React.ReactNode;
  time?: string;
  className?: string;
  showHomeIndicator?: boolean;
}

export const MobileDeviceChassis: React.FC<MobileDeviceChassisProps> = ({
  children,
  time = '10:09 AM',
  className = '',
  showHomeIndicator = true,
}) => {
  return (
    <div
      className={`relative mx-auto flex flex-col overflow-hidden select-none transition-all duration-300 ${className}`}
      style={{
        width: '100%',
        maxWidth: '390px',
        height: '844px',
        maxHeight: '100vh',
        borderRadius: '48px',
        background: '#040b15',
        boxShadow:
          '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 10px #1a2230, 0 0 0 12px #2d3748, 0 0 30px rgba(8, 145, 178, 0.15)',
      }}
    >
      {/* Outer Metallic Bezel Reflection Accent */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[48px] border border-cyan-500/10 z-50"
        style={{
          boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.15)',
        }}
      />

      {/* iOS Status Bar with Dynamic Island */}
      <MobileStatusBar time={time} />

      {/* Main Screen Content Viewport */}
      <div className="relative flex-1 flex flex-col overflow-hidden z-20">
        {children}
      </div>

      {/* Bottom Home Indicator Bar */}
      {showHomeIndicator && (
        <div className="w-full pb-2 pt-1 bg-[#050e1a]/95 flex justify-center z-40 select-none">
          <div className="w-32 h-1 bg-slate-500/60 rounded-full" />
        </div>
      )}
    </div>
  );
};
