import { buildIndexes, checkQuery, scanRange } from './scan.ts';
import type { ResultBuffer } from './types.ts';
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
 * Tests a query fragment against many molecules, writing one status byte per molecule as the scan
 * advances.
 *
 * This is the blocking primitive: it returns when the whole array has been tested. For a scan that
 * reports progress, yields to the event loop and can stop early, use `search`.
 *
 * `result` is the caller's buffer, and every entry is written exactly once, in order. Backing it
 * with a `SharedArrayBuffer` and giving each worker `result.subarray(from, to)` alongside its own
 * slice of `idCodes` lets the main thread render matches while the scan is still running; because
 * one index is only ever written by one worker, plain reads and writes are enough and no atomics
 * are needed.
 * @param idCodeQuery - The query, as an idcode. It is searched as a fragment whatever its own
 * fragment flag says, which is what `openchemlib`'s `SSSearcher` does with `setFragment(true)`.
 * @param idCodes - The molecules to test, as idcodes.
 * @param result - Filled with {@link SubstructureResult} codes. Must be exactly as long as
 * `idCodes`; it is reset to `unprocessed` before the scan starts.
 * @throws {TypeError} If `result` is not as long as `idCodes`.
 * @throws {Error} If the query cannot be parsed, or more than 100 idcodes cannot be.
 */
export function ssSearch(
  idCodeQuery: string,
  idCodes: string[],
  result: Uint8Array,
): void {
  checkLength(idCodes, result);
  checkQuery('substructure', idCodeQuery);
  result.fill(SubstructureResult.unprocessed);
  scanRange('substructure', idCodeQuery, idCodes, result, 0, idCodes.length);
}

/**
 * Computes the Tanimoto similarity of a query against many molecules on OpenChemLib's 512-bit
 * FragFp fingerprint, writing one float per molecule as the scan advances.
 *
 * This is the blocking primitive; `search` is the reporting, abortable version.
 *
 * The fingerprint has to be built from each idcode, and that is essentially the whole cost: 947 µs
 * per molecule against 0.03 µs for the comparison itself. When the caller already stores
 * fingerprints — as `openchemlib-sqlite` does — comparing those directly is about 30,000 times
 * cheaper than calling this. Use this when idcodes are all you have.
 * @param idCodeQuery - The query, as an idcode.
 * @param idCodes - The molecules to compare against, as idcodes.
 * @param result - Filled with the Tanimoto coefficient in [0, 1], or the {@link SimilarityResult}
 * sentinels. Must be exactly as long as `idCodes`; it is reset to `NaN` before the scan starts.
 * @throws {TypeError} If `result` is not as long as `idCodes`.
 * @throws {Error} If the query cannot be parsed, or more than 100 idcodes cannot be.
 */
export function similaritySearch(
  idCodeQuery: string,
  idCodes: string[],
  result: Float32Array,
): void {
  checkLength(idCodes, result);
  checkQuery('similarity', idCodeQuery);
  result.fill(SimilarityResult.unprocessed);
  scanRange('similarity', idCodeQuery, idCodes, result, 0, idCodes.length);
}

function checkLength(idCodes: string[], result: ResultBuffer): void {
  if (result.length !== idCodes.length) {
    throw new TypeError(
      `result must hold one entry per idcode: got ${result.length} for ${idCodes.length} idcodes`,
    );
  }
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
 * @param result - Optional buffer of sixteen words to fill. One is allocated when it is omitted.
 * @returns The buffer. An idcode that will not parse gives sixteen zeros, which no non-empty query
 * is a subset of, so it can never be a false candidate.
 * @throws {TypeError} If `result` is not sixteen words long, or cannot be viewed as BigInt64.
 */
export function getIndex(
  idCode: string,
  result = new Int32Array(INDEX_WORDS),
): Int32Array {
  return getIndexes([idCode], result);
}

/**
 * Builds the 512-bit FragFp fingerprint of every idcode, sixteen 32-bit words each.
 *
 * See {@link getIndex} for the one-molecule form, which costs the same per molecule: the 512 key
 * fragments OpenChemLib matches against are parsed once and held for the module's lifetime, so
 * there is nothing for a batch to amortise.
 * @param idCodes - The molecules to fingerprint, as idcodes.
 * @param result - Optional buffer to fill, of `16 * idCodes.length` words. One is allocated when it
 * is omitted.
 * @returns The buffer.
 * @throws {TypeError} If `result` is the wrong length or cannot be viewed as BigInt64.
 */
export function getIndexes(
  idCodes: string[],
  result = new Int32Array(idCodes.length * INDEX_WORDS),
): Int32Array {
  const wanted = idCodes.length * INDEX_WORDS;
  if (result.length !== wanted) {
    throw new TypeError(
      `result must hold ${INDEX_WORDS} words per idcode: got ${result.length} for ${idCodes.length} idcodes, expected ${wanted}`,
    );
  }
  // A BigInt64Array view is the whole point of this layout, and it refuses a byte offset that is not
  // a multiple of 8. Catching it here says which argument is wrong, instead of failing later at the
  // view with a RangeError that names nothing.
  if (result.byteOffset % 8 !== 0) {
    throw new TypeError(
      `result must start on an 8-byte boundary so it can be read as BigInt64: its byteOffset is ${result.byteOffset}`,
    );
  }
  buildIndexes(idCodes, result, 0, idCodes.length);
  return result;
}
