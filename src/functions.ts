import { buildFunctions, readFunctionKeys } from './scan.ts';
import { INDEX_WORDS } from './types.ts';

/**
 * Builds the 512 function bits of one idcode, as sixteen 32-bit words: bit i is set when any
 * fragment of stored function key i is a substructure of the molecule.
 *
 * The keys are named chemistry — thioether, aromatic ring, uracil, Boc — so a question in words
 * becomes bit arithmetic over stored words. Their names, categories and synonyms, and the keys that
 * are computed on demand instead, are in the dictionary of `openchemlib-search-wasm/function-keys`.
 * A key's bit always agrees with a substructure search for its fragments. The words are laid out
 * as {@link getFunctionKeyFragments} shows.
 * @param idCode - The molecule to read, as an idcode.
 * @returns Sixteen words. An idcode that will not parse gives sixteen zeros.
 */
export function getFunction(idCode: string): Int32Array {
  const result = new Int32Array(INDEX_WORDS);
  buildFunctions([idCode], result, 0, 1);
  return result;
}

/**
 * Builds the 512 function bits of every idcode, sixteen 32-bit words each.
 *
 * See {@link getFunction}. Each molecule's FragFp and screen are built too, because a key's fragment
 * is only tried on a molecule holding its query words; `getMoleculeRecords` returns all three
 * from one parse. The words are written into one buffer and returned as a view per molecule.
 * @param idCodes - The molecules to read, as idcodes.
 * @returns One sixteen-word view per idcode, in order.
 */
export function getFunctions(idCodes: string[]): Int32Array[] {
  const all = new Int32Array(idCodes.length * INDEX_WORDS);
  buildFunctions(idCodes, all, 0, idCodes.length);
  const words = new Array<Int32Array>(idCodes.length);
  for (let i = 0; i < idCodes.length; i++) {
    words[i] = all.subarray(i * INDEX_WORDS, (i + 1) * INDEX_WORDS);
  }
  return words;
}

/**
 * Returns the fragments of the 512 stored function keys, in bit order: bit i of {@link getFunction}
 * is set when any fragment of key i is a substructure of the molecule. Bit i sits in word `i >> 5`,
 * the first key in the highest bit of word 0:
 *
 * ```js
 * const held = (words, i) => (words[i >> 5] & (1 << (31 - (i & 31)))) !== 0;
 * ```
 *
 * The list is frozen with the module: changing, adding or reordering a key changes every stored
 * record, so it only changes in a major release.
 * @returns 512 arrays of idcodes, each a key's fragments. The arrays are the caller's own.
 */
export function getFunctionKeyFragments(): string[][] {
  return readFunctionKeys();
}
