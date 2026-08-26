import { buildIndexes, checkQuery, scanRange } from './scan.ts';
import { INDEX_WORDS, SimilarityResult, SubstructureResult } from './types.ts';

export { search } from './search.ts';
export { INDEX_WORDS } from './types.ts';
export type {
  ResultBuffer,
  SearchMode,
  SearchOptions,
  SearchStep,
  SearchSummary,
} from './types.ts';
export { SimilarityResult, SubstructureResult } from './types.ts';

/**
 * Tests a query fragment against many molecules, returning one status byte per molecule.
 *
 * This is the blocking primitive: it returns when the whole array has been tested. For a scan that
 * reports progress, yields to the event loop and can stop early, use `search`.
 * @param idCodeQuery - The query, as an idcode. It is searched as a fragment whatever its own
 * fragment flag says, which is what `openchemlib`'s `SSSearcher` does with `setFragment(true)`.
 * @param idCodes - The molecules to test, as idcodes.
 * @returns One {@link SubstructureResult} code per idcode, in order.
 * @throws {Error} If the query cannot be parsed, or more than 100 idcodes cannot be.
 */
export function ssSearch(idCodeQuery: string, idCodes: string[]): Uint8Array {
  checkQuery('substructure', idCodeQuery);
  const result = new Uint8Array(idCodes.length);
  scanRange('substructure', idCodeQuery, idCodes, result, 0, idCodes.length);
  return result;
}

/**
 * Computes the Tanimoto similarity of a query against many molecules on OpenChemLib's 512-bit
 * FragFp fingerprint, returning one float per molecule.
 *
 * This is the blocking primitive; `search` is the reporting, abortable version.
 *
 * The fingerprint has to be built from each idcode, and that is essentially the whole cost: 947 µs
 * per molecule against 0.03 µs for the comparison itself. When the caller already stores
 * fingerprints — as `openchemlib-sqlite` does — comparing those directly is about 30,000 times
 * cheaper than calling this. Use this when idcodes are all you have.
 * @param idCodeQuery - The query, as an idcode.
 * @param idCodes - The molecules to compare against, as idcodes.
 * @returns One Tanimoto coefficient in [0, 1] per idcode, or a {@link SimilarityResult} sentinel.
 * @throws {Error} If the query cannot be parsed, or more than 100 idcodes cannot be.
 */
export function similaritySearch(
  idCodeQuery: string,
  idCodes: string[],
): Float32Array {
  checkQuery('similarity', idCodeQuery);
  const result = new Float32Array(idCodes.length);
  result.fill(SimilarityResult.unprocessed);
  scanRange('similarity', idCodeQuery, idCodes, result, 0, idCodes.length);
  return result;
}

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
