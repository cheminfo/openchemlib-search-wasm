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

// the same two canonical forms as idcodes, for a column that stores the form itself
getNoStereoIdCode(idCode: string, options?: HashOptions): string;
getNoStereoIdCodes(idCodes: string[], options?: HashOptions): string[];
getNoStereoTautomerIdCode(idCode: string, options?: HashOptions): string;
getNoStereoTautomerIdCodes(idCodes: string[], options?: HashOptions): string[];

// a hash as the 16 hex digits that cross an API, and back
hashToHex(hash: bigint): string;
hexToHash(hex: string): bigint;

// the hash of a canonical idcode you already hold, without canonizing again
strongHash(idCode: string): bigint;

// where OpenChemLib's own diagnostics go; nothing is printed by default
setLogHandler(handler: LogHandler | null): void;
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

**Pass `byteOffset` and the length, as above.** `getIndexes` returns its views over one shared
buffer — offsets 0, 64, 128 and so on — so `new BigInt64Array(index.buffer)` is 8 columns only for
the first molecule and silently reads the first molecule's words for every other one. It is wrong in
a way nothing reports: the row is written, the index is built, and the screen then misses real hits.
`getIndex` on its own always sits at offset 0, which is exactly what makes the mistake survive
testing on one molecule.

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

### The canonical form itself

Each hash is OpenChemLib's 64-bit StrongHasher over a canonical idcode, and that idcode is available
too — `getNoStereoIdCode` and `getNoStereoTautomerIdCode`, with `…IdCodes` batch forms. They are the
exact strings the hashes hash, computed by the same code, so the two can never disagree.

Prefer the hash for a column that is only ever compared: 8 bytes that an integer index handles,
against around 25 characters for a no-stereo idcode and roughly twice that for a tautomer one. Reach
for the idcode when you need the canonical form itself — to show it, to hand it to another
OpenChemLib, or because a 1-in-2^64 collision is not acceptable for what the column decides.

**A tautomer idcode is a key, not a structure.** Parsing one back gives a molecule with every
tautomeric bond normalized and pi-electron counts in its atom labels, not the compound.

### Stereochemistry and coordinates

These functions canonize with the canonizer told to disregard stereochemistry, rather than by
stripping stereo from the molecule and canonizing that. The distinction matters because the module
parses idcodes without inventing coordinates: `stripStereoInformation()` turns an implicit
double-bond configuration into a cross bond, there is no stereo bond to turn without coordinates, and
the canonizer then assigns a configuration instead of dropping one. Measured over 400 real idcodes,
the stripping route disagreed with the answer a caller holding a molecule gets on 6 of them — turning
an unconfigured double bond into E, and flipping a Z one. So a compound drawn without its
double-bond stereo keyed differently from the same compound drawn with it, which is the one thing
these keys exist to prevent.

Disregarding stereo in the canonizer agrees with the coordinate-bearing answer on all 400 and costs
nothing. Inventing coordinates would also agree, and costs 19 times the parse.

**This changed the hashes in 2.0.0.** A column of `getNoStereoHash` or `getNoStereoTautomerHash`
values written by 1.x has to be rebuilt; around 1.5% of them were wrong, and which ones depends on
whether the molecule had an unconfigured stereogenic double bond.

### Bounding the tautomer tail

The cost of a tautomer key is set by how many tautomers the molecule has, not by its size, and the
spread is enormous: over a drug-like fixture the median molecule takes 0.12 ms and one in a hundred
takes most of a second. `maxTautomers` is the ceiling OpenChemLib stops at, and lowering it bounds
that tail. `tautomerCounts` says which molecules ran into it — the only signal that a key came from
a truncated enumeration, and so may not be canonical:

```js
const tautomerCounts = new Int32Array(idCodes.length);
const maxTautomers = 1000;
const keys = getNoStereoTautomerIdCodes(idCodes, {
  maxTautomers,
  tautomerCounts,
});

// keys[i] is not canonical where this holds — record it next to the key
const truncated = (i) => tautomerCounts[i] >= maxTautomers;
```

Measured over 200 fixture idcodes:

|   `maxTautomers` |  median |    p99 | slowest | whole batch | truncated |
| ---------------: | ------: | -----: | ------: | ----------: | --------: |
| 100000 (default) | 0.12 ms | 807 ms |  969 ms |     1824 ms |         2 |
|            10000 | 0.06 ms |  46 ms |   63 ms |      135 ms |         2 |
|             1000 | 0.06 ms |   3 ms |    4 ms |       33 ms |         2 |
|              100 | 0.06 ms |   1 ms |    1 ms |       17 ms |         8 |

At 1000 the slowest molecule is 242x cheaper and the batch 55x, and the same two molecules are
truncated as at the default — so the ceiling costs nothing on this fixture beyond what the default
already gave up on. Where it lands for your library is an empirical question: lower it, and count.

### Getting both the key and its hash

`strongHash` is OpenChemLib's 64-bit hasher, and every `CanonizerUtil` hash is defined as that hasher
over a canonical idcode. So a caller that wants both forms asks for the idcode and hashes it, rather
than calling two functions that each canonize:

```js
const idCode = getNoStereoTautomerIdCode(entry);
const hash = strongHash(idCode); // identical to getNoStereoTautomerHash(entry)
```

That matters because canonizing a generic tautomer is the most expensive thing here: asking for both
separately costs 9% more on the median molecule and 48% more averaged over a library. It is also how
a database backfills a hash column from idcodes it already stores, with no chemistry at all.

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

### Getting a hash out of a process

A hash is a signed 64-bit integer. `JSON.stringify` throws on a `BigInt`, and a JSON number could
not carry one anyway, so a hash that leaves the process goes as the 16 hex digits of its pattern:

```js
import { hashToHex, hexToHash } from 'openchemlib-search-wasm';

hashToHex(getNoStereoTautomerHash(idCode)); // 'eb14b9bc9ab4dd52', always 16 characters
hexToHash('eb14b9bc9ab4dd52'); // -1507375755561738926n
```

`hash.toString(16)` is not the same thing: it writes `-1` for `-1n`, where the pattern is
`ffffffffffffffff`, and it pads nothing.

Store the hash in an integer column — 8 bytes, and the column indexes as an integer — and let the
database format it on the way out. SQLite's `printf('%016x', hash)` produces exactly the same
string, which also keeps a 64-bit value from ever being read into a JavaScript number:

```sql
SELECT printf('%016x', no_stereo_tautomer_hash) AS hash FROM molecules WHERE id = ?;
```

## Diagnostics

**Nothing here writes to your console.** The generated TeaVM runtime maps Java's standard output
onto `console.log`, which is the stream a server writing structured logs is already using. Anything
OpenChemLib printed would interleave unparsable lines into that log, so Java's two streams are
routed to a sink that drops them, and a host that wants them says where:

```js
import { setLogHandler } from 'openchemlib-search-wasm';

setLogHandler((message, stream) => logger.debug({ stream }, message));
setLogHandler(null); // back to discarding
```

The handler applies whether or not the module has been instantiated, so it can be set at startup or
around a single call. It is per module instance, which means per worker.

OpenChemLib's one message, `Tautomer count exceeds maximum`, is switched off at its source rather
than merely dropped here: it built its text with a full extra canonization of the molecule, once per
molecule it gave up on. `tautomerCounts` says the same thing without the work.

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
