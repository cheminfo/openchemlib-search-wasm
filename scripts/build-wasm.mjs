// Compiles the OpenChemLib facade to WasmGC (Maven `clean process-classes`, which
// runs the TeaVM plugin). The Java sources are compiled with
// `maven.compiler.release=21`, so both javac and the TeaVM runtime need a JDK >= 21.
// We do NOT trust the ambient JAVA_HOME: on macOS `/usr/libexec/java_home -v 21`
// silently falls back to whatever JDK is registered (e.g. Temurin 19) when no 21
// is registered, and a Homebrew `openjdk@21` is not registered with the macOS
// java_home at all. So we locate a genuine JDK >= 21 ourselves, validate its
// version, and pass it to mvn.
//
// We always `clean` first: the pom compiles only the facade (org/openchemlib/
// wasm/api/*.java) and lets javac pull the reachable OpenChemLib closure on demand
// via -sourcepath. That implicit closure is only emitted on a full compile — with a
// stale target/classes javac reports "Nothing to compile" and TeaVM silently builds
// an almost-empty wasm (facade only) instead of the full ~3 MB module. A clean
// compile is the only reliable guarantee, and costs ~10s.
//
// Override with JAVA21_HOME to point at a specific JDK.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED_MAJOR = 21;
const root = join(import.meta.dirname, '..');
const pom = join(root, 'java', 'pom.xml');
const wasm = join(root, 'java', 'target', 'wasm-gc', 'openchemlib.wasm');

const javaHome = resolveJavaHome();

console.log(`build-wasm: using JDK ${jdkMajor(javaHome)} at ${javaHome}`);

// Always `clean` first: the facade is compiled with `-sourcepath`, so javac
// pulls the reachable OpenChemLib closure on demand. maven-compiler-plugin only
// tracks the explicitly-included facade files for staleness, so an incremental
// (warm `target/`) rebuild reports "Nothing to compile" and leaves a stale,
// partial closure — TeaVM then emits a truncated wasm (e.g. 116 classes / 73 kB
// instead of the full 742 / 3 MB). A clean build recompiles the whole closure
// and is fully reproducible, which is also what CI and `npm publish` require.
const result = spawnSync('mvn', ['-B', '-f', pom, 'clean', 'process-classes'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    JAVA_HOME: javaHome,
    PATH: `${join(javaHome, 'bin')}:${process.env.PATH ?? ''}`,
  },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

if (!existsSync(wasm)) {
  console.error(`build-wasm: Maven succeeded but ${wasm} was not produced.`);
  process.exit(1);
}

// eslint-disable-next-line jsdoc/require-returns-check -- the no-JDK branch exits instead of returning
/**
 * Resolves the home of a JDK whose major version is >= REQUIRED_MAJOR, trying an
 * explicit override, the current environment, the macOS registry, then well-known
 * Homebrew and Linux install locations. Exits the process with a helpful message if none is found.
 * @returns {string} the validated JAVA_HOME
 */
function resolveJavaHome() {
  for (const home of candidateHomes()) {
    const major = jdkMajor(home);
    if (major !== null && major >= REQUIRED_MAJOR) return home;
  }

  console.error(
    `build-wasm: no JDK >= ${REQUIRED_MAJOR} found.\n` +
      `  Install one (e.g. \`brew install openjdk@${REQUIRED_MAJOR}\`) or set\n` +
      `  JAVA21_HOME to a JDK ${REQUIRED_MAJOR} home directory and retry.`,
  );
  process.exit(1);
}

function* candidateHomes() {
  if (process.env.JAVA21_HOME) yield process.env.JAVA21_HOME;
  if (process.env.JAVA_HOME) yield process.env.JAVA_HOME;
  if (process.platform === 'darwin') {
    try {
      yield execFileSync(
        '/usr/libexec/java_home',
        ['-v', String(REQUIRED_MAJOR)],
        {
          encoding: 'utf8',
        },
      ).trim();
    } catch {
      // No registered JDK matched; fall through to the explicit paths below.
    }
  }
  yield `/opt/homebrew/opt/openjdk@${REQUIRED_MAJOR}/libexec/openjdk.jdk/Contents/Home`;
  yield `/usr/local/opt/openjdk@${REQUIRED_MAJOR}/libexec/openjdk.jdk/Contents/Home`;
  for (const base of ['/usr/lib/jvm', '/usr/lib64/jvm']) {
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base)) {
      if (entry.includes(String(REQUIRED_MAJOR))) yield join(base, entry);
    }
  }
}

/**
 * Reads the major Java version of a JDK home, preferring the cheap `release` file
 * and falling back to `java -version`.
 * @param {string} home - candidate JAVA_HOME
 * @returns {number | null} the major version, or null if `home` is not a usable JDK
 */
function jdkMajor(home) {
  if (!home) return null;
  const releaseFile = join(home, 'release');
  if (existsSync(releaseFile)) {
    const match = readFileSync(releaseFile, 'utf8').match(
      /JAVA_VERSION="(?<major>\d+)/,
    );
    if (match) return Number(match.groups.major);
  }
  const javaBin = join(home, 'bin', 'java');
  if (!existsSync(javaBin)) return null;
  const probe = spawnSync(javaBin, ['-version'], { encoding: 'utf8' });
  const match = `${probe.stdout ?? ''}${probe.stderr ?? ''}`.match(
    /version "(?<major>\d+)/,
  );
  return match ? Number(match.groups.major) : null;
}
