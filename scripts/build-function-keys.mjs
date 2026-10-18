// Writes java/src/main/java/org/openchemlib/wasm/FunctionKeys.java from the stored keys of
// src/functionKeys/dictionary.json, in plane order, so the WebAssembly module and the dictionary
// never disagree on what bit i means. Run it after the dictionary changes, then rebuild the module.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const dictionary = JSON.parse(
  readFileSync(join(root, 'src/functionKeys/dictionary.json'), 'utf8'),
);
const stored = dictionary.keys
  .filter((key) => key.tier === 'stored')
  .toSorted((a, b) => a.plane - b.plane);
for (const [index, key] of stored.entries()) {
  if (key.plane !== index) throw new Error(`plane ${index} is missing`);
}

const lines = stored.map((key) => {
  const fragments = key.fragments.map((idCode) => `"${javaString(idCode)}"`);
  const label = `// ${key.plane} ${key.name.replaceAll(/\s+/g, ' ')}`;
  if (fragments.length === 1) return `    {${fragments[0]}}, ${label}`;
  return [
    `    { ${label}, ${fragments.length} fragments`,
    ...fragments.map((fragment) => `      ${fragment},`),
    '    },',
  ].join('\n');
});

const source = `package org.openchemlib.wasm;

/**
 * The ${stored.length} stored function keys, in plane order: bit i of a molecule's function words is
 * set when any fragment of key i is a substructure of it (see {@link Functions}).
 *
 * <p>Generated from {@code src/functionKeys/dictionary.json} by {@code npm run build-function-keys};
 * never edit it by hand. Changing, adding or reordering a key changes every stored record, so the
 * list only ever changes in a major release.
 */
final class FunctionKeys {
  private FunctionKeys() {}

  static final String[][] IDCODES = {
${lines.join('\n')}
  };
}
`;
writeFileSync(
  join(root, 'java/src/main/java/org/openchemlib/wasm/FunctionKeys.java'),
  source,
);
console.log(
  `build-function-keys: ${stored.length} keys, ${stored.reduce((sum, key) => sum + key.fragments.length, 0)} fragments`,
);

/**
 * Escapes an idcode for a Java string literal. Idcodes are ASCII from '@' upwards: the backslash
 * needs escaping, and DEL is written as an escape so the source stays printable.
 * @param {string} idCode - The idcode.
 * @returns {string} The literal's contents.
 */
function javaString(idCode) {
  return idCode
    .replaceAll('\\', '\\\\')
    .replaceAll('\u007F', String.raw`\u007F`);
}
