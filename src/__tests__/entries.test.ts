import { expect, test } from 'vitest';

import {
  SubstructureResult,
  similaritySearch,
  substructureSearch,
} from '../index.ts';

import { readIdCodes, referenceSubstructure } from './fixture.ts';

const idCodes = readIdCodes();
const BENZENE = 'gFp@DiTt@@B';
const SULFONAMIDE = 'gChhMD@bNlA@';
const NAPHTHALENE = 'det@@DjYUX^d@@@@B';

/** The 48 sulfonamide matches make a small, exactly known hit set to check the plumbing against. */
const rows = idCodes.map((idCode, index) => ({ id: index, idCode }));

test('idcodes come back as themselves, with their positions', () => {
  const { matches, indexes, matched, total, processed, stopped } =
    substructureSearch(SULFONAMIDE, idCodes);

  expect(matched).toBe(48);
  expect(matches).toHaveLength(48);
  expect(indexes).toHaveLength(48);
  expect(matches[0]).toBe(idCodes[indexes[0] as number]);
  expect(total).toBe(1999);
  expect(processed).toBe(1999);
  expect(stopped).toBe(false);
});

test('an entry matches on its first-level idCode by default', () => {
  const { matches, indexes, result } = substructureSearch(SULFONAMIDE, rows);

  expect(matches).toHaveLength(48);
  // the caller's own objects, not copies
  expect(matches[0]).toBe(rows[indexes[0] as number]);
  expect(matches[47]).toBe(rows[indexes[47] as number]);
  expect(result[indexes[0] as number]).toBe(SubstructureResult.match);
  expect(matches.map((row) => row.id)).toStrictEqual(indexes);
});

test('the idcode can sit anywhere, named by a jpath', () => {
  const nested = idCodes.map((idCode, index) => ({
    id: index,
    molecule: { idCode },
  }));
  const { matches, indexes } = substructureSearch(SULFONAMIDE, nested, {
    jpath: 'molecule.idCode',
  });

  expect(matches).toHaveLength(48);
  expect(matches[0]).toBe(nested[indexes[0] as number]);
});

test('a numeric jpath segment indexes an array', () => {
  const nested = idCodes.map((idCode) => ({ spectra: [{ idCode }] }));
  const { matches, indexes } = substructureSearch(SULFONAMIDE, nested, {
    jpath: 'spectra.0.idCode',
  });

  expect(matches).toHaveLength(48);
  expect(matches[0]).toBe(nested[indexes[0] as number]);
});

test('a jpath that matches nothing is blamed on the jpath, not on the data', () => {
  expect(() =>
    substructureSearch(SULFONAMIDE, rows, { jpath: 'code' }),
  ).toThrow('no entry holds a string at jpath "code"');
  expect(() =>
    substructureSearch(SULFONAMIDE, rows, { jpath: 'molecule.idCode' }),
  ).toThrow('no entry holds a string at jpath "molecule.idCode"');
});

test('an entry with no idcode at the jpath is unparsable, and the scan continues', () => {
  const holed = rows.map((row, index) =>
    index % 500 === 0 ? { id: row.id } : row,
  );
  const { matched, unparsable, result } = substructureSearch(
    SULFONAMIDE,
    holed,
  );

  expect(unparsable).toBe(4);
  expect(result[0]).toBe(SubstructureResult.unparsable);
  expect(result[500]).toBe(SubstructureResult.unparsable);
  // none of the four holes fell on a sulfonamide
  expect(matched).toBe(48);
});

test('limit stops the scan once it has enough matches', () => {
  const { matches, processed, stopped, total } = substructureSearch(
    BENZENE,
    rows,
    { limit: 10, stepSize: 32 },
  );

  expect(matches).toHaveLength(10);
  expect(stopped).toBe(true);
  expect(processed).toBeLessThan(total);
  expect(matches.map((row) => row.id)).toStrictEqual([
    1, 2, 4, 5, 6, 7, 9, 10, 11, 12,
  ]);

  // the same ten openchemlib-js finds first, so `limit` cannot quietly skip one
  const reference = referenceSubstructure(BENZENE, idCodes.slice(0, 13));
  const expected: number[] = [];
  for (let i = 0; i < reference.length; i++) {
    if (reference[i] === SubstructureResult.match) expected.push(i);
  }

  expect(expected).toStrictEqual(matches.map((row) => row.id));
});

