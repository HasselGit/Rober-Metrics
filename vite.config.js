import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['highcharts', 'highcharts-react-official'],
  },
  build: {
    commonjsOptions: {
      include: [/highcharts/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
})
