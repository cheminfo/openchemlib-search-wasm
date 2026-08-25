# openchemlib-search-wasm

Batch substructure search, batch similarity search and FragFp fingerprints over arrays of
OpenChemLib idcodes — with OpenChemLib compiled to WebAssembly.

## Install

```sh
npm install openchemlib-search-wasm
```

## Use

```ts
// blocking, whole array
ssSearch(idCodeQuery: string, idCodes: string[], result: Uint8Array): void;
similaritySearch(idCodeQuery: string, idCodes: string[], result: Float32Array): void;

// reports as it goes, yields to the event loop, stops when you say so
search(idCodeQuery: string, idCodes: string[], result: ResultBuffer,
       options?: SearchOptions): Promise<SearchSummary>;

// the 512-bit FragFp, for a fingerprint table: sixteen 32-bit words per molecule
getIndex(idCode: string, result?: Int32Array): Int32Array;
getIndexes(idCodes: string[], result?: Int32Array): Int32Array;
```

`result` is your buffer. The three search functions reset it, then write one entry per idcode, in
order, as the scan advances, so it must be exactly as long as `idCodes`. `getIndexes` is the
exception: it writes `INDEX_WORDS` (16) words per idcode and resets nothing.

```js
import {
  similaritySearch,
  ssSearch,
  SubstructureResult,
} from 'openchemlib-search-wasm';

const benzene = 'gFp@DiTt@@B';
// benzene, formic acid, naphthalene
const idCodes = ['gFp@DiTt@@B', 'eMDARVB', 'det@@DjYUX^d@@@@B'];

const hits = new Uint8Array(idCodes.length);
ssSearch(benzene, idCodes, hits);
// Uint8Array [1, 2, 1] — match, no match, match

const similarity = new Float32Array(idCodes.length);
similaritySearch(benzene, idCodes, similarity);
// Float32Array [1, 0.125, 0.75]

for (let i = 0; i < idCodes.length; i++) {
  if (hits[i] === SubstructureResult.match) console.log(idCodes[i]);
}
```

The query is searched as a fragment whatever its own fragment flag says. Similarity is the Tanimoto
coefficient on OpenChemLib's 512-bit FragFp.

## Result codes

`ssSearch` writes `SubstructureResult`:

| Name          | Value | Meaning                                      |
| ------------- | ----: | -------------------------------------------- |
| `unprocessed` |     0 | not tested yet                               |
| `match`       |     1 | the query is a substructure of this molecule |
| `noMatch`     |     2 | it is not                                    |
| `unparsable`  |     3 | this idcode could not be parsed              |

`similaritySearch` writes a float, with two sentinels in `SimilarityResult`:

| Name          |  Value | Meaning                         |
| ------------- | -----: | ------------------------------- |
| `unprocessed` |  `NaN` | not compared yet                |
| `unparsable`  |     -1 | this idcode could not be parsed |
| —             | 0 to 1 | the Tanimoto coefficient        |

`0` is a legitimate similarity, which is why "not yet" is `NaN` and not `0`.

**Why `Float32Array` and not `Float16Array`.** Writing one result costs 0.1213 µs per molecule —
0.013% of the 947 µs a similarity entry costs to compute — so the element type cannot make the scan
measurably faster either way. Half floats would only halve the buffer (0.8 MB instead of 1.6 MB for
400,000 molecules) and would cost precision: a 10-bit mantissa resolves a coefficient in [0, 1] to
about 0.001, and every value would stop matching openchemlib-js bit for bit, which is what the tests
assert. TeaVM 0.14.1 also ships no `Float16Array` binding, so it would mean hand-encoding halves into
a `Uint16Array`. Float32 is the cheaper answer on every axis that matters here.

A query idcode that cannot be parsed throws. A malformed idcode in `idCodes` is recorded as
`unparsable` and the scan continues; past 100 of them the input is not a list of idcodes and the
call throws, naming the query.

## Split it across workers

The caller owns the buffer so that several workers can fill one array while the main thread reads
it. Back it with a `SharedArrayBuffer`, give each worker its own slice of `idCodes` and
`result.subarray(from, to)`, and read progress on the main thread. Each index is written by exactly
one worker, so plain reads and writes are enough — no atomics.

```js
// main.js
import { Worker } from 'node:worker_threads';
import { SubstructureResult } from 'openchemlib-search-wasm';

const idCodes = await loadYourIdCodes(); // string[]
const workerCount = 8;
const result = new Uint8Array(new SharedArrayBuffer(idCodes.length));
const size = Math.ceil(idCodes.length / workerCount);

const running = [];
for (let from = 0; from < idCodes.length; from += size) {
  const to = Math.min(from + size, idCodes.length);
  const worker = new Worker(new URL('./worker.js', import.meta.url));
  worker.postMessage({
    idCodeQuery: 'gFp@DiTt@@B',
    idCodes: idCodes.slice(from, to),
    result: result.subarray(from, to),
  });
  running.push(
    new Promise((resolve) =>
      worker.on('message', () => resolve(worker.terminate())),
    ),
  );
}

const timer = setInterval(() => {
  let done = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i] !== SubstructureResult.unprocessed) done++;
  }
  render(done / result.length);
}, 100);

await Promise.all(running);
clearInterval(timer);
```

