'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyCreatorOnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/creator/onboarding');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8F6F2]">
      <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#FF6B00] rounded-full animate-spin" />
    </div>
  );
}
