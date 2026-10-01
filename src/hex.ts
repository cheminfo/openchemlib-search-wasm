/** How many hex digits a 64-bit hash always writes. */
const HASH_HEX_DIGITS = 16;

const HASH_HEX = /^[0-9a-f]{16}$/i;

/**
 * Formats a hash as the 16 lowercase hex digits of its 64-bit pattern.
 *
 * A hash is a signed 64-bit integer, which `JSON.stringify` refuses outright — and a JSON number
 * could not carry it anyway, since 64 bits does not fit a double. Hex is what crosses an API: it is
 * always 16 characters whatever the value, it compares and sorts as a string, and it survives a
 * round trip through anything that handles text.
 *
 * `hash.toString(16)` is not this: it writes `-1` for `-1n`, where the pattern is
 * `ffffffffffffffff`, and it pads nothing.
 *
 * A database that stores the hash in an integer column can format it on the way out instead, and
 * SQLite's `printf('%016x', hash)` produces exactly this string.
 *
 * ```js
 * hashToHex(getNoStereoTautomerHash(idCode)); // 'eb14b9bc9ab4dd52'
 * ```
 * @param hash - The hash to format.
 * @returns Its 16 hex digits, lowercase and zero-padded.
 */
export function hashToHex(hash: bigint): string {
  return BigInt.asUintN(64, hash).toString(16).padStart(HASH_HEX_DIGITS, '0');
}

/**
 * Reads back what {@link hashToHex} wrote, so a hash that arrived as text can be compared against
 * one that was computed, or bound to an integer column.
 * @param hex - The 16 hex digits, in either case.
 * @returns The signed 64-bit hash.
 * @throws {SyntaxError} When the string is not 16 hex digits — a truncated or `0x`-prefixed hash
 * would otherwise read as a different, valid-looking value.
 */
export function hexToHash(hex: string): bigint {
  if (!HASH_HEX.test(hex)) {
    throw new SyntaxError(`not a 16-digit hex hash: ${JSON.stringify(hex)}`);
  }
  return BigInt.asIntN(64, BigInt(`0x${hex}`));
}
