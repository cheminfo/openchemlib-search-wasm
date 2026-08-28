// What does `limit` actually save, and what does `stepSize` do to that?
//
// A substructure scan stops at the end of the step that reached `limit`, so the work it does is
// `stepSize` entries rounded up, not `limit` entries. This file measures that: how many entries
// each configuration really reads, and what it costs.
//
// The corpus is read WHOLE AND IN ITS OWN ORDER, not strided like the other files. That is
// deliberate and it is the only honest way to price `limit`: a bounded scan reads the front of the
// array it is handed, so the front is what it must be timed on. It also means these numbers are
// NOT comparable per molecule with `substructureSearch.js`, whose strided sample is representative
// of the whole corpus — reference.cheminfo.org is ordered so that its first few thousand idcodes
// average 27.1 characters against 38.67 corpus-wide, and small molecules parse fast. The whole
// corpus baseline therefore comes from `scan.mjs`, which measures one real end-to-end pass; adding
// a 30-sample whole-corpus case here would take four minutes to restate it.
import { parseArgs } from 'node:util';

import Benchmark from 'benchmark';

import { findCorpus, meanLength, readIdCodes } from './lib/corpus.js';
import { queryByName } from './lib/queries.js';
import {
  conclude,
  count,
  createReporter,
  micro,
  printHeader,
  printTable,
} from './lib/report.js';

import { substructureSearch } from '#lib';

// Benzene, because a limit is only interesting for a query common enough to hit it immediately: it
// matches 62.9% of the corpus, so 100 matches arrive within the first couple of hundred entries and
// every configuration below is bounded by its step size rather than by the corpus.
const QUERY = 'benzene';
const LIMIT = 100;
const DEFAULT_SAMPLES = 30;

const { values: options } = parseArgs({
  options: {
    samples: { type: 'string', default: String(DEFAULT_SAMPLES) },
    limit: { type: 'string', default: String(LIMIT) },
  },
});

const minSamples = Number(options.samples);
const limit = Number(options.limit);
const { path, small } = findCorpus();
const idCodes = readIdCodes(path);
const query = queryByName(QUERY).idCode;

printHeader('What `limit` saves, and what `stepSize` does to it', {
  idCodes,
  total: idCodes.length,
  stride: 1,
  path,
  small,
});

// Every case is run once up front so the table can report what it read before anything is timed,
// and so a configuration that silently scanned the whole corpus shows up as such.
const cases = [
  { name: `limit ${limit}, default stepSize`, options: { limit } },
  { name: `limit ${limit}, stepSize 256`, options: { limit, stepSize: 256 } },
  { name: `limit ${limit}, stepSize 64`, options: { limit, stepSize: 64 } },
];

for (const item of cases) {
  const result = substructureSearch(query, idCodes, item.options);
  item.processed = result.processed;
  item.matched = result.matched;
  item.stopped = result.stopped;
  if (!item.stopped) {
    throw new Error(
      `${item.name} scanned the whole corpus instead of stopping on the limit`,
    );
  }
  if (item.matched < limit) {
    throw new Error(
      `${item.name} stopped with ${item.matched} matches, short of the limit of ${limit}`,
    );
  }
}

console.log(
  `Timing ${cases.length} cases at ${minSamples} samples each, a few seconds.\n`,
);

const byName = new Map(cases.map((item) => [item.name, item]));
const reporter = createReporter(
  (name) => byName.get(name).processed,
  (name) => `${count(byName.get(name).processed)} scanned`,
);

const suite = new Benchmark.Suite();
for (const item of cases) {
  suite.add(item.name, () => substructureSearch(query, idCodes, item.options), {
    minSamples,
  });
}
suite.on('cycle', reporter.onCycle).run();

const rows = cases.map((item) => {
  const stats = reporter.results.get(item.name);
  const totalMilliseconds = (stats.perUnit * item.processed) / 1000;
  return [
    item.name,
    count(item.processed),
    count(item.matched),
    `${totalMilliseconds.toFixed(1)} ms`,
    micro(stats.perUnit),
  ];
});

console.log('');
printTable(
  [
    { title: 'configuration', align: 'left' },
    { title: 'entries scanned' },
    { title: 'matches' },
    { title: 'wall' },
    { title: 'µs/entry' },
  ],
  rows,
);

const cheapest = rows.at(-1);
conclude(
  `A bounded scan costs its step size, not its limit: ${cheapest[0]} reads ${cheapest[1]} of ` +
    `${count(idCodes.length)} entries in ${cheapest[3]}. Lower \`stepSize\` when a common query ` +
    `only needs a first page. The µs/entry column is well under what \`substructureSearch.js\` ` +
    `reports because these entries are the front of an ordered corpus (mean ` +
    `${meanLength(idCodes.slice(0, 4096)).toFixed(1)} chars against ` +
    `${meanLength(idCodes).toFixed(1)} corpus-wide), which is what a bounded scan really reads.`,
);
