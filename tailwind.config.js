/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bode: {
          forest: '#073F32',
          forestDark: '#042820',
          forestLight: '#0B4E3E',
          emerald: '#105C47',
          emeraldLight: '#177B5F',
          ivory: '#F8F5E9',
          ivoryDark: '#ECE7D5',
          gold: '#C2A253',
          goldLight: '#D8BC72',
          goldDark: '#9E8036',
          charcoal: '#25332C',
          muted: '#65776E',
          border: '#E3DFCF',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
