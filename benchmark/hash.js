import { parseArgs } from 'node:util';

import Benchmark from 'benchmark';

import { loadCorpus } from './lib/corpus.js';
import {
  conclude,
  createReporter,
  micro,
  printHeader,
  printTable,
  rmeText,
} from './lib/report.js';

import { getNoStereoHashes, getNoStereoTautomerHashes } from '#lib';

const DEFAULT_SIZE = 250;
const DEFAULT_SAMPLES = 30;

const { values: options } = parseArgs({
  options: {
    size: { type: 'string', default: String(DEFAULT_SIZE) },
    samples: { type: 'string', default: String(DEFAULT_SAMPLES) },
    // A few molecules per hundred have so many tautomeric sites that OpenChemLib spends the better
    // part of a second on them before abandoning the enumeration. They are real, so they are in by
    // default, but they cost hundreds of times the median and drown everything else in the average:
    // drop them to see what the two hashes cost on a molecule that is not pathological.
    'skip-slow': { type: 'boolean', default: false },
  },
});

const minSamples = Number(options.samples);
const corpus = loadCorpus(Number(options.size));
const idCodes = options['skip-slow']
  ? withoutSlow(corpus.idCodes)
  : corpus.idCodes;
const molecules = idCodes.length;

printHeader(
  'openchemlib-search-wasm — what the two identity hashes cost',
  corpus,
);

// Each case gets its own function so the two shapes never share a call site: one hasher called with
// both would be measured half-optimised for each.
function hashNoStereo() {
  return getNoStereoHashes(idCodes);
}

function hashNoStereoTautomer() {
  return getNoStereoTautomerHashes(idCodes);
}

const noStereo = hashNoStereo();
const noStereoTautomer = hashNoStereoTautomer();
const suiteOptions = { minSamples, maxTime: 30 };
const describe = (name) =>
  String(name === 'no-stereo' ? noStereo[0] : noStereoTautomer[0]);
const { onCycle, results } = createReporter(molecules, describe);

console.log(
  `Two cases over ${molecules} molecules, ${minSamples} samples each.\n`,
);

new Benchmark.Suite()
  .add('no-stereo', hashNoStereo, suiteOptions)
  .add('no-stereo tautomer', hashNoStereoTautomer, suiteOptions)
  .on('cycle', onCycle)
  .on('complete', report)
  .run();

function report() {
  const plain = results.get('no-stereo');
  const tautomer = results.get('no-stereo tautomer');
  printTable(
    [
      { title: 'case', align: 'left' },
      { title: 'µs/molecule' },
      { title: 'rme' },
      { title: 'samples' },
    ],
    [...results].map(([name, statistics]) => [
      name,
      micro(statistics.perUnit),
      rmeText(statistics.rme),
      String(statistics.samples),
    ]),
  );

  conclude(
    `The tautomer hash costs ${(tautomer.perUnit / plain.perUnit).toFixed(0)}x the no-stereo one ` +
      'here. Run again with --skip-slow to see the same two hashes without the molecules ' +
      'OpenChemLib gives up enumerating, which is where that ratio comes from.',
  );
}

/**
 * Drops the molecules whose tautomer hash costs more than ten times the median of the sample.
 * @param {string[]} all - The sampled idcodes.
 * @returns {string[]} The ones that hash in ordinary time.
 */
function withoutSlow(all) {
  const costs = new Array(all.length);
  for (let i = 0; i < all.length; i++) {
    const start = performance.now();
    getNoStereoTautomerHashes([all[i]]);
    costs[i] = performance.now() - start;
  }
  const median = costs.toSorted((a, b) => a - b)[costs.length >> 1];
  const kept = [];
  for (let i = 0; i < all.length; i++) {
    if (costs[i] <= 10 * median) kept.push(all[i]);
  }
  console.log(
    `dropped ${all.length - kept.length} of ${all.length} molecules costing more than ` +
      `${(10 * median).toFixed(1)} ms each\n`,
  );
  return kept;
}
