import { Molecule } from 'openchemlib';

/** How the query field's text should be read. */
export type QueryKind = 'smiles' | 'idcode';

/** One of the six queries the library is benchmarked with. */
export interface Preset {
  name: string;
  smiles: string;
  /** Hit rate over the 409,686-molecule reference corpus, where it has been measured. */
  hits?: string;
}

/** The six queries the README and the benchmarks quote, with the hit rates measured so far. */
export const PRESETS: Preset[] = [
  { name: 'benzene', smiles: 'c1ccccc1', hits: '257,625 (62.9%)' },
  { name: 'pyridine', smiles: 'c1ccncc1' },
  { name: 'carboxyl', smiles: 'C(=O)O' },
  { name: 'anilide', smiles: 'C(=O)Nc1ccccc1' },
  { name: 'sulfonamide', smiles: 'S(=O)(=O)N', hits: '10,826 (2.6%)' },
  { name: 'naphthalene', smiles: 'c1ccc2ccccc2c1', hits: '16,882 (4.1%)' },
];

/**
 * Turns what was typed into the idcode the workers receive.
 *
 * The conversion happens once, on the main thread, with `openchemlib-js` — the WebAssembly module
 * has no SMILES parser, and a chemist has to see the idcode that was actually sent.
 * @param text - The query field's contents.
 * @param kind - How to read it.
 * @returns The idcode, or the reason it could not be produced.
 */
export function toIdCode(
  text: string,
  kind: QueryKind,
): { idCode: string; error: string | null } {
  const trimmed = text.trim();
  if (trimmed.length === 0) return { idCode: '', error: null };
  try {
    const molecule =
      kind === 'smiles'
        ? Molecule.fromSmiles(trimmed)
        : Molecule.fromIDCode(trimmed, false);
    if (molecule.getAllAtoms() === 0) {
      return { idCode: '', error: 'that query has no atoms' };
    }
    return { idCode: molecule.getIDCode(), error: null };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return {
      idCode: '',
      error: `not a valid ${kind === 'smiles' ? 'SMILES' : 'idcode'}: ${detail}`,
    };
  }
}
