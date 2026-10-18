import { expect, test } from 'vitest';

import type { FunctionKey } from '../functionKeys/index.ts';
import { getFunctionKey, getFunctionKeys } from '../functionKeys/index.ts';
import {
  INDEX_WORDS,
  SubstructureResult,
  getFunction,
  getFunctions,
  getIndexes,
  getScreens,
  substructureSearch,
} from '../index.ts';

import { QUERIES, fromSmiles, readIdCodes } from './fixture.ts';

const allIdCodes = readIdCodes();
// Every stored key is searched over these, so they are a slice: 512 keys of up to 180 fragments.
const idCodes = allIdCodes.slice(0, 500);
const functions = getFunctions(idCodes);
const keys = getFunctionKeys();

/**
 * Whether bit `bit` is set in sixteen words.
 * @param words - The words.
 * @param bit - The bit, 0 to 511, the first in the highest bit of word 0.
 * @returns True when it is set.
 */
function held(words: Int32Array, bit: number): boolean {
  return ((words[bit >> 5] as number) & (1 << (31 - (bit & 31)))) !== 0;
}

/**
 * The plane of a stored key, by name.
 * @param name - Its id, name or synonym.
 * @returns Its bit in the function words.
 */
function planeOf(name: string): number {
  const plane = getFunctionKey(name)?.plane;
  if (plane === undefined) throw new Error(`${name} is not a stored key`);
  return plane;
}

/**
 * The molecules a search for a key's fragments matches.
 * @param key - The key.
 * @param molecules - The idcodes to search.
 * @returns One flag per molecule.
 */
function searched(key: FunctionKey, molecules: string[]): boolean[] {
  const { result } = substructureSearch(key.fragments, molecules, {
    collect: false,
  });
  return Array.from(result, (code) => code === SubstructureResult.match);
}

test('each stored bit is what a search for the key’s fragments answers', () => {
  const differences: Array<{ key: string; molecule: number }> = [];
  for (const key of keys.slice(0, 512)) {
    const expected = searched(key, idCodes);
    for (let i = 0; i < idCodes.length; i++) {
      const words = functions[i] as Int32Array;
      if (held(words, key.plane ?? -1) !== expected[i]) {
        differences.push({ key: key.id, molecule: i });
      }
    }
  }

  expect(differences).toStrictEqual([]);
}, 180_000);

test('a key equal to a FragFp or screen bit answers what that bit answers', () => {
  const indexes = getIndexes(allIdCodes);
  const screens = getScreens(allIdCodes);
  const differences: Array<{ key: string; molecule: number }> = [];
  for (const key of keys.filter((each) => each.tier === 'existingPlane')) {
    const words = key.fingerprint === 'screen' ? screens : indexes;
    const expected = searched(key, allIdCodes);
    for (let i = 0; i < allIdCodes.length; i++) {
      if (held(words[i] as Int32Array, key.bit ?? -1) !== expected[i]) {
        differences.push({ key: key.id, molecule: i });
      }
    }
  }

  expect(differences).toStrictEqual([]);
}, 60_000);

test('getFunction of one idcode is its words in getFunctions', () => {
  expect(Array.from(getFunction(idCodes[7] as string))).toStrictEqual(
    Array.from(functions[7] as Int32Array),
  );
  expect(Array.from(getFunction(''))).toStrictEqual(
    new Array<number>(INDEX_WORDS).fill(0),
  );
});

test('the named keys mean what a chemist expects', () => {
  const caffeine = getFunction(fromSmiles('Cn1cnc2c1c(=O)n(C)c(=O)n2C'));
  const uracil = getFunction(fromSmiles('O=C1C=CNC(=O)N1'));
  const coumarin = getFunction(fromSmiles('O=C1C=Cc2ccccc2O1'));
  const dihydrocoumarin = getFunction(fromSmiles('O=C1CCc2ccccc2O1'));

  expect([
    held(caffeine, planeOf('xanthine')),
    held(caffeine, planeOf('uracil')),
    held(uracil, planeOf('uracil')),
    held(coumarin, planeOf('coumarin')),
    held(dihydrocoumarin, planeOf('coumarin')),
  ]).toStrictEqual([true, false, true, true, false]);
});

test('a search for several queries matches what any of them matches', () => {
  const benzene = (QUERIES[0] as { idCode: string }).idCode;
  const pyridine = (QUERIES[1] as { idCode: string }).idCode;
  const union = new Set([
    ...substructureSearch(benzene, idCodes).indexes,
    ...substructureSearch(pyridine, idCodes).indexes,
  ]);

  expect(
    substructureSearch([benzene, pyridine], idCodes).indexes,
  ).toStrictEqual([...union].toSorted((a, b) => a - b));
  expect(substructureSearch([benzene], idCodes).indexes).toStrictEqual(
    substructureSearch(benzene, idCodes).indexes,
  );
});

test('an empty query list is refused', () => {
  expect(() => substructureSearch([], idCodes)).toThrow(
    'the query list is empty: give at least one idcode',
  );
});
