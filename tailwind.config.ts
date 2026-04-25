import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f5f1e8",
        ink: "#1b1d1a",
        moss: "#495d41",
        clay: "#b76e45",
        sand: "#e4d4bf",
        cream: "#fffaf2",
      },
      boxShadow: {
        card: "0 14px 36px rgba(27, 29, 26, 0.09)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
