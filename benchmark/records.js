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

import {
  INDEX_WORDS,
  getIndexes,
  getMoleculeRecords,
  getNoStereoHashes,
  getNoStereoTautomerHashes,
  getScreens,
} from '#lib';

const DEFAULT_SIZE = 2000;
const DEFAULT_SAMPLES = 30;
const MAX_TAUTOMERS = 5000;

// A suite runs its cases in order, so the one timed last has had the whole run to warm the machine
// up, or to meet a busier one. `--reverse` times them the other way round: a gap that survives both
// orders is the code, a gap that flips with the order is drift.
const { values: options } = parseArgs({
  options: {
    size: { type: 'string', default: String(DEFAULT_SIZE) },
    samples: { type: 'string', default: String(DEFAULT_SAMPLES) },
    reverse: { type: 'boolean', default: false },
  },
});

const minSamples = Number(options.samples);
const corpus = loadCorpus(Number(options.size));
const { idCodes } = corpus;
const molecules = idCodes.length;

printHeader(
  'openchemlib-search-wasm — one getMoleculeRecords call against the four it replaces',
  corpus,
);

// Each case gets its own function so the two shapes never share a call site.
function readRecords() {
  return getMoleculeRecords(idCodes, { maxTautomers: MAX_TAUTOMERS });
}

function readSeparately() {
  return {
    indexes: getIndexes(idCodes),
    screens: getScreens(idCodes),
    noStereoHashes: getNoStereoHashes(idCodes),
    tautomerHashes: getNoStereoTautomerHashes(idCodes, {
      maxTautomers: MAX_TAUTOMERS,
    }),
  };
}

const records = readRecords();
const separately = readSeparately();
const truncated = checkAgreement(records, separately);
const suiteOptions = { minSamples, maxTime: 30 };
const describe = (name) =>
  name === 'getMoleculeRecords'
    ? `${truncated} truncated at ${MAX_TAUTOMERS}`
    : 'FragFp, screen, both hashes';
const { onCycle, results } = createReporter(molecules, describe);

console.log(
  `Two cases over ${molecules} molecules, maxTautomers ${MAX_TAUTOMERS}, ${minSamples} samples ` +
    `each, timed ${options.reverse ? 'last to first' : 'first to last'}.\n`,
);

const cases = [
  ['getMoleculeRecords', readRecords],
  ['the four separate calls', readSeparately],
];
const suite = new Benchmark.Suite();
for (const [name, run] of options.reverse ? cases.toReversed() : cases) {
  suite.add(name, run, suiteOptions);
}
suite.on('cycle', onCycle).on('complete', report).run();

function report() {
  const combined = results.get('getMoleculeRecords');
  const separate = results.get('the four separate calls');
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
    `One call costs ${(combined.perUnit / separate.perUnit).toFixed(2)}x the four it replaces, ` +
      'and also returns the canonical idcode, the atom count and the weight.',
  );
}

/**
 * Throws unless the records hold what the separate calls computed: the same words and no-stereo
 * hashes, and the same tautomer hash wherever the enumeration was not cut short.
 * @param {object} combined - What `getMoleculeRecords` returned.
 * @param {object} separate - What the four separate calls returned.
 * @returns {number} How many molecules reached the tautomer ceiling.
 */
function checkAgreement(combined, separate) {
  let truncatedCount = 0;
  for (let i = 0; i < molecules; i++) {
    const base = 2 * INDEX_WORDS * i;
    for (let word = 0; word < INDEX_WORDS; word++) {
      if (
        combined.words[base + word] !== separate.indexes[i][word] ||
        combined.words[base + INDEX_WORDS + word] !== separate.screens[i][word]
      ) {
        throw new Error(`the words of molecule ${i} disagree`);
      }
    }
    if (combined.noStereoHashes[i] !== separate.noStereoHashes[i]) {
      throw new Error(`the no-stereo hash of molecule ${i} disagrees`);
    }
    if (combined.tautomerCounts[i] >= MAX_TAUTOMERS) {
      truncatedCount++;
    } else if (combined.tautomerHashes[i] !== separate.tautomerHashes[i]) {
      throw new Error(`the tautomer hash of molecule ${i} disagrees`);
    }
  }
  return truncatedCount;
}
