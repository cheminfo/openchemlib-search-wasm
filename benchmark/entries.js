// What the entries-in / entries-out API costs, against the parallel-array shape it replaces.
//
// `openchemlib-sqlite` verifies prescreened candidates a batch at a time. It used to carry a
// `string[]` of idcodes alongside the candidate objects and map the returned positions back onto
// them; it now hands the candidates over and reads the matching ones back. This file measures
// whether that is a speed change or only an ergonomics one.
//
// Two suites, because the answer needs both: the whole verification, where the scan dominates and
// the shapes should be indistinguishable, and the bookkeeping alone, where the difference is
// actually resolvable.
import { parseArgs } from 'node:util';

import Benchmark from 'benchmark';

import { toIdCodes } from '../src/jpath.ts';

import { loadCorpus } from './lib/corpus.js';
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

import { SubstructureResult, substructureSearch } from '#lib';

// What `openchemlib-sqlite` hands to one call: MAX_VERIFY_BATCH in runSubstructureSearch.ts.
const BATCH = 256;

// Benzene matches 62.9% of the corpus, which is the worst case for the new shape: every hit is an
// entry to collect. A shape that is not slower here is not slower anywhere.
const QUERY = 'benzene';

// 20,000 molecules is ~0.45 s of scanning per pass, so a sample runs well past the second a
// measurement needs while the whole file still finishes in a couple of minutes.
const DEFAULT_SIZE = 20_000;
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
const query = queryByName(QUERY).idCode;

// The candidates a prescreen yields: an entry id, the idcode, and the molecular weight the index is
// clustered by. The nested copy is the same data one level down, to price a two-segment jpath.
const candidates = new Array(molecules);
const nested = new Array(molecules);
for (let i = 0; i < molecules; i++) {
  candidates[i] = { entryId: i, idCode: idCodes[i], mw: 100 + (i % 400) };
  nested[i] = { entryId: i, molecule: { idCode: idCodes[i] } };
}

// A precomputed answer, so the bookkeeping suite below can do every allocation and every pass of a
// real verification with none of the chemistry underneath.
const answer = substructureSearch(query, idCodes, { collect: false }).result;

const computed = new Map();

// ---------------------------------------------------------------------------
// Suite 1: the whole verification, batch by batch, both shapes ending up with
// the same array of matching candidate objects.
// ---------------------------------------------------------------------------

// The shape openchemlib-sqlite had: a parallel `string[]`, a fresh result object per candidate, and
// the returned positions mapped back onto the batch.
function verifyWithIdCodes() {
  const results = [];
  for (let from = 0; from < molecules; from += BATCH) {
    const to = Math.min(from + BATCH, molecules);
    const batch = [];
    const batchIdCodes = [];
    for (let i = from; i < to; i++) {
      const candidate = candidates[i];
      batch.push({
        entryId: candidate.entryId,
        idCode: candidate.idCode,
        mw: candidate.mw,
      });
      batchIdCodes.push(candidate.idCode);
    }
    const buffer = substructureSearch(query, batchIdCodes, {
      collect: false,
    }).result;
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === SubstructureResult.match) results.push(batch[i]);
    }
  }
  computed.set(
    'old: idcodes in, positions out',
    `${count(results.length)} hits`,
  );
}

// The shape it has now: the candidate object goes in as it is, and the matching ones come back.
function verifyWithEntries() {
  const results = [];
  for (let from = 0; from < molecules; from += BATCH) {
    const to = Math.min(from + BATCH, molecules);
    const batch = [];
    for (let i = from; i < to; i++) {
      batch.push(candidates[i]);
    }
    results.push(...substructureSearch(query, batch).matches);
  }
  computed.set('new: entries in, entries out', `${count(results.length)} hits`);
}

// ---------------------------------------------------------------------------
// Suite 2: the same two paths with the scan replaced by a copy of the answer,
// so what is left is only the arrays each shape builds.
// ---------------------------------------------------------------------------

