import { wasmGzipBase64 } from '../../wasm/data.js';
import { load } from '../../wasm/runtime.js';
import type { OCLSearch } from '../types.ts';

let modulePromise: Promise<OCLSearch> | undefined;

/**
 * Loads and instantiates the embedded OpenChemLib WasmGC module. The module is compiled once and
 * cached; subsequent calls return the same instance. Decoding uses only Web Platform APIs (atob +
 * DecompressionStream), so Node and the browser take the same path, with no filesystem and no
 * fetch — which is what lets a worker instantiate it from the bundle it was loaded from.
 * @returns The module's exports.
 */
export function loadOCL(): Promise<OCLSearch> {
  modulePromise ??= instantiate();
  return modulePromise;
}

async function instantiate(): Promise<OCLSearch> {
  const wasmBytes = await gunzip(base64ToBytes(wasmGzipBase64));
  const teavm = await load(wasmBytes);
  return teavm.exports as unknown as OCLSearch;
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.codePointAt(i) ?? 0;
  }
  return bytes;
}

async function gunzip(
  bytes: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
