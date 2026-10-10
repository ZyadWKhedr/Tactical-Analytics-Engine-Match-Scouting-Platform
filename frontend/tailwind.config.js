/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--bg)',
          raised: 'var(--panel)',
          sunken: 'var(--panel-2)',
        },
        panel: {
          DEFAULT: 'var(--panel)',
          2: 'var(--panel-2)',
        },
        ink: {
          DEFAULT: 'var(--text)',
          2: 'var(--text-2)',
          3: 'var(--text-3)',
        },
        text: {
          DEFAULT: 'var(--text)',
          2: 'var(--text-2)',
          3: 'var(--text-3)',
        },
        rule: {
          DEFAULT: 'var(--border)',
          strong: 'var(--rule-strong)',
        },
        border: 'var(--border)',
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
          ink: 'var(--accent-ink)',
        },
        positive: 'var(--positive)',
        negative: 'var(--negative)',
        warning: 'var(--warning)',
        pitch: {
          DEFAULT: 'var(--pitch)',
          line: 'var(--pitch-line)',
        },
      },
      borderRadius: {
        panel: '10px',
        control: '8px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'IBM Plex Sans Arabic', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '3xs': ['0.6875rem', { lineHeight: '0.9rem' }],
        '2xs': ['0.75rem', { lineHeight: '1rem' }],
        'xs': ['0.8125rem', { lineHeight: '1.15rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['0.9375rem', { lineHeight: '1.4rem' }],
        'lg': ['1.0625rem', { lineHeight: '1.5rem' }],
        'xl': ['1.25rem', { lineHeight: '1.65rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.85rem' }],
        '3xl': ['1.75rem', { lineHeight: '2.1rem' }],
      },
    },
  },
  plugins: [],
};
