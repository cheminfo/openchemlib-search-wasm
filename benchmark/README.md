# Benchmarks

Five files. Four are [benchmark.js](https://benchmarkjs.com) suites that A/B `openchemlib-wasm`
against `openchemlib` 9.25.0 in one process on the same idcodes; the fifth is a whole-corpus
measurement across worker threads, which benchmark.js is the wrong tool for.

```sh
node benchmark/ssSearch.js           # substructure search, six queries, both engines
node benchmark/parse.js              # where a scan's time goes: parse vs isomorphism
node benchmark/similaritySearch.js   # similarity, and why you should store fingerprints instead
node benchmark/boundary.js           # what crossing into WASM costs, with no chemistry behind it
node benchmark/scan.mjs              # the whole corpus across 1, 2, 4, 8 workers, both engines
```

`npm run benchmark` runs the first, `npm run benchmark-scan` the last.

## The corpus

Every file reads the same idcodes, in this order:

1. `$OCL_IDCODES`, when set.
2. `dev/public/idcodes.txt` — the 409,686 idcodes of reference.cheminfo.org, written by
   `npm run dataset`. 15.5 MiB of third-party data; gitignored, never committed.
3. `src/__tests__/data/idcodes.txt` — the 1,999-idcode test fixture. A run that falls back to it
   prints a warning, and its numbers are not worth quoting.

**The sample is strided, never a prefix.** The reference corpus is ordered, so its first 25,000
idcodes average 27.1 characters against 38.67 over the whole file: timing a prefix reads about 40%
fast on molecules that are not representative. Every 16th idcode averages 39.03 characters and
reproduces the corpus-wide benzene hit rate to within a tenth of a percent (62.92% against 62.88%).

`--size` (how many idcodes) and `--samples` (benchmark.js `minSamples`) can both be lowered for a
quick look — `--samples 2` finishes in seconds — but the numbers below were taken at the defaults,
and anything quoted anywhere must be. Every case reports its relative margin of error; above 10% it
is marked with a `!` and must not be used.

## What each file answers

| file                  | question                                                                   | default corpus | runtime |
| --------------------- | -------------------------------------------------------------------------- | -------------- | ------- |
| `ssSearch.js`         | How much faster is a substructure scan, over queries of every selectivity? | 25,000         | ~7 min  |
| `parse.js`            | Why is it about 2x and not 10x?                                            | 25,000         | ~5 min  |
| `similaritySearch.js` | What does a similarity scan cost, and what should you do instead?          | 1,000          | ~4 min  |
| `boundary.js`         | What share of a scan is the JS↔WASM crossing itself?                       | 200,000        | ~4 min  |
| `scan.mjs`            | What does the whole corpus cost, on N cores, for real?                     | 409,686        | ~1 min  |

Every A/B asserts the two engines agree before it times anything: `ssSearch.js` and `scan.mjs`
compare hit counts per query, `similaritySearch.js` compares every coefficient, `parse.js` checks
that its parse-only probe really matches nothing, and `boundary.js` checks that not one entry was
parsed. A benchmark that silently compares different work is worthless, so these throw rather than
print.

### `openchemlib-js` is called the same way the WASM module is

`Molecule.fromIDCode(idCode, false)` — the second argument matters more than anything else in this
directory. It defaults to `true`, which invents 2D coordinates the search never looks at, and
leaving it on measures **330 µs per molecule against 23**. A comparison that forgets it reports a
14x speedup that is really a coordinate generator. The WASM build parses with
`IDCodeParserWithoutCoordinateInvention`; `false` is what selects the same thing here.

### Isolating a parse when the module exports no parser

`openchemlib-wasm` exports two functions and neither of them is "parse this idcode", so `parse.js`
gets at the parse from the outside: it searches for a **400-atom chain**, which `SSSearcher` rejects
on `fragment.getAtoms() > molecule.getAtoms()` before it builds one feature or walks one bond. What
is left is the parse and the neighbour arrays. The file checks the corpus's largest molecule (254
atoms) against the probe before trusting it.

