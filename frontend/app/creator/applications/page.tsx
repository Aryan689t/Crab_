'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function CreatorApplicationsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/creator/opportunities?tab=applications');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center p-6 text-center">
      <div className="bg-white rounded-2xl border border-[#E7E1DA] p-8 max-w-md shadow-xs space-y-4">
        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin mx-auto" />
        <h2 className="text-base font-bold text-[#171717]">Redirecting to Opportunities...</h2>
        <p className="text-xs text-[#737373]">
          Applications and Invitations have been unified into your new collaboration Opportunities workspace.
        </p>
        <Link
          href="/creator/opportunities?tab=applications"
          className="inline-block px-4 py-2 rounded-xl bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E56000] transition"
        >
          Go to Opportunities
        </Link>
      </div>
    </div>
  );
}
