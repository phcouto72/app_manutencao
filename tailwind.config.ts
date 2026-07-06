import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#12161C", // fundo principal - grafite quase preto
          900: "#181E27",
          800: "#212933",
          700: "#2E3743",
          600: "#3E4957",
          500: "#5A6674",
          400: "#8894A1",
          300: "#B7C0C9",
          100: "#EDF0F2",
        },
        signal: {
          DEFAULT: "#F5A623", // âmbar de sinalização industrial (faixa de atenção)
          dark: "#C6820F",
        },
        ok: "#3FA66D",
        warn: "#E0B400",
        danger: "#D8483B",
        info: "#3E8FD0",
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
