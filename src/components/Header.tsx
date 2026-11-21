import React from 'react';
import {
  LayoutDashboard,
  ListOrdered,
  Lock,
  Plus,
  SlidersHorizontal,
  UserCircle2,
  Users,
} from 'lucide-react';
import type { AppView, LedgerSettings } from '../types/ledger';
import { getThemePalette } from '../utils/theme';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  activeView: AppView;
  settings: LedgerSettings;
  onNavigate: (view: AppView) => void;
  onOpenAddModal: () => void;
  onLock: () => void;
}

const NAV_ITEMS: {
  id: AppView;
  label: string;
  shortLabel: string;
  pageTitle: string;
  pageSubtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'dashboard',
    label: 'ড্যাশবোর্ড',
    shortLabel: 'ড্যাশবোর্ড',
    pageTitle: 'ড্যাশবোর্ড ও সারসংক্ষেপ',
    pageSubtitle: 'বর্তমান ব্যালেন্স, অ্যাকাউন্ট ও সাম্প্রতিক লেনদেন',
    icon: LayoutDashboard,
  },
  {
    id: 'transactions',
    label: 'লেনদেন খাতা',
    shortLabel: 'লেনদেন',
    pageTitle: 'সম্পূর্ণ লেনদেন খাতা',
    pageSubtitle: 'সব জমা ও খরচের বিস্তারিত তালিকা ও ফিল্টার',
    icon: ListOrdered,
  },
  {
    id: 'parties',
    label: 'দেনা-পাওনা',
    shortLabel: 'দেনা-পাওনা',
    pageTitle: 'ব্যক্তি ও পার্টি লেজার',
    pageSubtitle: 'কার কাছে কত পাওনা এবং কাকে কত দিতে হবে',
    icon: Users,
  },
  {
    id: 'settings',
    label: 'এডমিন সেটিংস',
    shortLabel: 'এডমিন',
    pageTitle: 'এডমিন প্যানেল ও সেটিংস',
    pageSubtitle: 'লোগো, প্রতিষ্ঠানের নাম, থিম, পিন ও ব্যাকআপ ম্যানেজমেন্ট',
    icon: SlidersHorizontal,
  },
];

export const Header: React.FC<HeaderProps> = ({
  activeView,
  settings,
  onNavigate,
  onOpenAddModal,
  onLock,
}) => {
  const theme = getThemePalette(settings.accentTheme);
  const currentNav = NAV_ITEMS.find((i) => i.id === activeView) ?? NAV_ITEMS[0];

  return (
    <>
      {/* Desktop Executive Sidebar (256px) */}
      <aside
        aria-label="Sidebar navigation"
        className={`hidden lg:flex lg:flex-col lg:w-64 fixed inset-y-0 left-0 z-30 ${theme.sidebarBg} text-white border-r ${theme.sidebarBorder}`}
      >
        {/* Brand Block */}
        <div className="px-5 py-5 border-b border-white/10">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="w-full flex items-center gap-3 text-left group"
          >
            <BrandLogo
              logoDataUrl={settings.logoDataUrl}
              brandIcon={settings.brandIcon}
              appName={settings.appName}
              size="md"
              variant="dark"
            />
            <div className="min-w-0">
              <div className="text-lg font-bold tracking-tight text-white truncate">
                {settings.appName}
              </div>
              <div className={`text-xs ${theme.sidebarMutedText} truncate`}>
                {settings.tagline}
              </div>
            </div>
          </button>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Primary navigation" className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full min-h-[46px] px-3.5 rounded-xl flex items-center gap-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? `${theme.sidebarActiveBg} ${theme.sidebarActiveText} shadow-xs`
                    : `${theme.sidebarMutedText} hover:bg-white/6 hover:text-white`
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin Footer Profile & Lock */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/6 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-white/12 flex items-center justify-center text-white shrink-0">
              <UserCircle2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{settings.adminName}</div>
              <div className={`text-xs ${theme.sidebarMutedText} truncate`}>এডমিন প্যানেল</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onLock}
            aria-label="Lock Session (লক করুন)"
            className="w-full min-h-[42px] px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/12 text-white text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
          >
            <Lock className="w-4 h-4" aria-hidden="true" />
            <span>সেশন লক করুন</span>
          </button>
        </div>
      </aside>

      {/* Desktop Top Workspace Bar */}
      <header className="hidden lg:block sticky top-0 z-20 lg:pl-64 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate leading-tight">
              {currentNav.pageTitle}
            </h1>
            <p className="text-xs text-slate-500 truncate">{currentNav.pageSubtitle}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenAddModal}
              className={`min-h-[42px] px-4 py-2 rounded-xl ${theme.primaryBtn} text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors shadow-xs`}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>নতুন লেনদেন</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Compact Top Bar (56px) */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 min-w-0"
        >
          <BrandLogo
            logoDataUrl={settings.logoDataUrl}
            brandIcon={settings.brandIcon}
            appName={settings.appName}
            size="sm"
            variant="light"
          />
          <span className="text-base font-bold text-slate-900 truncate whitespace-nowrap">
            {settings.appName}
          </span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onLock}
            aria-label="Lock Session (লক করুন)"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
          >
            <Lock className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onOpenAddModal}
            className={`min-h-[44px] px-3.5 rounded-xl ${theme.primaryBtn} text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0`}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>যোগ করুন</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Thumb Navigation Bar (64px) */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-4 items-center px-1"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                isActive ? `${theme.accentText} font-semibold` : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[11px] leading-tight whitespace-nowrap">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
