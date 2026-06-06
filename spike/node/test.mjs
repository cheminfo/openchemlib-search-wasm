// Stage 0 spike verification: load the TeaVM WasmGC module from in-memory bytes
// (no fetch, no URL — the isomorphic path), call the @JSExport methods, and
// prove native 64-bit (i64) semantics are exact. Run with: node node/test.mjs
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { load } from '../target/wasm-gc/spike.wasm-runtime.js';

const wasmDir = join(import.meta.dirname, '..', 'target', 'wasm-gc');

// Reference implementations in JS BigInt with explicit 64-bit signed wraparound,
// to mirror Java long semantics exactly.
const wrap64 = (x) => BigInt.asIntN(64, x);
const LCG_MUL = 6364136223846793005n;
const LCG_INC = 1442695040888963407n;

function screenManyRef(query, seed, count) {
  let passed = 0;
  let molecule = wrap64(seed);
  const q = wrap64(query);
  for (let i = 0; i < count; i++) {
    molecule = wrap64(molecule * LCG_MUL + LCG_INC);
    if ((q & ~molecule) === 0n) passed++;
  }
  return passed;
}

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: got ${actual}${ok ? '' : `, expected ${expected}`}`);
}

// Load from raw bytes — the same path openchemlib-wasm will use after gzip+base64 decode.
const wasmBytes = new Uint8Array(await readFile(join(wasmDir, 'spike.wasm')));
const teavm = await load(wasmBytes);
const ocl = teavm.exports;

// eslint-disable-next-line no-console
console.log('exported names:', Object.keys(ocl).filter((k) => !k.startsWith('teavm.')).join(', '));
// eslint-disable-next-line no-console
console.log('---');

// 1. 64-bit rotate — only correct with true i64. Long.rotateLeft(1, 63) = Long.MIN_VALUE.
check('rotateLeft(1, 63)', ocl.rotateLeft(1n, 63), -9223372036854775808n);
check('rotateLeft(0x0123456789ABCDEF, 8)', ocl.rotateLeft(0x0123456789abcdefn, 8), wrap64(0x23456789abcdef01n));

// 2. fingerprint subset test
check('isSubset(0b1010, 0b1110) => all present', ocl.isSubset(0b1010n, 0b1110n), true);
check('isSubset(0b0001, 0b1110) => bit missing', ocl.isSubset(0b0001n, 0b1110n), false);
check('isSubset(MSB set, MSB set)', ocl.isSubset(1n << 63n, 1n << 63n), true);
check('isSubset(MSB set, 0)', ocl.isSubset(1n << 63n, 0n), false);

// 3. popcount of missing bits
check('mismatchBits(0b1011, 0b0010)', ocl.mismatchBits(0b1011n, 0b0010n), 2);
check('mismatchBits(all ones, 0)', ocl.mismatchBits(-1n, 0n), 64);

// 4. 64-bit LCG screening loop — the multiply overflows 53 bits every iteration,
//    so a correct count is only possible with genuine i64 arithmetic.
for (const [query, seed, count] of [
  [0n, 1n, 1000],
  [1n, 12345n, 5000],
  [0xffn, 0x9e3779b97f4a7c15n, 20000],
]) {
  check(
    `screenMany(${query}, ${seed}, ${count})`,
    ocl.screenMany(query, seed, count),
    screenManyRef(query, seed, count),
  );
}

// Indicative throughput read: native i64 (WASM) vs JS BigInt for the same 64-bit
// screening loop. This is a PROXY for the long-emulation cost, not the real
// GWT-vs-WASM substructure benchmark (that comes in Stage 2).
const N = 20_000_000;
const q = 0xffn;
const seed = 0x9e3779b97f4a7c15n;

ocl.screenMany(q, seed, 1_000_000); // warmup
const t0 = performance.now();
const wasmResult = ocl.screenMany(q, seed, N);
const t1 = performance.now();
const jsResult = screenManyRef(q, seed, N);
const t2 = performance.now();

// eslint-disable-next-line no-console
console.log('---');
check(`throughput loop agreement (N=${N})`, wasmResult, jsResult);
const wasmMs = t1 - t0;
const jsMs = t2 - t1;
// eslint-disable-next-line no-console
console.log(`WASM i64 screenMany: ${wasmMs.toFixed(1)} ms  (${((N / wasmMs) * 1e-3).toFixed(1)} M ops/s)`);
// eslint-disable-next-line no-console
console.log(`JS BigInt screenMany: ${jsMs.toFixed(1)} ms  (${((N / jsMs) * 1e-3).toFixed(1)} M ops/s)`);
// eslint-disable-next-line no-console
console.log(`WASM is ${(jsMs / wasmMs).toFixed(1)}x faster than JS BigInt on this 64-bit loop`);

// eslint-disable-next-line no-console
console.log('---');
// eslint-disable-next-line no-console
console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
