import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A237E",
        accent: "#236B6B",
        card: "#FFFFFF",
        background: "#F5F5F5",
        success: "#2E7D32",
        warning: "#F57F17",
        danger: "#C62828",
        border: "#E0E0E0",
        text: {
          primary: "#212121",
          secondary: "#757575",
        }
      },
    },
  },
  plugins: [],
};
export default config;
