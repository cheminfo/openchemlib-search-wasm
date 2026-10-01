import type { ResultBuffer, SearchMode } from './types.ts';
import {
  INDEX_WORDS,
  NO_HASH,
  NO_ID_CODE,
  SimilarityResult,
  SubstructureResult,
} from './types.ts';
import { loadOCL } from './wasm/load.ts';

// Top-level await: the WASM module is instantiated when this module is imported, so the searches are
// plain calls. A worker pays it once, at startup, for about 25 ms from the built package.
const { Search } = await loadOCL();

// A malformed idcode makes OpenChemLib's bit-stream parser read past its input, which WebAssembly
// traps on. The trap unwinds into JS and leaves the module usable, so the entry it died on is
// recorded as unparsable and the scan resumes after it. Beyond this many, the input is not a list
// of idcodes at all and guessing further would cost one call per entry.
const MAX_UNPARSABLE = 100;

/**
 * Scans `idCodes[from .. to)` into `result`, recording an entry the parser chokes on and carrying on.
 *
 * The range is passed through to WebAssembly rather than sliced in JavaScript, because the idcodes
 * are read out of the JS array one at a time: a caller can scan the same array in as many pieces as
 * it likes without re-converting it.
 * @param mode - Which search to run.
 * @param idCodeQuery - The query, as an idcode.
 * @param idCodes - The molecules to scan.
 * @param result - The caller's buffer, already reset.
 * @param from - The first index to scan.
 * @param to - One past the last index to scan.
 * @throws {Error} If more than 100 idcodes in the range cannot be parsed.
 */
export function scanRange(
  mode: SearchMode,
  idCodeQuery: string,
  idCodes: string[],
  result: ResultBuffer,
  from: number,
  to: number,
): void {
  const unparsable =
    mode === 'similarity'
      ? SimilarityResult.unparsable
      : SubstructureResult.unparsable;
  let cursor = from;
  let failures = 0;
  while (cursor < to) {
    try {
      run(mode, idCodeQuery, idCodes, result, cursor, to);
      return;
    } catch (error) {
      const failed = firstPending(mode, result, cursor, to);
      if (failed === -1 || failures >= MAX_UNPARSABLE) {
        throw new Error(
          `the scan failed at index ${failed === -1 ? cursor : failed} after ${failures}` +
            ` unparsable idcode(s): check that "${idCodeQuery}" is a valid query idcode and that` +
            ' idCodes holds idcodes',
          { cause: error },
        );
      }
      result[failed] = unparsable;
      failures++;
      cursor = failed + 1;
    }
  }
}

/**
 * Parses the query against an empty range, so a query the parser chokes on is reported as such.
 *
 * Without it the recovery above would blame the molecules for a bad query and walk the whole array
 * one wasted call at a time.
 * @param mode - Which search the query is for.
 * @param idCodeQuery - The query, as an idcode.
 * @throws {Error} If the query cannot be parsed.
 */
export function checkQuery(mode: SearchMode, idCodeQuery: string): void {
  const empty = mode === 'similarity' ? new Float32Array(0) : new Uint8Array(0);
  try {
    run(mode, idCodeQuery, [], empty, 0, 0);
  } catch (error) {
    throw new Error(`"${idCodeQuery}" is not a valid query idcode`, {
      cause: error,
    });
  }
}

function run(
  mode: SearchMode,
  idCodeQuery: string,
  idCodes: string[],
  result: ResultBuffer,
  from: number,
  to: number,
): void {
  if (mode === 'similarity') {
    Search.similaritySearch(
      idCodeQuery,
      idCodes,
      result as Float32Array,
      from,
      to,
    );
  } else {
    Search.ssSearch(idCodeQuery, idCodes, result as Uint8Array, from, to);
  }
}

function firstPending(
  mode: SearchMode,
  result: ResultBuffer,
  from: number,
  to: number,
): number {
  for (let index = from; index < to; index++) {
    const value = result[index] as number;
    const pending =
      mode === 'similarity'
        ? Number.isNaN(value)
        : value === SubstructureResult.unprocessed;
    if (pending) return index;
  }
  return -1;
}

/**
 * Fingerprints `idCodes[from .. to)` into `result`, sixteen words per molecule.
 *
 * A molecule that cannot be read gets sixteen zeros, which no non-empty query is a subset of, so it
 * is never a false candidate.
 * @param idCodes - The molecules to fingerprint.
 * @param result - The caller's buffer, `16 * idCodes.length` words long.
 * @param from - The first index to fingerprint.
 * @param to - One past the last index to fingerprint.
 * @returns How many molecules were parsed and fingerprinted.
 */
export function buildIndexes(
  idCodes: string[],
  result: Int32Array,
  from: number,
  to: number,
): number {
  return recoveringFromTraps(
    (first, last) => Search.getIndexes(idCodes, result, first, last),
    (index) => result.fill(0, index * INDEX_WORDS, (index + 1) * INDEX_WORDS),
    from,
    to,
  );
}

/**
 * Hashes `idCodes[from .. to)` into `result`, one no-stereo tautomer hash per molecule.
 *
 * A molecule that cannot be read gets `NO_HASH`, which is also what OpenChemLib returns for one it
 * cannot canonize, so the two failures are reported the same way.
 * @param idCodes - The molecules to hash.
 * @param result - The caller's buffer, `idCodes.length` entries long.
 * @param largestFragmentOnly - Whether to strip and neutralize down to the largest fragment first.
 * @param from - The first index to hash.
 * @param to - One past the last index to hash.
 * @returns How many molecules were hashed.
 */
