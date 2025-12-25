/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-custom': '#15C8FF',
        'navy-background': '#0B1120',
        'lightblue-background': '#E8F7FF',
      },
      fontFamily: {
        kanit: ['Kanit', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
