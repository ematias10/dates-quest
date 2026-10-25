/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'undertale-black': '#000000',
        'undertale-white': '#ffffff',
        'undertale-red': '#ff0000',
        'undertale-yellow': '#ffff00',
        'undertale-green': '#00ff00',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '6': '6px',
      }
    },
  },
  plugins: [],
}
