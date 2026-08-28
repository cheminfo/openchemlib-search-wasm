import { toIdCodes } from './jpath.ts';
import { runSearch } from './runSearch.ts';
import type {
  SubstructureSearchOptions,
  SubstructureSearchResult,
} from './types.ts';
import { SubstructureResult } from './types.ts';

/**
 * Tests a query fragment against many molecules and returns the ones that contain it.
 *
 * The entries are either idcodes or objects carrying one — a database row, a candidate a prescreen
 * yielded — and what comes back is those same objects, so nothing has to map positions back onto
 * the array they came from. `result` still holds one status code per entry for a caller that wants
 * the whole picture rather than the hits.
 *
 * The scan is synchronous. `onStep` reports it and can stop it, but the thread is not yielded:
 * a caller that needs a responsive main thread slices the array across calls, or runs this in a
 * worker.
 * @param idCodeQuery - The query, as an idcode. It is searched as a fragment whatever its own
 * fragment flag says, which is what `openchemlib`'s `SSSearcher` does with `setFragment(true)`.
 * @param entries - The molecules to test: idcodes, or objects holding one at `options.jpath`.
 * @param options - Where the idcode sits, how many matches are enough, and how to report progress.
 * @returns The matching entries, their positions, the status buffer and the counts.
 * @throws {Error} If the query cannot be parsed, if more than 100 idcodes cannot be, or if no entry
 * holds a string at the jpath.
 * @example
 * ```js
 * const { matches } = substructureSearch('gFp@DiTt@@B', rows, { jpath: 'molecule.idCode' });
 * ```
 */
export function substructureSearch<Entry>(
  idCodeQuery: string,
  entries: readonly Entry[],
  options: SubstructureSearchOptions = {},
): SubstructureSearchResult<Entry> {
  const {
    jpath = 'idCode',
    limit = Number.MAX_SAFE_INTEGER,
    collect = true,
    onStep,
    stepSize,
  } = options;

  const idCodes = toIdCodes(entries, jpath);
  // A fresh Uint8Array is already all zeros, which is `unprocessed`.
  const result = new Uint8Array(entries.length);
  const tally = { matched: 0, unparsable: 0 };
  const indexes: number[] = [];
  const bounded = limit < entries.length;

  // A whole step is tallied before the limit is checked, so `matched` and `unparsable` always
  // describe exactly the entries that were scanned. The overshoot that buys is under one step, and
  // `indexes` is cut back to `limit` below.
  const collectRange = (from: number, to: number): boolean => {
    for (let i = from; i < to; i++) {
      const value = result[i] as number;
      if (value === SubstructureResult.match) {
        tally.matched++;
        if (collect) indexes.push(i);
      } else if (value === SubstructureResult.unparsable) {
        tally.unparsable++;
      }
    }
    return bounded && tally.matched >= limit;
  };

  const run = runSearch({
    mode: 'substructure',
    idCodeQuery,
    idCodes,
    result,
    tally,
    collectRange,
    stepSize,
    onStep,
    stoppable: bounded,
  });

  if (indexes.length > limit) indexes.length = limit;
  const matches = new Array<Entry>(indexes.length);
  for (let i = 0; i < indexes.length; i++) {
    matches[i] = entries[indexes[i] as number] as Entry;
  }

  return {
    matches,
    indexes,
    result,
    matched: tally.matched,
    unparsable: tally.unparsable,
    processed: run.processed,
    total: entries.length,
    elapsed: run.elapsed,
    stopped: run.stopped,
  };
}
