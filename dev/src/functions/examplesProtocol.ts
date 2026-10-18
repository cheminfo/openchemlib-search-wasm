import type { SharedCorpus } from '../protocol.ts';

/** Main to worker, once: the corpus every search reads. */
export interface ExamplesInit {
  type: 'init';
  corpus: SharedCorpus;
}

/** Main to worker: find the molecules holding any of the fragments in `[from, to)`. */
export interface ExamplesSearch {
  type: 'search';
  /** Increases with every search; a worker drops a search once a newer one arrives. */
  id: number;
  fragments: string[];
  from: number;
  to: number;
  /** How many matching indices to send back; every match is still counted. */
  max: number;
}

/** Main to worker: stop the search in progress. */
export interface ExamplesCancel {
  type: 'cancel';
  id: number;
}

export type ExamplesMessage = ExamplesInit | ExamplesSearch | ExamplesCancel;

/** Worker to main, after every chunk. */
export interface ExamplesProgress {
  type: 'progress';
  id: number;
  /** Molecules of the worker's range scanned so far. */
  scanned: number;
  matched: number;
  /** The first `max` matching indices of the range, in corpus order. */
  examples: number[];
  done: boolean;
}

/** Worker to main: the search threw. */
export interface ExamplesFailed {
  type: 'failed';
  id: number;
  message: string;
}

export type ExamplesReply = ExamplesProgress | ExamplesFailed;
