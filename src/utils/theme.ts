import type { AccentTheme } from '../types/ledger';

export interface ThemePalette {
  id: AccentTheme;
  labelBn: string;
  labelEn: string;
  swatchClass: string;
  sidebarBg: string;
  sidebarBorder: string;
  sidebarActiveBg: string;
  sidebarActiveText: string;
  sidebarMutedText: string;
  heroBg: string;
  heroSubtleBg: string;
  primaryBtn: string;
  accentText: string;
  accentBorder: string;
  accentSoftBg: string;
  ringFocus: string;
}

export const THEME_PALETTES: Record<AccentTheme, ThemePalette> = {
  emerald: {
    id: 'emerald',
    labelBn: 'ডিপ এমারেল্ড',
    labelEn: 'Deep Emerald',
    swatchClass: 'bg-emerald-800',
    sidebarBg: 'bg-[#0B221B]',
    sidebarBorder: 'border-emerald-950/60',
    sidebarActiveBg: 'bg-emerald-800/55',
    sidebarActiveText: 'text-white',
    sidebarMutedText: 'text-emerald-100/70',
    heroBg: 'bg-gradient-to-br from-[#0B261E] via-[#10382C] to-[#144738]',
    heroSubtleBg: 'bg-white/8',
    primaryBtn: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    accentText: 'text-emerald-700',
    accentBorder: 'border-emerald-600',
    accentSoftBg: 'bg-emerald-50/70',
    ringFocus: 'focus:ring-emerald-600 focus:border-emerald-600',
  },
  teal: {
    id: 'teal',
    labelBn: 'ওশান টিল',
    labelEn: 'Ocean Teal',
    swatchClass: 'bg-teal-800',
    sidebarBg: 'bg-[#0B2126]',
    sidebarBorder: 'border-teal-950/60',
    sidebarActiveBg: 'bg-teal-800/55',
    sidebarActiveText: 'text-white',
    sidebarMutedText: 'text-teal-100/70',
    heroBg: 'bg-gradient-to-br from-[#0A252B] via-[#0F3942] to-[#134B57]',
    heroSubtleBg: 'bg-white/8',
    primaryBtn: 'bg-teal-700 hover:bg-teal-800 text-white',
    accentText: 'text-teal-700',
    accentBorder: 'border-teal-600',
    accentSoftBg: 'bg-teal-50/70',
    ringFocus: 'focus:ring-teal-600 focus:border-teal-600',
  },
  indigo: {
    id: 'indigo',
    labelBn: 'রয়্যাল ইন্ডিগো',
    labelEn: 'Royal Indigo',
    swatchClass: 'bg-indigo-800',
    sidebarBg: 'bg-[#12162E]',
    sidebarBorder: 'border-indigo-950/60',
    sidebarActiveBg: 'bg-indigo-800/55',
    sidebarActiveText: 'text-white',
    sidebarMutedText: 'text-indigo-100/70',
    heroBg: 'bg-gradient-to-br from-[#131836] via-[#1D2552] to-[#263169]',
    heroSubtleBg: 'bg-white/8',
    primaryBtn: 'bg-indigo-700 hover:bg-indigo-800 text-white',
    accentText: 'text-indigo-700',
    accentBorder: 'border-indigo-600',
    accentSoftBg: 'bg-indigo-50/70',
    ringFocus: 'focus:ring-indigo-600 focus:border-indigo-600',
  },
  slate: {
    id: 'slate',
    labelBn: 'ক্লাসিক স্লেট',
    labelEn: 'Classic Slate',
    swatchClass: 'bg-slate-800',
    sidebarBg: 'bg-[#111827]',
    sidebarBorder: 'border-slate-800',
    sidebarActiveBg: 'bg-slate-800',
    sidebarActiveText: 'text-white',
    sidebarMutedText: 'text-slate-300',
    heroBg: 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155]',
    heroSubtleBg: 'bg-white/8',
    primaryBtn: 'bg-slate-900 hover:bg-slate-800 text-white',
    accentText: 'text-slate-800',
    accentBorder: 'border-slate-700',
    accentSoftBg: 'bg-slate-100',
    ringFocus: 'focus:ring-slate-700 focus:border-slate-700',
  },
};

export function getThemePalette(theme: AccentTheme): ThemePalette {
  return THEME_PALETTES[theme] ?? THEME_PALETTES.emerald;
}
