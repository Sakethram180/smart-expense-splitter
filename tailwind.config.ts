import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        canvas: "#f5efe1",
        accent: "#f97316",
        ocean: "#0f766e",
        cloud: "#fffaf1"
      },
      boxShadow: {
        soft: "0 24px 60px rgba(15, 23, 42, 0.10)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        rise: "rise 0.45s ease-out forwards"
      }
    }
  },
  plugins: []
};

export default config;
