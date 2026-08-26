import { scanRange } from './scan.ts';
import type {
  ResultBuffer,
  SearchMode,
  SearchOptions,
  SearchStep,
  SearchSummary,
} from './types.ts';
import { SimilarityResult, SubstructureResult } from './types.ts';

/**
 * Where the adaptive chunk starts, before the first measurement re-sizes it. Small on purpose: the
 * first chunk is the floor on how little work a search that stops immediately can do, and an extra
 * call or two costs nothing — 800 chunked calls measure the same as one call over the whole corpus.
 */
const FIRST_CHUNK = { substructure: 256, similarity: 8 };

/** A chunk may at most double per step, so the size climbs to its working value over a few steps. */
const MAX_CHUNK_GROWTH = 2;

/**
 * Aim a little under `interval`. Molecules vary a lot in size — the corpus runs from 4 to 595
 * characters — so a chunk sized to land exactly on the target overshoots it about half the time.
 */
const INTERVAL_TARGET = 0.8;

/**
 * How fast the cost estimate is allowed to fall. It rises instantly, so a chunk that runs into
 * bigger molecules shrinks the next one at once, and only drifts back up as cheap chunks confirm the
 * region really is cheap. An estimate that tracked the mean instead would keep over-growing on the
 * light end of the corpus and then block the thread for half a second on the heavy end.
 */
const COST_DECAY = 0.8;

const DEFAULT_THRESHOLD = 0.8;

/**
 * Searches an array of idcodes, yielding to the event loop as it goes and reporting what has landed.
 *
 * The scan is cut into chunks sized to take about `interval` milliseconds each, so the caller's
 * `onStep` runs at a steady rate whatever the mode costs per molecule, and the thread stays
 * responsive: a whole-corpus scan can run on a browser's main thread without freezing the page.
 * Slicing it this way is free — 800 chunked calls measure the same as one call over the whole
 * corpus.
 *
 * Returning `false` from `onStep` stops the search, which is what makes a common query cheap: with
 * a 62% hit rate, stopping at the first 100 matches reads 768 molecules instead of 409,686 and
 * takes 7 ms instead of 9.2 s.
 * The buffer is on every `onStep` call as well as on the summary, so a caller can render matches
 * while the scan is still running rather than waiting for the promise.
 * @param idCodeQuery - The query, as an idcode.
 * @param idCodes - The molecules to search.
 * @param options - Mode, reporting interval, `onStep` callback, abort controller and threshold.
 * @returns How the search ended, and the buffer it filled.
 * @throws {DOMException} `AbortError`, if `options.controller` was aborted.
 */
export async function search(
  idCodeQuery: string,
  idCodes: string[],
  options: SearchOptions & { mode: 'similarity' },
): Promise<SearchSummary<Float32Array>>;
export async function search(
  idCodeQuery: string,
  idCodes: string[],
  options?: SearchOptions & { mode?: 'substructure' },
): Promise<SearchSummary<Uint8Array>>;
export async function search(
  idCodeQuery: string,
  idCodes: string[],
  options?: SearchOptions,
): Promise<SearchSummary>;
export async function search(
  idCodeQuery: string,
  idCodes: string[],
  options: SearchOptions = {},
): Promise<SearchSummary> {
  const {
    mode = 'substructure',
    interval = 100,
    onStep,
    controller,
    threshold = DEFAULT_THRESHOLD,
  } = options;

  const total = idCodes.length;
  const result = newResult(mode, total);

  const started = performance.now();
  let chunk = FIRST_CHUNK[mode];
  let cost = 0;
  let processed = 0;
  let matched = 0;
  let unparsable = 0;
  let stopped = false;

  while (processed < total) {
    throwIfAborted(controller);
    const to = Math.min(processed + chunk, total);
    const before = performance.now();
    scanRange(mode, idCodeQuery, idCodes, result, processed, to);
    const spent = performance.now() - before;

    const counts = count(mode, result, processed, to, threshold);
    matched += counts.matched;
    unparsable += counts.unparsable;
    const step: SearchStep = {
      result,
      from: processed,
      to,
      processed: to,
      total,
      matched,
      elapsed: performance.now() - started,
    };
    const scanned = to - processed;
    processed = to;
    cost = Math.max(spent / scanned, cost * COST_DECAY);
    chunk = nextChunk(chunk, cost, interval);

    if (onStep?.(step) === false) {
      stopped = true;
      break;
    }
    if (processed < total) {
      // eslint-disable-next-line no-await-in-loop -- the point is to yield between chunks
      await yieldToEventLoop();
    }
  }

  throwIfAborted(controller);
  return {
    result,
    processed,
    matched,
    unparsable,
    total,
    elapsed: performance.now() - started,
    stopped,
  };
}

/**
 * Sizes the next chunk from the cost of a molecule, so it should take about `interval` milliseconds.
 * @param chunk - The chunk just scanned.
 * @param cost - The pessimistic estimate of one molecule's cost, in milliseconds.
 * @param interval - How long a chunk should take.
 * @returns The next chunk size, at least 1.
 */
function nextChunk(chunk: number, cost: number, interval: number): number {
  if (!Number.isFinite(interval)) return Number.MAX_SAFE_INTEGER;
  // A chunk too fast to measure would divide by zero; a floor of a nanosecond per molecule just
  // means "grow by the maximum", which the cap below applies anyway.
  const wanted = (interval * INTERVAL_TARGET) / Math.max(cost, 1e-6);
  return Math.max(1, Math.round(Math.min(wanted, chunk * MAX_CHUNK_GROWTH)));
}

function count(
  mode: 'substructure' | 'similarity',
  result: ResultBuffer,
  from: number,
  to: number,
  threshold: number,
): { matched: number; unparsable: number } {
  let matched = 0;
  let unparsable = 0;
  for (let i = from; i < to; i++) {
    const value = result[i] as number;
    if (mode === 'similarity') {
      if (value === SimilarityResult.unparsable) unparsable++;
      else if (value >= threshold) matched++;
    } else if (value === SubstructureResult.match) {
      matched++;
    } else if (value === SubstructureResult.unparsable) {
      unparsable++;
    }
  }
  return { matched, unparsable };
}

/**
 * Allocates the buffer the mode writes into, reset to its "not yet" value.
 * @param mode - Which search will fill it.
 * @param total - How many idcodes there are.
 * @returns The buffer.
 */
function newResult(mode: SearchMode, total: number): ResultBuffer {
  // A fresh Uint8Array is already all zeros, which is `unprocessed`.
  if (mode !== 'similarity') return new Uint8Array(total);
  const result = new Float32Array(total);
  result.fill(SimilarityResult.unprocessed);
  return result;
}

function throwIfAborted(controller: AbortController | undefined): void {
  if (controller?.signal.aborted) {
    throw new DOMException('the search was aborted', 'AbortError');
  }
}

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof setImmediate === 'function') setImmediate(() => resolve());
    else setTimeout(() => resolve(), 0);
  });
}
