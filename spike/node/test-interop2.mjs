// Verify the interop features the OCL wrappers depend on.
import { load } from '../target/wasm-gc/spike.wasm-runtime.js';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const teavm = await load(new Uint8Array(await readFile(join(import.meta.dirname, '..', 'target', 'wasm-gc', 'spike.wasm'))));
const ex = teavm.exports;

let failures = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${JSON.stringify(actual)}${ok ? '' : ` (expected ${JSON.stringify(expected)})`}`);
};

// 1. exported object as a parameter to another exported method
const a = ex.Counter.create(7);
const b = ex.Counter.create(35);
check('object-as-parameter a.plus(b)', a.plus(b), 42);

// 2. options object in, with undefined / empty / populated
check('options: undefined', ex.InteropProbe.readOptions(), 'no-options');
check('options: empty {}', ex.InteropProbe.readOptions({}), 'noCoordinates=false,smartsMode=null');
check('options: populated', ex.InteropProbe.readOptions({ noCoordinates: true, smartsMode: 'guess' }), 'noCoordinates=true,smartsMode=guess');

// 3. nested int[][] return
check('nested array return', ex.InteropProbe.matchList(), [[2, 3], [4, 5]]);

// 4. constructed JS object return
const r = ex.InteropProbe.makeResult('abc', 9);
check('constructed object .idCode', r.idCode, 'abc');
check('constructed object .count', r.count, 9);

// 5. exception propagation + message (tests use .toThrow(/regex/))
let threw = null;
try {
  ex.InteropProbe.boom();
} catch (error) {
  threw = error;
}
const msgOk = threw != null && /unknown element label found/.test(String(threw.message ?? threw));
if (!msgOk) failures++;
// eslint-disable-next-line no-console
console.log(`${msgOk ? 'PASS' : 'FAIL'}  exception message propagates: ${threw ? String(threw.message ?? threw) : '(no throw)'}`);

// eslint-disable-next-line no-console
console.log('---');
// eslint-disable-next-line no-console
console.log(failures === 0 ? 'ALL INTEROP FEATURES WORK' : `${failures} interop feature(s) FAILED`);
process.exit(failures === 0 ? 0 : 1);
