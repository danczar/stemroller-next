import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./renderer-src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
