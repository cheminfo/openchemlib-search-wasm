// Not a benchmark.js suite, on purpose.
//
// benchmark.js samples: it calls the function until it has 30 timings it can put an error bar on.
// A whole-corpus scan takes between two and twenty seconds, so 30 samples of the eight rows below
// would be about half an hour for eight numbers, and the sampling would tell us nothing the numbers
// do not — a nine-second scan has no measurable per-call overhead to average away, and its variance
// is the machine's scheduler, which more samples do not remove. What matters here is the wall time
// somebody waits for, so that is what this measures: one scan per row, reported with each worker's
// own time so an uneven split shows up as a spread rather than hiding in the mean.

import { parseArgs } from 'node:util';
import { Worker } from 'node:worker_threads';

import { findCorpus } from './lib/corpus.js';
import { queryByName } from './lib/queries.js';
import { conclude, count, printHeader, printTable } from './lib/report.js';
import { readSharedCorpus, sliceCorpus } from './lib/shared.js';

const WORKER = new URL('scan-worker.mjs', import.meta.url);
const MATCH = 1;

const { values: options } = parseArgs({
  options: {
    workers: { type: 'string', default: '1,2,4,8' },
    query: { type: 'string', default: 'benzene' },
    engine: { type: 'string', default: 'both' },
    file: { type: 'string' },
  },
});

const counts = options.workers.split(',').map(Number);
const query = queryByName(options.query);
const engines =
  options.engine === 'both' ? ['wasm', 'openchemlib-js'] : [options.engine];
const path = options.file ?? findCorpus().path;

printHeader(
  'Whole-corpus scan across worker threads, on a SharedArrayBuffer',
  null,
);

const corpus = readSharedCorpus(path);
const resultBuffer = new SharedArrayBuffer(corpus.total);
const result = new Uint8Array(resultBuffer);
console.log(
  `corpus ${count(corpus.total)} idcodes, ${(corpus.bytes.length / 1024 / 1024).toFixed(2)} MB ` +
    `shared once\n       ${path}`,
);
console.log(`query  ${query.name} (${query.smiles}) ${query.idCode}\n`);

const rows = [];
const throughput = new Map();
let hits = -1;
/* eslint-disable no-await-in-loop -- the rows must run one at a time or they would compete for the
   same cores and every number would be wrong. */
for (const engine of engines) {
  for (const workers of counts) {
    result.fill(0);
    const run = await scan(engine, workers);
    const matches = countMatches();
    if (hits === -1) hits = matches;
    if (matches !== hits) {
      throw new Error(
        `${engine} on ${workers} workers found ${matches} matches where an earlier row found ` +
          `${hits}: the rows are not scanning the same corpus`,
      );
    }
    const perSecond = corpus.total / run.wallSeconds;
    throughput.set(`${engine} ${workers}`, perSecond);
    const oneWorker = throughput.get(`${engine} 1`);
    rows.push([
      engine,
      String(workers),
      run.wallSeconds.toFixed(2),
      `${(perSecond / 1000).toFixed(1)}k`,
      oneWorker ? `${(perSecond / oneWorker).toFixed(2)}x` : '-',
      `${run.slowest.toFixed(2)} / ${run.fastest.toFixed(2)}`,
      run.loadMilliseconds.toFixed(0),
      run.startupSeconds.toFixed(2),
    ]);
    console.log(
      `${engine.padEnd(15)}${String(workers).padStart(2)} workers  ` +
        `${run.wallSeconds.toFixed(2)} s  ${(perSecond / 1000).toFixed(1)}k molecules/s  ` +
        `${count(matches)} matches`,
    );
  }
}
/* eslint-enable no-await-in-loop */

console.log('');
printTable(
  [
    { title: 'engine', align: 'left' },
    { title: 'workers' },
    { title: 'wall s' },
    { title: 'molecules/s' },
    { title: 'scaling' },
    { title: 'slowest / fastest worker, s' },
    { title: 'engine load, ms' },
    { title: 'startup s' },
  ],
  rows,
);

const best = counts.at(-1);
const wasmBest = throughput.get(`wasm ${best}`);
const jsBest = throughput.get(`openchemlib-js ${best}`);
conclude(
  wasmBest && jsBest
    ? `Both engines parallelise, so the honest claim is per core: openchemlib-search-wasm is ` +
        `${(wasmBest / jsBest).toFixed(2)}x openchemlib-js on ${best} workers, the same ratio it ` +
        `has on one. ${count(hits)} of ${count(corpus.total)} molecules matched ` +
        `${query.name} in ${(corpus.total / wasmBest).toFixed(2)} s.`
    : `${count(hits)} of ${count(corpus.total)} molecules matched ${query.name}.`,
);

async function scan(engine, workers) {
  const slices = sliceCorpus(corpus.starts, corpus.total, workers);
  const startupStart = performance.now();
  const pool = slices.map(
    (slice) =>
      new Worker(WORKER, {
        workerData: {
          engine,
          queryIdCode: query.idCode,
          corpus: corpus.buffer,
          result: resultBuffer,
          ...slice,
        },
      }),
  );
  const ready = pool.map(
    (worker) =>
      new Promise((resolve, reject) => {
        worker.once('error', reject);
        worker.once('message', resolve);
      }),
  );
  const started = await Promise.all(ready);
  const startupSeconds = (performance.now() - startupStart) / 1000;
  const loadMilliseconds = Math.max(
    ...started.map((message) => message.loadMilliseconds),
  );

  const finished = pool.map(
    (worker) =>
      new Promise((resolve, reject) => {
        worker.once('error', reject);
        worker.once('message', resolve);
      }),
  );
  const start = performance.now();
  for (const worker of pool) worker.postMessage('go');
  const reports = await Promise.all(finished);
  const wallSeconds = (performance.now() - start) / 1000;
  const times = reports.map((message) => message.scanMilliseconds / 1000);
  await Promise.all(pool.map((worker) => worker.terminate()));

  return {
    wallSeconds,
    startupSeconds,
    loadMilliseconds,
    slowest: Math.max(...times),
    fastest: Math.min(...times),
  };
}

function countMatches() {
  let matches = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i] === MATCH) matches++;
  }
  return matches;
}
