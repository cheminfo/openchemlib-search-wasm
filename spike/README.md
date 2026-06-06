# Stage 0 spike — TeaVM WasmGC toolchain proof

This is a throwaway spike (not the real package) that answers one question before
committing to the full `openchemlib-wasm` port:

> Can TeaVM 0.14.1 compile a 64-bit-`long` Java class to a WebAssembly GC module,
> `@JSExport` it, load it from in-memory bytes in Node (and the browser), with
> **correct and fast native i64**, and ship it embedded as gzip+base64 like
> `cheminfo/inchi-js`?

**Answer: yes, on all counts.**

## What it proves

- `Screen.java` reproduces the OpenChemLib `SSSearcherWithIndex` fingerprint screen
  (`(fragment & ~molecule) == 0`, `Long.bitCount`, a 64-bit LCG screening loop)
  using `long` arithmetic, with `@JSExport` static methods. It depends on nothing
  from OpenChemLib.
- `mvn process-classes` compiles it to `target/wasm-gc/spike.wasm` +
  `spike.wasm-runtime.js` (ESM, `export { load }`).
- `node/test.mjs` loads the wasm **from raw bytes** (no fetch/URL) and verifies:
  - **i64 is exact**: `rotateLeft(1, 63) == Long.MIN_VALUE`, subset/popcount
    correct, and a 64-bit-LCG loop whose multiplier overflows 53 bits every
    iteration matches a BigInt reference exactly.
  - `long` ↔ JS `BigInt` round-trips.
  - **Indicative throughput**: the i64 screening loop runs ~**45× faster** in WASM
    than the equivalent JS `BigInt` loop (1026 vs 23 M ops/s). This is a proxy for
    the cost of boxed/emulated 64-bit math — *not* the real GWT-vs-WASM
    substructure benchmark, which requires real molecules (Stage 2).
- `node/test-embedded.mjs` proves the **isomorphic distribution path**: the wasm
  embedded as gzip+base64 is decoded with only `atob` + `DecompressionStream`
  (no `fs`, no `fetch`, no `Buffer`) and runs identically.

## Run it

```sh
export JAVA_HOME=$(/usr/libexec/java_home -v 21)   # TeaVM needs JDK 11+; build uses 21
mvn -B -f pom.xml process-classes
node node/test.mjs
node build/embed-wasm.mjs && node node/test-embedded.mjs
```

## Gotcha worth remembering

`teavm-classlib` declares `teavm-core` at **`<scope>runtime</scope>`**, but the
`teavm-maven-plugin` builds the class set it analyzes from the **compile**
classpath only. So the runtime support classes it must compile into the module
(notably `org.teavm.runtime.Fiber`) are missing and the WasmGC build dies with
`NullPointerException ... "fiberClass" is null` in `WasmGCDependencies.contributeFiber`.
**Fix: declare `org.teavm:teavm-core` as an explicit (compile-scope) dependency.**
See `pom.xml`.

## Honest caveats

- Browser execution is not yet exercised here; the APIs used (WasmGC + js-string
  builtins, `atob`, `DecompressionStream`) are all in current browsers, so it is
  expected to work, but that is unverified.
- The 45× number is i64-vs-BigInt, a loose upper bound on the long-emulation win.
  GWT emulates `long` with a 3-number triple, which differs from BigInt; the real
  delta on substructure search must be measured against the actual GWT build.
- This spike does **not** prove that the real 562-file OCL source compiles under
  TeaVM — that is the next risk to retire (Stage 2 vertical slice).
