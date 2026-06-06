// Confirms TeaVM's object-export model end to end: exported class is a JS
// constructor with static methods; instances carry their instance methods and
// can return further Java objects. This is the architecture openchemlib-wasm
// uses (a TS class wrapping the exported Java object).
import { load } from '../target/wasm-gc/spike.wasm-runtime.js';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const teavm = await load(new Uint8Array(await readFile(join(import.meta.dirname, '..', 'target', 'wasm-gc', 'spike.wasm'))));
const ex = teavm.exports;

let failures = 0;
const check = (name, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures++;
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${actual}${ok ? '' : ` (expected ${expected})`}`);
};

check('exported class is a constructor function', typeof ex.Counter, 'function');
check('static factory exists', typeof ex.Counter.create, 'function');

const c = ex.Counter.create(5);
c.add(3);
c.add(4);
check('factory instance mutation 5+3+4', c.get(), 12);

const d = c.copy();
d.add(100);
check('chained object is independent (original)', c.get(), 12);
check('chained object carried state +100', d.get(), 112);

const e = new ex.Counter(10);
e.add(1);
check('new Counter(10)+1', e.get(), 11);

// eslint-disable-next-line no-console
console.log('---');
// eslint-disable-next-line no-console
console.log(failures === 0 ? 'INSTANCE EXPORT CONFIRMED — TS wraps Java objects directly' : `${failures} interop check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
