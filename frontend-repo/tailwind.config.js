/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f2f8f3',
          100: '#e1f0e4',
          200: '#c5e2cb',
          300: '#9bcca5',
          400: '#6bb079',
          500: '#479556',
          600: '#347843',
          700: '#2c6037',
          800: '#264d2f',
          900: '#204028',
          950: '#0e2314',
        },
        earth: {
          50: '#faf8f5',
          100: '#f4ede4',
          200: '#e8dac8',
          300: '#d7c0a6',
          400: '#c29f80',
          500: '#b18463',
          600: '#a17053',
          700: '#865b44',
          800: '#6e4b3a',
          900: '#5c3f33',
        },
        citrus: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.18)',
        'card-earth': '0 4px 20px -2px rgba(44, 96, 55, 0.08)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'soundwave': 'soundwave 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        soundwave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '24px' },
        }
      }
    },
  },
  plugins: [],
}
