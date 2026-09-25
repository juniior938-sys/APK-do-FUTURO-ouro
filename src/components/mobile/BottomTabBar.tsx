import React from 'react';
import { audioAlerts } from '../../utils/audioAlerts';

export type MobileTab = 'home' | 'sinal' | 'config' | 'perfil';

interface BottomTabBarProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const handleTabClick = (tab: MobileTab) => {
    try {
      audioAlerts.playTestBeep();
    } catch {}
    onChangeTab(tab);
  };

  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
      ),
    },
    {
      id: 'sinal',
      label: 'Sinal',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      id: 'config',
      label: 'Configurações',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="w-full bg-[#050e1a]/95 backdrop-blur-md border-t border-slate-800/80 px-3 pt-2 pb-5 flex items-center justify-around z-30 select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 outline-none ${
              isActive
                ? 'text-amber-400 font-semibold drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
              {tab.icon}
            </div>
            <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold text-amber-300' : 'font-normal'}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 shadow-[0_0_6px_#fbbf24]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
