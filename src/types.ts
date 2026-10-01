/**
 * The status of one entry of a `substructureSearch` result buffer.
 *
 * `unprocessed` is what a scan that stopped on `limit` or on `onStep` leaves behind.
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
 * Which search to run. The names are the ones `openchemlib-utils` and `openchemlib-sqlite` already
 * use for the same two searches.
 */
export type SearchMode = 'substructure' | 'similarity';

/** What a search has done so far, reported to `onStep`. */
export interface SearchStep {
  /**
   * The buffer being filled, so a caller can render as the scan runs. It is the same buffer at
   * every step, and the one the result carries.
   */
  result: ResultBuffer;
  /** How many entries have been scanned. */
  processed: number;
  /** How many entries there are. */
  total: number;
  /** How many of the scanned entries matched. */
  matched: number;
  /** How many of them could not be parsed. */
  unparsable: number;
  /** Milliseconds since the search started. */
  elapsed: number;
}

/** What both searches take. */
export interface SearchOptions {
  /**
   * Where the idcode sits in an entry, as a dot-separated jpath: `idCode`, `molecule.idCode`,
   * `spectra.0.idCode`. Ignored when the entries are idcodes rather than objects.
   * @default 'idCode'
   */
  jpath?: string;
  /**
   * Called after each step with what has been scanned so far. Return `false` to stop the search.
   *
   * It is synchronous and the scan does not yield: chunking for a responsive main thread is the
   * caller's to do, by slicing the array across calls or running this in a worker.
   */
  onStep?: (step: SearchStep) => boolean | void;
  /**
   * How many entries one step covers. Only meaningful alongside `onStep` or `limit`; without
   * either, the whole array is scanned in a single call.
   * @default 4096 for a substructure search, 128 for a similarity one — both about 100 ms
   */
  stepSize?: number;
  /**
   * Whether to collect `matches` and `indexes`. Turn it off to fill `result` alone, which is what a
   * worker writing into a shared buffer wants: on a corpus that matches often, collecting allocates
   * one array slot per hit for nothing.
   * @default true
   */
  collect?: boolean;
}

export interface SubstructureSearchOptions extends SearchOptions {
  /**
   * Stop once this many matches have been found. The scan stops at the end of the step that reached
   * it, so `matches` can overshoot by less than one step before being cut back to `limit`.
   * @default Number.MAX_SAFE_INTEGER
   */
  limit?: number;
}

export interface SimilaritySearchOptions extends SearchOptions {
  /**
   * The Tanimoto coefficient at or above which an entry counts as a match.
   * @default 0
   */
  threshold?: number;
  /**
   * Keep only the `limit` most similar entries. Unlike a substructure search this cannot stop the
   * scan early — a better match may still be coming — so it only decides how many are kept.
   * @default Number.MAX_SAFE_INTEGER
   */
  limit?: number;
}

/** What every search returns, whatever it computed. */
export interface SearchResult<Entry> {
  /**
   * The entries that matched, in the order the search defines: input order for a substructure
   * search, most similar first for a similarity one.
   */
  matches: Entry[];
  /**
   * Their positions in the input, aligned with `matches`. Cheaper than the entries to post back
   * from a worker, whose caller already holds them.
   */
  indexes: number[];
  /**
   * How many of the scanned entries matched. Larger than `matches.length` when `limit` cut the
   * list back, and the only count there is when `collect` is off.
   */
  matched: number;
  /** How many idcodes could not be parsed. */
  unparsable: number;
  /** How many entries were scanned. Short of `total` when the search stopped early. */
  processed: number;
  /** How many entries there were. */
  total: number;
  /** How long the search took, in milliseconds. */
  elapsed: number;
  /** True when `limit` or `onStep` stopped the scan before the end. */
  stopped: boolean;
}

/**
 * `matches` and `indexes` are in **input order**, and `limit` therefore keeps the first matches
 * rather than an arbitrary subset. A caller that has ordered its entries by a preference — cheapest
 * first, lightest first — gets that preference back, which is what makes `limit` a first page
 * rather than a sample.
 */
export interface SubstructureSearchResult<Entry> extends SearchResult<Entry> {
  /**
   * One {@link SubstructureResult} code per entry, in input order. Entries past `processed` are
   * left `unprocessed` when the search stopped early.
   */
  result: Uint8Array;
}

