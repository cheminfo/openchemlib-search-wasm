// Does a binaryen post-pass over TeaVM's WasmGC output make the module faster, and by how much?
//
// TeaVM already compiles with `optimizationLevel=FULL` and `strict=false`, so this asks whether
// wasm-opt finds anything on top of that. Every variant is built here, in this process, from the
// same `java/target/wasm-gc/openchemlib.wasm`, instantiated alongside the baseline, and checked to
// give identical answers before it is timed — an optimizer that changed a hit count is a bug, not a
// speedup.
//
// `--closed-world` is deliberately absent: it shrinks the module from 382 kB to 49 kB and the
// result traps on the first call, because TeaVM's JS interop hands references across the boundary
// and the module is therefore not closed. `-O4` does not run either; it needs the Flatten pass,
// which does not support the `br_on_*` instructions WasmGC emits.
//
// Needs `binaryen` in devDependencies. Run `node benchmark/wasmOpt.js`.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

import Benchmark from 'benchmark';

import { load } from '../wasm/runtime.js';

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

// Big enough that a call is ~0.6 s of real scanning, so the sampling measures the scan and not the
// call. The similarity corpus is far smaller because one molecule costs about a millisecond.
const SUBSTRUCTURE_SIZE = 25_000;
const SIMILARITY_SIZE = 1000;
const MIN_SAMPLES = 30;
const MAX_LINEAR_MEMORY = 256 * 1024 * 1024;

const root = join(import.meta.dirname, '..');
const baselineWasm = join(
  root,
  'java',
  'target',
  'wasm-gc',
  'openchemlib.wasm',
);
const wasmOpt = join(root, 'node_modules', 'binaryen', 'bin', 'wasm-opt');

// TeaVM writes no feature section, so every feature the module uses has to be named explicitly.
const FEATURES = [
  '--enable-gc',
  '--enable-reference-types',
  '--enable-exception-handling',
  '--enable-bulk-memory',
  '--enable-sign-ext',
  '--enable-mutable-globals',
  '--enable-nontrapping-float-to-int',
  '--enable-multivalue',
  '--enable-tail-call',
  '--enable-extended-const',
];

const VARIANTS = [
  { name: 'baseline', passes: null },
  { name: '-O3', passes: ['-O3'] },
  { name: '-O3 --tnh', passes: ['-O3', '--traps-never-happen'] },
  { name: '-Os', passes: ['-Os'] },
];

if (!existsSync(baselineWasm)) {
  console.error(
    `wasmOpt: ${baselineWasm} is missing. Run \`npm run build-wasm\` first.`,
  );
  process.exit(1);
}
if (!existsSync(wasmOpt)) {
  console.error('wasmOpt: binaryen is not installed. Run `npm i -D binaryen`.');
  process.exit(1);
}

const corpus = loadCorpus(SUBSTRUCTURE_SIZE);
const { idCodes } = corpus;
const molecules = idCodes.length;
const similarityCodes = idCodes.slice(0, SIMILARITY_SIZE);
const query = queryByName('benzene');

printHeader('Does a binaryen post-pass over TeaVM WasmGC output pay?', corpus);

const baselineBytes = readFileSync(baselineWasm);
const baselineGzip = gzipSync(baselineBytes, { level: 9 }).length;
const engines = new Map();
const sizes = new Map();

for (const variant of VARIANTS) {
  const bytes = variant.passes
    ? build(variant.name, variant.passes)
    : baselineBytes;
  sizes.set(variant.name, {
    raw: bytes.length,
    gzip: gzipSync(bytes, { level: 9 }).length,
  });
  // eslint-disable-next-line no-await-in-loop -- each variant is built, then instantiated, in turn
  const instance = await load(bytes, {
    memory: { maxSize: MAX_LINEAR_MEMORY },
  });
  engines.set(variant.name, instance.exports.Search);
}

printTable(
  [
    { title: 'variant', align: 'left' },
    { title: 'raw bytes' },
    { title: 'gzipped' },
    { title: 'vs baseline' },
  ],
  VARIANTS.map((variant) => {
    const { raw, gzip } = sizes.get(variant.name);
    return [
      variant.name,
      count(raw),
      count(gzip),
      `${((gzip / baselineGzip - 1) * 100).toFixed(1)}%`,
    ];
  }),
);
console.log('');

