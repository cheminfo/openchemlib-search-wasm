import { recoveringFromTraps } from './scan.ts';
import type {
  MoleculeRecords,
  MoleculeRecordsOptions,
  MoleculeSizes,
} from './types.ts';
import {
  DEFAULT_MAX_TAUTOMERS,
  NO_HASH,
  NO_ID_CODE,
  RECORD_WORDS,
} from './types.ts';
import { loadOCL } from './wasm/load.ts';

const { Search } = await loadOCL();

/**
 * Computes everything a molecule table stores about each idcode, parsing each one once: the
 * canonical idcode, the FragFp, the screen and the function bits, the atom count and the relative
 * weight, and the no-stereo and tautomer hashes.
 *
 * Each value is the one the dedicated function returns — `getIndexes`, `getScreens`, `getFunctions`,
 * `getNoStereoHashes`, `getNoStereoTautomerHashes` — with one deliberate exception: a molecule
 * whose tautomer enumeration reached `maxTautomers` gets its no-stereo hash as its tautomer hash,
 * because a key from a truncated enumeration depends on where it stopped and is not canonical.
 * `tautomerCounts` says which molecules those are.
 *
 * ```js
 * const records = getMoleculeRecords(idCodes, { maxTautomers: 5000 });
 * const words = records.words.subarray(48 * i, 48 * (i + 1)); // FragFp, screen, functions
 * ```
 * @param idCodes - The molecules to read, as idcodes.
 * @param options - See {@link MoleculeRecordsOptions}.
 * @returns One entry per idcode in each array, in input order. A molecule that cannot be read gets
 * `NO_ID_CODE`, zeros, 0 atoms, a `NaN` weight, `NO_HASH` and a tautomer count of 0, and does not
 * cost the others in the batch.
 */
export function getMoleculeRecords(
  idCodes: string[],
  options: MoleculeRecordsOptions = {},
): MoleculeRecords {
  const { maxTautomers = DEFAULT_MAX_TAUTOMERS } = options;
  const count = idCodes.length;
  const records: MoleculeRecords = {
    idCodes: new Array<string>(count).fill(NO_ID_CODE),
    words: new Int32Array(count * RECORD_WORDS),
    atomCounts: new Int32Array(count),
    weights: new Float64Array(count).fill(Number.NaN),
    noStereoHashes: new BigInt64Array(count),
    tautomerHashes: new BigInt64Array(count),
    tautomerCounts: new Int32Array(count),
  };
  recoveringFromTraps(
    (from, to) =>
      Search.getMoleculeRecords(
        idCodes,
        records.idCodes,
        records.words,
        records.atomCounts,
        records.weights,
        records.noStereoHashes,
        records.tautomerHashes,
        records.tautomerCounts,
        maxTautomers,
        from,
        to,
      ),
    (index) => markUnreadable(records, index),
    0,
    count,
  );
  return records;
}

/**
 * Reads the atom count and the relative weight of each idcode — exactly the `atomCounts` and
 * `weights` of {@link getMoleculeRecords}, and nothing else, so it costs one parse and one formula
 * per molecule.
 * @param idCodes - The molecules to read, as idcodes.
 * @returns One entry per idcode in each array, in input order: 0 atoms and a `NaN` weight for a
 * molecule that cannot be read.
 */
export function getMoleculeSizes(idCodes: string[]): MoleculeSizes {
  const count = idCodes.length;
  const sizes: MoleculeSizes = {
    atomCounts: new Int32Array(count),
    weights: new Float64Array(count).fill(Number.NaN),
  };
  recoveringFromTraps(
    (from, to) =>
      Search.getMoleculeSizes(
        idCodes,
        sizes.atomCounts,
        sizes.weights,
        from,
        to,
      ),
    (index) => {
      sizes.atomCounts[index] = 0;
      sizes.weights[index] = Number.NaN;
    },
    0,
    count,
  );
  return sizes;
}

/**
 * The fewest atoms a molecule needs to contain the query: its atoms once the exclude groups are
 * removed, plain hydrogens aside. Each of them maps onto a distinct atom of any match, so a molecule
 * whose atom count is below the floor cannot match and needs no substructure test.
 *
 * Wildcards and atom lists count — each still takes an atom of the match. A plain hydrogen does not,
 * because it may match an implicit one; a deuterium or a tritium does.
 * @param idCodeQuery - The query, as an idcode; read as a fragment whatever its own fragment flag.
 * @returns The floor, or 0 for a query with no atoms.
 * @throws {Error} If the query cannot be parsed.
 */
export function getQueryAtomFloor(idCodeQuery: string): number {
  try {
    return Search.getQueryAtomFloor(idCodeQuery);
  } catch (error) {
    throw new Error(`"${idCodeQuery}" is not a valid query idcode`, {
      cause: error,
    });
  }
}

/**
 * Writes the "could not read this" record of one molecule over whatever a trap left there.
 * @param records - The records being filled.
 * @param index - The molecule's position.
 */
function markUnreadable(records: MoleculeRecords, index: number): void {
  records.idCodes[index] = NO_ID_CODE;
  records.words.fill(0, index * RECORD_WORDS, (index + 1) * RECORD_WORDS);
  records.atomCounts[index] = 0;
  records.weights[index] = Number.NaN;
  records.noStereoHashes[index] = NO_HASH;
  records.tautomerHashes[index] = NO_HASH;
  records.tautomerCounts[index] = 0;
}
