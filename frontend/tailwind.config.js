/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Work Sans", "sans-serif"],
      },
      colors: {
        forest: {
          50: "#f2f5f0",
          100: "#e1e8dc",
          200: "#c3d1bb",
          300: "#9db690",
          400: "#729566",
          500: "#4f7549",
          600: "#3c5c39",
          700: "#2f4830",
          800: "#263a27",
          900: "#1c2b1d",
        },
        clay: {
          400: "#d99a72",
          500: "#c47a4f",
          600: "#a5613b",
        },
        cream: "#faf6ee",
        sand: "#f0e8d8",
        ink: "#1f221c",
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(31, 34, 28, 0.08)",
      },
    },
  },
  plugins: [],
};
