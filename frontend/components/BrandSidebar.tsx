'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Briefcase,
  Search,
  FileText,
  Users,
  MessageSquare,
  Sparkles,
  Building2,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { Sidebar, SidebarBody } from './ui/sidebar';

interface BrandSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function BrandSidebar({ isOpen, setIsOpen }: BrandSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Overview', href: '/brand/dashboard', icon: Home },
    { label: 'Campaigns', href: '/brand/campaigns', icon: Briefcase },
    { label: 'Find Creators', href: '/brand/creators', icon: Search },
    { label: 'Applications', href: '/brand/applications', icon: FileText, badge: '5' },
    { label: 'Collaborations', href: '/brand/collaborations', icon: Users },
    { label: 'Inbox', href: '/brand/inbox', icon: MessageSquare, badge: '2' },
    { label: 'Intelligence', href: '/brand/intelligence', icon: Sparkles },
  ];

  const bottomItems = [
    { label: 'Settings', href: '/brand/settings', icon: Settings },
    { label: 'Brand Profile', href: '/brand/profile', icon: Building2 },
  ];

  return (
    <Sidebar open={isOpen} setOpen={setIsOpen} animate={false}>
      <SidebarBody className="justify-between bg-white border-r border-[#E7E1DA] w-[230px] shrink-0 p-4">
        {/* Top Logo & Brand Tag */}
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
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-xl tracking-tight text-[#171717]">
                CRAB
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-[#FFF4EB] text-[#FF6B00]">
                Brand
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="mt-7 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/brand/dashboard'
                  ? pathname === '/brand/dashboard'
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

        {/* Bottom Navigation: Settings directly above Brand Profile */}
        <div className="flex flex-col gap-1 pt-4 border-t border-[#E7E1DA]">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                prefetch={false}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-[#FFF4EB] text-[#FF6B00]'
                    : 'text-[#737373] hover:text-[#171717] hover:bg-[#F8F6F2]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive ? 'text-[#FF6B00]' : 'text-[#737373] group-hover:text-[#171717]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
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
