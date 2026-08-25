import { parseArgs } from 'node:util';

import Benchmark from 'benchmark';

import { loadCorpus } from './lib/corpus.js';
import { countMatches, ssSearchJs } from './lib/openchemlibJs.js';
import { QUERIES } from './lib/queries.js';
import {
  conclude,
  count,
  createReporter,
  duration,
  openchemlibVersion,
  printHeader,
  printTable,
} from './lib/report.js';

import { ssSearch } from '#lib';

const DEFAULT_SIZE = 25_000;
const DEFAULT_SAMPLES = 30;

const { values: options } = parseArgs({
  options: {
    size: { type: 'string', default: String(DEFAULT_SIZE) },
    samples: { type: 'string', default: String(DEFAULT_SAMPLES) },
  },
});

const minSamples = Number(options.samples);
const corpus = loadCorpus(Number(options.size));
const { idCodes } = corpus;
const molecules = idCodes.length;

printHeader(
  `openchemlib-search-wasm vs openchemlib-js ${openchemlibVersion()} — batch substructure search`,
  corpus,
);

const wasmResult = new Uint8Array(molecules);
const jsResult = new Uint8Array(molecules);
const hits = new Map();

// The two engines run through this file's cases as two functions and never one shared one: a single
// scanner called with both would see two call shapes at every site and be measured half-optimised
// for each. A query is only a string value, so the six of them share a scanner without that risk.
function scanWasm(query) {
  ssSearch(query.idCode, idCodes, wasmResult);
  hits.set(`${query.name} wasm`, countMatches(wasmResult));
}

function scanJs(query) {
  ssSearchJs(query.idCode, idCodes, jsResult);
  hits.set(`${query.name} openchemlib-js`, countMatches(jsResult));
}

console.log('Same work? one scan per engine per query, hit counts compared.\n');

const checks = [];
let wasmSeconds = 0;
let jsSeconds = 0;
for (const query of QUERIES) {
  wasmSeconds += seconds(() => scanWasm(query));
  jsSeconds += seconds(() => scanJs(query));
  const wasmHits = hits.get(`${query.name} wasm`);
  const jsHits = hits.get(`${query.name} openchemlib-js`);
  if (wasmHits !== jsHits) {
    throw new Error(
      `${query.name} (${query.idCode}): openchemlib-search-wasm found ${wasmHits} matches and ` +
        `openchemlib-js found ${jsHits} over the same ${molecules} idcodes. The two engines are ` +
        'not doing the same work, so nothing timed below means anything.',
    );
  }
  checks.push([
    query.name,
    query.smiles,
    count(wasmHits),
    count(jsHits),
    `${((100 * wasmHits) / molecules).toFixed(2)}%`,
    'equal',
  ]);
}

printTable(
  [
    { title: 'query', align: 'left' },
    { title: 'SMILES', align: 'left' },
    { title: 'wasm hits' },
    { title: 'openchemlib-js hits' },
    { title: 'hit rate' },
    { title: '' },
  ],
  checks,
);

console.log(
  `\nTiming ${QUERIES.length * 2} cases at ${minSamples} samples each, about ` +
    `${duration((wasmSeconds + jsSeconds) * minSamples)}.\n`,
);

const reporter = createReporter(
  molecules,
  (name) => `${count(hits.get(name))} matches`,
);
const suite = new Benchmark.Suite();
for (const query of QUERIES) {
  suite.add(`${query.name} wasm`, () => scanWasm(query), {
    minSamples,
  });
  suite.add(`${query.name} openchemlib-js`, () => scanJs(query), {
    minSamples,
  });
}
suite.on('cycle', reporter.onCycle);
suite.run({ async: false });

const summary = [];
let ratioTotal = 0;
for (const query of QUERIES) {
  const wasm = reporter.results.get(`${query.name} wasm`);
  const js = reporter.results.get(`${query.name} openchemlib-js`);
  ratioTotal += js.perUnit / wasm.perUnit;
  summary.push([
    query.name,
    wasm.perUnit.toFixed(2),
    js.perUnit.toFixed(2),
    `${(js.perUnit / wasm.perUnit).toFixed(2)}x`,
    `${(1000 / wasm.perUnit).toFixed(1)}k`,
    `${(1000 / js.perUnit).toFixed(1)}k`,
  ]);
}

console.log('');
printTable(
  [
    { title: 'query', align: 'left' },
    { title: 'wasm µs/mol' },
    { title: 'ocl-js µs/mol' },
    { title: 'speedup' },
    { title: 'wasm mol/s' },
    { title: 'ocl-js mol/s' },
  ],
  summary,
);

conclude(
  `openchemlib-search-wasm is ${(ratioTotal / QUERIES.length).toFixed(2)}x openchemlib-js on one thread, ` +
    'over six queries with identical hit counts.',
);

function seconds(run) {
  const start = process.hrtime.bigint();
  run();
  return Number(process.hrtime.bigint() - start) / 1e9;
}
