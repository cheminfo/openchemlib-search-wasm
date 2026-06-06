import type { LoadOptions, OCL } from '../types.ts';

import { wasmGzipBase64 } from './data.ts';
import { resourcesGzipBase64 } from './resources.ts';
import { load } from './runtime.js';

let modulePromise: Promise<OCL> | undefined;
let resourcesRegistered = false;

/**
 * Loads and instantiates the embedded OpenChemLib WasmGC module. The module is
 * compiled once and cached; subsequent calls return the same instance. Decoding
 * uses only Web Platform APIs (atob + DecompressionStream), so it works the same
 * in Node and the browser with no filesystem or fetch.
 *
 * Pass `{ resources: true }` to also register the bundled parameter tables, which
 * the force field, conformer generator and predictors require.
 *
 * @param options load options
 * @returns the OpenChemLib WASM exports
 */
export async function loadOCL(options?: LoadOptions): Promise<OCL> {
  modulePromise ??= instantiate();
  const ocl = await modulePromise;
  if (options?.resources && !resourcesRegistered) {
    await registerEmbeddedResources(ocl);
    resourcesRegistered = true;
  }
  return ocl;
}

async function instantiate(): Promise<OCL> {
  const wasmBytes = await gunzip(base64ToBytes(wasmGzipBase64));
  const teavm = await load(wasmBytes);
  return teavm.exports as unknown as OCL;
}

async function registerEmbeddedResources(ocl: OCL): Promise<void> {
  const json = new TextDecoder().decode(
    await gunzip(base64ToBytes(resourcesGzipBase64)),
  );
  const bundle = JSON.parse(json) as Record<string, string>;
  for (const [path, content] of Object.entries(bundle)) {
    ocl.Resources.register(path, content);
  }
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
