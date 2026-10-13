import Link from 'next/link';
import { CrabLogo } from '@/components/CrabLogo';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F6F2]">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#171717] flex items-center justify-center shadow-sm mb-5 p-2.5">
          <CrabLogo size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#171717] mb-2 font-serif">Page Not Found</h2>
        <p className="text-sm text-[#737373] mb-6 max-w-sm">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold transition shadow-sm"
        >
          Return Home
        </Link>
      </main>

      <Footer variant="auth" className="bg-[#F8F6F2] border-[#E7E1DA]" />
    </div>
  );
}
