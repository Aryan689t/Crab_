'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'CRAB — Creator & Brand Collaboration',
  '/login': 'Sign In | CRAB',
  '/signup': 'Create Account | CRAB',

  // Creator Portal
  '/creator/dashboard': 'Overview | CRAB',
  '/creator/discover': 'Discover Opportunities | CRAB',
  '/creator/opportunities': 'Opportunities | CRAB',
  '/creator/collaborations': 'Collaborations | CRAB',
  '/creator/applications': 'Applications | CRAB',
  '/creator/inbox': 'Inbox | CRAB',
  '/creator/intelligence': 'Creator Intelligence | CRAB',
  '/creator/requests': 'Brand Requests | CRAB',
  '/creator/profile': 'Profile | CRAB',
  '/creator/settings': 'Settings | CRAB',
  '/creator/onboarding': 'Creator Onboarding | CRAB',

  // Brand Portal
  '/brand/dashboard': 'Overview | CRAB',
  '/brand/creators': 'Find Creators | CRAB',
  '/brand/campaigns': 'Campaigns | CRAB',
  '/brand/applications': 'Applications | CRAB',
  '/brand/collaborations': 'Collaborations | CRAB',
  '/brand/inbox': 'Inbox | CRAB',
  '/brand/intelligence': 'Brand Intelligence | CRAB',
  '/brand/profile': 'Brand Profile | CRAB',
  '/brand/settings': 'Settings | CRAB',

  // Onboarding
  '/onboarding/brand': 'Brand Onboarding | CRAB',
  '/onboarding/creator': 'Creator Onboarding | CRAB',
};

export function RouteTitleSync() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    let targetTitle = ROUTE_TITLES[pathname];

    if (!targetTitle) {
      // Dynamic fallback for any nested or sub-routes
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length === 0) {
        targetTitle = 'CRAB — Creator & Brand Collaboration';
      } else {
        const lastSegment = segments[segments.length - 1];
        const formatted = lastSegment
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
        targetTitle = `${formatted} | CRAB`;
      }
    }

    // Guard against any duplicated suffix
    if (targetTitle.includes('| CRAB | CRAB')) {
      targetTitle = targetTitle.replace(/\| CRAB \| CRAB/g, '| CRAB');
    }

    document.title = targetTitle;
  }, [pathname]);

  return null;
}

export default RouteTitleSync;
