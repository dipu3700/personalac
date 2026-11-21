import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { PartyLedgerView } from './components/PartyLedgerView';
import { PinLockScreen } from './components/PinLockScreen';
import { SettingsBackupView } from './components/SettingsBackupView';
import { SummaryCards } from './components/SummaryCards';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { createInitialSeedTransactions } from './data/seedData';
import type {
  AccountType,
  AppView,
  LedgerSettings,
  Transaction,
  TransactionFilters,
} from './types/ledger';
import {
  calculateDashboardSummary,
  filterTransactions,
  getUniquePeople,
  sortTransactionsNewestFirst,
} from './utils/ledgerLogic';
import {
  loadSessionUnlocked,
  loadSettings,
  loadTransactions,
  saveSessionUnlocked,
  saveSettings,
  saveTransactions,
} from './utils/storage';

const INITIAL_FILTERS: TransactionFilters = {
  search: '',
  type: 'all',
  account: 'all',
  person: '',
  dateFrom: '',
  dateTo: '',
};

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [settings, setSettings] = useState<LedgerSettings>(() => loadSettings());
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => loadSessionUnlocked());
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [filters, setFilters] = useState<TransactionFilters>(INITIAL_FILTERS);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalDefaultPerson, setModalDefaultPerson] = useState('');

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveSettings(settings);
    document.title = `${settings.appName} — ${settings.tagline}`;
  }, [settings]);

  const summary = useMemo(() => calculateDashboardSummary(transactions), [transactions]);
  const uniquePeople = useMemo(() => getUniquePeople(transactions), [transactions]);
  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters]
  );

  const handleUnlock = () => {
    setIsUnlocked(true);
    saveSessionUnlocked(true);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    saveSessionUnlocked(false);
  };

  const handleOpenAddModal = (defaultPerson = '') => {
    setEditingTransaction(null);
    setModalDefaultPerson(defaultPerson);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalDefaultPerson('');
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        sortTransactionsNewestFirst(
          prev.map((tx) => (tx.id === existingId ? { ...tx, ...data } : tx))
        )
      );
    } else {
      const newTx: Transaction = {
        ...data,
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => sortTransactionsNewestFirst([newTx, ...prev]));
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const handleSelectAccountFromCard = (account: AccountType) => {
    setFilters((prev) => ({
      ...prev,
      account: prev.account === account ? 'all' : account,
    }));
  };

  const handleInspectPerson = (person: string) => {
    setFilters({ ...INITIAL_FILTERS, person });
    setActiveView('transactions');
  };

  const handleUpdateSettings = (partial: Partial<LedgerSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleImportTransactions = (
    imported: Transaction[],
    mode: 'replace' | 'merge',
    importedSettings?: Partial<LedgerSettings>
  ) => {
    if (mode === 'replace') {
      setTransactions(sortTransactionsNewestFirst(imported));
    } else {
      setTransactions((prev) => {
        const seen = new Set(prev.map((tx) => tx.id));
        const merged = [...prev];
        for (const tx of imported) {
          if (!seen.has(tx.id)) {
            merged.push(tx);
          } else {
            merged.push({ ...tx, id: `${tx.id}-${Math.random().toString(36).slice(2, 6)}` });
          }
        }
        return sortTransactionsNewestFirst(merged);
      });
    }

    if (importedSettings) {
      setSettings((prev) => ({
        ...prev,
        ...(importedSettings.appName ? { appName: importedSettings.appName } : {}),
        ...(importedSettings.tagline ? { tagline: importedSettings.tagline } : {}),
        ...(importedSettings.adminName ? { adminName: importedSettings.adminName } : {}),
        ...(importedSettings.currencySymbol
          ? { currencySymbol: importedSettings.currencySymbol }
          : {}),
        ...(importedSettings.brandIcon ? { brandIcon: importedSettings.brandIcon } : {}),
        ...(importedSettings.accentTheme ? { accentTheme: importedSettings.accentTheme } : {}),
        ...(importedSettings.logoDataUrl !== undefined
          ? { logoDataUrl: importedSettings.logoDataUrl }
          : {}),
      }));
    }
  };

  const handleChangePin = (newPin: string) => {
    setSettings((prev) => ({ ...prev, pin: newPin }));
  };

  if (!isUnlocked) {
    return <PinLockScreen settings={settings} onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-dvh bg-[#F4F6F5] text-slate-900 pb-24 lg:pb-12">
      <Header
        activeView={activeView}
        settings={settings}
        onNavigate={setActiveView}
        onOpenAddModal={() => handleOpenAddModal()}
        onLock={handleLock}
      />

      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-7 space-y-7">
          {activeView === 'dashboard' && (
            <>
              <SummaryCards
                summary={summary}
                currencySymbol={settings.currencySymbol}
                accentTheme={settings.accentTheme}
                selectedAccount={filters.account}
                onSelectAccount={handleSelectAccountFromCard}
              />
              <TransactionList
                transactions={filteredTransactions}
                totalCount={transactions.length}
                filters={filters}
                uniquePeople={uniquePeople}
                currencySymbol={settings.currencySymbol}
                onFiltersChange={setFilters}
                onResetFilters={() => setFilters(INITIAL_FILTERS)}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                onOpenAdd={() => handleOpenAddModal()}
              />
            </>
          )}

          {activeView === 'transactions' && (
            <TransactionList
              transactions={filteredTransactions}
              totalCount={transactions.length}
              filters={filters}
              uniquePeople={uniquePeople}
              currencySymbol={settings.currencySymbol}
              onFiltersChange={setFilters}
              onResetFilters={() => setFilters(INITIAL_FILTERS)}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onOpenAdd={() => handleOpenAddModal()}
              title="সম্পূর্ণ লেনদেন খাতা · All Transactions"
            />
          )}

          {activeView === 'parties' && (
            <PartyLedgerView
              transactions={transactions}
              currencySymbol={settings.currencySymbol}
              onInspectPerson={handleInspectPerson}
              onQuickAddForPerson={(person) => handleOpenAddModal(person)}
            />
          )}

          {activeView === 'settings' && (
            <SettingsBackupView
              transactions={transactions}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onChangePin={handleChangePin}
              onLock={handleLock}
              onImportTransactions={handleImportTransactions}
              onRestoreDemoData={() => setTransactions(createInitialSeedTransactions())}
              onClearAllData={() => setTransactions([])}
            />
          )}
        </div>
      </main>

      <TransactionModal
        isOpen={isModalOpen}
        editingTransaction={editingTransaction}
        defaultPerson={modalDefaultPerson}
        currencySymbol={settings.currencySymbol}
        existingPeople={uniquePeople}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
      />
    </div>
  );
}
