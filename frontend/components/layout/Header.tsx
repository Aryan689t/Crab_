'use client';

import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  LogOut,
  RefreshCw,
  User,
  Building2,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { user, login, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isBrand = user?.role === 'BRAND';

  const toggleRole = async () => {
    if (isBrand) {
      await login('tech.creator@crab-platform.local', 'Password123!', 'CREATOR');
    } else {
      await login('acme.brand@crab-platform.local', 'Password123!', 'BRAND');
    }
  };

  return (
    <header className="h-16 px-8 bg-[#D6DCE5] border-b border-[#E7E8F0] shadow-sm flex items-center justify-between sticky top-0 z-40">
      <div>
        {title && <h1 className="text-lg font-bold text-[#17182B] leading-none">{title}</h1>}
        {subtitle && <p className="text-xs text-[#626782] mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        {actions}

        {/* Quick Role Switcher Pill */}
        <button
          onClick={toggleRole}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition flex items-center space-x-1.5 ${
            isBrand
              ? 'bg-[#FFF5F2] text-[#F4511E] border-[#F4511E]/30 hover:bg-[#F4511E] hover:text-white'
              : 'bg-[#F3F3FC] text-[#8580E8] border-[#8580E8]/30 hover:bg-[#8580E8] hover:text-white'
          }`}
          title="Click to toggle between Creator and Brand perspective instantly"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{isBrand ? 'Switch to Creator View' : 'Switch to Brand View'}</span>
        </button>

        {/* Sign out */}
        <button
          onClick={logout}
          className="p-2 rounded-xl text-[#8B90A5] hover:text-[#D14343] hover:bg-red-50 transition"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
