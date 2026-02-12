/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1e3a8a',
          light: '#3b82f6',
          dark: '#1e40af',
        },
        secondary: '#10b981',
        accent: '#f59e0b',
        danger: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        background: '#f8fafc',
        surface: '#ffffff',
        text: {
          DEFAULT: '#1e293b',
          muted: '#64748b',
        },
        border: '#e2e8f0',
      },
    },
  },
  plugins: [],
}