/** `matches` is ordered by descending similarity, so `limit` keeps the best. */
export interface SimilaritySearchResult<Entry> extends SearchResult<Entry> {
  /**
   * The Tanimoto coefficient of each entry of `matches`, in the same order — so the two arrays are
   * read together. It is a separate array rather than a field on the entry because the entries are
   * the caller's own objects: copying each one just to hang a number on it would allocate the whole
   * result set a second time.
   */
  similarities: Float32Array;
  /** One coefficient per entry, in input order, with the {@link SimilarityResult} sentinels. */
  result: Float32Array;
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
    /** Returns how many molecules in the range were hashed. */
    getNoStereoTautomerHashes: (
      idCodes: string[],
      result: BigInt64Array,
      tautomerCounts: Int32Array,
      largestFragmentOnly: boolean,
      maxTautomers: number,
      from: number,
      to: number,
    ) => number;
    /** Returns how many molecules in the range were hashed. */
    getNoStereoHashes: (
      idCodes: string[],
      result: BigInt64Array,
      largestFragmentOnly: boolean,
      from: number,
      to: number,
    ) => number;
    /** Returns how many molecules in the range were canonized. */
    getNoStereoIdCodes: (
      idCodes: string[],
      result: string[],
      largestFragmentOnly: boolean,
      from: number,
      to: number,
    ) => number;
    /** Returns how many molecules in the range were canonized. */
    getNoStereoTautomerIdCodes: (
      idCodes: string[],
      result: string[],
      tautomerCounts: Int32Array,
      largestFragmentOnly: boolean,
      maxTautomers: number,
      from: number,
      to: number,
    ) => number;
  };
}

/** How many 32-bit words one molecule's FragFp fingerprint occupies. */
export const INDEX_WORDS = 16;

/** What every hash function takes. */
export interface HashOptions {
  /**
   * Whether to reduce the molecule to its largest fragment and neutralize it before hashing, so a
   * salt hashes as its parent structure and a hydrochloride as its free base. Off by default, which
   * is what `openchemlib`'s own `CanonizerUtil.getIDCode` does.
   * @default false
   */
  largestFragmentOnly?: boolean;

  /**
   * The ceiling on how many tautomers OpenChemLib enumerates before it settles for what it has.
   * Only the tautomer functions read it.
   *
   * The cost of a tautomer key is set by this, not by the molecule's size: the median molecule needs
   * a hundred microseconds and one in a hundred runs into the ceiling and spends the better part of
   * a second getting there. Lowering it bounds that tail, at the price of a key that may not be
   * canonical for the molecules that hit it — compare `tautomerCounts` against this value to find
   * them.
   * @default 100000 — OpenChemLib's own
   */
  maxTautomers?: number;

  /**
   * Filled with how many tautomers were enumerated for each molecule, if given. An entry that
   * reached {@link HashOptions.maxTautomers} is one OpenChemLib stopped early on, which is the only
   * signal that a key may not be canonical.
   *
   * It is the caller's buffer, `idCodes.length` entries long, so a table of flags costs one
   * allocation. Only the tautomer functions write it.
   */
  tautomerCounts?: Int32Array;
}

/** {@link HashOptions} under the name the tautomer hashes introduced it with. */
export type TautomerHashOptions = HashOptions;

/**
 * The hash of a molecule that has none: its idcode could not be parsed, or OpenChemLib could not
 * canonize it. A real hash collides with it once in 2^64, so an equality test against it is a
 * usable "no hash" check.
 */
export const NO_HASH = 0n;

/**
 * The canonical idcode of a molecule that has none: its idcode could not be parsed, or OpenChemLib
 * could not canonize it. The empty string is never a valid idcode, so an equality test against it is
 * the idcode counterpart of {@link NO_HASH}.
 */
export const NO_ID_CODE = '';

/**
 * How many tautomers OpenChemLib enumerates before it settles for what it has, unless
 * {@link HashOptions.maxTautomers} says otherwise. It is OpenChemLib's own ceiling.
 */
export const DEFAULT_MAX_TAUTOMERS = 100_000;