// Same answers? Every variant runs the whole substructure corpus and the similarity corpus, and its
// answers are compared with the baseline's before anything is timed.
const reference = { hits: null, similarity: null };
for (const variant of VARIANTS) {
  const Search = engines.get(variant.name);
  const hits = new Uint8Array(molecules);
  const matched = Search.ssSearch(query.idCode, idCodes, hits, 0, molecules);
  const similarity = new Float32Array(SIMILARITY_SIZE);
  Search.similaritySearch(
    query.idCode,
    similarityCodes,
    similarity,
    0,
    SIMILARITY_SIZE,
  );
  if (variant.name === 'baseline') {
    reference.hits = hits;
    reference.similarity = similarity;
    console.log(
      `baseline: ${count(matched)} of ${count(molecules)} match ${query.name}, ` +
        `${SIMILARITY_SIZE} similarities computed.`,
    );
    continue;
  }
  const differing =
    differences(hits, reference.hits) +
    differences(similarity, reference.similarity);
  if (differing !== 0) {
    console.error(
      `wasmOpt: ${variant.name} disagrees with the baseline on ${differing} entries. ` +
        'A variant that changes an answer is not a speedup; not timing it.',
    );
    process.exit(1);
  }
  console.log(`${variant.name}: identical, byte for byte, to the baseline.`);
}

const cases = VARIANTS.length * 2;
console.log(
  `\nTiming ${cases} cases at ${MIN_SAMPLES} samples each, about ` +
    `${duration(cases * MIN_SAMPLES * 0.8)}.\n`,
);

const suite = new Benchmark.Suite();
const computed = new Map();
const { onCycle, results } = createReporter(
  (name) => (name.startsWith('similarity') ? SIMILARITY_SIZE : molecules),
  (name) => computed.get(name) ?? '',
);

for (const variant of VARIANTS) {
  const Search = engines.get(variant.name);
  const hits = new Uint8Array(molecules);
  const similarity = new Float32Array(SIMILARITY_SIZE);
  suite.add(
    `substructure ${variant.name}`,
    () => {
      const matched = Search.ssSearch(
        query.idCode,
        idCodes,
        hits,
        0,
        molecules,
      );
      computed.set(`substructure ${variant.name}`, `${count(matched)} matches`);
    },
    { minSamples: MIN_SAMPLES },
  );
  suite.add(
    `similarity ${variant.name}`,
    () => {
      const compared = Search.similaritySearch(
        query.idCode,
        similarityCodes,
        similarity,
        0,
        SIMILARITY_SIZE,
      );
      computed.set(`similarity ${variant.name}`, `${count(compared)} compared`);
    },
    { minSamples: MIN_SAMPLES },
  );
}

suite.on('cycle', onCycle).on('complete', report).run();

function report() {
  console.log('');
  const rows = [];
  for (const stage of ['substructure', 'similarity']) {
    const base = results.get(`${stage} baseline`);
    for (const variant of VARIANTS) {
      const entry = results.get(`${stage} ${variant.name}`);
      if (!entry || !base) continue;
      rows.push([
        stage,
        variant.name,
        micro(entry.perUnit),
        `±${entry.rme.toFixed(1)}%`,
        variant.name === 'baseline'
          ? '—'
          : `${(base.perUnit / entry.perUnit).toFixed(3)}x`,
      ]);
    }
  }
  printTable(
    [
      { title: 'stage', align: 'left' },
      { title: 'variant', align: 'left' },
      { title: 'µs/molecule' },
      { title: 'rme' },
      { title: 'vs baseline' },
    ],
    rows,
  );
  const best = bestVariant();
  conclude(
    best
      ? `The best binaryen variant is ${best.name}: ${best.speedup.toFixed(3)}x on the ` +
          `substructure scan, ${best.gzip} gzipped against ${count(baselineGzip)} B.`
      : 'No binaryen variant beat the baseline.',
  );
}

function bestVariant() {
  const base = results.get('substructure baseline');
  if (!base) return null;
  let best = null;
  for (const variant of VARIANTS) {
    if (variant.name === 'baseline') continue;
    const entry = results.get(`substructure ${variant.name}`);
    if (!entry) continue;
    const speedup = base.perUnit / entry.perUnit;
    if (!best || speedup > best.speedup) {
      best = {
        name: variant.name,
        speedup,
        gzip: count(sizes.get(variant.name).gzip),
      };
    }
  }
  return best;
}

/**
 * Builds one wasm-opt variant of the baseline module.
 * @param {string} name - The variant, for the error message.
 * @param {string[]} passes - The wasm-opt arguments, without the feature flags.
 * @returns {Buffer} The optimized module.
 */
function build(name, passes) {
  const output = join(root, 'java', 'target', 'wasm-gc', `variant.wasm`);
  execFileSync(wasmOpt, [...FEATURES, ...passes, baselineWasm, '-o', output], {
    stdio: 'inherit',
  });
  const bytes = readFileSync(output);
  console.log(`built ${name}: ${count(bytes.length)} bytes`);
  return bytes;
}

/**
 * Counts the entries two result buffers disagree on.
 * @param {Uint8Array|Float32Array} a - One buffer.
 * @param {Uint8Array|Float32Array} b - The other, of the same length.
 * @returns {number} How many entries differ.
 */
function differences(a, b) {
  let differing = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) differing++;
  }
  return differing;
}
