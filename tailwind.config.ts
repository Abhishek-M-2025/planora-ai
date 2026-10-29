import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        forest: {
          50: "#f0f7f4",
          100: "#e0efe8",
          200: "#b5dbc9",
          300: "#80c1a3",
          400: "#4ca67d",
          500: "#278c5e",
          600: "#1b7049",
          700: "#16583b",
          800: "#134630",
          900: "#103a28",
          950: "#082017",
        },
        terracotta: {
          50: "#fdf6f3",
          100: "#faeae3",
          200: "#f4d3c6",
          300: "#ebb29f",
          400: "#dc896d",
          500: "#c86446",
          600: "#b45033",
          700: "#963f27",
          800: "#7c3523",
          900: "#672e20",
        },
        champagne: {
          50: "#faf8f2",
          100: "#f4efe0",
          200: "#eadcc1",
          300: "#ddc49c",
          400: "#cca873",
          500: "#ba8e50",
          600: "#a37640",
          700: "#825a34",
          800: "#6b492f",
          900: "#583c29",
        },
        sand: {
          50: "#faf9f6",
          100: "#f4f1ea",
          200: "#e7e2d6",
          300: "#d6cebe",
          400: "#beb4a0",
          500: "#a79c85",
          600: "#8f836d",
          700: "#746957",
          800: "#5e5548",
          900: "#4e473d",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(16, 36, 26, 0.05)",
        card: "0 2px 8px -2px rgba(20, 48, 35, 0.08), 0 1px 3px -1px rgba(20, 48, 35, 0.04)",
        elevated: "0 12px 28px -6px rgba(20, 48, 35, 0.12), 0 4px 10px -3px rgba(20, 48, 35, 0.06)",
        float: "0 20px 40px -12px rgba(16, 58, 40, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
