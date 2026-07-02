/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'card-red': '#dc2626',
        'card-black': '#000000',
        'card-heart': '#ef4444',
        'card-diamond': '#3b82f6',
        'card-club': '#22c55e',
        'card-spade': '#6b7280',
      },
      animation: {
        'card-flip': 'flip 0.6s',
        'fade-in': 'fadeIn 0.3s',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