export function buildNoStereoTautomerHashes(
  idCodes: string[],
  result: BigInt64Array,
  largestFragmentOnly: boolean,
  from: number,
  to: number,
): number {
  return recoveringFromTraps(
    (first, last) =>
      Search.getNoStereoTautomerHashes(
        idCodes,
        result,
        largestFragmentOnly,
        first,
        last,
      ),
    (index) => {
      result[index] = NO_HASH;
    },
    from,
    to,
  );
}

/**
 * Hashes `idCodes[from .. to)` into `result`, one no-stereo hash per molecule.
 *
 * Fails the same way {@link buildNoStereoTautomerHashes} does: `0` for an idcode the WASM side
 * cannot read and for a molecule OpenChemLib cannot canonize.
 * @param idCodes - The molecules to hash.
 * @param result - The caller's buffer, `idCodes.length` entries long.
 * @param largestFragmentOnly - Whether to strip and neutralize down to the largest fragment first.
 * @param from - The first index to hash.
 * @param to - One past the last index to hash.
 * @returns How many molecules were hashed.
 */
export function buildNoStereoHashes(
  idCodes: string[],
  result: BigInt64Array,
  largestFragmentOnly: boolean,
  from: number,
  to: number,
): number {
  return recoveringFromTraps(
    (first, last) =>
      Search.getNoStereoHashes(
        idCodes,
        result,
        largestFragmentOnly,
        first,
        last,
      ),
    (index) => {
      result[index] = NO_HASH;
    },
    from,
    to,
  );
}

/**
 * Canonizes `idCodes[from .. to)` into `result`, one no-stereo idcode per molecule.
 *
 * This is the string {@link buildNoStereoHashes} hashes, for a caller that stores the canonical form
 * rather than a 64-bit key. A molecule that cannot be read keeps the `NO_ID_CODE` the caller's array
 * was filled with.
 * @param idCodes - The molecules to canonize.
 * @param result - The caller's array, `idCodes.length` entries long, filled with `NO_ID_CODE`.
 * @param largestFragmentOnly - Whether to strip and neutralize down to the largest fragment first.
 * @param from - The first index to canonize.
 * @param to - One past the last index to canonize.
 * @returns How many molecules were canonized.
 */
export function buildNoStereoIdCodes(
  idCodes: string[],
  result: string[],
  largestFragmentOnly: boolean,
  from: number,
  to: number,
): number {
  return recoveringFromTraps(
    (first, last) =>
      Search.getNoStereoIdCodes(
        idCodes,
        result,
        largestFragmentOnly,
        first,
        last,
      ),
    (index) => {
      result[index] = NO_ID_CODE;
    },
    from,
    to,
  );
}

/**
 * Canonizes `idCodes[from .. to)` into `result`, one no-stereo generic-tautomer idcode per molecule.
 *
 * Fails the same way {@link buildNoStereoIdCodes} does.
 * @param idCodes - The molecules to canonize.
 * @param result - The caller's array, `idCodes.length` entries long, filled with `NO_ID_CODE`.
 * @param largestFragmentOnly - Whether to strip and neutralize down to the largest fragment first.
 * @param from - The first index to canonize.
 * @param to - One past the last index to canonize.
 * @returns How many molecules were canonized.
 */
export function buildNoStereoTautomerIdCodes(
  idCodes: string[],
  result: string[],
  largestFragmentOnly: boolean,
  from: number,
  to: number,
): number {
  return recoveringFromTraps(
    (first, last) =>
      Search.getNoStereoTautomerIdCodes(
        idCodes,
        result,
        largestFragmentOnly,
        first,
        last,
      ),
    (index) => {
      result[index] = NO_ID_CODE;
    },
    from,
    to,
  );
}

/**
 * Runs a ranged WASM call, and redoes the range one molecule at a time if it traps.
 *
 * A malformed idcode makes OpenChemLib's bit-stream parser read past its input, which WebAssembly
 * traps on — the same trap {@link scanRange} recovers from. The Java guard catches an empty or
 * non-ASCII idcode, but a malformed ASCII one reaches the parser and traps there, which would
 * otherwise lose every molecule in the range including the good ones. The trap leaves the module
 * usable, and a per-molecule call costs what a batched one does because the 512 key fragments are
 * parsed once for the module's lifetime, so redoing the range singly costs nothing that was not
 * already going to be spent.
 *
 * There is no cap on the failures: these functions promise a per-molecule "could not read this"
 * answer rather than an exception, so an array that is entirely garbage yields one of those per
 * entry.
 * @param call - Runs the WASM call over a range, returning how many molecules it handled.
 * @param markUnreadable - Writes the "could not read this" answer for one molecule.
 * @param from - The first index to handle.
 * @param to - One past the last index to handle.
 * @returns How many molecules were handled.
 */
function recoveringFromTraps(
  call: (from: number, to: number) => number,
  markUnreadable: (index: number) => void,
  from: number,
  to: number,
): number {
  try {
    return call(from, to);
  } catch {
    let handled = 0;
    for (let index = from; index < to; index++) {
      try {
        handled += call(index, index + 1);
      } catch {
        markUnreadable(index);
      }
    }
    return handled;
  }
}
