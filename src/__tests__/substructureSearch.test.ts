import { expect, test } from 'vitest';

import { SubstructureResult, substructureSearch } from '../index.ts';

import {
  QUERIES,
  countCode,
  firstDifference,
  readIdCodes,
  referenceSubstructure,
} from './fixture.ts';

const idCodes = readIdCodes();

/**
 * The status buffer alone, which is what the assertions below read.
 * @param query - The query, as an idcode.
 * @param entries - The molecules to test.
 * @returns One SubstructureResult code per molecule.
 */
const statuses = (query: string, entries: string[]): Uint8Array =>
  substructureSearch(query, entries).result;

test('the fixture is the corpus the cross-checks assume', () => {
  expect(idCodes).toHaveLength(1999);
  expect(idCodes[0]).toBe('gCi@DDfZ@@');
});

// The whole point of the package is to be a faster openchemlib-js, so "same answer" is the property
// that matters. An upstream OpenChemLib change that alters a match rule fails here rather than
// silently changing what a search returns.
test.each(QUERIES)(
  'substructureSearch agrees with openchemlib-js on every molecule, query $name',
  ({ idCode }) => {
    const result = statuses(idCode, idCodes);
    const expected = referenceSubstructure(idCode, idCodes);

    expect(firstDifference(result, expected)).toBe(-1);
    expect(countCode(result, SubstructureResult.unprocessed)).toBe(0);
    expect(countCode(result, SubstructureResult.unparsable)).toBe(0);
  },
);

test('hit counts are the ones this corpus is known to produce', () => {
  expect(
    countCode(statuses('gFp@DiTt@@B', idCodes), SubstructureResult.match),
  ).toBe(1268);
  expect(
    countCode(statuses('gChhMD@bNlA@', idCodes), SubstructureResult.match),
  ).toBe(48);
  expect(
    countCode(statuses('det@@DjYUX^d@@@@B', idCodes), SubstructureResult.match),
  ).toBe(85);
});

test('a molecule always contains itself', () => {
  const sample = idCodes.slice(0, 50);
  for (const idCode of sample) {
    const result = statuses(idCode, [idCode]);

    expect([idCode, result[0]]).toStrictEqual([
      idCode,
      SubstructureResult.match,
    ]);
  }
});

// What a worker pool does: each worker scans its own slice and its buffer is copied back into place.
test('splitting the scan across worker-sized slices gives the same buffer', () => {
  const whole = statuses('eMDARVB', idCodes);

  const joined = new Uint8Array(idCodes.length);
  const workers = 4;
  const size = Math.ceil(idCodes.length / workers);
  for (let w = 0; w < workers; w++) {
    const from = w * size;
    const to = Math.min(from + size, idCodes.length);
    joined.set(statuses('eMDARVB', idCodes.slice(from, to)), from);
  }

  expect(firstDifference(joined, whole)).toBe(-1);
});

// An idcode carries no checksum, so "malformed" only means "decodes to nothing": a string that
// happens to be a valid bit stream decodes to some molecule and is tested like any other.
test.each([
  { name: 'empty', idCode: '' },
  { name: 'a space', idCode: ' ' },
  { name: 'one character', idCode: 'a' },
  { name: 'a SMILES', idCode: 'C1=CC=CC=C1' },
  { name: 'a molfile line', idCode: '  Marvin  01010100002D' },
])('$name is reported as unparsable', ({ idCode }) => {
  const result = statuses('gFp@DiTt@@B', [idCode]);

  expect(result[0]).toBe(SubstructureResult.unparsable);
});

test('an unparsable idcode is recorded and the scan continues', () => {
  const clean = idCodes.slice(0, 300);
  const expected = statuses('gFp@DiTt@@B', clean);

  const mixed = [...clean];
  const broken = new Set([7, 100, 299]);
  for (const index of broken) mixed[index] = '';
  const result = statuses('gFp@DiTt@@B', mixed);

  for (const index of broken) {
    expect(result[index]).toBe(SubstructureResult.unparsable);
  }

  expect(countCode(result, SubstructureResult.unprocessed)).toBe(0);

  for (let i = 0; i < mixed.length; i++) {
    if (broken.has(i)) continue;

    expect([i, result[i]]).toStrictEqual([i, expected[i]]);
  }
});

// The parser reads from a scratch buffer that grows to the longest idcode seen. An entry's result
// must not depend on how long the entry before it was.
test('a result does not depend on what was scanned before it', () => {
  let longest = '';
  for (const idCode of idCodes) {
    if (idCode.length > longest.length) longest = idCode;
  }
  const alone = statuses('gFp@DiTt@@B', ['C1=CC=CC=C1']);
  const afterLong = statuses('gFp@DiTt@@B', [longest, 'C1=CC=CC=C1']);

  expect(afterLong[1]).toBe(alone[0]);
});

// Documents a property of the format rather than of this package: an idcode is self-delimiting and
// unvalidated, so trailing bytes are simply never read.
test('trailing junk after a valid idcode is ignored', () => {
  const result = statuses('gFp@DiTt@@B', ['gFp@DiTt@@B!!!!']);

  expect(result[0]).toBe(SubstructureResult.match);
});

test('an unparsable query is blamed on the query, not on the first molecule', () => {
  expect(() => statuses('', idCodes)).toThrow('"" is not a valid query idcode');
});

test('an empty batch gives an empty buffer and does not throw', () => {
  const result = statuses('gFp@DiTt@@B', []);

  expect(result).toBeInstanceOf(Uint8Array);
  expect(result).toHaveLength(0);
});

test('the buffer is one entry per idcode, and a fresh one every call', () => {
  const first = statuses('gChhMD@bNlA@', idCodes);
  const second = statuses('gChhMD@bNlA@', idCodes);

  expect(first).toHaveLength(idCodes.length);
  expect(first).not.toBe(second);
  expect(firstDifference(first, second)).toBe(-1);
});

// The WASM module keeps the last query parsed, so a caller scanning one array in several calls does
// not re-parse it. Interleaving queries is what would expose that cache returning the wrong one.
test('interleaving queries gives each the same answers as running it alone', () => {
  const sample = idCodes.slice(0, 300);
  const alone = new Map<string, number[]>();
  for (const { idCode } of QUERIES) {
    alone.set(idCode, Array.from(statuses(idCode, sample)));
  }

  // walk the queries round-robin, one molecule at a time, so the cache is invalidated constantly
  const interleaved = new Map<string, number[]>(
    QUERIES.map(({ idCode }) => [idCode, []]),
  );
  for (const idCode of sample) {
    for (const query of QUERIES) {
      const one = statuses(query.idCode, [idCode]);
      (interleaved.get(query.idCode) as number[]).push(one[0] as number);
    }
  }

  for (const { name, idCode } of QUERIES) {
    expect([name, interleaved.get(idCode)]).toStrictEqual([
      name,
      alone.get(idCode),
    ]);
  }
});

test('a query reused across calls still sees each molecule correctly', () => {
  const sample = idCodes.slice(0, 400);
  const whole = statuses('gFp@DiTt@@B', sample);

  // same query, one molecule per call: every call after the first hits the cached fragment
  const piecewise = new Uint8Array(sample.length);
  for (let i = 0; i < sample.length; i++) {
    piecewise.set(statuses('gFp@DiTt@@B', [sample[i] as string]), i);
  }

  expect(firstDifference(piecewise, whole)).toBe(-1);
});
