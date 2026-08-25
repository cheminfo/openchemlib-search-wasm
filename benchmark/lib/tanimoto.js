/** Words of a FragFp fingerprint: OpenChemLib's index is 512 bits, held as 16 signed ints. */
export const WORDS = 16;

/**
 * Ranks a store of fingerprints against one query, the way a caller that keeps fingerprints beside
 * its idcodes would.
 *
 * This is the whole of a similarity search once the fingerprints exist: no molecule is built, no
 * bond is walked, and the store is read once in a single stride.
 * @param {Int32Array} query - The query fingerprint, `WORDS` long.
 * @param {number} queryBits - How many bits the query fingerprint has set.
 * @param {Int32Array} store - Every fingerprint, laid out flat, `WORDS` per entry.
 * @param {Int32Array} storeBits - How many bits each stored fingerprint has set.
 * @param {Float32Array} result - Written with the Tanimoto coefficient of every entry.
 * @returns {void}
 */
export function tanimotoScan(query, queryBits, store, storeBits, result) {
  for (let i = 0; i < result.length; i++) {
    const at = i * WORDS;
    let shared = 0;
    for (let word = 0; word < WORDS; word++) {
      shared += popCount(query[word] & store[at + word]);
    }
    result[i] = shared / (queryBits + storeBits[i] - shared);
  }
}

/**
 * Fills a fingerprint store, repeating the sample until every entry is covered.
 *
 * Repetition is what makes a store the size of a real library affordable to build: the entries are
 * real fingerprints and the scan reads them in the same linear stride either way, so what is
 * measured is the throughput of the comparison and of the memory it walks.
 * @param {Int32Array} store - The store to fill, `WORDS` per entry.
 * @param {Int32Array} storeBits - Filled with each entry's bit count.
 * @param {string[]} idCodes - The molecules to fingerprint.
 * @param {(idCode: string) => number[]} fingerprintOf - Builds one fingerprint.
 * @returns {void}
 */
export function fillStore(store, storeBits, idCodes, fingerprintOf) {
  const fingerprints = new Array(idCodes.length);
  for (let i = 0; i < idCodes.length; i++) {
    fingerprints[i] = Int32Array.from(fingerprintOf(idCodes[i]));
  }
  for (let i = 0; i < storeBits.length; i++) {
    const fingerprint = fingerprints[i % fingerprints.length];
    const at = i * WORDS;
    for (let word = 0; word < WORDS; word++) {
      store[at + word] = fingerprint[word];
    }
    storeBits[i] = popCountOf(fingerprint);
  }
}

/**
 * Counts the bits set across a whole fingerprint.
 * @param {Int32Array} words - The fingerprint.
 * @returns {number} How many bits are set.
 */
export function popCountOf(words) {
  let bits = 0;
  for (let word = 0; word < words.length; word++) {
    bits += popCount(words[word]);
  }
  return bits;
}

function popCount(word) {
  let value = word - ((word >> 1) & 0x55555555);
  value = (value & 0x33333333) + ((value >> 2) & 0x33333333);
  value = (value + (value >> 4)) & 0x0f0f0f0f;
  return (value * 0x01010101) >> 24;
}
