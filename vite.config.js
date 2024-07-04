import { fileURLToPath, URL } from 'node:url'
import path from "path"

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://bimface.com/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build:{
    rollupOptions:{
      input:{
        building:path.resolve(__dirname,'./building.html'),
        city:path.resolve(__dirname,'./city.html'),
      }
    }
  }
})
