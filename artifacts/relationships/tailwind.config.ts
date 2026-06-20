import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        /* Brand-tuned overrides for raw Tailwind utility classes
           (green-*, yellow-*, amber-*, emerald-*, gray-*) used directly
           across components. Overriding the scales here re-skins the
           whole app without touching component markup. */
        green: {
          50: "#f0f9f1",
          100: "#dbf0de",
          200: "#b8e0bf",
          300: "#8cce99",
          400: "#5cb56e",
          500: "#34974a",
          600: "#247a39",
          700: "#1d6130",
          800: "#194e29",
          900: "#153f22",
          950: "#0a2412",
        },
        yellow: {
          50: "#fdf8ec",
          100: "#faecc8",
          200: "#f5d894",
          300: "#efbf5c",
          400: "#e8a832",
          500: "#d6911c",
          600: "#b27314",
          700: "#8e5814",
          800: "#744616",
          900: "#623c17",
          950: "#391f09",
        },
        amber: {
          50: "#fdf8ec",
          100: "#faecc8",
          200: "#f5d894",
          300: "#efbf5c",
          400: "#e8a832",
          500: "#d6911c",
          600: "#b27314",
          700: "#8e5814",
          800: "#744616",
          900: "#623c17",
          950: "#391f09",
        },
        emerald: {
          50: "#f0f9f1",
          100: "#dbf0de",
          200: "#b8e0bf",
          300: "#8cce99",
          400: "#5cb56e",
          500: "#34974a",
          600: "#247a39",
          700: "#1d6130",
          800: "#194e29",
          900: "#153f22",
          950: "#0a2412",
        },
        gray: {
          50: "#f7f8f6",
          100: "#eef0ec",
          200: "#dde1d8",
          300: "#c2c8bb",
          400: "#9aa392",
          500: "#737d6c",
          600: "#565f51",
          700: "#414940",
          800: "#2f352c",
          900: "#222621",
          950: "#141712",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
          deep: "hsl(var(--primary-deep))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary-glow) / 0.4)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary-glow) / 0.7)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "scale-in": "scale-in 0.5s ease-out forwards",
        "float": "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
