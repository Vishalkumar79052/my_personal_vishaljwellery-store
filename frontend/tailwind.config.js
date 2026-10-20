/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cormorant Garamond", "Fraunces", "Playfair Display", "serif"],
        serif: ["Cormorant Garamond", "Playfair Display", "serif"],
        cinzel: ["Cinzel", "serif"],
        sans: ["Plus Jakarta Sans", "Work Sans", "sans-serif"],
        body: ["Plus Jakarta Sans", "Work Sans", "sans-serif"],
      },
      colors: {
        gold: {
          50: "#FAF7EE",
          100: "#F5EDD5",
          200: "#ECD9AB",
          300: "#DFBE6F",
          400: "#D4AF37",
          500: "#C5A059",
          600: "#A88338",
          700: "#846524",
          800: "#5D4719",
          900: "#3D2E10",
        },
        forest: {
          50: "#f2f5f0",
          100: "#e1e8dc",
          200: "#c3d1bb",
          300: "#9db690",
          400: "#729566",
          500: "#4f7549",
          600: "#3c5c39",
          700: "#2f4830",
          800: "#1e3320",
          900: "#0e2011",
          950: "#061508",
        },
        clay: {
          400: "#d99a72",
          500: "#c47a4f",
          600: "#a5613b",
        },
        cream: "#FAF9F6",
        sand: "#F4F0E8",
        ink: "#1A1D1A",
        pearl: "#FDFCFA",
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(31, 34, 28, 0.08)",
        luxury: "0 10px 40px -10px rgba(14, 32, 17, 0.12)",
        gold: "0 4px 20px -2px rgba(212, 175, 55, 0.25)",
      },
    },
  },
  plugins: [],
};
