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
  const expected = ssSearch(BENZENE, idCodes);

  const summary = await search(BENZENE, idCodes);

  expect(firstDifference(summary.result, expected)).toBe(-1);
  expect(summary.processed).toBe(idCodes.length);
  expect(summary.matched).toBe(1268);
  expect(summary.unparsable).toBe(0);
  expect(summary.stopped).toBe(false);
});

test('similarity mode writes exactly what similaritySearch writes', async () => {
  const slice = idCodes.slice(0, 120);
  const expected = similaritySearch(NAPHTHALENE, slice);

  const summary = await search(NAPHTHALENE, slice, { mode: 'similarity' });

  expect(Array.from(summary.result)).toStrictEqual(Array.from(expected));
  expect(summary.processed).toBe(slice.length);
});

test('onStep reports contiguous ranges that cover the whole scan', async () => {
  const steps: SearchStep[] = [];
  await search(BENZENE, idCodes, {
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
  const summary = await search(BENZENE, idCodes, {
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
  const summary = await search(BENZENE, idCodes, {
    interval: 1,
    onStep: (step) => step.matched < 20,
  });
  const { result, stopped, matched, processed } = summary;

  expect(stopped).toBe(true);
  expect(matched).toBeGreaterThanOrEqual(20);
  expect(processed).toBeLessThan(idCodes.length);
  // everything past the stop is untouched, and everything before it was written
  expect(countCode(result, SubstructureResult.unprocessed)).toBe(
    idCodes.length - processed,
  );

  for (let i = 0; i < processed; i++) {
    expect([i, result[i] !== SubstructureResult.unprocessed]).toStrictEqual([
      i,
      true,
    ]);
  }
});

test('stopping early reads far less than the whole array', async () => {
  const summary = await search(BENZENE, idCodes, {
    interval: 1,
    onStep: (step) => step.matched < 5,
  });

  expect(summary.processed).toBeLessThan(idCodes.length / 4);
});

test('an aborted search rejects with an AbortError', async () => {
  const controller = new AbortController();
  const promise = search(BENZENE, idCodes, {
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
  let stepped = false;

  await expect(
    search(BENZENE, idCodes, {
      controller,
      onStep: () => {
        stepped = true;
      },
    }),
  ).rejects.toThrow(expect.objectContaining({ name: 'AbortError' }));
  expect(stepped).toBe(false);
});

test('unparsable idcodes are counted and the scan carries on', async () => {
  const mixed = idCodes.slice(0, 400);
  mixed[10] = '';
  mixed[300] = 'C1=CC=CC=C1';
  const summary = await search(BENZENE, mixed, { interval: 1 });

  expect(summary.unparsable).toBe(2);
  expect(summary.processed).toBe(mixed.length);
  expect(summary.result[10]).toBe(SubstructureResult.unparsable);
  expect(summary.result[300]).toBe(SubstructureResult.unparsable);
});

test("the buffer is the mode's, and every step carries the one the summary carries", async () => {
  const steps: SearchStep[] = [];
  const substructure = await search(BENZENE, idCodes, {
    interval: 1,
    onStep: (step) => {
      steps.push(step);
    },
  });

  expect(substructure.result).toBeInstanceOf(Uint8Array);
  expect(substructure.result).toHaveLength(idCodes.length);

  for (const step of steps) {
    expect(step.result).toBe(substructure.result);
  }

  const similarity = await search(NAPHTHALENE, idCodes.slice(0, 20), {
    mode: 'similarity',
  });

  expect(similarity.result).toBeInstanceOf(Float32Array);
  expect(similarity.result).toHaveLength(20);
});

test('an empty array resolves without calling onStep', async () => {
  let called = false;
  const summary = await search(BENZENE, [], {
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
  const lenient = await search(NAPHTHALENE, slice, {
    mode: 'similarity',
    threshold: 0.1,
  });
  const strict = await search(NAPHTHALENE, slice, {
    mode: 'similarity',
    threshold: 0.9,
  });

  expect(lenient.matched).toBeGreaterThan(strict.matched);
  expect(strict.matched).toBe(0);
});
