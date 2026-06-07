// Vendors the OpenChemLib Java source from the `openchemlib` git submodule into
// java/src/main/java and resources/, applying the WASM-specific reconciliations.
//
// Unlike the GWT build (cheminfo/openchemlib-js scripts/openchemlib/classes.js),
// we do NOT patch java.util.Hashtable, .clone() or StandardCharsets — TeaVM
// supports them. The only reconciliations WASM needs are:
//   1. route OpenChemLib's resource loading through our pure-Java
//      org.cheminfo.utils.FakeFileInputStream (TeaVM has no working
//      Class.getResourceAsStream), and
//   2. strip RigidFragmentCache's disk-cache methods, which use the removed
//      com.actelion.research.gui.FileHelper (Swing/disk).
//
// The committed java/ copy is the validated output of this script; re-run it
// after bumping the submodule and then `npm run build && npm run test-only`.
import {
  cpSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const upstreamJava = join(root, 'openchemlib', 'src', 'main', 'java');
const upstreamResources = join(
  root,
  'openchemlib',
  'src',
  'main',
  'resources',
  'resources',
);
const javaDir = join(root, 'java', 'src', 'main', 'java');
// Resources go on the Maven classpath so TeaVM bundles them into the .wasm (via
// the ResourceSupplier below) — available at runtime with no registration step.
const resourcesDir = join(root, 'java', 'src', 'main', 'resources', 'resources');

// The parameter tables to bundle into the wasm (classloader paths, no leading
// slash), mirroring cheminfo/openchemlib-js scripts/build_resources.js.
const bundledResources = [
  'cod/bondLengthData.txt',
  'cod/torsionAngle.txt',
  'cod/torsionFrequency.txt',
  'cod/torsionID.txt',
  'cod/torsionRange.txt',
  'forcefield/mmff94/94s/outofplane.csv',
  'forcefield/mmff94/94s/torsionPlus.csv',
  'forcefield/mmff94/94s/torsion.csv',
  'forcefield/mmff94/angle.csv',
  'forcefield/mmff94/atom.csv',
  'forcefield/mmff94/bci.csv',
  'forcefield/mmff94/bndk.csv',
  'forcefield/mmff94/bond.csv',
  'forcefield/mmff94/covrad.csv',
  'forcefield/mmff94/def.csv',
  'forcefield/mmff94/dfsb.csv',
  'forcefield/mmff94/herschbachlaurie.csv',
  'forcefield/mmff94/outofplane.csv',
  'forcefield/mmff94/pbci.csv',
  'forcefield/mmff94/stbn.csv',
  'forcefield/mmff94/torsion.csv',
  'forcefield/mmff94/vanderwaals.csv',
  'druglikenessNoIndex.txt',
  'toxpredictor/i1.txt',
  'toxpredictor/i2.txt',
  'toxpredictor/i3.txt',
  'toxpredictor/m1.txt',
  'toxpredictor/m2.txt',
  'toxpredictor/m3.txt',
  'toxpredictor/r1.txt',
  'toxpredictor/r2.txt',
  'toxpredictor/r3.txt',
  'toxpredictor/t1.txt',
  'toxpredictor/t2.txt',
  'toxpredictor/t3.txt',
];

// 1. Copy upstream Java packages. org/ is merged so our facade
//    (org/openchemlib/wasm) and shim (org/cheminfo/utils) are preserved.
for (const pkg of ['com', 'info', 'smile']) {
  rmSync(join(javaDir, pkg), { recursive: true, force: true });
  cpSync(join(upstreamJava, pkg), join(javaDir, pkg), { recursive: true });
}
for (const sub of readdirSync(join(upstreamJava, 'org'))) {
  rmSync(join(javaDir, 'org', sub), { recursive: true, force: true });
  cpSync(join(upstreamJava, 'org', sub), join(javaDir, 'org', sub), {
    recursive: true,
  });
}

// 2. Copy resources onto the classpath and generate the ResourceSupplier that
//    tells TeaVM which ones to bundle into the wasm.
rmSync(resourcesDir, { recursive: true, force: true });
cpSync(upstreamResources, resourcesDir, { recursive: true });
writeResourceSupplier();

// 3. Patch.
let patched = 0;
for (const file of walk(javaDir)) {
  if (!file.endsWith('.java')) continue;
  const original = readFileSync(file, 'utf8');
  let code = original;
  // TeaVM treats Thread.yield() as an async suspension point, transforming the
  // enclosing method into a Fiber coroutine that throws when called
  // synchronously from JS (@JSExport). It is a cooperative no-op in
  // single-threaded WASM, so drop it. (Used by the predictors.)
  if (code.includes('Thread.yield();')) {
    code = code.replaceAll(/[ \t]*Thread\.yield\(\);\n/g, '');
  }
  if (code.includes('.getResourceAsStream(')) {
    code = code
      .replaceAll(
        /\b[A-Za-z_][\w]*\.class\.getResourceAsStream\(/g,
        'FakeFileInputStream.getResourceAsStream(',
      )
      .replaceAll(
        /(?:this\.)?getClass\(\)\.getResourceAsStream\(/g,
        'FakeFileInputStream.getResourceAsStream(',
      );
    if (
      code !== original &&
      !code.includes('import org.cheminfo.utils.FakeFileInputStream;')
    ) {
      code = addImport(code, 'org.cheminfo.utils.FakeFileInputStream');
    }
  }
  if (file.endsWith('RigidFragmentCache.java')) {
    code = patchRigidFragmentCache(code);
  }
  if (file.endsWith('HydrogenHandler.java')) {
    // OCL reads getConnAtom(iAtom, 0) to test for a neighbour; with 0 neighbours
    // (e.g. ammonia) that is an out-of-bounds access GWT tolerates but WasmGC
    // traps. Short-circuit on getConnAtoms() first (reproduces GWT behaviour).
    code = code.replace(
      'if (molecule.getConnAtom(iAtom, 0)>0) {',
      'if (molecule.getConnAtoms(iAtom) > 0 && molecule.getConnAtom(iAtom, 0)>0) {',
    );
  }
  if (code !== original) {
    writeFileSync(file, code);
    patched++;
  }
}

// eslint-disable-next-line no-console
console.log(`vendored OpenChemLib from submodule; patched ${patched} files`);

function patchRigidFragmentCache(code) {
  code = code.replace(/^import com\.actelion\.research\.gui\.FileHelper;\n/m, '');
  for (const [start, end] of [
    ['public static RigidFragmentCache createCache', 'return cache;\n\t}'],
    ['public boolean serializeCache', 'return false;\n\t}'],
    ['public boolean writeTabDelimitedTable', 'return false;\n\t}'],
    ['public void loadCache(String cacheFileName)', '\n\t}'],
    ['public static RigidFragmentCache createInstance', 'return cache;\n\t}'],
    ['private static long addFragmentsToCacheSMP', '\n\t}'],
    ['private static void consumeMoleculesToCacheFragments', '\n\t}'],
  ]) {
    code = removeSlice(code, start, end);
  }
  return code;
}

function removeSlice(code, start, end) {
  const startIndex = code.indexOf(start);
  if (startIndex === -1) return code;
  const endIndex = code.indexOf(end, startIndex);
  if (endIndex === -1) {
    throw new Error(`copy-openchemlib: could not find end "${end}" after "${start}"`);
  }
  return code.slice(0, startIndex) + code.slice(endIndex + end.length);
}

function addImport(code, importName) {
  return code.replace(
    /^(package [^\n]+\n)/m,
    `$1\nimport ${importName};\n`,
  );
}

function writeResourceSupplier() {
  const entries = bundledResources
    .map((path) => `      "resources/${path}",`)
    .join('\n');
  const code = `package org.openchemlib.wasm.api;

import org.teavm.classlib.ResourceSupplier;
import org.teavm.classlib.ResourceSupplierContext;

/**
 * Generated by scripts/copy-openchemlib.mjs — do not edit. Tells TeaVM which
 * classpath resources to bundle into the wasm, so OpenChemLib's parameter tables
 * are available at runtime with no registration step.
 */
public class OclResourceSupplier implements ResourceSupplier {
  @Override
  public String[] supplyResources(ResourceSupplierContext context) {
    return new String[] {
${entries}
    };
  }
}
`;
  writeFileSync(
    join(javaDir, 'org/openchemlib/wasm/api/OclResourceSupplier.java'),
    code,
  );
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}
