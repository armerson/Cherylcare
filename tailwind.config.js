/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C4849B',
        secondary: '#9B84C4',
        accent: '#84C4A3',
      },
    },
  },
  plugins: [],
}
