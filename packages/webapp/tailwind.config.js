const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      primary: colors.indigo,

      // built-in tailwind pallette
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      indigo: colors.indigo,
    },
    extend: {},
  },
  plugins: [],
};
