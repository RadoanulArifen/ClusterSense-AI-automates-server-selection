/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--rgb-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        shell: token('shell'),
        panel: token('panel'),
        inset: token('inset'),
        line: token('line'),
        edge: token('edge'),
        ink: '#192318',
        brand: {
          100: '#edf9df', 200: '#e0f5c6', 300: '#d6ffa6',
          400: '#c2ee8d', 500: '#d6ffa6', 600: '#c2ee8d',
          700: '#8eb45f', 800: '#526d37', 900: '#263820',
        },
        sage: {
          100: '#e7f1e9', 200: '#d1e4d5', 300: '#b4d2bd',
          400: '#a3c8ae', 500: '#91b89a', 600: '#a3c8ae',
          700: '#60846c', 800: '#395444', 900: '#203229',
        },
        sea: {
          100: '#e2f2ed', 200: '#c4e5da', 300: '#a3d4c7',
          400: '#92cdbf', 500: '#80bcb0', 600: '#92cdbf',
          700: '#537f75', 800: '#34534d', 900: '#203531',
        },
      },
    },
  },
  plugins: [],
};
