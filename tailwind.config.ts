import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070a10",
        surface: "#0d1420",
        surface2: "#111b2a",
        line: "#1f2c40",
        muted: "#8fa5be",
        accent: "#00d5ff",
        gold: "#e8c84a",
        school: "#a78bfa"
      },
      fontFamily: {
        rajdhani: ["var(--font-rajdhani)", "sans-serif"],
        exo: ["var(--font-exo)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
