import { buildIndexes, buildNoStereoTautomerHashes } from './scan.ts';
import type { TautomerHashOptions } from './types.ts';
import { INDEX_WORDS } from './types.ts';

export { substructureSearch } from './substructureSearch.ts';
export { similaritySearch } from './similaritySearch.ts';
export { INDEX_WORDS, NO_HASH } from './types.ts';
export type {
  ResultBuffer,
  SearchMode,
  SearchOptions,
  SearchResult,
  SearchStep,
  SimilaritySearchOptions,
  SimilaritySearchResult,
  SubstructureSearchOptions,
  SubstructureSearchResult,
  TautomerHashOptions,
} from './types.ts';
export { SimilarityResult, SubstructureResult } from './types.ts';

/**
 * Builds the 512-bit FragFp fingerprint of one idcode, as sixteen 32-bit words.
 *
 * This is what a fingerprint table is made of, and building it is the expensive part of importing a
 * library: about 897 µs per molecule, against 4484 µs for `openchemlib-js` — six minutes instead of
 * thirty for 400,000 molecules. Calling this once per molecule costs the same as one batched call,
 * so a row-at-a-time importer needs no restructuring to get that.
 *
 * The words are in the same order `openchemlib-js`'s `createIndex` produces, so they are
 * interchangeable with an existing table, and a `BigInt64Array` view over the result is exactly the
 * eight columns `openchemlib-sqlite` stores — no conversion, no copy:
 *
 * ```js
 * const index = getIndex(idCode);
 * const columns = new BigInt64Array(index.buffer, index.byteOffset, 8); // ss_index0..7
 * insert.run(mw, entryId, ...columns);
 * ```
 * @param idCode - The molecule to fingerprint, as an idcode.
 * @returns Sixteen words. An idcode that will not parse gives sixteen zeros, which no non-empty
 * query is a subset of, so it can never be a false candidate.
 */
export function getIndex(idCode: string): Int32Array {
  const result = new Int32Array(INDEX_WORDS);
  buildIndexes([idCode], result, 0, 1);
  return result;
}

/**
 * Builds the 512-bit FragFp fingerprint of every idcode, sixteen 32-bit words each.
 *
 * See {@link getIndex} for the one-molecule form, which costs the same per molecule: the 512 key
 * fragments OpenChemLib matches against are parsed once and held for the module's lifetime, so
 * there is nothing for a batch to amortise.
 *
 * The fingerprints are written into one buffer and returned as a view per molecule, so the array
 * costs one allocation rather than one per molecule, and every view is still 8-byte aligned and can
 * be read as the eight `BigInt64` columns {@link getIndex} shows.
 * @param idCodes - The molecules to fingerprint, as idcodes.
 * @returns One sixteen-word view per idcode, in order.
 */
export function getIndexes(idCodes: string[]): Int32Array[] {
  const all = new Int32Array(idCodes.length * INDEX_WORDS);
  buildIndexes(idCodes, all, 0, idCodes.length);
  const indexes = new Array<Int32Array>(idCodes.length);
  for (let i = 0; i < idCodes.length; i++) {
    indexes[i] = all.subarray(i * INDEX_WORDS, (i + 1) * INDEX_WORDS);
  }
  return indexes;
}

/**
 * Hashes one idcode to the 64-bit value OpenChemLib identifies a molecule by up to tautomerism and
 * stereochemistry.
 *
 * Every tautomer of a structure and every stereoisomer of it give the same hash, so two records key
 * to the same value whether the compound was drawn as the keto or the enol form, and whether or not
 * its stereo centres were assigned. That is what makes it the column to look a compound up by when
 * "the same molecule" means the same constitution rather than the same drawing.
 *
 * It is OpenChemLib's own `CanonizerUtil.getNoStereoTautomerHash`, so the value matches what any
 * other OpenChemLib build computes, and it is a signed 64-bit integer — what an SQLite `INTEGER`
 * column stores and indexes directly:
 *
 * ```js
 * insert.run(entryId, getNoStereoTautomerHash(idCode));
 * ```
 * @param idCode - The molecule to hash, as an idcode.
 * @param options - See {@link TautomerHashOptions}.
 * @returns Its hash, or `NO_HASH` (`0n`) for an idcode that will not parse or a molecule
 * OpenChemLib cannot canonize.
 */
export function getNoStereoTautomerHash(
  idCode: string,
  options: TautomerHashOptions = {},
): bigint {
  const { largestFragmentOnly = false } = options;
  const result = new BigInt64Array(1);
  buildNoStereoTautomerHashes([idCode], result, largestFragmentOnly, 0, 1);
  return result[0] as bigint;
}

/**
 * Hashes every idcode to its no-stereo tautomer hash, one 64-bit value each.
 *
 * See {@link getNoStereoTautomerHash} for what the hash identifies. A drug-like molecule costs
 * around 130 µs, against 520 µs for `openchemlib-js`, and almost all of that is canonizing the
 * generic tautomer rather than the hashing itself. That cost is nothing like uniform: it is driven
 * by how many tautomeric sites the molecule has, and one with a great many can take the better part
 * of a second before OpenChemLib abandons the enumeration — so a library import belongs in a worker
 * rather than on the main thread.
 *
 * The hashes come back in one `BigInt64Array` rather than one value per molecule, so a table of
 * them costs a single allocation and can be written straight into a column.
 * @param idCodes - The molecules to hash, as idcodes.
 * @param options - See {@link TautomerHashOptions}.
 * @returns One hash per idcode, in order, with `NO_HASH` (`0n`) for each one that could not be
 * hashed.
 */
export function getNoStereoTautomerHashes(
  idCodes: string[],
  options: TautomerHashOptions = {},
): BigInt64Array {
  const { largestFragmentOnly = false } = options;
  const result = new BigInt64Array(idCodes.length);
  buildNoStereoTautomerHashes(
    idCodes,
    result,
    largestFragmentOnly,
    0,
    idCodes.length,
  );
  return result;
}
