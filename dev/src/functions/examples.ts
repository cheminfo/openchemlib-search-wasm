import type { Corpus } from '../corpus.ts';
import { partition } from '../partition.ts';
import type { Range } from '../protocol.ts';
import { defaultWorkers } from '../settings.ts';

import type { ExamplesMessage, ExamplesReply } from './examplesProtocol.ts';

/** Where a search over the whole corpus stands. */
export interface ExamplesState {
  scanned: number;
  total: number;
  matched: number;
  /** The first matching indices, in corpus order. */
  examples: number[];
  done: boolean;
  error: string | null;
}

interface WorkerShare {
  range: Range;
  scanned: number;
  matched: number;
  examples: number[];
  done: boolean;
}

/**
 * Finds the molecules of the corpus that hold a key, with a few workers sharing the corpus.
 *
 * Only one search runs at a time: starting one drops the previous one, which is what clicking from
 * key to key wants.
 */
export class ExamplesSearcher {
  readonly #corpus: Corpus;
  readonly #workers: Worker[];
  readonly #ranges: Range[];
  #id = 0;
  #shares: WorkerShare[] = [];
  #max = 0;
  #onState: ((state: ExamplesState) => void) | null = null;

  /**
   * Opens the workers and hands each of them the shared corpus.
   * @param corpus - The packed corpus.
   * @param workers - How many workers to open.
   */
  constructor(corpus: Corpus, workers = defaultWorkers) {
    this.#corpus = corpus;
    this.#ranges = partition(corpus, corpus.count, workers, 'characters');
    this.#workers = this.#ranges.map((_, index) => {
      const worker = new Worker(
        new URL('examples.worker.ts', import.meta.url),
        { type: 'module' },
      );
      worker.addEventListener(
        'message',
        (event: MessageEvent<ExamplesReply>) => {
          this.#receive(index, event.data);
        },
      );
      // A worker whose module fails to load never answers: say so instead of scanning forever.
      worker.addEventListener('error', (event: ErrorEvent) => {
        this.#report(
          `an examples worker failed: ${event.message || 'no message'}`,
        );
      });
      send(worker, { type: 'init', corpus: corpus.shared });
      return worker;
    });
  }

  /**
   * Starts a search, dropping the one in progress.
   * @param fragments - The idcodes the key is the OR of.
   * @param max - How many examples to keep.
   * @param onState - Called as the workers report.
   */
  search(
    fragments: string[],
    max: number,
    onState: (state: ExamplesState) => void,
  ): void {
    this.#id++;
    this.#max = max;
    this.#onState = onState;
    this.#shares = this.#ranges.map((range) => ({
      range,
      scanned: 0,
      matched: 0,
      examples: [],
      done: range.from === range.to,
    }));
    for (const [index, worker] of this.#workers.entries()) {
      const range = this.#ranges[index] as Range;
      send(worker, { type: 'search', id: this.#id, fragments, max, ...range });
    }
    this.#report(null);
  }

  /** Stops the search in progress; nothing more is reported for it. */
  cancel(): void {
    this.#id++;
    this.#onState = null;
    for (const worker of this.#workers) {
      send(worker, { type: 'cancel', id: this.#id });
    }
  }

  /** Terminates the workers. */
  dispose(): void {
    this.cancel();
    for (const worker of this.#workers) worker.terminate();
  }

  #receive(index: number, message: ExamplesReply): void {
    if (message.id !== this.#id) return;
    if (message.type === 'failed') {
      this.#report(message.message);
      return;
    }
    const share = this.#shares[index];
    if (!share) return;
    share.scanned = message.scanned;
    share.matched = message.matched;
    share.examples = message.examples;
    share.done = message.done;
    this.#report(null);
  }

  #report(error: string | null): void {
    const examples: number[] = [];
    let scanned = 0;
    let matched = 0;
    let done = true;
    for (const share of this.#shares) {
      scanned += share.scanned;
      matched += share.matched;
      done &&= share.done;
      for (const index of share.examples) examples.push(index);
    }
    examples.sort((a, b) => a - b);
    if (examples.length > this.#max) examples.length = this.#max;
    this.#onState?.({
      scanned,
      total: this.#corpus.count,
      matched,
      examples,
      done,
      error,
    });
  }
}

function send(worker: Worker, message: ExamplesMessage): void {
  worker.postMessage(message);
}