`boundary.js` uses the same trick one level lower: `Search.parse` gives up on the first character
above 127 without calling the parser, and on a zero-length string without reading one — but TeaVM
has already marshalled the whole JS string by then. So a scan over 38-character strings that begin
with `ÿ` measures the crossing and the result writes with none of the chemistry underneath, and the
empty-string case separates the per-call cost from the per-character one.

## Results

Machine: darwin 25.0.0 arm64, Apple Silicon, 10 cores (6 performance + 4 efficiency), node
v24.15.0. Corpus: the 409,686 idcodes of reference.cheminfo.org.

### The table to quote

|                                           | openchemlib-wasm | openchemlib-js 9.25.0 |     ratio |
| ----------------------------------------- | ---------------: | --------------------: | --------: |
| substructure, per molecule (6-query mean) |          23.9 µs |               43.7 µs | **1.83x** |
| substructure, whole corpus, 1 worker      |           9.22 s |               16.78 s | **1.82x** |
| substructure, whole corpus, 8 workers     |           1.98 s |                3.95 s | **1.99x** |
| similarity, per molecule                  |           947 µs |               4738 µs | **5.00x** |
| similarity, whole corpus, 1 worker        |          6.5 min |              32.4 min | **5.00x** |
| Tanimoto on a **stored** FragFp, plain JS |        0.0316 µs |                     — |           |
| engine import, per worker                 |         51–91 ms |              22–32 ms |           |
| JS↔WASM crossing, per molecule            | 0.5519 µs (2.4%) |                     — |           |

Hit counts are identical for all six queries over all 409,686 molecules, and every similarity
coefficient matches bit for bit (max difference 0 over 1,000 molecules). Verified whole-corpus hit
counts: benzene 257,625, pyridine 30,879, sulfonamide 10,826, naphthalene 16,882.

"Engine import" is the whole cost a worker pays before its first scan — for WASM, base64-decoding
and gunzipping the embedded module, then compiling and instantiating it; for openchemlib-js,
parsing and evaluating the bundle. Eight workers compiling at once push the WASM figure from 51 ms
to 91 ms. It is paid once per worker and excluded from every timed scan.

### `node benchmark/ssSearch.js`

```
openchemlib-wasm vs openchemlib-js 9.25.0 — batch substructure search
node v24.15.0  darwin arm64  10 cores
corpus 25,000 idcodes, every 16th of 409,686, mean 39.03 chars
       /Users/lpatiny/git/cheminfo/openchemlib-wasm/dev/public/idcodes.txt

Same work? one scan per engine per query, hit counts compared.

query        SMILES          wasm hits  openchemlib-js hits  hit rate
-----------  --------------  ---------  -------------------  --------  -----
benzene      c1ccccc1           15,729               15,729    62.92%  equal
pyridine     c1ccncc1            1,856                1,856     7.42%  equal
carboxyl     C(=O)O              7,416                7,416    29.66%  equal
anilide      C(=O)Nc1ccccc1      1,983                1,983     7.93%  equal
sulfonamide  S(=O)(=O)N            646                  646     2.58%  equal
naphthalene  c1ccc2ccccc2c1      1,068                1,068     4.27%  equal

Timing 12 cases at 30 samples each, about 5 minutes.

benzene wasm                                  23.43 µs     ±0.5%   34 samples   15,729 matches
benzene openchemlib-js                        43.14 µs     ±0.4%   32 samples   15,729 matches
pyridine wasm                                 23.68 µs     ±1.0%   34 samples   1,856 matches
pyridine openchemlib-js                       44.61 µs     ±3.5%   32 samples   1,856 matches
carboxyl wasm                                 24.44 µs     ±2.5%   34 samples   7,416 matches
carboxyl openchemlib-js                       43.72 µs     ±2.1%   32 samples   7,416 matches
anilide wasm                                  23.69 µs     ±0.7%   34 samples   1,983 matches
anilide openchemlib-js                        46.02 µs     ±3.6%   32 samples   1,983 matches
sulfonamide wasm                              23.53 µs     ±1.5%   34 samples   646 matches
sulfonamide openchemlib-js                    42.77 µs     ±1.7%   32 samples   646 matches
naphthalene wasm                              24.65 µs     ±2.6%   34 samples   1,068 matches
naphthalene openchemlib-js                    41.97 µs     ±1.0%   32 samples   1,068 matches

query        wasm µs/mol  ocl-js µs/mol  speedup  wasm mol/s  ocl-js mol/s
-----------  -----------  -------------  -------  ----------  ------------
benzene            23.43          43.14    1.84x       42.7k         23.2k
pyridine           23.68          44.61    1.88x       42.2k         22.4k
carboxyl           24.44          43.72    1.79x       40.9k         22.9k
anilide            23.69          46.02    1.94x       42.2k         21.7k
sulfonamide        23.53          42.77    1.82x       42.5k         23.4k
naphthalene        24.65          41.97    1.70x       40.6k         23.8k

openchemlib-wasm is 1.83x openchemlib-js on one thread, over six queries with identical hit counts.
```

