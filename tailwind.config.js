/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-maven-pro)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  darkMode: "class",
}
