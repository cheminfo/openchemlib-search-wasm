import { Molecule, SSSearcher, SSSearcherWithIndex } from 'openchemlib';

/**
 * openchemlib-js's `ssSearch`, written call for call against `org.openchemlib.wasm.Search` so the
 * A/B compares the same work.
 *
 * The second argument of `fromIDCode` is what makes it the same work. It defaults to `true`, which
 * invents 2D coordinates the search never looks at; leaving it on measured 330 µs per molecule
 * against 22, so a comparison that forgets it reports a 15x speedup that is really a coordinate
 * generator. The WASM build parses with `IDCodeParserWithoutCoordinateInvention`, which is what
 * `false` selects here.
 * @param {string} idCodeQuery - The query, as an idcode, searched as a fragment.
 * @param {string[]} idCodes - The molecules to test.
 * @returns {Uint8Array} The `SubstructureResult` codes: 1 match, 2 no match. Allocated here, as
 * `ssSearch` allocates its own, so the A/B compares the same work.
 */
export function ssSearchJs(idCodeQuery, idCodes) {
  const fragment = Molecule.fromIDCode(idCodeQuery, false);
  fragment.setFragment(true);
  const searcher = new SSSearcher();
  searcher.setFragment(fragment);
  const result = new Uint8Array(idCodes.length);
  for (let i = 0; i < idCodes.length; i++) {
    searcher.setMolecule(Molecule.fromIDCode(idCodes[i], false));
    result[i] = searcher.isFragmentInMolecule() ? 1 : 2;
  }
  return result;
}

/**
 * openchemlib-js's `similaritySearch`: the Tanimoto coefficient of the query against each molecule
 * on the 512-bit FragFp fingerprint, mirroring `Search.similaritySearch`.
 * @param {string} idCodeQuery - The query, as an idcode.
 * @param {string[]} idCodes - The molecules to compare against.
 * @returns {Float32Array} The coefficient in [0, 1] per molecule.
 */
export function similaritySearchJs(idCodeQuery, idCodes) {
  const indexer = new SSSearcherWithIndex();
  const queryIndex = indexer.createIndex(
    Molecule.fromIDCode(idCodeQuery, false),
  );
  const result = new Float32Array(idCodes.length);
  for (let i = 0; i < idCodes.length; i++) {
    const index = indexer.createIndex(Molecule.fromIDCode(idCodes[i], false));
    result[i] = SSSearcherWithIndex.getSimilarityTanimoto(queryIndex, index);
  }
  return result;
}

/**
 * Builds the 512-bit FragFp fingerprint of one idcode, as 16 signed 32-bit words.
 * @param {string} idCode - The molecule, as an idcode.
 * @returns {number[]} The fingerprint.
 */
export function fingerprintJs(idCode) {
  return new SSSearcherWithIndex().createIndex(
    Molecule.fromIDCode(idCode, false),
  );
}

/**
 * Counts the entries of a substructure result buffer that matched.
 * @param {Uint8Array} result - A buffer filled by either engine.
 * @returns {number} How many entries hold `SubstructureResult.match`.
 */
export function countMatches(result) {
  let matches = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i] === 1) matches++;
  }
  return matches;
}
