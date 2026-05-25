import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-oxc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,       // default dev server port
    open: true        // automatically open browser
  },
  build: {
    outDir: 'dist',   // production build output folder
    sourcemap: true   // optional: generate source maps
  }
});
