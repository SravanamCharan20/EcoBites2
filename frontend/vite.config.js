import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://ecobites2-production.up.railway.app',
        secure: false,
      },
    },
  },
  plugins: [react()],
});