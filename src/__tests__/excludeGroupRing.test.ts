import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import { SubstructureResult, substructureSearch } from '../index.ts';

/**
 * A SMARTS as a query idcode, parsed by OpenChemLib itself.
 * @param smarts - The SMARTS.
 * @returns The query's idcode.
 */
function smartsIdCode(smarts: string): string {
  const query = OCL.Molecule.fromSmiles(smarts, { smartsMode: 'smarts' });
  query.setFragment(true);
  return query.getIDCode();
}

/**
 * The idcodes of SMILES.
 * @param smiles - The molecules.
 * @returns Their idcodes, in order.
 */
function idCodes(smiles: string[]): string[] {
  return smiles.map((text) => OCL.Molecule.fromSmiles(text).getIDCode());
}

const { match, noMatch } = SubstructureResult;

// An exclude group that closes a ring through atoms of the main fragment once made OpenChemLib require
// those atoms to lie in a ring of that size, so these queries matched nothing at all. The fix is the
// one class in java/overlay; openchemlib-js still finds no match for the first query in butane.
test('an exclude group closing a ring through the main fragment excludes only that ring', () => {
  const notInCyclopentane = smartsIdCode('[C;!$(C1CCCC1)]');
  const result = substructureSearch(
    notInCyclopentane,
    idCodes(['CCCC', 'C1CCCC1', 'CC1CCCC1', 'C1CCC2(C1)CCCC2']),
  ).result;

  expect(Array.from(result)).toStrictEqual([match, noMatch, match, noMatch]);
});

test('an exclude group bonded to two main atoms is not a ring the match needs', () => {
  // N-C with no C=C on the N: one exclusion is a C bonded to the N and double-bonded to the main C,
  // which closes a three-membered ring in the query. The idcode holds a DEL (0x7F), valid in idcodes.
  const amine = 'gFx@@eSqUJ`]LLTyKW\\c\u007FEabgIZ}Jqh';
  const result = substructureSearch(
    amine,
    idCodes(['CCN(CC)CC', 'C=CN(C)C', 'NCC(=O)O']),
  ).result;

  expect(Array.from(result)).toStrictEqual([match, noMatch, match]);
});