Selectivity barely moves either engine: benzene matches 63% of the corpus and sulfonamide 2.6%, yet
both engines cost within 5% of the same per molecule for the two. The parse dominates, and every
molecule is parsed whether it matches or not.

### `node benchmark/parse.js`

```
Where a substructure scan spends its time — parse vs isomorphism
node v24.15.0  darwin arm64  10 cores
corpus 25,000 idcodes, every 16th of 409,686, mean 39.03 chars
       /Users/lpatiny/git/cheminfo/openchemlib-wasm/dev/public/idcodes.txt

parse-only probe: a 400-atom chain against molecules of at most 254 atoms, so no isomorphism ever starts.

parse wasm                                    11.80 µs     ±1.3%   38 samples   0 matches
parse openchemlib-js                          22.53 µs     ±0.6%   34 samples   0 matches
fromIDCode openchemlib-js                     22.31 µs     ±0.3%   34 samples   550,126 atoms
parse + match benzene wasm                    22.95 µs     ±0.7%   34 samples   15,729 matches
parse + match benzene openchemlib-js          47.66 µs     ±0.2%   32 samples   15,729 matches
parse + match sulfonamide wasm                23.31 µs     ±3.0%   34 samples   646 matches
parse + match sulfonamide openchemlib-js      46.28 µs     ±1.1%   32 samples   646 matches

stage                     wasm µs/mol  ocl-js µs/mol  speedup  share of wasm scan
------------------------  -----------  -------------  -------  ------------------
benzene: parse                  11.80          22.53    1.91x                 51%
benzene: isomorphism            11.16          25.13    2.25x                 49%
benzene: whole scan             22.95          47.66    2.08x                100%
sulfonamide: parse              11.80          22.53    1.91x                 51%
sulfonamide: isomorphism        11.52          23.75    2.06x                 49%
sulfonamide: whole scan         23.31          46.28    1.99x                100%

Parsing is 51% of a benzene scan and only 1.91x faster in WASM, so the whole scan cannot go much past 2x however fast the isomorphism gets. Corpus mean 22.0 atoms per molecule.

Read the openchemlib-js column as an upper bound. Every case here calls the same OpenChemLib
code and cannot be given a copy of its own, so a parse-only workload and a match workload in
one process slow each other down. Alone, those two cases read 20.45 µs and 42.99 µs;
here they read 22.53 and 47.66, about 11% high.
The WASM column has no such neighbour and is unaffected: it matches ssSearch.js to within
half a percent. The shape of the table holds — parse is half the work, and the half that is
the slower of the two to speed up is what caps the whole scan below 2x — but both
openchemlib-js ratios carry that inflation.
```

**This is why a substructure scan is not 5x.** Half the time is spent turning an idcode into a
molecule, and that half is the slower of the two to speed up. Benchmarks that search molecules
already parsed in memory report 3–6x; this API is handed idcodes and pays the parse on every one.

