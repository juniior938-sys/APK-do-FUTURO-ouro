import React from 'react';

interface MobileStatusBarProps {
  time?: string;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  time = '10:09 AM',
}) => {
  return (
    <div className="w-full h-11 pt-2 px-6 flex items-center justify-between text-xs text-slate-300 font-medium select-none z-30 shrink-0">
      {/* Time */}
      <span className="font-semibold tracking-tight text-[13px] text-white">
        {time}
      </span>

      {/* Dynamic Island / Speaker Pill cutout */}
      <div className="w-24 h-5 bg-black rounded-full border border-slate-900 shadow-inner flex items-center justify-end px-2.5 gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
      </div>

      {/* Indicators: Cellular, Wifi, Battery */}
      <div className="flex items-center gap-1.5 text-slate-300">
        {/* Cellular bars */}
        <div className="flex items-end gap-0.5 h-3">
          <span className="w-0.5 h-1 bg-slate-300 rounded-full" />
          <span className="w-0.5 h-1.5 bg-slate-300 rounded-full" />
          <span className="w-0.5 h-2 bg-slate-300 rounded-full" />
          <span className="w-0.5 h-2.5 bg-slate-300 rounded-full" />
        </div>

        {/* Wifi */}
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
          <path d="M12 3c-4.97 0-9.47 2.01-12.73 5.27l1.41 1.41C3.35 6.99 7.42 5.16 12 5.16s8.65 1.83 11.32 4.52l1.41-1.41C21.47 5.01 16.97 3 12 3zm0 4c-3.87 0-7.37 1.57-9.9 4.1l1.41 1.41C5.64 10.4 8.65 9 12 9s6.36 1.4 8.49 3.51l1.41-1.41C19.37 8.57 15.87 7 12 7zm0 4c-2.76 0-5.26 1.12-7.07 2.93l1.41 1.41C7.79 13.89 9.77 13 12 13s4.21.89 5.66 2.34l1.41-1.41C17.26 12.12 14.76 11 12 11zm0 4c-1.38 0-2.63.56-3.54 1.46L12 20l3.54-3.54C14.63 15.56 13.38 15 12 15z" />
        </svg>

        {/* Battery */}
        <div className="w-5 h-2.5 rounded-sm border border-slate-300 p-0.5 flex items-center">
          <div className="h-full w-3.5 bg-white rounded-2xs" />
        </div>
      </div>
    </div>
  );
};
