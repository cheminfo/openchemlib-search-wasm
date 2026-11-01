import { getFunctionKeys } from '../src/functionKeys/index.ts';
import { getQueryIndex, getQueryScreen } from '../src/index.ts';

/** The digits a bit position is written in, two per bit. */
const DIGITS = '0123456789abcdefghijklmnopqrstuv';

/** Where the screen's bits start in a fragment's bit list: after FragFp's 512. */
const SCREEN_OFFSET = 512;

/**
 * The source of `FunctionKeys.java`: the stored keys of the dictionary in plane order, and with each
 * fragment the bits its query FragFp and screen set, as the module computes them. Those are read
 * from the module rather than computed in it at first use, where they cost a second of substructure
 * tests in every thread that reads a molecule.
 *
 * The query words do not depend on the function keys, so the module this runs against may hold any
 * version of them; it must hold the current FragFp and screen, so run it again after rebuilding a
 * module whose OpenChemLib changed.
 * @returns The Java source.
 */
export function functionKeysSource(): string {
  const stored = getFunctionKeys().filter((key) => key.tier === 'stored');
  for (const [index, key] of stored.entries()) {
    if (key.plane !== index) throw new Error(`plane ${index} is missing`);
  }
  const idCodeLines = stored.map((key) =>
    javaArray(
      key.fragments.map((idCode) => javaString(idCode)),
      `${key.plane} ${key.name.replaceAll(/\s+/g, ' ')}`,
    ),
  );
  const bitLines = stored.map((key) =>
    javaArray(
      key.fragments.map((idCode) => queryBits(idCode)),
      String(key.plane),
    ),
  );
  const fragmentCount = stored.reduce(
    (sum, key) => sum + key.fragments.length,
    0,
  );

  return `package org.openchemlib.wasm;

/**
 * The ${stored.length} stored function keys, in plane order: bit i of a molecule's function words is
 * set when any fragment of key i is a substructure of it (see {@link Functions}).
 *
 * <p>Generated from {@code src/functionKeys/dictionary.json} by {@code npm run build-function-keys};
 * never edit it by hand. Changing, adding or reordering a key changes every stored record, so the
 * list only ever changes in a major release.
 */
final class FunctionKeys {
  private FunctionKeys() {}

  /** The fragments of each key, as idcodes: ${fragmentCount} in all. */
  static final String[][] IDCODES = {
${idCodeLines.join('\n')}
  };

  /**
   * Per key and fragment, in the order of {@link #IDCODES}, the bits every molecule holding the
   * fragment has: its query FragFp as bits 0 to 511, then its query screen as bits 512 to 1023, each
   * written as two base-32 digits. They are what {@code Screen.FRAGFP.ofQuery} and {@code
   * Screen.DICTIONARY.ofQuery} give the fragment, read from the module when this file is generated.
   */
  static final String[][] QUERY_BITS = {
${bitLines.join('\n')}
  };
}
`;
}

/**
 * The bits a fragment's query FragFp and screen set, as two base-32 digits each.
 * @param idCode - The fragment.
 * @returns The digits.
 */
function queryBits(idCode: string): string {
  let bits = setBits(getQueryIndex(idCode), 0);
  bits += setBits(getQueryScreen(idCode), SCREEN_OFFSET);
  return bits;
}

/**
 * The set bits of sixteen words, the first bit in the highest bit of word 0, as two base-32
 * digits each.
 * @param words - The words.
 * @param offset - Added to each bit position.
 * @returns The digits.
 */
function setBits(words: Int32Array, offset: number): string {
  let digits = '';
  for (let bit = 0; bit < words.length * 32; bit++) {
    if (((words[bit >> 5] as number) & (1 << (31 - (bit & 31)))) !== 0) {
      const position = offset + bit;
      digits += `${DIGITS[position >> 5]}${DIGITS[position & 31]}`;
    }
  }
  return digits;
}

/**
 * One key's row of a `String[][]` literal.
 * @param literals - The contents of its string literals, escaped.
 * @param label - What the trailing comment says.
 * @returns The row, one line per literal when there are several.
 */
function javaArray(literals: string[], label: string): string {
  if (literals.length === 1) return `    {"${literals[0]}"}, // ${label}`;
  return [
    `    { // ${label}, ${literals.length} fragments`,
    ...literals.map((literal) => `      "${literal}",`),
    '    },',
  ].join('\n');
}

/**
 * Escapes an idcode for a Java string literal. Idcodes are ASCII from '@' upwards: the backslash
 * needs escaping, and DEL is written as an escape so the source stays printable.
 * @param idCode - The idcode.
 * @returns The literal's contents.
 */
function javaString(idCode: string): string {
  return idCode
    .replaceAll('\\', '\\\\')
    .replaceAll('\u007F', String.raw`\u007F`);
}
