import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const rootNodeModules = fileURLToPath(new URL('../../node_modules', import.meta.url));

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: `${rootNodeModules}/react`,
      'react-dom': `${rootNodeModules}/react-dom`,
    },
  },
});
