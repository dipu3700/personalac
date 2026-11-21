import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  ImagePlus,
  KeyRound,
  Lock,
  Palette,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { DEFAULT_SETTINGS, getTodayDateString } from '../data/seedData';
import type { AccentTheme, BrandIconId, LedgerSettings, Transaction } from '../types/ledger';
import {
  exportTransactionsToCSV,
  exportTransactionsToJSON,
  parseImportedJSON,
  validateBrandingInput,
  validatePinChange,
} from '../utils/ledgerLogic';
import { getThemePalette, THEME_PALETTES } from '../utils/theme';
import { BRAND_ICON_OPTIONS, BrandLogo } from './BrandLogo';

interface SettingsBackupViewProps {
  transactions: Transaction[];
  settings: LedgerSettings;
  onUpdateSettings: (partial: Partial<LedgerSettings>) => void;
  onChangePin: (newPin: string) => void;
  onLock: () => void;
  onImportTransactions: (
    imported: Transaction[],
    mode: 'replace' | 'merge',
    importedSettings?: Partial<LedgerSettings>
  ) => void;
  onRestoreDemoData: () => void;
  onClearAllData: () => void;
}

const CURRENCY_PRESETS = ['৳', '$', '₹', '£', '€'];

function resizeLogoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File read error'));
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      if (file.type === 'image/svg+xml') {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image'));
      img.onload = () => {
        const maxDim = 256;
        const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png', 0.9));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const SettingsBackupView: React.FC<SettingsBackupViewProps> = ({
  transactions,
  settings,
  onUpdateSettings,
  onChangePin,
  onLock,
  onImportTransactions,
  onRestoreDemoData,
  onClearAllData,
}) => {
  // Branding form state
  const [appName, setAppName] = useState(settings.appName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [adminName, setAdminName] = useState(settings.adminName);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(settings.logoDataUrl);
  const [brandIcon, setBrandIcon] = useState<BrandIconId>(settings.brandIcon);
  const [accentTheme, setAccentTheme] = useState<AccentTheme>(settings.accentTheme);
  const [brandingError, setBrandingError] = useState('');
  const [brandingSuccess, setBrandingSuccess] = useState('');

  // PIN form state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  // Backup state
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [backupMessage, setBackupMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [confirmAction, setConfirmAction] = useState<'clear' | 'demo' | null>(null);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setAppName(settings.appName);
    setTagline(settings.tagline);
    setAdminName(settings.adminName);
    setCurrencySymbol(settings.currencySymbol);
    setLogoDataUrl(settings.logoDataUrl);
    setBrandIcon(settings.brandIcon);
    setAccentTheme(settings.accentTheme);
  }, [settings]);

  const previewTheme = getThemePalette(accentTheme);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBrandingError('');
    setBrandingSuccess('');
    if (!file.type.startsWith('image/')) {
      setBrandingError('অনুগ্রহ করে একটি বৈধ ছবি (PNG, JPG, WebP বা SVG) নির্বাচন করুন।');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setBrandingError('লোগো ফাইলের সাইজ ৪ মেগাবাইটের কম হতে হবে।');
      return;
    }
    try {
      const processed = await resizeLogoFile(file);
      setLogoDataUrl(processed);
    } catch {
      setBrandingError('লোগো ছবি প্রসেস করা যায়নি। অন্য একটি ছবি চেষ্টা করুন।');
    } finally {
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleBrandingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBrandingError('');
    setBrandingSuccess('');
    const result = validateBrandingInput({
      appName,
      tagline,
      adminName,
      currencySymbol,
    });
    if (!result.valid) {
      setBrandingError(result.error || 'তথ্য সঠিক নয়।');
      return;
    }
    onUpdateSettings({
      appName: appName.trim(),
      tagline: tagline.trim() || DEFAULT_SETTINGS.tagline,
      adminName: adminName.trim(),
      currencySymbol: currencySymbol.trim(),
      logoDataUrl,
      brandIcon,
      accentTheme,
    });
    setBrandingSuccess('লোগো, নাম ও এডমিন প্যানেল সেটিংস সংরক্ষিত হয়েছে!');
  };

  const handleResetBranding = () => {
    setBrandingError('');
    setBrandingSuccess('');
    onUpdateSettings({
      appName: DEFAULT_SETTINGS.appName,
      tagline: DEFAULT_SETTINGS.tagline,
      adminName: DEFAULT_SETTINGS.adminName,
      currencySymbol: DEFAULT_SETTINGS.currencySymbol,
      logoDataUrl: null,
      brandIcon: DEFAULT_SETTINGS.brandIcon,
      accentTheme: DEFAULT_SETTINGS.accentTheme,
    });
    setBrandingSuccess('ডিফল্ট লোগো ও নাম ফিরিয়ে আনা হয়েছে।');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');
    const result = validatePinChange(currentPin, settings.pin, newPin, confirmPin);
    if (!result.valid) {
      setPinError(result.error || 'পিন পরিবর্তন করা যায়নি।');
      return;
    }
    onChangePin(newPin.trim());
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinSuccess('পিন/পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
  };

  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = exportTransactionsToJSON(transactions, settings);
    triggerDownload(json, `cashkhata-backup-${getTodayDateString()}.json`, 'application/json');
    setBackupMessage({
      type: 'ok',
      text: `${transactions.length}টি লেনদেন ও ব্র্যান্ডিং সেটিংসের JSON ব্যাকআপ ডাউনলোড হয়েছে।`,
    });
  };

  const handleExportCSV = () => {
    const csv = exportTransactionsToCSV(transactions);
    triggerDownload(csv, `cashkhata-ledger-${getTodayDateString()}.csv`, 'text/csv;charset=utf-8;');
    setBackupMessage({
      type: 'ok',
      text: `${transactions.length}টি লেনদেনের CSV (Excel) ফাইল ডাউনলোড হয়েছে।`,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseImportedJSON(text);
      if (!parsed.valid) {
        setBackupMessage({ type: 'err', text: parsed.error || 'অবৈধ ফাইল।' });
      } else {
        onImportTransactions(parsed.transactions, importMode, parsed.settings);
        setBackupMessage({
          type: 'ok',
          text: `${parsed.transactions.length}টি লেনদেন সফলভাবে ইমপোর্ট (${
            importMode === 'replace' ? 'প্রতিস্থাপন' : 'যুক্ত'
          }) করা হয়েছে!`,
        });
      }
    } catch {
      setBackupMessage({ type: 'err', text: 'ফাইল পড়তে সমস্যা হয়েছে।' });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Admin Branding, Logo & Theme Settings */}
      <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Palette className={`w-5 h-5 ${previewTheme.accentText}`} aria-hidden="true" />
              <span>লোগো, নাম ও এডমিন প্যানেল সেটিংস (Branding & Admin Panel)</span>
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              আপনার প্রতিষ্ঠান বা ব্যক্তিগত খাতার লোগো, নাম, এডমিন প্রোফাইল ও থিম কাস্টমাইজ করুন
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetBranding}
            className="min-h-[40px] px-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>ডিফল্ট রিসেট</span>
          </button>
        </div>

        <form onSubmit={handleBrandingSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Live Sidebar / Header Brand Preview */}
          <div className={`${previewTheme.heroBg} rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
            <div className="flex items-center gap-3.5 min-w-0">
              <BrandLogo
                logoDataUrl={logoDataUrl}
                brandIcon={brandIcon}
                appName={appName || DEFAULT_SETTINGS.appName}
                size="lg"
                variant="dark"
              />
              <div className="min-w-0">
                <div className="text-xs text-white/70">লাইভ প্রিভিউ (Live Brand Preview)</div>
                <div className="text-xl font-bold text-white truncate">
                  {appName.trim() || DEFAULT_SETTINGS.appName}
                </div>
                <div className="text-xs text-white/80 truncate">
                  {tagline.trim() || DEFAULT_SETTINGS.tagline} · এডমিন: {adminName.trim() || DEFAULT_SETTINGS.adminName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label
                htmlFor="brand-logo-upload"
                className="min-h-[42px] px-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
              >
                <ImagePlus className="w-4 h-4" aria-hidden="true" />
                <span>লোগো আপলোড করুন</span>
              </label>
              <input
                ref={logoInputRef}
                id="brand-logo-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="sr-only"
              />
              {logoDataUrl && (
                <button
                  type="button"
                  onClick={() => setLogoDataUrl(null)}
                  aria-label="Remove uploaded logo"
                  className="min-h-[42px] px-3 rounded-xl bg-white/12 hover:bg-white/20 text-white text-xs font-medium inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  <span>মুছুন</span>
                </button>
              )}
            </div>
          </div>

          {/* App Name, Tagline, Admin Name, Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="admin-app-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                প্রতিষ্ঠান / অ্যাপের নাম (App or Business Name)
              </label>
              <input
                id="admin-app-name"
                type="text"
                maxLength={48}
                value={appName}
                onChange={(e) => {
                  setAppName(e.target.value);
                  setBrandingError('');
                  setBrandingSuccess('');
                }}
                placeholder="যেমন: নাজিহা এন্টারপ্রাইজ বা আমার ক্যাশ খাতা"
                className={`w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 ${previewTheme.ringFocus}`}
              />
            </div>

            <div>
              <label htmlFor="admin-tagline" className="block text-sm font-medium text-slate-700 mb-1.5">
                সাব-টাইটেল / ট্যাগলাইন (Tagline)
              </label>
              <input
                id="admin-tagline"
                type="text"
                maxLength={80}
                value={tagline}
                onChange={(e) => {
                  setTagline(e.target.value);
                  setBrandingSuccess('');
                }}
                placeholder="যেমন: দৈনিক আয়-ব্যয় ও কাস্টমার লেজার"
                className={`w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 ${previewTheme.ringFocus}`}
              />
            </div>

            <div>
              <label htmlFor="admin-display-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                এডমিনের নাম (Admin Display Name)
              </label>
              <input
                id="admin-display-name"
                type="text"
                maxLength={40}
                value={adminName}
                onChange={(e) => {
                  setAdminName(e.target.value);
                  setBrandingError('');
                  setBrandingSuccess('');
                }}
                placeholder="যেমন: মো. নাজমুল হাসান"
                className={`w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 ${previewTheme.ringFocus}`}
              />
            </div>

            <div>
              <label htmlFor="admin-currency" className="block text-sm font-medium text-slate-700 mb-1.5">
                কারেন্সি চিহ্ন (Currency Symbol)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="admin-currency"
                  type="text"
                  maxLength={4}
                  value={currencySymbol}
                  onChange={(e) => {
                    setCurrencySymbol(e.target.value);
                    setBrandingError('');
                    setBrandingSuccess('');
                  }}
                  className={`w-24 h-11 px-3.5 rounded-xl border border-slate-300 text-base font-num text-center text-slate-900 focus:outline-none focus:ring-2 ${previewTheme.ringFocus}`}
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CURRENCY_PRESETS.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setCurrencySymbol(sym)}
                      className={`min-h-[40px] min-w-[40px] rounded-xl border text-sm font-num font-semibold transition-colors ${
                        currencySymbol === sym
                          ? `${previewTheme.primaryBtn} border-transparent`
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Icon Presets & Theme Color Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">
                ডিফল্ট লোগো আইকন (Custom ছবি না থাকলে)
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {BRAND_ICON_OPTIONS.map((item) => {
                  const Icon = item.Icon;
                  const active = brandIcon === item.id && !logoDataUrl;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setBrandIcon(item.id);
                        setLogoDataUrl(null);
                      }}
                      className={`min-h-[56px] px-2 py-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                        active
                          ? `${previewTheme.accentSoftBg} ${previewTheme.accentBorder} ${previewTheme.accentText}`
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">
                এডমিন প্যানেল থিম কালার (Accent Theme)
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.values(THEME_PALETTES).map((palette) => {
                  const active = accentTheme === palette.id;
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => setAccentTheme(palette.id)}
                      className={`min-h-[48px] px-3.5 py-2 rounded-xl border flex items-center justify-between gap-2 text-left transition-colors ${
                        active
                          ? `${palette.accentSoftBg} ${palette.accentBorder} text-slate-900 font-semibold`
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-4 h-4 rounded-full ${palette.swatchClass} shrink-0`}
                          aria-hidden="true"
                        />
                        <span className="text-sm truncate">{palette.labelBn}</span>
                      </div>
                      {active && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {brandingError && (
            <div
              role="alert"
              className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5"
            >
              {brandingError}
            </div>
          )}

          {brandingSuccess && (
            <div
              role="status"
              className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{brandingSuccess}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className={`min-h-[46px] px-6 rounded-xl ${previewTheme.primaryBtn} text-sm font-semibold inline-flex items-center gap-2 transition-colors shadow-xs`}
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>সেটিংস সংরক্ষণ করুন (Save Branding)</span>
            </button>
          </div>
        </form>
      </section>

      {/* Section 2 & 3: Security PIN & Data Backup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Security & PIN Change */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className={`w-5 h-5 ${previewTheme.accentText}`} aria-hidden="true" />
                <span>নিরাপত্তা ও পিন পরিবর্তন (Security & PIN)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                লগইন পিন পরিবর্তন করুন অথবা এখনই সেশন লক করুন
              </p>
            </div>

            <button
              type="button"
              onClick={onLock}
              className="min-h-[40px] px-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>এখনই লক করুন</span>
            </button>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label htmlFor="current-pin" className="block text-sm font-medium text-slate-700 mb-1">
                বর্তমান পিন (Current PIN)
              </label>
              <input
                id="current-pin"
                type="password"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="বর্তমান পিন লিখুন"
                className={`w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-num focus:outline-none focus:ring-2 ${previewTheme.ringFocus}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="new-pin" className="block text-sm font-medium text-slate-700 mb-1">
                  নতুন পিন (New PIN)
                </label>
                <input
                  id="new-pin"
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="কমপক্ষে ৪ অক্ষর"
                  className={`w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-num focus:outline-none focus:ring-2 ${previewTheme.ringFocus}`}
                />
              </div>

              <div>
                <label htmlFor="confirm-pin" className="block text-sm font-medium text-slate-700 mb-1">
                  পিন নিশ্চিত করুন (Confirm PIN)
                </label>
                <input
                  id="confirm-pin"
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="পুনরায় লিখুন"
                  className={`w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-num focus:outline-none focus:ring-2 ${previewTheme.ringFocus}`}
                />
              </div>
            </div>

            {pinError && (
              <div
                role="alert"
                className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5"
              >
                {pinError}
              </div>
            )}

            {pinSuccess && (
              <div
                role="status"
                className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{pinSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="min-h-[44px] px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
            >
              পিন পরিবর্তন করুন (Update PIN)
            </button>
          </form>
        </section>

        {/* Data Backup, Export & Import */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xs">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              ডেটা ব্যাকআপ ও ইমপোর্ট (Export & Import)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              সব হিসাব ব্রাউজারের LocalStorage-এ সংরক্ষিত থাকে। নিরাপদ রাখতে JSON বা CSV ব্যাকআপ ডাউনলোড করুন।
            </p>
          </div>

          {/* Export Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportJSON}
              className={`min-h-[48px] px-4 rounded-xl ${previewTheme.primaryBtn} text-sm font-semibold flex items-center justify-center gap-2 transition-colors`}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Export JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="min-h-[48px] px-4 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-50 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <FileSpreadsheet className={`w-4 h-4 ${previewTheme.accentText}`} aria-hidden="true" />
              <span>Export CSV (Excel)</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-sm font-semibold text-slate-800">
                JSON ব্যাকআপ রিস্টোর (Import JSON)
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                    importMode === 'replace'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  প্রতিস্থাপন (Replace)
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                    importMode === 'merge'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  যুক্ত করুন (Merge)
                </button>
              </div>
            </div>

            <label
              htmlFor="import-json-file"
              className="min-h-[48px] px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-500 hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Upload className={`w-4 h-4 ${previewTheme.accentText}`} aria-hidden="true" />
              <span>JSON ব্যাকআপ ফাইল নির্বাচন করুন (Choose .json file)</span>
            </label>
            <input
              ref={fileInputRef}
              id="import-json-file"
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="sr-only"
            />
          </div>

          {backupMessage && (
            <div
              role="status"
              className={`text-sm rounded-xl px-3.5 py-2.5 border ${
                backupMessage.type === 'ok'
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200'
              }`}
            >
              {backupMessage.text}
            </div>
          )}

          {/* Maintenance / Reset */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="text-sm font-semibold text-slate-800">ডেটা ম্যানেজমেন্ট</div>
            {confirmAction ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs text-slate-700 font-medium">
                  {confirmAction === 'clear'
                    ? 'আপনি কি নিশ্চিতভাবে সব লেনদেন মুছে ফেলতে চান? আগে JSON ব্যাকআপ নেওয়ার পরামর্শ দেওয়া হচ্ছে।'
                    : 'বর্তমান লেনদেনগুলো বাদ দিয়ে নমুনা ডেমো ডেটা ফিরিয়ে আনতে চান?'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmAction === 'clear') {
                        onClearAllData();
                        setBackupMessage({ type: 'ok', text: 'সব লেনদেন মুছে ফেলা হয়েছে।' });
                      } else {
                        onRestoreDemoData();
                        setBackupMessage({ type: 'ok', text: 'নমুনা ডেমো ডেটা লোড করা হয়েছে।' });
                      }
                      setConfirmAction(null);
                    }}
                    className="min-h-[40px] px-4 rounded-lg bg-rose-700 text-white text-xs font-semibold"
                  >
                    হ্যাঁ, নিশ্চিত করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    className="min-h-[40px] px-4 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium"
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmAction('demo')}
                  className="min-h-[42px] px-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>ডেমো ডেটা রিস্টোর</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction('clear')}
                  className="min-h-[42px] px-3.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>সব ডেটা মুছুন (Clear All)</span>
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
