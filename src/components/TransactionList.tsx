import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { ACCOUNTS } from '../data/seedData';
import type { AccountType, Transaction, TransactionFilters } from '../types/ledger';
import { formatCurrency } from '../utils/ledgerLogic';

interface TransactionListProps {
  transactions: Transaction[];
  totalCount: number;
  filters: TransactionFilters;
  uniquePeople: string[];
  currencySymbol: string;
  onFiltersChange: (next: TransactionFilters) => void;
  onResetFilters: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenAdd: () => void;
  title?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  totalCount,
  filters,
  uniquePeople,
  currencySymbol,
  onFiltersChange,
  onResetFilters,
  onEdit,
  onDelete,
  onOpenAdd,
  title = 'লেনদেনের তালিকা · Transaction Ledger',
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.type !== 'all' ||
    filters.account !== 'all' ||
    Boolean(filters.person) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return (
    <section
      aria-label="Transactions ledger"
      className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs"
    >
      {/* Toolbar Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              মোট {totalCount}টি লেনদেনের মধ্যে {transactions.length}টি প্রদর্শিত হচ্ছে
            </p>
          </div>

          {/* Segmented Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
            {(
              [
                { value: 'all', label: 'সব (All)' },
                { value: 'in', label: 'জমা (Cash In)' },
                { value: 'out', label: 'খরচ (Cash Out)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => onFiltersChange({ ...filters, type: tab.value })}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  filters.type === tab.value
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-4 relative">
            <label htmlFor="ledger-search" className="sr-only">
              Search transactions
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="ledger-search"
              type="search"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              placeholder="ব্যক্তি, বর্ণনা বা পরিমাণ খুঁজুন..."
              className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="filter-account" className="sr-only">
              Filter by account
            </label>
            <select
              id="filter-account"
              value={filters.account}
              onChange={(e) =>
                onFiltersChange({ ...filters, account: e.target.value as 'all' | AccountType })
              }
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">সব অ্যাকাউন্ট</option>
              {ACCOUNTS.map((acc) => (
                <option key={acc.value} value={acc.value}>
                  {acc.labelBn}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="filter-person" className="sr-only">
              Filter by person
            </label>
            <select
              id="filter-person"
              value={filters.person}
              onChange={(e) => onFiltersChange({ ...filters, person: e.target.value })}
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="">সব ব্যক্তি / প্রতিষ্ঠান</option>
              {uniquePeople.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="filter-date-from" className="sr-only">
              From date
            </label>
            <div className="relative flex items-center h-11 rounded-lg border border-slate-300 bg-white px-2.5 focus-within:ring-2 focus-within:ring-emerald-600">
              <span className="text-[11px] font-medium text-slate-500 mr-1.5 shrink-0">শুরু</span>
              <input
                id="filter-date-from"
                type="date"
                aria-label="শুরুর তারিখ (From date)"
                value={filters.dateFrom}
                onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                className="w-full min-w-0 bg-transparent text-xs font-num text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-2 flex gap-2">
            <label htmlFor="filter-date-to" className="sr-only">
              To date
            </label>
            <div className="relative flex items-center w-full min-w-0 h-11 rounded-lg border border-slate-300 bg-white px-2.5 focus-within:ring-2 focus-within:ring-emerald-600">
              <span className="text-[11px] font-medium text-slate-500 mr-1.5 shrink-0">শেষ</span>
              <input
                id="filter-date-to"
                type="date"
                aria-label="শেষ তারিখ (To date)"
                value={filters.dateTo}
                onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                className="w-full min-w-0 bg-transparent text-xs font-num text-slate-800 focus:outline-none"
              />
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                aria-label="ফিল্টার রিসেট করুন (Reset filters)"
                title="ফিল্টার মুছুন"
                className="min-h-[44px] min-w-[44px] px-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 flex items-center justify-center shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {transactions.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-base font-semibold text-slate-800">
            {totalCount === 0
              ? 'এখনো কোনো লেনদেন যুক্ত করা হয়নি'
              : 'এই ফিল্টারে কোনো লেনদেন পাওয়া যায়নি'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {totalCount === 0
              ? 'আপনার আয়, খরচ এবং দেনা-পাওনার হিসাব রাখতে প্রথম লেনদেন যোগ করুন।'
              : 'অন্য কোনো নাম, অ্যাকাউন্ট বা তারিখ দিয়ে খুঁজে দেখুন অথবা ফিল্টার মুছে দিন।'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={onResetFilters}
                className="min-h-[44px] px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium"
              >
                সব ফিল্টার মুছুন
              </button>
            ) : null}
            <button
              type="button"
              onClick={onOpenAdd}
              className="min-h-[44px] px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>প্রথম লেনদেন যোগ করুন</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop High-Density Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-5">তারিখ · Date</th>
                  <th className="py-3 px-4">ব্যক্তি ও বিবরণ · Party & Note</th>
                  <th className="py-3 px-4">অ্যাকাউন্ট ও খাত · Account & Category</th>
                  <th className="py-3 px-4 text-right">পরিমাণ · Amount</th>
                  <th className="py-3 px-5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {transactions.map((tx) => {
                  const isCashIn = tx.type === 'in';
                  const isConfirming = confirmDeleteId === tx.id;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-num tabular-nums text-xs text-slate-600 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="font-semibold text-slate-900">{tx.person}</div>
                        {tx.note && (
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {tx.note}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                        <span>{tx.account}</span>
                        <span className="mx-1.5 text-slate-300" aria-hidden="true">
                          ·
                        </span>
                        <span>{tx.category}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className={`inline-flex items-center justify-end gap-1 font-num tabular-nums font-semibold ${
                            isCashIn ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isCashIn ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          )}
                          <span>
                            {isCashIn ? '+' : '-'}
                            {formatCurrency(tx.amount, currencySymbol)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isCashIn ? 'টাকা জমা (In)' : 'টাকা খরচ (Out)'}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        {isConfirming ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onDelete(tx.id);
                                setConfirmDeleteId(null);
                              }}
                              className="min-h-[34px] px-2.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
                            >
                              মুছুন
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="min-h-[34px] px-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEdit(tx)}
                              aria-label={`Edit transaction ${tx.person} ${tx.amount}`}
                              className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(tx.id)}
                              aria-label={`Delete transaction ${tx.person} ${tx.amount}`}
                              className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Touch-Friendly Card Rows */}
          <div className="md:hidden divide-y divide-slate-200">
            {transactions.map((tx) => {
              const isCashIn = tx.type === 'in';
              const isConfirming = confirmDeleteId === tx.id;

              return (
                <div key={tx.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{tx.person}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="font-num tabular-nums">{tx.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.account}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.category}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`font-num tabular-nums font-bold text-base ${
                          isCashIn ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isCashIn ? '+' : '-'}
                        {formatCurrency(tx.amount, currencySymbol)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {isCashIn ? 'টাকা এসেছে' : 'টাকা গিয়েছে'}
                      </div>
                    </div>
                  </div>

                  {tx.note && (
                    <p className="text-xs text-slate-600 leading-relaxed">{tx.note}</p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {isConfirming ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(tx.id);
                            setConfirmDeleteId(null);
                          }}
                          className="min-h-[44px] px-4 rounded-lg bg-rose-700 text-white text-xs font-semibold"
                        >
                          নিশ্চিত মুছুন
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-[44px] px-4 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium"
                        >
                          বাতিল
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(tx)}
                          aria-label={`Edit transaction ${tx.person} ${tx.amount}`}
                          className="min-h-[44px] px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>সম্পাদনা</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(tx.id)}
                          aria-label={`Delete transaction ${tx.person} ${tx.amount}`}
                          className="min-h-[44px] px-3 rounded-lg border border-slate-200 text-rose-700 hover:bg-rose-50 text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>মুছুন</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
