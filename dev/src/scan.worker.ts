/// <reference lib="webworker" />
import type { ScanBatch } from './engines.ts';
import { createScan } from './engines.ts';
import type { DoneMessage, MainMessage, WorkerMessage } from './protocol.ts';

const worker = self as unknown as DedicatedWorkerGlobalScope;
const decoder = new TextDecoder();

// `TextDecoder.decode` refuses a view backed by a `SharedArrayBuffer`, so each chunk is copied out
// of the shared corpus once — about 40 KB — and every idcode of it is decoded from this scratch.
let scratch = new Uint8Array(0);

let index = 0;
let scan: ScanBatch | null = null;
let bytes: Uint8Array | null = null;
let offsets: Int32Array | null = null;
let result: Uint8Array | Float32Array | null = null;
let cursor: Int32Array | null = null;

worker.addEventListener('message', (event: MessageEvent<MainMessage>) => {
  handle(event.data).catch((error: unknown) => {
    post({
      type: 'failed',
      index,
      message: error instanceof Error ? error.message : String(error),
    });
  });
});

async function handle(message: MainMessage): Promise<void> {
  if (message.type === 'init') {
    index = message.index;
    bytes = new Uint8Array(message.corpus.bytes);
    offsets = new Int32Array(message.corpus.offsets);
    cursor = new Int32Array(message.cursor);
    result =
      message.mode === 'substructure'
        ? new Uint8Array(message.result)
        : new Float32Array(message.result);
    const started = performance.now();
    scan = await createScan(message.engine, message.mode);
    post({ type: 'ready', index, loadMs: performance.now() - started });
    return;
  }
  post(run(message));
}

/**
 * Draws chunks — from the worker's own range, or from the cursor every worker shares — decodes each
 * one and hands it to the engine.
 *
 * Only the chunk about to be scanned is turned into strings: decoding a worker's whole share up
 * front would allocate hundreds of thousands of strings for no gain, and the decode is 0.5% of the
 * scan either way.
 * @param message - The run parameters.
 * @returns What to report back once the work is exhausted.
 */
function run(message: Extract<MainMessage, { type: 'run' }>): DoneMessage {
  const codes = bytes;
  const table = offsets;
  const out = result;
  const shared = cursor;
  const batch = scan;
  if (!codes || !table || !out || !shared || !batch) {
    throw new Error('the worker was asked to scan before it was initialised');
  }

  const { query, from: first, to: last, limit, chunkSize, split } = message;
  const stealing = split === 'stealing';
  const end = stealing ? limit : Math.min(last, limit);
  let next = stealing ? 0 : Math.min(first, limit);
  let decodeMs = 0;
  let scanMs = 0;
  let chunks = 0;
  let processed = 0;
  const started = performance.now();

  for (;;) {
    const from = stealing ? Atomics.add(shared, 0, chunkSize) : next;
    if (from >= end) break;
    const to = Math.min(end, from + chunkSize);
    next = to;

    const decoded = performance.now();
    const base = table[from] ?? 0;
    const span = (table[to] ?? base) - base;
    if (scratch.length < span) scratch = new Uint8Array(span);
    scratch.set(codes.subarray(base, base + span));
    const slice = new Array<string>(to - from);
    for (let i = from; i < to; i++) {
      slice[i - from] = decoder.decode(
        scratch.subarray(
          (table[i] ?? base) - base,
          (table[i + 1] ?? base) - base,
        ),
      );
    }
    const scanned = performance.now();
    // The engines allocate their own buffer, so the chunk is copied into the shared one the main
    // thread renders from. It is a few hundred bytes against milliseconds of scanning.
    out.set(batch(query, slice), from);

    decodeMs += scanned - decoded;
    scanMs += performance.now() - scanned;
    processed += to - from;
    chunks++;
  }

  return {
    type: 'done',
    index,
    decodeMs,
    scanMs,
    totalMs: performance.now() - started,
    chunks,
    processed,
  };
}

function post(message: WorkerMessage): void {
  worker.postMessage(message);
}
