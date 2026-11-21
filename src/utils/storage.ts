import { createInitialSeedTransactions, DEFAULT_SETTINGS } from '../data/seedData';
import type { LedgerSettings, Transaction } from '../types/ledger';

const STORAGE_KEYS = {
  TRANSACTIONS: 'cashkhata_transactions_v1',
  SETTINGS: 'cashkhata_settings_v1',
  SESSION_UNLOCKED: 'cashkhata_session_unlocked_v1',
};

export function loadTransactions(): Transaction[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw === null) {
      const seeded = createInitialSeedTransactions();
      saveTransactions(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return createInitialSeedTransactions();
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch {
    // Ignore storage quota issues safely
  }
}

const VALID_ICONS = new Set(['ledger', 'wallet', 'landmark', 'briefcase', 'shield', 'coins']);
const VALID_THEMES = new Set(['emerald', 'indigo', 'teal', 'slate']);

export function loadSettings(): LedgerSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw) as Partial<LedgerSettings>;
    return {
      pin: typeof parsed.pin === 'string' && parsed.pin.trim() ? parsed.pin : DEFAULT_SETTINGS.pin,
      currencySymbol:
        typeof parsed.currencySymbol === 'string' && parsed.currencySymbol.trim()
          ? parsed.currencySymbol.trim().slice(0, 4)
          : DEFAULT_SETTINGS.currencySymbol,
      appName:
        typeof parsed.appName === 'string' && parsed.appName.trim()
          ? parsed.appName.trim().slice(0, 48)
          : DEFAULT_SETTINGS.appName,
      tagline:
        typeof parsed.tagline === 'string' && parsed.tagline.trim()
          ? parsed.tagline.trim().slice(0, 80)
          : DEFAULT_SETTINGS.tagline,
      adminName:
        typeof parsed.adminName === 'string' && parsed.adminName.trim()
          ? parsed.adminName.trim().slice(0, 40)
          : DEFAULT_SETTINGS.adminName,
      logoDataUrl:
        typeof parsed.logoDataUrl === 'string' && parsed.logoDataUrl.startsWith('data:image/')
          ? parsed.logoDataUrl
          : null,
      brandIcon:
        typeof parsed.brandIcon === 'string' && VALID_ICONS.has(parsed.brandIcon)
          ? (parsed.brandIcon as LedgerSettings['brandIcon'])
          : DEFAULT_SETTINGS.brandIcon,
      accentTheme:
        typeof parsed.accentTheme === 'string' && VALID_THEMES.has(parsed.accentTheme)
          ? (parsed.accentTheme as LedgerSettings['accentTheme'])
          : DEFAULT_SETTINGS.accentTheme,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: LedgerSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore storage errors safely
  }
}

export function loadSessionUnlocked(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return true;
      }
      return window.sessionStorage.getItem(STORAGE_KEYS.SESSION_UNLOCKED) === 'true';
    }
    return false;
  } catch {
    return false;
  }
}

export function saveSessionUnlocked(unlocked: boolean): void {
  try {
    if (unlocked) {
      window.sessionStorage.setItem(STORAGE_KEYS.SESSION_UNLOCKED, 'true');
    } else {
      window.sessionStorage.removeItem(STORAGE_KEYS.SESSION_UNLOCKED);
    }
  } catch {
    // Ignore sessionStorage errors safely
  }
}
