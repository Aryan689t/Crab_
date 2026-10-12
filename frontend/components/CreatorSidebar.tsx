'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ClipboardList,
  Inbox,
  Sparkles,
  User,
  Settings,
  MessageSquare,
  Users
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { Sidebar, SidebarBody, SidebarLink } from './ui/sidebar';
import { motion } from 'framer-motion';

interface CreatorSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreatorSidebar({ isOpen, setIsOpen }: CreatorSidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Overview', href: '/creator/dashboard', icon: <Search className="w-5 h-5 text-neutral-700 dark:text-neutral-200 shrink-0" /> },
    { label: 'Discover', href: '/creator/opportunities', icon: <Search className="w-5 h-5 text-neutral-700 dark:text-neutral-200 shrink-0" /> },
    { label: 'Applications', href: '/creator/applications', icon: <ClipboardList className="w-5 h-5 text-neutral-700 dark:text-neutral-200 shrink-0" /> },
    { label: 'Requests (5)', href: '/creator/requests', icon: <Inbox className="w-5 h-5 text-neutral-700 dark:text-neutral-200 shrink-0" /> },
    { label: 'Collaborations', href: '/creator/collaborations', icon: <Users className="w-5 h-5 text-neutral-700 dark:text-neutral-200 shrink-0" /> },
    { label: 'Inbox (3)', href: '/creator/inbox', icon: <MessageSquare className="w-5 h-5 text-neutral-700 dark:text-neutral-200 shrink-0" /> },
    { label: 'Intelligence', href: '/creator/intelligence', icon: <Sparkles className="w-5 h-5 text-neutral-700 dark:text-neutral-200 shrink-0" /> },
  ];

  const bottomItems = [
    { label: 'Profile', href: '/creator/profile', icon: <User className="w-5 h-5 text-neutral-700 dark:text-neutral-200 shrink-0" /> },
    { label: 'Settings', href: '/creator/settings', icon: <Settings className="w-5 h-5 text-neutral-700 dark:text-neutral-200 shrink-0" /> },
  ];

  return (
    <Sidebar open={isOpen} setOpen={setIsOpen}>
      <SidebarBody className="justify-between bg-surface border-r border-border-warm dark:bg-neutral-800 dark:border-neutral-700">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {isOpen ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {navItems.map((item, idx) => (
              <SidebarLink
                key={idx}
                link={item}
                className={pathname?.startsWith(item.href) ? "bg-surface-tint text-brand-crimson dark:bg-neutral-700 rounded-lg px-2 py-2.5 cursor-pointer font-medium" : "px-2 py-2.5 text-text-muted hover:bg-surface-hover hover:text-text-strong transition-colors rounded-lg cursor-pointer font-medium"}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border-warm dark:border-neutral-700">
          {bottomItems.map((item, idx) => (
            <SidebarLink
              key={idx}
              link={item}
              className={pathname?.startsWith(item.href) ? "bg-surface-tint text-brand-crimson dark:bg-neutral-700 rounded-lg px-2 py-2.5 cursor-pointer font-medium" : "px-2 py-2.5 text-text-muted hover:bg-surface-hover hover:text-text-strong transition-colors rounded-lg cursor-pointer font-medium"}
            />
          ))}
          <div onClick={logout} className="cursor-pointer mt-2 pt-2 border-t border-border-warm">
            <SidebarLink
              link={{ label: "Logout", href: "#", icon: <User className="w-5 h-5 text-neutral-700 dark:text-neutral-200 shrink-0" /> }}
              className="px-2 py-2.5 text-text-muted hover:bg-surface-hover hover:text-text-strong transition-colors rounded-lg cursor-pointer font-medium"
            />
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-3 items-center text-sm py-1 relative z-20 px-2 hover:opacity-90 transition"
    >
      <span className="text-2xl shrink-0">🦀</span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-xl tracking-tight text-text-strong dark:text-white whitespace-pre"
      >
        CRAB
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-3 items-center text-sm py-1 relative z-20 px-2 hover:opacity-90 transition"
    >
      <span className="text-2xl shrink-0">🦀</span>
    </Link>
  );
};
