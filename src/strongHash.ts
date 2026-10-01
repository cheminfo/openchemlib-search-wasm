/**
 * OpenChemLib's 64-bit StrongHasher, which is how every `CanonizerUtil` hash is defined: the
 * molecule is reduced to a canonical idcode, and that string is hashed. `openchemlib` exposes the
 * canonical forms but not the hasher, so this is its `CanonizerUtil.StrongHasher` transcribed.
 *
 * It is here so a caller that already holds a canonical idcode — one of this package's, or a column
 * of them in a database — can get its hash without canonizing again. That matters because
 * canonizing a generic tautomer is the most expensive thing this package does, and asking for both
 * the idcode and the hash would otherwise pay for it twice.
 *
 * ```js
 * strongHash(getNoStereoTautomerIdCode(idCode)) === getNoStereoTautomerHash(idCode);
 * ```
 */
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
