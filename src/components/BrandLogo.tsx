import React from 'react';
import {
  BookOpenCheck,
  Briefcase,
  Coins,
  Landmark,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import type { BrandIconId } from '../types/ledger';

export const BRAND_ICON_OPTIONS: {
  id: BrandIconId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'ledger', label: 'খাতা', Icon: BookOpenCheck },
  { id: 'wallet', label: 'ওয়ালেট', Icon: Wallet },
  { id: 'landmark', label: 'ব্যাংক', Icon: Landmark },
  { id: 'briefcase', label: 'ব্যবসা', Icon: Briefcase },
  { id: 'coins', label: 'টাকা', Icon: Coins },
  { id: 'shield', label: 'নিরাপত্তা', Icon: ShieldCheck },
];

interface BrandLogoProps {
  logoDataUrl: string | null;
  brandIcon: BrandIconId;
  appName: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  logoDataUrl,
  brandIcon,
  appName,
  size = 'md',
  variant = 'dark',
}) => {
  const sizeClasses =
    size === 'lg'
      ? 'w-14 h-14 rounded-2xl'
      : size === 'sm'
        ? 'w-9 h-9 rounded-xl'
        : 'w-10 h-10 rounded-xl';

  const iconSizeClasses =
    size === 'lg' ? 'w-7 h-7' : size === 'sm' ? 'w-4.5 h-4.5' : 'w-5 h-5';

  const containerStyle =
    variant === 'dark'
      ? 'bg-white/12 border border-white/18 text-white'
      : 'bg-slate-900 border border-slate-800 text-white';

  const matched =
    BRAND_ICON_OPTIONS.find((item) => item.id === brandIcon) ?? BRAND_ICON_OPTIONS[0];
  const Icon = matched.Icon;

  if (logoDataUrl) {
    return (
      <div
        className={`${sizeClasses} overflow-hidden shrink-0 flex items-center justify-center bg-white border border-slate-200/80`}
      >
        <img
          src={logoDataUrl}
          alt={`${appName} logo`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} ${containerStyle} shrink-0 flex items-center justify-center`}
      aria-hidden="true"
    >
      <Icon className={iconSizeClasses} />
    </div>
  );
};
