import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// https://vite.dev/config/
export default defineConfig({
  define: {
    'process.env': {},
  },
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': `https://e-commerce-e15c.vercel.app`, // Adjust to your backend port
    },
  },
});
