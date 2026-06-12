/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        pro: {
          50: '#FFFBEB',
          400: '#F59E0B',
          500: '#D97706',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F8FAFC',
          dark: '#0F172A',
        },
        muted: {
          DEFAULT: '#94A3B8',
          ...{
            foreground: '#64748B',
          },
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08)',
        'pro': '0 8px 32px -4px rgb(99 102 241 / 0.15)',
      },
    },
  },
  plugins: [],
}