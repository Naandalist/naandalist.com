import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        // serif: ["Lora", ...defaultTheme.fontFamily.serif],
      },
      colors: {
        link: {
          DEFAULT: "rgba(10, 189, 227, 1.0)",
          hover: "rgba(72, 219, 251, 1.0)",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
