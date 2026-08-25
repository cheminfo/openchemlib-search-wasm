import { expect, test } from 'vitest';

import { SimilarityResult, similaritySearch } from '../index.ts';

import { readIdCodes, referenceSimilarity } from './fixture.ts';

// Building the 512-bit FragFp costs ~0.8 ms per molecule in WASM and ~9 ms in openchemlib-js, so the
// cross-check runs on a slice rather than the whole fixture: 150 molecules is ~1.5 s of reference
// work, which is what keeps this file's runtime reasonable.
const idCodes = readIdCodes().slice(0, 150);
const NAPHTHALENE = 'det@@DjYUX^d@@@@B';

test('similaritySearch reproduces openchemlib-js exactly', () => {
  const result = new Float32Array(idCodes.length);
  similaritySearch(NAPHTHALENE, idCodes, result);
  const expected = referenceSimilarity(NAPHTHALENE, idCodes);

  // Both compute the same 32-bit float from the same bit counts, so this is exact, not approximate.
  expect(Array.from(result)).toStrictEqual(Array.from(expected));
});

test('every similarity is a real number in [0, 1]', () => {
  const result = new Float32Array(idCodes.length);
  similaritySearch(NAPHTHALENE, idCodes, result);
  let outOfRange = 0;
  let stillUnprocessed = 0;
  for (const value of result) {
    if (Number.isNaN(value)) stillUnprocessed++;
    else if (value < 0 || value > 1) outOfRange++;
  }

  expect([stillUnprocessed, outOfRange]).toStrictEqual([0, 0]);
});

test('a molecule is perfectly similar to itself', () => {
  const result = new Float32Array(1);
  for (const idCode of idCodes.slice(0, 20)) {
    similaritySearch(idCode, [idCode], result);

    expect([idCode, result[0]]).toStrictEqual([idCode, 1]);
  }
});

test('an unparsable idcode is recorded as -1 and the scan continues', () => {
  const mixed = idCodes.slice(0, 20);
  mixed[5] = '';
  const result = new Float32Array(mixed.length);
  similaritySearch(NAPHTHALENE, mixed, result);

  expect(result[5]).toBe(SimilarityResult.unparsable);

  let stillUnprocessed = 0;
  for (const value of result) {
    if (Number.isNaN(value)) stillUnprocessed++;
  }

  expect(stillUnprocessed).toBe(0);
});

test('splitting the scan across worker-sized slices gives the same buffer', () => {
  const slice = idCodes.slice(0, 60);
  const whole = new Float32Array(slice.length);
  similaritySearch(NAPHTHALENE, slice, whole);

  const shared = new Float32Array(new SharedArrayBuffer(slice.length * 4));
  const size = 20;
  for (let from = 0; from < slice.length; from += size) {
    const to = Math.min(from + size, slice.length);
    similaritySearch(
      NAPHTHALENE,
      slice.slice(from, to),
      shared.subarray(from, to),
    );
  }

  expect(Array.from(shared)).toStrictEqual(Array.from(whole));
});

test('a result buffer of the wrong length is refused', () => {
  expect(() =>
    similaritySearch(NAPHTHALENE, ['gCi@DDfZ@@'], new Float32Array(3)),
  ).toThrow('result must hold one entry per idcode: got 3 for 1 idcodes');
});

test('an unparsable query is blamed on the query, not on the first molecule', () => {
  expect(() =>
    similaritySearch('', idCodes, new Float32Array(idCodes.length)),
  ).toThrow('"" is not a valid query idcode');
  expect(() =>
    similaritySearch('a', idCodes, new Float32Array(idCodes.length)),
  ).toThrow('"a" is not a valid query idcode');
});

// The module caches the last query's fingerprint, which costs ~947 µs to build. Alternating queries
// is what would expose it handing back the wrong one.
test('interleaving similarity queries does not leak the cached fingerprint', () => {
  const sample = idCodes.slice(0, 40);
  const benzene = 'gFp@DiTt@@B';
  const aloneNaphthalene = new Float32Array(sample.length);
  similaritySearch(NAPHTHALENE, sample, aloneNaphthalene);
  const aloneBenzene = new Float32Array(sample.length);
  similaritySearch(benzene, sample, aloneBenzene);

  const mixedNaphthalene = new Float32Array(sample.length);
  const mixedBenzene = new Float32Array(sample.length);
  const one = new Float32Array(1);
  for (let i = 0; i < sample.length; i++) {
    similaritySearch(NAPHTHALENE, [sample[i] as string], one);
    mixedNaphthalene[i] = one[0] as number;
    similaritySearch(benzene, [sample[i] as string], one);
    mixedBenzene[i] = one[0] as number;
  }

  expect(Array.from(mixedNaphthalene)).toStrictEqual(
    Array.from(aloneNaphthalene),
  );
  expect(Array.from(mixedBenzene)).toStrictEqual(Array.from(aloneBenzene));
});
