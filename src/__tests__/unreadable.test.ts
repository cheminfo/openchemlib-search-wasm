import { expect, test } from 'vitest';

import {
  INDEX_WORDS,
  NO_HASH,
  getIndex,
  getIndexes,
  getNoStereoHash,
  getNoStereoHashes,
  getNoStereoTautomerHash,
  getNoStereoTautomerHashes,
} from '../index.ts';

import { fromSmiles } from './fixture.ts';

// A malformed ASCII idcode: the Java guard passes it through and OpenChemLib's bit-stream parser
// then reads past its input, which WebAssembly traps on. Every function must answer "could not read
// this" rather than let the trap out.
const MALFORMED = 'zzzz';
const GOOD = fromSmiles('CC(=O)Oc1ccccc1C(=O)O');
const ZEROS = Array.from({ length: INDEX_WORDS }, () => 0);

test('a malformed idcode gets NO_HASH instead of throwing', () => {
  expect(getNoStereoTautomerHash(MALFORMED)).toBe(NO_HASH);
  expect(getNoStereoHash(MALFORMED)).toBe(NO_HASH);
});

test('a malformed idcode gets sixteen zeros instead of throwing', () => {
  expect(Array.from(getIndex(MALFORMED))).toStrictEqual(ZEROS);
});

test('a malformed entry does not cost the good ones in the same batch', () => {
  const codes = [GOOD, MALFORMED, GOOD];

  const tautomer = getNoStereoTautomerHashes(codes);

  expect(tautomer[1]).toBe(NO_HASH);
  expect(tautomer[0]).toBe(getNoStereoTautomerHash(GOOD));
  expect(tautomer[2]).toBe(getNoStereoTautomerHash(GOOD));

  const noStereo = getNoStereoHashes(codes);

  expect(noStereo[1]).toBe(NO_HASH);
  expect(noStereo[0]).toBe(getNoStereoHash(GOOD));

  const indexes = getIndexes(codes);

  expect(Array.from(indexes[1] as Int32Array)).toStrictEqual(ZEROS);
  expect(Array.from(indexes[0] as Int32Array)).toStrictEqual(
    Array.from(getIndex(GOOD)),
  );
  expect(Array.from(indexes[2] as Int32Array)).toStrictEqual(
    Array.from(getIndex(GOOD)),
  );
});

test('an array that is entirely malformed yields one unreadable answer per entry', () => {
  const codes = [MALFORMED, MALFORMED, MALFORMED];

  expect(Array.from(getNoStereoHashes(codes))).toStrictEqual([
    NO_HASH,
    NO_HASH,
    NO_HASH,
  ]);

  for (const index of getIndexes(codes)) {
    expect(Array.from(index)).toStrictEqual(ZEROS);
  }
});

test('the module is still usable after a trap', () => {
  getNoStereoTautomerHash(MALFORMED);

  expect(getNoStereoTautomerHash(GOOD)).not.toBe(NO_HASH);
  expect(Array.from(getIndex(GOOD))).not.toStrictEqual(ZEROS);
});
