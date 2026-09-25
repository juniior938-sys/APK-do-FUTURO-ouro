import React from 'react';
import { Home, TrendingUp, Settings, User } from 'lucide-react';

export type MobileTab = 'home' | 'signals' | 'settings' | 'profile' | 'processing';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <nav className="relative z-40 h-[64px] bg-[#070c18]/95 backdrop-blur-md border-t border-slate-800/80 px-4 flex items-center justify-around shrink-0">
      {/* Home Tab */}
      <button
        type="button"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer py-1 px-3 rounded-xl ${
          activeTab === 'home'
            ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-cyan-400 stroke-[2.5]' : ''}`} />
        <span className={`text-[10px] font-medium tracking-wide ${activeTab === 'home' ? 'font-bold text-cyan-300' : ''}`}>
          Home
        </span>
      </button>

      {/* Sinal Tab */}
      <button
        type="button"
        onClick={() => onSelectTab('signals')}
        className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer py-1 px-3 rounded-xl ${
          activeTab === 'signals'
            ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <TrendingUp className={`w-5 h-5 ${activeTab === 'signals' ? 'text-cyan-400 stroke-[2.5]' : ''}`} />
        <span className={`text-[10px] font-medium tracking-wide ${activeTab === 'signals' ? 'font-bold text-cyan-300' : ''}`}>
          Sinal
        </span>
      </button>

      {/* Configurações Tab */}
      <button
        type="button"
        onClick={() => onSelectTab('settings')}
        className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer py-1 px-3 rounded-xl ${
          activeTab === 'settings'
            ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-cyan-400 stroke-[2.5]' : ''}`} />
        <span className={`text-[10px] font-medium tracking-wide ${activeTab === 'settings' ? 'font-bold text-cyan-300' : ''}`}>
          Configurações
        </span>
      </button>

      {/* Perfil Tab */}
      <button
        type="button"
        onClick={() => onSelectTab('profile')}
        className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer py-1 px-3 rounded-xl ${
          activeTab === 'profile'
            ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <User className={`w-5 h-5 ${activeTab === 'profile' ? 'text-cyan-400 stroke-[2.5]' : ''}`} />
        <span className={`text-[10px] font-medium tracking-wide ${activeTab === 'profile' ? 'font-bold text-cyan-300' : ''}`}>
          Perfil
        </span>
      </button>
    </nav>
  );
};
