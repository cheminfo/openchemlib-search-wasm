import { SimilarityResult, SubstructureResult } from '../../src/types.ts';

import type { Range } from './protocol.ts';

/**
 * Counts a scan's progress incrementally.
 *
 * Every range fills in order, so one cursor per range is enough: each call advances a cursor over
 * the entries that landed since the last one and stops at the first entry the workers have not
 * written. Re-tallying all 409,686 entries every frame would work, but it re-reads 16 MB of shared
 * memory sixty times a second to learn what the cursors already know.
 */
export class ScanProgress {
  readonly #cursors: Int32Array;
  readonly #ends: Int32Array;
  readonly #hits: number[] = [];
  readonly #hitLimit: number;
  readonly #threshold: number;
  #processed = 0;
  #matched = 0;
  #unparsable = 0;

  /**
   * Starts one cursor at the beginning of every range.
   * @param ranges - The contiguous ranges the workers fill, each in order.
   * @param hitLimit - How many matching indices to remember.
   * @param threshold - In similarity mode, the coefficient at or above which an entry counts as a
   * hit. Ignored in substructure mode.
   */
  constructor(ranges: Range[], hitLimit: number, threshold: number) {
    this.#cursors = new Int32Array(ranges.length);
    this.#ends = new Int32Array(ranges.length);
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      if (range === undefined) continue;
      this.#cursors[i] = range.from;
      this.#ends[i] = range.to;
    }
    this.#hitLimit = hitLimit;
    this.#threshold = threshold;
  }

  get processed(): number {
    return this.#processed;
  }

  get matched(): number {
    return this.#matched;
  }

  get unparsable(): number {
    return this.#unparsable;
  }

  get hits(): readonly number[] {
    return this.#hits;
  }

  /**
   * Advances over the substructure entries written since the last call.
   * @param result - The shared status buffer.
   */
  advance(result: Uint8Array): void {
    for (let range = 0; range < this.#cursors.length; range++) {
      let cursor = this.#cursors[range] ?? 0;
      const end = this.#ends[range] ?? 0;
      while (cursor < end) {
        const value = result[cursor];
        if (value === undefined || value === SubstructureResult.unprocessed) {
          break;
        }
        this.#processed++;
        if (value === SubstructureResult.match) {
          this.#hit(cursor);
        } else if (value === SubstructureResult.unparsable) {
          this.#unparsable++;
        }
        cursor++;
      }
      this.#cursors[range] = cursor;
    }
  }

  /**
   * Advances over the similarity entries written since the last call.
   * @param result - The shared coefficient buffer.
   */
  advanceSimilarity(result: Float32Array): void {
    for (let range = 0; range < this.#cursors.length; range++) {
      let cursor = this.#cursors[range] ?? 0;
      const end = this.#ends[range] ?? 0;
      while (cursor < end) {
        const value = result[cursor];
        if (value === undefined || Number.isNaN(value)) break;
        this.#processed++;
        if (value === SimilarityResult.unparsable) {
          this.#unparsable++;
        } else if (value >= this.#threshold) {
          this.#hit(cursor);
        }
        cursor++;
      }
      this.#cursors[range] = cursor;
    }
  }

  #hit(index: number): void {
    this.#matched++;
    if (this.#hits.length < this.#hitLimit) this.#hits.push(index);
  }
}
