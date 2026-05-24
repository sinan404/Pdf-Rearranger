/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#0D0F14',
          secondary: '#13161D',
          tertiary: '#1A1E28',
          elevated: '#222734',
        },
        brand: {
          DEFAULT: '#4A7FD4',
          light: '#7FAEE8',
          muted: '#1E3A5F',
        },
        ink: {
          primary: '#F0F2F7',
          secondary: '#9BA3B8',
          muted: '#5C6478',
        },
        success: '#3DB87A',
        danger: '#D45A5A',
        warning: '#D4944A',
      },
    },
  },
  plugins: [],
}