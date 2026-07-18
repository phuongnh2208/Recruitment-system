/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#146356",
          dark: "#0D453C",
          light: "#E4F0EC",
        },
        accent: {
          DEFAULT: "#C99A3B",
          light: "#F6ECD6",
        },
        ink: "#142019",
        paper: "#F6F7F3",
        sage: "#DCE6DD",
        danger: { DEFAULT: "#B23A2E", light: "#F7E4E1" },
        warning: { DEFAULT: "#C97C2C", light: "#FBEBD9" },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ['"Be Vietnam Pro"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      borderRadius: {
        seal: "999px",
        card: "14px",
      },
      boxShadow: {
        card: "0 2px 10px -2px rgba(20, 32, 25, 0.08)",
        raised: "0 8px 24px -6px rgba(20, 32, 25, 0.16)",
      },
    },
  },
  plugins: [],
};
