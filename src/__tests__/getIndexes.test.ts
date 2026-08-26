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

  expect(indexes).toHaveLength(idCodes.length);

  for (let i = 0; i < idCodes.length; i++) {
    const expected = referenceIndex(idCodes[i] as string).map(
      (word) => word | 0,
    );
    const actual = Array.from(indexes[i] as Int32Array);

    expect([i, actual]).toStrictEqual([i, expected]);
  }
});

test('every index is sixteen words long', () => {
  const indexes = getIndexes(idCodes.slice(0, 5));
  for (const index of indexes) {
    expect(index).toHaveLength(INDEX_WORDS);
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
    const index = indexes[i] as Int32Array;
    const view = Array.from(
      new BigInt64Array(index.buffer, index.byteOffset, 8),
    );

    expect([i, view]).toStrictEqual([i, packed]);
  }
});

// The views share one buffer, so each has to land on an 8-byte boundary or the BigInt64Array view
// above would throw for every other molecule.
test('every index starts on an 8-byte boundary', () => {
  for (const index of getIndexes(idCodes.slice(0, 5))) {
    expect(index.byteOffset % 8).toBe(0);
  }
});

test('a molecule is a candidate for a fingerprint that is a subset of its own', () => {
  // benzene's own fingerprint, and a benzene-containing molecule from the fixture
  const benzeneIndex = getIndex('gFp@DiTt@@B');
  const indexes = getIndexes(idCodes);
  let supersets = 0;
  for (let i = 0; i < idCodes.length; i++) {
    const index = indexes[i] as Int32Array;
    let isSuperset = true;
    for (let word = 0; word < INDEX_WORDS; word++) {
      const query = benzeneIndex[word] as number;
      if (((index[word] as number) & query) !== query) {
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
  const zeros = Array.from({ length: INDEX_WORDS }, () => 0);

  expect(Array.from(indexes[1] as Int32Array)).toStrictEqual(zeros);
  expect(Array.from(indexes[2] as Int32Array)).toStrictEqual(zeros);

  let nonZero = 0;
  for (const word of indexes[0] as Int32Array) {
    if (word !== 0) nonZero++;
  }

  expect(nonZero).toBeGreaterThan(0);
});

test('an empty array gives no indexes', () => {
  expect(getIndexes([])).toStrictEqual([]);
});

test('getIndex is the one-molecule form of getIndexes', () => {
  const batch = getIndexes(idCodes.slice(0, 5));
  for (let i = 0; i < 5; i++) {
    expect([i, Array.from(getIndex(idCodes[i] as string))]).toStrictEqual([
      i,
      Array.from(batch[i] as Int32Array),
    ]);
  }
});

test('getIndex returns sixteen words of its own', () => {
  const index = getIndex(idCodes[0] as string);

  expect(index).toHaveLength(INDEX_WORDS);
  expect(index.byteOffset).toBe(0);
  expect(Array.from(index)).toStrictEqual(
    referenceIndex(idCodes[0] as string).map((word) => word | 0),
  );
});
