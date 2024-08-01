import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import path from 'path';
import GlobPlugin from 'vite-plugin-glob'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    GlobPlugin({
      // enable to let this plugin interpret `import.meta.glob`
      // takeover: true,
    })
  ],
  // resolve: {
  //   alias: {
  //     '@': path.resolve(__dirname, './dataset'),
  //   }
  // }
})
