import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  server: {
    host: true, 
    open: true
  },
  plugins: [glsl()]
});