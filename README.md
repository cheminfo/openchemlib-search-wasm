# openchemlib-search-wasm

Batch substructure search, batch similarity search, FragFp fingerprints and identity hashes over
arrays of OpenChemLib idcodes — with OpenChemLib compiled to WebAssembly.

## Install

```sh
npm install openchemlib-search-wasm
```

That is all. The WebAssembly module ships inside the package as a compressed string, so there is no
`.wasm` file to serve, no bundler plugin, no submodule to clone and no Java to install. Node 22 or
later, or a current browser; `SharedArrayBuffer` is needed only for the worker recipe below.

Updating is a plain `npm update openchemlib-search-wasm` — a release carries its own OpenChemLib, so
you never track one separately. **Building the module, and moving it to a newer OpenChemLib, is a
maintainer job**: the `openchemlib` git submodule and the JDK it needs live in
[CONTRIBUTING.md](CONTRIBUTING.md), not here.

## Use

```ts
substructureSearch<Entry>(idCodeQuery: string, entries: Entry[],
                          options?: SubstructureSearchOptions): SubstructureSearchResult<Entry>;
similaritySearch<Entry>(idCodeQuery: string, entries: Entry[],
                        options?: SimilaritySearchOptions): SimilaritySearchResult<Entry>;

// the 512-bit FragFp, for a fingerprint table: sixteen 32-bit words per molecule
getIndex(idCode: string): Int32Array;
getIndexes(idCodes: string[]): Int32Array[];

// the 64-bit hash a molecule keeps across its stereoisomers
getNoStereoHash(idCode: string, options?: HashOptions): bigint;
getNoStereoHashes(idCodes: string[], options?: HashOptions): BigInt64Array;

// the same, across its tautomers as well
getNoStereoTautomerHash(idCode: string, options?: HashOptions): bigint;
getNoStereoTautomerHashes(idCodes: string[], options?: HashOptions): BigInt64Array;
```

**Give it your objects and it gives them back.** An entry is an idcode or anything carrying one — a
database row, a candidate a prescreen yielded — and `matches` holds those same objects, so nothing
has to map positions back onto the array they came from.

```js
import { similaritySearch, substructureSearch } from 'openchemlib-search-wasm';

const benzene = 'gFp@DiTt@@B';
// benzene, formic acid, naphthalene
const idCodes = ['gFp@DiTt@@B', 'eMDARVB', 'det@@DjYUX^d@@@@B'];

const { matches, indexes, result } = substructureSearch(benzene, idCodes);
// matches  ['gFp@DiTt@@B', 'det@@DjYUX^d@@@@B']
// indexes  [0, 2]
// result   Uint8Array [1, 2, 1] — match, no match, match

// the idcode can sit anywhere in your entry; a numeric segment indexes an array
substructureSearch(benzene, rows, { jpath: 'molecule.idCode' });

const similar = similaritySearch(benzene, idCodes);
// similar.matches       most similar first
// similar.similarities  Float32Array [1, 0.75, 0.125] — aligned with matches
```

The query is searched as a fragment whatever its own fragment flag says. Similarity is the Tanimoto
coefficient on OpenChemLib's 512-bit FragFp.

### Options

| option      | default                   |                                                                     |
| ----------- | ------------------------- | ------------------------------------------------------------------- |
| `jpath`     | `'idCode'`                | where the idcode sits in an entry                                   |
| `onStep`    | —                         | called after each step; return `false` to stop                      |
| `stepSize`  | `4096` / `128`            | entries per step — about 100 ms either way                          |
| `collect`   | `true`                    | off fills `result` alone, for a worker writing into a shared buffer |
| `limit`     | `Number.MAX_SAFE_INTEGER` | substructure: stop at this many matches. similarity: keep the best  |
| `threshold` | `0`                       | similarity only: the coefficient at or above which an entry counts  |

Every search returns `{ matches, indexes, result, matched, unparsable, processed, total, elapsed,
stopped }`, and a similarity search adds `similarities`.

### Result codes

`result` holds one entry per input, in input order, so it can be read while the scan runs.

| substructure |                        | similarity |                        |
| ------------ | ---------------------- | ---------- | ---------------------- |
| `0`          | not scanned yet        | `NaN`      | not scanned yet        |
| `1`          | matches                | `0`–`1`    | the coefficient        |
| `2`          | does not               | `-1`       | idcode would not parse |
| `3`          | idcode would not parse |            |                        |

`0` is a legitimate similarity, which is why "not yet" is `NaN` there.

## Stopping early

`limit` is what makes a common query cheap. Over 409,686 real molecules, benzene matches 62% of
them:

|                             | scanned |            |
| --------------------------- | ------: | ---------: |
| whole corpus                | 409,686 |     8.78 s |
| `limit: 100`                |   4,096 |      43 ms |
| `limit: 100, stepSize: 256` |     512 |     4.5 ms |
| `limit: 100, stepSize: 64`  |     320 | **2.9 ms** |

A search stops at the end of the step that reached `limit`, so `stepSize` is the floor on how little
it can read — worth lowering when a common query only needs a first page.

The bounded rows read the front of the array they are handed, which is what a bounded scan always
does; in this corpus that front happens to hold smaller molecules than average (25.4 characters
against 38.7), so their cost per entry is below the whole-corpus figure rather than a fifth of it.

`onStep` gives the same control with a condition of your own — a deadline, an abort signal, a count.
It is synchronous and the scan does not yield, so keeping a UI responsive is yours to do: slice the
array across calls, or run the search in a worker.

