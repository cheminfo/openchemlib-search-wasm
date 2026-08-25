import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.ts'],
      // istanbul, not v8: the tests load openchemlib-js to cross-check every result, and v8's
      // precise coverage profiles that whole GWT bundle. istanbul instruments only `include`.
      provider: 'istanbul',
    },
    snapshotFormat: {
      maxOutputLength: Number.MAX_SAFE_INTEGER,
    },
  },
});
