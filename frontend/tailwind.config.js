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
          50: '#fff7f7',
          100: '#ffebeb',
          200: '#ffd6d5',
          300: '#fca5a5',
          350: '#f08b8b',
          400: '#e47272',
          450: '#d46060',
          500: '#bc5a58',
          550: '#a34947',
          600: '#8b3a38',
          650: '#77302f',
          700: '#642726',
          850: '#4b1d1c',
          900: '#381414',
        },
        rosebrand: {
          50: '#f0f8f8',
          100: '#dbeded',
          200: '#b7dcdc',
          300: '#87c4c3',
          400: '#5fa9a8',
          500: '#378685',
          600: '#2b6d6c',
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
