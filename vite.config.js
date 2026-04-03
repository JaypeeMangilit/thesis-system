import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    port: 5173,
    // ADD THIS SECTION BELOW
    allowedHosts: ['.trycloudflare.com'], 
    proxy: {
      '/api': {
        target: 'https://patnubay-portal-api-cloud-hzg5cehrbgcfb9hu.centralindia-01.azurewebsites.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});