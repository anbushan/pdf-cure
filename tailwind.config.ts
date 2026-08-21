import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          soft: "rgb(var(--color-ink-soft) / <alpha-value>)",
          faint: "rgb(var(--color-ink-faint) / <alpha-value>)",
        },
        paper: {
          DEFAULT: "rgb(var(--color-paper) / <alpha-value>)",
          dim: "rgb(var(--color-paper-dim) / <alpha-value>)",
          line: "rgb(var(--color-paper-line) / <alpha-value>)",
        },
        amber: {
          DEFAULT: "rgb(var(--color-amber) / <alpha-value>)",
          dark: "rgb(var(--color-amber-dark) / <alpha-value>)",
          light: "rgb(var(--color-amber-light) / <alpha-value>)",
        },
        teal: {
          DEFAULT: "rgb(var(--color-teal) / <alpha-value>)",
          dark: "rgb(var(--color-teal-dark) / <alpha-value>)",
          light: "rgb(var(--color-teal-light) / <alpha-value>)",
        },
        rust: {
          DEFAULT: "rgb(var(--color-rust) / <alpha-value>)",
          dark: "rgb(var(--color-rust-dark) / <alpha-value>)",
          light: "rgb(var(--color-rust-light) / <alpha-value>)",
        },
        violet: {
          DEFAULT: "rgb(var(--color-violet) / <alpha-value>)",
          dark: "rgb(var(--color-violet-dark) / <alpha-value>)",
          light: "rgb(var(--color-violet-light) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        stack: "3px 3px 0 0 rgba(25,25,25,0.08), 6px 6px 0 0 rgba(25,25,25,0.04)",
        card: "0 1px 2px rgba(25,25,25,0.06), 0 8px 24px rgba(25,25,25,0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
