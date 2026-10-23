/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Los tests viven al lado del código: src/**/*.test.ts
    passWithNoTests: true,
  },
})
