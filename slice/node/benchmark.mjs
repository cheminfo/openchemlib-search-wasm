// Substructure search benchmark: GWT-JS (openchemlib) vs WASM (TeaVM slice),
// each with and without the fingerprint preindex, over the same molecule set and
// queries. Match counts are asserted identical across all four cells before any
// timing is trusted. Run: node node/benchmark.mjs
import { load } from '../target/wasm-gc/slice.wasm-runtime.js';
import GWT from '/Users/lpatiny/git/cheminfo/inchi/node_modules/openchemlib/dist/openchemlib.js';

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SLICE = join(import.meta.dirname, '..');
const JAVA_HOME = '/opt/homebrew/Cellar/openjdk/21.0.2/libexec/openjdk.jdk/Contents/Home';
const JSO_JAR = `${process.env.HOME}/.m2/repository/org/teavm/teavm-jso/0.14.1/teavm-jso-0.14.1.jar`;

// Run the native-JVM baseline as a subprocess and parse its CSV output, so the
// Java, WASM and GWT numbers come from one reproducible command.
function runJava() {
  const out = execFileSync(
    `${JAVA_HOME}/bin/java`,
    ['-cp', `${join(SLICE, 'target/jvm-classes')}:${JSO_JAR}`, 'org.openchemlib.wasm.slice.JavaBench', join(SLICE, 'data/targets.smi')],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
  );
  const rows = {};
  let build = null;
  for (const line of out.split('\n')) {
    const f = line.split(',');
    if (f[0] === 'JAVA_BUILD') build = { ms: Number(f[1]), mols: Number(f[2]) };
    else if (f[0] === 'JAVA_ROW' && f[1] !== 'query') {
      rows[f[1]] = { hits: Number(f[2]), noIndex: Number(f[3]), withIndex: Number(f[4]) };
    }
  }
  return { build, rows };
}

const smilesList = readFileSync(join(import.meta.dirname, '..', 'data', 'targets.smi'), 'utf8')
  .split('\n')
  .filter(Boolean);

const QUERIES = [
  'c1ccccc1', // benzene
  'c1ccncc1', // pyridine
  'C(=O)O', // carboxyl
  'C(=O)Nc1ccccc1', // anilide
  'S(=O)(=O)N', // sulfonamide
  'c1ccc2ccccc2c1', // naphthalene
];

const REPEATS = 3;
const best = (fn) => {
  let min = Infinity;
  let value;
  for (let i = 0; i < REPEATS; i++) {
    const t0 = performance.now();
    value = fn();
    const dt = performance.now() - t0;
    if (dt < min) min = dt;
  }
  return { ms: min, value };
};

// ---- WASM engine ----------------------------------------------------------
const teavm = await load(new Uint8Array(readFileSync(join(import.meta.dirname, '..', 'target', 'wasm-gc', 'slice.wasm'))));
const wasm = teavm.exports;
const wasmBuild = best(() => wasm.loadTargets(smilesList.join('\n')));
const wasmCount = wasmBuild.value;

// ---- GWT engine -----------------------------------------------------------
const gwtBuild = best(() => {
  const molecules = [];
  const indices = [];
  const indexer = new GWT.SSSearcherWithIndex();
  for (const smiles of smilesList) {
    try {
      const molecule = GWT.Molecule.fromSmiles(smiles);
      molecules.push(molecule);
      indices.push(indexer.createIndex(molecule));
    } catch {
      // skip unparseable
    }
  }
  return { molecules, indices };
});
const { molecules: gwtMolecules, indices: gwtIndices } = gwtBuild.value;

function gwtCountWithIndex(querySmiles) {
  const fragment = GWT.Molecule.fromSmiles(querySmiles);
  fragment.setFragment(true);
  const searcher = new GWT.SSSearcherWithIndex();
  const queryIndex = searcher.createIndex(fragment);
  let count = 0;
  for (let i = 0; i < gwtMolecules.length; i++) {
    searcher.setFragment(fragment, queryIndex);
    searcher.setMolecule(gwtMolecules[i], gwtIndices[i]);
    if (searcher.isFragmentInMolecule()) count++;
  }
  return count;
}

function gwtCountWithoutIndex(querySmiles) {
  const fragment = GWT.Molecule.fromSmiles(querySmiles);
  fragment.setFragment(true);
  const searcher = new GWT.SSSearcher();
  searcher.setFragment(fragment);
  let count = 0;
  for (let i = 0; i < gwtMolecules.length; i++) {
    searcher.setMolecule(gwtMolecules[i]);
    if (searcher.isFragmentInMolecule()) count++;
  }
  return count;
}

const java = runJava();

// eslint-disable-next-line no-console
const log = (...a) => console.log(...a);
const f1 = (n) => n.toFixed(1);

let failures = 0;
const rows = [];
for (const query of QUERIES) {
  const gwtNo = best(() => gwtCountWithoutIndex(query));
  const wasmNo = best(() => wasm.countWithoutIndex(query));
  const gwtIx = best(() => gwtCountWithIndex(query));
  const wasmIx = best(() => wasm.countWithIndex(query));
  const jvm = java.rows[query];

  // Correctness gate: all measured cells must agree on the hit count.
  const counts = [gwtNo.value, wasmNo.value, gwtIx.value, wasmIx.value, jvm.hits];
  const agree = counts.every((c) => c === counts[0]);
  if (!agree) failures++;

  rows.push({ query, hits: counts[0], agree, jvm, gwtNo: gwtNo.ms, wasmNo: wasmNo.ms, gwtIx: gwtIx.ms, wasmIx: wasmIx.ms });
}

log(`# Substructure benchmark — ${smilesList.length} molecules (10k.sdf sample), best-of-N ms\n`);
log('## Build: parse + fingerprint index\n');
log('| Engine | ms | vs GWT |');
log('|---|--:|--:|');
log(`| Native Java (HotSpot) | ${f1(java.build.ms)} | ${f1(gwtBuild.ms / java.build.ms)}× |`);
log(`| WASM (TeaVM WasmGC) | ${f1(wasmBuild.ms)} | ${f1(gwtBuild.ms / wasmBuild.ms)}× |`);
log(`| GWT-JS (current) | ${f1(gwtBuild.ms)} | 1× |`);
log(`\nmolecules built: Java ${java.build.mols}, WASM ${wasmCount}, GWT ${gwtMolecules.length}\n`);

log('## Search, NO index (SSSearcher — isomorphism on every molecule)\n');
log('| Query | Hits | Java | WASM | GWT | WASM vs GWT |');
log('|---|--:|--:|--:|--:|--:|');
for (const r of rows) {
  log(`| \`${r.query}\` | ${r.hits} | ${f1(r.jvm.noIndex)} | ${f1(r.wasmNo)} | ${f1(r.gwtNo)} | ${f1(r.gwtNo / r.wasmNo)}× |`);
}

log('\n## Search, WITH index (SSSearcherWithIndex — fingerprint screen then isomorphism)\n');
log('| Query | Hits | Java | WASM | GWT | WASM vs GWT |');
log('|---|--:|--:|--:|--:|--:|');
for (const r of rows) {
  log(`| \`${r.query}\` | ${r.hits} | ${f1(r.jvm.withIndex)} | ${f1(r.wasmIx)} | ${f1(r.gwtIx)} | ${f1(r.gwtIx / r.wasmIx)}× |`);
}

log(`\n${failures === 0 ? '✓ hit counts agree across Java, WASM and GWT for every query' : `✗ ${failures} query(ies) disagreed`}`);
process.exit(failures === 0 ? 0 : 1);
