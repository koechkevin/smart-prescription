import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PrescriptionTemplateWidget',
      formats: ['umd', 'es'],
      fileName: (format) => `prescription-template-widget.${format}.js`,
    },
    cssFileName: 'prescription-template-widget',
    outDir: 'dist',
    emptyOutDir: true,
  },
});
