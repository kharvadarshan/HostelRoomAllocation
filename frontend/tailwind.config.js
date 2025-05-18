/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F7F4',
          100: '#DCE9E2',
          200: '#B8D3C7',
          300: '#92BEAB',
          400: '#6EA78F',
          500: '#4A9073',
          600: '#3A725C',
          700: '#2C5545',
          800: '#1E392E',
          900: '#0F1C17',
          950: '#060E0B',
        },
        secondary: {
          50: '#FBF7F1',
          100: '#F5EDE0',
          200: '#ECDBC2',
          300: '#E2C9A3',
          400: '#D9B885',
          500: '#CFA666',
          600: '#BE8D41',
          700: '#967035',
          800: '#6F5328',
          900: '#48361A',
          950: '#231B0D',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
        accent: {
          50: '#EEF9F9',
          100: '#D3EFEE',
          200: '#A7DFDE',
          300: '#7BCFCD',
          400: '#4FC0BD',
          500: '#38A9A5',
          600: '#2D8784',
          700: '#226563',
          800: '#164242',
          900: '#0B2121',
        },
        earth: {
          50: '#F9F6F3',
          100: '#F0EAE3',
          200: '#E1D5C8',
          300: '#D3C0AC',
          400: '#C4AB91',
          500: '#B59676',
          600: '#9C7B59',
          700: '#7D6347',
          800: '#5E4A35',
          900: '#3F3123',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
} 
 