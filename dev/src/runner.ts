import { compareSimilarities, compareStatuses } from './agreement.ts';
import type { Buffers } from './buffers.ts';
import { allocateBuffers, average, resetBuffer } from './buffers.ts';
import type { Corpus } from './corpus.ts';
import { partition, progressRanges } from './partition.ts';
import { runPass } from './pool.ts';
import { ScanProgress } from './progress.ts';
import type { Engine, Mode } from './protocol.ts';
import type { EngineState, RunConfig, RunState } from './runState.ts';
import {
  HIT_LIMIT,
  SIMILARITY_HIT_THRESHOLD,
  emptyRunState,
  idleEngine,
} from './runState.ts';

/** Two coefficients further apart than this are a real disagreement, not rounding. */
const SIMILARITY_TOLERANCE = 1e-6;

interface ActivePass {
  index: number;
  progress: ScanProgress;
  startedAt: number;
}

/**
 * Drives a run: one pass per engine, sequentially, while polling the shared result buffers on every
 * animation frame.
 *
 * The passes never overlap. Two engines running at once would contend for the same cores and both
 * timings would be wrong, which is the one thing an A/B measurement must not do.
 */
export class ScanRunner {
  readonly #corpus: Corpus;
  readonly #onState: (state: RunState) => void;
  readonly #buffers: Record<Engine, Buffers>;
  #state = emptyRunState();
  #abort: AbortController | null = null;
  #frame = 0;
  #active: ActivePass | null = null;

  /**
   * Allocates both engines' result buffers for the whole corpus, once.
   * @param corpus - The packed corpus every pass scans.
   * @param onState - Called with a fresh state object whenever anything changes.
   */
  constructor(corpus: Corpus, onState: (state: RunState) => void) {
    this.#corpus = corpus;
    this.#onState = onState;
    this.#buffers = allocateBuffers(corpus.count);
  }

  /** Terminates every worker of the current run. */
  cancel(): void {
    this.#abort?.abort();
  }

  /**
   * Runs the configured engines over the corpus, one after the other.
   * @param config - What to scan and how to divide it.
   */
  async run(config: RunConfig): Promise<void> {
    this.cancel();
    const abort = new AbortController();
    this.#abort = abort;
    this.#state = {
      ...emptyRunState(),
      running: true,
      config,
      engines: config.engines.map(idleEngine),
    };
    this.#publish();
    this.#poll();

    try {
      // The passes must not overlap: two engines sharing the cores would make both timings
      // meaningless, which is the one thing an A/B measurement cannot do.
      for (let index = 0; index < config.engines.length; index++) {
        // eslint-disable-next-line no-await-in-loop -- see above
        await this.#pass(index, config, abort.signal);
      }
      this.#compare(config);
    } catch (error) {
      if (!abort.signal.aborted) {
        this.#state = { ...this.#state, error: describe(error) };
      }
    } finally {
      cancelAnimationFrame(this.#frame);
      this.#active = null;
      this.#state = { ...this.#state, running: false };
      this.#publish();
    }
  }

  async #pass(
    index: number,
    config: RunConfig,
    signal: AbortSignal,
  ): Promise<void> {
    const engine = config.engines[index];
    if (engine === undefined) return;
    const buffer = this.#resultBuffer(engine, config.mode);
    resetBuffer(buffer, config.mode);

    const ranges = partition(
      this.#corpus,
      config.limit,
      config.workers,
      config.split,
    );
    const progress = new ScanProgress(
      progressRanges(ranges, config.limit, config.split),
      HIT_LIMIT,
      SIMILARITY_HIT_THRESHOLD,
    );
    this.#patch(index, { status: 'loading' });

    try {
      const result = await runPass(
        {
          engine,
          mode: config.mode,
          query: config.query,
          corpus: this.#corpus.shared,
          result: buffer,
          ranges,
          limit: config.limit,
          chunkSize: config.chunkSize,
          split: config.split,
          onScanStart: () => {
            this.#active = { index, progress, startedAt: performance.now() };
            this.#patch(index, { status: 'scanning' });
          },
        },
        signal,
      );
      this.#active = null;
      this.#patch(index, {
        ...this.#tally(index, progress, config.mode),
        status: 'done',
        startupMs: result.startupMs,
        elapsedMs: result.wallMs,
        imbalance: result.imbalance,
        decodeMs: average(result.workers, (report) => report.decodeMs),
        scanMs: average(result.workers, (report) => report.scanMs),
      });
    } catch (error) {
      this.#active = null;
      if (!signal.aborted) {
        this.#patch(index, { status: 'failed', error: describe(error) });
      }
      throw error;
    }
  }

  #compare(config: RunConfig): void {
    if (config.engines.length < 2) return;
    const agreement =
      config.mode === 'substructure'
        ? compareStatuses(
            new Uint8Array(this.#buffers.wasm.statuses),
            new Uint8Array(this.#buffers.gwt.statuses),
            config.limit,
          )
        : compareSimilarities(
            new Float32Array(this.#buffers.wasm.similarities),
            new Float32Array(this.#buffers.gwt.similarities),
            config.limit,
            SIMILARITY_TOLERANCE,
          );
    this.#state = { ...this.#state, agreement };
  }

  #poll = (): void => {
    const active = this.#active;
    if (active) {
      const mode = this.#state.config?.mode ?? 'substructure';
      this.#patch(active.index, {
        ...this.#tally(active.index, active.progress, mode),
        elapsedMs: performance.now() - active.startedAt,
      });
    }
    this.#frame = requestAnimationFrame(this.#poll);
  };

  /**
   * Walks the entries that landed since the last frame and, for the first engine, republishes the
   * hit list.
   * @param index - Which engine is being tallied.
   * @param progress - Its cursor set.
   * @param mode - What the scan computes.
   * @returns The counters to patch into that engine's state.
   */
  #tally(
    index: number,
    progress: ScanProgress,
    mode: Mode,
  ): Partial<EngineState> {
    const engine = this.#state.engines[index]?.engine ?? 'wasm';
    const buffer = this.#resultBuffer(engine, mode);
    if (mode === 'substructure') progress.advance(new Uint8Array(buffer));
    else progress.advanceSimilarity(new Float32Array(buffer));
    if (index === 0 && progress.hits.length !== this.#state.hits.length) {
      this.#state = { ...this.#state, hits: [...progress.hits] };
    }
    return {
      processed: progress.processed,
      matched: progress.matched,
      unparsable: progress.unparsable,
    };
  }

  #resultBuffer(engine: Engine, mode: Mode): SharedArrayBuffer {
    const buffers = this.#buffers[engine];
    return mode === 'substructure' ? buffers.statuses : buffers.similarities;
  }

  #patch(index: number, patch: Partial<EngineState>): void {
    const engines = this.#state.engines.map((engine, at) =>
      at === index ? { ...engine, ...patch } : engine,
    );
    this.#state = { ...this.#state, engines };
    this.#publish();
  }

  #publish(): void {
    this.#onState(this.#state);
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
