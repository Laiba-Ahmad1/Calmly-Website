// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        heading: "rgb(var(--color-heading) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        green: "rgb(var(--color-green) / <alpha-value>)",
        button: "var(--button-clr)",
      },

      fontFamily: {
        logo: ["var(--font-logo)"],
        body: ["var(--font-body)"],
        heading: ["var(--font-heading)"],
      },
      backgroundImage: {
        "button-shape": "url('/button.svg')",
      },
    },
  },
  plugins: [],
};