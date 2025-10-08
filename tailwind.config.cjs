module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'usace-red': '#D42127',
        'usace-blue': '#003366',
        navy: {
          50: '#f0f4f8',
          100: '#dde7f0',
          200: '#c2d5e3',
          300: '#9cb9d1',
          400: '#7195b9',
          500: '#55779d',
          600: '#446184',
          700: '#3a516e',
          800: '#33455d',
          900: '#2f3d51',
          950: '#1d2635',
        },
      },
      boxShadow: {
        card: '0 12px 28px -16px rgba(15, 23, 42, 0.35), 0 6px 18px -12px rgba(15, 23, 42, 0.2)',
        'card-dark': '0 16px 36px -18px rgba(2, 6, 23, 0.75), 0 6px 18px -12px rgba(2, 6, 23, 0.5)',
      },
    },
  },
  plugins: [],
};