## Across workers

`result` holds one code per entry in input order, so a corpus splits across workers with no
bookkeeping: give each worker a contiguous slice of the entries and `collect: false`, so it scans
without building match arrays it would only have to post back, then copy the `result` it returns
into that worker's slice of one `SharedArrayBuffer`.

409,686 molecules, benzene, one shared buffer:

| workers | 1      | 8          |
| ------- | ------ | ---------- |
| wall    | 8.78 s | **1.74 s** |

Browsers only allow `SharedArrayBuffer` in a cross-origin-isolated page: serve
`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. Node
needs nothing.

## Fingerprints

`getIndex` returns the FragFp in the same layout `openchemlib`'s `createIndex` produces, so a
`BigInt64Array` view over it is the eight columns `openchemlib-sqlite` stores — no conversion, no
copy:

```js
const index = getIndex(idCode);
const columns = new BigInt64Array(index.buffer, index.byteOffset, 8);
```

This is the expensive half of importing a library, and where the biggest speedup is.

## Identity hashes

Two hashes, for the two things "the same compound" usually means. Both are OpenChemLib's own —
`CanonizerUtil.getNoStereoHash` and `CanonizerUtil.getNoStereoTautomerHash` — so both are the value
any other OpenChemLib build computes, and the tests check the fixture molecules against
`openchemlib` to prove it.

|                           | drops                        | keeps apart   |
| ------------------------- | ---------------------------- | ------------- |
| `getNoStereoHash`         | stereochemistry              | the tautomers |
| `getNoStereoTautomerHash` | stereochemistry, tautomerism | —             |

`getNoStereoHash` strips the molecule of stereo information, canonizes it, and runs that idcode
through OpenChemLib's 64-bit hash. Both enantiomers of a centre, and both isomers of a double bond,
give the same value — the one to key on when a record's stereochemistry is unreliable but the bonds
it was drawn with are not.

`getNoStereoTautomerHash` reduces the molecule to its generic tautomer first, so the keto and the
enol form of a compound land on the same key as well — the one to key on when "the same compound"
means the same constitution rather than the same drawing.

```js
import {
  getNoStereoHash,
  getNoStereoTautomerHash,
} from 'openchemlib-search-wasm';

// both enantiomers of 2-chlorobutane
getNoStereoHash('gJPHADILuTb@') === getNoStereoHash('gJPHADILuTd@'); // true

// pentan-3-one drawn as the keto and as the enol form
getNoStereoHash('gGQ@@drmT@@') === getNoStereoHash('gGQ@@drsT@@'); // false
getNoStereoTautomerHash('gGQ@@drmT@@') ===
  getNoStereoTautomerHash('gGQ@@drsT@@'); // true
```

Both are signed 64-bit integers, which is exactly what an SQLite `INTEGER` column stores and
indexes, so a `BigInt64Array` of hashes goes straight into one. An idcode that will not parse, or a
molecule OpenChemLib cannot canonize, gets `NO_HASH` (`0n`).

Both take `{ largestFragmentOnly: true }` to strip everything but the largest fragment and
neutralize it first, so a salt hashes as its parent structure.

### What they cost

On ordinary drug-like molecules the no-stereo hash costs about 52 µs and the tautomer one about
145 µs. Want both columns? Call both — the two share the idcode parse and the stereo strip, but that
shared work is worth under 20 µs and is not worth an API to save.

The tautomer cost is nothing like uniform, though, and that changes the picture entirely on a real
library. It is driven by how many tautomeric sites a molecule has, and a molecule with a great many
can take the better part of a second before OpenChemLib abandons the enumeration. Roughly one in ten
of the test fixture is such a molecule, and they drag the mean to 29.6 ms — at which point the
no-stereo hash is 0.2% of the tautomer one.

Two things follow. Hash a library **in a worker**, never on the main thread. And if you only need
identity up to stereochemistry, `getNoStereoHash` is the one to reach for: it is the hash whose cost
you can predict.

## What you actually win

Against `openchemlib` 9.25.0, on 409,686 real idcodes, with identical hit counts for every query:

|                                       | openchemlib |    this |               |
| ------------------------------------- | ----------: | ------: | ------------- |
| substructure, per molecule            |     42.0 µs | 20.8 µs | **2.02x**     |
| substructure, whole corpus, 8 workers |      3.81 s |  1.74 s | **2.19x**     |
| fingerprint, per molecule             |     4580 µs |  832 µs | **5.51x**     |
| gzipped payload                       |      336 kB |   95 kB | **3.5x** less |

The substructure row is benzene; the six queries the benchmark runs span 2.00x to 2.22x.

**Substructure is only about 2x because half the work is decoding the idcode**, and that half is
only 1.7x faster; the graph match is 1.9x. Benchmarks that search molecules already parsed in memory
report 3–6x — this API is handed idcodes and pays the parse on every one. It is also **per core**:
`openchemlib` parallelises across workers just as well.

Full tables, and how each number was taken, in [benchmark/README.md](benchmark/README.md).

## When not to use it

**You already store fingerprints.** `similaritySearch` builds the FragFp for every idcode, and that
is the entire cost — the Tanimoto comparison itself is 0.03 µs in plain JavaScript. Compare the
stored ones directly and skip this; it exists for when idcodes are all you have.

**You can prescreen in SQL.** A fingerprint screen in the query removes most candidates before
anything is parsed, which is worth far more than 2x. Search the survivors, not the whole table.

## License

BSD-3-Clause.
