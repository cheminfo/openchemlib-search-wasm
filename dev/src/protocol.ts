/** Which implementation runs a scan. */
export type Engine = 'wasm' | 'gwt';

/** What a scan computes for every molecule. */
export type Mode = 'substructure' | 'similarity';

/**
 * How the corpus is handed out.
 *
 * `characters` splits it into one contiguous range per worker holding the same number of idcode
 * characters, because parse cost scales with idcode length and the length distribution is skewed
 * (median 34, p99 132, max 595) — an equal number of *rows* leaves the unlucky worker running long
 * after the others are idle. `rows` keeps that naive split selectable, so the imbalance can be
 * reproduced on demand. `stealing` gives every worker the same shared cursor.
 */
export type Split = 'characters' | 'rows' | 'stealing';

/** A contiguous half-open range of corpus indices. */
export interface Range {
  from: number;
  to: number;
}

/** The corpus as the workers see it: packed ASCII plus an offset table, both shared. */
export interface SharedCorpus {
  /** Every idcode, concatenated, no separators. */
  bytes: SharedArrayBuffer;
  /** `Int32Array` of `count + 1` entries: idcode `i` is `bytes[offsets[i] .. offsets[i + 1]]`. */
  offsets: SharedArrayBuffer;
  count: number;
}

/** Main to worker, once: everything that does not change between scans. */
export interface InitMessage {
  type: 'init';
  index: number;
  engine: Engine;
  mode: Mode;
  corpus: SharedCorpus;
  /** `Uint8Array` for a substructure scan, `Float32Array` for a similarity one. */
  result: SharedArrayBuffer;
  /** `Int32Array(1)`, the work cursor shared by every worker in `stealing` mode. */
  cursor: SharedArrayBuffer;
}

/** Main to worker: scan, now. Sent only once every worker has answered `ready`. */
export interface RunMessage {
  type: 'run';
  query: string;
  /** The worker's own range; ignored in `stealing` mode. */
  from: number;
  to: number;
  /** The corpus prefix being scanned, which bounds the shared cursor. */
  limit: number;
  chunkSize: number;
  split: Split;
}

export type MainMessage = InitMessage | RunMessage;

/** Worker to main: the engine is loaded and the wall clock can start. */
export interface ReadyMessage {
  type: 'ready';
  index: number;
  loadMs: number;
}

/** Worker to main: its range, or the shared cursor, is exhausted. */
export interface DoneMessage {
  type: 'done';
  index: number;
  decodeMs: number;
  scanMs: number;
  totalMs: number;
  chunks: number;
  processed: number;
}

/** Worker to main: the scan threw. The message is shown as-is. */
export interface FailedMessage {
  type: 'failed';
  index: number;
  message: string;
}

export type WorkerMessage = ReadyMessage | DoneMessage | FailedMessage;
