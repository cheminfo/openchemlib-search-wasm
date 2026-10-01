import { expect, test } from 'vitest';

import {
  getNoStereoHash,
  getNoStereoIdCode,
  getNoStereoTautomerHash,
  getNoStereoTautomerIdCode,
  strongHash,
} from '../index.ts';

import { readIdCodes } from './fixture.ts';

const idCodes = readIdCodes().slice(0, 250);

// The property the export exists for: a caller holding a canonical idcode gets its hash without
// canonizing again, and gets exactly the value the WASM side computes in Java.
test('hashing a canonical idcode gives the hash the module computes', () => {
  for (const idCode of idCodes) {
    expect([idCode, strongHash(getNoStereoIdCode(idCode))]).toStrictEqual([
      idCode,
      getNoStereoHash(idCode),
    ]);
  }
}, 60_000);

test('the same holds for the tautomer form', () => {
  for (const idCode of idCodes) {
    expect([
      idCode,
      strongHash(getNoStereoTautomerIdCode(idCode)),
    ]).toStrictEqual([idCode, getNoStereoTautomerHash(idCode)]);
  }
}, 120_000);

test('every hash is a signed 64-bit value', () => {
  const min = -(2n ** 63n);
  const max = 2n ** 63n - 1n;
  for (const text of ['', 'a', 'gC`@DiZ@@', 'x'.repeat(500)]) {
    const hash = strongHash(text);

    expect(hash).toBeGreaterThanOrEqual(min);
    expect(hash).toBeLessThanOrEqual(max);
  }
});

test('it is a pure function of the string', () => {
  expect(strongHash('gC`@DiZ@@')).toBe(697515432607904455n);
  expect(strongHash('gC`@DiZ@@')).toBe(strongHash('gC`@DiZ@@'));
  expect(strongHash('gC`@DiZDD@')).not.toBe(strongHash('gC`@DiZ@@'));
});
