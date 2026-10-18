import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import { getMoleculeRecords, getNoStereoTautomerIdCodes } from '../index.ts';

import { fromSmiles, readIdCodes, referenceIdCode } from './fixture.ts';

// The fixture is cross-checked whole in moleculeRecords.test.ts. Its idcodes are canonical already
// and survive a round trip, so on their own they cannot tell canonizing from echoing the input;
// tautomer keys mostly do not survive one.
test('idcodes a round trip changes match openchemlib-js too', () => {
  const keys = getNoStereoTautomerIdCodes(readIdCodes().slice(0, 300), {
    maxTautomers: 50,
  });
  const canonical = getMoleculeRecords(keys, { maxTautomers: 10 }).idCodes;
  let changed = 0;
  for (let i = 0; i < keys.length; i++) {
    const expected = referenceIdCode(keys[i] as string);

    expect([i, canonical[i]]).toStrictEqual([i, expected]);

    if (expected !== keys[i]) changed++;
  }

  expect(changed).toBe(182);
}, 60_000);

const STEREO_CASES = [
  { name: 'an R centre', smiles: 'C[C@H](Cl)CC' },
  { name: 'its S enantiomer', smiles: 'C[C@@H](Cl)CC' },
  { name: 'an unknown centre', smiles: 'CC(Cl)CC' },
  { name: 'an E double bond', smiles: 'C/C=C/C' },
  { name: 'a Z double bond', smiles: String.raw`C/C=C\C` },
  { name: 'an unknown double bond', smiles: 'CC=CC' },
  { name: 'explicit deuterium on a centre', smiles: '[2H][C@@](C)(O)CC' },
  { name: 'its enantiomer', smiles: '[2H][C@](C)(O)CC' },
  { name: 'a sodium salt', smiles: 'C[C@H](N)C(=O)[O-].[Na+]' },
  { name: 'a quaternary nitrogen centre', smiles: 'C[N@+](CC)(CCC)CCCC' },
  { name: 'a carbon-13 label', smiles: '[13CH3]C(=O)O' },
  { name: 'a deuterium label', smiles: '[2H]C([2H])([2H])O' },
  { name: 'a cis ring', smiles: 'C[C@H]1CC[C@@H](C)CC1' },
  { name: 'a trans ring', smiles: 'C[C@H]1CC[C@H](C)CC1' },
];

test.each(STEREO_CASES)('$name matches openchemlib-js', ({ smiles }) => {
  const idCode = fromSmiles(smiles);
  const records = getMoleculeRecords([idCode]);
  const parsed = OCL.Molecule.fromIDCode(idCode, false);

  expect(records.idCodes[0]).toBe(referenceIdCode(idCode));
  expect(records.atomCounts[0]).toBe(parsed.getAllAtoms());
  expect(records.weights[0]).toBe(parsed.getMolecularFormula().relativeWeight);
});

// Canonizing the coordinate-free molecule gets 10 of these 14 wrong.
test('the cases are ones the coordinate-free canonization gets wrong', () => {
  let wrong = 0;
  for (const { smiles } of STEREO_CASES) {
    const idCode = fromSmiles(smiles);
    const parsed = OCL.Molecule.fromIDCode(idCode, false);
    if (new OCL.Canonizer(parsed).getIDCode() !== referenceIdCode(idCode)) {
      wrong++;
    }
  }

  expect(wrong).toBe(10);
});

test('stereo survives: centres and double bonds keep their configuration', () => {
  const canonical = getMoleculeRecords(
    STEREO_CASES.slice(0, 6).map(({ smiles }) => fromSmiles(smiles)),
  ).idCodes;

  expect(new Set(canonical).size).toBe(6);
});
