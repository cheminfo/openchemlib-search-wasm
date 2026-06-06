import { defineConfig, globalIgnores } from 'eslint/config';
import cheminfo from 'eslint-config-cheminfo-typescript';

export default defineConfig([
  globalIgnores(['coverage', 'lib', 'src/wasm/runtime.js', 'src/wasm/data.ts']),
  ...cheminfo,
]);
