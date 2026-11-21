import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDashboardSummary,
  calculatePartySummaries,
  exportTransactionsToCSV,
  exportTransactionsToJSON,
  filterTransactions,
  formatCurrency,
  parseImportedJSON,
  validateBrandingInput,
  validatePinChange,
  validateTransactionInput,
} from './ledgerLogic';
import type { Transaction } from '../types/ledger';

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'in',
    person: 'Apex Ltd',
    amount: 30000,
    account: 'Bank',
    category: 'Salary',
    date: '2026-11-10',
    note: 'Monthly salary',
    createdAt: 1000,
  },
  {
    id: '2',
    type: 'out',
    person: 'Rahim',
    amount: 5000,
    account: 'Mobile Banking',
    category: 'Loan Given',
    date: '2026-11-12',
    note: 'Bkash loan',
    createdAt: 2000,
  },
  {
    id: '3',
    type: 'in',
    person: 'Rahim',
    amount: 2000,
    account: 'Cash',
    category: 'Loan Received',
    date: '2026-11-15',
    note: 'Partial repayment',
    createdAt: 3000,
  },
  {
    id: '4',
    type: 'in',
    person: 'Karim',
    amount: 4000,
    account: 'Cash',
    category: 'Loan Received',
    date: '2026-11-16',
    note: 'Borrowed for supply',
    createdAt: 4000,
  },
];

test('calculateDashboardSummary computes total balance, cash in/out, and account breakdown', () => {
  const summary = calculateDashboardSummary(sampleTransactions);
  assert.equal(summary.totalCashIn, 36000);
  assert.equal(summary.totalCashOut, 5000);
  assert.equal(summary.totalBalance, 31000);
  assert.equal(summary.accounts.Bank.balance, 30000);
  assert.equal(summary.accounts.Cash.balance, 6000);
  assert.equal(summary.accounts['Mobile Banking'].balance, -5000);
});

test('calculatePartySummaries computes receivable (পাওনা) and payable (দেনা) accurately', () => {
  const { parties, totals } = calculatePartySummaries(sampleTransactions, false);
  const rahim = parties.find((p) => p.person === 'Rahim');
  const karim = parties.find((p) => p.person === 'Karim');

  const apex = parties.find((p) => p.person === 'Apex Ltd');
  assert.ok(rahim);
  assert.equal(rahim.totalGivenTo, 5000);
  assert.equal(rahim.totalReceivedFrom, 2000);
  assert.equal(rahim.netReceivable, 3000); // Rahim owes user 3000
  assert.equal(rahim.hasLoanActivity, true);

  assert.ok(karim);
  assert.equal(karim.netReceivable, -4000); // User owes Karim 4000
  assert.equal(karim.hasLoanActivity, true);

  assert.ok(apex);
  assert.equal(apex.hasLoanActivity, false);

  const loansOnly = calculatePartySummaries(sampleTransactions, true);
  assert.equal(loansOnly.parties.length, 2);
  assert.equal(loansOnly.totals.totalReceivable, 3000);
  assert.equal(loansOnly.totals.totalPayable, 4000);
  assert.equal(loansOnly.totals.netPosition, -1000);
  assert.equal(totals.partiesCount, 3);
});

test('filterTransactions filters by search, type, account, person, and date range', () => {
  const bySearch = filterTransactions(sampleTransactions, {
    search: 'bkash',
    type: 'all',
    account: 'all',
    person: '',
    dateFrom: '',
    dateTo: '',
  });
  assert.equal(bySearch.length, 1);
  assert.equal(bySearch[0].id, '2');

  const byAccount = filterTransactions(sampleTransactions, {
    search: '',
    type: 'in',
    account: 'Cash',
    person: '',
    dateFrom: '2026-11-15',
    dateTo: '2026-11-16',
  });
  assert.equal(byAccount.length, 2);
  assert.equal(byAccount[0].id, '4'); // newest first
});

test('validateTransactionInput rejects empty person and invalid amounts', () => {
  const invalid = validateTransactionInput({
    type: 'in',
    person: '   ',
    amount: '0',
    account: 'Cash',
    category: 'Income',
    date: '2026-11-18',
    note: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.person);
  assert.ok(invalid.errors.amount);

  const valid = validateTransactionInput({
    type: 'out',
    person: 'Rahim',
    amount: '1500.5',
    account: 'Bank',
    category: 'Business',
    date: '2026-11-18',
    note: 'Payment',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.parsedAmount, 1500.5);
});

test('validatePinChange enforces current PIN, length, and confirmation', () => {
  assert.equal(validatePinChange('0000', '1234', '5678', '5678').valid, false);
  assert.equal(validatePinChange('1234', '1234', '12', '12').valid, false);
  assert.equal(validatePinChange('1234', '1234', '5678', '5679').valid, false);
  assert.equal(validatePinChange('1234', '1234', '5678', '5678').valid, true);
});

test('CSV and JSON export/import round-trip safely', () => {
  const csv = exportTransactionsToCSV(sampleTransactions);
  assert.ok(csv.startsWith('\uFEFFID,Date,Type,Person/Party,Amount,Account,Category,Note'));
  assert.ok(csv.includes('Apex Ltd'));

  const json = exportTransactionsToJSON(sampleTransactions);
  const imported = parseImportedJSON(json);
  assert.equal(imported.valid, true);
  assert.equal(imported.transactions.length, 4);
  assert.equal(imported.transactions[0].id, '4');

  const broken = parseImportedJSON('{invalid json');
  assert.equal(broken.valid, false);
});

test('formatCurrency formats positive and negative amounts cleanly', () => {
  assert.equal(formatCurrency(12500), '৳12,500');
  assert.equal(formatCurrency(-450.5), '-৳450.50');
});

test('validateBrandingInput rejects empty appName or adminName and accepts valid branding', () => {
  assert.equal(
    validateBrandingInput({ appName: '   ', tagline: 'Test', adminName: 'Admin', currencySymbol: '৳' }).valid,
    false
  );
  assert.equal(
    validateBrandingInput({ appName: 'নাজিহা এন্টারপ্রাইজ', tagline: '', adminName: '', currencySymbol: '৳' }).valid,
    false
  );
  assert.equal(
    validateBrandingInput({
      appName: 'নাজিহা এন্টারপ্রাইজ',
      tagline: 'দৈনিক ক্যাশ লেজার',
      adminName: 'মালিক',
      currencySymbol: '৳',
    }).valid,
    true
  );
});

test('JSON export/import preserves custom branding settings', () => {
  const json = exportTransactionsToJSON(sampleTransactions, {
    pin: '9999',
    currencySymbol: '৳',
    appName: 'নাজিহা এন্টারপ্রাইজ',
    tagline: 'ক্যাশ লেজার',
    adminName: 'নাজিহা',
    logoDataUrl: null,
    brandIcon: 'briefcase',
    accentTheme: 'teal',
  });
  const parsed = parseImportedJSON(json);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.settings?.appName, 'নাজিহা এন্টারপ্রাইজ');
  assert.equal(parsed.settings?.accentTheme, 'teal');
  assert.equal(parsed.settings?.pin, undefined);
});
