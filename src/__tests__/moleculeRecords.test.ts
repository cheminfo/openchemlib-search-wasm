import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import type { MoleculeRecords } from '../index.ts';
import {
  DEFAULT_MAX_TAUTOMERS,
  INDEX_WORDS,
  NO_HASH,
  NO_ID_CODE,
  RECORD_WORDS,
  getFunctions,
  getIndexes,
  getMoleculeRecords,
  getMoleculeSizes,
  getNoStereoHashes,
  getNoStereoTautomerHash,
  getNoStereoTautomerHashes,
  getScreens,
} from '../index.ts';

import { readIdCodes, referenceIdCode } from './fixture.ts';

const idCodes = readIdCodes();

// Nothing but the tautomer hash depends on the ceiling, so the whole fixture is read with a low one:
// it keeps the run short, and it truncates enough molecules to test what a truncated one gets.
const MAX_TAUTOMERS = 10;
const records = getMoleculeRecords(idCodes, { maxTautomers: MAX_TAUTOMERS });

/** One molecule's record, read out of the arrays, so records compare as plain objects. */
interface MoleculeRecord {
  idCode: string | undefined;
  words: number[];
  atomCount: number | undefined;
  weight: number | undefined;
  noStereoHash: bigint | undefined;
  tautomerHash: bigint | undefined;
  tautomerCount: number | undefined;
}

const UNREADABLE: MoleculeRecord = {
  idCode: NO_ID_CODE,
  words: new Array<number>(RECORD_WORDS).fill(0),
  atomCount: 0,
  weight: Number.NaN,
  noStereoHash: NO_HASH,
  tautomerHash: NO_HASH,
  tautomerCount: 0,
};

/**
 * Reads one molecule's record.
 * @param from - The records.
 * @param index - The molecule's position.
 * @returns Its record.
 */
function recordAt(from: MoleculeRecords, index: number): MoleculeRecord {
  return {
    idCode: from.idCodes[index],
    words: Array.from(
      from.words.subarray(index * RECORD_WORDS, (index + 1) * RECORD_WORDS),
    ),
    atomCount: from.atomCounts[index],
    weight: from.weights[index],
    noStereoHash: from.noStereoHashes[index],
    tautomerHash: from.tautomerHashes[index],
    tautomerCount: from.tautomerCounts[index],
  };
}

test('every canonical idcode matches openchemlib-js', () => {
  let coordinateFree = 0;
  for (let i = 0; i < idCodes.length; i++) {
    const idCode = idCodes[i] as string;
    const expected = referenceIdCode(idCode);

    expect([i, records.idCodes[i]]).toStrictEqual([i, expected]);

    const parsed = OCL.Molecule.fromIDCode(idCode, false);
    if (new OCL.Canonizer(parsed).getIDCode() !== expected) coordinateFree++;
  }

  // The shortcut this guards against, canonizing the molecule as parsed without coordinates, gets
  // this many of them wrong.
  expect(coordinateFree).toBe(330);
}, 120_000);

test('atom counts and weights match openchemlib-js', () => {
  for (let i = 0; i < idCodes.length; i++) {
    const parsed = OCL.Molecule.fromIDCode(idCodes[i] as string, false);

    expect([i, records.atomCounts[i]]).toStrictEqual([i, parsed.getAllAtoms()]);
    expect([i, records.weights[i]]).toStrictEqual([
      i,
      parsed.getMolecularFormula().relativeWeight,
    ]);
  }
}, 60_000);

test('getMoleculeSizes is exactly the atom counts and weights of the records', () => {
  expect(getMoleculeSizes(idCodes)).toStrictEqual({
    atomCounts: records.atomCounts,
    weights: records.weights,
  });
});

