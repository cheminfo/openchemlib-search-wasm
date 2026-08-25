import { defineConfig, globalIgnores } from 'eslint/config';
import cheminfo from 'eslint-config-cheminfo-typescript';
import globals from 'globals';

export default defineConfig([
  globalIgnores([
    'coverage',
    'lib/**',
    'wasm',
    'java/target',
    'openchemlib',
    'dev/dist',
    'dev/public',
  ]),
  ...cheminfo,
  {
    // Build scripts and benchmarks run in Node and report to the terminal, which is their output.
    files: ['benchmark/**/*.{js,mjs}', 'build/**/*.mjs', 'scripts/**/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
    // They are CLI entry points: printing is their output and exiting is how they report failure.
    rules: { 'no-console': 'off', 'unicorn/no-process-exit': 'off' },
  },
]);
