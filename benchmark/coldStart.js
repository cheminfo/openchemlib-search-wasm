import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import Benchmark from 'benchmark';

import {
  conclude,
  createReporter,
  printHeader,
  printTable,
  rmeText,
} from './lib/report.js';

const DEFAULT_SAMPLES = 30;

/** The same ceiling `src/wasm/load.ts` instantiates with. */
const MAX_LINEAR_MEMORY = 256 * 1024 * 1024;

const { values: options } = parseArgs({
  options: {
    // The module to measure against, as a git ref: its wasm/data.js and wasm/runtime.js are read
    // from git, so it needs no install and cannot drift from what that release shipped.
    baseline: { type: 'string', default: 'v2.1.1' },
    // The module under test, as a git ref; the working tree when omitted.
    candidate: { type: 'string' },
    samples: { type: 'string', default: String(DEFAULT_SAMPLES) },
  },
});

const minSamples = Number(options.samples);
const idCode = readFileSync(
  join(import.meta.dirname, '../src/__tests__/data/idcodes.txt'),
  'utf8',
).split('\n', 1)[0];

const temporary = mkdtempSync(join(tmpdir(), 'search-wasm-cold-start-'));
const baseline = await readModule(options.baseline);
const candidate = await readModule(options.candidate);
rmSync(temporary, { recursive: true });

const baselineName = `${options.baseline} module`;
const candidateName = `${options.candidate ?? 'working tree'} module`;

printHeader(
  'openchemlib-search-wasm — what a fresh module costs before its first function words',
  null,
);

// What a worker pays once, before anything it was started for: compile and instantiate the
// module, then read one molecule's function words. benchmark.js repeats calls, so each one
// instantiates a new module rather than reusing a warm one.
const baselineWords = await firstFunctionWords(baseline);
const candidateWords = await firstFunctionWords(candidate);
if (hex(baselineWords) !== hex(candidateWords)) {
  throw new Error(
    `the two modules disagree on ${idCode}: ${hex(baselineWords)} against ${hex(candidateWords)}`,
  );
}

// Each case gets its own function, so the two never share a call site.
async function baselineColdStart(deferred) {
  const { exports } = await baseline.load(baseline.bytes, {
    memory: { maxSize: MAX_LINEAR_MEMORY },
  });
  exports.Search.getFunctions([idCode], new Int32Array(16), 0, 1);
  deferred.resolve();
}

async function candidateColdStart(deferred) {
  const { exports } = await candidate.load(candidate.bytes, {
    memory: { maxSize: MAX_LINEAR_MEMORY },
  });
  exports.Search.getFunctions([idCode], new Int32Array(16), 0, 1);
  deferred.resolve();
}

const suiteOptions = { defer: true, minSamples, maxTime: 30 };
const { onCycle, results } = createReporter(
  1,
  () => `${setBits(candidateWords)} function bits set`,
);

console.log(
  `Two cases, ${minSamples} samples each, on ${idCode}. Both give the same words.\n`,
);

new Benchmark.Suite()
  .add(baselineName, baselineColdStart, suiteOptions)
  .add(candidateName, candidateColdStart, suiteOptions)
  .on('cycle', onCycle)
  .on('complete', report)
  .run();

function report() {
  const before = results.get(baselineName);
  const after = results.get(candidateName);
  printTable(
    [
      { title: 'module', align: 'left' },
      { title: 'ms per cold start' },
      { title: 'rme' },
      { title: 'samples' },
    ],
    [...results].map(([name, statistics]) => [
      name,
      (statistics.perUnit / 1000).toFixed(1),
      rmeText(statistics.rme),
      String(statistics.samples),
    ]),
  );
  conclude(
    `A fresh ${candidateName} reaches its first function words in ` +
      `${(before.perUnit / after.perUnit).toFixed(2)}x less time than the ${baselineName}.`,
  );
}

/**
 * Reads a module's runtime and its decompressed bytes, from git or from the working tree.
 * @param {string|undefined} ref - A git ref, or undefined for the working tree.
 * @returns {Promise<{load: (bytes: Uint8Array, options: object) => Promise<{exports: object}>, bytes: Uint8Array}>} The runtime's `load` and the module.
 */
async function readModule(ref) {
  let directory = join(import.meta.dirname, '../wasm');
  if (ref !== undefined) {
    directory = join(temporary, ref.replaceAll(/[^\w.-]/g, '_'));
    mkdirSync(directory);
    for (const file of ['data.js', 'runtime.js']) {
      writeFileSync(
        join(directory, file),
        execFileSync('git', ['show', `${ref}:wasm/${file}`]),
      );
    }
  }
  const { wasmGzipBase64 } = await import(
    pathToFileURL(join(directory, 'data.js')).href
  );
  const { load } = await import(
    pathToFileURL(join(directory, 'runtime.js')).href
  );
  return { load, bytes: await gunzip(Buffer.from(wasmGzipBase64, 'base64')) };
}

/**
 * Instantiates a module and reads the function words of the benchmark's molecule.
 * @param {{load: (bytes: Uint8Array, options: object) => Promise<{exports: object}>, bytes: Uint8Array}} module - The module.
 * @returns {Promise<Int32Array>} The sixteen words.
 */
async function firstFunctionWords(module) {
  const { exports } = await module.load(module.bytes, {
    memory: { maxSize: MAX_LINEAR_MEMORY },
  });
  const words = new Int32Array(16);
  exports.Search.getFunctions([idCode], words, 0, 1);
  return words;
}

/**
 * Writes sixteen words as hexadecimal.
 * @param {Int32Array} words - The words.
 * @returns {string} 128 hexadecimal digits.
 */
function hex(words) {
  let digits = '';
  for (let i = 0; i < words.length; i++) {
    digits += (words[i] >>> 0).toString(16).padStart(8, '0');
  }
  return digits;
}

/**
 * Counts the set bits of sixteen words.
 * @param {Int32Array} words - The words.
 * @returns {number} How many bits are set.
 */
function setBits(words) {
  let count = 0;
  for (let i = 0; i < words.length; i++) {
    for (let word = words[i]; word !== 0; word &= word - 1) count++;
  }
  return count;
}

/**
 * Decompresses gzip bytes.
 * @param {Uint8Array} bytes - The compressed bytes.
 * @returns {Promise<Uint8Array>} The decompressed bytes.
 */
async function gunzip(bytes) {
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
