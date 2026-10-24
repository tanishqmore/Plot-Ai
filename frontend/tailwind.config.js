/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F5F0",
        ink: "#1D1D1B",
        muted: "#77736B",
        accent: "#A66A3F",
        "accent-dark": "#85512F",
        border: "#E7E2D9",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(29, 29, 27, 0.06)",
        card: "0 4px 18px rgba(29, 29, 27, 0.05)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};