import { SimilarityResult } from '../../src/types.ts';

/** One entry the two engines disagreed on. */
export interface Disagreement {
  index: number;
  wasm: number;
  gwt: number;
}

/** Whether the two engines computed the same answer for every molecule. */
export interface Agreement {
  compared: number;
  disagreements: number;
  /** The first few, for the display. */
  samples: Disagreement[];
  /** The largest absolute difference, which is 0 for a substructure scan that agrees. */
  maxDelta: number;
}

const SAMPLE_LIMIT = 10;

/**
 * Diffs two substructure result buffers.
 *
 * A speed number from an engine that computes a different answer is worthless, so this runs before
 * any ratio is shown.
 * @param wasm - The WebAssembly engine's statuses.
 * @param gwt - The `openchemlib-js` engine's statuses.
 * @param limit - How many entries were scanned.
 * @returns Whether they agree, and the first few entries where they do not.
 */
export function compareStatuses(
  wasm: Uint8Array,
  gwt: Uint8Array,
  limit: number,
): Agreement {
  const samples: Disagreement[] = [];
  let disagreements = 0;
  for (let index = 0; index < limit; index++) {
    const left = wasm[index] ?? 0;
    const right = gwt[index] ?? 0;
    if (left === right) continue;
    disagreements++;
    if (samples.length < SAMPLE_LIMIT) {
      samples.push({ index, wasm: left, gwt: right });
    }
  }
  return { compared: limit, disagreements, samples, maxDelta: 0 };
}

/**
 * Diffs two similarity result buffers.
 *
 * The two engines build the same 512-bit FragFp from the same idcode, so the coefficients are
 * expected to be identical; anything past `tolerance` is a real disagreement, not rounding.
 * @param wasm - The WebAssembly engine's coefficients.
 * @param gwt - The `openchemlib-js` engine's coefficients.
 * @param limit - How many entries were scanned.
 * @param tolerance - The difference below which two coefficients count as equal.
 * @returns Whether they agree, the largest difference, and the first few entries past `tolerance`.
 */
export function compareSimilarities(
  wasm: Float32Array,
  gwt: Float32Array,
  limit: number,
  tolerance: number,
): Agreement {
  const samples: Disagreement[] = [];
  let disagreements = 0;
  let maxDelta = 0;
  for (let index = 0; index < limit; index++) {
    const left = wasm[index] ?? SimilarityResult.unparsable;
    const right = gwt[index] ?? SimilarityResult.unparsable;
    const delta = Math.abs(left - right);
    if (delta > maxDelta) maxDelta = delta;
    if (delta <= tolerance) continue;
    disagreements++;
    if (samples.length < SAMPLE_LIMIT) {
      samples.push({ index, wasm: left, gwt: right });
    }
  }
  return { compared: limit, disagreements, samples, maxDelta };
}
