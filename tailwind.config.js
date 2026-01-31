/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base dark theme - deeper, more refined
        dark: {
          950: '#08080a',
          900: '#0f0f12',
          800: '#16161a',
          700: '#1c1c21',
          600: '#24242b',
          500: '#2a2a32',
          400: '#3f3f46',
        },
        // Project colors - vibrant against dark
        project: {
          eignamat: '#10b981',
          takkarena: '#f59e0b',
          betrithu: '#a855f7',
          kosningagatt: '#ef4444',
          arnar: '#06b6d4',
        },
        // Priority colors
        priority: {
          urgent: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#22c55e',
          none: '#71717a',
        },
        // Accent
        accent: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
          glow: 'rgba(59, 130, 246, 0.15)',
        },
        // Text
        zinc: {
          350: '#b4b4bd',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'fade-in-scale': 'fadeInScale 0.2s ease-out',
        'slide-in': 'slideInRight 0.2s ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(59, 130, 246, 0.15)',
        'glow-lg': '0 0 60px rgba(59, 130, 246, 0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.03)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)',
      },
    },
  },
  plugins: [],
}
