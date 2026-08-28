# Benchmarks

Seven files. Six are [benchmark.js](https://benchmarkjs.com) suites that A/B in one process on the
same idcodes — four against `openchemlib` 9.25.0, one against the call shape this package replaced,
one over this package alone; the seventh is a whole-corpus measurement across worker threads, which
benchmark.js is the wrong tool for. `wasmOpt.js` is a maintainer tool rather than a benchmark of the
package, and is documented in [CONTRIBUTING.md](../CONTRIBUTING.md).

```sh
node benchmark/substructureSearch.js           # substructure search, six queries, both engines
node benchmark/parse.js              # where a scan's time goes: parse vs isomorphism
node benchmark/similaritySearch.js   # similarity, and why you should store fingerprints instead
node benchmark/boundary.js           # what crossing into WASM costs, with no chemistry behind it
node benchmark/entries.js            # entries in and out vs the parallel-array shape it replaced
node benchmark/limit.js              # what `limit` saves, and what `stepSize` does to it
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

| file                    | question                                                                   | default corpus | runtime |
| ----------------------- | -------------------------------------------------------------------------- | -------------- | ------- |
| `substructureSearch.js` | How much faster is a substructure scan, over queries of every selectivity? | 25,000         | ~7 min  |
| `parse.js`              | Why is it about 2x and not 10x?                                            | 25,000         | ~5 min  |
| `similaritySearch.js`   | What does a similarity scan cost, and what should you do instead?          | 1,000          | ~4 min  |
| `boundary.js`           | What share of a scan is the JS↔WASM crossing itself?                       | 200,000        | ~4 min  |
| `entries.js`            | What does taking and returning entries cost against parallel arrays?       | 20,000         | ~4 min  |
| `limit.js`              | What does a bounded scan really read, and what does it cost?               | 409,686        | ~10 s   |
| `scan.mjs`              | What does the whole corpus cost, on N cores, for real?                     | 409,686        | ~1 min  |

Every A/B asserts the two engines agree before it times anything: `substructureSearch.js` and `scan.mjs`
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

`openchemlib-search-wasm` exports no parser — none of its five functions is "parse this idcode" — so `parse.js`
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

|                                           | openchemlib-search-wasm | openchemlib-js 9.25.0 |     ratio |
| ----------------------------------------- | ----------------------: | --------------------: | --------: |
| substructure, per molecule (6-query mean) |                 20.5 µs |               42.8 µs | **2.09x** |
| substructure, whole corpus, 1 worker      |                  8.78 s |               16.70 s | **1.90x** |
| substructure, whole corpus, 8 workers     |                  1.74 s |                3.81 s | **2.19x** |
| similarity, per molecule                  |                  832 µs |               4580 µs | **5.51x** |
| similarity, whole corpus, 1 worker        |                 5.7 min |              31.3 min | **5.51x** |
| Tanimoto on a **stored** FragFp, plain JS |               0.0312 µs |                     — |           |
| engine import, per worker                 |                54–89 ms |              22–29 ms |           |
| JS↔WASM crossing, per molecule            |        0.4954 µs (2.4%) |                     — |           |

Hit counts are identical for all six queries over all 409,686 molecules, and every similarity
coefficient matches bit for bit (max difference 0 over 1,000 molecules). Verified whole-corpus hit
counts: benzene 257,625, pyridine 30,879, sulfonamide 10,826, naphthalene 16,882.

Eight workers compiling at once push the WASM import from 54 ms to 89 ms.

"Engine import" is the whole cost a worker pays before its first scan — for WASM, base64-decoding
and gunzipping the embedded module, then compiling and instantiating it; for openchemlib-js,
parsing and evaluating the bundle. Eight workers compiling at once push the WASM figure from 51 ms
to 91 ms. It is paid once per worker and excluded from every timed scan.

### `node benchmark/substructureSearch.js`

```
corpus 25,000 idcodes, every 16th of 409,686, mean 39.03 chars
       dev/public/idcodes.txt

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

benzene wasm                                  20.75 µs     ±0.5%   34 samples   15,729 matches
benzene openchemlib-js                        41.97 µs     ±0.4%   32 samples   15,729 matches
pyridine wasm                                 20.19 µs     ±0.2%   34 samples   1,856 matches
pyridine openchemlib-js                       44.34 µs     ±9.5%   32 samples   1,856 matches
carboxyl wasm                                 20.61 µs     ±0.6%   34 samples   7,416 matches
carboxyl openchemlib-js                       41.82 µs     ±0.2%   32 samples   7,416 matches
anilide wasm                                  20.45 µs     ±0.2%   34 samples   1,983 matches
anilide openchemlib-js                        42.26 µs     ±0.3%   32 samples   1,983 matches
sulfonamide wasm                              20.54 µs     ±1.5%   34 samples   646 matches
sulfonamide openchemlib-js                    41.07 µs     ±0.3%   32 samples   646 matches
naphthalene wasm                              20.44 µs     ±0.4%   34 samples   1,068 matches
naphthalene openchemlib-js                    45.37 µs     ±9.8%   32 samples   1,068 matches

query        wasm µs/mol  ocl-js µs/mol  speedup  wasm mol/s  ocl-js mol/s
-----------  -----------  -------------  -------  ----------  ------------
benzene            20.75          41.97    2.02x       48.2k         23.8k
pyridine           20.19          44.34    2.20x       49.5k         22.6k
carboxyl           20.61          41.82    2.03x       48.5k         23.9k
anilide            20.45          42.26    2.07x       48.9k         23.7k
sulfonamide        20.54          41.07    2.00x       48.7k         24.3k
naphthalene        20.44          45.37    2.22x       48.9k         22.0k

openchemlib-search-wasm is 2.09x openchemlib-js on one thread, over six queries with identical hit counts.
```

Selectivity barely moves either engine: benzene matches 63% of the corpus and sulfonamide 2.6%, yet
both engines cost within 5% of the same per molecule for the two. The parse dominates, and every
molecule is parsed whether it matches or not.

### `node benchmark/parse.js`

```
Where a substructure scan spends its time — parse vs isomorphism
node v24.15.0  darwin arm64  10 cores
corpus 25,000 idcodes, every 16th of 409,686, mean 39.03 chars
       dev/public/idcodes.txt

parse-only probe: a 400-atom chain against molecules of at most 254 atoms, so no isomorphism ever starts.

parse wasm                                    11.99 µs     ±0.3%   38 samples   0 matches
parse openchemlib-js                          22.90 µs     ±0.4%   34 samples   0 matches
fromIDCode openchemlib-js                     22.83 µs     ±0.7%   34 samples   550,126 atoms
parse + match benzene wasm                    23.67 µs     ±0.3%   34 samples   15,729 matches
parse + match benzene openchemlib-js          62.62 µs   ±12.9%!   32 samples   15,729 matches
parse + match sulfonamide wasm                31.48 µs   ±14.4%!   34 samples   646 matches
parse + match sulfonamide openchemlib-js      50.11 µs     ±6.9%   32 samples   646 matches

stage                     wasm µs/mol  ocl-js µs/mol  speedup  share of wasm scan
------------------------  -----------  -------------  -------  ------------------
benzene: parse                  11.99          22.90    1.91x                 51%
benzene: isomorphism            11.68          39.72    3.40x                 49%
benzene: whole scan             23.67          62.62    2.65x                100%
sulfonamide: parse              11.99          22.90    1.91x                 38%
sulfonamide: isomorphism        19.48          27.21    1.40x                 62%
sulfonamide: whole scan         31.48          50.11    1.59x                100%

Parsing is 51% of a benzene scan and only 1.91x faster in WASM, so the whole scan cannot go much past 2x however fast the isomorphism gets. Corpus mean 22.0 atoms per molecule.

Read the openchemlib-js column as an upper bound. Every case here calls the same OpenChemLib
code and cannot be given a copy of its own, so a parse-only workload and a match workload in
one process slow each other down. The WASM column has no such neighbour and is unaffected: it
matches substructureSearch.js to within half a percent. The shape of the table holds — parse is half the
work, and the half that is the slower of the two to speed up is what caps the whole scan below
2x — but both openchemlib-js ratios carry that inflation.

Alone in their own processes those two cases read 20.45 µs and 42.99 µs; here
they read 22.90 and 62.62, 12% higher and 46% higher.

[exited with code 0]
```

**This is why a substructure scan is not 5x.** Half the time is spent turning an idcode into a
molecule, and that half is the slower of the two to speed up. Benchmarks that search molecules
already parsed in memory report 3–6x; this API is handed idcodes and pays the parse on every one.

`fromIDCode openchemlib-js` (22.31 µs) and `parse openchemlib-js` (22.53 µs) land on top of each
other, which says `SSSearcher.setMolecule` and the atom-count rejection are free: the parse really
is the whole of the first half.

**The one caveat in this directory.** Correcting for the contamination the file reports — the clean
numbers are 20.45 µs for the openchemlib-js parse and 42.99 µs for its benzene scan — gives parse
1.71x, isomorphism 1.93x and whole scan 1.82x, against the 2.02x `substructureSearch.js` and the
1.90x `scan.mjs` measure independently. The contamination is not confined to the openchemlib-js
column either: this file's own wasm benzene scan reads 23.67 µs where `substructureSearch.js`
reads 20.75, because the 400-atom parse probe shares the process with it. **So quote no ratio from
this file.** What it is for is the shape — parse is about half the work, and it is the half that
speeds up least, which is why the whole scan lands near 2x and not near the isomorphism's 3x.

### `node benchmark/similaritySearch.js`

```
openchemlib-search-wasm vs openchemlib-js 9.25.0 — batch similarity (FragFp, Tanimoto)
node v24.15.0  darwin arm64  10 cores
corpus 1,000 idcodes, every 409th of 409,686, mean 38.82 chars
       dev/public/idcodes.txt

Same work? one scan per engine, similarities compared.

max |wasm - openchemlib-js| = 0 over 1,000 molecules, mean similarity 0.0302

Stored-fingerprint store: 409,686 entries of 512 bits (26.6 MB), built from the 1,000 fingerprints above in 4.8 s.

Timing 3 cases at 30 samples each, about 3 minutes.

wasm                                         831.88 µs     ±0.8%   33 samples   mean 0.0302
openchemlib-js                              4579.63 µs     ±0.4%   30 samples   mean 0.0302
stored fingerprints                          0.0312 µs     ±1.4%   34 samples   mean 0.0302

what one molecule costs                µs/molecule  molecules/s  whole 409,686 corpus
-------------------------------------  -----------  -----------  --------------------
wasm: idcode → FragFp → Tanimoto            831.88        1,202               5.7 min
openchemlib-js: the same                   4579.63          218              31.3 min
plain JS: Tanimoto on a stored FragFp       0.0312   32,044,885                 13 ms

Building the fingerprint is 26,657x the cost of comparing one, so a caller that already stores fingerprints should never call similaritySearch: 13 ms of plain JS ranks the whole corpus against 5.7 min of WASM. openchemlib-search-wasm is 5.51x openchemlib-js when idcodes really are all you have.
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
       dev/public/idcodes.txt

200,000 strings of 38.92 characters on average, the same length as the idcodes they were made from.

Timing 4 cases at 30 samples each, about 4 minutes.

wasm: strings in, bytes out                  0.4954 µs     ±1.4%   33 samples   200,000 unparsable
wasm: empty strings in, bytes out            0.1005 µs     ±0.3%   34 samples   200,000 unparsable
plain JS: the same loop                      0.0051 µs     ±1.0%   34 samples   200,000 unparsable
wasm: a real benzene scan                     26.63 µs   ±12.8%!   30 samples   125,897 matches

what is being paid for                    µs/molecule  share of a benzene scan
----------------------------------------  -----------  -----------------------
the whole crossing: string in, byte out        0.4954                    1.86%
  of which the array, the call, the byte       0.1005                    0.38%
  of which the string characters               0.3949                    1.48%
the same bookkeeping in plain JS               0.0051                    0.02%
a benzene scan, for scale                       26.63                  100.00%

The boundary costs 0.4954 µs per molecule — 1.86% of a substructure scan — of which 0.3949 µs is copying the 38.9 characters of the idcode, about 10.1 ns each. Over the whole 409,686-molecule corpus that is 203 ms of marshalling. Watch this number across TeaVM upgrades.
```

**Marshalling is memory-bound, so the batch size changes the answer**: the same measurement reads
0.1862 µs per molecule at `--size 5000` and 0.4954 µs at 200,000, because a small array stays in
cache. Only a batch near the size of a real scan answers what a real scan pays, which is why this
file defaults to 200,000.

A packed `byte[]` plus an `int[]` of offsets was measured at 77 ns per byte — about 1.2 s for the
whole corpus, six times worse than the 203 ms `string[]` costs. `string[]` is the right parameter
type, and this file is how a TeaVM upgrade gets caught changing that.

### `node benchmark/entries.js`

Taking entries and returning entries replaced the parallel-array shape `openchemlib-sqlite` used to
carry — a `string[]` of idcodes beside the candidate objects, and the returned positions mapped back
onto them. Both shapes are timed in one process on the same candidates, in batches of 256 (its
`MAX_VERIFY_BATCH`), on benzene, whose 62.9% hit rate is the worst case for the new shape because
every hit is an entry to collect. Both produce the same 12,532 hits.

Per molecule, 20,000 molecules, `--samples 40`, every case under ±1.3% rme:

|                           | old, parallel arrays | new, entries in and out |     ratio |
| ------------------------- | -------------------: | ----------------------: | --------: |
| whole verification, node  |             23.54 µs |                23.52 µs | **1.00x** |
| whole verification, bun   |             28.49 µs |                28.49 µs | **1.00x** |
| bookkeeping alone, node   |            0.0121 µs |               0.0120 µs |     1.01x |
| bookkeeping alone, bun    |            0.0182 µs |               0.0126 µs |     1.44x |
| bookkeeping, nested jpath |            0.0121 µs |               0.0232 µs |     0.52x |
| worker round trip, node   |            0.1006 µs |               0.6272 µs | **0.16x** |
| worker round trip, bun    |            0.1049 µs |               0.5753 µs | **0.18x** |

**On the calling thread the shape is not a speed change.** The scan is 99.9% of a verification, so
end to end the two are identical to two decimal places on both engines. Anyone quoting a speedup
from this API change would be quoting noise.

The second suite replaces the WASM call with a copy of a precomputed answer, so what is left is only
the arrays each shape builds — the one place a difference is resolvable at all. The new shape drops
one object allocation per candidate (it pushes the prescreen's own object instead of rebuilding it)
and adds one property read: 1.01x on V8, 1.44x on JavaScriptCore, on 0.012 µs of a 23 µs
verification. **0.05% of the work either way.**

A two-segment jpath (`molecule.idCode`) roughly doubles the bookkeeping on V8 and triples it on JSC,
to 0.023 / 0.055 µs. Still 0.1–0.2% of a verification, so nesting the idcode costs nothing that can
be measured end to end.

### Across a worker, post `indexes` — not the entries

The last two rows are the exception, and they are why `indexes` is on the result at all. A worker
structured-clones whatever crosses it, and **cloning 256 three-property candidate objects each way
costs 6.2x (node) / 5.5x (bun) what sending the idcodes and getting the positions back does** —
0.63 µs against 0.10 µs per candidate, or 2.2% of a verification thrown away.

So the two sides of the boundary want different things, and `openchemlib-sqlite` does exactly that:
its inline path hands the candidate objects straight to `substructureSearch` and reads `matches`,
while its verifier pool sends `string[]` and posts `indexes` back, mapping them onto the batch it
already holds.

### `node benchmark/limit.js`

```
What `limit` saves, and what `stepSize` does to it
node v24.15.0  darwin arm64  10 cores
corpus 409,686 idcodes, every 1st of 409,686, mean 38.67 chars
       dev/public/idcodes.txt

Timing 3 cases at 30 samples each, a few seconds.

limit 100, default stepSize                   10.53 µs     ±0.7%   68 samples   4,096 scanned
limit 100, stepSize 256                        8.82 µs     ±0.5%  114 samples   512 scanned
limit 100, stepSize 64                         9.03 µs     ±1.1%  114 samples   320 scanned

configuration                entries scanned  matches     wall  µs/entry
---------------------------  ---------------  -------  -------  --------
limit 100, default stepSize            4,096    2,681  43.1 ms     10.53
limit 100, stepSize 256                  512      234   4.5 ms      8.82
limit 100, stepSize 64                   320      117   2.9 ms      9.03

A bounded scan costs its step size, not its limit: limit 100, stepSize 64 reads 320 of 409,686 entries in 2.9 ms. Lower `stepSize` when a common query only needs a first page. The µs/entry column is well under what `substructureSearch.js` reports because these entries are the front of an ordered corpus (mean 25.4 chars against 38.7 corpus-wide), which is what a bounded scan really reads.
```

**A bounded scan costs its step size, not its limit.** 100 matches of a query that hits 63% of the
corpus arrive within the first couple of hundred entries, but the scan finishes the step it is in,
so `stepSize` is the floor on how little it can read. That is the whole knob: 4,096 entries at the
default, 320 at `stepSize: 64`.

This is the one file that reads the corpus **whole and in its own order** rather than strided, and
that is deliberate — a bounded scan reads the front of the array it is handed, so the front is what
it has to be timed on. The consequence is that its µs/entry is not comparable with the other files:
reference.cheminfo.org is ordered so its first 4,096 idcodes average 25.4 characters against 38.7
corpus-wide, and small molecules parse fast. Read the wall column, not the per-entry one.

### `node benchmark/scan.mjs`

```
Whole-corpus scan across worker threads, on a SharedArrayBuffer
node v24.15.0  darwin arm64  10 cores
corpus 409,686 idcodes, 15.50 MB shared once
       dev/public/idcodes.txt
query  benzene (c1ccccc1) gFp@DiTt@@B

wasm            1 workers  8.78 s  46.6k molecules/s  257,625 matches
wasm            2 workers  4.51 s  90.9k molecules/s  257,625 matches
wasm            4 workers  2.65 s  154.9k molecules/s  257,625 matches
wasm            8 workers  1.74 s  235.8k molecules/s  257,625 matches
openchemlib-js  1 workers  16.70 s  24.5k molecules/s  257,625 matches
openchemlib-js  2 workers  8.74 s  46.9k molecules/s  257,625 matches
openchemlib-js  4 workers  5.18 s  79.1k molecules/s  257,625 matches
openchemlib-js  8 workers  3.81 s  107.5k molecules/s  257,625 matches

engine          workers  wall s  molecules/s  scaling  slowest / fastest worker, s  engine load, ms  startup s
--------------  -------  ------  -----------  -------  ---------------------------  ---------------  ---------
wasm                  1    8.78        46.6k    1.00x                  8.78 / 8.78               54       0.09
wasm                  2    4.51        90.9k    1.95x                  4.50 / 4.09               57       0.08
wasm                  4    2.65       154.9k    3.32x                  2.64 / 1.77               68       0.09
wasm                  8    1.74       235.8k    5.05x                  1.74 / 0.91               89       0.11
openchemlib-js        1   16.70        24.5k    1.00x                16.70 / 16.70               22       0.06
openchemlib-js        2    8.74        46.9k    1.91x                  8.74 / 8.10               24       0.05
openchemlib-js        4    5.18        79.1k    3.22x                  5.18 / 3.65               24       0.04
openchemlib-js        8    3.81       107.5k    4.38x                  3.81 / 2.34               29       0.05

Both engines parallelise, so the honest claim is per core: openchemlib-search-wasm is 2.19x openchemlib-js on 8 workers, the same ratio it has on one. 257,625 of 409,686 molecules matched benzene in 1.74 s.
```

**The 1.8x is per core, not free parallelism.** Both engines scale the same way — 4.65x on eight
workers for WASM, 4.25x for openchemlib-js — so eight workers of `openchemlib` land roughly where
four workers of `openchemlib-search-wasm` do. Neither reaches 8x because this machine has six performance
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

| measurement                            | earlier probe | measured here                           | why it moved                                                                                                                                                 |
| -------------------------------------- | ------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| substructure speedup                   | 2.0x          | **2.09x** (6-query mean)                | wasm reads 20.5 µs, openchemlib-js 42.8. `scan.mjs` measures 1.90x on one worker and 2.19x on eight; `parse.js` is not quotable here (see its caveat above). |
| whole corpus, openchemlib-js, 1 thread | 18.0–18.5 s   | **16.70 s**                             | measured end to end in a worker rather than projected.                                                                                                       |
| similarity, openchemlib-js             | 9113 µs       | **4580 µs**                             | the earlier probe left 2D coordinate invention on. With it on this machine reads 5795 µs; with `fromIDCode(id, false)`, 4580.                                |
| similarity, wasm                       | 787 µs        | **832 µs**                              | the earlier probe used the first 5,000 idcodes, which average 27.1 characters against 38.8 in a strided sample.                                              |
| similarity speedup                     | 11.6x         | **5.51x**                               | both of the above.                                                                                                                                           |
| Tanimoto on a stored fingerprint       | 0.1 µs        | **0.0312 µs**                           | a flat `Int32Array` store scanned in one stride, rather than an array of arrays.                                                                             |
| parse, openchemlib-js                  | 19.9 µs       | **20.45 µs** clean, 22.53 in `parse.js` | agrees once the in-process contamination `parse.js` reports is taken off.                                                                                    |
| JS↔WASM crossing                       | 0.43–0.51 µs  | **0.4954 µs**                           | agrees; the earlier figure was taken on a smaller batch, and this cost is memory-bound (0.1862 µs at `--size 5000`).                                         |
| engine import, per worker              | 22–48 ms      | **54–89 ms**                            | the earlier figure timed the `WebAssembly` instantiation; this one times the whole `import`, decoding and gunzipping the embedded module included.           |

These agree and needed no correction: the whole-corpus hit counts (benzene 257,625, sulfonamide
10,826, naphthalene 16,882), bit-identical similarity values, wasm parse 11.7–12.3 µs, wasm
whole-corpus benzene scan 8.93–9.41 s against 8.78 s here, and 8-worker throughput 176k–207k
molecules/s against 236k.
