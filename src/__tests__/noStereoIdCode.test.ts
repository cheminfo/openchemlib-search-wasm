import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import {
  NO_ID_CODE,
  getNoStereoHash,
  getNoStereoIdCode,
  getNoStereoIdCodes,
  getNoStereoTautomerHash,
  getNoStereoTautomerIdCode,
  getNoStereoTautomerIdCodes,
} from '../index.ts';

import { fromSmiles, readIdCodes, strongHash } from './fixture.ts';

const idCodes = readIdCodes().slice(0, 250);

/**
 * The canonical form a caller holding a molecule gets from openchemlib-js, which is the answer these
 * functions must reproduce. See the note in noStereoHash.test.ts for why the parse invents
 * coordinates.
 * @param idCode - The molecule to canonize.
 * @param type - `CanonizerUtil.NOSTEREO` or `CanonizerUtil.NOSTEREO_TAUTOMER`.
 * @returns Its canonical idcode.
 */
function reference(idCode: string, type: number): string {
  return OCL.CanonizerUtil.getIDCode(
    OCL.Molecule.fromIDCode(idCode, true),
    type,
  );
}

test('every no-stereo idcode matches openchemlib-js CanonizerUtil NOSTEREO', () => {
  const canonical = getNoStereoIdCodes(idCodes);

  expect(canonical).toHaveLength(idCodes.length);

  for (let i = 0; i < idCodes.length; i++) {
    expect([i, canonical[i]]).toStrictEqual([
      i,
      reference(idCodes[i] as string, OCL.CanonizerUtil.NOSTEREO),
    ]);
  }
}, 60_000);

test('every no-stereo tautomer idcode matches openchemlib-js NOSTEREO_TAUTOMER', () => {
  const canonical = getNoStereoTautomerIdCodes(idCodes);

  expect(canonical).toHaveLength(idCodes.length);

  for (let i = 0; i < idCodes.length; i++) {
    expect([i, canonical[i]]).toStrictEqual([
      i,
      reference(idCodes[i] as string, OCL.CanonizerUtil.NOSTEREO_TAUTOMER),
    ]);
  }
}, 120_000);

// The defect this pair of functions was introduced alongside: canonizing a coordinate-free molecule
// by stripping its stereo invents a double-bond configuration instead of removing it, so a compound
// drawn without one keyed differently from the same compound drawn with it.
test('a compound keys the same whether its double-bond stereo was drawn', () => {
  for (const [drawn, undrawn] of [
    [String.raw`CCCCCCCC/C=C\CCCCCCCC(=O)O`, 'CCCCCCCCC=CCCCCCCCC(=O)O'], // oleic acid
    ['OC(=O)/C=C/c1ccccc1', 'OC(=O)C=Cc1ccccc1'], // cinnamic acid
    ['C/C=C/C', 'CC=CC'], // but-2-ene
  ]) {
    const a = fromSmiles(drawn as string);
    const b = fromSmiles(undrawn as string);

    expect([drawn, getNoStereoIdCode(a)]).toStrictEqual([
      drawn,
      getNoStereoIdCode(b),
    ]);
    expect([drawn, getNoStereoHash(a)]).toStrictEqual([
      drawn,
      getNoStereoHash(b),
    ]);
  }
});

test('E and Z key the same, and neither is turned into the other', () => {
  const e = getNoStereoIdCode(fromSmiles('C/C=C/C'));
  const z = getNoStereoIdCode(fromSmiles(String.raw`C/C=C\C`));

  expect(e).toBe(z);
  // the stripped form carries no configuration at all
  expect(e).toBe(reference(fromSmiles('CC=CC'), OCL.CanonizerUtil.NOSTEREO));
});

test('the hash is the hash of the idcode, for both forms', () => {
  for (const idCode of idCodes.slice(0, 40)) {
    expect([idCode, strongHash(getNoStereoIdCode(idCode))]).toStrictEqual([
      idCode,
      getNoStereoHash(idCode),
    ]);
    expect([
      idCode,
      strongHash(getNoStereoTautomerIdCode(idCode)),
    ]).toStrictEqual([idCode, getNoStereoTautomerHash(idCode)]);
  }
}, 30_000);

test('the keto and enol forms give one tautomer idcode, and two no-stereo ones', () => {
  const keto = fromSmiles('CCC(=O)CC');
  const enol = fromSmiles('CCC(O)=CC');

  expect(getNoStereoTautomerIdCode(keto)).toBe(getNoStereoTautomerIdCode(enol));
  expect(getNoStereoIdCode(keto)).not.toBe(getNoStereoIdCode(enol));
});

test('largestFragmentOnly canonizes a sodium salt as its parent acid', () => {
  const salt = fromSmiles('CC(=O)[O-].[Na+]');
  const acid = fromSmiles('CC(=O)O');

  expect(getNoStereoIdCode(salt, { largestFragmentOnly: true })).toBe(
    getNoStereoIdCode(acid),
  );
  expect(getNoStereoIdCode(salt)).not.toBe(getNoStereoIdCode(acid));
});

test('an unreadable idcode gets NO_ID_CODE without costing the batch', () => {
  const good = idCodes[0] as string;

  expect(getNoStereoIdCode('')).toBe(NO_ID_CODE);
  expect(getNoStereoIdCode('zzzz')).toBe(NO_ID_CODE);
  expect(getNoStereoIdCodes([good, 'zzzz', good])).toStrictEqual([
    getNoStereoIdCode(good),
    NO_ID_CODE,
    getNoStereoIdCode(good),
  ]);
});

test('the single form is the one-molecule form of the batch', () => {
  const batch = getNoStereoIdCodes(idCodes.slice(0, 20));
  for (let i = 0; i < 20; i++) {
    expect([i, getNoStereoIdCode(idCodes[i] as string)]).toStrictEqual([
      i,
      batch[i],
    ]);
  }
});

test('an empty array gives no idcodes', () => {
  expect(getNoStereoIdCodes([])).toStrictEqual([]);
  expect(getNoStereoTautomerIdCodes([])).toStrictEqual([]);
});
