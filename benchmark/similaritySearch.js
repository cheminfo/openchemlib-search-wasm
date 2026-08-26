import { parseArgs } from 'node:util';

import Benchmark from 'benchmark';

import { loadCorpus } from './lib/corpus.js';
import { fingerprintJs, similaritySearchJs } from './lib/openchemlibJs.js';
import { queryByName } from './lib/queries.js';
import {
  conclude,
  count,
  createReporter,
  duration,
  micro,
  openchemlibVersion,
  printHeader,
  printTable,
} from './lib/report.js';
import { WORDS, fillStore, popCountOf, tanimotoScan } from './lib/tanimoto.js';

import { similaritySearch } from '#lib';

// A FragFp fingerprint costs about a millisecond to build, so a one-second cycle is a thousand
// molecules for WASM and a couple of hundred for openchemlib-js. Both engines get the same corpus.
const DEFAULT_SIZE = 1000;
const DEFAULT_SAMPLES = 30;

// The stored-fingerprint case runs over a store the size of the whole reference corpus, because
// what a caller wants to know is what one pass over a real library costs.
const STORE_SIZE = 409_686;

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
const query = queryByName('benzene');

printHeader(
  `openchemlib-search-wasm vs openchemlib-js ${openchemlibVersion()} — batch similarity (FragFp, Tanimoto)`,
  corpus,
);

// Each scan hands back its own buffer; the last one of each engine is what the checks read.
let wasmResult = new Float32Array(molecules);
let jsResult = new Float32Array(molecules);

console.log('Same work? one scan per engine, similarities compared.\n');
const wasmSeconds = seconds(() => {
  wasmResult = similaritySearch(query.idCode, idCodes);
});
const jsSeconds = seconds(() => {
  jsResult = similaritySearchJs(query.idCode, idCodes);
});
let worst = 0;
for (let i = 0; i < molecules; i++) {
  const difference = Math.abs(wasmResult[i] - jsResult[i]);
  if (difference > worst) worst = difference;
}
if (worst !== 0) {
  throw new Error(
    `the two engines disagree by up to ${worst} over the same ${molecules} idcodes, so nothing ` +
      'timed below compares like with like',
  );
}
console.log(
  `max |wasm - openchemlib-js| = ${worst} over ${count(molecules)} molecules, mean similarity ` +
    `${(total(wasmResult) / molecules).toFixed(4)}\n`,
);

const queryFingerprint = Int32Array.from(fingerprintJs(query.idCode));
const queryBits = popCountOf(queryFingerprint);
const store = new Int32Array(STORE_SIZE * WORDS);
const storeBits = new Int32Array(STORE_SIZE);
const similarities = new Float32Array(STORE_SIZE);
const setupSeconds = seconds(() => {
  fillStore(store, storeBits, idCodes, fingerprintJs);
});
checkTanimoto();
console.log(
  `Stored-fingerprint store: ${count(STORE_SIZE)} entries of ${WORDS * 32} bits ` +
    `(${((store.byteLength + storeBits.byteLength) / 1024 / 1024).toFixed(1)} MB), built from the ` +
    `${count(molecules)} fingerprints above in ${setupSeconds.toFixed(1)} s.\n`,
);

const computed = new Map();

function scanWasm() {
  wasmResult = similaritySearch(query.idCode, idCodes);
  computed.set('wasm', `mean ${(total(wasmResult) / molecules).toFixed(4)}`);
}

function scanJs() {
  jsResult = similaritySearchJs(query.idCode, idCodes);
  computed.set(
    'openchemlib-js',
    `mean ${(total(jsResult) / molecules).toFixed(4)}`,
  );
}

function scanStore() {
  tanimotoScan(queryFingerprint, queryBits, store, storeBits, similarities);
  computed.set(
    'stored fingerprints',
    `mean ${(total(similarities) / STORE_SIZE).toFixed(4)}`,
  );
}

console.log(
  `Timing 3 cases at ${minSamples} samples each, about ` +
    `${duration((wasmSeconds + jsSeconds + 1) * minSamples)}.\n`,
);

const unitsOf = (name) =>
  name === 'stored fingerprints' ? STORE_SIZE : molecules;
const reporter = createReporter(unitsOf, (name) => computed.get(name));
const suite = new Benchmark.Suite();
suite.add('wasm', scanWasm, { minSamples });
suite.add('openchemlib-js', scanJs, { minSamples });
// One pass over the store is well under the second a measurement has to run, so benchmark.js is
// told to fill each sample with as many passes as that takes.
suite.add('stored fingerprints', scanStore, { minSamples, minTime: 1 });
suite.on('cycle', reporter.onCycle);
suite.run({ async: false });

const wasmPer = reporter.results.get('wasm').perUnit;
const jsPer = reporter.results.get('openchemlib-js').perUnit;
const storePer = reporter.results.get('stored fingerprints').perUnit;

console.log('');
printTable(
  [
    { title: 'what one molecule costs', align: 'left' },
    { title: 'µs/molecule' },
    { title: 'molecules/s' },
    { title: 'whole 409,686 corpus' },
  ],
  [
    [
      'wasm: idcode → FragFp → Tanimoto',
      micro(wasmPer),
      rate(wasmPer),
      span(wasmPer),
    ],
    ['openchemlib-js: the same', micro(jsPer), rate(jsPer), span(jsPer)],
    [
      'plain JS: Tanimoto on a stored FragFp',
      micro(storePer),
      rate(storePer),
      span(storePer),
    ],
  ],
);

conclude(
  `Building the fingerprint is ${count(Math.round(wasmPer / storePer))}x the cost of comparing ` +
    'one, so a caller that already stores fingerprints should never call similaritySearch: ' +
    `${span(storePer)} of plain JS ranks the whole corpus against ${span(wasmPer)} of WASM. ` +
    `openchemlib-search-wasm is ${(jsPer / wasmPer).toFixed(2)}x openchemlib-js when idcodes really are ` +
    'all you have.',
);

function checkTanimoto() {
  tanimotoScan(queryFingerprint, queryBits, store, storeBits, similarities);
  for (let i = 0; i < molecules; i++) {
    if (Math.abs(similarities[i] - jsResult[i]) > 1e-6) {
      throw new Error(
        `the plain-JS Tanimoto disagrees with SSSearcherWithIndex.getSimilarityTanimoto at entry ` +
          `${i}: ${similarities[i]} against ${jsResult[i]}`,
      );
    }
  }
}

function rate(microseconds) {
  return count(Math.round(1e6 / microseconds));
}

function span(microseconds) {
  const totalSeconds = (STORE_SIZE * microseconds) / 1e6;
  if (totalSeconds < 1) return `${(totalSeconds * 1000).toFixed(0)} ms`;
  return totalSeconds < 90
    ? `${totalSeconds.toFixed(1)} s`
    : `${(totalSeconds / 60).toFixed(1)} min`;
}

function total(buffer) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i];
  }
  return sum;
}

function seconds(run) {
  const start = process.hrtime.bigint();
  run();
  return Number(process.hrtime.bigint() - start) / 1e9;
}
