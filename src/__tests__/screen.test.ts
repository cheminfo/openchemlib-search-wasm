import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import {
  INDEX_WORDS,
  SubstructureResult,
  getIndexes,
  getQueryIndex,
  getQueryScreen,
  getScreen,
  getScreens,
  substructureSearch,
} from '../index.ts';

import { QUERIES, readIdCodes } from './fixture.ts';

const idCodes = readIdCodes();
const keys = readScreenKeys();
const indexes = getIndexes(idCodes);
const screens = getScreens(idCodes);

/**
 * The 512 key idcodes, read from the Java source that freezes them, so the cross-check below does
 * not restate the list.
 * @returns The key idcodes, in bit order.
 */
function readScreenKeys(): string[] {
  const source = readFileSync(
    join(
      import.meta.dirname,
      '../../java/src/main/java/org/openchemlib/wasm/ScreenKeys.java',
    ),
    'utf8',
  );
  return Array.from(
    source.matchAll(/^ {4}"(?<idCode>(?:[^"\\]|\\.)*)",/gm),
    (match) => (match.groups?.idCode as string).replaceAll('\\\\', '\\'),
  );
}

/**
 * The screen as openchemlib-js computes it: every key matched in OpenChemLib's index match mode,
 * the mode FragFp matches its own keys in.
 * @param idCode - The molecule to screen.
 * @param keyFragments - The parsed keys.
 * @returns Sixteen words.
 */
function referenceScreen(
  idCode: string,
  keyFragments: OCL.Molecule[],
): number[] {
  const searcher = new OCL.SSSearcher({
    matchDBondToDelocalized: true,
    matchAromDBondToDelocalized: false,
  });
  searcher.setMolecule(OCL.Molecule.fromIDCode(idCode, false));
  const words = new Array<number>(INDEX_WORDS).fill(0);
  for (let i = 0; i < keyFragments.length; i++) {
    searcher.setFragment(keyFragments[i] as OCL.Molecule);
    if (searcher.isFragmentInMolecule()) {
      words[i >> 5] = (words[i >> 5] as number) | (1 << (31 - (i & 31)));
    }
  }
  return words;
}

/**
 * Whether every bit of a query's words is set in a molecule's.
 * @param query - The query's sixteen words.
 * @param molecule - The molecule's sixteen words.
 * @returns True when the molecule passes the prescreen.
 */
function isSubset(query: Int32Array, molecule: Int32Array): boolean {
  for (let word = 0; word < INDEX_WORDS; word++) {
    const bits = query[word] as number;
    if ((bits & (molecule[word] as number)) !== bits) return false;
  }
  return true;
}

/**
 * A query idcode from SMILES, with query features set by `edit`.
 * @param smiles - The query's structure.
 * @param edit - Sets the query features.
 * @returns The query, as an idcode.
 */
function queryIdCode(
  smiles: string,
  edit: (molecule: OCL.Molecule) => void = () => undefined,
): string {
  const molecule = OCL.Molecule.fromSmiles(smiles);
  molecule.setFragment(true);
  edit(molecule);
  return molecule.getIDCode();
}

const EXCLUDE_GROUP = queryIdCode('c1ccccc1', (molecule) =>
  molecule.setAtomQueryFeature(0, OCL.Molecule.cAtomQFExcludeGroup, true),
);
const FORMAL_ORDER = queryIdCode('CC', (molecule) =>
  molecule.setBondQueryFeature(0, OCL.Molecule.cBondQFMatchFormalOrder, true),
);
const PLAIN_CARBON = queryIdCode('C');
const CARBON_IN_FIVE_RING = queryIdCode('C', (molecule) =>
  molecule.setAtomQueryFeature(0, OCL.Molecule.cAtomQFRingSize5, true),
);
const NITROGEN_IN_SIX_RING = queryIdCode('N', (molecule) =>
  molecule.setAtomQueryFeature(0, OCL.Molecule.cAtomQFRingSize6, true),
);
const CARBON_NOT_IN_RING = queryIdCode('CO', (molecule) =>
  molecule.setAtomQueryFeature(0, OCL.Molecule.cAtomQFRingSize0, true),
);

const SOUNDNESS_QUERIES = [
  ...QUERIES.map(({ name, idCode }) => ({ name, idCode })),
  { name: 'benzene with an exclude group', idCode: EXCLUDE_GROUP },
  { name: 'C-C matching formal bond order', idCode: FORMAL_ORDER },
  { name: 'C in a 5-ring', idCode: CARBON_IN_FIVE_RING },
  { name: 'N in a 6-ring', idCode: NITROGEN_IN_SIX_RING },
  { name: 'C-O, the C in no ring', idCode: CARBON_NOT_IN_RING },
];

test('the dictionary holds 512 keys', () => {
  expect(keys).toHaveLength(512);
});

