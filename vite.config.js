import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: true, 
    open: true
  },
  plugins: [glsl()]
});