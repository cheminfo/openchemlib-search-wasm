import { parseArgs } from 'node:util';

import Benchmark from 'benchmark';
import { Molecule, SSSearcher } from 'openchemlib';

import { loadCorpus } from './lib/corpus.js';
import { countMatches } from './lib/openchemlibJs.js';
import { queryByName } from './lib/queries.js';
import {
  conclude,
  count,
  createReporter,
  printHeader,
  printTable,
} from './lib/report.js';

import { ssSearch } from '#lib';

const DEFAULT_SIZE = 25_000;
const DEFAULT_SAMPLES = 30;

// A fragment nothing can contain. SSSearcher rejects it on `fragment.getAtoms() >
// molecule.getAtoms()` before it builds a single feature or walks a single bond, so a scan with it
// costs exactly one idcode parse plus the neighbour arrays and nothing of the isomorphism. That is
// how parse is isolated on the WASM side, which exports the two searches and nothing else.
const UNMATCHABLE_ATOMS = 400;

const { values: options } = parseArgs({
  options: {
    size: { type: 'string', default: String(DEFAULT_SIZE) },
    samples: { type: 'string', default: String(DEFAULT_SAMPLES) },
  },
});

const minSamples = Number(options.samples);
const corpus = loadCorpus(Number(options.size));
const { idCodes, small } = corpus;
const molecules = idCodes.length;
const cheap = queryByName('benzene');
const rare = queryByName('sulfonamide');

printHeader(
  'Where a substructure scan spends its time — parse vs isomorphism',
  corpus,
);

const unmatchable = Molecule.fromSmiles('C'.repeat(UNMATCHABLE_ATOMS));
const unmatchableIdCode = unmatchable.getIDCode();
let largest = 0;
let atomTotal = 0;
for (let i = 0; i < molecules; i++) {
  const atoms = Molecule.fromIDCode(idCodes[i], false).getAtoms();
  atomTotal += atoms;
  if (atoms > largest) largest = atoms;
}
if (unmatchable.getAtoms() <= largest) {
  throw new Error(
    `the parse-only probe needs a fragment bigger than every molecule, but the ${UNMATCHABLE_ATOMS}` +
      `-atom chain is not bigger than the largest of the corpus (${largest} atoms)`,
  );
}
console.log(
  `parse-only probe: a ${unmatchable.getAtoms()}-atom chain against molecules of at most ` +
    `${largest} atoms, so no isomorphism ever starts.\n`,
);

const jsResult = new Uint8Array(molecules);
const computed = new Map();

function parseWasm() {
  const result = ssSearch(unmatchableIdCode, idCodes);
  computed.set('parse wasm', `${countMatches(result)} matches`);
}

function matchWasm(query, name) {
  const result = ssSearch(query.idCode, idCodes);
  computed.set(name, `${count(countMatches(result))} matches`);
}

function parseJs() {
  const fragment = Molecule.fromIDCode(unmatchableIdCode, false);
  fragment.setFragment(true);
  const searcher = new SSSearcher();
  searcher.setFragment(fragment);
  for (let i = 0; i < idCodes.length; i++) {
    searcher.setMolecule(Molecule.fromIDCode(idCodes[i], false));
    jsResult[i] = searcher.isFragmentInMolecule() ? 1 : 2;
  }
  computed.set('parse openchemlib-js', `${countMatches(jsResult)} matches`);
}

function fromIdCodeJs() {
  let atoms = 0;
  for (let i = 0; i < idCodes.length; i++) {
    atoms += Molecule.fromIDCode(idCodes[i], false).getAtoms();
  }
  computed.set('fromIDCode openchemlib-js', `${count(atoms)} atoms`);
}

function matchJs(query, name) {
  const fragment = Molecule.fromIDCode(query.idCode, false);
  fragment.setFragment(true);
  const searcher = new SSSearcher();
  searcher.setFragment(fragment);
  for (let i = 0; i < idCodes.length; i++) {
    searcher.setMolecule(Molecule.fromIDCode(idCodes[i], false));
    jsResult[i] = searcher.isFragmentInMolecule() ? 1 : 2;
  }
  computed.set(name, `${count(countMatches(jsResult))} matches`);
}

const reporter = createReporter(molecules, (name) => computed.get(name));
const suite = new Benchmark.Suite();
suite.add('parse wasm', parseWasm, { minSamples });
suite.add('parse openchemlib-js', parseJs, { minSamples });
suite.add('fromIDCode openchemlib-js', fromIdCodeJs, { minSamples });
suite.add(
  'parse + match benzene wasm',
  () => matchWasm(cheap, 'parse + match benzene wasm'),
  { minSamples },
);
suite.add(
  'parse + match benzene openchemlib-js',
  () => matchJs(cheap, 'parse + match benzene openchemlib-js'),
  { minSamples },
);
suite.add(
  'parse + match sulfonamide wasm',
  () => matchWasm(rare, 'parse + match sulfonamide wasm'),
  { minSamples },
);
suite.add(
  'parse + match sulfonamide openchemlib-js',
  () => matchJs(rare, 'parse + match sulfonamide openchemlib-js'),
  { minSamples },
);
suite.on('cycle', reporter.onCycle);
suite.run({ async: false });

