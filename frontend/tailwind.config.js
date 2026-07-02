/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stellar Global Supplies brand palette (from stellarglobalsupplies.com)
        stellar: {
          50: '#E6FBF5',
          100: '#CCF7EB',
          200: '#99EFD7',
          300: '#66E7C3',
          400: '#33DFAF',
          500: '#00B98E', // brand primary (site theme-color)
          600: '#00A17A',
          700: '#008563',
          800: '#00694D',
          900: '#004D38',
          dark: '#0F2A24',   // near-black teal, headers/footers
          amber: '#F5A623',  // accent for CTAs / secondary badges
        }
      }
    },
  },
  plugins: [],
}
