import type { AccountType, CategoryType, LedgerSettings, Transaction } from '../types/ledger';

export const DEFAULT_PIN = '1234';

export const DEFAULT_SETTINGS: LedgerSettings = {
  pin: DEFAULT_PIN,
  currencySymbol: '৳',
  appName: 'ক্যাশ খাতা',
  tagline: 'ব্যক্তিগত ও ব্যবসায়িক ক্যাশ লেজার',
  adminName: 'এডমিন',
  logoDataUrl: null,
  brandIcon: 'ledger',
  accentTheme: 'emerald',
};

export const ACCOUNTS: { value: AccountType; labelEn: string; labelBn: string; subtitle: string }[] = [
  {
    value: 'Cash',
    labelEn: 'Cash in Hand',
    labelBn: 'হাতে নগদ',
    subtitle: 'Wallet & Cash Box',
  },
  {
    value: 'Bank',
    labelEn: 'Bank Account',
    labelBn: 'ব্যাংক হিসাব',
    subtitle: 'Savings & Current',
  },
  {
    value: 'Mobile Banking',
    labelEn: 'Mobile Banking',
    labelBn: 'বিকাশ / নগদ / রকেট',
    subtitle: 'Bkash · Nagad · Rocket',
  },
];

export const CATEGORIES: { value: CategoryType; labelEn: string; labelBn: string }[] = [
  { value: 'Income', labelEn: 'Income', labelBn: 'আয়' },
  { value: 'Expense', labelEn: 'Expense', labelBn: 'খরচ' },
  { value: 'Loan Given', labelEn: 'Loan Given', labelBn: 'ধার দেওয়া (পাওনা)' },
  { value: 'Loan Received', labelEn: 'Loan Received', labelBn: 'ধার নেওয়া (দেনা)' },
  { value: 'Business', labelEn: 'Business', labelBn: 'ব্যবসা' },
  { value: 'Personal', labelEn: 'Personal', labelBn: 'ব্যক্তিগত' },
  { value: 'Salary', labelEn: 'Salary', labelBn: 'বেতন' },
  { value: 'Other', labelEn: 'Other', labelBn: 'অন্যান্য' },
];

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getRelativeDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function createInitialSeedTransactions(): Transaction[] {
  const now = Date.now();
  return [
    {
      id: 'seed-0',
      type: 'in',
      person: 'Opening Cash Reserve',
      amount: 10000,
      account: 'Cash',
      category: 'Income',
      date: getRelativeDateString(6),
      note: 'প্রারম্ভিক নগদ ব্যালেন্স (Opening Cash)',
      createdAt: now - 6 * 86400000,
    },
    {
      id: 'seed-1',
      type: 'in',
      person: 'Apex Solutions Ltd',
      amount: 45000,
      account: 'Bank',
      category: 'Salary',
      date: getRelativeDateString(5),
      note: 'মাসিক বেতন জমা (Monthly Salary)',
      createdAt: now - 5 * 86400000,
    },
    {
      id: 'seed-2',
      type: 'out',
      person: 'Rahim Uddin',
      amount: 8000,
      account: 'Mobile Banking',
      category: 'Loan Given',
      date: getRelativeDateString(4),
      note: 'বিকাশে জরুরি ধার দেওয়া হয়েছে',
      createdAt: now - 4 * 86400000,
    },
    {
      id: 'seed-3',
      type: 'in',
      person: 'Rahim Uddin',
      amount: 3000,
      account: 'Cash',
      category: 'Loan Received',
      date: getRelativeDateString(2),
      note: 'আংশিক ধার ফেরত পাওয়া গেছে',
      createdAt: now - 2 * 86400000,
    },
    {
      id: 'seed-4',
      type: 'in',
      person: 'Karim Traders',
      amount: 12000,
      account: 'Mobile Banking',
      category: 'Loan Received',
      date: getRelativeDateString(2),
      note: 'ব্যবসায়িক কাজের জন্য অগ্রিম/ধার নেওয়া',
      createdAt: now - 2 * 86400000 + 3600000,
    },
    {
      id: 'seed-5',
      type: 'out',
      person: 'Shwapno Super Shop',
      amount: 4250,
      account: 'Cash',
      category: 'Personal',
      date: getRelativeDateString(1),
      note: 'বাসার বাজার ও গ্রোসারি খরচ',
      createdAt: now - 86400000,
    },
    {
      id: 'seed-6',
      type: 'in',
      person: 'Nusrat Enterprise',
      amount: 15500,
      account: 'Bank',
      category: 'Business',
      date: getRelativeDateString(0),
      note: 'কনসালটেন্সি বিল পরিশোধ প্রাপ্তি',
      createdAt: now - 3600000,
    },
  ];
}
