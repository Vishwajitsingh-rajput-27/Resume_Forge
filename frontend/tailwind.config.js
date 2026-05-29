/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      colors: {
        navy: {
          950: "#03040a", 900: "#070b18", 800: "#0c1228",
          700: "#101a3a", 600: "#162147", 500: "#1d2d5e",
        },
        gold: {
          600: "#a07830", 500: "#c9a84c", 400: "#e0ba6a",
          300: "#f0d080", 200: "#f7e4a8",
        },
      },
    },
  },
  plugins: [],
};