```js
// worker.js
import { parentPort } from 'node:worker_threads';
import { ssSearch } from 'openchemlib-search-wasm';

parentPort.on('message', ({ idCodeQuery, idCodes, result }) => {
  ssSearch(idCodeQuery, idCodes, result);
  parentPort.postMessage('done');
});
```

A worker blocks its own thread for the whole call, which is the point: the main thread stays free to
render. In the browser the shape is identical with `Worker` and `postMessage`, but the page must be
cross-origin isolated for `SharedArrayBuffer` to exist — serve it with
`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. Node
`worker_threads` needs nothing.

## Search with a callback

`search` runs the same scan in chunks, hands each chunk to `onStep`, and yields to the event loop
between them, so a whole-corpus scan can run without freezing the page. Returning `false` stops it.
The vocabulary is the one `openchemlib-utils` and `openchemlib-sqlite` already use: `mode`,
`'substructure'` / `'similarity'`, `interval`, and an `AbortController`.

```js
import { search, SubstructureResult } from 'openchemlib-search-wasm';

const result = new Uint8Array(idCodes.length);
const hits = [];

const summary = await search(benzene, idCodes, result, {
  mode: 'substructure', // or 'similarity', with a Float32Array
  interval: 100, // ms of scanning between onStep calls
  onStep({ from, to, matched, processed, total }) {
    for (let i = from; i < to; i++) {
      if (result[i] === SubstructureResult.match) hits.push(i);
    }
    render(processed / total);
    return hits.length < 100; // false stops the search
  },
});
// { processed, matched, unparsable, total, elapsed, stopped }
```

| option       | default          |                                                                         |
| ------------ | ---------------- | ----------------------------------------------------------------------- |
| `mode`       | `'substructure'` | `'substructure'` writes a `Uint8Array`, `'similarity'` a `Float32Array` |
| `interval`   | `100`            | ms of scanning between `onStep` calls; the chunk size adapts to hit it  |
| `onStep`     | —                | return `false` to stop                                                  |
| `controller` | —                | an `AbortController`; aborting rejects with an `AbortError`             |
| `threshold`  | `0.8`            | in `similarity` mode, what counts as a match in `step.matched`          |

**Stopping early is where this pays.** Over the whole 409,686-idcode corpus, with benzene:

|                                | scanned |       time |
| ------------------------------ | ------: | ---------: |
| whole corpus                   | 409,686 |     9.22 s |
| stop at the first 100 matches  |     768 | **6.9 ms** |
| stop at the first 1000 matches |   1,792 |    19.2 ms |

Chunking costs nothing — 800 chunked calls measure the same as one call over the whole corpus,
because the idcodes are read out of your array one at a time rather than converted up front. At the
default `interval` the steps land at a 76 ms median and 102 ms p90; the tail is molecule-size
variance, not mis-sizing, and a caller wanting smoother frames sets `interval: 16`.

## Build a fingerprint table

`getIndexes` returns the 512-bit FragFp of every idcode, sixteen 32-bit words each, in the same word
order `openchemlib-js`'s `createIndex` produces — verified bit for bit. A `BigInt64Array` view over
it is exactly the eight columns `openchemlib-sqlite` stores, so there is no conversion and no copy:

```js
import { getIndexes } from 'openchemlib-search-wasm';

