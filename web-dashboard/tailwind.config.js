/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lunchbox: {
          sweet: '#FFB6C1',      // Light pink for sweet tasks
          veggies: '#90EE90',    // Light green for learning
          savory: '#FFA500',     // Orange for important tasks
          sides: '#87CEEB',      // Sky blue for quick tasks
          primary: '#4CAF50',    // Green primary
          secondary: '#2196F3',  // Blue secondary
          accent: '#FF6B6B',     // Red accent
        },
        background: {
          primary: '#FFFFFF',
          secondary: '#F8F9FA',
          tertiary: '#E9ECEF',
        },
        text: {
          primary: '#212529',
          secondary: '#6C757D',
          muted: '#ADB5BD',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}
