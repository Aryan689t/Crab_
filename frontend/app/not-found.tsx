import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F6F2] p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-white font-bold text-2xl shadow-sm mb-4">
        🦀
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Page Not Found</h2>
      <p className="text-sm text-neutral-600 mb-6 max-w-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold transition shadow-sm"
      >
        Return Home
      </Link>
    </div>
  );
}
