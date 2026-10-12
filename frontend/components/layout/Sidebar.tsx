'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  LayoutDashboard,
  Compass,
  Users,
  FileText,
  MessageSquare,
  Sparkles,
  User,
  Building2,
  Layers,
  CheckSquare,
  DollarSign,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isBrand = user?.role === 'BRAND';

  const creatorNavItems = [
    { label: 'Dashboard', href: '/creator/dashboard', icon: LayoutDashboard },
    { label: 'Discover', href: '/creator/discover', icon: Compass },
    { label: 'Opportunities', href: '/creator/opportunities', icon: MessageSquare },
    { label: 'AI Intelligence', href: '/creator/intelligence', icon: Sparkles },
    { label: 'Profile & Rate Cards', href: '/creator/profile', icon: User },
  ];

  const brandNavItems = [
    { label: 'Overview', href: '/brand/dashboard', icon: LayoutDashboard },
    { label: 'Find Creators', href: '/brand/creators', icon: Users },
    { label: 'Campaigns', href: '/brand/campaigns', icon: Layers },
    { label: 'Applications', href: '/brand/applications', icon: FileText },
    { label: 'AI Intelligence', href: '/brand/intelligence', icon: Sparkles },
    { label: 'Brand Profile', href: '/brand/profile', icon: Building2 },
  ];

  const navItems = isBrand ? brandNavItems : creatorNavItems;

  return (
    <aside className="w-64 bg-[#D6DCE5] border-r border-[#E7E8F0] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 border-b border-[#E7E8F0] flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <img
              src="/crab-logo.png"
              alt="CRAB"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-bold text-base tracking-tight text-[#17182B]">CRAB</span>
              <span className="text-[10px] text-[#8580E8] ml-1.5 font-bold uppercase tracking-wider">
                {isBrand ? 'Brand' : 'Creator'}
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Action Button for Brand */}
        {isBrand && (
          <div className="p-4">
            <Link
              href="/brand/campaigns/new"
              className="w-full py-2.5 px-4 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Campaign</span>
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-[#8B90A5] uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#F3F3FC] text-[#8580E8] font-bold'
                    : 'text-[#626782] hover:bg-[#F8F9FC] hover:text-[#17182B]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#8580E8]' : 'text-[#8B90A5]'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#8580E8]" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher & User Footer */}
      <div className="p-4 border-t border-[#E7E8F0] space-y-3">
        <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E7E8F0] flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8580E8] to-[#F4511E] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {user?.displayName?.slice(0, 2).toUpperCase() || 'CR'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#17182B] truncate">
              {user?.displayName || (isBrand ? 'Brand' : 'Creator')}
            </p>
            <p className="text-[11px] text-[#8B90A5] truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
