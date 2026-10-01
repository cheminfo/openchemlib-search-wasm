import { expect, test } from 'vitest';

import { getNoStereoTautomerHash, hashToHex, hexToHash } from '../index.ts';

import { fromSmiles } from './fixture.ts';

// The whole range a signed 64-bit hash can occupy, plus the values a naive `.toString(16)` gets
// wrong.
const CASES: Array<[bigint, string]> = [
  [0n, '0000000000000000'],
  [1n, '0000000000000001'],
  [-1n, 'ffffffffffffffff'],
  [9223372036854775807n, '7fffffffffffffff'],
  [-9223372036854775808n, '8000000000000000'],
  [-1507375755561738926n, 'eb14b9bc9ab4dd52'],
  [697515432607904455n, '09ae129721f272c7'],
];

test('every hash formats as 16 lowercase hex digits', () => {
  for (const [hash, hex] of CASES) {
    expect([hash, hashToHex(hash)]).toStrictEqual([hash, hex]);
    expect(hashToHex(hash)).toHaveLength(16);
  }
});

test('hexToHash reads back what hashToHex wrote', () => {
  for (const [hash] of CASES) {
    expect([hash, hexToHash(hashToHex(hash))]).toStrictEqual([hash, hash]);
  }
});

test('hexToHash accepts uppercase', () => {
  expect(hexToHash('EB14B9BC9AB4DD52')).toBe(-1507375755561738926n);
});

test('hexToHash refuses anything that is not 16 hex digits', () => {
  for (const bad of [
    '',
    'eb14b9bc9ab4dd5',
    'eb14b9bc9ab4dd52a',
    '0xeb14b9bc9ab4dd52',
    'zb14b9bc9ab4dd52',
  ]) {
    expect(() => hexToHash(bad)).toThrow(SyntaxError);
  }
});

test('a real hash survives the round trip and is JSON-serializable as hex', () => {
  const hash = getNoStereoTautomerHash(fromSmiles('CCC(=O)CC'));
  const hex = hashToHex(hash);

  expect(JSON.stringify({ hex })).toBe(`{"hex":"${hex}"}`);
  expect(hexToHash(hex)).toBe(hash);
  expect(() => JSON.stringify({ hash })).toThrow(TypeError);
});
