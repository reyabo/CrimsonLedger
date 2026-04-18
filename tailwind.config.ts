import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          0: '#0B0B0D',
          1: '#131318',
          2: '#1C1C24',
          3: '#2A2A34',
        },
        bone: {
          DEFAULT: '#E6E1D7',
          muted: '#A8A299',
          dim: '#6E685F',
        },
        crimson: {
          DEFAULT: '#7F1020',
          bright: '#B8162C',
          deep: '#4A0612',
        },
        warn: '#D9A441',
        danger: '#E5484D',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        pip: 'inset 0 0 0 1px rgba(230,225,215,0.25)',
        pipFilled: 'inset 0 0 0 1px rgba(230,225,215,0.55)',
        glow: '0 0 0 2px rgba(184,22,44,0.35), 0 0 16px rgba(184,22,44,0.45)',
      },
      keyframes: {
        pulseCrimson: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(184,22,44,0.55)' },
          '50%': { boxShadow: '0 0 0 6px rgba(184,22,44,0.0)' },
        },
      },
      animation: {
        pulseCrimson: 'pulseCrimson 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
