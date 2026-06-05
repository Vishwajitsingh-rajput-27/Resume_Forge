import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          primary:   '#00C896',
          secondary: '#F7B731',
          accent:    '#6C63FF',
        },
      },
      animation: {
        'fade-in':     'fadeIn .4s ease both',
        'slide-in':    'slideIn .4s ease both',
        'scale-in':    'scaleIn .3s ease both',
        'float':       'float 3s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
        'pulse-brand': 'pulseBrand 2s ease-in-out infinite',
        'shimmer':     'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        slideIn:     { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'none' } },
        scaleIn:     { from: { opacity: '0', transform: 'scale(.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        float:       { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseBrand:  { '0%,100%': { boxShadow: '0 0 0 0 rgba(0,200,150,0)' }, '50%': { boxShadow: '0 0 0 8px rgba(0,200,150,.15)' } },
        shimmer:     { to: { backgroundPosition: '-200% 0' } },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
