import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["var(--font-body)"],
        header: ["var(--font-header)"],
      },
      colors: {
        primary: {
          50: "#f0f7f9",
          100: "#e1eff3",
          200: "#c3dfe7",
          300: "#a5cfdb",
          400: "#87bfcf",
          500: "#247789",
          600: "#1f6a7a",
          700: "#1a5d6b",
          800: "#15505c",
          900: "#10434d",
        },
        secondary: {
          50: "#f0f8fc",
          100: "#e1f1f9",
          200: "#c3e3f3",
          300: "#a5d5ed",
          400: "#87c7e7",
          500: "#69b9e1",
          600: "#4b9bdb",
          700: "#2d7dd5",
          //main brand secondary
          800: "#056589",
          900: "#034d6b",
        },
        accent: {
          50: "#fdf4f1",
          100: "#fbe9e3",
          200: "#f7d3c7",
          300: "#f3bdab",
          400: "#efa78f",
          500: "#eb9173",
          600: "#e77b57",
          700: "#e3653b",
          //main brand accent
          800: "#D95D39",
          900: "#c54a2a",
        },
        brand: {
          primary: "#49796B",
          secondary: "#056589",
          accent: "#D95D39",
          light: "#F6EEDE",
          dark: "#673A21",
        },
      },
    },
  },
  plugins: [],
};
export default config;
