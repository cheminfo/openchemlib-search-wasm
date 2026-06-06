# openchemlib-wasm — implementation guide

How the WASM package mirrors the openchemlib-js API, and the pattern for adding
the remaining classes. The architecture and all interop risks are proven (see
`spike/` and the first vertical below).

## Layout

```
java/                         Maven module → openchemlib.wasm (WasmGC)
  src/main/java/com/...        vendored OpenChemLib source (536 files; DCE-pruned)
  src/main/java/org/openchemlib/wasm/api/
    Entry.java                main(); references each facade class for reachability
    Options.java              @JSProperty option-bag interfaces
    Molecule.java SmilesParser.java SSSearcher.java SSSearcherWithIndex.java
build/embed-wasm.mjs          gzip+base64 → src/wasm/data.ts, copies runtime.js
src/
  wasm/{data.ts,runtime.js,runtime.d.ts,load.ts}   loader (cached, isomorphic)
  types.ts                    public TS types (mirror openchemlib-js .d.ts)
  index.ts                    top-level await → re-export the exported classes
tests/                        ported from openchemlib-js (import from '#lib')
```

Build: `npm run build` (= `build-wasm` Maven + `build-embed`). Test: `npm run test-only`.

## Vendoring upstream OpenChemLib

Like openchemlib-js, the OCL source is tracked two ways: the `openchemlib` git
**submodule** is the upstream pin, and `java/src/main/java/{com,info,org,smile}` +
`resources/` are a **committed copy** so clones build offline. `npm run
copy:openchemlib` (`scripts/copy-openchemlib.mjs`) regenerates the copy from the
submodule; re-run it after bumping the submodule, then `npm run build && npm run test-only`.

The **WASM patch set is much smaller than GWT's** — TeaVM supports `java.util.Hashtable`,
`.clone()`, `String.format` and `StandardCharsets`, so none of those GWT rewrites are
applied. Only two reconciliations are needed (10 files):
1. route OCL resource loading (`X.class.getResourceAsStream` / `getClass().getResourceAsStream`)
   through the pure-Java `org.cheminfo.utils.FakeFileInputStream`;
2. strip `RigidFragmentCache`'s disk-cache methods (they use the removed `gui.FileHelper`).

The facade (`org/openchemlib/wasm`) and the shim (`org/cheminfo/utils/FakeFileInputStream.java`)
are hand-written and preserved across re-vendoring.

## Facade pattern (one Java class per public OCL class)

- Name the facade class with the **exact JS export name** (`Molecule`,
  `SmilesParser`, …). TeaVM exports by the simple class name; there is no rename.
  Colliding OCL types (`SmilesParser`, `SSSearcher`, …) are referenced by FQN.
- Annotate the **constructor, static factories, and instance methods** with
  `@JSExport` (TeaVM has no class-level export; each member is explicit).
- Wrap the underlying OCL object in a private field; expose it to sibling facades
  with a package-private getter (e.g. `Molecule.getStereoMolecule()`), never `@JSExport`.
- Add the new class to `Entry.main()` so DCE keeps it.

## Proven interop conventions

| Need | How |
|---|---|
| JS holds a Java object, calls methods | exported class = JS constructor; instances carry instance methods; methods may return other exported objects |
| Pass one exported object into another | plain reference parameter (`setMolecule(Molecule)`) |
| Options object in | `interface X extends JSObject` with `@JSProperty` getters; `isFoo()`→`foo`, `getBar()`→`bar`; guard with `options != null && !JSObjects.isUndefined(options)` |
| Option whose default is `true` | getter returns raw `JSObject`; `JSObjects.isUndefined(v) ? true : v.<JSBoolean>cast().booleanValue()` |
| Return arrays | return the Java array directly — `int[]`→`Int32Array`, `float[]`→`Float32Array`, `byte[]`→`Int8Array`, `String[]`→`string[]`, `int[][]`→`Int32Array[]`. **No conversion** (typed arrays are the intended API). |
| Build a `{a, b}` object | `interface R extends JSObject` with `@JSProperty` setters; `R r = JSObjects.create().cast()` |
| Throw an error JS can read | `throw new IllegalArgumentException(message)`; `error.message` carries it. Wrap checked OCL exceptions: `catch (Exception e) { throw new IllegalArgumentException(e.getMessage()); }` |

## Interop gotchas (learned the hard way)

- **Object-array params crash codegen.** A `@JSExport` method taking an array of
  exported objects (e.g. `Molecule[]`) makes TeaVM emit an invalid WasmGC module
  (`CompileError: ... array.get of type ...`). Build from single-object calls
  instead — e.g. `Reaction.fromMolecules` is a TS helper looping `addReactant`/`addProduct`.
