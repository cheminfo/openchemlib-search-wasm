import { expect, test } from 'vitest';

import { SubstructureResult, ssSearch } from '../index.ts';

import {
  QUERIES,
  countCode,
  firstDifference,
  readIdCodes,
  referenceSubstructure,
} from './fixture.ts';

const idCodes = readIdCodes();

test('the fixture is the corpus the cross-checks assume', () => {
  expect(idCodes).toHaveLength(1999);
  expect(idCodes[0]).toBe('gCi@DDfZ@@');
});

// The whole point of the package is to be a faster openchemlib-js, so "same answer" is the property
// that matters. An upstream OpenChemLib change that alters a match rule fails here rather than
// silently changing what a search returns.
test.each(QUERIES)(
  'ssSearch agrees with openchemlib-js on every molecule, query $name',
  ({ idCode }) => {
    const result = new Uint8Array(idCodes.length);
    ssSearch(idCode, idCodes, result);
    const expected = referenceSubstructure(idCode, idCodes);

    expect(firstDifference(result, expected)).toBe(-1);
    expect(countCode(result, SubstructureResult.unprocessed)).toBe(0);
    expect(countCode(result, SubstructureResult.unparsable)).toBe(0);
  },
);

test('hit counts are the ones this corpus is known to produce', () => {
  const result = new Uint8Array(idCodes.length);
  ssSearch('gFp@DiTt@@B', idCodes, result);

  expect(countCode(result, SubstructureResult.match)).toBe(1268);

  ssSearch('gChhMD@bNlA@', idCodes, result);

  expect(countCode(result, SubstructureResult.match)).toBe(48);

  ssSearch('det@@DjYUX^d@@@@B', idCodes, result);

  expect(countCode(result, SubstructureResult.match)).toBe(85);
});

test('a molecule always contains itself', () => {
  const sample = idCodes.slice(0, 50);
  const result = new Uint8Array(1);
  for (const idCode of sample) {
    ssSearch(idCode, [idCode], result);

    expect([idCode, result[0]]).toStrictEqual([
      idCode,
      SubstructureResult.match,
    ]);
  }
});

test('splitting the scan across worker-sized slices gives the same buffer', () => {
  const whole = new Uint8Array(idCodes.length);
  ssSearch('eMDARVB', idCodes, whole);

  const shared = new Uint8Array(new SharedArrayBuffer(idCodes.length));
  const workers = 4;
  const size = Math.ceil(idCodes.length / workers);
  for (let w = 0; w < workers; w++) {
    const from = w * size;
    const to = Math.min(from + size, idCodes.length);
    ssSearch('eMDARVB', idCodes.slice(from, to), shared.subarray(from, to));
  }

  expect(firstDifference(shared, whole)).toBe(-1);
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
  const result = new Uint8Array(1);
  ssSearch('gFp@DiTt@@B', [idCode], result);

  expect(result[0]).toBe(SubstructureResult.unparsable);
});

test('an unparsable idcode is recorded and the scan continues', () => {
  const clean = idCodes.slice(0, 300);
  const expected = new Uint8Array(clean.length);
  ssSearch('gFp@DiTt@@B', clean, expected);

  const mixed = [...clean];
  const broken = new Set([7, 100, 299]);
  for (const index of broken) mixed[index] = '';
  const result = new Uint8Array(mixed.length);
  ssSearch('gFp@DiTt@@B', mixed, result);

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
  const alone = new Uint8Array(1);
  ssSearch('gFp@DiTt@@B', ['C1=CC=CC=C1'], alone);
  const afterLong = new Uint8Array(2);
  ssSearch('gFp@DiTt@@B', [longest, 'C1=CC=CC=C1'], afterLong);

  expect(afterLong[1]).toBe(alone[0]);
});

// Documents a property of the format rather than of this package: an idcode is self-delimiting and
// unvalidated, so trailing bytes are simply never read.
test('trailing junk after a valid idcode is ignored', () => {
  const result = new Uint8Array(1);
  ssSearch('gFp@DiTt@@B', ['gFp@DiTt@@B!!!!'], result);

  expect(result[0]).toBe(SubstructureResult.match);
});

test('a result buffer of the wrong length is refused', () => {
  expect(() =>
    ssSearch('gFp@DiTt@@B', ['gCi@DDfZ@@'], new Uint8Array(2)),
  ).toThrow('result must hold one entry per idcode: got 2 for 1 idcodes');
});

test('an unparsable query is blamed on the query, not on the first molecule', () => {
  expect(() => ssSearch('', idCodes, new Uint8Array(idCodes.length))).toThrow(
    '"" is not a valid query idcode',
  );
});

test('an empty batch writes nothing and does not throw', () => {
  const result = new Uint8Array(0);
  ssSearch('gFp@DiTt@@B', [], result);

  expect(result).toHaveLength(0);
});

test('a previous run does not leak into the next one', () => {
  const result = new Uint8Array(idCodes.length).fill(SubstructureResult.match);
  ssSearch('gChhMD@bNlA@', idCodes, result);

  expect(countCode(result, SubstructureResult.match)).toBe(48);
});

// The WASM module keeps the last query parsed, so a caller scanning one array in several calls does
// not re-parse it. Interleaving queries is what would expose that cache returning the wrong one.
test('interleaving queries gives each the same answers as running it alone', () => {
  const sample = idCodes.slice(0, 300);
  const alone = new Map<string, number[]>();
  for (const { idCode } of QUERIES) {
    const result = new Uint8Array(sample.length);
    ssSearch(idCode, sample, result);
    alone.set(idCode, Array.from(result));
  }

  // walk the queries round-robin, one molecule at a time, so the cache is invalidated constantly
  const interleaved = new Map<string, number[]>(
    QUERIES.map(({ idCode }) => [idCode, []]),
  );
  const one = new Uint8Array(1);
  for (const idCode of sample) {
    for (const query of QUERIES) {
      ssSearch(query.idCode, [idCode], one);
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
  const whole = new Uint8Array(sample.length);
  ssSearch('gFp@DiTt@@B', sample, whole);

  // same query, one molecule per call: every call after the first hits the cached fragment
  const piecewise = new Uint8Array(sample.length);
  for (let i = 0; i < sample.length; i++) {
    ssSearch(
      'gFp@DiTt@@B',
      [sample[i] as string],
      piecewise.subarray(i, i + 1),
    );
  }

  expect(firstDifference(piecewise, whole)).toBe(-1);
});
