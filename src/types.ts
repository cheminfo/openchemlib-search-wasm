/**
 * The status of one entry of an `ssSearch` result buffer.
 *
 * `unprocessed` is what a `search` that stopped early leaves behind, and what every entry the
 * current step has not reached yet still holds.
 */
export const SubstructureResult = Object.freeze({
  /** Not tested yet. */
  unprocessed: 0,
  /** The query is a substructure of this molecule. */
  match: 1,
  /** The query is not a substructure of this molecule. */
  noMatch: 2,
  /** The idcode could not be parsed; nothing was tested. */
  unparsable: 3,
});

/**
 * The similarity of one entry of a `similaritySearch` result buffer: `NaN` while the entry
 * has not been compared yet, `-1` when its idcode could not be parsed, otherwise the Tanimoto
 * coefficient in [0, 1]. `0` is a legitimate similarity, which is why the "not yet" sentinel is
 * `NaN` and not `0`.
 */
export const SimilarityResult = Object.freeze({
  /** Not compared yet. */
  unprocessed: Number.NaN,
  /** The idcode could not be parsed; nothing was compared. */
  unparsable: -1,
});

/** What a search fills: bytes for a substructure scan, floats for a similarity one. */
export type ResultBuffer = Uint8Array | Float32Array;

/**
 * Which search `search` runs. The names are the ones `openchemlib-utils` and
 * `openchemlib-sqlite` already use for the same two searches.
 */
export type SearchMode = 'substructure' | 'similarity';

/** What landed since the previous step. */
export interface SearchStep {
  /**
   * The buffer being filled, so a caller can render matches while the scan is still running. It is
   * the same buffer at every step, and the one the summary carries.
   */
  result: ResultBuffer;
  /** First index written since the previous step. */
  from: number;
  /** One past the last index written since the previous step. */
  to: number;
  /** How many entries have been written in total. */
  processed: number;
  /** How many entries there are. */
  total: number;
  /**
   * Running count of matches: entries equal to {@link SubstructureResult.match} in `substructure`
   * mode, entries at or above `threshold` in `similarity` mode.
   */
  matched: number;
  /** Milliseconds since the search started. */
  elapsed: number;
}

/** How a search ended. */
export interface SearchSummary<Result extends ResultBuffer = ResultBuffer> {
  /**
   * One entry per idcode: a {@link SubstructureResult} code per byte in `substructure` mode, a
   * Tanimoto coefficient in `similarity` mode. Entries past `processed` are left unprocessed when
   * the search stopped early.
   */
  result: Result;
  /** How many entries were written. Short of `total` when the search stopped early. */
  processed: number;
  /** How many of them matched. */
  matched: number;
  /** How many idcodes could not be parsed. */
  unparsable: number;
  /** How many entries there were. */
  total: number;
  /** How long the search took, in milliseconds. */
  elapsed: number;
  /** True when `onStep` returned false before the end. */
  stopped: boolean;
}

export interface SearchOptions {
  /**
   * Which search to run.
   * @default 'substructure'
   */
  mode?: SearchMode;
  /**
   * Milliseconds of scanning between `onStep` calls. The chunk size adapts to hit it, so the same
   * value works for a substructure scan (~22 µs per molecule) and a similarity one (~947 µs).
   * @default 100
   */
  interval?: number;
  /**
   * Called every `interval` milliseconds with what has landed since the last call, and once more
   * when the scan ends. Return `false` to stop the search.
   */
  onStep?: (step: SearchStep) => boolean | void;
  /** Aborting it rejects the returned promise with an `AbortError`. */
  controller?: AbortController;
  /**
   * In `similarity` mode, the Tanimoto coefficient at or above which an entry counts as a match.
   * Ignored in `substructure` mode.
   * @default 0.8
   */
  threshold?: number;
}

/** The shape TeaVM exports from the WasmGC module. Both take a half-open `[from, to)` range. */
export interface OCLSearch {
  Search: {
    /** Returns how many molecules in the range contain the fragment. */
    ssSearch: (
      idCodeQuery: string,
      idCodes: string[],
      result: Uint8Array,
      from: number,
      to: number,
    ) => number;
    /** Returns how many molecules in the range were parsed and compared. */
    similaritySearch: (
      idCodeQuery: string,
      idCodes: string[],
      result: Float32Array,
      from: number,
      to: number,
    ) => number;
    /** Returns how many molecules in the range were parsed and fingerprinted. */
    getIndexes: (
      idCodes: string[],
      result: Int32Array,
      from: number,
      to: number,
    ) => number;
  };
}

/** How many 32-bit words one molecule's FragFp fingerprint occupies. */
export const INDEX_WORDS = 16;