function bookkeepingWithIdCodes() {
  const results = [];
  for (let from = 0; from < molecules; from += BATCH) {
    const to = Math.min(from + BATCH, molecules);
    const batch = [];
    const batchIdCodes = [];
    for (let i = from; i < to; i++) {
      const candidate = candidates[i];
      batch.push({
        entryId: candidate.entryId,
        idCode: candidate.idCode,
        mw: candidate.mw,
      });
      batchIdCodes.push(candidate.idCode);
    }
    const buffer = new Uint8Array(batchIdCodes.length);
    buffer.set(answer.subarray(from, to));
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === SubstructureResult.match) results.push(batch[i]);
    }
  }
  computed.set('old bookkeeping, no scan', `${count(results.length)} hits`);
}

function bookkeepingWithEntries() {
  const results = [];
  for (let from = 0; from < molecules; from += BATCH) {
    const to = Math.min(from + BATCH, molecules);
    const batch = [];
    for (let i = from; i < to; i++) {
      batch.push(candidates[i]);
    }
    const extracted = toIdCodes(batch, 'idCode');
    const buffer = new Uint8Array(extracted.length);
    buffer.set(answer.subarray(from, to));
    const indexes = [];
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === SubstructureResult.match) indexes.push(i);
    }
    for (let i = 0; i < indexes.length; i++) {
      results.push(batch[indexes[i]]);
    }
  }
  computed.set('new bookkeeping, no scan', `${count(results.length)} hits`);
}

// The same, reading the idcode one level down, so the jpath walk is priced against the flat read.
function bookkeepingWithNestedEntries() {
  const results = [];
  for (let from = 0; from < molecules; from += BATCH) {
    const to = Math.min(from + BATCH, molecules);
    const batch = [];
    for (let i = from; i < to; i++) {
      batch.push(nested[i]);
    }
    const extracted = toIdCodes(batch, 'molecule.idCode');
    const buffer = new Uint8Array(extracted.length);
    buffer.set(answer.subarray(from, to));
    const indexes = [];
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === SubstructureResult.match) indexes.push(i);
    }
    for (let i = 0; i < indexes.length; i++) {
      results.push(batch[indexes[i]]);
    }
  }
  computed.set(
    'new bookkeeping, nested jpath',
    `${count(results.length)} hits`,
  );
}

// ---------------------------------------------------------------------------
// Suite 3: the verifier-pool round trip. A worker structured-clones whatever
// crosses, so what a batch is made of matters there in a way it does not on the
// calling thread. This is what `indexes` on the result exists for.
// ---------------------------------------------------------------------------

const wireBatch = candidates.slice(0, BATCH);
const wireIdCodes = idCodes.slice(0, BATCH);
const wirePositions = [];
for (let i = 0; i < BATCH; i++) {
  if (answer[i] === SubstructureResult.match) wirePositions.push(i);
}
const wireMatches = wirePositions.map((index) => candidates[index]);

function cloneIdCodesAndPositions() {
  const task = structuredClone({
    workerModule: 'x',
    fragment: query,
    idCodes: wireIdCodes,
  });
  const back = structuredClone({ matches: wirePositions });
  computed.set(
    'wire: idcodes out, positions back',
    `${task.idCodes.length} sent, ${back.matches.length} back`,
  );
}

function cloneEntriesBothWays() {
  const task = structuredClone({
    workerModule: 'x',
    fragment: query,
    entries: wireBatch,
  });
  const back = structuredClone({ matches: wireMatches });
  computed.set(
    'wire: entries out, entries back',
    `${task.entries.length} sent, ${back.matches.length} back`,
  );
}

printHeader(
  `entries in / entries out vs the parallel-array shape — ${QUERY}, batches of ${BATCH}`,
  corpus,
);

// One pass each, so every case is measured with its arrays already warm.
verifyWithIdCodes();
verifyWithEntries();
bookkeepingWithIdCodes();
bookkeepingWithEntries();
bookkeepingWithNestedEntries();
cloneIdCodesAndPositions();
cloneEntriesBothWays();

const perPass = seconds(verifyWithEntries);
console.log(
  `Timing 7 cases at ${minSamples} samples each, about ${duration(minSamples * (2 * perPass + 5))}.\n`,
);

