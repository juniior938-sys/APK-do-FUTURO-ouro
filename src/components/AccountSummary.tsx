import React from 'react';
import { AccountInfo, ExnessAccountType } from '../types/mt5';
import { formatUsd, EXNESS_ACCOUNT_SPECS } from '../utils/goldMath';
import { Wallet, DollarSign, Activity, Percent, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

interface AccountSummaryProps {
  account: AccountInfo;
  currentSpreadPips: number;
  bidPrice: number;
  askPrice: number;
  accountType?: ExnessAccountType;
  onOpenBrokerModal?: () => void;
}

export const AccountSummary: React.FC<AccountSummaryProps> = ({
  account,
  currentSpreadPips,
  bidPrice,
  askPrice,
  accountType = 'raw_spread',
  onOpenBrokerModal,
}) => {
  const isProfitPositive = account.floatingProfit >= 0;
  const spec = EXNESS_ACCOUNT_SPECS[accountType || account.accountType || 'raw_spread'];
  const isCent = spec.isCentAccount;
  const spreadStatus = currentSpreadPips <= 0.3 ? 'zero_raw' : currentSpreadPips <= 2.0 ? 'normal' : currentSpreadPips <= 3.5 ? 'warning' : 'high';

  return (
    <div className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-xs">
        {/* Account Financials */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
          {/* Exness Account Type Badge */}
          <button
            type="button"
            onClick={onOpenBrokerModal}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
            title="Alterar tipo de conta Exness (Raw, Zero, Standard, Cent)"
          >
            <Tag className="w-3 h-3 text-amber-400" />
            <span className="font-bold text-[11px]">{spec.name}</span>
            <span className="text-[10px] font-mono text-slate-400">({spec.symbol})</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Saldo:</span>
            <span className="font-mono font-semibold text-slate-100 tabular-nums">
              {isCent ? `${(account.balance * 100).toLocaleString('en-US')} USC ($${account.balance.toFixed(2)})` : formatUsd(account.balance)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Patrimônio:</span>
            <span className="font-mono font-semibold text-slate-100 tabular-nums">
              {isCent ? `${(account.equity * 100).toLocaleString('en-US')} USC` : formatUsd(account.equity)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">P&L Flutuante:</span>
            <span
              className={`font-mono font-bold tabular-nums flex items-center gap-0.5 ${
                isProfitPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isProfitPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {isCent ? `${(account.floatingProfit * 100).toFixed(0)} USC (${formatUsd(account.floatingProfit, true)})` : formatUsd(account.floatingProfit, true)}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span className="text-slate-400 font-medium">Margem Livre:</span>
            <span className="font-mono text-slate-300 tabular-nums">
              {formatUsd(account.freeMargin)}
            </span>
          </div>
        </div>

        {/* Live Gold Ticker & Server Telemetry */}
        <div className="flex items-center gap-3 text-xs font-mono ml-auto">
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-md">
            <span className="text-slate-400 font-sans font-medium text-[11px]">{spec.symbol}:</span>
            <span className="text-emerald-400 font-bold tabular-nums">{bidPrice.toFixed(2)}</span>
            <span className="text-slate-500">/</span>
            <span className="text-rose-400 font-bold tabular-nums">{askPrice.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2 py-1 rounded-md">
            <span className="text-slate-400 text-[11px] font-sans">Spread Exness:</span>
            <span
              className={`font-semibold tabular-nums ${
                spreadStatus === 'zero_raw'
                  ? 'text-emerald-300 font-bold'
                  : spreadStatus === 'normal'
                  ? 'text-slate-200'
                  : spreadStatus === 'warning'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {currentSpreadPips.toFixed(1)} pips
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 font-sans">
            <span>Comissão:</span>
            <span className="font-mono text-slate-300 font-semibold">
              {spec.commissionPerLotUsd > 0 ? `$${spec.commissionPerLotUsd}/lote` : '$0'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-[11px]">
            <span>{account.server}</span>
            <span>·</span>
            <span className="tabular-nums">#{account.login}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
