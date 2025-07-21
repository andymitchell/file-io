import { defineConfig } from "tsup";
 
export default defineConfig({
  entry: {
    'index': "src/index.ts",
    'index-old': "src/index-old.ts",
  },
  publicDir: false,
  clean: true,
  target: ['esnext'],
  minify: false,
  dts: true,
  format: ['esm'], 
});