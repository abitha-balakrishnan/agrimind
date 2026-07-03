/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: '#8FA88C',
        wheat: '#E8DCC8',
        terracotta: '#C9846B',
        charcoal: '#3A3A34',
        cream: '#F7F3EA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      borderRadius: {
        'organic': '10px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(58, 58, 52, 0.05)',
      }
    },
  },
  plugins: [],
}
