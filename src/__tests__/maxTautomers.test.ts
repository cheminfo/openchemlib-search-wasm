import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';

import { expect, test } from 'vitest';

import {
  DEFAULT_MAX_TAUTOMERS,
  getNoStereoTautomerHash,
  getNoStereoTautomerIdCode,
  getNoStereoTautomerIdCodes,
} from '../index.ts';

import { fromSmiles, readIdCodes } from './fixture.ts';

/**
 * A decapeptide: enough amides that OpenChemLib runs into any ceiling worth setting.
 * @returns Its idcode.
 */
function talkative(): string {
  let smiles = 'N';
  for (let i = 0; i < 10; i++) {
    smiles += '[C@@H](C)C(=O)N';
  }
  return fromSmiles(`${smiles}C`);
}

test('the count is written for every molecule', () => {
  const idCodes = readIdCodes().slice(0, 25);
  const tautomerCounts = new Int32Array(idCodes.length);

  getNoStereoTautomerIdCodes(idCodes, { tautomerCounts });

  expect(tautomerCounts).toHaveLength(idCodes.length);

  for (const count of tautomerCounts) {
    expect(count).toBeGreaterThan(0);
  }
});

test('a molecule with no tautomeric site needs exactly one tautomer', () => {
  const tautomerCounts = new Int32Array(1);

  getNoStereoTautomerIdCode(fromSmiles('c1ccccc1'), { tautomerCounts });

  expect(tautomerCounts[0]).toBe(1);
});

test('reaching maxTautomers is what says OpenChemLib stopped early', () => {
  const idCode = talkative();
  const tautomerCounts = new Int32Array(1);

  getNoStereoTautomerIdCode(idCode, { maxTautomers: 500, tautomerCounts });

  expect(tautomerCounts[0]).toBeGreaterThanOrEqual(500);
});

test('a ceiling bounds the cost of the molecules that run into it', () => {
  const idCode = talkative();

  const cheap = performance.now();
  getNoStereoTautomerIdCode(idCode, { maxTautomers: 1000 });
  const cheapMs = performance.now() - cheap;

  const dear = performance.now();
  getNoStereoTautomerIdCode(idCode, { maxTautomers: DEFAULT_MAX_TAUTOMERS });
  const dearMs = performance.now() - dear;

  expect(cheapMs).toBeLessThan(dearMs);
  // the whole point: the tail is bounded, not merely smaller
  expect(cheapMs).toBeLessThan(100);
}, 30_000);

// A key built from a truncated enumeration depends on where it was truncated, so it is not the
// canonical one. This is why the count has to be recorded next to the key.
test('a key from a capped enumeration is not the uncapped key', () => {
  const idCode = talkative();

  expect(getNoStereoTautomerIdCode(idCode, { maxTautomers: 100 })).not.toBe(
    getNoStereoTautomerIdCode(idCode, { maxTautomers: DEFAULT_MAX_TAUTOMERS }),
  );
}, 30_000);

test('a molecule under the ceiling gives the same key whatever the ceiling', () => {
  const idCode = fromSmiles('CCC(=O)CC');

  expect(getNoStereoTautomerIdCode(idCode, { maxTautomers: 100 })).toBe(
    getNoStereoTautomerIdCode(idCode, { maxTautomers: DEFAULT_MAX_TAUTOMERS }),
  );
});

test('the hash follows the same ceiling as the idcode', () => {
  const idCode = talkative();
  const options = { maxTautomers: 200 } as const;

  expect(getNoStereoTautomerHash(idCode, options)).not.toBe(
    getNoStereoTautomerHash(idCode),
  );
}, 30_000);

test('an enumeration that reaches the ceiling stops exactly at it', () => {
  const tautomerCounts = new Int32Array(1);

  getNoStereoTautomerIdCode(talkative(), { maxTautomers: 500, tautomerCounts });

  expect(tautomerCounts[0]).toBe(500);
});

// C216H154N16O8, a 240-atom conjugated system from PubChem: one expansion step adds far more
// variants than the ceiling, which filled a 4.4 GB worker heap before the overlay bounded the set.
test('the ceiling bounds the memory of a large conjugated system', async () => {
  const idCode = readFileSync(
    join(import.meta.dirname, 'data/conjugated-240-atoms.idcode'),
    'utf8',
  ).trim();
  const index = pathToFileURL(join(import.meta.dirname, '../index.ts')).href;
  const worker = new Worker(
    `const { parentPort, workerData } = require('node:worker_threads');
    import(${JSON.stringify(index)}).then(({ getMoleculeRecords }) => {
      const records = getMoleculeRecords([workerData], { maxTautomers: 5000 });
      parentPort.postMessage(records.tautomerCounts[0]);
    });`,
    {
      eval: true,
      workerData: idCode,
      resourceLimits: { maxOldGenerationSizeMb: 1024 },
    },
  );

  const count = await new Promise((resolve, reject) => {
    worker.once('message', resolve);
    worker.once('error', reject);
  });
  await worker.terminate();

  expect(count).toBe(5000);
}, 120_000);

test('the default ceiling is OpenChemLib own', () => {
  expect(DEFAULT_MAX_TAUTOMERS).toBe(100_000);
});