const indexes = getIndexes(idCodes);
for (let i = 0; i < idCodes.length; i++) {
  const columns = new BigInt64Array(indexes.buffer, i * 64, 8); // ss_index0..7
  insert.run(entryId[i], ...columns);
}
```

Building a fingerprint is about forty times a substructure test, so this is the expensive part of
importing a library — and where the biggest speedup is:

|                                        | per molecule | 409,686 molecules |
| -------------------------------------- | -----------: | ----------------: |
| `openchemlib-js` `createIndex`         |      4484 µs |          30.6 min |
| `openchemlib-search-wasm` `getIndexes` |       897 µs |       **6.1 min** |
|                                        |              |          **5.0x** |

OpenChemLib parses the 512 key fragments once and holds them statically, so a batch pays for them on
its first molecule and never again. An idcode that will not parse gets sixteen zeros, which no
non-empty query is a subset of, so it can never become a false candidate.

## Using it from openchemlib-sqlite

Its SQL prefilter — `(s.ss_indexN & ?) = ?` over all eight chunks — _is_ the complete 512-bit
screen, so the candidates it returns are exactly the molecules that reach the isomorphism. Replacing
the per-candidate `Molecule.fromIDCode` + `isFragmentInMolecule` loop with one `search` call over
the candidate idcodes is measured, on candidate sets produced by that very prefilter over 50,000
molecules:

| query       | candidates |   today | with `search` |       |
| ----------- | ---------: | ------: | ------------: | ----: |
| benzene     |     33,717 | 1746 ms |        860 ms | 2.03x |
| pyridine    |      5,510 |  295 ms |        137 ms | 2.15x |
| carboxyl    |     14,792 |  685 ms |        340 ms | 2.01x |
| anilide     |      4,507 |  276 ms |        129 ms | 2.13x |
| sulfonamide |      2,958 |  177 ms |         87 ms | 2.02x |
| naphthalene |     19,278 | 1104 ms |        537 ms | 2.05x |

**2.05x on the candidate loop**, with identical hit counts. Its `maxResults` and `timeoutMs` become
the `onStep` return value, and `controller` replaces the deadline check. Note that its loop already
stops at `maxResults`, so for a first page of 100 the two are level — the 2x is on the work, not on
the early exit.

The bigger win for that project is `getIndexes`: building `ocl_ss_index` for 400,000 molecules drops
from about half an hour to six minutes, and to roughly a minute and a half across eight workers.

## What you actually win

Against `openchemlib` 9.25.0 (the GWT build), on 409,686 real idcodes, Apple Silicon, node 24. Every
row is produced by a file in `benchmark/`; [benchmark/README.md](benchmark/README.md) carries the
output and the method.

|                                           | openchemlib-search-wasm | openchemlib |            ratio |
| ----------------------------------------- | ----------------------: | ----------: | ---------------: |
| substructure, per molecule (six queries)  |                 23.9 µs |     43.7 µs |         **1.8x** |
| substructure, whole corpus, one thread    |                  9.22 s |     16.78 s |         **1.8x** |
| substructure, whole corpus, eight workers |                  1.98 s |      3.95 s |         **2.0x** |
| similarity, per molecule                  |                  947 µs |     4738 µs |         **5.0x** |
| similarity, whole corpus, one thread      |                 6.5 min |    32.4 min |         **5.0x** |
| gzipped payload                           |   118 KB + 6 KB runtime |      332 KB | **2.7x smaller** |
| engine import, per worker                 |                51–91 ms |    22–32 ms |                  |

**The answers are identical.** The same hit counts for six queries across all 409,686 molecules
(benzene 257,625, pyridine 30,879, sulfonamide 10,826, naphthalene 16,882, plus carboxyl and
anilide), and similarity values that match bit for bit (max difference 0).

**Why substructure is only 1.8x.** Half the work is parsing the idcode, and that part is only 1.7x
faster; the isomorphism is 2.0x:

| Step               | openchemlib-search-wasm | openchemlib | ratio |
| ------------------ | ----------------------: | ----------: | ----: |
| parse the idcode   |                 11.8 µs |     20.5 µs |  1.7x |
| match the fragment |                 11.2 µs |     22.5 µs |  2.0x |
| total              |                 23.0 µs |     43.0 µs |  1.9x |

Benchmarks that search molecules already parsed in memory report 3–6x. That is not the shape of this
API: it is given idcodes and pays the parse on every one of them.

**The 1.8x is per core, not per worker.** Both engines parallelise the same way, so eight workers of
`openchemlib` land roughly where four workers of `openchemlib-search-wasm` do:

| Workers | openchemlib-search-wasm | Molecules/s | openchemlib | Molecules/s |
| ------: | ----------------------: | ----------: | ----------: | ----------: |
|       1 |                  9.22 s |      44,400 |     16.78 s |      24,400 |
|       2 |                  4.74 s |      86,400 |      8.87 s |      46,200 |
|       4 |                  2.83 s |     144,600 |      5.04 s |      81,300 |
|       8 |                  1.98 s |     206,800 |      3.95 s |     103,800 |

Neither reaches 8x: this machine has six performance cores and four efficiency ones, so an even
split leaves the efficiency cores finishing last.

## When not to use this

**You already store fingerprints.** `similaritySearch` builds the 512-bit FragFp for every idcode at
about 947 µs, and that is essentially the entire cost — the Tanimoto comparison itself is 0.03 µs in
plain JavaScript, so building the fingerprint costs 30,000 times what comparing one does. If you
keep the fingerprints, as `openchemlib-sqlite` does in its `ocl_ss_index` table, compare those
directly and skip this function. It exists for the case where idcodes are all you have.

**You can prescreen in SQL.** A fingerprint screen in the query removes most candidates before
anything is parsed, and that is worth far more than 1.8x. Run `ssSearch` over the survivors, not
over the whole table.

## Browser and Node

Needs WebAssembly GC and, for the worker recipe, `SharedArrayBuffer`: Node 22 or later,
Chrome/Edge 119+, Firefox 120+, current Safari.

The module ships inside the bundle. `wasm/` holds the 382 KB module as a gzip+base64 string plus the
TeaVM runtime; the loader decodes it with `atob` and `DecompressionStream` and instantiates it —
no `fetch`, no `fs`, no separate `.wasm` asset to configure in a bundler. That is what lets a worker
start the module from the same bundle it was loaded from, and the whole import — decode, gunzip,
compile, instantiate — costs 51–91 ms once per worker.
The package is an ES module that instantiates on import, so `ssSearch`, `similaritySearch` and
`getIndexes` are plain synchronous calls. Only `search` is `async`, and only because it yields to
the event loop between chunks.

## Building from source

See [CONTRIBUTING.md](CONTRIBUTING.md) — a JDK 21, Maven, and the `openchemlib` submodule.

## License

BSD-3-Clause.
