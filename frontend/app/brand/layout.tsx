'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { BrandSidebar } from '../../components/BrandSidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import { Footer } from '../../components/Footer';

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const isInbox = pathname?.includes('/inbox');

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#F8F6F2]">
      {/* Sidebar */}
      <BrandSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative bg-[#F8F6F2]">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-[#E7E1DA] bg-white px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F8F6F2] transition"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#171717]">Brand Portal</span>
              <span className="text-[10px] font-bold text-[#FF6B00] bg-[#FFF4EB] px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                Campaign Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          {!isInbox && <Footer variant="portal" portalRole="brand" />}
        </div>
      </div>
    </div>
  );
}