test('limit keeps the first matches in input order', () => {
  const all = substructureSearch(SULFONAMIDE, rows);
  const capped = substructureSearch(SULFONAMIDE, rows, {
    limit: 5,
    stepSize: 64,
  });

  expect(capped.matches).toStrictEqual(all.matches.slice(0, 5));
});

test('collect off fills the buffer and counts, and allocates no match list', () => {
  const { matches, indexes, matched, result } = substructureSearch(
    SULFONAMIDE,
    rows,
    { collect: false },
  );

  expect(matches).toHaveLength(0);
  expect(indexes).toHaveLength(0);
  expect(matched).toBe(48);
  expect(result).toHaveLength(1999);
});

test('onStep sees the scan advance and can stop it', () => {
  const seen: number[] = [];
  const { processed, stopped, matches } = substructureSearch(BENZENE, rows, {
    stepSize: 250,
    onStep: (step) => {
      seen.push(step.processed);

      expect(step.total).toBe(1999);

      return step.processed < 750;
    },
  });

  expect(seen).toStrictEqual([250, 500, 750]);
  expect(processed).toBe(750);
  expect(stopped).toBe(true);
  expect(matches.length).toBeGreaterThan(0);
});

test('without onStep or limit the whole array is one step', () => {
  let steps = 0;
  substructureSearch(SULFONAMIDE, rows, {
    onStep: () => {
      steps++;
    },
  });

  expect(steps).toBe(Math.ceil(1999 / 4096));
});

test('similarity ranks the entries, most similar first', () => {
  const sample = rows.slice(0, 150);
  const { matches, similarities, indexes, result, matched } = similaritySearch(
    NAPHTHALENE,
    sample,
  );

  expect(matched).toBe(150);
  expect(matches).toHaveLength(150);
  expect(similarities).toHaveLength(150);

  for (let i = 0; i < matches.length; i++) {
    expect(matches[i]).toBe(sample[indexes[i] as number]);
    expect(similarities[i]).toBe(result[indexes[i] as number]);
  }
  for (let i = 1; i < similarities.length; i++) {
    expect(similarities[i] as number).toBeLessThanOrEqual(
      similarities[i - 1] as number,
    );
  }
});

test('threshold drops the entries below it, limit keeps the best', () => {
  const sample = rows.slice(0, 150);
  const all = similaritySearch(NAPHTHALENE, sample);
  const above = similaritySearch(NAPHTHALENE, sample, { threshold: 0.5 });
  const best = similaritySearch(NAPHTHALENE, sample, { limit: 3 });

  let expected = 0;
  for (const value of all.result) {
    if (value >= 0.5) expected++;
  }

  expect(above.matched).toBe(expected);
  expect(above.matches).toHaveLength(expected);
  // a threshold decides what is kept; every entry is still compared
  expect(above.processed).toBe(150);

  expect(best.matches).toStrictEqual(all.matches.slice(0, 3));
  expect(Array.from(best.similarities)).toStrictEqual(
    Array.from(all.similarities.slice(0, 3)),
  );
  // limit can never stop a similarity scan: a better match may still be coming
  expect(best.stopped).toBe(false);
  expect(best.processed).toBe(150);
});

test('similarity reads the jpath too, and skips unparsable entries', () => {
  const nested = idCodes
    .slice(0, 60)
    .map((idCode, index) => ({ id: index, molecule: { idCode } }));
  const holed = nested.map((entry, index) =>
    index === 7 ? { id: entry.id, molecule: {} } : entry,
  );
  const { matches, unparsable, matched } = similaritySearch(
    NAPHTHALENE,
    holed,
    { jpath: 'molecule.idCode' },
  );

  expect(unparsable).toBe(1);
  expect(matched).toBe(59);
  expect(matches).toHaveLength(59);
  expect(matches.some((entry) => entry.id === 7)).toBe(false);
});
