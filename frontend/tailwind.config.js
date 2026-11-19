/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "var(--bg-color)",
          card: "var(--card-bg)",
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          accent: "var(--accent-color)",
          "accent-text": "var(--accent-text)",
          border: "var(--border-color)",
          "card-border": "var(--card-border)",
          success: "var(--success-color)",
          danger: "var(--danger-color)",
          pill: "var(--pill-bg)",
          empty: "var(--empty-progress)",
        },
        brand: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#F7D154", // Vibrant Yellow Accent
          600: "#D97706", // Light Mode Amber Accent
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
