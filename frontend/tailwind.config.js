/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stellar: {
          blue: '#0066cc',
          amber: '#f39c12',
          dark: '#2c3e50',
        }
      }
    },
  },
  plugins: [],
}
