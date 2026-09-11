/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAFA",
        surface: "#FFFFFF",
        muted: "#F4F4F5",
        border: "#E4E4E7",
        "border-strong": "#D4D4D8",
        ink: "#09090B",
        "ink-secondary": "#52525B",
        "ink-tertiary": "#A1A1AA",
        accent: "#E05A47",
        "accent-bg": "#FEE2E2",
        info: "#2563EB",
        success: "#16A34A",
        "success-bg": "#DCFCE7",
        warning: "#D97706",
        "warning-bg": "#FEF3C7",
        error: "#DC2626",
        "error-bg": "#FEE2E2",
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
      },
      boxShadow: {
        level1: "0 1px 2px 0 rgba(24,24,27,0.04)",
        level2: "0 4px 12px -2px rgba(24,24,27,0.08), 0 2px 6px -1px rgba(24,24,27,0.03)",
        level3: "0 20px 25px -5px rgba(24,24,27,0.1), 0 8px 10px -6px rgba(24,24,27,0.05)",
      },
      maxWidth: {
        container: "80rem",
      },
    },
  },
  plugins: [],
};
