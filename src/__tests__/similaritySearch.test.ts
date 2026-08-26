import { expect, test } from 'vitest';

import { SimilarityResult, similaritySearch } from '../index.ts';

import { readIdCodes, referenceSimilarity } from './fixture.ts';

// Building the 512-bit FragFp costs ~0.8 ms per molecule in WASM and ~9 ms in openchemlib-js, so the
// cross-check runs on a slice rather than the whole fixture: 150 molecules is ~1.5 s of reference
// work, which is what keeps this file's runtime reasonable.
const idCodes = readIdCodes().slice(0, 150);
const NAPHTHALENE = 'det@@DjYUX^d@@@@B';

test('similaritySearch reproduces openchemlib-js exactly', () => {
  const result = similaritySearch(NAPHTHALENE, idCodes);
  const expected = referenceSimilarity(NAPHTHALENE, idCodes);

  // Both compute the same 32-bit float from the same bit counts, so this is exact, not approximate.
  expect(Array.from(result)).toStrictEqual(Array.from(expected));
});

test('every similarity is a real number in [0, 1]', () => {
  const result = similaritySearch(NAPHTHALENE, idCodes);
  let outOfRange = 0;
  let stillUnprocessed = 0;
  for (const value of result) {
    if (Number.isNaN(value)) stillUnprocessed++;
    else if (value < 0 || value > 1) outOfRange++;
  }

  expect([stillUnprocessed, outOfRange]).toStrictEqual([0, 0]);
});

test('a molecule is perfectly similar to itself', () => {
  for (const idCode of idCodes.slice(0, 20)) {
    const result = similaritySearch(idCode, [idCode]);

    expect([idCode, result[0]]).toStrictEqual([idCode, 1]);
  }
});

test('an unparsable idcode is recorded as -1 and the scan continues', () => {
  const mixed = idCodes.slice(0, 20);
  mixed[5] = '';
  const result = similaritySearch(NAPHTHALENE, mixed);

  expect(result[5]).toBe(SimilarityResult.unparsable);

  let stillUnprocessed = 0;
  for (const value of result) {
    if (Number.isNaN(value)) stillUnprocessed++;
  }

  expect(stillUnprocessed).toBe(0);
});

// What a worker pool does: each worker scans its own slice and its buffer is copied back into place.
test('splitting the scan across worker-sized slices gives the same buffer', () => {
  const slice = idCodes.slice(0, 60);
  const whole = similaritySearch(NAPHTHALENE, slice);

  const joined = new Float32Array(slice.length);
  const size = 20;
  for (let from = 0; from < slice.length; from += size) {
    const to = Math.min(from + size, slice.length);
    joined.set(similaritySearch(NAPHTHALENE, slice.slice(from, to)), from);
  }

  expect(Array.from(joined)).toStrictEqual(Array.from(whole));
});

test('the buffer is one entry per idcode, and a fresh one every call', () => {
  const sample = idCodes.slice(0, 10);
  const first = similaritySearch(NAPHTHALENE, sample);
  const second = similaritySearch(NAPHTHALENE, sample);

  expect(first).toBeInstanceOf(Float32Array);
  expect(first).toHaveLength(sample.length);
  expect(first).not.toBe(second);
  expect(Array.from(first)).toStrictEqual(Array.from(second));
});

test('an empty batch gives an empty buffer and does not throw', () => {
  expect(similaritySearch(NAPHTHALENE, [])).toHaveLength(0);
});

test('an unparsable query is blamed on the query, not on the first molecule', () => {
  expect(() => similaritySearch('', idCodes)).toThrow(
    '"" is not a valid query idcode',
  );
  expect(() => similaritySearch('a', idCodes)).toThrow(
    '"a" is not a valid query idcode',
  );
});

// The module caches the last query's fingerprint, which costs ~947 µs to build. Alternating queries
// is what would expose it handing back the wrong one.
test('interleaving similarity queries does not leak the cached fingerprint', () => {
  const sample = idCodes.slice(0, 40);
  const benzene = 'gFp@DiTt@@B';
  const aloneNaphthalene = similaritySearch(NAPHTHALENE, sample);
  const aloneBenzene = similaritySearch(benzene, sample);

  const mixedNaphthalene = new Float32Array(sample.length);
  const mixedBenzene = new Float32Array(sample.length);
  for (let i = 0; i < sample.length; i++) {
    const one = sample[i] as string;
    mixedNaphthalene[i] = similaritySearch(NAPHTHALENE, [one])[0] as number;
    mixedBenzene[i] = similaritySearch(benzene, [one])[0] as number;
  }

  expect(Array.from(mixedNaphthalene)).toStrictEqual(
    Array.from(aloneNaphthalene),
  );
  expect(Array.from(mixedBenzene)).toStrictEqual(Array.from(aloneBenzene));
});
