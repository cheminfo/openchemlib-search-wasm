import type { OCL } from '../types.ts';

import { wasmGzipBase64 } from './data.ts';
import { load } from './runtime.js';

let modulePromise: Promise<OCL> | undefined;

/**
 * Loads and instantiates the embedded OpenChemLib WasmGC module. The module is
 * compiled once and cached; subsequent calls return the same instance. The
 * parameter tables (force field, predictors, torsion data) are bundled inside
 * the wasm, so the force field, conformer generator and predictors work with no
 * separate registration step. Decoding uses only Web Platform APIs (atob +
 * DecompressionStream), so it works the same in Node and the browser with no
 * filesystem or fetch.
 *
 * @returns the OpenChemLib WASM exports
 */
export function loadOCL(): Promise<OCL> {
  modulePromise ??= instantiate();
  return modulePromise;
}

async function instantiate(): Promise<OCL> {
  const wasmBytes = await gunzip(base64ToBytes(wasmGzipBase64));
  const teavm = await load(wasmBytes);
  return teavm.exports as unknown as OCL;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
