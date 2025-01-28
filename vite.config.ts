import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import dts from 'vite-plugin-dts'
import fs from 'fs/promises'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/react', 'src/js'],
      insertTypesEntry: true,
      tsconfigPath: 'tsconfig.app.json',
    }),
    {
      name: 'copy-css',
      async closeBundle() {
        await fs.cp(
          path.resolve(__dirname, 'src/style'),
          path.resolve(__dirname, 'dist/style'),
          { recursive: true },
        )
      },
    },
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: {
        'react/index': path.resolve(__dirname, 'src/react/index.ts'),
        'js/index': path.resolve(__dirname, 'src/js/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
  },
})
