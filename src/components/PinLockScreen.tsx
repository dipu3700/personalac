import React, { useState } from 'react';
import {
  CheckCircle2,
  Delete,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { DEFAULT_PIN } from '../data/seedData';
import type { LedgerSettings } from '../types/ledger';
import { getThemePalette } from '../utils/theme';
import { BrandLogo } from './BrandLogo';

interface PinLockScreenProps {
  settings: LedgerSettings;
  onUnlock: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ settings, onUnlock }) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  const theme = getThemePalette(settings.accentTheme);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setError('অনুগ্রহ করে পিন লিখুন (Please enter your PIN).');
      return;
    }
    if (pinInput === settings.pin) {
      setError('');
      onUnlock();
    } else {
      setError('ভুল পিন/পাসওয়ার্ড! আবার চেষ্টা করুন (Incorrect PIN).');
      setPinInput('');
    }
  };

  const handleDigit = (digit: string) => {
    if (pinInput.length >= 16) return;
    setError('');
    setPinInput((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setError('');
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError('');
    setPinInput('');
  };

  return (
    <div className="min-h-dvh bg-[#F4F6F5] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-900/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Brand Showcase Panel */}
        <div
          className={`lg:col-span-5 ${theme.heroBg} text-white p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden`}
        >
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3.5">
              <BrandLogo
                logoDataUrl={settings.logoDataUrl}
                brandIcon={settings.brandIcon}
                appName={settings.appName}
                size="lg"
                variant="dark"
              />
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-white truncate">
                  {settings.appName}
                </h1>
                <p className="text-sm text-white/75 truncate">{settings.tagline}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/15 space-y-3">
              <p className="text-lg font-semibold text-white leading-snug">
                আপনার আয়, ব্যয় এবং দেনা-পাওনার সম্পূর্ণ সুরক্ষিত ডিজিটাল হিসাব
              </p>
              <ul className="space-y-2.5 text-sm text-white/80">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
                  <span>হাতে নগদ, ব্যাংক ও মোবাইল ব্যাংকিং ব্যালেন্স</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
                  <span>ব্যক্তি ও পার্টি ভিত্তিক দেনা-পাওনার নিট হিসাব</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
                  <span>অফলাইন LocalStorage সংরক্ষণ ও JSON/CSV ব্যাকআপ</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-6 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
            <span>এডমিন: {settings.adminName}</span>
            <span>পিন সুরক্ষিত সেশন</span>
          </div>
        </div>

        {/* Right PIN Entry Panel */}
        <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            <div className="flex items-center gap-2.5 mb-1">
              <KeyRound className={`w-5 h-5 ${theme.accentText}`} aria-hidden="true" />
              <h2 className="text-xl font-bold text-slate-900">এডমিন লগইন</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              হিসাবের খাতা খুলতে আপনার ব্যক্তিগত পিন/পাসওয়ার্ড দিন
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="pin-input"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  পিন / পাসওয়ার্ড (PIN / Password)
                </label>
                <div className="relative">
                  <input
                    id="pin-input"
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    autoComplete="current-password"
                    value={pinInput}
                    onChange={(e) => {
                      setError('');
                      setPinInput(e.target.value);
                    }}
                    placeholder="••••"
                    className={`w-full h-12 pl-4 pr-12 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-900 text-lg font-num tracking-widest focus:bg-white focus:outline-none focus:ring-2 ${theme.ringFocus}`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                    className="absolute right-1 top-1 w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5"
                >
                  {error}
                </div>
              )}

              {/* Tactile Touch Keypad */}
              <div className="grid grid-cols-3 gap-2.5 pt-1" aria-label="Numeric PIN keypad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigit(digit)}
                    className="min-h-[48px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 font-num text-lg font-semibold transition-colors"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium transition-colors"
                >
                  মুছুন
                </button>
                <button
                  type="button"
                  onClick={() => handleDigit('0')}
                  className="min-h-[48px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 font-num text-lg font-semibold transition-colors"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  aria-label="Backspace"
                  className="min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              <button
                type="submit"
                className={`w-full min-h-[48px] rounded-xl ${theme.primaryBtn} font-semibold text-base flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
              >
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                <span>প্রবেশ করুন (Unlock Ledger)</span>
              </button>
            </form>

            <p className="mt-5 text-xs text-center text-slate-500">
              {settings.pin === DEFAULT_PIN
                ? 'ডিফল্ট পিন: 1234 · এডমিন সেটিংস থেকে পিন, লোগো ও নাম পরিবর্তন করা যাবে'
                : 'আপনার ব্যক্তিগত পিন দিয়ে সুরক্ষিত · ডেটা শুধু আপনার ব্রাউজারে সংরক্ষিত'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
