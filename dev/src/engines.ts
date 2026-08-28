import type * as OCL from 'openchemlib';

import { SimilarityResult, SubstructureResult } from '../../src/types.ts';

import type { Engine, Mode } from './protocol.ts';

/** Runs one contiguous batch, returning one entry per idcode, in order. */
export type ScanBatch = (
  query: string,
  idCodes: string[],
) => Uint8Array | Float32Array;

/**
 * Builds the batch function for one engine.
 *
 * Both engines are imported dynamically so a worker only pays for the one it runs: the WebAssembly
 * module instantiates at import time, and `openchemlib` is a megabyte of GWT output that must never
 * be pulled into the WebAssembly path.
 * @param engine - Which implementation to load.
 * @param mode - What the scan computes.
 * @returns The batch function, ready to call.
 */
export async function createScan(
  engine: Engine,
  mode: Mode,
): Promise<ScanBatch> {
  if (engine === 'wasm') {
    const { substructureSearch, similaritySearch } = await import('#lib');
    // `collect: false`: the app renders from the buffer it copies into, so building a list of hits
    // — a quarter of a million of them on a common query — would be measured and thrown away.
    if (mode === 'substructure') {
      return (query, idCodes) =>
        substructureSearch(query, idCodes, { collect: false }).result;
    }
    return (query, idCodes) =>
      similaritySearch(query, idCodes, { collect: false }).result;
  }

  const ocl = await import('openchemlib');
  if (mode === 'substructure') {
    return (query, idCodes) => gwtSubstructure(ocl, query, idCodes);
  }
  return (query, idCodes) => gwtSimilarity(ocl, query, idCodes);
}

/**
 * The `openchemlib-js` equivalent of `org.openchemlib.wasm.Search.ssSearch`, down to constructing
 * one searcher per batch and reading idcodes without inventing 2D coordinates — the comparison is
 * only worth anything if both engines do the same work.
 * @param ocl - The loaded `openchemlib` module.
 * @param query - The query, as an idcode.
 * @param idCodes - The molecules to test.
 * @returns One status byte per molecule.
 */
function gwtSubstructure(
  ocl: typeof OCL,
  query: string,
  idCodes: string[],
): Uint8Array {
  const fragment = parse(ocl, query);
  if (fragment === null) {
    throw new Error(`"${query}" is not a valid query idcode`);
  }
  fragment.setFragment(true);
  const searcher = new ocl.SSSearcher();
  searcher.setFragment(fragment);
  const result = new Uint8Array(idCodes.length);
  for (let i = 0; i < idCodes.length; i++) {
    const molecule = parse(ocl, idCodes[i] ?? '');
    if (molecule === null) {
      result[i] = SubstructureResult.unparsable;
      continue;
    }
    searcher.setMolecule(molecule);
    result[i] = searcher.isFragmentInMolecule()
      ? SubstructureResult.match
      : SubstructureResult.noMatch;
  }
  return result;
}

/**
 * The `openchemlib-js` equivalent of `org.openchemlib.wasm.Search.similaritySearch`.
 * @param ocl - The loaded `openchemlib` module.
 * @param query - The query, as an idcode.
 * @param idCodes - The molecules to compare against.
 * @returns One Tanimoto coefficient per molecule.
 */
function gwtSimilarity(
  ocl: typeof OCL,
  query: string,
  idCodes: string[],
): Float32Array {
  const molecule = parse(ocl, query);
  if (molecule === null) {
    throw new Error(`"${query}" is not a valid query idcode`);
  }
  const indexer = new ocl.SSSearcherWithIndex();
  const queryIndex = indexer.createIndex(molecule);
  const result = new Float32Array(idCodes.length);
  for (let i = 0; i < idCodes.length; i++) {
    const target = parse(ocl, idCodes[i] ?? '');
    result[i] =
      target === null
        ? SimilarityResult.unparsable
        : ocl.SSSearcherWithIndex.getSimilarityTanimoto(
            queryIndex,
            indexer.createIndex(target),
          );
  }
  return result;
}

function parse(ocl: typeof OCL, idCode: string): OCL.Molecule | null {
  if (idCode.length === 0) return null;
  try {
    const molecule = ocl.Molecule.fromIDCode(idCode, false);
    return molecule.getAllAtoms() === 0 ? null : molecule;
  } catch {
    return null;
  }
}
