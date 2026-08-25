import type { ResultBuffer, SearchMode } from './types.ts';
import { SimilarityResult, SubstructureResult } from './types.ts';
import { loadOCL } from './wasm/load.ts';

// Top-level await: the WASM module is instantiated when this module is imported, so the searches are
// plain calls. A worker pays it once, at startup, for about 25 ms.
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
 * Unlike the searches, a malformed idcode needs no recovery here: the WASM side writes sixteen
 * zeros for it and carries on, because a fingerprint no query can be a subset of is the safe answer
 * for a molecule that could not be read.
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
  return Search.getIndexes(idCodes, result, from, to);
}
