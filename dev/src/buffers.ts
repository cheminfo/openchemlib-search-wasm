import type { Engine, Mode } from './protocol.ts';

/** One engine's two result buffers, both shared with its workers. */
export interface Buffers {
  /** `Uint8Array`, one status byte per molecule. */
  statuses: SharedArrayBuffer;
  /** `Float32Array`, one Tanimoto coefficient per molecule. */
  similarities: SharedArrayBuffer;
}

/**
 * Allocates both result buffers for both engines, once, for the whole corpus.
 *
 * Each engine gets its own so an A/B run ends with two answers to diff; together they are about
 * 4 MB for the reference corpus.
 * @param count - How many molecules the corpus holds.
 * @returns The buffers, keyed by engine.
 */
export function allocateBuffers(count: number): Record<Engine, Buffers> {
  return { wasm: allocate(count), gwt: allocate(count) };
}

/**
 * Returns every entry to its "not processed yet" value.
 * @param buffer - The buffer about to be scanned into.
 * @param mode - What the scan computes.
 */
export function resetBuffer(buffer: SharedArrayBuffer, mode: Mode): void {
  if (mode === 'substructure') new Uint8Array(buffer).fill(0);
  else new Float32Array(buffer).fill(Number.NaN);
}

/**
 * Averages one field over the workers' reports.
 * @param items - The reports.
 * @param read - Which field to average.
 * @returns The mean, or 0 when there are no reports.
 */
export function average<T>(items: T[], read: (item: T) => number): number {
  if (items.length === 0) return 0;
  let total = 0;
  for (const item of items) {
    total += read(item);
  }
  return total / items.length;
}

function allocate(count: number): Buffers {
  return {
    statuses: new SharedArrayBuffer(count),
    similarities: new SharedArrayBuffer(count * 4),
  };
}
