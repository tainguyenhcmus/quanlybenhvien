/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hospital-red': '#dc2626',
        'hospital-red-dark': '#b91c1c',
        'hospital-neutral': '#f5f5f5',
      },
    },
  },
  plugins: [],
}