test('the words are the FragFp, the screen, then the function bits', () => {
  const slice = idCodes.slice(0, 500);
  const indexes = getIndexes(slice);
  const screens = getScreens(slice);
  const functions = getFunctions(slice);
  for (let i = 0; i < slice.length; i++) {
    const words = recordAt(records, i).words;

    expect([i, words.slice(0, INDEX_WORDS)]).toStrictEqual([
      i,
      Array.from(indexes[i] as Int32Array),
    ]);
    expect([i, words.slice(INDEX_WORDS, 2 * INDEX_WORDS)]).toStrictEqual([
      i,
      Array.from(screens[i] as Int32Array),
    ]);
    expect([i, words.slice(2 * INDEX_WORDS)]).toStrictEqual([
      i,
      Array.from(functions[i] as Int32Array),
    ]);
  }
}, 60_000);

test('the no-stereo hashes are getNoStereoHashes', () => {
  expect(records.noStereoHashes).toStrictEqual(getNoStereoHashes(idCodes));
});

test('a tautomer hash is getNoStereoTautomerHashes below the ceiling, the no-stereo hash at it', () => {
  const tautomerCounts = new Int32Array(idCodes.length);
  const tautomerHashes = getNoStereoTautomerHashes(idCodes, {
    maxTautomers: MAX_TAUTOMERS,
    tautomerCounts,
  });

  const expected = new BigInt64Array(idCodes.length);
  let truncated = 0;
  let tautomeric = 0;
  for (let i = 0; i < idCodes.length; i++) {
    const noStereoHash = records.noStereoHashes[i] as bigint;
    if ((tautomerCounts[i] as number) >= MAX_TAUTOMERS) {
      expected[i] = noStereoHash;
      truncated++;
    } else {
      expected[i] = tautomerHashes[i] as bigint;
      if (expected[i] !== noStereoHash) tautomeric++;
    }
  }

  expect(records.tautomerCounts).toStrictEqual(tautomerCounts);
  expect(records.tautomerHashes).toStrictEqual(expected);
  expect(truncated).toBe(657);
  // below the ceiling, the tautomer hash is genuinely its own key on this many
  expect(tautomeric).toBe(676);
}, 60_000);

test('maxTautomers defaults to DEFAULT_MAX_TAUTOMERS', () => {
  // 1216 tautomers: past a ceiling of 1000, well under the default one
  const idCode = idCodes[214] as string;
  const byDefault = getMoleculeRecords([idCode]);

  expect(byDefault).toStrictEqual(
    getMoleculeRecords([idCode], { maxTautomers: DEFAULT_MAX_TAUTOMERS }),
  );
  expect(byDefault.tautomerCounts[0]).toBe(1216);
  expect(byDefault.tautomerHashes[0]).toBe(getNoStereoTautomerHash(idCode));
  expect(byDefault.tautomerHashes[0]).not.toBe(byDefault.noStereoHashes[0]);

  const capped = getMoleculeRecords([idCode], { maxTautomers: 1000 });

  expect(capped.tautomerCounts[0]).toBe(1000);
  expect(capped.tautomerHashes[0]).toBe(capped.noStereoHashes[0]);
});

// The idcode that traps the parser is covered in unreadable.test.ts, which reads nothing long enough
// to grow the parse buffer past it.
test('an empty or non-ASCII idcode gets the unreadable record, and its neighbours are untouched', () => {
  const mixed = [idCodes[0], '', idCodes[1], 'gCi@DDfZ@@é', idCodes[2]];
  const result = getMoleculeRecords(mixed as string[], {
    maxTautomers: MAX_TAUTOMERS,
  });

  expect(recordAt(result, 1)).toStrictEqual(UNREADABLE);
  expect(recordAt(result, 3)).toStrictEqual(UNREADABLE);
  expect(recordAt(result, 0)).toStrictEqual(recordAt(records, 0));
  expect(recordAt(result, 2)).toStrictEqual(recordAt(records, 1));
  expect(recordAt(result, 4)).toStrictEqual(recordAt(records, 2));
});

test('an empty array gives empty records', () => {
  expect(getMoleculeRecords([])).toStrictEqual({
    idCodes: [],
    words: new Int32Array(0),
    atomCounts: new Int32Array(0),
    weights: new Float64Array(0),
    noStereoHashes: new BigInt64Array(0),
    tautomerHashes: new BigInt64Array(0),
    tautomerCounts: new Int32Array(0),
  });
});
