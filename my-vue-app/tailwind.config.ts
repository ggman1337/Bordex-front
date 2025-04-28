import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{vue,ts,js,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f5f5f5',
          100: '#e7e7e7',
          200: '#cdcdcd',
          300: '#b2b2b2',
          400: '#9a9a9a',
          500: '#8b8b8b',
          600: '#6b6b6b',
          700: '#5e5e5e',
          800: '#3d3d3d',
          900: '#1d1d1d',
          primary: '#3b82f6',
          secondary: '#10b981',
          accent: '#f59e0b',
        },
        task: 'var(--task)',
        'task-foreground': 'var(--task-foreground)',
      },
    },
  },
  plugins: [],
}

export default config
