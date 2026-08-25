import type { Mode } from './protocol.ts';

/** Similarity is about 40x the cost of a substructure test, so it opens on a slice. */
const SIMILARITY_DEFAULT = 5000;

const CANDIDATE_SIZES = [1000, 5000, 10_000, 50_000, 100_000, 200_000];

/**
 * How many workers to open with.
 *
 * One fewer than the machine reports, and never more than 8. Workers share the page's renderer
 * process, so opening `hardwareConcurrency` of them leaves no core for the main thread: the progress
 * loop stops running, the page stops answering, and a browser under any other load kills the
 * renderer outright — which reads as "it crashed" and is the reason this is not the obvious number.
 * The cap matters for the same reason on a machine that reports 16 or 32.
 */
export const defaultWorkers = Math.min(
  8,
  Math.max(1, (globalThis.navigator?.hardwareConcurrency ?? 4) - 1),
);

/**
 * The corpus sizes the size selector offers.
 * @param count - How many idcodes the corpus holds.
 * @returns The candidate sizes below it, then the whole corpus.
 */
export function corpusSizes(count: number): number[] {
  const sizes: number[] = [];
  for (const size of CANDIDATE_SIZES) {
    if (size < count) sizes.push(size);
  }
  sizes.push(count);
  return sizes;
}

/**
 * How much of the corpus a mode opens on.
 * @param count - How many idcodes the corpus holds.
 * @param mode - What the scan computes.
 * @returns The whole corpus for a substructure scan, a slice for a similarity one.
 */
export function defaultLimit(count: number, mode: Mode): number {
  return mode === 'similarity' ? Math.min(SIMILARITY_DEFAULT, count) : count;
}
