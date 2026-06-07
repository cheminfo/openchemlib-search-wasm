import { expect, test } from 'vitest';

import { Molecule, SDFileParser } from '#lib';

// A minimal two-record SDF document: ethane then propane, each with a `name`
// data field. Built inline so the test is self-contained.
const sdf = `ethane
  test

  2  1  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.7500    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0
M  END
> <name>
ethane

$$$$
propane
  test

  3  2  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.7500    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0
  2  3  1  0
M  END
> <name>
propane

$$$$
`;

test('parses two records, exposing molecule and field per record', () => {
  const parser = new SDFileParser(sdf, ['name']);

  expect(parser.next()).toBe(true);
  const ethane = parser.getMolecule();
  // The parsed molecule must match parsing the same molfile independently.
  expect(ethane.getIDCode()).toBe(
    Molecule.fromMolfile(parser.getNextMolFile()).getIDCode(),
  );
  expect(ethane.getAllAtoms()).toBe(2);
  expect(parser.getField('name')).toBe('ethane');

  expect(parser.next()).toBe(true);
  const propane = parser.getMolecule();
  expect(propane.getIDCode()).toBe(
    Molecule.fromMolfile(parser.getNextMolFile()).getIDCode(),
  );
  expect(propane.getAllAtoms()).toBe(3);
  expect(parser.getField('name')).toBe('propane');

  expect(propane.getIDCode()).not.toBe(ethane.getIDCode());

  expect(parser.next()).toBe(false);
});

test('getFieldData and getField agree for the scanned field', () => {
  const parser = new SDFileParser(sdf, ['name']);

  parser.next();
  expect(parser.getFieldData(0)).toBe('ethane');
  expect(parser.getField('name')).toBe('ethane');
  expect(parser.getField('missing')).toBeNull();
});
