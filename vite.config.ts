import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  // Skip ESLint checking during build
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  publicDir: 'public'
})
