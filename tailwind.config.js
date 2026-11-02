/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // The 1 app tokens (sampled from live app screenshots)
        surface: '#f3f3f5',
        'surface-dim': '#e6e6ea',
        'surface-bright': '#ffffff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f8f8fa',
        'surface-container': '#ededf0',
        'surface-container-high': '#e3e3e8',
        'surface-container-highest': '#d6d6dc',
        'on-surface': '#1a1a1a',
        'on-surface-variant': '#5f5f66',
        outline: '#8b8b94',
        'outline-variant': '#d9d9df',

        // Primary = Central / The 1 red
        primary: '#e4002b',
        'on-primary': '#ffffff',
        'primary-container': '#c40024',
        'primary-fixed': '#fdeaee',
        'primary-fixed-dim': '#f9c3cd',

        background: '#f3f3f5',
        'on-background': '#1a1a1a',

        // The 1 brand aliases
        the1: {
          red: '#e4002b',
          'red-dark': '#c40024',
          'red-soft': '#fdeaee',
          black: '#111111',
          ink: '#1a1a1a',
          gold: '#c9a227',
          'gold-soft': '#fbf3d9',
          green: '#00a650',
          'green-soft': '#e6f6ec',
          grey: '#8b8b94',
        },
        ink: '#1a1a1a',
        muted: '#5f5f66',
        canvas: '#f3f3f5',
        card: '#ffffff',
        success: '#1f9d55',
        warning: '#d9731c',
        danger: '#d0021b',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Inter', 'Noto Sans Thai', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.1rem' }],
        sm: ['0.9375rem', { lineHeight: '1.35rem' }],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 4px 14px rgba(0,0,0,0.05)',
        float: '0 8px 22px rgba(0,0,0,0.22)',
        frame: '0 30px 80px rgba(0,0,0,0.45)',
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(228,0,43,0.45)' },
          '50%': { boxShadow: '0 0 0 12px rgba(228,0,43,0)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
