// Writes java/src/main/java/org/openchemlib/wasm/FunctionKeys.java from the stored keys of
// src/functionKeys/dictionary.json, in plane order, so the WebAssembly module and the dictionary
// never disagree on what bit i means, together with each fragment's query bits as the current
// module computes them. Run it after the dictionary or OpenChemLib changes, then rebuild the module.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { functionKeysSource } from './functionKeysSource.ts';

const file = join(
  import.meta.dirname,
  '../java/src/main/java/org/openchemlib/wasm/FunctionKeys.java',
);
writeFileSync(file, functionKeysSource());
console.log(`build-function-keys: wrote ${file}`);
