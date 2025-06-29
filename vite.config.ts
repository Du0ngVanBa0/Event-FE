import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
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
