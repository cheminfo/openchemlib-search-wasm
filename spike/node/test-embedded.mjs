// Prove the isomorphic distribution path: decode the embedded gzip+base64 wasm
// using only Web Platform APIs (atob + DecompressionStream) that exist in both
// Node 18+ and browsers, then load and call it. No fs, no fetch, no Buffer.
import { load } from '../target/wasm-gc/spike.wasm-runtime.js';

import { wasmGzipBase64 } from './wasm-data.mjs';

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function gunzip(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const gzipped = base64ToBytes(wasmGzipBase64);
const wasmBytes = await gunzip(gzipped);
const teavm = await load(wasmBytes);
const ocl = teavm.exports;

const checks = [
  ['rotateLeft(1, 63)', ocl.rotateLeft(1n, 63), -9223372036854775808n],
  ['isSubset(0b1010, 0b1110)', ocl.isSubset(0b1010n, 0b1110n), true],
  ['mismatchBits(all ones, 0)', ocl.mismatchBits(-1n, 0n), 64],
  ['screenMany(255, golden, 20000)', ocl.screenMany(0xffn, 0x9e3779b97f4a7c15n, 20000), 78],
];

let failures = 0;
for (const [name, actual, expected] of checks) {
  const ok = actual === expected;
  if (!ok) failures++;
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${actual}`);
}

// eslint-disable-next-line no-console
console.log('---');
// eslint-disable-next-line no-console
console.log(
  failures === 0
    ? 'EMBEDDED gzip+base64 PATH WORKS (decoded via atob + DecompressionStream, no fs/fetch)'
    : `${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
