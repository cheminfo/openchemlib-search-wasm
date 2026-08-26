import type { Mode } from './protocol.ts';

/** Similarity is about 40x the cost of a substructure test, so it opens on a slice. */
const SIMILARITY_DEFAULT = 5000;

const CANDIDATE_SIZES = [1000, 5000, 10_000, 50_000, 100_000, 200_000];

/**
 * How many workers to open with: 8, and never more than half the cores the machine reports.
 *
 * Workers share the page's renderer process, so opening `hardwareConcurrency` of them leaves no core
 * for the main thread: the progress loop stops running, the page stops answering, and a browser
 * under any other load kills the renderer outright — which reads as "it crashed" and is the reason
 * this is not the obvious number. Half the cores leaves the other half to the main thread, the
 * compositor and whatever else the browser is doing; the 8 caps it on a machine reporting 32.
 */
export const defaultWorkers = Math.min(
  8,
  Math.max(1, Math.floor((globalThis.navigator?.hardwareConcurrency ?? 4) / 2)),
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
