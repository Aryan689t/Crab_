'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  FileText,
  Mail,
  Users,
  MessageSquare,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { Sidebar, SidebarBody } from './ui/sidebar';

interface CreatorSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreatorSidebar({ isOpen, setIsOpen }: CreatorSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview', href: '/creator/dashboard', icon: Home },
    { label: 'Discover', href: '/creator/discover', icon: Search },
    { label: 'Opportunities', href: '/creator/opportunities', icon: Mail, badge: '8' },
    { label: 'Collaborations', href: '/creator/collaborations', icon: Users },
    { label: 'Inbox', href: '/creator/inbox', icon: MessageSquare },
    { label: 'Intelligence', href: '/creator/intelligence', icon: Sparkles },
  ];

  const isSettingsActive = pathname?.startsWith('/creator/settings');
  const isProfileActive =
    pathname === '/creator/profile' ||
    pathname === '/profile' ||
    pathname?.startsWith('/creator/profile');

  const accountUsername = user?.displayName
    ? user.displayName.includes(' ')
      ? user.displayName.toLowerCase().replace(/\s+/g, '.')
      : user.displayName
    : user?.email
    ? user.email.split('@')[0]
    : 'creator';

  return (
    <Sidebar open={isOpen} setOpen={setIsOpen} animate={false}>
      <SidebarBody className="justify-between bg-white border-r border-[#E7E1DA] w-[230px] shrink-0 p-4">
        {/* Top Logo & Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Link
            href="/"
            className="flex items-center gap-2.5 py-1.5 px-2 hover:opacity-90 transition group"
          >
            <img
              src="/crab-logo.png"
              alt="CRAB"
              className="w-8 h-8 object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            <span className="font-bold text-xl tracking-tight text-[#171717]">
              CRAB
            </span>
          </Link>

          {/* Navigation Items */}
          <nav className="mt-7 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/creator/dashboard'
                  ? pathname === '/creator/dashboard'
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={false}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group relative ${
                    isActive
                      ? 'bg-[#FFF4EB] text-[#FF6B00]'
                      : 'text-[#737373] hover:text-[#171717] hover:bg-[#F8F6F2]'
                  }`}
                >
                  {/* Active Indicator Bar on Left */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#FF6B00]" />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 transition ${
                      isActive ? 'text-[#FF6B00]' : 'text-[#737373] group-hover:text-[#171717]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>

                  {/* Notification Badge */}
                  {item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full bg-[#FF6B00] text-white text-[10px] font-bold leading-none shrink-0 shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Menu: Settings & Relocated User Profile Badge */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-[#E7E1DA]">
          {/* 1. Settings */}
          <Link
            href="/creator/settings"
            prefetch={false}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group relative ${
              isSettingsActive
                ? 'bg-[#FFF4EB] text-[#FF6B00]'
                : 'text-[#737373] hover:text-[#171717] hover:bg-[#F8F6F2]'
            }`}
          >
            {isSettingsActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#FF6B00]" />
            )}
            <Settings
              className={`w-4 h-4 shrink-0 transition ${
                isSettingsActive ? 'text-[#FF6B00]' : 'text-[#737373] group-hover:text-[#171717]'
              }`}
            />
            <span className="truncate">Settings</span>
          </Link>

          {/* 2. [Avatar] alex.chen (Creator Account) */}
          <Link
            href="/creator/profile"
            prefetch={false}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition group relative border ${
              isProfileActive
                ? 'bg-[#FFF4EB] border-[#FF6B00]/40 text-[#171717]'
                : 'bg-white hover:bg-[#F8F6F2] border-[#E7E1DA] hover:border-[#FF6B00]/30 text-[#171717]'
            }`}
            title="Edit your verified creator profile"
          >
            {isProfileActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#FF6B00]" />
            )}
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#FF6B00]/10 border border-[#E7E1DA] shrink-0 flex items-center justify-center font-bold text-xs text-[#FF6B00]">
              {(accountUsername || 'CR').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span
                className={`text-xs font-semibold truncate leading-tight transition ${
                  isProfileActive ? 'text-[#FF6B00]' : 'text-[#171717] group-hover:text-[#FF6B00]'
                }`}
              >
                {accountUsername}
              </span>
              <span className="text-[10px] text-[#737373] truncate leading-tight">
                Creator Account
              </span>
            </div>
          </Link>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export const Logo = () => (
  <Link href="/" className="flex items-center gap-2.5 py-1 px-2 group">
    <img
      src="/crab-logo.png"
      alt="CRAB"
      className="w-8 h-8 object-contain shrink-0 group-hover:scale-105 transition-transform"
    />
    <span className="font-bold text-xl tracking-tight text-[#171717]">CRAB</span>
  </Link>
);

export const LogoIcon = () => (
  <Link href="/" className="flex items-center justify-center py-1 group">
    <img
      src="/crab-logo.png"
      alt="CRAB"
      className="w-8 h-8 object-contain shrink-0 group-hover:scale-105 transition-transform"
    />
  </Link>
);
