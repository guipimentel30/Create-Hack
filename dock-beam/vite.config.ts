import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Needed for resolving paths

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Add this 'resolve' block to fix the error
  resolve: {
    alias: {
      // This tells Vite to always use the project's version of React
      // for any dependency that needs it.
      'react': path.resolve(__dirname, './node_modules/react'),
    },
  },

  // It's also good practice to include the problematic dependency here
  optimizeDeps: {
    include: ['country-flag-icons/react/3x2'],
  },
});