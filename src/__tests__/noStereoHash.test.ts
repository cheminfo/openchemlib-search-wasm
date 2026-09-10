import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import {
  NO_HASH,
  getNoStereoHash,
  getNoStereoHashes,
  getNoStereoTautomerHash,
} from '../index.ts';

import { fromSmiles, readIdCodes, strongHash } from './fixture.ts';

// Canonizing without the tautomer enumeration is cheap enough to cross-check the whole fixture.
const idCodes = readIdCodes();

/**
 * The hash `openchemlib-js` yields for the same molecule, the long way round.
 * @param idCode - The molecule to hash.
 * @returns Its no-stereo hash.
 */
function referenceHash(idCode: string): bigint {
  return strongHash(
    OCL.CanonizerUtil.getIDCode(
      OCL.Molecule.fromIDCode(idCode, false),
      OCL.CanonizerUtil.NOSTEREO,
    ),
  );
}

test('every hash matches openchemlib-js CanonizerUtil NOSTEREO', () => {
  const hashes = getNoStereoHashes(idCodes);

  expect(hashes).toHaveLength(idCodes.length);

  for (let i = 0; i < idCodes.length; i++) {
    expect([i, hashes[i]]).toStrictEqual([
      i,
      referenceHash(idCodes[i] as string),
    ]);
  }
}, 120_000);

// The one property the hash exists for: stereochemistry is dropped, nothing else is.
test('both enantiomers of 2-chlorobutane hash as the unassigned molecule', () => {
  const flat = getNoStereoHash(fromSmiles('CC(Cl)CC'));

  expect(getNoStereoHash(fromSmiles('C[C@H](Cl)CC'))).toBe(flat);
  expect(getNoStereoHash(fromSmiles('C[C@@H](Cl)CC'))).toBe(flat);
  expect(flat).not.toBe(NO_HASH);
});

test('the two double-bond isomers of but-2-ene hash the same', () => {
  const cis = getNoStereoHash(fromSmiles(String.raw`C/C=C\C`));
  const trans = getNoStereoHash(fromSmiles('C/C=C/C'));

  expect(cis).toBe(trans);
  expect(cis).not.toBe(NO_HASH);
});

// What separates it from the tautomer hash: the tautomers stay apart.
test('the keto and enol forms of pentan-3-one hash differently', () => {
  const keto = fromSmiles('CCC(=O)CC');
  const enol = fromSmiles('CCC(O)=CC');

  expect(getNoStereoHash(keto)).not.toBe(getNoStereoHash(enol));
  // the tautomer hash is the one that puts them on the same key
  expect(getNoStereoTautomerHash(keto)).toBe(getNoStereoTautomerHash(enol));
});

test('2-pyridone and 2-hydroxypyridine hash differently', () => {
  expect(getNoStereoHash(fromSmiles('O=c1cccc[nH]1'))).not.toBe(
    getNoStereoHash(fromSmiles('Oc1ccccn1')),
  );
});

test('different constitutions hash differently', () => {
  const benzene = getNoStereoHash(fromSmiles('c1ccccc1'));
  const pyridine = getNoStereoHash(fromSmiles('c1ccncc1'));

  expect(benzene).not.toBe(pyridine);
});

test('the hashes of the fixture molecules are all distinct', () => {
  const hashes = getNoStereoHashes(idCodes);
  const distinct = new Set<bigint>();
  for (const hash of hashes) {
    distinct.add(hash);
  }

  expect(distinct.size).toBe(idCodes.length);
  expect(distinct.has(NO_HASH)).toBe(false);
}, 60_000);

test('a stereo-free molecule hashes as its own idcode', () => {
  // benzene has nothing to strip, so stripping and re-canonizing gives the idcode back
  const idCode = fromSmiles('c1ccccc1');

  expect(getNoStereoHash(idCode)).toBe(strongHash(idCode));
});

test('largestFragmentOnly hashes a sodium salt as its parent acid', () => {
  const salt = fromSmiles('CC(=O)[O-].[Na+]');
  const acid = fromSmiles('CC(=O)O');

  expect(getNoStereoHash(salt, { largestFragmentOnly: true })).toStrictEqual(
    getNoStereoHash(acid),
  );
  // without it the counter-ion is part of the structure being hashed
  expect(getNoStereoHash(salt)).not.toBe(getNoStereoHash(acid));
});

test('an unparsable idcode gets NO_HASH', () => {
  const hashes = getNoStereoHashes(['gCi@DDfZ@@', '', 'C1=CC=CC=C1']);

  expect(hashes[0]).not.toBe(NO_HASH);
  expect(hashes[1]).toBe(NO_HASH);
  expect(hashes[2]).toBe(NO_HASH);
});

test('an empty array gives no hashes', () => {
  expect(getNoStereoHashes([])).toHaveLength(0);
});

test('getNoStereoHash is the one-molecule form of getNoStereoHashes', () => {
  const batch = getNoStereoHashes(idCodes.slice(0, 20));
  for (let i = 0; i < 20; i++) {
    expect([i, getNoStereoHash(idCodes[i] as string)]).toStrictEqual([
      i,
      batch[i],
    ]);
  }
});
