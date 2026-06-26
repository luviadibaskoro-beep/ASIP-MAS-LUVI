/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          350: '#5abdf6',
          400: '#38bdf8',
          450: '#22b4f6',
          500: '#0ea5e9',
          550: '#0996db',
          600: '#0284c7',
          650: '#027ab8',
          700: '#0369a1',
          850: '#075985',
          900: '#0c4a6e',
        },
        rosebrand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        'rose-450': '#f35c75',
        'rose-455': '#e64b64',
        'rose-550': '#d02441',
        'emerald-450': '#2bb47a',
        'slate-55': '#f5f8fa',
        'slate-150': '#eef2f6',
        'slate-450': '#7c8ba1',
        'slate-550': '#556477',
        'slate-650': '#3d4a5e',
        'slate-750': '#253041',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
