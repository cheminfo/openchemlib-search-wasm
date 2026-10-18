import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import {
  SubstructureResult,
  getMoleculeSizes,
  getQueryAtomFloor,
  substructureSearch,
} from '../index.ts';

import { QUERIES, readIdCodes } from './fixture.ts';

const idCodes = readIdCodes();
const { atomCounts } = getMoleculeSizes(idCodes);

// Query features the floor has to read right: wildcards, atom lists, NOT-lists, explicit
// hydrogens, exclude groups, any and aromatic bonds, ring sizes.
const FEATURE_QUERIES = [
  'gOp@DjWkB@@Mi`',
  'gJY@DDfVhCYX`',
  'gFp@DiTt@@CZ@',
  'gOpHMDIToVD@@]SLYlbLRl@',
  'gFp@DiTt@@CFAFC`@',
  'gCe@@lduHGTsFYA@H@',
  'gOp@DjWkB@@MihsPp@',
  'gOp@DjWkB@@Oin@',
  String.raw`gOq@@drm\@@A}A@`,
  String.raw`gOx@@drm\@@A}AnxF`,
  'deTD@@QIemQej@@@O~pP',
  'gOx@@eLmXD@AmClH',
  'gFp@DiTvjhCUc|~o{y_`',
  'gKX@@eKcUPFqbqkQ~_W}|FbdkQ`',
  'gFp@DiTt@@CYbKF`',
  'gC``@dfZ@aM`',
  'eMhDRVC~D|',
  'gBP@DiVj`MbHmWCt|o@',
  'gCh`hEIWILtAuMVf@',
];

const ALL_QUERIES = [
  ...QUERIES.map(({ idCode }) => idCode),
  ...FEATURE_QUERIES,
];

/**
 * The same count in openchemlib-js: the query read as a fragment, its query features removed, its
 * atoms counted with plain hydrogens left out.
 * @param idCodeQuery - The query.
 * @returns Its atom floor.
 */
function referenceFloor(idCodeQuery: string): number {
  const query = OCL.Molecule.fromIDCode(idCodeQuery, false);
  query.setFragment(true);
  const matched = query.getCompactCopy();
  matched.removeQueryFeatures();
  let floor = 0;
  for (let atom = 0; atom < matched.getAllAtoms(); atom++) {
    if (matched.getAtomicNo(atom) !== 1 || matched.getAtomMass(atom) !== 0) {
      floor++;
    }
  }
  return floor;
}

/**
 * A query idcode from SMILES.
 * @param smiles - The query's structure.
 * @returns The query, as an idcode.
 */
function queryIdCode(smiles: string): string {
  const molecule = OCL.Molecule.fromSmiles(smiles);
  molecule.setFragment(true);
  return molecule.getIDCode();
}

test('every floor matches the same count in openchemlib-js', () => {
  for (const idCode of ALL_QUERIES) {
    expect([idCode, getQueryAtomFloor(idCode)]).toStrictEqual([
      idCode,
      referenceFloor(idCode),
    ]);
  }
});

test('the floors of the query-feature idcodes', () => {
  expect(
    FEATURE_QUERIES.map((idCode) => getQueryAtomFloor(idCode)),
  ).toStrictEqual([7, 5, 6, 7, 6, 4, 7, 7, 7, 7, 9, 7, 6, 5, 6, 4, 3, 4, 4]);
});

test('an exclude group does not count', () => {
  const idCode = 'deTD@@QIemQej@@@O~pP';

  expect(OCL.Molecule.fromIDCode(idCode, false).getAllAtoms()).toBe(10);
  expect(getQueryAtomFloor(idCode)).toBe(9);
});

test('a plain hydrogen does not count, a deuterium does', () => {
  expect(getQueryAtomFloor(queryIdCode('[H][H]'))).toBe(0);
  expect(getQueryAtomFloor(queryIdCode('[2H]c1ccccc1'))).toBe(7);
});

// The property the floor exists for: it may only ever skip molecules the query cannot match.
test.each(ALL_QUERIES)(
  'every fixture molecule %s matches holds at least the floor in atoms',
  (idCode) => {
    const floor = getQueryAtomFloor(idCode);
    const { result } = substructureSearch(idCode, idCodes);
    let below = 0;
    for (let i = 0; i < idCodes.length; i++) {
      if (
        result[i] === SubstructureResult.match &&
        (atomCounts[i] as number) < floor
      ) {
        below++;
      }
    }

    expect(below).toBe(0);
  },
);

test('the floor is reached: a 2-substituted pyridine matches a 7-atom molecule', () => {
  const idCode = 'gOx@@eLmXD@AmClH';
  const { result } = substructureSearch(idCode, idCodes);
  let smallest = Number.MAX_SAFE_INTEGER;
  for (let i = 0; i < idCodes.length; i++) {
    if (result[i] === SubstructureResult.match) {
      smallest = Math.min(smallest, atomCounts[i] as number);
    }
  }

  expect(getQueryAtomFloor(idCode)).toBe(7);
  expect(smallest).toBe(7);
});

test('a query with no atoms has a floor of 0', () => {
  expect(getQueryAtomFloor(new OCL.Molecule(0, 0).getIDCode())).toBe(0);
});

test('an unparsable query is reported as such', () => {
  expect(() => getQueryAtomFloor('')).toThrow('"" is not a valid query idcode');
  expect(() => getQueryAtomFloor('gFp@DiTt@@Bé')).toThrow(
    '"gFp@DiTt@@Bé" is not a valid query idcode',
  );
});
