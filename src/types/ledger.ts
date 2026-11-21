export type TransactionType = 'in' | 'out';

export type AccountType = 'Cash' | 'Bank' | 'Mobile Banking';

export type CategoryType =
  | 'Income'
  | 'Expense'
  | 'Loan Given'
  | 'Loan Received'
  | 'Business'
  | 'Personal'
  | 'Salary'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  person: string;
  amount: number;
  account: AccountType;
  category: CategoryType;
  date: string; // YYYY-MM-DD
  note: string;
  createdAt: number;
  updatedAt?: number;
}

export interface TransactionInput {
  type: TransactionType;
  person: string;
  amount: string | number;
  account: AccountType;
  category: CategoryType;
  date: string;
  note: string;
}

export interface TransactionFilters {
  search: string;
  type: 'all' | TransactionType;
  account: 'all' | AccountType;
  person: string;
  dateFrom: string;
  dateTo: string;
}

export interface AccountSummary {
  account: AccountType;
  cashIn: number;
  cashOut: number;
  balance: number;
  count: number;
}

export interface DashboardSummary {
  totalBalance: number;
  totalCashIn: number;
  totalCashOut: number;
  transactionCount: number;
  accounts: Record<AccountType, AccountSummary>;
}

export interface PartySummary {
  person: string;
  totalReceivedFrom: number; // Cash In from this person
  totalGivenTo: number; // Cash Out to this person
  netReceivable: number; // totalGivenTo - totalReceivedFrom (>0 = they owe you / পাওনা, <0 = you owe them / দেনা)
  transactionCount: number;
  lastTransactionDate: string;
  hasLoanActivity: boolean;
}

export interface PartyTotals {
  totalReceivable: number; // Sum of netReceivable > 0
  totalPayable: number; // Sum of Math.abs(netReceivable < 0)
  netPosition: number; // totalReceivable - totalPayable
  partiesCount: number;
}

export type BrandIconId = 'ledger' | 'wallet' | 'landmark' | 'briefcase' | 'shield' | 'coins';

export type AccentTheme = 'emerald' | 'indigo' | 'teal' | 'slate';

export interface LedgerSettings {
  pin: string;
  currencySymbol: string;
  appName: string;
  tagline: string;
  adminName: string;
  logoDataUrl: string | null;
  brandIcon: BrandIconId;
  accentTheme: AccentTheme;
}

export type AppView = 'dashboard' | 'transactions' | 'parties' | 'settings';
