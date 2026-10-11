'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { usePathname } from 'next/navigation';
import { LogOut, User, Building2, Sparkles, LayoutDashboard, MessageSquare, Briefcase, FileText, Search, Compass, Settings } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const brandNav = [
    { name: 'Overview', href: '/brand/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/brand/campaigns', icon: Briefcase },
    { name: 'Find Creators', href: '/brand/creators', icon: Search },
    { name: 'Applications', href: '/brand/applications', icon: FileText },
    { name: 'Collaborations', href: '/brand/collaborations', icon: User },
    { name: 'Inbox', href: '/brand/inbox', icon: MessageSquare },
    { name: 'Intelligence', href: '/brand/intelligence', icon: Sparkles },
    { name: 'Profile', href: '/brand/profile', icon: Building2 },
  ];

  const creatorNav = [
    { name: 'Dashboard', href: '/creator/dashboard', icon: LayoutDashboard },
    { name: 'Discover', href: '/creator/opportunities', icon: Compass },
    { name: 'Applications', href: '/creator/applications', icon: FileText },
    { name: 'Collaborations', href: '/creator/collaborations', icon: User },
    { name: 'Inbox', href: '/creator/inbox', icon: MessageSquare },
    { name: 'Intelligence', href: '/creator/intelligence', icon: Sparkles },
    { name: 'Profile', href: '/creator/profile', icon: User },
  ];

  const navLinks = user?.role === 'CREATOR' ? creatorNav : user?.role === 'BRAND' ? brandNav : [];

  return (
    <header className="bg-white sticky top-0 z-50 flex flex-col border-b border-[#E7E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 w-full flex items-center justify-between border-b border-[#E7E8F0]">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition">
          <div className="w-9 h-9 rounded-xl bg-[#F4511E] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            🦀
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-[#17182B]">CRAB</span>
            <span className="hidden sm:inline-block ml-2 text-xs text-[#8B90A5] border-l border-[#E7E8F0] pl-2 font-medium">
              Opportunity Engine
            </span>
          </div>
        </Link>

        {/* User Role & Navigation */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#F3F3FC] border border-[#E7E8F0]">
                {user.role === 'CREATOR' ? (
                  <User className="w-3.5 h-3.5 text-[#8580E8]" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-[#F4511E]" />
                )}
                <span className="text-xs font-semibold text-[#17182B]">
                  {user.role === 'CREATOR' ? 'Creator Account' : 'Brand Account'}
                </span>
                <span className="text-xs text-[#8B90A5]">•</span>
                <span className="text-xs text-[#626782] max-w-[120px] truncate">{user.email}</span>
              </div>

              <button
                onClick={logout}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#D14343] hover:bg-red-50 transition border border-transparent hover:border-red-100"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-[#17182B] hover:text-[#F4511E] transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-xs font-semibold shadow-sm transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Navigation Row */}
      {user && navLinks.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 h-12 w-full flex items-center space-x-1 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = pathname?.startsWith(link.href) && (link.href !== '/' || pathname === '/');
            const Icon = link.icon;
            const accentColor = user.role === 'CREATOR' ? 'text-[#8580E8]' : 'text-[#F4511E]';
            const bgHover = user.role === 'CREATOR' ? 'hover:bg-[#F3F3FC]' : 'hover:bg-[#FFF5F2]';
            const activeBg = user.role === 'CREATOR' ? 'bg-[#F3F3FC]' : 'bg-[#FFF5F2]';

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isActive ? `${activeBg} ${accentColor}` : `text-[#626782] ${bgHover} hover:text-[#17182B]`
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