`fromIDCode openchemlib-js` (22.31 µs) and `parse openchemlib-js` (22.53 µs) land on top of each
other, which says `SSSearcher.setMolecule` and the atom-count rejection are free: the parse really
is the whole of the first half.

**The one caveat in this directory.** Correcting for the contamination the file reports — the clean
numbers are 20.45 µs for the openchemlib-js parse and 42.99 µs for its benzene scan — gives parse
1.73x, isomorphism 2.02x and whole scan 1.87x, which is what `ssSearch.js` (1.84x) and `scan.mjs`
(1.82x) measure independently. The shape is what this file is for; the absolute openchemlib-js
column is best read from `ssSearch.js`.

### `node benchmark/similaritySearch.js`

```
openchemlib-wasm vs openchemlib-js 9.25.0 — batch similarity (FragFp, Tanimoto)
node v24.15.0  darwin arm64  10 cores
corpus 1,000 idcodes, every 409th of 409,686, mean 38.82 chars
       /Users/lpatiny/git/cheminfo/openchemlib-wasm/dev/public/idcodes.txt

Same work? one scan per engine, similarities compared.

max |wasm - openchemlib-js| = 0 over 1,000 molecules, mean similarity 0.0302

Stored-fingerprint store: 409,686 entries of 512 bits (26.6 MB), built from the 1,000 fingerprints above in 4.7 s.

Timing 3 cases at 30 samples each, about 3 minutes.

wasm                                         947.13 µs     ±2.3%   32 samples   mean 0.0302
openchemlib-js                              4738.34 µs     ±0.3%   30 samples   mean 0.0302
stored fingerprints                          0.0316 µs     ±1.3%   34 samples   mean 0.0302

what one molecule costs                µs/molecule  molecules/s  whole 409,686 corpus
-------------------------------------  -----------  -----------  --------------------
wasm: idcode → FragFp → Tanimoto            947.13        1,056               6.5 min
openchemlib-js: the same                   4738.34          211              32.4 min
plain JS: Tanimoto on a stored FragFp       0.0316   31,673,126                 13 ms

Building the fingerprint is 29,999x the cost of comparing one, so a caller that already stores fingerprints should never call similaritySearch: 13 ms of plain JS ranks the whole corpus against 6.5 min of WASM. openchemlib-wasm is 5.00x openchemlib-js when idcodes really are all you have.
```

**The third row is the useful one.** Ranking the whole 409,686-molecule corpus takes 13 ms of plain
JavaScript when the fingerprints are already stored, against 6.5 minutes of WASM when they are not —
30,000x. `similaritySearch` exists for the case where idcodes are all you have; if you keep an
`ocl_ss_index` column, compare that and never call it.

The store is a flat `Int32Array` of 409,686 × 16 words (26.2 MB), scanned in one stride with a
16-word popcount, and it is filled by repeating the 1,000 real fingerprints the two engines just
agreed on — real data, real layout, real memory traffic, without spending 6.5 minutes building it.
The file verifies its own Tanimoto against `SSSearcherWithIndex.getSimilarityTanimoto` before timing
anything.

### `node benchmark/boundary.js`

