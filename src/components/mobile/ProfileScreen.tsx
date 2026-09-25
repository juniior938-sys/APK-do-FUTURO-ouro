import React from 'react';

interface ProfileScreenProps {
  onBack: () => void;
  onOpenSignalList: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onOpenSignalList,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden px-4 pb-3 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1 pb-3 relative z-10 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/60 active:scale-95 transition-all -ml-2"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h1 className="text-sm font-extrabold tracking-widest uppercase text-white">
          PERFIL DO TRADER
        </h1>

        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none pr-0.5">
        {/* User Badge Banner */}
        <div
          className="rounded-2xl p-4 border border-amber-500/40 shadow-lg relative flex items-center gap-3.5"
          style={{
            background: 'linear-gradient(135deg, #0e1e33 0%, #06111f 100%)',
          }}
        >
          <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-md shadow-amber-500/30 shrink-0">
            <div className="w-full h-full rounded-full bg-[#0a1829] flex items-center justify-center text-amber-300">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">Trader Pro Master</h2>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                VIP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: #78921</p>
            <p className="text-[11px] text-cyan-300 font-semibold mt-1">
              Licença Vitalícia Ativa
            </p>
          </div>
        </div>

        {/* Live Performance Matrix */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-3 shadow-md">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Métricas de Sinais IA
          </h3>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Acurácia IA</p>
              <p className="text-lg font-black text-cyan-300 mt-0.5">94.8%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Lucro Acumulado</p>
              <p className="text-lg font-black text-emerald-400 mt-0.5">+4,820 Pips</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Sinais Recebidos</p>
              <p className="text-lg font-black text-white mt-0.5">1,480</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Pares Monitorados</p>
              <p className="text-lg font-black text-amber-400 mt-0.5">7 Pares</p>
            </div>
          </div>
        </div>

        {/* Timeframes Support */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-3 shadow-md">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Timeframes Conectados
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {['M1', 'M5', 'M15', 'M30', 'H1', 'H4'].map((tf) => (
              <span
                key={tf}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-950 border border-slate-800 text-cyan-300"
              >
                {tf} • Ativo
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onOpenSignalList}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:brightness-105 transition-all active:scale-95"
        >
          Ver Histórico de Sinais
        </button>
      </div>
    </div>
  );
};
