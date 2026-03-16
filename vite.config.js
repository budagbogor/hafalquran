import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor';
          }
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true, // expose to network (needed for IDX/cloud IDEs)
  },
  preview: {
    port: 4173,
    host: true,
  },
})
