/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-surface": "#faf8ff",
        "on-background": "#dee5ff",
        "on-error": "#490013",
        "error-container": "#a70138",
        "on-surface-variant": "#a3aac4",
        "secondary-container": "#006c49",
        "primary-fixed": "#9396ff",
        "primary": "#a3a6ff",
        "surface-container-highest": "#192540",
        "tertiary-container": "#ff8ed2",
        "on-primary-fixed": "#000000",
        "secondary": "#69f6b8",
        "surface-tint": "#a3a6ff",
        "secondary-fixed-dim": "#58e7ab",
        "outline-variant": "#40485d",
        "on-primary": "#0f00a4",
        "on-tertiary": "#701455",
        "error": "#ff6e84",
        "surface-variant": "#192540",
        "secondary-fixed": "#69f6b8",
        "tertiary": "#ffa5d9",
        "on-surface": "#dee5ff",
        "on-primary-container": "#0a0081",
        "primary-fixed-dim": "#8387ff",
        "primary-dim": "#6063ee",
        "surface-container-lowest": "#000000",
        "on-secondary-fixed": "#00452d",
        "on-secondary-fixed-variant": "#006544",
        "error-dim": "#d73357",
        "inverse-primary": "#494bd7",
        "tertiary-fixed": "#ff8ed2",
        "surface": "#060e20",
        "surface-dim": "#060e20",
        "on-error-container": "#ffb2b9",
        "on-secondary": "#005a3c",
        "background": "#060e20",
        "surface-container-high": "#141f38",
        "on-primary-fixed-variant": "#0e009d",
        "on-tertiary-fixed": "#3b002b",
        "tertiary-fixed-dim": "#ef81c4",
        "surface-container": "#0f1930",
        "on-secondary-container": "#e1ffec",
        "surface-bright": "#1f2b49",
        "outline": "#6d758c",
        "on-tertiary-fixed-variant": "#6e1354",
        "inverse-on-surface": "#4d556b",
        "tertiary-dim": "#ef81c4",
        "surface-container-low": "#091328",
        "on-tertiary-container": "#63054a",
        "secondary-dim": "#58e7ab",
        "primary-container": "#9396ff"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
