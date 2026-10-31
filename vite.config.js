import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';

// https://vite.dev/config/
export default defineConfig({
  base: '/Mission-LiFE/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'github-pages-spa-404',
      closeBundle() {
        try {
          if (fs.existsSync('dist/index.html')) {
            fs.copyFileSync('dist/index.html', 'dist/404.html');
          }
        } catch (e) {
          console.warn('Could not copy index.html to 404.html', e);
        }
      }
    }
  ],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/analytics'],
          vendor: ['react', 'react-dom', 'lucide-react', 'canvas-confetti']
        }
      }
    }
  }
});
