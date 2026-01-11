/** @type {import('tailwindcss').Config} */
module.exports = {
    prefix: 'tw-',
    important: true,
    content: [
        "./*.html",
        "./script.js"
    ],
    theme: {
        extend: {
            colors: {
                'cyan-aura': '#15C8FF',
                'echo-white': '#E8F7FF',
                'deep-space': '#0f172a',
                'uefa-dark': '#1e293b'
            },
            fontFamily: {
                sans: ['Kanit', 'sans-serif'],
                display: ['Oswald', 'sans-serif']
            },
            aspectRatio: {
                'cinema': '21 / 9'
            }
        }
    },
    plugins: []
}
