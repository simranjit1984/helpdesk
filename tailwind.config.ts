import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
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

        // UCL v11 — Blue-grey palette (--color-blue-grey*)
        bluegrey: {
          25:  "#F7F7F9",
          50:  "#EEEFF3",
          100: "#DEDEE6",
          200: "#BCBECE",
          300: "#9A9DB5",
          400: "#797D9C",
          500: "#5D607E",
          700: "#383A4B",
          800: "#252733",
          900: "#131319",
        },

        // UCL v11 — Primary palette (--color-primary*)
        // Mapped to "blue" so existing `blue-500` usage keeps working
        blue: {
          50:  "#E6E7F4",   // primary50
          100: "#CDD0EA",   // primary100
          300: "#6871BF",   // primary300  (focus colour)
          500: "#041295",   // primary500  (brand primary)
          600: "#030F77",   // primary600  (hover)
          700: "#020B59",   // primary700  (pressed)
          900: "#01041E",   // primary900
        },

        // UCL v11 — Green palette (--color-green*)
        green: {
          50:  "#E8F3ED",
          100: "#D1E6DA",
          200: "#A2CDB4",
          500: "#178244",
          600: "#126836",
          700: "#0E4E29",
          900: "#051A0E",
        },

        // UCL v11 — Orange palette (--color-orange*)
        orange: {
          50:  "#FCF2E6",
          100: "#FFE0B2",
          500: "#E07900",
          600: "#B36100",
          700: "#864900",
          900: "#2D1800",
        },

        // UCL v11 — Red palette (--color-red*)
        red: {
          50:  "#FCE9E6",
          100: "#FFCDD2",
          200: "#F3A599",
          500: "#E01E00",
          600: "#B31800",
          700: "#861200",
          900: "#2D0600",
        },
      },

      // UCL v11 border-radius tokens
      // --button-border-radius / --input-border-radius: 0.125rem (2px)
      // --default-border-radius: 0.25rem (4px)
      borderRadius: {
        none: "0",
        sm:   "0.125rem",   // 2px — UCL buttons, inputs, chips
        DEFAULT: "0.125rem",
        md:   "0.125rem",   // 2px — same as sm for UCL compliance
        lg:   "0.25rem",    // 4px — cards, panels
        xl:   "0.5rem",     // 8px — modals
        full: "9999px",     // pills / status badges
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "slide-up-in": {
          from: { opacity: "0", transform: "translateY(100px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to:   { opacity: "0", transform: "translateY(100px)" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "slide-up-in":     "slide-up-in 0.3s ease-out forwards",
        "slide-down-out":  "slide-down-out 0.3s ease-in forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
