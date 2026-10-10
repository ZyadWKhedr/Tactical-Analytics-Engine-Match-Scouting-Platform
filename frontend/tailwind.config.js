/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--bg)',
          raised: 'var(--bg-raised)',
          sunken: 'var(--bg-sunken)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
        },
        rule: {
          DEFAULT: 'var(--rule)',
          strong: 'var(--rule-strong)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          ink: 'var(--accent-ink)',
        },
        positive: 'var(--positive)',
        negative: 'var(--negative)',
        warning: 'var(--warning)',
        pitch: {
          DEFAULT: 'var(--pitch)',
          line: 'var(--pitch-line)',
        },
        // Mappings for compatibility
        background: 'var(--bg)',
        foreground: 'var(--ink)',
        card: {
          DEFAULT: 'var(--bg-raised)',
          foreground: 'var(--ink)',
        },
        surface: {
          DEFAULT: 'var(--bg-sunken)',
          subtle: 'var(--bg-sunken)',
          highlight: 'var(--bg-raised)',
        },
        border: 'var(--rule)',
        muted: {
          DEFAULT: 'var(--bg-sunken)',
          foreground: 'var(--ink-3)',
        },
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '4px',
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Amiri', 'Georgia', 'serif'],
        sans: ['Inter', 'Cairo', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        '3xs': ['0.625rem', { lineHeight: '0.85rem' }],
        '2xs': ['0.6875rem', { lineHeight: '0.95rem' }],
        'xs': ['0.75rem', { lineHeight: '1.05rem' }],
        'sm': ['0.875rem', { lineHeight: '1.35rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.6rem' }],
        'xl': ['1.25rem', { lineHeight: '1.7rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.9rem' }],
        '3xl': ['2rem', { lineHeight: '2.2rem' }],
        '4xl': ['2.75rem', { lineHeight: '3rem' }],
        '5xl': ['3.5rem', { lineHeight: '3.6rem' }],
        '6xl': ['5.5rem', { lineHeight: '5.6rem' }],
      },
    },
  },
  plugins: [],
};
