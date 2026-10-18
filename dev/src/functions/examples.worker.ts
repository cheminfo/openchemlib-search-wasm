/// <reference lib="webworker" />
import type {
  ExamplesMessage,
  ExamplesReply,
  ExamplesSearch,
} from './examplesProtocol.ts';

import type * as Lib from '#lib';

type Library = typeof Lib;

const worker = self as unknown as DedicatedWorkerGlobalScope;
// Imported dynamically, after the listener below exists: the module instantiates the WebAssembly
// at import time, and a message reaching the worker before its listener does is lost.
const library: Promise<Library> = import('#lib');
const decoder = new TextDecoder();
const CHUNK = 2048;

let bytes: Uint8Array | null = null;
let offsets: Int32Array | null = null;
let current = 0;

worker.addEventListener('message', (event: MessageEvent<ExamplesMessage>) => {
  const message = event.data;
  if (message.type === 'init') {
    bytes = new Uint8Array(message.corpus.bytes);
    offsets = new Int32Array(message.corpus.offsets);
    return;
  }
  current = message.id;
  if (message.type !== 'search') return;
  library.then(
    (loaded) => {
      scan(loaded, message, message.from, { matched: 0, examples: [] });
    },
    (error: unknown) => {
      post({ type: 'failed', id: message.id, message: String(error) });
    },
  );
});

/**
 * Scans one chunk of the range, testing each fragment only on the molecules no earlier fragment
 * matched, then schedules the next chunk, so a newer search can take over in between.
 * @param loaded - The search library.
 * @param request - The fragments and the range.
 * @param start - The first molecule of the chunk.
 * @param found - What earlier chunks found.
 * @param found.matched - How many molecules matched so far.
 * @param found.examples - The first matching indices, at most `request.max` of them.
 */
function scan(
  loaded: Library,
  request: ExamplesSearch,
  start: number,
  found: { matched: number; examples: number[] },
): void {
  const { id, fragments, from, to, max } = request;
  if (current !== id) return;
  const end = Math.min(to, start + CHUNK);
  let hits: number[];
  try {
    hits = matchChunk(loaded, fragments, start, end);
  } catch (error) {
    post({
      type: 'failed',
      id,
      message: error instanceof Error ? error.message : String(error),
    });
    return;
  }
  found.matched += hits.length;
  for (const index of hits) {
    if (found.examples.length >= max) break;
    found.examples.push(index);
  }
  post({
    type: 'progress',
    id,
    scanned: end - from,
    matched: found.matched,
    examples: found.examples,
    done: end === to,
  });
  if (end < to) {
    setTimeout(() => {
      scan(loaded, request, end, found);
    }, 0);
  }
}

function matchChunk(
  loaded: Library,
  fragments: string[],
  start: number,
  end: number,
): number[] {
  const { SubstructureResult, substructureSearch } = loaded;
  const idCodes = decodeRange(start, end);
  let pending: number[] = [];
  for (let i = 0; i < idCodes.length; i++) pending.push(i);
  const hits: number[] = [];
  for (const fragment of fragments) {
    if (pending.length === 0) break;
    const candidates: string[] = [];
    for (const index of pending) candidates.push(idCodes[index] ?? '');
    const { result } = substructureSearch(fragment, candidates, {
      collect: false,
    });
    const rest: number[] = [];
    for (let k = 0; k < pending.length; k++) {
      const index = pending[k] ?? 0;
      if (result[k] === SubstructureResult.match) hits.push(start + index);
      else rest.push(index);
    }
    pending = rest;
  }
  return hits.toSorted((a, b) => a - b);
}

function decodeRange(from: number, to: number): string[] {
  const codes = bytes;
  const table = offsets;
  if (codes === null || table === null) throw new Error('no corpus yet');
  const first = table[from] ?? 0;
  // `TextDecoder.decode` refuses a view over a `SharedArrayBuffer`, so the chunk is copied once.
  const copy = codes.slice(first, table[to] ?? first);
  const idCodes: string[] = [];
  for (let i = from; i < to; i++) {
    const start = (table[i] ?? first) - first;
    const end = (table[i + 1] ?? first) - first;
    idCodes.push(decoder.decode(copy.subarray(start, end)));
  }
  return idCodes;
}

function post(message: ExamplesReply): void {
  worker.postMessage(message);
}
