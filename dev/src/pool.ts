import type {
  DoneMessage,
  Engine,
  InitMessage,
  Mode,
  Range,
  SharedCorpus,
  Split,
  WorkerMessage,
} from './protocol.ts';

/** Everything one engine's pass over the corpus needs. */
export interface PassConfig {
  engine: Engine;
  mode: Mode;
  query: string;
  corpus: SharedCorpus;
  result: SharedArrayBuffer;
  ranges: Range[];
  limit: number;
  chunkSize: number;
  split: Split;
  /** Called once every worker has its engine loaded, which is when the wall clock starts. */
  onScanStart: () => void;
}

/** What one engine's pass cost. */
export interface PassResult {
  /** Spawning the workers and loading the engine in each of them. */
  startupMs: number;
  /** From the last `ready` to the last `done` — the number the throughput is computed from. */
  wallMs: number;
  /** Slowest worker over fastest worker: 1.00 is a perfect split. */
  imbalance: number;
  workers: DoneMessage[];
}

/**
 * Runs one engine over the corpus in `ranges.length` workers and resolves when every one of them
 * has drained its work.
 *
 * The workers are spawned, initialised and only then told to scan, so the engine load — 22 to 48 ms
 * for the WebAssembly module, more for the GWT bundle — is outside the measured wall time and no
 * worker starts early while the others are still compiling.
 * @param config - What to run and where to write it.
 * @param signal - Aborting it terminates every worker immediately.
 * @returns The pass timings.
 */
export async function runPass(
  config: PassConfig,
  signal: AbortSignal,
): Promise<PassResult> {
  const workers = config.ranges.map(
    () =>
      new Worker(new URL('scan.worker.ts', import.meta.url), {
        type: 'module',
      }),
  );
  const cursor = new SharedArrayBuffer(4);
  const terminate = () => {
    for (const worker of workers) worker.terminate();
  };
  signal.addEventListener('abort', terminate, { once: true });

  try {
    const startup = performance.now();
    await Promise.all(
      workers.map(async (worker, index) => {
        const init: InitMessage = {
          type: 'init',
          index,
          engine: config.engine,
          mode: config.mode,
          corpus: config.corpus,
          result: config.result,
          cursor,
        };
        worker.postMessage(init);
        await expect(worker, 'ready', signal);
      }),
    );
    const startupMs = performance.now() - startup;

    config.onScanStart();
    const scanStarted = performance.now();
    const reports = await Promise.all(
      config.ranges.map(async (range, index) => {
        const worker = workers[index];
        if (!worker) throw new Error(`worker ${index} was not spawned`);
        worker.postMessage({
          type: 'run',
          query: config.query,
          from: range.from,
          to: range.to,
          limit: config.limit,
          chunkSize: config.chunkSize,
          split: config.split,
        });
        return expect(worker, 'done', signal);
      }),
    );

    return {
      startupMs,
      wallMs: performance.now() - scanStarted,
      imbalance: imbalanceOf(reports),
      workers: reports,
    };
  } finally {
    signal.removeEventListener('abort', terminate);
    terminate();
  }
}

/**
 * Waits for one message of the expected kind, turning a `failed` report — or an abort — into a
 * rejection so a single bad worker fails the whole pass instead of hanging it.
 * @param worker - The worker to listen to.
 * @param type - The message kind awaited.
 * @param signal - Aborting it rejects the wait.
 * @returns The message.
 */
function expect<T extends WorkerMessage['type']>(
  worker: Worker,
  type: T,
  signal: AbortSignal,
): Promise<Extract<WorkerMessage, { type: T }>> {
  return new Promise((resolve, reject) => {
    const settle = (error: Error) => {
      cleanup();
      reject(error);
    };
    const onMessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.type === 'failed') {
        settle(new Error(message.message));
        return;
      }
      if (message.type !== type) return;
      cleanup();
      resolve(message as Extract<WorkerMessage, { type: T }>);
    };
    const onError = (event: ErrorEvent) => {
      settle(new Error(event.message || 'the worker crashed'));
    };
    const onAbort = () => {
      settle(new DOMException('the scan was cancelled', 'AbortError'));
    };
    const cleanup = () => {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      signal.removeEventListener('abort', onAbort);
    };
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Slowest worker over fastest, ignoring any that drew no work: a worker handed an empty range
 * finishes in microseconds and would report an imbalance that says nothing about the split.
 * @param reports - What every worker reported.
 * @returns The ratio, or 1 when fewer than two workers did anything.
 */
function imbalanceOf(reports: DoneMessage[]): number {
  let slowest = 0;
  let fastest = Number.POSITIVE_INFINITY;
  let counted = 0;
  for (const report of reports) {
    if (report.processed === 0) continue;
    counted++;
    if (report.totalMs > slowest) slowest = report.totalMs;
    if (report.totalMs < fastest) fastest = report.totalMs;
  }
  return counted > 1 && fastest > 0 ? slowest / fastest : 1;
}
