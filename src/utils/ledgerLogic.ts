import type {
  AccountSummary,
  AccountType,
  CategoryType,
  DashboardSummary,
  LedgerSettings,
  PartySummary,
  PartyTotals,
  Transaction,
  TransactionFilters,
  TransactionInput,
} from '../types/ledger';

const VALID_ACCOUNTS: AccountType[] = ['Cash', 'Bank', 'Mobile Banking'];
const VALID_CATEGORIES: CategoryType[] = [
  'Income',
  'Expense',
  'Loan Given',
  'Loan Received',
  'Business',
  'Personal',
  'Salary',
  'Other',
];

export function formatCurrency(amount: number, symbol = '৳'): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const abs = Math.abs(safe);
  const hasDecimals = Math.round(abs * 100) % 100 !== 0;
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return safe < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function calculateDashboardSummary(transactions: Transaction[]): DashboardSummary {
  const createEmptyAccount = (account: AccountType): AccountSummary => ({
    account,
    cashIn: 0,
    cashOut: 0,
    balance: 0,
    count: 0,
  });

  const accounts: Record<AccountType, AccountSummary> = {
    Cash: createEmptyAccount('Cash'),
    Bank: createEmptyAccount('Bank'),
    'Mobile Banking': createEmptyAccount('Mobile Banking'),
  };

  let totalCashIn = 0;
  let totalCashOut = 0;

  for (const tx of transactions) {
    const amount = Number.isFinite(tx.amount) && tx.amount > 0 ? tx.amount : 0;
    const acc = accounts[tx.account] ? tx.account : 'Cash';
    accounts[acc].count += 1;

    if (tx.type === 'in') {
      totalCashIn += amount;
      accounts[acc].cashIn += amount;
      accounts[acc].balance += amount;
    } else {
      totalCashOut += amount;
      accounts[acc].cashOut += amount;
      accounts[acc].balance -= amount;
    }
  }

  return {
    totalBalance: totalCashIn - totalCashOut,
    totalCashIn,
    totalCashOut,
    transactionCount: transactions.length,
    accounts,
  };
}