```
What crossing into WASM costs, with no chemistry behind it
node v24.15.0  darwin arm64  10 cores
corpus 200,000 idcodes, every 2nd of 409,686, mean 38.92 chars
       /Users/lpatiny/git/cheminfo/openchemlib-wasm/dev/public/idcodes.txt

200,000 strings of 38.92 characters on average, the same length as the idcodes they were made from.

Timing 4 cases at 30 samples each, about 4 minutes.

wasm: strings in, bytes out                  0.5519 µs     ±2.1%   34 samples   200,000 unparsable
wasm: empty strings in, bytes out            0.1213 µs     ±0.4%   34 samples   200,000 unparsable
plain JS: the same loop                      0.0055 µs     ±2.6%   34 samples   200,000 unparsable
wasm: a real benzene scan                     22.58 µs     ±1.7%   30 samples   125,897 matches

what is being paid for                    µs/molecule  share of a benzene scan
----------------------------------------  -----------  -----------------------
the whole crossing: string in, byte out        0.5519                    2.44%
  of which the array, the call, the byte       0.1213                    0.54%
  of which the string characters               0.4306                    1.91%
the same bookkeeping in plain JS               0.0055                    0.02%
a benzene scan, for scale                       22.58                  100.00%

The boundary costs 0.5519 µs per molecule — 2.44% of a substructure scan — of which 0.4306 µs is copying the 38.9 characters of the idcode, about 11.1 ns each. Over the whole 409,686-molecule corpus that is 226 ms of marshalling. Watch this number across TeaVM upgrades.
```

**Marshalling is memory-bound, so the batch size changes the answer**: the same measurement reads
0.1862 µs per molecule at `--size 5000` and 0.5519 µs at 200,000, because a small array stays in
cache. Only a batch near the size of a real scan answers what a real scan pays, which is why this
file defaults to 200,000.

A packed `byte[]` plus an `int[]` of offsets was measured at 77 ns per byte — about 1.2 s for the
whole corpus, five times worse than the 226 ms `string[]` costs. `string[]` is the right parameter
type, and this file is how a TeaVM upgrade gets caught changing that.

### `node benchmark/scan.mjs`

```
Whole-corpus scan across worker threads, on a SharedArrayBuffer
node v24.15.0  darwin arm64  10 cores
corpus 409,686 idcodes, 15.50 MB shared once
       /Users/lpatiny/git/cheminfo/openchemlib-wasm/dev/public/idcodes.txt
query  benzene (c1ccccc1) gFp@DiTt@@B

wasm            1 workers  9.22 s  44.4k molecules/s  257,625 matches
wasm            2 workers  4.74 s  86.4k molecules/s  257,625 matches
wasm            4 workers  2.83 s  144.6k molecules/s  257,625 matches
wasm            8 workers  1.98 s  206.8k molecules/s  257,625 matches
openchemlib-js  1 workers  16.78 s  24.4k molecules/s  257,625 matches
openchemlib-js  2 workers  8.87 s  46.2k molecules/s  257,625 matches
openchemlib-js  4 workers  5.04 s  81.3k molecules/s  257,625 matches
openchemlib-js  8 workers  3.95 s  103.8k molecules/s  257,625 matches

engine          workers  wall s  molecules/s  scaling  slowest / fastest worker, s  engine load, ms  startup s
--------------  -------  ------  -----------  -------  ---------------------------  ---------------  ---------
wasm                  1    9.22        44.4k    1.00x                  9.21 / 9.21               51       0.09
wasm                  2    4.74        86.4k    1.95x                  4.74 / 4.57               53       0.08
wasm                  4    2.83       144.6k    3.25x                  2.83 / 1.86               64       0.08
wasm                  8    1.98       206.8k    4.65x                  1.98 / 1.07               91       0.11
openchemlib-js        1   16.78        24.4k    1.00x                16.78 / 16.78               22       0.06
openchemlib-js        2    8.87        46.2k    1.89x                  8.87 / 8.18               22       0.05
openchemlib-js        4    5.04        81.3k    3.33x                  5.04 / 3.64               23       0.04
openchemlib-js        8    3.95       103.8k    4.25x                  3.95 / 2.36               32       0.06

Both engines parallelise, so the honest claim is per core: openchemlib-wasm is 1.99x openchemlib-js on 8 workers, the same ratio it has on one. 257,625 of 409,686 molecules matched benzene in 1.98 s.
```

**The 1.8x is per core, not free parallelism.** Both engines scale the same way — 4.65x on eight
workers for WASM, 4.25x for openchemlib-js — so eight workers of `openchemlib` land roughly where
four workers of `openchemlib-wasm` do. Neither reaches 8x because this machine has six performance
cores and four efficiency ones: the `slowest / fastest worker` column shows the spread widening from
9.21 / 9.21 on one worker to 1.98 / 1.07 on eight, which is the efficiency cores finishing last on
an even split of the corpus. A scheduler that hands out work in chunks would recover part of that.

