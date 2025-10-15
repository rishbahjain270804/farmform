/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16a34a", // Natural green
          light: "#22c55e",
          dark: "#15803d",
        },
        cream: "#fdfcf7",
        soil: "#b45309",
      },
      fontFamily: {
        sans: ["'Inter'", "'Noto Sans'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
