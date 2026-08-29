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

       
        greensoft: "rgb(var(--color-greensoft) / <alpha-value>)",
        lavender: "rgb(var(--color-lavender) / <alpha-value>)",
        lavendersoft: "rgb(var(--color-lavendersoft) / <alpha-value>)",
        peach: "rgb(var(--color-peach) / <alpha-value>)",
        peachsoft: "rgb(var(--color-peachsoft) / <alpha-value>)",
        blue: "rgb(var(--color-blue) / <alpha-value>)",
        bluesoft: "rgb(var(--color-bluesoft) / <alpha-value>)",

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