import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import { INDEX_WORDS, getIndex, getIndexes } from '../index.ts';

import { readIdCodes } from './fixture.ts';

// Building a fingerprint costs ~0.9 ms per molecule, so the cross-check runs on a slice.
const idCodes = readIdCodes().slice(0, 250);

/**
 * What `openchemlib-sqlite` stores today, straight out of `openchemlib-js`.
 * @param idCode - The molecule to fingerprint.
 * @returns Its 512-bit FragFp, as sixteen 32-bit words.
 */
function referenceIndex(idCode: string): number[] {
  return new OCL.SSSearcherWithIndex().createIndex(
    OCL.Molecule.fromIDCode(idCode, false),
  );
}

test('every word matches openchemlib-js createIndex', () => {
  const indexes = getIndexes(idCodes);

  expect(indexes).toHaveLength(idCodes.length * INDEX_WORDS);

  for (let i = 0; i < idCodes.length; i++) {
    const expected = referenceIndex(idCodes[i] as string).map(
      (word) => word | 0,
    );
    const actual = Array.from(
      indexes.subarray(i * INDEX_WORDS, (i + 1) * INDEX_WORDS),
    );

    expect([i, actual]).toStrictEqual([i, expected]);
  }
});

// This is the property that lets an existing ocl_ss_index table stay as it is: the eight columns
// openchemlib-sqlite writes are a BigInt64 view over these very words.
test('a BigInt64Array view is exactly what packSSIndex produces', () => {
  const indexes = getIndexes(idCodes.slice(0, 20));
  for (let i = 0; i < 20; i++) {
    const packed = Array.from(
      new BigInt64Array(
        new Uint32Array(referenceIndex(idCodes[i] as string)).buffer,
      ),
    );
    const view = Array.from(new BigInt64Array(indexes.buffer, i * 64, 8));

    expect([i, view]).toStrictEqual([i, packed]);
  }
});

test('a molecule is a candidate for a fingerprint that is a subset of its own', () => {
  // benzene's own fingerprint, and a benzene-containing molecule from the fixture
  const [benzeneIndex] = [getIndexes(['gFp@DiTt@@B'])];
  const indexes = getIndexes(idCodes);
  let supersets = 0;
  for (let i = 0; i < idCodes.length; i++) {
    let isSuperset = true;
    for (let word = 0; word < INDEX_WORDS; word++) {
      const query = benzeneIndex[word] as number;
      if (((indexes[i * INDEX_WORDS + word] as number) & query) !== query) {
        isSuperset = false;
        break;
      }
    }
    if (isSuperset) supersets++;
  }

  // the screen must keep every real hit; over this slice benzene matches 156 molecules
  expect(supersets).toBeGreaterThanOrEqual(156);
});

test('an unparsable idcode gets sixteen zeros, so it is never a candidate', () => {
  const indexes = getIndexes(['gCi@DDfZ@@', '', 'C1=CC=CC=C1']);

  expect(Array.from(indexes.subarray(16, 32))).toStrictEqual(
    Array.from({ length: 16 }, () => 0),
  );
  expect(Array.from(indexes.subarray(32, 48))).toStrictEqual(
    Array.from({ length: 16 }, () => 0),
  );

  let nonZero = 0;
  for (let word = 0; word < 16; word++) {
    if (indexes[word] !== 0) nonZero++;
  }

  expect(nonZero).toBeGreaterThan(0);
});

test('a caller-supplied buffer is filled and returned', () => {
  const buffer = new Int32Array(3 * INDEX_WORDS);
  const returned = getIndexes(idCodes.slice(0, 3), buffer);

  expect(returned).toBe(buffer);
  expect(Array.from(buffer.subarray(0, 16))).toStrictEqual(
    referenceIndex(idCodes[0] as string).map((word) => word | 0),
  );
});

test('a buffer of the wrong length is refused', () => {
  expect(() => getIndexes(idCodes.slice(0, 3), new Int32Array(16))).toThrow(
    'result must hold 16 words per idcode: got 16 for 3 idcodes, expected 48',
  );
});

test('an empty array gives an empty buffer', () => {
  expect(getIndexes([])).toHaveLength(0);
});

// The eight ss_indexN columns are read back as a BigInt64Array view, which refuses a byte offset
// that is not a multiple of 8 — so a misaligned buffer has to fail here, naming the argument.
test('a buffer that cannot be viewed as BigInt64 is refused', () => {
  const backing = new Int32Array(2 * INDEX_WORDS + 1);

  expect(() => getIndexes(idCodes.slice(0, 2), backing.subarray(1))).toThrow(
    'result must start on an 8-byte boundary so it can be read as BigInt64: its byteOffset is 4',
  );
});

test('getIndex is the one-molecule form of getIndexes', () => {
  const batch = getIndexes(idCodes.slice(0, 5));
  for (let i = 0; i < 5; i++) {
    expect([i, Array.from(getIndex(idCodes[i] as string))]).toStrictEqual([
      i,
      Array.from(batch.subarray(i * INDEX_WORDS, (i + 1) * INDEX_WORDS)),
    ]);
  }
});

test('getIndex fills a caller-supplied buffer and refuses a wrong one', () => {
  const buffer = new Int32Array(INDEX_WORDS);

  expect(getIndex(idCodes[0] as string, buffer)).toBe(buffer);
  expect(Array.from(buffer)).toStrictEqual(
    referenceIndex(idCodes[0] as string).map((word) => word | 0),
  );
  expect(() => getIndex(idCodes[0] as string, new Int32Array(8))).toThrow(
    'result must hold 16 words per idcode',
  );
});
