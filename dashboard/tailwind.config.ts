import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#1E3A5F", 700: "#16304F", 900: "#0F2440" },
        blue: { DEFAULT: "#2E75B6", 600: "#2767A1" },
        tint: "#EEF5FC",
        success: "#0A7A3A",
        amber: "#E65100",
        danger: "#C62828",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
