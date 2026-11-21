import React, { useMemo, useState } from 'react';
import { ArrowRight, Plus, Search } from 'lucide-react';
import type { Transaction } from '../types/ledger';
import { calculatePartySummaries, formatCurrency } from '../utils/ledgerLogic';

interface PartyLedgerViewProps {
  transactions: Transaction[];
  currencySymbol: string;
  onInspectPerson: (person: string) => void;
  onQuickAddForPerson: (person: string) => void;
}

export const PartyLedgerView: React.FC<PartyLedgerViewProps> = ({
  transactions,
  currencySymbol,
  onInspectPerson,
  onQuickAddForPerson,
}) => {
  const [loansOnly, setLoansOnly] = useState(false);
  const [search, setSearch] = useState('');

  const { parties, totals } = useMemo(
    () => calculatePartySummaries(transactions, loansOnly),
    [transactions, loansOnly]
  );

  const visibleParties = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return parties;
    return parties.filter((p) => p.person.toLowerCase().includes(q));
  }, [parties, search]);

  return (
    <div className="space-y-6">
      {/* Party Summary Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="text-sm font-medium text-slate-600">
            মোট পাওনা · Total Receivable
          </div>
          <div
            data-testid="party-total-receivable"
            className="mt-2 text-2xl sm:text-3xl font-bold font-num tabular-nums text-emerald-700"
          >
            {formatCurrency(totals.totalReceivable, currencySymbol)}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            অন্যরা আপনার কাছে যা দেয় (Who owes you)
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="text-sm font-medium text-slate-600">
            মোট দেনা · Total Payable
          </div>
          <div
            data-testid="party-total-payable"
            className="mt-2 text-2xl sm:text-3xl font-bold font-num tabular-nums text-rose-700"
          >
            {formatCurrency(totals.totalPayable, currencySymbol)}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            অন্যদের কাছে আপনার যা দেনা (Whom you owe)
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="text-sm font-medium text-slate-600">
            নিট অবস্থান · Net Party Balance
          </div>
          <div
            className={`mt-2 text-2xl sm:text-3xl font-bold font-num tabular-nums ${
              totals.netPosition >= 0 ? 'text-slate-900' : 'text-rose-700'
            }`}
          >
            {formatCurrency(totals.netPosition, currencySymbol)}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {totals.partiesCount}টি ব্যক্তি/প্রতিষ্ঠানের হিসাব
          </p>
        </div>
      </div>

      {/* Party Ledger List */}
      <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              ব্যক্তি / পার্টি ভিত্তিক হিসাব · Party Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              কার কাছ থেকে কত পাওনা বা কাকে কত দিতে হবে তার নিট হিসাব
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Search party name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম দিয়ে খুঁজুন..."
                className="w-full sm:w-56 h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setLoansOnly(false)}
                className={`min-h-[34px] px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  !loansOnly
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সব পার্টি (All)
              </button>
              <button
                type="button"
                onClick={() => setLoansOnly(true)}
                className={`min-h-[34px] px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  loansOnly
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                শুধু ধার-দেনা (Loans)
              </button>
            </div>
          </div>
        </div>

        {visibleParties.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-base font-semibold text-slate-800">কোনো ব্যক্তির হিসাব পাওয়া যায়নি</p>
            <p className="text-sm text-slate-500 mt-1">
              নতুন লেনদেন যোগ করলে এখানে প্রতিটি ব্যক্তি/প্রতিষ্ঠানের নিট হিসাব স্বয়ংক্রিয়ভাবে তৈরি হবে।
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-5">ব্যক্তি / প্রতিষ্ঠান · Person</th>
                    <th className="py-3 px-4 text-right">পেয়েছি · Received (In)</th>
                    <th className="py-3 px-4 text-right">দিয়েছি · Given (Out)</th>
                    <th className="py-3 px-4 text-right">নিট অবস্থা · Net Balance</th>
                    <th className="py-3 px-5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {visibleParties.map((party) => {
                    const isReceivable = party.netReceivable > 0;
                    const isPayable = party.netReceivable < 0;
                    const statusLabel = party.hasLoanActivity
                      ? isReceivable
                        ? 'পাওনা (Owed to you)'
                        : isPayable
                          ? 'দেনা (You owe)'
                          : 'পরিশোধিত (Settled)'
                      : isReceivable
                        ? 'নিট প্রদান (Net Out)'
                        : isPayable
                          ? 'নিট প্রাপ্তি (Net In)'
                          : 'সমতা (Settled)';

                    return (
                      <tr key={party.person} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-900">{party.person}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {party.transactionCount}টি লেনদেন · শেষ তারিখ {party.lastTransactionDate}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-num tabular-nums text-emerald-700">
                          {formatCurrency(party.totalReceivedFrom, currencySymbol)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-num tabular-nums text-rose-700">
                          {formatCurrency(party.totalGivenTo, currencySymbol)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div
                            className={`font-num tabular-nums font-bold ${
                              party.hasLoanActivity
                                ? isReceivable
                                  ? 'text-emerald-700'
                                  : isPayable
                                    ? 'text-rose-700'
                                    : 'text-slate-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {formatCurrency(Math.abs(party.netReceivable), currencySymbol)}
                          </div>
                          <div
                            className={`text-[11px] font-medium ${
                              party.hasLoanActivity
                                ? isReceivable
                                  ? 'text-emerald-700'
                                  : isPayable
                                    ? 'text-rose-700'
                                    : 'text-slate-500'
                                : 'text-slate-500'
                            }`}
                          >
                            {statusLabel}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onQuickAddForPerson(party.person)}
                              className="min-h-[36px] px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium inline-flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>লেনদেন</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onInspectPerson(party.person)}
                              className="min-h-[36px] px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium inline-flex items-center gap-1"
                            >
                              <span>ইতিহাস</span>
                              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-200">
              {visibleParties.map((party) => {
                const isReceivable = party.netReceivable > 0;
                const isPayable = party.netReceivable < 0;
                const statusLabel = party.hasLoanActivity
                  ? isReceivable
                    ? 'পাওনা (Owed to you)'
                    : isPayable
                      ? 'দেনা (You owe)'
                      : 'পরিশোধিত (Settled)'
                  : isReceivable
                    ? 'নিট প্রদান (Net Out)'
                    : isPayable
                      ? 'নিট প্রাপ্তি (Net In)'
                      : 'সমতা (Settled)';

                return (
                  <div key={party.person} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{party.person}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {party.transactionCount}টি লেনদেন · {party.lastTransactionDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-num tabular-nums font-bold text-base ${
                            party.hasLoanActivity
                              ? isReceivable
                                ? 'text-emerald-700'
                                : isPayable
                                  ? 'text-rose-700'
                                  : 'text-slate-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {formatCurrency(Math.abs(party.netReceivable), currencySymbol)}
                        </div>
                        <div
                          className={`text-xs font-medium ${
                            party.hasLoanActivity
                              ? isReceivable
                                ? 'text-emerald-700'
                                : isPayable
                                  ? 'text-rose-700'
                                  : 'text-slate-500'
                              : 'text-slate-500'
                          }`}
                        >
                          {statusLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 font-num tabular-nums">
                      <span>পেয়েছি: {formatCurrency(party.totalReceivedFrom, currencySymbol)}</span>
                      <span>দিয়েছি: {formatCurrency(party.totalGivenTo, currencySymbol)}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onQuickAddForPerson(party.person)}
                        className="flex-1 min-h-[44px] px-3 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>নতুন লেনদেন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onInspectPerson(party.person)}
                        className="flex-1 min-h-[44px] px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold inline-flex items-center justify-center gap-1"
                      >
                        <span>বিস্তারিত দেখুন</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
