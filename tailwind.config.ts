import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        panel: "#f7f8f4",
        line: "#d9dfd0",
        accent: "#0b6b5b",
        warn: "#a14d16",
        steel: "#41546f"
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"]
      }
    }
  },
  plugins: [],
};

export default config;
