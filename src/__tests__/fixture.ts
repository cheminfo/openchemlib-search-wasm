import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as OCL from 'openchemlib';

/**
 * The six queries the benchmark uses, as SMILES and as the idcodes the searches take. They range from
 * a query that matches most of the corpus (benzene) to one that matches almost none (sulfonamide),
 * so a bug that biases the match rule in either direction shows up.
 */
export const QUERIES = [
  { name: 'benzene', smiles: 'c1ccccc1', idCode: 'gFp@DiTt@@B' },
  { name: 'pyridine', smiles: 'c1ccncc1', idCode: 'gFx@@eJf`@@P' },
  { name: 'carboxyl', smiles: 'C(=O)O', idCode: 'eMDARVB' },
  { name: 'anilide', smiles: 'C(=O)Nc1ccccc1', idCode: 'difH@DAIVUxV`@@B' },
  { name: 'sulfonamide', smiles: 'S(=O)(=O)N', idCode: 'gChhMD@bNlA@' },
  {
    name: 'naphthalene',
    smiles: 'c1ccc2ccccc2c1',
    idCode: 'det@@DjYUX^d@@@@B',
  },
];

/**
 * Real idcodes sampled evenly from the reference.cheminfo.org corpus (mean length 38.7 characters,
 * drug-like structures rather than fragments), so the cross-checks below run against the same kind
 * of input the library is built for.
 * @returns The fixture idcodes.
 */
export function readIdCodes(): string[] {
  return readFileSync(join(import.meta.dirname, 'data/idcodes.txt'), 'utf8')
    .split('\n')
    .filter(Boolean);
}

/**
 * Runs the substructure scan the way `openchemlib-sqlite` runs it today, with openchemlib-js. This
 * is the reference the WASM build must reproduce exactly.
 * @param idCodeQuery - The query, as an idcode.
 * @param idCodes - The molecules to test.
 * @returns One code per molecule, using the same 1 = match / 2 = no match encoding as `substructureSearch`.
 */
export function referenceSubstructure(
  idCodeQuery: string,
  idCodes: string[],
): Uint8Array {
  const query = OCL.Molecule.fromIDCode(idCodeQuery);
  query.setFragment(true);
  const searcher = new OCL.SSSearcher();
  searcher.setFragment(query);
  const result = new Uint8Array(idCodes.length);
  for (let i = 0; i < idCodes.length; i++) {
    searcher.setMolecule(OCL.Molecule.fromIDCode(idCodes[i] as string, false));
    result[i] = searcher.isFragmentInMolecule() ? 1 : 2;
  }
  return result;
}

/**
 * The Tanimoto similarities openchemlib-js computes on the same 512-bit FragFp.
 * @param idCodeQuery - The query, as an idcode.
 * @param idCodes - The molecules to compare against.
 * @returns One similarity per molecule.
 */
export function referenceSimilarity(
  idCodeQuery: string,
  idCodes: string[],
): Float32Array {
  const searcher = new OCL.SSSearcherWithIndex();
  const queryIndex = searcher.createIndex(
    OCL.Molecule.fromIDCode(idCodeQuery, false),
  );
  const result = new Float32Array(idCodes.length);
  for (let i = 0; i < idCodes.length; i++) {
    const index = searcher.createIndex(
      OCL.Molecule.fromIDCode(idCodes[i] as string, false),
    );
    result[i] = OCL.SSSearcherWithIndex.getSimilarityTanimoto(
      queryIndex,
      index,
    );
  }
  return result;
}

/**
 * Counts the entries holding a given result code.
 * @param result - A result buffer.
 * @param code - The code to count.
 * @returns How many entries hold it.
 */
export function countCode(result: Uint8Array, code: number): number {
  let count = 0;
  for (const value of result) {
    if (value === code) count++;
  }
  return count;
}

/**
 * The index of the first entry where two result buffers disagree.
 * @param actual - The buffer under test.
 * @param expected - The reference buffer.
 * @returns The first differing index, or -1 when they agree everywhere.
 */
export function firstDifference(
  actual: Uint8Array,
  expected: Uint8Array,
): number {
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) return i;
  }
  return -1;
}

const MASK_64 = (1n << 64n) - 1n;
const HSTART = 0xbb40e64da205b064n;
const HMULT = 7664345821815920749n;
const BYTE_TABLE = buildByteTable();

/**
 * `openchemlib-js` exposes `CanonizerUtil.getIDCode` but not the hash built from it, so the hash
 * tests hash that idcode here. This is OpenChemLib's `StrongHasher.hash` transcribed, and having it
 * written a second way is what makes those comparisons a real cross-check.
 * @param text - The idcode to hash.
 * @returns Its 64-bit hash, signed, as a `BigInt64Array` entry holds it.
 */
export function strongHash(text: string): bigint {
  let h = HSTART;
  for (let i = text.length - 1; i >= 0; i--) {
    const character = BigInt(text.codePointAt(i) as number);
    h =
      ((h * HMULT) & MASK_64) ^
      (BYTE_TABLE[Number(character & 0xffn)] as bigint);
    h =
      ((h * HMULT) & MASK_64) ^
      (BYTE_TABLE[Number((character >> 8n) & 0xffn)] as bigint);
  }
  return BigInt.asIntN(64, h);
}

/**
 * OpenChemLib's `CanonizerUtil.StrongHasher` byte table, built the same way the Java does.
 * @returns The 256 seeds, as unsigned 64-bit values.
 */
function buildByteTable(): bigint[] {
  const table = new Array<bigint>(256);
  let h = 0x544b2fbacaaf1684n;
  for (let i = 0; i < 256; i++) {
    for (let j = 0; j < 31; j++) {
      h = ((h >> 7n) ^ h) & MASK_64;
      h = ((h << 11n) ^ h) & MASK_64;
      h = ((h >> 10n) ^ h) & MASK_64;
    }
    table[i] = h;
  }
  return table;
}

/**
 * The idcode of a SMILES, so the hash tests read as structures rather than as opaque strings.
 * @param smiles - The molecule.
 * @returns Its idcode.
 */
export function fromSmiles(smiles: string): string {
  return OCL.Molecule.fromSmiles(smiles).getIDCode();
}
