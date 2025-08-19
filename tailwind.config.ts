import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#111827',
          foreground: '#ffffff',
          muted: '#4b5563'
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f3f4f6'
        },
      },
      boxShadow: {
        soft: '0 8px 20px rgba(0,0,0,0.06)'
      },
      borderRadius: {
        '2xl': '1rem'
      }
    },
  },
  plugins: [],
} satisfies Config
