import { parseArgs } from 'node:util';

import Benchmark from 'benchmark';

import { loadCorpus, meanLength } from './lib/corpus.js';
import { queryByName } from './lib/queries.js';
import {
  conclude,
  count,
  createReporter,
  duration,
  micro,
  printHeader,
  printTable,
} from './lib/report.js';

import { SubstructureResult, ssSearch } from '#lib';

// Big on purpose. Marshalling is copying, so it is memory-bound and its cost depends on how much of
// the array is still in cache: the same measurement reads 0.19 µs per molecule at --size 5000 and
// 0.54 µs here. Only a batch near the size of a real scan answers what a real scan pays.
const DEFAULT_SIZE = 200_000;
const DEFAULT_SAMPLES = 30;

// `Search.parse` gives up on the first character above 127 without touching the parser, and on a
// zero-length idcode without even reading one. Both still cross the boundary in full — TeaVM has
// already turned the JS string into a Java one by then — so a scan over strings shaped like this
// measures the marshalling and the result writes with none of the chemistry underneath.
const NON_ASCII = 'ÿ';

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
  'What crossing into WASM costs, with no chemistry behind it',
  corpus,
);

const shaped = new Array(molecules);
for (let i = 0; i < molecules; i++) {
  shaped[i] = NON_ASCII + idCodes[i].slice(1);
}
const empty = new Array(molecules).fill('');
const result = new Uint8Array(molecules);
const computed = new Map();

console.log(
  `${count(molecules)} strings of ${meanLength(shaped).toFixed(2)} characters on average, the ` +
    'same length as the idcodes they were made from.\n',
);

function marshalStrings() {
  ssSearch(query.idCode, shaped, result);
  computed.set('wasm: strings in, bytes out', unparsable());
}

function marshalNothing() {
  ssSearch(query.idCode, empty, result);
  computed.set('wasm: empty strings in, bytes out', unparsable());
}

function marshalInJs() {
  let rejected = 0;
  for (let i = 0; i < shaped.length; i++) {
    const idCode = shaped[i];
    if (idCode.length === 0 || idCode.codePointAt(0) > 127) {
      result[i] = SubstructureResult.unparsable;
      rejected++;
    } else {
      result[i] = SubstructureResult.noMatch;
    }
  }
  computed.set('plain JS: the same loop', `${count(rejected)} unparsable`);
}

function wholeScan() {
  ssSearch(query.idCode, idCodes, result);
  let matches = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i] === SubstructureResult.match) matches++;
  }
  computed.set('wasm: a real benzene scan', `${count(matches)} matches`);
}

// The shaped strings are built by concatenation, which V8 leaves as a rope until something reads
// them; one pass each makes every case measure flat strings and nothing else.
marshalStrings();
marshalNothing();
marshalInJs();

const estimate = minSamples * (3 + seconds(wholeScan));
console.log(
  `Timing 4 cases at ${minSamples} samples each, about ${duration(estimate)}.\n`,
);

const reporter = createReporter(molecules, (name) => computed.get(name));
const suite = new Benchmark.Suite();
// The three boundary cases are far under the second a measurement has to run, so benchmark.js is
// told to fill each sample with as many passes as that takes.
suite.add('wasm: strings in, bytes out', marshalStrings, {
  minSamples,
  minTime: 1,
});
suite.add('wasm: empty strings in, bytes out', marshalNothing, {
  minSamples,
  minTime: 1,
});
suite.add('plain JS: the same loop', marshalInJs, {
  minSamples,
  minTime: 1,
});
suite.add('wasm: a real benzene scan', wholeScan, { minSamples });
suite.on('cycle', reporter.onCycle);
suite.run({ async: false });

const at = (name) => reporter.results.get(name).perUnit;
const full = at('wasm: strings in, bytes out');
const bare = at('wasm: empty strings in, bytes out');
const inJs = at('plain JS: the same loop');
const scan = at('wasm: a real benzene scan');
const characters = meanLength(shaped);

console.log('');
printTable(
  [
    { title: 'what is being paid for', align: 'left' },
    { title: 'µs/molecule' },
    { title: 'share of a benzene scan' },
  ],
  [
    ['the whole crossing: string in, byte out', micro(full), share(full, scan)],
    [
      '  of which the array, the call, the byte',
      micro(bare),
      share(bare, scan),
    ],
    [
      '  of which the string characters',
      micro(full - bare),
      share(full - bare, scan),
    ],
    ['the same bookkeeping in plain JS', micro(inJs), share(inJs, scan)],
    ['a benzene scan, for scale', micro(scan), '100.00%'],
  ],
);

conclude(
  `The boundary costs ${micro(full)} µs per molecule — ${share(full, scan)} of a substructure ` +
    `scan — of which ${micro(full - bare)} µs is copying the ${characters.toFixed(1)} characters ` +
    `of the idcode, about ${((1000 * (full - bare)) / characters).toFixed(1)} ns each. Over the ` +
    `whole 409,686-molecule corpus that is ${((409_686 * full) / 1000).toFixed(0)} ms of ` +
    'marshalling. Watch this number across TeaVM upgrades.',
);

function unparsable() {
  let rejected = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i] === SubstructureResult.unparsable) rejected++;
  }
  if (rejected !== result.length) {
    throw new Error(
      `${result.length - rejected} of ${result.length} entries were parsed, so this case is not ` +
        'measuring the boundary alone',
    );
  }
  return `${count(rejected)} unparsable`;
}

function share(part, whole) {
  return `${((100 * part) / whole).toFixed(2)}%`;
}

function seconds(run) {
  const start = process.hrtime.bigint();
  run();
  return Number(process.hrtime.bigint() - start) / 1e9;
}
