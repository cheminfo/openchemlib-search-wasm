import { expect, test } from 'vitest';

import {
  SubstructureResult,
  search,
  similaritySearch,
  ssSearch,
} from '../index.ts';
import type { SearchStep } from '../types.ts';

import { countCode, firstDifference, readIdCodes } from './fixture.ts';

const idCodes = readIdCodes();
const BENZENE = 'gFp@DiTt@@B';
const NAPHTHALENE = 'det@@DjYUX^d@@@@B';

test('a full substructure search writes exactly what ssSearch writes', async () => {
  const expected = new Uint8Array(idCodes.length);
  ssSearch(BENZENE, idCodes, expected);

  const result = new Uint8Array(idCodes.length);
  const summary = await search(BENZENE, idCodes, result);

  expect(firstDifference(result, expected)).toBe(-1);
  expect(summary.processed).toBe(idCodes.length);
  expect(summary.matched).toBe(1268);
  expect(summary.unparsable).toBe(0);
  expect(summary.stopped).toBe(false);
});

test('similarity mode writes exactly what similaritySearch writes', async () => {
  const slice = idCodes.slice(0, 120);
  const expected = new Float32Array(slice.length);
  similaritySearch(NAPHTHALENE, slice, expected);

  const result = new Float32Array(slice.length);
  const summary = await search(NAPHTHALENE, slice, result, {
    mode: 'similarity',
  });

  expect(Array.from(result)).toStrictEqual(Array.from(expected));
  expect(summary.processed).toBe(slice.length);
});

test('onStep reports contiguous ranges that cover the whole scan', async () => {
  const steps: SearchStep[] = [];
  const result = new Uint8Array(idCodes.length);
  await search(BENZENE, idCodes, result, {
    interval: 1,
    onStep: (step) => {
      steps.push(step);
    },
  });

  expect(steps.length).toBeGreaterThan(1);
  expect(steps[0]?.from).toBe(0);
  expect(steps.at(-1)?.to).toBe(idCodes.length);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i] as SearchStep;

    expect([i, step.from]).toStrictEqual([i, i === 0 ? 0 : steps[i - 1]?.to]);
    expect(step.to).toBeGreaterThan(step.from);
    expect(step.processed).toBe(step.to);
    expect(step.total).toBe(idCodes.length);
  }

  expect(steps.at(-1)?.matched).toBe(1268);
});

test('the running match count only ever grows, and ends at the total', async () => {
  const counts: number[] = [];
  const result = new Uint8Array(idCodes.length);
  const summary = await search(BENZENE, idCodes, result, {
    interval: 1,
    onStep: (step) => {
      counts.push(step.matched);
    },
  });
  for (let i = 1; i < counts.length; i++) {
    expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1] as number);
  }

  expect(counts.at(-1)).toBe(summary.matched);
});

test('returning false from onStep stops the scan and leaves the rest unprocessed', async () => {
  const result = new Uint8Array(idCodes.length);
  const summary = await search(BENZENE, idCodes, result, {
    interval: 1,
    onStep: (step) => step.matched < 20,
  });

  expect(summary.stopped).toBe(true);
  expect(summary.matched).toBeGreaterThanOrEqual(20);
  expect(summary.processed).toBeLessThan(idCodes.length);
  // everything past the stop is untouched, and everything before it was written
  expect(countCode(result, SubstructureResult.unprocessed)).toBe(
    idCodes.length - summary.processed,
  );

  for (let i = 0; i < summary.processed; i++) {
    expect([i, result[i] !== SubstructureResult.unprocessed]).toStrictEqual([
      i,
      true,
    ]);
  }
});

test('stopping early reads far less than the whole array', async () => {
  const result = new Uint8Array(idCodes.length);
  const summary = await search(BENZENE, idCodes, result, {
    interval: 1,
    onStep: (step) => step.matched < 5,
  });

  expect(summary.processed).toBeLessThan(idCodes.length / 4);
});

test('an aborted search rejects with an AbortError', async () => {
  const controller = new AbortController();
  const result = new Uint8Array(idCodes.length);
  const promise = search(BENZENE, idCodes, result, {
    interval: 1,
    controller,
    onStep: () => {
      controller.abort();
    },
  });

  await expect(promise).rejects.toThrow(
    expect.objectContaining({ name: 'AbortError' }),
  );
});

test('a search aborted before it starts does no work', async () => {
  const controller = new AbortController();
  controller.abort();
  const result = new Uint8Array(idCodes.length);

  await expect(
    search(BENZENE, idCodes, result, { controller }),
  ).rejects.toThrow(expect.objectContaining({ name: 'AbortError' }));
  expect(countCode(result, SubstructureResult.unprocessed)).toBe(
    idCodes.length,
  );
});

test('unparsable idcodes are counted and the scan carries on', async () => {
  const mixed = idCodes.slice(0, 400);
  mixed[10] = '';
  mixed[300] = 'C1=CC=CC=C1';
  const result = new Uint8Array(mixed.length);
  const summary = await search(BENZENE, mixed, result, { interval: 1 });

  expect(summary.unparsable).toBe(2);
  expect(summary.processed).toBe(mixed.length);
  expect(result[10]).toBe(SubstructureResult.unparsable);
  expect(result[300]).toBe(SubstructureResult.unparsable);
});

test('the result buffer must match the mode', async () => {
  await expect(
    search(BENZENE, ['gCi@DDfZ@@'], new Uint8Array(1), { mode: 'similarity' }),
  ).rejects.toThrow(
    'similarity search writes a Float32Array, but result is a Uint8Array',
  );
  await expect(
    search(BENZENE, ['gCi@DDfZ@@'], new Float32Array(1)),
  ).rejects.toThrow(
    'substructure search writes a Uint8Array, but result is a Float32Array',
  );
});

test('a result buffer of the wrong length is refused', async () => {
  await expect(
    search(BENZENE, ['gCi@DDfZ@@'], new Uint8Array(4)),
  ).rejects.toThrow('result must hold one entry per idcode');
});

test('an empty array resolves without calling onStep', async () => {
  let called = false;
  const summary = await search(BENZENE, [], new Uint8Array(0), {
    onStep: () => {
      called = true;
    },
  });

  expect([called, summary.processed, summary.matched]).toStrictEqual([
    false,
    0,
    0,
  ]);
});

test('the similarity threshold decides what counts as matched', async () => {
  const slice = idCodes.slice(0, 120);
  const lenient = await search(NAPHTHALENE, slice, new Float32Array(120), {
    mode: 'similarity',
    threshold: 0.1,
  });
  const strict = await search(NAPHTHALENE, slice, new Float32Array(120), {
    mode: 'similarity',
    threshold: 0.9,
  });

  expect(lenient.matched).toBeGreaterThan(strict.matched);
  expect(strict.matched).toBe(0);
});
