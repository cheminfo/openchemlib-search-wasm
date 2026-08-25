# dev app

A developer surface for `openchemlib-wasm`: run a batch substructure or similarity search over a
real 409,686-idcode corpus, in workers, and watch the shared result buffer fill.

```sh
npm run dataset   # once — extracts the corpus into dev/public/idcodes.txt (gitignored, 16 MB)
npm run dev       # http://localhost:10606
```

The port is **10606**, with `strictPort`, so a second checkout fails loudly instead of drifting to
another number. `npm run dataset` is not optional: without it the page says so and does nothing
else. Pass a row count (`node scripts/build-dataset.mjs 20000`) for a smaller corpus; re-running it
without one rebuilds the whole table.

## Why the headers

The dev server sends `Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp`, because `SharedArrayBuffer` only exists in a
cross-origin-isolated page. The app checks `globalThis.crossOriginIsolated` before it spawns
anything and says so on screen if it is false.

## How the work is divided

The main thread fetches `/idcodes.txt` once and packs it into two `SharedArrayBuffer`s — the ASCII
of every idcode with no separators, and an `Int32Array` of 409,687 offsets — so no worker ever
copies the corpus or splits a 16 MB string. Each worker decodes only the chunk it is about to scan
and writes into `result.subarray(from, to)`; one index is only ever written by one worker, so there
are no atomics on the result.

Three splits are selectable, because comparing them is the point:

| split                  | what it does                                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `characters` (default) | contiguous ranges holding equal **character** counts — parse cost scales with idcode length, and the distribution is skewed (median 34, p99 132, max 595) |
| `rows`                 | contiguous ranges holding equal **row** counts, the naive split                                                                                           |
| `shared cursor`        | no static split: every worker draws chunks from one `Atomics` cursor                                                                                      |

Measured here, benzene over the whole corpus, 8 workers, chunk 1024 — all three found the same
257,625 matches:

| split         |   wall | molecules/s | slowest worker / fastest |
| ------------- | -----: | ----------: | -----------------------: |
| rows          | 1.88 s |     218,076 |                    1.80× |
| characters    | 1.87 s |     219,505 |                    1.35× |
| shared cursor | 1.51 s |     271,253 |                    1.02× |

Equal characters balances the _bytes_ exactly (verified: 1.000) but only takes the _time_ imbalance
from 1.80× to 1.35×, so parse cost is not purely linear in length. The shared cursor is what
actually closes the gap.

## Reading the page

- **query** — SMILES or a raw idcode; the idcode that will be sent sits next to the field, and the
  six benchmark queries are one click away.
- **mode** — substructure, or similarity. Similarity builds a 512-bit FragFp per molecule (~0.95 ms
  each), so it opens on a 5,000-molecule slice and says why. The hit list uses a fixed 0.80 Tanimoto
  cutoff, shown as the column label — a benzene query has a tiny fingerprint and legitimately clears
  it nowhere, so an empty list there is the answer, not a bug.
- **engine** — `openchemlib-wasm`, `openchemlib-js`, or **A/B**, which runs both in turn, never at
  once: two engines sharing the cores would make both timings meaningless.
- **agreement** — after an A/B run the two result buffers are diffed. A speed number from an engine
  computing a different answer is worthless, so this is the line to read first.
- **hits** — the first 200 matching idcodes, appended as the workers reach them. Capped, because a
  benzene query matches 257,625 molecules.

Progress is read from the shared buffer on `requestAnimationFrame` with one cursor per range, so a
frame only walks the entries that landed since the last one.
