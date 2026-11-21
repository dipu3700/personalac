import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { ACCOUNTS, CATEGORIES, getTodayDateString } from '../data/seedData';
import type {
  AccountType,
  CategoryType,
  Transaction,
  TransactionInput,
  TransactionType,
} from '../types/ledger';
import { validateTransactionInput } from '../utils/ledgerLogic';

interface TransactionModalProps {
  isOpen: boolean;
  editingTransaction: Transaction | null;
  defaultPerson?: string;
  currencySymbol: string;
  existingPeople: string[];
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  editingTransaction,
  defaultPerson = '',
  currencySymbol,
  existingPeople,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>('in');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState<AccountType>('Cash');
  const [category, setCategory] = useState<CategoryType>('Income');
  const [date, setDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionInput, string>>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editingTransaction) {
      setType(editingTransaction.type);
      setPerson(editingTransaction.person);
      setAmount(String(editingTransaction.amount));
      setAccount(editingTransaction.account);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note);
    } else {
      setType('in');
      setPerson(defaultPerson);
      setAmount('');
      setAccount('Cash');
      setCategory('Income');
      setDate(getTodayDateString());
      setNote('');
    }
    setErrors({});
  }, [isOpen, editingTransaction, defaultPerson]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    if (!editingTransaction) {
      if (nextType === 'out' && category === 'Income') {
        setCategory('Expense');
      } else if (nextType === 'in' && category === 'Expense') {
        setCategory('Income');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateTransactionInput({
      type,
      person,
      amount,
      account,
      category,
      date,
      note,
    });

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    onSave(
      {
        type,
        person: person.trim(),
        amount: result.parsedAmount,
        account,
        category,
        date,
        note: note.trim(),
        updatedAt: editingTransaction ? Date.now() : undefined,
      },
      editingTransaction?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-modal-title"
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-xl max-h-[92dvh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 id="tx-modal-title" className="text-lg font-bold text-slate-900">
            {editingTransaction ? 'লেনদেন সম্পাদনা (Edit Entry)' : 'নতুন লেনদেন যোগ (Add Entry)'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Type Toggle */}
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-1.5">
              লেনদেনের ধরন (Type)
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('in')}
                className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  type === 'in'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" aria-hidden="true" />
                <span>টাকা এসেছে (Cash In)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('out')}
                className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  type === 'out'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                <span>টাকা গিয়েছে (Cash Out)</span>
              </button>
            </div>
          </div>

          {/* Person / Party */}
          <div>
            <label htmlFor="tx-person" className="block text-sm font-medium text-slate-700 mb-1">
              ব্যক্তি / প্রতিষ্ঠান (Person or Party Name)
            </label>
            <input
              id="tx-person"
              type="text"
              list="existing-parties-list"
              value={person}
              onChange={(e) => {
                setPerson(e.target.value);
                if (errors.person) setErrors((prev) => ({ ...prev, person: undefined }));
              }}
              placeholder="যেমন: Rahim Uddin, Shop, Office..."
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
            <datalist id="existing-parties-list">
              {existingPeople.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
            {errors.person && (
              <p className="mt-1 text-xs text-rose-700">{errors.person}</p>
            )}
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tx-amount" className="block text-sm font-medium text-slate-700 mb-1">
                টাকার পরিমাণ (Amount {currencySymbol})
              </label>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                placeholder="0.00"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-num focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-rose-700">{errors.amount}</p>
              )}
            </div>

            <div>
              <label htmlFor="tx-date" className="block text-sm font-medium text-slate-700 mb-1">
                তারিখ (Date)
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-num focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
              {errors.date && (
                <p className="mt-1 text-xs text-rose-700">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Account & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tx-account" className="block text-sm font-medium text-slate-700 mb-1">
                অ্যাকাউন্ট / মাধ্যম (Account)
              </label>
              <select
                id="tx-account"
                value={account}
                onChange={(e) => setAccount(e.target.value as AccountType)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              >
                {ACCOUNTS.map((acc) => (
                  <option key={acc.value} value={acc.value}>
                    {acc.labelBn} ({acc.labelEn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tx-category" className="block text-sm font-medium text-slate-700 mb-1">
                খাত / ক্যাটাগরি (Category)
              </label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.labelBn} ({cat.labelEn})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="tx-note" className="block text-sm font-medium text-slate-700 mb-1">
              বর্ণনা / নোট (Note / Description)
            </label>
            <textarea
              id="tx-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ঐচ্ছিক বিস্তারিত লিখুন (যেমন: বিকাশ নম্বর, বিল নম্বর বা উদ্দেশ্য)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors"
            >
              {editingTransaction ? 'আপডেট করুন (Update)' : 'সংরক্ষণ করুন (Save Entry)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