// The cross-check that makes a change in OpenChemLib's matching a red test: the screen is nothing
// but each key matched as openchemlib-js matches it.
test('every screen word matches openchemlib-js matching each key', () => {
  const keyFragments = keys.map((key) => OCL.Molecule.fromIDCode(key, false));
  for (let i = 0; i < 40; i++) {
    const expected = referenceScreen(idCodes[i] as string, keyFragments);
    const actual = Array.from(screens[i] as Int32Array);

    expect([i, actual]).toStrictEqual([i, expected]);
  }
});

test('getScreen is the one-molecule form of getScreens', () => {
  for (let i = 0; i < 5; i++) {
    expect(Array.from(getScreen(idCodes[i] as string))).toStrictEqual(
      Array.from(screens[i] as Int32Array),
    );
  }
});

test('every screen starts on an 8-byte boundary', () => {
  for (const screen of getScreens(idCodes.slice(0, 5))) {
    expect(screen.byteOffset % 8).toBe(0);
  }
});

test('an idcode that will not parse gets sixteen zeros', () => {
  expect(Array.from(getScreen(''))).toStrictEqual(
    new Array<number>(INDEX_WORDS).fill(0),
  );
});

// The property a prescreen exists for: it may only ever drop molecules the query does not match.
test.each(SOUNDNESS_QUERIES)(
  'every molecule $name matches holds its FragFp and its screen',
  ({ idCode }) => {
    const { result } = substructureSearch(idCode, idCodes);
    const queryIndex = getQueryIndex(idCode);
    const queryScreen = getQueryScreen(idCode);
    let matches = 0;
    let misses = 0;
    for (let i = 0; i < idCodes.length; i++) {
      if (result[i] !== SubstructureResult.match) continue;
      matches++;
      if (
        !isSubset(queryIndex, indexes[i] as Int32Array) ||
        !isSubset(queryScreen, screens[i] as Int32Array)
      ) {
        misses++;
      }
    }

    expect(matches).toBeGreaterThan(0);
    expect(misses).toBe(0);
  },
);

test('the screen lets fewer non-matching molecules through than FragFp alone', () => {
  let fragFpOnly = 0;
  let both = 0;
  for (const { idCode } of SOUNDNESS_QUERIES) {
    const { result } = substructureSearch(idCode, idCodes);
    const queryIndex = getQueryIndex(idCode);
    const queryScreen = getQueryScreen(idCode);
    for (let i = 0; i < idCodes.length; i++) {
      if (result[i] === SubstructureResult.match) continue;
      if (!isSubset(queryIndex, indexes[i] as Int32Array)) continue;
      fragFpOnly++;
      if (isSubset(queryScreen, screens[i] as Int32Array)) both++;
    }
  }

  expect(both).toBeLessThan(fragFpOnly);
});

test('a query without exclude groups or formal-order bonds has OpenChemLib’s own FragFp', () => {
  for (const { idCode } of QUERIES) {
    const fragment = OCL.Molecule.fromIDCode(idCode, false);
    fragment.setFragment(true);
    const expected = new OCL.SSSearcherWithIndex()
      .createIndex(fragment)
      .map((word) => word | 0);

    expect(Array.from(getQueryIndex(idCode))).toStrictEqual(expected);
  }
});

// Actelion/openchemlib#177: OpenChemLib's own query fingerprint keeps the Kekulé bonds of the ring
// the exclude group cuts, and rejects pyridine.
test('benzene with an exclude group passes pyridine', () => {
  const pyridine = 'gFx@@eJf`@@P';
  const [pyridineIndex] = getIndexes([pyridine]);

  expect(substructureSearch(EXCLUDE_GROUP, [pyridine]).result[0]).toBe(
    SubstructureResult.match,
  );
  expect(
    isSubset(getQueryIndex(EXCLUDE_GROUP), pyridineIndex as Int32Array),
  ).toBe(true);
  expect(isSubset(getQueryScreen(EXCLUDE_GROUP), getScreen(pyridine))).toBe(
    true,
  );
});

test('a "match formal bond order" bond gives no bits', () => {
  const zeros = new Array<number>(INDEX_WORDS).fill(0);

  expect(Array.from(getQueryIndex(FORMAL_ORDER))).toStrictEqual(zeros);
  expect(Array.from(getQueryScreen(FORMAL_ORDER))).toStrictEqual(zeros);
});

// Actelion/openchemlib#178: OpenChemLib skips ring sizes when it matches a key in a query, so the
// screen applies them itself.
test('a ring size adds screen bits to a plain carbon query', () => {
  const plain = getQueryScreen(PLAIN_CARBON);
  const inFiveRing = getQueryScreen(CARBON_IN_FIVE_RING);

  expect(isSubset(plain, inFiveRing)).toBe(true);
  expect(Array.from(plain)).not.toStrictEqual(Array.from(inFiveRing));
});

test('an unparsable query is reported as such', () => {
  expect(() => getQueryScreen('')).toThrow('"" is not a valid query idcode');
  expect(() => getQueryIndex('')).toThrow('"" is not a valid query idcode');
});
