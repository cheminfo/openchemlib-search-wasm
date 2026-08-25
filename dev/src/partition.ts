import type { Corpus } from './corpus.ts';
import type { Range, Split } from './protocol.ts';

/**
 * Splits the first `limit` idcodes into one range per worker.
 *
 * `characters` is the default because parse cost scales with idcode length, not with row count:
 * over the reference corpus the median idcode is 34 characters, the 99th percentile is 132 and the
 * longest is 595, so equal row counts make the worker holding the long tail finish well after the
 * others. `rows` keeps the naive split available for comparison, and `stealing` needs no static
 * split at all — every worker draws from one shared cursor.
 * @param corpus - The packed corpus, read for its offset table.
 * @param limit - How many idcodes of it to scan.
 * @param workers - How many ranges to produce.
 * @param split - Which strategy to apply.
 * @returns One range per worker, in order, together covering `[0, limit)`.
 */
export function partition(
  corpus: Corpus,
  limit: number,
  workers: number,
  split: Split,
): Range[] {
  if (split === 'stealing') {
    return Array.from({ length: workers }, () => ({ from: 0, to: limit }));
  }
  if (split === 'rows') return byRows(limit, workers);
  return byCharacters(corpus.offsets, limit, workers);
}

/**
 * The ranges the main thread walks to count progress incrementally: one per worker for a static
 * split, and a single range for work stealing, where chunks land almost — but not exactly — in
 * order and one cursor lags at most `workers * chunkSize` entries behind.
 * @param ranges - The worker ranges.
 * @param limit - How many idcodes are being scanned.
 * @param split - Which strategy is in force.
 * @returns The ranges to track.
 */
export function progressRanges(
  ranges: Range[],
  limit: number,
  split: Split,
): Range[] {
  return split === 'stealing' ? [{ from: 0, to: limit }] : ranges;
}

function byRows(limit: number, workers: number): Range[] {
  const ranges: Range[] = [];
  for (let worker = 0; worker < workers; worker++) {
    ranges.push({
      from: Math.min(limit, Math.round((worker * limit) / workers)),
      to: Math.min(limit, Math.round(((worker + 1) * limit) / workers)),
    });
  }
  return ranges;
}

function byCharacters(
  offsets: Int32Array,
  limit: number,
  workers: number,
): Range[] {
  const base = offsets[0] ?? 0;
  const total = (offsets[limit] ?? base) - base;
  const ranges: Range[] = [];
  let from = 0;
  for (let worker = 0; worker < workers; worker++) {
    const target = base + Math.round(((worker + 1) * total) / workers);
    let to = from;
    while (to < limit && (offsets[to] ?? base) < target) to++;
    // Every worker must be handed something, or a `done` never arrives for it.
    if (to <= from && from < limit) to = from + 1;
    ranges.push({ from, to: Math.min(to, limit) });
    from = Math.min(to, limit);
  }
  const last = ranges.at(-1);
  if (last) last.to = limit;
  return ranges;
}
