// Stage 2 verification: the real OpenChemLib substructure pipeline, compiled to
// WasmGC by TeaVM, run in Node. Proves SMILES parsing, aromaticity, idcode
// canonicalization and index-screened substructure search all work in wasm, and
// cross-checks the idcode against the shipping GWT build of openchemlib-js.
import { load } from '../target/wasm-gc/slice.wasm-runtime.js';
// Absolute path to a published GWT build of openchemlib, for the byte-identical
// idcode cross-check (the local repo's GWT output is not built here).
import OCL from '/Users/lpatiny/git/cheminfo/inchi/node_modules/openchemlib/dist/openchemlib.js';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const wasmBytes = new Uint8Array(
  await readFile(join(import.meta.dirname, '..', 'target', 'wasm-gc', 'slice.wasm')),
);
const teavm = await load(wasmBytes);
const wasm = teavm.exports;

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${actual}${ok ? '' : ` (expected ${expected})`}`);
}

// eslint-disable-next-line no-console
console.log('selfTest():', wasm.selfTest());
// eslint-disable-next-line no-console
console.log('---');

// Substructure correctness (index-screened, long[] fingerprint path).
check('benzene in ethylbenzene', wasm.isFragmentInMolecule('c1ccccc1', 'CCc1ccccc1'), true);
check('benzene in cyclohexane', wasm.isFragmentInMolecule('c1ccccc1', 'C1CCCCC1'), false);
check('benzene in pyridine', wasm.isFragmentInMolecule('c1ccccc1', 'c1ccncc1'), false);
check('pyridine in nicotine', wasm.isFragmentInMolecule('c1ccncc1', 'CN1CCC[C@H]1c1cccnc1'), true);
check('carboxyl in aspirin', wasm.isFragmentInMolecule('C(=O)O', 'CC(=O)Oc1ccccc1C(=O)O'), true);

// eslint-disable-next-line no-console
console.log('---');

// idcode must be byte-identical to the GWT build of openchemlib-js.
for (const smiles of ['CCc1ccccc1', 'c1ccncc1', 'CC(=O)Oc1ccccc1C(=O)O', 'C[C@H](N)C(=O)O']) {
  const wasmIdCode = wasm.smilesToIDCode(smiles);
  const gwtMol = OCL.Molecule.fromSmiles(smiles);
  const gwtIdCode = gwtMol.getIDCode();
  check(`idcode(${smiles}) == GWT`, wasmIdCode, gwtIdCode);
}

// eslint-disable-next-line no-console
console.log('---');
// eslint-disable-next-line no-console
console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
