const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: [
    './resource/**/*.{html,js,jsx,ts,tsx,vue}',
  ],

  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        secondary: colors.cyan,

        error: colors.red,
        warning: colors.yellow,
        success: colors.green,
        info: colors.blue,
      },
      screens: {
        'xxs': '320px',
        'xs': '400px',
      },
      scale: {
        '115': '1.15',
        '120': '1.2',
      },
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
      },
    },
    fontSize: {
      'xxs': '.5rem',
      'xs': '.75rem',
      'sm': '.875rem',
      'md': '1rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.375rem',
      '3xl': '1.5rem',
      '4xl': '1.75rem',
      '5xl': '2rem',
      '6xl': '2.25rem',
      '7xl': '2.5rem',
      '8xl': '3rem',
      '9xl': '4rem',
      '10xl': '5rem',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
