/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6', // Primary Purple
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        violetAccent: '#6366F1', // Secondary Violet
        primaryText: '#17172A',
        secondaryText: '#77758A',
        cardBorder: '#EAE7F2',
        lightBg: '#F5F3FF',
      },
      fontFamily: {
        bengali: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(139, 92, 246, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'soft-hover': '0 12px 30px -4px rgba(139, 92, 246, 0.16), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        'card': '0 2px 12px rgba(23, 23, 42, 0.06)',
      }
    },
  },
  plugins: [],
}
