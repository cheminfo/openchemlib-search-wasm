import { expect, test } from 'vitest';

import {
  INDEX_WORDS,
  NO_HASH,
  NO_ID_CODE,
  RECORD_WORDS,
  getIndex,
  getIndexes,
  getMoleculeRecords,
  getMoleculeSizes,
  getNoStereoHash,
  getNoStereoHashes,
  getNoStereoTautomerHash,
  getNoStereoTautomerHashes,
  getQueryAtomFloor,
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

test('a malformed entry gets the unreadable record, and the good ones keep theirs', () => {
  const codes = [GOOD, MALFORMED, '', 'é', GOOD];
  const records = getMoleculeRecords(codes);
  const good = getMoleculeRecords([GOOD]);

  expect(records.idCodes).toStrictEqual([
    good.idCodes[0],
    NO_ID_CODE,
    NO_ID_CODE,
    NO_ID_CODE,
    good.idCodes[0],
  ]);
  expect(
    Array.from(records.words.subarray(RECORD_WORDS, 4 * RECORD_WORDS)),
  ).toStrictEqual(new Array<number>(3 * RECORD_WORDS).fill(0));
  expect(Array.from(records.words.subarray(4 * RECORD_WORDS))).toStrictEqual(
    Array.from(good.words),
  );
  expect(Array.from(records.atomCounts)).toStrictEqual([13, 0, 0, 0, 13]);
  expect(Array.from(records.weights)).toStrictEqual([
    good.weights[0],
    Number.NaN,
    Number.NaN,
    Number.NaN,
    good.weights[0],
  ]);
  expect(Array.from(records.noStereoHashes)).toStrictEqual([
    getNoStereoHash(GOOD),
    NO_HASH,
    NO_HASH,
    NO_HASH,
    getNoStereoHash(GOOD),
  ]);
  expect(Array.from(records.tautomerHashes)).toStrictEqual([
    getNoStereoTautomerHash(GOOD),
    NO_HASH,
    NO_HASH,
    NO_HASH,
    getNoStereoTautomerHash(GOOD),
  ]);
  expect(Array.from(records.tautomerCounts)).toStrictEqual([
    good.tautomerCounts[0],
    0,
    0,
    0,
    good.tautomerCounts[0],
  ]);
});

test('a malformed entry gets no size, and the good ones keep theirs', () => {
  const sizes = getMoleculeSizes([GOOD, MALFORMED, GOOD]);

  expect(Array.from(sizes.atomCounts)).toStrictEqual([13, 0, 13]);
  // C9H8O4, summed in OpenChemLib's own order
  expect(Array.from(sizes.weights)).toStrictEqual([
    180.15851999999998,
    Number.NaN,
    180.15851999999998,
  ]);
});

test('a malformed query has no atom floor', () => {
  expect(() => getQueryAtomFloor(MALFORMED)).toThrow(
    '"zzzz" is not a valid query idcode',
  );
});
