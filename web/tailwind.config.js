/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Colores de la marca (salen de los flyers). Definirlos solo acá (#25).
      colors: {
        tinta: '#0b1f33',
        acento: '#f5c518',
        celeste: '#7dd3e8',
        petroleo: '#1c6e8c',
      },
    },
  },
  plugins: [],
}
