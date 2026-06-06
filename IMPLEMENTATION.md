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

Resources are **not** bundled into the wasm via a `ResourceSupplier`; instead the
~35 ASCII parameter tables are embedded gzip+base64 (`build/embed-resources.mjs` →
`src/wasm/resources.ts`) and registered at startup:

- `org.cheminfo.utils.FakeFileInputStream` (pure-Java, not the GWT/JSNI version)
  holds a `path → byte[]` map; OCL reads tables through `getResourceAsStream`.
- The `Resources` facade exposes `register(path, content)`; `loadOCL({ resources: true })`
  decodes the embedded bundle and registers every file.
- Resource-loaded classes call `Resources.checkHasRegistered()` in their
  constructor and throw `"static resources must be registered first"` until then.

Two GWT patches had to be reconciled for TeaVM: `FingerPrintGenerator` was reverted
from `JSHashMap` back to `java.util.Hashtable` (TeaVM supports it), and the orphaned
`com.actelion.research.gui.FileHelper` import was dropped from `RigidFragmentCache`
(its disk-I/O methods are already stripped). `org.openmolecules` (conformer) is a
second vendored source root alongside `com`.

## Status

Done & green (25 tests + 1 todo): **Molecule** (core + toMolfile), **SmilesParser**,
**SSSearcher**, **SSSearcherWithIndex**, **Resources** + `loadOCL({ resources })`,
**ForceFieldMMFF94** (full: conformer→tables→minimise verified end to end),
**ConformerGenerator** (used by the force-field test), **DruglikenessPredictor** /
**ToxicityPredictor** (constructor gate verified). idcodes + 512 fingerprint keys
byte-identical to openchemlib-js.

Known remaining item: the predictors' full computation (`assessDruglikeness` /
`assessRisk`) throws a null-pointer deref inside OCL — a predictor-specific
descriptor/resource detail to debug (the registration mechanism itself works, per
the force-field test).

Remaining (same pattern): the rest of `Molecule`'s 284 methods; `Canonizer`,
`CanonizerUtil`, `MolecularFormula`, `MoleculeProperties`, `RingCollection`,
`Reaction`/`ReactionEncoder`/`Reactor`, `SDFileParser`, `Transformer`, `Util`, and
`toSVG` (needs tiny `java.awt.Color`/Helvetica shims). `CanvasEditor`/GUI: out of scope.