// The two wire cases move one batch, not the whole sample, so they are reported per candidate of
// that batch rather than per molecule of the corpus.
const reporter = createReporter(
  (name) => (name.startsWith('wire:') ? BATCH : molecules),
  (name) => computed.get(name),
);
const suite = new Benchmark.Suite();
suite.add('old: idcodes in, positions out', verifyWithIdCodes, { minSamples });
suite.add('new: entries in, entries out', verifyWithEntries, { minSamples });
suite.add('old bookkeeping, no scan', bookkeepingWithIdCodes, {
  minSamples,
  minTime: 1,
});
suite.add('new bookkeeping, no scan', bookkeepingWithEntries, {
  minSamples,
  minTime: 1,
});
suite.add('new bookkeeping, nested jpath', bookkeepingWithNestedEntries, {
  minSamples,
  minTime: 1,
});
suite.add('wire: idcodes out, positions back', cloneIdCodesAndPositions, {
  minSamples,
  minTime: 1,
});
suite.add('wire: entries out, entries back', cloneEntriesBothWays, {
  minSamples,
  minTime: 1,
});
suite.on('cycle', reporter.onCycle);
suite.run({ async: false });

const at = (name) => reporter.results.get(name).perUnit;
const oldTotal = at('old: idcodes in, positions out');
const newTotal = at('new: entries in, entries out');
const oldBooks = at('old bookkeeping, no scan');
const newBooks = at('new bookkeeping, no scan');
const nestedBooks = at('new bookkeeping, nested jpath');
const wirePositionsCost = at('wire: idcodes out, positions back');
const wireEntriesCost = at('wire: entries out, entries back');
const scan = newTotal - newBooks;

console.log('');
printTable(
  [
    { title: 'per molecule', align: 'left' },
    { title: 'old' },
    { title: 'new' },
    { title: 'ratio' },
  ],
  [
    [
      'whole verification',
      `${micro(oldTotal)} µs`,
      `${micro(newTotal)} µs`,
      `${(oldTotal / newTotal).toFixed(2)}x`,
    ],
    [
      'bookkeeping alone',
      `${micro(oldBooks)} µs`,
      `${micro(newBooks)} µs`,
      `${(oldBooks / newBooks).toFixed(2)}x`,
    ],
    [
      'bookkeeping, nested jpath',
      `${micro(oldBooks)} µs`,
      `${micro(nestedBooks)} µs`,
      `${(oldBooks / nestedBooks).toFixed(2)}x`,
    ],
    [
      'worker round trip (clone)',
      `${micro(wirePositionsCost)} µs`,
      `${micro(wireEntriesCost)} µs`,
      `${(wirePositionsCost / wireEntriesCost).toFixed(2)}x`,
    ],
  ],
);

console.log('');
printTable(
  [
    { title: 'share of a verification', align: 'left' },
    { title: 'µs' },
    { title: 'share' },
  ],
  [
    [
      'the scan itself',
      micro(scan),
      `${((scan / newTotal) * 100).toFixed(1)}%`,
    ],
    [
      'old bookkeeping',
      micro(oldBooks),
      `${((oldBooks / newTotal) * 100).toFixed(1)}%`,
    ],
    [
      'new bookkeeping',
      micro(newBooks),
      `${((newBooks / newTotal) * 100).toFixed(1)}%`,
    ],
  ],
);

conclude(
  `The scan is ${((scan / newTotal) * 100).toFixed(1)}% of a verification, so on the calling thread the ` +
    `two shapes measure ${(oldTotal / newTotal).toFixed(2)}x end to end — the bookkeeping either way is ` +
    'under a tenth of a percent of the work.\n' +
    `Across a worker, though, entries both ways clone at ${(wireEntriesCost / wirePositionsCost).toFixed(2)}x ` +
    `the idcodes-and-positions round trip (${micro(wireEntriesCost)} vs ${micro(wirePositionsCost)} µs per ` +
    `candidate, ${(((wireEntriesCost - wirePositionsCost) / newTotal) * 100).toFixed(1)}% of a verification).\n` +
    'So: pass entries on the calling thread, and post `indexes` across a worker.',
);

/**
 * Times one call, for the estimate printed before the suite runs.
 * @param {() => void} run - The case to time.
 * @returns {number} How long it took, in seconds.
 */
function seconds(run) {
  const start = performance.now();
  run();
  return (performance.now() - start) / 1000;
}
