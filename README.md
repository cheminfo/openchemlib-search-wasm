# openchemlib-wasm (proof of concept)

Compile OpenChemLib (Java) to **WebAssembly** instead of JavaScript, to make
substructure search (and the rest of the API) faster, and to get real `long`
(`i64`) arithmetic that GWT can only emulate slowly.

> Status: **feasibility proven.** This repo currently contains two throwaway
> spikes that de-risk the approach end to end. It is **not yet** the published
> package — that is the next phase (see _Next steps_).

## What has been proven

**Toolchain** — [TeaVM](https://teavm.org) 0.14.1 WebAssembly **GC** backend is
the right tool: it is the only actively-maintained AOT Java→WASM compiler that is
isomorphic (Node + browser), emits a single embeddable `.wasm`, keeps a
**synchronous** API, and maps Java `long` → native WASM `i64`. (CheerpJ was
rejected: browser-only, async-only, multi-file CDN runtime, commercial.)

1. **`spike/`** — Stage 0. A trivial `long[]` bit-op class compiles to WasmGC,
   `@JSExport`s, loads from in-memory bytes in Node (no fetch/fs), round-trips
   `long`↔`BigInt`, and ships embedded as **gzip+base64** decoded with only
   `atob` + `DecompressionStream` (the `cheminfo/inchi-js` distribution pattern).
   Native i64 ran ~45× faster than a JS `BigInt` loop.

2. **`slice/`** — Stage 2. The **real, unmodified** vendored OpenChemLib source
   compiles to WasmGC and runs the full substructure pipeline
   (`SmilesParser` → `StereoMolecule` → `Canonizer` → `SSSearcherWithIndex`
   `long[]` fingerprint screen → `SSSearcher` isomorphism). Outputs are
   **byte-identical to the GWT build** (idcodes and hit counts match exactly).

## Benchmark (substructure search, with & without preindex)

3000 molecules sampled from `openchemlib-js/data/10k.sdf`, 6 queries. Full table
in [`slice/BENCHMARK.md`](slice/BENCHMARK.md). Summary:

Tuned build (`optimizationLevel=FULL`, `strict=false`, `assertionsRemoved=true`):

| | WASM vs GWT | Native Java vs GWT |
|---|--:|--:|
| Build (parse + index) | **5.6× faster** | 8.1× faster |
| Search, no index | **3.0–5.2× faster** | ~6–8× faster |
| Search, with index | **4.4–6.5× faster** | ~8–10× faster |

So WASM lands **between** native Java (the ceiling) and today's GWT-JS — a
**~3–6.5×** substructure speedup over the current build, with identical results.
The index always helps; WASM widens the gap because its `long[]` screen runs on
native i64.

> Tuning matters: the default TeaVM build (`SIMPLE`, `strict=true`) was only
> ~2–4.6×. Disabling WasmGC's `strict` null/array-bounds checks closed most of the
> gap to native Java — at the cost of those safety checks, a normal release-build
> trade-off.

## Run it

```sh
export JAVA_HOME=$(/usr/libexec/java_home -v 21)   # TeaVM build needs JDK 11+

# Stage 0 toolchain spike
mvn -B -f spike/pom.xml process-classes
node spike/node/test.mjs
node spike/build/embed-wasm.mjs && node spike/node/test-embedded.mjs

# Stage 2 real-OCL slice + benchmark
mvn -B -f slice/pom.xml process-classes
node slice/node/test.mjs          # correctness + idcode cross-check vs GWT
# (compile the JVM baseline once, then run the unified benchmark)
"$JAVA_HOME/bin/javac" -cp ~/.m2/repository/org/teavm/teavm-jso/0.14.1/teavm-jso-0.14.1.jar \
  -sourcepath slice/src/main/java -d slice/target/jvm-classes \
  slice/src/main/java/org/openchemlib/wasm/slice/JavaBench.java \
  slice/src/main/java/org/openchemlib/wasm/slice/SubstructureSlice.java
node slice/node/benchmark.mjs
```

## Key build gotcha

`teavm-classlib` declares `teavm-core` at `runtime` scope, but the maven plugin
analyzes only the **compile** classpath, so the WasmGC build fails with
`"fiberClass" is null`. **Fix:** declare `org.teavm:teavm-core` explicitly.

The vendored OCL subset also contains conformer/docking/editor/flexophore files
that reference excluded packages (`org.openmolecules`, `org.cheminfo.utils`,
`smile.*`, Swing). They are off the substructure path, so the slice compiles
**only the entry point** and lets javac pull the transitive closure on demand via
`-sourcepath` (and TeaVM whole-program DCE compiles that same closure).

## Caveats (honest)

- Benchmark methodology is directional: native Java is JIT-warmed best-of-5;
  WASM/GWT are best-of-3 in V8. GWT parsed 2999 of 3000 (one macrocycle differs);
  it matches none of the queries so hit counts still agree.
- WASM does **not** reach native-Java speed (WasmGC overhead + array bounds
  checks). The win is over GWT, not over the JVM.
- Only the substructure path is proven. The full public API (depiction `toSVG`,
  force field, conformers, predictors, reactions) and the ~2,900-line JS wrapper
  rewrite to `@JSExport`/JSO interop are the real remaining work.

## Could another toolchain be faster?

Two axes, with evidence:

1. **Tune TeaVM itself (done).** `strict=false` (drop WasmGC bounds checks) +
   `FULL` opt + `assertionsRemoved` gave a measured ~1.4–1.6× over the default
   build and is most of the practical headroom. `AGGRESSIVE` is not a valid Maven
   enum value, and per TeaVM it "does not give significant performance growth".

2. **A hand-written linear-memory WASM kernel** (Rust→wasm-pack or C→Emscripten)
   for the substructure inner loop only. Linear memory has **no GC and no managed
   bounds checks**, so it can approach or match native Java on the hot path — but
   it abandons API parity and is a full reimplementation. Worth it only as a
   targeted hybrid for the screen+match loop, not for the whole library.

Toolchains that are **not** faster here:

- **CheerpJ** — JIT-to-JS, browser-only, async-only; wrong shape and no native i64
  guarantee.
- **GraalVM Web Image** — Graal's optimizer is more advanced and *could* eventually
  beat TeaVM, but in 2026 it is experimental, server-focused, produces much larger
  binaries and has nascent browser support. A "watch later", not a faster-now.
- **J2CL / GWT** — emit JavaScript, so they inherit the slow `long` emulation that
  motivated this work; they cannot win the i64 path.

Bottom line: tuned **TeaVM WasmGC is at the practical ceiling for "compile all of
OCL"**; the only thing meaningfully faster is a Rust/C hot-path kernel that trades
whole-library parity for raw speed on substructure alone.

## Next steps

The full plan (toolchain, API tiers, resource bundling, depiction shims,
`.d.ts` sync, staged execution) is in the design report produced for this repo.
The immediate next milestone is breadth: re-author the public API wrappers and
prove the resource-loading tier (force field / predictors). `CanvasEditor` and
all GUI stay on GWT and are out of scope.
