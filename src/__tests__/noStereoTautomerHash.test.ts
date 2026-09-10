import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import {
  NO_HASH,
  getNoStereoTautomerHash,
  getNoStereoTautomerHashes,
} from '../index.ts';

import { fromSmiles, readIdCodes, strongHash } from './fixture.ts';

// Canonizing a generic tautomer is far cheaper than a fingerprint, but still not free, so the
// cross-check runs on a slice.
const idCodes = readIdCodes().slice(0, 250);

/**
 * The hash `openchemlib-js` yields for the same molecule, the long way round.
 * @param idCode - The molecule to hash.
 * @returns Its no-stereo tautomer hash.
 */
function referenceHash(idCode: string): bigint {
  return strongHash(
    OCL.CanonizerUtil.getIDCode(
      OCL.Molecule.fromIDCode(idCode, false),
      OCL.CanonizerUtil.NOSTEREO_TAUTOMER,
    ),
  );
}

test('every hash matches openchemlib-js CanonizerUtil NOSTEREO_TAUTOMER', () => {
  const hashes = getNoStereoTautomerHashes(idCodes);

  expect(hashes).toHaveLength(idCodes.length);

  for (let i = 0; i < idCodes.length; i++) {
    expect([i, hashes[i]]).toStrictEqual([
      i,
      referenceHash(idCodes[i] as string),
    ]);
  }
  // A handful of the fixture molecules have so many tautomeric sites that OpenChemLib gives up
  // enumerating them; both builds must give up identically, which is what the slice covers.
}, 120_000);

// The two properties the hash exists for. Both pairs are the same constitution drawn differently,
// and a hash that told them apart would be no use as an identity column.
test('the keto and enol forms of pentan-3-one hash the same', () => {
  const keto = getNoStereoTautomerHash(fromSmiles('CCC(=O)CC'));
  const enol = getNoStereoTautomerHash(fromSmiles('CCC(O)=CC'));

  expect(keto).toBe(enol);
  expect(keto).not.toBe(NO_HASH);
});

test('2-pyridone and 2-hydroxypyridine hash the same', () => {
  expect(getNoStereoTautomerHash(fromSmiles('O=c1cccc[nH]1'))).toBe(
    getNoStereoTautomerHash(fromSmiles('Oc1ccccn1')),
  );
});

test('both enantiomers of 2-chlorobutane hash as the unassigned molecule', () => {
  const flat = getNoStereoTautomerHash(fromSmiles('CC(Cl)CC'));

  expect(getNoStereoTautomerHash(fromSmiles('C[C@H](Cl)CC'))).toBe(flat);
  expect(getNoStereoTautomerHash(fromSmiles('C[C@@H](Cl)CC'))).toBe(flat);
});

test('different constitutions hash differently', () => {
  const benzene = getNoStereoTautomerHash(fromSmiles('c1ccccc1'));
  const pyridine = getNoStereoTautomerHash(fromSmiles('c1ccncc1'));

  expect(benzene).not.toBe(pyridine);
});

test('the hashes of 250 distinct molecules are 250 distinct values', () => {
  const hashes = getNoStereoTautomerHashes(idCodes);
  const distinct = new Set<bigint>();
  for (const hash of hashes) {
    distinct.add(hash);
  }

  expect(distinct.size).toBe(idCodes.length);
  expect(distinct.has(NO_HASH)).toBe(false);
}, 60_000);

test('largestFragmentOnly hashes a sodium salt as its parent acid', () => {
  const salt = fromSmiles('CC(=O)[O-].[Na+]');
  const acid = fromSmiles('CC(=O)O');

  expect(
    getNoStereoTautomerHash(salt, { largestFragmentOnly: true }),
  ).toStrictEqual(getNoStereoTautomerHash(acid));
  // without it the counter-ion is part of the structure being hashed
  expect(getNoStereoTautomerHash(salt)).not.toBe(getNoStereoTautomerHash(acid));
});

test('an unparsable idcode gets NO_HASH', () => {
  const hashes = getNoStereoTautomerHashes(['gCi@DDfZ@@', '', 'C1=CC=CC=C1']);

  expect(hashes[0]).not.toBe(NO_HASH);
  expect(hashes[1]).toBe(NO_HASH);
  expect(hashes[2]).toBe(NO_HASH);
});

test('an empty array gives no hashes', () => {
  expect(getNoStereoTautomerHashes([])).toHaveLength(0);
});

test('getNoStereoTautomerHash is the one-molecule form of getNoStereoTautomerHashes', () => {
  const batch = getNoStereoTautomerHashes(idCodes.slice(0, 20));
  for (let i = 0; i < 20; i++) {
    expect([i, getNoStereoTautomerHash(idCodes[i] as string)]).toStrictEqual([
      i,
      batch[i],
    ]);
  }
});

test('the hash differs from the molecule own idcode hash when a tautomer is possible', () => {
  // pentan-3-one: its generic tautomer is a different structure, so a plain idcode hash would not
  // put the enol on the same key
  const idCode = fromSmiles('CCC(=O)CC');

  expect(getNoStereoTautomerHash(idCode)).not.toBe(strongHash(idCode));
});
