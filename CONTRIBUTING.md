# Contributing

The package is a handful of search functions over an OpenChemLib closure compiled to WebAssembly by
TeaVM. Almost everything below is about keeping that closure cheap to upgrade.

```
java/pom.xml                          TeaVM WasmGC build; javac pulls OpenChemLib from the submodule
java/overlay/                         escape hatch, deliberately empty
java/src/main/java/org/openchemlib/wasm/{Entry,Search}.java   the only Java we own
openchemlib/                          git submodule, upstream OpenChemLib source
scripts/build-wasm.mjs                finds a JDK, runs Maven
build/embed-wasm.mjs                  gzip+base64 the wasm into wasm/, copy the TeaVM runtime
wasm/                                 generated and COMMITTED — see below
src/                                  the library
```

## Build

```sh
npm ci
npm run test
```

**That needs no Java.** `wasm/` is generated but committed, the way `cheminfo/inchi-js` commits its
own embedded module, so the everyday loop — tests, types, lint, the dev app, the benchmarks — runs
on Node alone. You need a JDK 21 or later and Maven only to change the Java or bump OpenChemLib:

```sh
git submodule update --init
npm run build      # Maven + TeaVM, then embed the module into wasm/
npm run test
git add wasm       # commit the regenerated module with the change that caused it
```

The TeaVM build is byte-reproducible, so CI rebuilds it and fails if the committed `wasm/` differs
from what the sources produce. Forgetting the rebuild is caught, not shipped.

`scripts/build-wasm.mjs` locates the JDK itself rather than trusting the ambient `JAVA_HOME`. On
macOS `/usr/libexec/java_home -v 21` silently returns whatever JDK happens to be registered when no
21 is — a Temurin 19, say — and a Homebrew `openjdk@21` is not registered with it at all. The script
reads the major version of each candidate and passes a validated one to Maven. Override it with
`JAVA21_HOME`.

CI needs the submodule too. Without it javac cannot resolve a single OpenChemLib class.

Other scripts: `npm run test-only` runs vitest alone, `npm run dev` the demo app, `npm run benchmark`
and `npm run benchmark-scan` the benchmarks, and `npm run dataset` builds the large local corpus the
demo and the scan benchmark read — third-party data, never committed.

## Upgrading OpenChemLib

```sh
git -C openchemlib fetch --tags
git -C openchemlib checkout <tag>
npm run build
npm run test-only
```

Commit the submodule pointer and the regenerated `wasm/`. That is the entire procedure.

It is that short because **OpenChemLib is neither vendored nor patched**. `java/pom.xml` compiles
only `org/openchemlib/wasm/*.java`; javac's `-sourcepath` pulls the reachable closure — 44
OpenChemLib classes, 56 class files with the nested ones — straight out of the submodule working
tree, and TeaVM's dead-code elimination compiles that same
closure. There is no copy to regenerate and no diff to review.

The substructure and similarity closure also needs none of the reconciliations the old full-API port
needed: no `Thread.yield()` stripping, no `getResourceAsStream` rerouting, no `RigidFragmentCache`
surgery, no `java.awt` repackaging, no bundled parameter tables. Every one of those triggers has zero
hits across the closure — they live in the force field, the predictors, the conformer generator and
the depiction code, and the search functions reach none of it. Nothing in the closure reads a classpath
resource at runtime either, so there is no resource bundle to keep in step.

Two things a bump can break, and how each surfaces:

- an API `Search.java` calls is renamed or removed — javac fails during `npm run build`;
- a fingerprint definition, an aromaticity rule or a match rule changes — the tests fail. Nothing
  else catches that, which is why the tests are shaped the way they are.

### `java/overlay/` stays empty

The pom puts it ahead of the submodule on the sourcepath:

```
-sourcepath java/src/main/java:java/overlay:openchemlib/src/main/java
```

javac resolves a class from the first entry that provides it — documented first-match-wins — so a
file dropped in `java/overlay/` under its real package path replaces the upstream one for this build,
with no fork and no patch.

Empty is the goal: an empty overlay is what makes an OpenChemLib upgrade a submodule bump. Every file
added here has to be reconciled against upstream at every release from then on. Add one only when an
upstream source genuinely cannot be compiled by TeaVM, say why at the top of the file, and open an
issue upstream.

## What the tests guarantee