**Startup is not the story.** Importing the WASM engine costs 51 ms in one worker and 91 ms when
eight decode and compile at once, against 22–32 ms for the openchemlib-js bundle; spawning the
workers and decoding their slices brings the whole startup to 0.11 s. It is paid once and excluded
from the timed scan, which is what the `ready` / `go` handshake in the file is for.

The corpus is read into one `SharedArrayBuffer` and each worker decodes its own byte range: sharing
the strings by `postMessage` would copy about 26 MB per worker, and transferring a `Uint8Array` can
only reach one of them. Results go into a second `SharedArrayBuffer`, one byte per molecule, and no
index is written by more than one worker — so no atomics, and the main thread can render progress
while the scan runs.

### Why `scan.mjs` is not a benchmark.js suite

benchmark.js samples: it calls the function until it has 30 timings it can put an error bar on. A
whole-corpus scan takes between two and seventeen seconds, so 30 samples of the eight rows above
would be about half an hour for eight numbers, and the sampling would say nothing the numbers do not
— a nine-second scan has no per-call overhead to average away, and its variance is the machine's
scheduler, which more samples do not remove. What matters is the wall time somebody waits for, so
that is what the file measures: one scan per row, reported with each worker's own time so an uneven
split shows as a spread rather than hiding in a mean.

## Where these numbers differ from the earlier hand-timed probes

The figures the repo carried before this directory existed came from hand-timed loops. Most agree;
these do not, and in each case the suite is the one to trust.

| measurement                            | earlier probe | measured here                           | why it moved                                                                                                                                                             |
| -------------------------------------- | ------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| substructure speedup                   | 2.0x          | **1.83x**                               | wasm reads 23.4 µs here rather than 22, openchemlib-js 43.1 rather than 44. Three files agree on ~1.83x: `ssSearch.js`, `scan.mjs`, `parse.js` after its own correction. |
| whole corpus, openchemlib-js, 1 thread | 18.0–18.5 s   | **16.78 s**                             | measured end to end in a worker rather than projected.                                                                                                                   |
| similarity, openchemlib-js             | 9113 µs       | **4738 µs**                             | the earlier probe left 2D coordinate invention on. With it on this machine reads 5795 µs; with `fromIDCode(id, false)`, 4738.                                            |
| similarity, wasm                       | 787 µs        | **947 µs**                              | the earlier probe used the first 5,000 idcodes, which average 27.1 characters against 38.8 in a strided sample.                                                          |
| similarity speedup                     | 11.6x         | **5.00x**                               | both of the above.                                                                                                                                                       |
| Tanimoto on a stored fingerprint       | 0.1 µs        | **0.0316 µs**                           | a flat `Int32Array` store scanned in one stride, rather than an array of arrays.                                                                                         |
| parse, openchemlib-js                  | 19.9 µs       | **20.45 µs** clean, 22.53 in `parse.js` | agrees once the in-process contamination `parse.js` reports is taken off.                                                                                                |
| JS↔WASM crossing                       | 0.43–0.51 µs  | **0.5519 µs**                           | agrees; the earlier figure was taken on a smaller batch, and this cost is memory-bound (0.1862 µs at `--size 5000`).                                                     |
| engine import, per worker              | 22–48 ms      | **51–91 ms**                            | the earlier figure timed the `WebAssembly` instantiation; this one times the whole `import`, decoding and gunzipping the embedded module included.                       |

These agree and needed no correction: the whole-corpus hit counts (benzene 257,625, sulfonamide
10,826, naphthalene 16,882), bit-identical similarity values, wasm parse 11.7–12.3 µs, wasm
whole-corpus benzene scan 8.93–9.41 s against 9.22 s here, and 8-worker throughput 176k–207k
molecules/s.