export function sortTransactionsNewestFirst(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return (b.createdAt ?? 0) - (a.createdAt ?? 0);
  });
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  const query = filters.search.trim().toLowerCase();
  const personFilter = filters.person.trim().toLowerCase();

  const filtered = transactions.filter((tx) => {
    if (filters.type !== 'all' && tx.type !== filters.type) {
      return false;
    }
    if (filters.account !== 'all' && tx.account !== filters.account) {
      return false;
    }
    if (personFilter && tx.person.toLowerCase() !== personFilter) {
      return false;
    }
    if (filters.dateFrom && tx.date < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && tx.date > filters.dateTo) {
      return false;
    }
    if (query) {
      const haystack = `${tx.person} ${tx.note} ${tx.category} ${tx.account} ${tx.amount} ${tx.date}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });

  return sortTransactionsNewestFirst(filtered);
}

export function calculatePartySummaries(
  transactions: Transaction[],
  loansOnly = false
): { parties: PartySummary[]; totals: PartyTotals } {
  const map = new Map<
    string,
    {
      displayName: string;
      totalReceivedFrom: number;
      totalGivenTo: number;
      transactionCount: number;
      lastTransactionDate: string;
      hasLoanActivity: boolean;
    }
  >();

  for (const tx of transactions) {
    const isLoan = tx.category === 'Loan Given' || tx.category === 'Loan Received';
    if (loansOnly && !isLoan) {
      continue;
    }

    const cleanName = tx.person.trim();
    if (!cleanName) continue;
    const key = cleanName.toLowerCase();

    const existing = map.get(key) ?? {
      displayName: cleanName,
      totalReceivedFrom: 0,
      totalGivenTo: 0,
      transactionCount: 0,
      lastTransactionDate: tx.date,
      hasLoanActivity: false,
    };

    const amount = Number.isFinite(tx.amount) && tx.amount > 0 ? tx.amount : 0;
    if (tx.type === 'in') {
      existing.totalReceivedFrom += amount;
    } else {
      existing.totalGivenTo += amount;
    }
    if (isLoan) {
      existing.hasLoanActivity = true;
    }
    existing.transactionCount += 1;
    if (tx.date > existing.lastTransactionDate) {
      existing.lastTransactionDate = tx.date;
    }
    map.set(key, existing);
  }

  const parties: PartySummary[] = Array.from(map.values())
    .map((entry) => ({
      person: entry.displayName,
      totalReceivedFrom: entry.totalReceivedFrom,
      totalGivenTo: entry.totalGivenTo,
      netReceivable: entry.totalGivenTo - entry.totalReceivedFrom,
      transactionCount: entry.transactionCount,
      lastTransactionDate: entry.lastTransactionDate,
      hasLoanActivity: entry.hasLoanActivity,
    }))
    .sort((a, b) => {
      const absDiff = Math.abs(b.netReceivable) - Math.abs(a.netReceivable);
      if (absDiff !== 0) return absDiff;
      return b.lastTransactionDate.localeCompare(a.lastTransactionDate);
    });

  let totalReceivable = 0;
  let totalPayable = 0;

  for (const p of parties) {
    if (p.netReceivable > 0) {
      totalReceivable += p.netReceivable;
    } else if (p.netReceivable < 0) {
      totalPayable += Math.abs(p.netReceivable);
    }
  }

  return {
    parties,
    totals: {
      totalReceivable,
      totalPayable,
      netPosition: totalReceivable - totalPayable,
      partiesCount: parties.length,
    },
  };
}

export function getUniquePeople(transactions: Transaction[]): string[] {
  const seen = new Map<string, string>();
  for (const tx of transactions) {
    const trimmed = tx.person.trim();
    if (trimmed && !seen.has(trimmed.toLowerCase())) {
      seen.set(trimmed.toLowerCase(), trimmed);
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}

export function validateTransactionInput(
  input: TransactionInput
): { valid: boolean; errors: Partial<Record<keyof TransactionInput, string>>; parsedAmount: number } {
  const errors: Partial<Record<keyof TransactionInput, string>> = {};
  const trimmedPerson = input.person.trim();
  const parsedAmount = typeof input.amount === 'number' ? input.amount : Number(String(input.amount).replace(/,/g, '').trim());

  if (!trimmedPerson) {
    errors.person = 'ব্যক্তি বা প্রতিষ্ঠানের নাম লিখুন (Person/Party name is required)';
  }

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    errors.amount = 'সঠিক টাকার পরিমাণ লিখুন (Enter a valid amount greater than 0)';
  }

  if (!VALID_ACCOUNTS.includes(input.account)) {
    errors.account = 'সঠিক অ্যাকাউন্ট নির্বাচন করুন';
  }

  if (!VALID_CATEGORIES.includes(input.category)) {
    errors.category = 'সঠিক ক্যাটাগরি নির্বাচন করুন';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    errors.date = 'সঠিক তারিখ নির্বাচন করুন (YYYY-MM-DD)';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    parsedAmount: Number.isFinite(parsedAmount) ? Math.round(parsedAmount * 100) / 100 : 0,
  };
}

export function validatePinChange(
  currentInput: string,
  savedPin: string,
  newPin: string,
  confirmPin: string
): { valid: boolean; error?: string } {
  if (currentInput !== savedPin) {
    return { valid: false, error: 'বর্তমান পিন/পাসওয়ার্ড সঠিক নয় (Current PIN is incorrect).' };
  }
  const cleanNew = newPin.trim();
  if (cleanNew.length < 4 || cleanNew.length > 16) {
    return { valid: false, error: 'নতুন পিন কমপক্ষে ৪ অক্ষরের হতে হবে (4–16 characters required).' };
  }
  if (cleanNew !== confirmPin.trim()) {
    return { valid: false, error: 'নতুন পিন এবং নিশ্চিত পিন মিলছে না (PINs do not match).' };
  }
  return { valid: true };
}

export function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = ['ID', 'Date', 'Type', 'Person/Party', 'Amount', 'Account', 'Category', 'Note'];
  const sorted = sortTransactionsNewestFirst(transactions);
  const rows = sorted.map((tx) =>
    [
      escapeCsvCell(tx.id),
      escapeCsvCell(tx.date),
      escapeCsvCell(tx.type === 'in' ? 'Cash In' : 'Cash Out'),
      escapeCsvCell(tx.person),
      escapeCsvCell(tx.amount),
      escapeCsvCell(tx.account),
      escapeCsvCell(tx.category),
      escapeCsvCell(tx.note),
    ].join(',')
  );

  // UTF-8 BOM ensures Bangla text opens properly in Excel
  return `\uFEFF${[headers.join(','), ...rows].join('\r\n')}`;
}

export interface BackupPayload {
  version: number;
  exportedAt: string;
  transactions: Transaction[];
  settings?: Partial<LedgerSettings>;
}

export function validateBrandingInput(input: {
  appName: string;
  tagline: string;
  adminName: string;
  currencySymbol: string;
}): { valid: boolean; error?: string } {
  if (!input.appName.trim()) {
    return { valid: false, error: 'প্রতিষ্ঠান বা অ্যাপের নাম খালি রাখা যাবে না।' };
  }
  if (input.appName.trim().length > 48) {
    return { valid: false, error: 'অ্যাপের নাম ৪৮ অক্ষরের মধ্যে হতে হবে।' };
  }
  if (!input.adminName.trim()) {
    return { valid: false, error: 'এডমিনের নাম লিখুন।' };
  }
  if (!input.currencySymbol.trim() || input.currencySymbol.trim().length > 4) {
    return { valid: false, error: 'সঠিক কারেন্সি চিহ্ন দিন (১–৪ অক্ষর)।' };
  }
  return { valid: true };
}

export function exportTransactionsToJSON(transactions: Transaction[], settings?: LedgerSettings): string {
  const payload: BackupPayload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    transactions: sortTransactionsNewestFirst(transactions),
    settings: settings
      ? {
          currencySymbol: settings.currencySymbol,
          appName: settings.appName,
          tagline: settings.tagline,
          adminName: settings.adminName,
          brandIcon: settings.brandIcon,
          accentTheme: settings.accentTheme,
          logoDataUrl: settings.logoDataUrl,
        }
      : undefined,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseImportedJSON(rawJson: string): {
  valid: boolean;
  transactions: Transaction[];
  settings?: Partial<LedgerSettings>;
  error?: string;
} {
  try {
    const parsed = JSON.parse(rawJson) as unknown;
    let rawList: unknown[] = [];
    let importedSettings: Partial<LedgerSettings> | undefined;

    if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as BackupPayload).transactions)) {
      const payload = parsed as BackupPayload;
      rawList = payload.transactions;
      if (payload.settings && typeof payload.settings === 'object') {
        importedSettings = payload.settings;
      }
    } else {
      return {
        valid: false,
        transactions: [],
        error: 'ফাইল ফরম্যাট সঠিক নয়। বৈধ JSON ব্যাকআপ ফাইল দিন।',
      };
    }

    const normalized: Transaction[] = [];
    for (let i = 0; i < rawList.length; i += 1) {
      const item = rawList[i] as Record<string, unknown>;
      if (!item || typeof item !== 'object') continue;

      const type = item.type === 'in' || item.type === 'out' ? item.type : null;
      const person = typeof item.person === 'string' ? item.person.trim() : '';
      const amount = Number(item.amount);
      const date = typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : '';

      if (!type || !person || !Number.isFinite(amount) || amount <= 0 || !date) {
        continue;
      }

      const account = VALID_ACCOUNTS.includes(item.account as AccountType)
        ? (item.account as AccountType)
        : 'Cash';
      const category = VALID_CATEGORIES.includes(item.category as CategoryType)
        ? (item.category as CategoryType)
        : 'Other';

      normalized.push({
        id: typeof item.id === 'string' && item.id.trim() ? item.id : `imp-${Date.now()}-${i}`,
        type,
        person,
        amount: Math.round(amount * 100) / 100,
        account,
        category,
        date,
        note: typeof item.note === 'string' ? item.note : '',
        createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now() - i,
        updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : undefined,
      });
    }

    if (rawList.length > 0 && normalized.length === 0) {
      return {
        valid: false,
        transactions: [],
        error: 'ফাইলে কোনো বৈধ লেনদেন পাওয়া যায়নি।',
      };
    }

    return {
      valid: true,
      transactions: sortTransactionsNewestFirst(normalized),
      settings: importedSettings,
    };
  } catch {
    return {
      valid: false,
      transactions: [],
      error: 'JSON ফাইল পড়া যায়নি। অনুগ্রহ করে সঠিক ব্যাকআপ ফাইল নির্বাচন করুন।',
    };
  }
}