The suite runs every exported function over real idcodes (`src/__tests__/data/idcodes.txt`, 1999 of
them) and cross-checks every result against `openchemlib` — the GWT build — computed in the same
process. Hit counts, similarity values and fingerprint words must agree exactly.

That cross-check is what turns an upstream behaviour change into a red test instead of into silently
different search results. A build failure only catches signature changes, and between two OpenChemLib
releases three and a half months apart, six of the closure's source files changed — `ExtendedMolecule`
and `AromaticityResolver` among them — with no signature change at all. Those particular edits turned
out to change nothing (identical digests over 20,000 idcodes), which is exactly what the tests are
there to establish.

The highest-value assertion is `getIndexes.test.ts`'s "every word matches openchemlib-js
createIndex", which compares all sixteen words of the 512-bit FragFp against `openchemlib-js` over
250 idcodes. Those words are the 512 substructure keys applied: they define every similarity value
this package returns and every `ss_index` column already stored in consumer databases, so if the key
set ever changes, every stored index everywhere is invalid. Assert malformed input explicitly too —
its behaviour is a consequence of a build flag, not an accident.

## TeaVM interop worth knowing

- `@JSExport` is per member. There is no class-level export.
- Static constants cannot be exported at all (`@JSExport` targets methods and constructors only).
  `SubstructureResult` and `SimilarityResult` live in `src/types.ts` and are kept in step with the
  constants in `Search.java` by hand.
- A `@JSExport` method taking an **array of exported objects** makes TeaVM emit an invalid WasmGC
  module (`CompileError: ... array.get of type ...`). Pass primitives, strings and typed arrays.
- `@JSExport getX()` is a method on the JS side, never a property.
- Java arrays surface as typed arrays with no conversion: `int[]` → `Int32Array`, `float[]` →
  `Float32Array`, `byte[]` → `Int8Array`, `String[]` → `string[]`.
- A `byte[]` **parameter** is marshalled by copy, inbound only: Java writes it and the caller's
  buffer never changes — `SharedArrayBuffer` included. The result buffers are therefore declared as
  `org.teavm.jso.typedarrays.Uint8Array` / `Float32Array` / `Int32Array`, live JS handles written with
  `result.set(i, v)`; that is what `teavm-jso-apis` is for. TeaVM 0.14.1 has no `Float16Array`, which
  is why similarity results are 32-bit.
- TeaVM has a real `float`; GWT emulates `float` as `double`. A float-returning method yields e.g.
  `0.33333334`.

Two build gotchas:

- **`teavm-core` must be declared explicitly.** `teavm-classlib` scopes it at `runtime`, and the
  Maven plugin analyses only the compile classpath, so without it the WasmGC build fails with
  `"fiberClass" is null`.
- **Maven must `clean` first.** Only `org/openchemlib/wasm/*.java` is in `<includes>` and
  `maven-compiler-plugin` tracks staleness for those files alone, so a warm `target/` makes javac
  report "Nothing to compile" — the `-sourcepath` closure is never re-emitted and TeaVM quietly
  builds a facade-only wasm. `scripts/build-wasm.mjs` forces the clean; leave it there.

## `strict=false`

The build drops WasmGC's null and array-bounds checks. Against `strict=true` that is 12.6% faster and
36% smaller, and its only cost is how a malformed idcode fails: OpenChemLib's bit-stream parser reads
past its input and WebAssembly traps instead of throwing a Java exception.

The trap unwinds into JS and leaves the module usable, so `src/index.ts` catches it, records
`unparsable` for the entry it died on, and resumes after it. That JS-side recovery is the reason
`strict=false` is affordable — keep the test that covers it.

To build the other way: `mvn -f java/pom.xml -Dteavm.strict=true clean process-classes`.

## Tried and rejected

**A packed `byte[]` plus an `int[]` offset table** instead of the `string[]` parameter, to avoid
marshalling one JS string per molecule. Measured at 77 ns per byte crossing the boundary — about
1.2 s for a 16 MB corpus — against 0.55 µs per molecule for `string[]`, which is 226 ms for the same
corpus and 2.4% of a scan. `string[]` is both faster and the simpler API. `benchmark/boundary.js`
re-measures the crossing; watch it across TeaVM upgrades.

**Chunked writes into the result buffer**, 1024 entries at a time instead of one `result.set(i, v)`
per molecule. No measurable difference, so the code writes per entry and gets entry-level progress
for free.
