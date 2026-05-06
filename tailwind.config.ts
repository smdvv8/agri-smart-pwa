import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        field: {
          50: "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          950: "#052e16",
        },
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