- **`@JSExport getX()` is a METHOD, not a property.** GWT `@JsProperty` exposed
  `.x`; TeaVM exposes `getX()`. To keep the openchemlib-js property API: return
  value-objects as plain JS objects (a `@JSProperty`-setter `JSObject`, e.g.
  `Molecule.getMolecularFormula()`), or wrap a constructed class in a thin TS
  getter-class (e.g. `MoleculeProperties` in index.ts).
- **Reading a facade object out of an options bag** via a facade-typed
  `@JSProperty Molecule getMolecule()` crashes (`Symbol(javaObject)` of undefined)
  when the property is absent. Read a raw `@JSProperty("molecule") JSObject` first
  for the presence check, then unwrap with the facade-typed getter (same explicit
  property name). See `SmilesParser.parseMolecule`.
- **Static constants can't be `@JSExport`ed** (`@JSExport` targets METHOD/CONSTRUCTOR
  only). Attach them in index.ts: `Object.assign(ToxicityPredictor, { RISK_HIGH: 3, ... })`.
- **`Thread.yield()`/suspension points** become Fiber coroutines that NPE when
  called synchronously — stripped by the vendoring script (see Vendoring).

## Sanctioned differences from openchemlib-js (optimization-justified)

- **Typed arrays** instead of plain arrays for numeric returns.
- **32-bit floats**: TeaVM has real `float`; GWT emulates `float` as `double`.
  Float-returning methods (e.g. similarity) yield e.g. `0.33333334`. Ported tests
  that assert exact float64 use `toBeCloseTo`. (Applies library-wide.)

## Build gotchas (also in README)

- Declare `org.teavm:teavm-core` explicitly (it is `runtime`-scoped in
  `teavm-classlib`; the plugin analyzes only compile scope) → else `"fiberClass" is null`.
- Compile only `org/openchemlib/wasm/api/*.java`; javac pulls the OCL closure on
  demand via `-sourcepath`, skipping off-path files (conformer/docking/editor).

## Resource tier (force field / conformer / predictors)

The ~35 ASCII parameter tables are **bundled into the wasm** via TeaVM's
`ResourceSupplier`, so the resource-loaded classes work with **no registration
step**:

- The tables live on the Maven classpath (`java/src/main/resources/resources/...`).
- `OclResourceSupplier` (generated by the vendoring script, registered via
  `META-INF/services/org.teavm.classlib.ResourceSupplier`) lists them so TeaVM
  bundles exactly those into the `.wasm`.
- OCL's resource loading is patched to call `org.cheminfo.utils.FakeFileInputStream`,
  a thin adapter that reads via `getClass().getClassLoader().getResourceAsStream(name)`
  (the form TeaVM supports — `Class.getResourceAsStream` *crashes* at runtime) and
  strips the leading slash.

There is no JS-side registration, no `Resources` class, and no `loadOCL` options —
`Thread.yield()` is also stripped (TeaVM compiles it into a Fiber coroutine that
NPEs when called synchronously). The resource-loading reroute, `Thread.yield`
removal and `RigidFragmentCache` disk-method removal are all applied by the
vendoring script (see "Vendoring upstream OpenChemLib"). `org.openmolecules`
(conformer) is a second vendored source root alongside `com`.

## Status

Done & green (**110 tests, 3 skipped**): **Molecule** (core + a large method
surface), **SmilesParser**, **SSSearcher**/**SSSearcherWithIndex**, **ForceFieldMMFF94**,
**ConformerGenerator**, **DruglikenessPredictor**/**ToxicityPredictor** (incl. detail),
**DrugScoreCalculator**, **MolecularFormula**, **MoleculeProperties**, **RingCollection**,
**Canonizer**/**CanonizerUtil**, **Reaction**/**ReactionEncoder**/**Reactor**,
**Transformer**. idcodes, fingerprint keys and predictor outputs byte-identical to
openchemlib-js.

3 skipped (`TODO(wasm)`, known WasmGC-specific bugs to investigate): `addImplicitHydrogens('N')`
array-out-of-bounds; `inventCoordinates` seed not varying the layout; `Canonizer`
custom-label idcode byte difference.

Remaining: the rest of `Molecule`'s 284 methods (esp. query features + constants,
which need a static-constants strategy); `SDFileParser`, `Util`; `toSVG` (needs the
tiny `java.awt.Color`/Helvetica shims); molfile-parser tests; the `.d.ts` (types.ts)
merge + eslint/check-types alignment. `CanvasEditor`/GUI: out of scope.
