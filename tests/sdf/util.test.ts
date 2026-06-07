import { expect, test } from 'vitest';

import { Molecule, Util } from '#lib';

// A diastereotopic id is the idcode of a molecule whose center atom carries a
// custom label ending in '*'. getDiastereotopicAtomIDs returns exactly those.
function firstDiastereotopicID(smiles: string): string {
  const molecule = Molecule.fromSmiles(smiles);
  molecule.addImplicitHydrogens();
  const ids = molecule.getDiastereotopicAtomIDs();
  return ids[0];
}

test('returns one HOSE code per sphere, deterministically', () => {
  const id = firstDiastereotopicID('C1CCCCC1C');

  const hoses = Util.getHoseCodesFromDiastereotopicID(id, {
    maxSphereSize: 3,
    type: 0,
  });

  expect(Array.from(hoses)).toHaveLength(3);
  // The innermost sphere is the canonical idcode of the marked atom's fragment.
  for (const hose of hoses) {
    expect(typeof hose).toBe('string');
    expect(hose.length).toBeGreaterThan(0);
  }

  // Same inputs must give the same output.
  const again = Util.getHoseCodesFromDiastereotopicID(id, {
    maxSphereSize: 3,
    type: 0,
  });
  expect(Array.from(again)).toStrictEqual(Array.from(hoses));
});

test('smaller sphere size yields a prefix of the larger result', () => {
  const id = firstDiastereotopicID('C1CCCCC1C');

  const small = Array.from(
    Util.getHoseCodesFromDiastereotopicID(id, { maxSphereSize: 2, type: 0 }),
  );
  const large = Array.from(
    Util.getHoseCodesFromDiastereotopicID(id, { maxSphereSize: 4, type: 0 }),
  );

  expect(small).toHaveLength(2);
  expect(large.slice(0, 2)).toStrictEqual(small);
});

test('defaults maxSphereSize to 5 and type to 0 when options are omitted', () => {
  const id = firstDiastereotopicID('CCCCCCCC');

  const withDefaults = Array.from(
    Util.getHoseCodesFromDiastereotopicID(id),
  );
  const explicit = Array.from(
    Util.getHoseCodesFromDiastereotopicID(id, { maxSphereSize: 5, type: 0 }),
  );

  expect(withDefaults).toStrictEqual(explicit);
  expect(withDefaults).toHaveLength(5);
});
