import { toIdCodes } from './jpath.ts';
import { runSearch } from './runSearch.ts';
import type {
  SimilaritySearchOptions,
  SimilaritySearchResult,
} from './types.ts';
import { SimilarityResult } from './types.ts';

/**
 * Ranks many molecules by how similar they are to a query, on OpenChemLib's 512-bit FragFp
 * fingerprint.
 *
 * The entries are either idcodes or objects carrying one, and `matches` comes back **most similar
 * first**, with `similarities` holding each one's Tanimoto coefficient at the same position. The
 * two arrays are read together: the entries are the caller's own objects, so hanging the number on
 * a copy of each would allocate the result set twice.
 *
 * The fingerprint has to be built from each idcode, and that is essentially the whole cost: 947 µs
 * per molecule against 0.03 µs for the comparison itself. When the caller already stores
 * fingerprints — as `openchemlib-sqlite` does — comparing those directly is about 30,000 times
 * cheaper than calling this. Use this when idcodes are all you have.
 * @param idCodeQuery - The query, as an idcode.
 * @param entries - The molecules to compare against: idcodes, or objects holding one at
 * `options.jpath`.
 * @param options - Where the idcode sits, the threshold, how many to keep, and progress reporting.
 * @returns The entries at or above the threshold, most similar first, with their coefficients.
 * @throws {Error} If the query cannot be parsed, if more than 100 idcodes cannot be, or if no entry
 * holds a string at the jpath.
 * @example
 * ```js
 * const { matches, similarities } = similaritySearch(query, rows, { threshold: 0.8, limit: 20 });
 * ```
 */
export function similaritySearch<Entry>(
  idCodeQuery: string,
  entries: readonly Entry[],
  options: SimilaritySearchOptions = {},
): SimilaritySearchResult<Entry> {
  const {
    jpath = 'idCode',
    threshold = 0,
    limit = Number.MAX_SAFE_INTEGER,
    collect = true,
    onStep,
    stepSize,
  } = options;

  const idCodes = toIdCodes(entries, jpath);
  const result = new Float32Array(entries.length);
  result.fill(SimilarityResult.unprocessed);
  const tally = { matched: 0, unparsable: 0 };
  const indexes: number[] = [];

  const collectRange = (from: number, to: number): boolean => {
    for (let i = from; i < to; i++) {
      const value = result[i] as number;
      if (value === SimilarityResult.unparsable) {
        tally.unparsable++;
      } else if (value >= threshold) {
        tally.matched++;
        if (collect) indexes.push(i);
      }
    }
    // A better match can always still be coming, so `limit` decides what is kept, never when to
    // stop. Only `onStep` returning false ends a similarity scan early.
    return false;
  };

  const run = runSearch({
    mode: 'similarity',
    idCodeQuery,
    idCodes,
    result,
    tally,
    collectRange,
    stepSize,
    onStep,
    stoppable: false,
  });

  indexes.sort((a, b) => (result[b] as number) - (result[a] as number));
  if (indexes.length > limit) indexes.length = limit;

  const matches = new Array<Entry>(indexes.length);
  const similarities = new Float32Array(indexes.length);
  for (let i = 0; i < indexes.length; i++) {
    const index = indexes[i] as number;
    matches[i] = entries[index] as Entry;
    similarities[i] = result[index] as number;
  }

  return {
    matches,
    similarities,
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
