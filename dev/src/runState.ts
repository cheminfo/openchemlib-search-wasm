import type { Agreement } from './agreement.ts';
import type { Engine, Mode, Split } from './protocol.ts';

/** Similarity at or above which an entry is listed as a hit. */
export const SIMILARITY_HIT_THRESHOLD = 0.8;

/** How many matching indices the hit list keeps. */
export const HIT_LIMIT = 200;

/** What to scan, with what, and how to divide it. */
export interface RunConfig {
  mode: Mode;
  query: string;
  engines: Engine[];
  workers: number;
  chunkSize: number;
  split: Split;
  limit: number;
}

/** One engine's live figures. */
export interface EngineState {
  engine: Engine;
  status: 'waiting' | 'loading' | 'scanning' | 'done' | 'failed';
  processed: number;
  matched: number;
  unparsable: number;
  /** Wall time of the scan itself; the engine load is in `startupMs`. */
  elapsedMs: number;
  startupMs: number;
  /** Slowest worker over fastest: 1.00 is a perfect split. */
  imbalance: number;
  decodeMs: number;
  scanMs: number;
  error: string | null;
}

/** Everything the page renders. */
export interface RunState {
  running: boolean;
  config: RunConfig | null;
  engines: EngineState[];
  /** Indices of the first {@link HIT_LIMIT} matches of the first engine. */
  hits: number[];
  agreement: Agreement | null;
  error: string | null;
}

/**
 * The idle state, and what a fresh run starts from.
 * @returns A state with no engines, no hits and nothing running.
 */
export function emptyRunState(): RunState {
  return {
    running: false,
    config: null,
    engines: [],
    hits: [],
    agreement: null,
    error: null,
  };
}

/**
 * An engine that has not started yet.
 * @param engine - Which implementation it will run.
 * @returns Its initial figures.
 */
export function idleEngine(engine: Engine): EngineState {
  return {
    engine,
    status: 'waiting',
    processed: 0,
    matched: 0,
    unparsable: 0,
    elapsedMs: 0,
    startupMs: 0,
    imbalance: 1,
    decodeMs: 0,
    scanMs: 0,
    error: null,
  };
}
