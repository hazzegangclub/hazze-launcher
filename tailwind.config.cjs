/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hazze: {
          pink:  '#e91e8c',
          cyan:  '#00d4ff',
          dark:  '#0a0a0f',
          panel: '#111118',
          border:'#1e1e2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
