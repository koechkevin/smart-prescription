/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#4264D0', 50: '#EEF1FB', 600: '#3451A8', 700: '#2B4290' },
        success: { DEFAULT: '#17B26A' },
      },
    },
  },
  plugins: [],
  corePlugins: { preflight: false },
};
