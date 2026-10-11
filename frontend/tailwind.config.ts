import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './mock/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        brand: {
          primary: 'var(--brand-primary)',
          'primary-hover': 'var(--brand-primary-hover)',
          lavender: 'var(--accent-lavender)',
          crimson: 'var(--brand-crimson)',
          orange: 'var(--brand-orange)',
          peach: 'var(--brand-peach)',
          soft: 'var(--brand-soft)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
          subtle: 'var(--surface-subtle)',
          muted: 'var(--surface-muted)',
          page: 'var(--surface-page)',
          card: 'var(--surface-card)',
          tint: 'var(--surface-tint)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          strong: 'var(--text-strong)',
        },
        border: {
          DEFAULT: 'var(--border)',
          warm: 'var(--border-warm)',
          strong: 'var(--border-strong)',
        },
        status: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          danger: 'var(--danger)',
          info: 'var(--info)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-jakarta)', 'sans-serif'],
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(23, 24, 43, 0.04), 0 1px 2px -1px rgba(23, 24, 43, 0.04)',
        elevated: '0 4px 12px 0 rgba(23, 24, 43, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
