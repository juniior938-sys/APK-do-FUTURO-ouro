import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface MobileShellProps {
  children: React.ReactNode;
  timeString?: string;
  isInsideShowcase?: boolean;
}

export const MobileShell: React.FC<MobileShellProps> = ({
  children,
  timeString = '10:09 AM',
  isInsideShowcase = false,
}) => {
  return (
    <div
      className={`relative mx-auto flex flex-col bg-slate-950 text-white overflow-hidden shadow-2xl select-none transition-all duration-300 ${
        isInsideShowcase
          ? 'w-[360px] h-[780px] rounded-[50px] border-[10px] border-[#1f242e] ring-1 ring-slate-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]'
          : 'w-full max-w-[420px] min-h-[844px] h-[92vh] max-h-[896px] rounded-[52px] border-[12px] border-[#1b202a] ring-2 ring-amber-500/20 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_40px_rgba(245,158,11,0.1)]'
      }`}
    >
      {/* Glossy Edge Reflection */}
      <div className="absolute inset-0 rounded-[40px] pointer-events-none border border-white/10 z-50" />

      {/* Dynamic Island & Speaker */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[120px] h-[28px] bg-black rounded-full px-2 shadow-inner border border-white/10">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/50 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-cyan-500/60 animate-pulse" />
        </div>
        <div className="w-10 h-1 rounded-full bg-slate-800" />
        <div className="w-2.5 h-2.5 rounded-full bg-blue-950/80 border border-blue-600/30" />
      </div>

      {/* iOS Status Bar */}
      <div className="relative z-40 flex items-center justify-between px-7 pt-3.5 pb-2 text-[12px] font-semibold tracking-tight text-slate-300 shrink-0">
        <span className="font-mono text-slate-200 pl-1">{timeString}</span>
        <div className="flex items-center gap-1.5 pr-1">
          <Signal className="w-3.5 h-3.5 text-slate-300" />
          <Wifi className="w-3.5 h-3.5 text-slate-300" />
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* App Content Canvas */}
      <div className="relative flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#080d1a] via-[#091022] to-[#040711]">
        {children}
      </div>

      {/* iOS Home Bottom Gesture Bar */}
      <div className="relative z-50 h-5 w-full bg-[#040711] flex items-center justify-center shrink-0 pb-1">
        <div className="w-32 h-1 bg-slate-500/60 rounded-full" />
      </div>
    </div>
  );
};
