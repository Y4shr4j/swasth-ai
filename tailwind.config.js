/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clinical Ocean-Blue & Medical-Teal theme palette
        emerald: {
          50: '#EBF6FC',
          100: '#D6EEF9',
          200: '#AEDCF2',
          300: '#7BC5E6',
          400: '#2BA8C4',
          500: '#0EA5A4',
          600: '#0B5D7A',
          700: '#084961',
          800: '#073A4D',
          900: '#052A38',
        },
        brand: {
          50: '#EBF6FC',
          100: '#D6EEF9',
          200: '#AEDCF2',
          300: '#7BC5E6',
          400: '#2BA8C4',
          500: '#0EA5A4',
          600: '#0B5D7A',
          700: '#084961',
          800: '#073A4D',
          900: '#052A38',
        },
        clinic: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#0B5D7A',
          700: '#084961',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
