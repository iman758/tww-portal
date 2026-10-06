/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tww: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c2d9eb',
          300: '#94bcdb',
          400: '#5e9bc7',
          500: '#387fb3',
          600: '#286596',
          700: '#20517a',
          800: '#1d4567',
          900: '#1a3b56',
          950: '#102436',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

