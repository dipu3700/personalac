import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Landmark, Smartphone, Wallet } from 'lucide-react';
import { ACCOUNTS } from '../data/seedData';
import type { AccentTheme, AccountType, DashboardSummary } from '../types/ledger';
import { formatCurrency } from '../utils/ledgerLogic';
import { getThemePalette } from '../utils/theme';

interface SummaryCardsProps {
  summary: DashboardSummary;
  currencySymbol: string;
  accentTheme: AccentTheme;
  selectedAccount?: 'all' | AccountType;
  onSelectAccount?: (account: AccountType) => void;
}

const ACCOUNT_ICONS: Record<AccountType, React.ComponentType<{ className?: string }>> = {
  Cash: Wallet,
  Bank: Landmark,
  'Mobile Banking': Smartphone,
};

const ACCOUNT_BAR_COLORS: Record<AccountType, string> = {
  Cash: 'bg-emerald-300',
  Bank: 'bg-sky-300',
  'Mobile Banking': 'bg-amber-300',
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  currencySymbol,
  accentTheme,
  selectedAccount = 'all',
  onSelectAccount,
}) => {
  const theme = getThemePalette(accentTheme);

  const positiveAccountTotal = ACCOUNTS.reduce((acc, item) => {
    const val = summary.accounts[item.value].balance;
    return acc + (val > 0 ? val : 0);
  }, 0);

  return (
    <section aria-label="Cash flow and account summary" className="space-y-6">
      {/* Executive Focal Anchor Hero Card */}
      <div
        className={`${theme.heroBg} text-white rounded-2xl p-6 sm:p-7 shadow-md shadow-slate-900/10`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Primary Total Balance */}
          <div className="lg:col-span-6 space-y-2">
            <div className="text-sm text-white/75 font-medium">
              বর্তমান মোট ব্যালেন্স · Total Current Balance
            </div>
            <div
              data-testid="total-balance"
              className={`text-3xl sm:text-4xl font-bold font-num tabular-nums tracking-tight ${
                summary.totalBalance >= 0 ? 'text-white' : 'text-rose-300'
              }`}
            >
              {formatCurrency(summary.totalBalance, currencySymbol)}
            </div>
            <p className="text-sm text-white/70">
              সব অ্যাকাউন্ট মিলিয়ে মোট স্থিতি · {summary.transactionCount}টি লেনদেন সংরক্ষিত
            </p>
          </div>

          {/* Cash In & Cash Out Split */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:border-l lg:border-white/15 lg:pl-6">
            <div className="rounded-xl bg-white/8 p-4 border border-white/10">
              <div className="flex items-center justify-between gap-2 text-xs text-white/80">
                <span>মোট টাকা জমা · Cash In</span>
                <ArrowDownLeft className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
              </div>
              <div
                data-testid="total-cash-in"
                className="mt-2 text-2xl font-bold font-num tabular-nums text-emerald-300"
              >
                +{formatCurrency(summary.totalCashIn, currencySymbol)}
              </div>
              <div className="mt-1 text-xs text-white/65">মোট কত টাকা এসেছে</div>
            </div>

            <div className="rounded-xl bg-white/8 p-4 border border-white/10">
              <div className="flex items-center justify-between gap-2 text-xs text-white/80">
                <span>মোট টাকা প্রদান · Cash Out</span>
                <ArrowUpRight className="w-4 h-4 text-rose-300 shrink-0" aria-hidden="true" />
              </div>
              <div
                data-testid="total-cash-out"
                className="mt-2 text-2xl font-bold font-num tabular-nums text-rose-300"
              >
                -{formatCurrency(summary.totalCashOut, currencySymbol)}
              </div>
              <div className="mt-1 text-xs text-white/65">মোট কত টাকা দেওয়া হয়েছে</div>
            </div>
          </div>
        </div>

        {/* Account Distribution Strip */}
        {positiveAccountTotal > 0 && (
          <div className="mt-6 pt-5 border-t border-white/12">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/75 mb-2">
              <span>অ্যাকাউন্ট ভিত্তিক বিতরণ (কোথায় কত শতাংশ আছে)</span>
              <div className="flex flex-wrap items-center gap-4">
                {ACCOUNTS.map((acc) => {
                  const bal = Math.max(0, summary.accounts[acc.value].balance);
                  const pct = Math.round((bal / positiveAccountTotal) * 100);
                  return (
                    <span key={acc.value} className="inline-flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-xs ${ACCOUNT_BAR_COLORS[acc.value]}`}
                        aria-hidden="true"
                      />
                      <span>
                        {acc.labelBn} <span className="font-num">{pct}%</span>
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-white/12 overflow-hidden flex">
              {ACCOUNTS.map((acc) => {
                const bal = Math.max(0, summary.accounts[acc.value].balance);
                const pct = (bal / positiveAccountTotal) * 100;
                if (pct <= 0) return null;
                return (
                  <div
                    key={acc.value}
                    style={{ width: `${pct}%` }}
                    className={`${ACCOUNT_BAR_COLORS[acc.value]} h-full transition-all`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Account Breakdown Interactive Cards */}
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <h2 className="text-base font-bold text-slate-900">
            অ্যাকাউন্ট অনুযায়ী ব্যালেন্স · কোথায় কত আছে
          </h2>
          {onSelectAccount && (
            <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
              ট্যাপ করে ফিল্টার
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ACCOUNTS.map((acc) => {
            const data = summary.accounts[acc.value];
            const Icon = ACCOUNT_ICONS[acc.value];
            const isSelected = selectedAccount === acc.value;

            const cardContent = (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-bold text-slate-900 truncate">
                      {acc.labelBn}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {acc.labelEn} · {acc.subtitle}
                    </div>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? `${theme.primaryBtn}` : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>
                <div
                  data-testid={`account-balance-${acc.value}`}
                  className={`mt-4 text-2xl font-bold font-num tabular-nums ${
                    data.balance >= 0 ? 'text-slate-900' : 'text-rose-700'
                  }`}
                >
                  {formatCurrency(data.balance, currencySymbol)}
                </div>
                <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-num tabular-nums">
                  <span className="text-emerald-700">
                    জমা {formatCurrency(data.cashIn, currencySymbol)}
                  </span>
                  <span className="text-rose-700">
                    খরচ {formatCurrency(data.cashOut, currencySymbol)}
                  </span>
                </div>
              </>
            );

            if (onSelectAccount) {
              return (
                <button
                  key={acc.value}
                  type="button"
                  onClick={() => onSelectAccount(acc.value)}
                  className={`text-left rounded-2xl p-5 border transition-all ${
                    isSelected
                      ? `${theme.accentSoftBg} ${theme.accentBorder} shadow-xs`
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {cardContent}
                </button>
              );
            }

            return (
              <div
                key={acc.value}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs"
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