const at = (name) => reporter.results.get(name).perUnit;
const parseWasmCost = at('parse wasm');
const parseJsCost = at('parse openchemlib-js');
const rows = [];
for (const [label, wasmName, jsName] of [
  [
    'benzene',
    'parse + match benzene wasm',
    'parse + match benzene openchemlib-js',
  ],
  [
    'sulfonamide',
    'parse + match sulfonamide wasm',
    'parse + match sulfonamide openchemlib-js',
  ],
]) {
  const wasmTotal = at(wasmName);
  const jsTotal = at(jsName);
  rows.push(
    [
      `${label}: parse`,
      parseWasmCost.toFixed(2),
      parseJsCost.toFixed(2),
      `${(parseJsCost / parseWasmCost).toFixed(2)}x`,
      `${((100 * parseWasmCost) / wasmTotal).toFixed(0)}%`,
    ],
    [
      `${label}: isomorphism`,
      (wasmTotal - parseWasmCost).toFixed(2),
      (jsTotal - parseJsCost).toFixed(2),
      `${((jsTotal - parseJsCost) / (wasmTotal - parseWasmCost)).toFixed(2)}x`,
      `${((100 * (wasmTotal - parseWasmCost)) / wasmTotal).toFixed(0)}%`,
    ],
    [
      `${label}: whole scan`,
      wasmTotal.toFixed(2),
      jsTotal.toFixed(2),
      `${(jsTotal / wasmTotal).toFixed(2)}x`,
      '100%',
    ],
  );
}

console.log('');
printTable(
  [
    { title: 'stage', align: 'left' },
    { title: 'wasm µs/mol' },
    { title: 'ocl-js µs/mol' },
    { title: 'speedup' },
    { title: 'share of wasm scan' },
  ],
  rows,
);

conclude(
  `Parsing is ${((100 * parseWasmCost) / at('parse + match benzene wasm')).toFixed(0)}% of a ` +
    `benzene scan and only ${(parseJsCost / parseWasmCost).toFixed(2)}x faster in WASM, so the ` +
    'whole scan cannot go much past 2x however fast the isomorphism gets. Corpus mean ' +
    `${(atomTotal / molecules).toFixed(1)} atoms per molecule.`,
);

// Each of these two cases measured alone in its own process, at the default --size on the reference
// corpus. They describe that sample and no other, so the comparison below is skipped for any run
// that used a different one — quoting them against 400 fixture idcodes would compare two corpora
// and read the difference as contamination.
const PARSE_JS_ALONE = 20.45;
const MATCH_JS_ALONE = 42.99;

const matchJsCost = at('parse + match benzene openchemlib-js');
console.log(
  'Read the openchemlib-js column as an upper bound. Every case here calls the same OpenChemLib\n' +
    'code and cannot be given a copy of its own, so a parse-only workload and a match workload in\n' +
    'one process slow each other down. The WASM column has no such neighbour and is unaffected: it\n' +
    'matches ssSearch.js to within half a percent. The shape of the table holds — parse is half the\n' +
    'work, and the half that is the slower of the two to speed up is what caps the whole scan below\n' +
    '2x — but both openchemlib-js ratios carry that inflation.',
);

if (molecules === DEFAULT_SIZE && !small) {
  console.log(
    `\nAlone in their own processes those two cases read ${PARSE_JS_ALONE.toFixed(2)} µs and ` +
      `${MATCH_JS_ALONE.toFixed(2)} µs; here\nthey read ${parseJsCost.toFixed(2)} and ` +
      `${matchJsCost.toFixed(2)}, ${gap(parseJsCost, PARSE_JS_ALONE)} and ` +
      `${gap(matchJsCost, MATCH_JS_ALONE)}.`,
  );
} else {
  console.log(
    `\nThe size of that inflation — about 11% at --size ${DEFAULT_SIZE} on the reference corpus — is` +
      '\nnot restated here, because this run sampled something else.',
  );
}

/**
 * Describes how far a measurement sits from the same case measured alone.
 * @param {number} here - What this run read.
 * @param {number} alone - What the case read in a process of its own.
 * @returns {string} The gap, in percent, said in the direction it actually went.
 */
function gap(here, alone) {
  const percent = 100 * (here / alone - 1);
  return percent >= 0
    ? `${percent.toFixed(0)}% higher`
    : `${(-percent).toFixed(0)}% lower`;
}
