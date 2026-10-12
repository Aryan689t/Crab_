/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      '@radix-ui/react-slot',
      'clsx',
      'tailwind-merge',
    ],
  },
  async redirects() {
    return [
      {
        source: '/profile',
        destination: '/creator/profile',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
