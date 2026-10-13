'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CreatorSidebar } from '../../components/CreatorSidebar';
import { useAuth } from '../../lib/auth-context';

import { Menu } from 'lucide-react';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import { Footer } from '../../components/Footer';

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isOnboarding = pathname === '/creator/onboarding';
  const isInbox = pathname?.includes('/inbox');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'CREATOR') {
      router.replace('/brand/dashboard');
      return;
    }

    // Protection: un-onboarded creators must stay on onboarding
    if (!user.onboardingCompleted && !isOnboarding) {
      router.replace('/creator/onboarding');
      return;
    }

    // Returning/onboarded creators shouldn't stay on onboarding
    if (user.onboardingCompleted && isOnboarding) {
      router.replace('/creator/dashboard');
      return;
    }
  }, [user, loading, isOnboarding, router]);

  // Loading state during session restoration / validation
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F6F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#FF6B00] rounded-full animate-spin" />
          <p className="text-xs text-neutral-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or wrong role
  if (!user || user.role !== 'CREATOR') {
    return null;
  }

  // Transition state: redirecting un-onboarded creator to onboarding
  if (!user.onboardingCompleted && !isOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F6F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#FF6B00] rounded-full animate-spin" />
          <p className="text-xs text-neutral-500 font-medium">Redirecting to onboarding...</p>
        </div>
      </div>
    );
  }

  // Transition state: redirecting onboarded creator to dashboard
  if (user.onboardingCompleted && isOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F6F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#FF6B00] rounded-full animate-spin" />
          <p className="text-xs text-neutral-500 font-medium">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Standalone onboarding layout (focused full screen without sidebar)
  if (isOnboarding) {
    return (
      <main className="min-h-screen bg-[#F8F6F2]">
        {children}
      </main>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#F8F6F2]">
      {/* Sidebar */}
      <CreatorSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

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
              <span className="text-xs font-bold text-[#171717]">Creator Portal</span>
              <span className="text-[10px] font-bold text-[#FF6B00] bg-[#FFF4EB] px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                Verified Space
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
          {!isInbox && <Footer variant="portal" portalRole="creator" />}
        </div>
      </div>
    </div>
  );
}
