import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The site is fully static: the registry index at /index.json is fetched at
// runtime. "base": "./" lets the built bundle be hosted under a path prefix
// (e.g. a GitHub Pages project page). The web/public dir is served as static
// assets by Vite automatically.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
