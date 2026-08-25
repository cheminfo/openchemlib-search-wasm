import type * as OCL from 'openchemlib';

import { SimilarityResult, SubstructureResult } from '../../src/types.ts';

import type { Engine, Mode } from './protocol.ts';

/** Runs one contiguous batch, writing one entry per idcode, in order. */
export type ScanBatch = (
  query: string,
  idCodes: string[],
  result: Uint8Array | Float32Array,
) => void;

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
    const { ssSearch, similaritySearch } = await import('#lib');
    if (mode === 'substructure') {
      return (query, idCodes, result) => {
        ssSearch(query, idCodes, result as Uint8Array);
      };
    }
    return (query, idCodes, result) => {
      similaritySearch(query, idCodes, result as Float32Array);
    };
  }

  const ocl = await import('openchemlib');
  if (mode === 'substructure') {
    return (query, idCodes, result) => {
      gwtSubstructure(ocl, query, idCodes, result as Uint8Array);
    };
  }
  return (query, idCodes, result) => {
    gwtSimilarity(ocl, query, idCodes, result as Float32Array);
  };
}

/**
 * The `openchemlib-js` equivalent of `org.openchemlib.wasm.Search.ssSearch`, down to constructing
 * one searcher per batch and reading idcodes without inventing 2D coordinates — the comparison is
 * only worth anything if both engines do the same work.
 * @param ocl - The loaded `openchemlib` module.
 * @param query - The query, as an idcode.
 * @param idCodes - The molecules to test.
 * @param result - One status byte per molecule.
 */
function gwtSubstructure(
  ocl: typeof OCL,
  query: string,
  idCodes: string[],
  result: Uint8Array,
): void {
  const fragment = parse(ocl, query);
  if (fragment === null) {
    throw new Error(`"${query}" is not a valid query idcode`);
  }
  fragment.setFragment(true);
  const searcher = new ocl.SSSearcher();
  searcher.setFragment(fragment);
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
}

/**
 * The `openchemlib-js` equivalent of `org.openchemlib.wasm.Search.similaritySearch`.
 * @param ocl - The loaded `openchemlib` module.
 * @param query - The query, as an idcode.
 * @param idCodes - The molecules to compare against.
 * @param result - One Tanimoto coefficient per molecule.
 */
function gwtSimilarity(
  ocl: typeof OCL,
  query: string,
  idCodes: string[],
  result: Float32Array,
): void {
  const molecule = parse(ocl, query);
  if (molecule === null) {
    throw new Error(`"${query}" is not a valid query idcode`);
  }
  const indexer = new ocl.SSSearcherWithIndex();
  const queryIndex = indexer.createIndex(molecule);
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
