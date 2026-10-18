import { expect, test } from 'vitest';

import type { FunctionKey } from '../functionKeys/index.ts';
import {
  getFunctionCategories,
  getFunctionKey,
  getFunctionKeySources,
  getFunctionKeys,
  getRecordBit,
  searchFunctionKeys,
} from '../functionKeys/index.ts';
import { getFunctionKeyFragments } from '../index.ts';

const keys = getFunctionKeys();

/**
 * A key the tests rely on, by name.
 * @param name - Its id, name or synonym.
 * @returns The key.
 */
function keyNamed(name: string): FunctionKey {
  const key = getFunctionKey(name);
  if (!key) throw new Error(`no key is named ${name}`);
  return key;
}

test('the dictionary holds the 512 stored keys in bit order, then the others', () => {
  const stored = keys.filter((key) => key.tier === 'stored');

  expect(stored.map((key) => key.plane)).toStrictEqual(
    Array.from({ length: 512 }, (_, plane) => plane),
  );
  expect(keys.slice(0, 512)).toStrictEqual(stored);
  expect(keys.filter((key) => key.tier === 'existingPlane')).toHaveLength(22);
  expect(keys.filter((key) => key.tier === 'onDemand')).toHaveLength(3077);
});

test('the module computes exactly the stored keys of the dictionary', () => {
  expect(getFunctionKeyFragments()).toStrictEqual(
    keys.slice(0, 512).map((key) => key.fragments),
  );
});

test('every id and every name belongs to one key, and every key has fragments', () => {
  const names = keys
    .flatMap((key) => [key.name, ...key.synonyms])
    .map((name) => name.toLowerCase());

  expect(new Set(names).size).toBe(names.length);
  expect(new Set(keys.map((key) => key.id)).size).toBe(keys.length);
  expect(keys.filter((key) => key.fragments.length === 0)).toStrictEqual([]);
});

test('every key sits in one of the 19 categories and comes from a credited source', () => {
  const categories = getFunctionCategories();
  const sources = getFunctionKeySources();

  expect(Object.keys(categories)).toHaveLength(19);
  expect(Object.keys(sources).toSorted()).toStrictEqual([
    'accfg',
    'chemcaption',
    'cheminfo',
    'medchem',
    'ocl-utils',
    'rdkit',
  ]);
  expect(keys.filter((key) => !(key.category in categories))).toStrictEqual([]);
  expect(
    keys.filter((key) => key.sources.some((source) => !(source in sources))),
  ).toStrictEqual([]);
});

test('getFunctionKey finds a key by id, name or synonym, case aside', () => {
  expect(getFunctionKey('uracil')?.id).toBe('uracil');
  expect(getFunctionKey('Pyrimidine-2,4(1H,3H)-dione')?.id).toBe('uracil');
  expect(getFunctionKey('  coumarin ')?.name).toBe('coumarin');
  expect(getFunctionKey('2H-chromen-2-one')?.id).toBe('coumarin');
  expect(getFunctionKey('no such group')).toBeUndefined();
});

test('searchFunctionKeys puts the exact name first and narrows by tier', () => {
  const found = searchFunctionKeys('quinolone');

  expect(found[0]?.id).toBe('quinolone_acid');
  expect(found.map((key) => key.id)).toContain('quinolin_4_one');
  expect(searchFunctionKeys('2-pyridone')[0]?.id).toBe('pyridin_2_one');
  expect(
    searchFunctionKeys('pyridone', { tier: 'onDemand' }).every(
      (key) => key.tier === 'onDemand',
    ),
  ).toBe(true);
  expect(searchFunctionKeys('lactam', { limit: 2 })).toHaveLength(2);
  expect(searchFunctionKeys('no such group')).toStrictEqual([]);
});

test('getRecordBit places each key where a molecule record holds it', () => {
  const first = keys[0] as FunctionKey;
  const last = keys[511] as FunctionKey;
  const onDemand = keys.find((key) => key.tier === 'onDemand') as FunctionKey;

  expect(getRecordBit(first)).toStrictEqual({ word: 32, mask: 1 << 31 });
  expect(getRecordBit(last)).toStrictEqual({ word: 47, mask: 1 });
  expect(getRecordBit(onDemand)).toBeUndefined();

  for (const key of keys.filter((each) => each.tier === 'existingPlane')) {
    const bit = key.bit ?? -1;
    const base = key.fingerprint === 'screen' ? 16 : 0;

    expect(getRecordBit(key)).toStrictEqual({
      word: base + (bit >> 5),
      mask: 1 << (31 - (bit & 31)),
    });
  }

  expect(getRecordBit(keyNamed('uracil'))?.word).toBeGreaterThanOrEqual(32);
});
