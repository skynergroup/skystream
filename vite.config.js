import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        plugins: [
          // Add LocatorJS Babel plugin for data-ids variant in development mode
          mode === 'development' && ['@locator/babel-jsx/dist', {
            env: 'development',
          }]
        ].filter(Boolean)
      }
    })
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  base: '/', // Use absolute paths for better SPA routing
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react']
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return 'assets/css/[name]-[hash].[ext]';
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash].[ext]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    },
    // Optimize bundle size
    chunkSizeWarningLimit: 1000,
    // Enable compression
    reportCompressedSize: true
  },
  server: {
    port: 3000,
    host: true,
    historyApiFallback: true
  },
  preview: {
    port: 4173,
    host: true,
    historyApiFallback: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'buffer']
  },
  // Environment variables configuration
  envDir: './',
  envPrefix: 'VITE_'
}))
