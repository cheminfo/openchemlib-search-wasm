// Compiles the OpenChemLib facade to WasmGC (Maven `process-classes`, which runs
// the TeaVM plugin). The Java sources are compiled with `maven.compiler.release=21`,
// so both javac and the TeaVM runtime need a JDK >= 21. We do NOT trust the
// ambient JAVA_HOME: on macOS `/usr/libexec/java_home -v 21` silently falls back
// to whatever JDK is registered (e.g. Temurin 19) when no 21 is registered, and a
// Homebrew `openjdk@21` is not registered with the macOS java_home at all. So we
// locate a genuine JDK >= 21 ourselves, validate its version, and pass it to mvn.
//
// Override with JAVA21_HOME to point at a specific JDK.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED_MAJOR = 21;
const root = join(import.meta.dirname, '..');
const pom = join(root, 'java', 'pom.xml');
const wasm = join(root, 'java', 'target', 'wasm-gc', 'openchemlib.wasm');

const javaHome = resolveJavaHome();
// eslint-disable-next-line no-console
console.log(`build-wasm: using JDK ${jdkMajor(javaHome)} at ${javaHome}`);

const result = spawnSync('mvn', ['-B', '-f', pom, 'process-classes'], {
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
  // eslint-disable-next-line no-console
  console.error(`build-wasm: Maven succeeded but ${wasm} was not produced.`);
  process.exit(1);
}

/**
 * Resolves the home of a JDK whose major version is >= REQUIRED_MAJOR, trying an
 * explicit override, the current environment, the macOS registry, then well-known
 * Homebrew and Linux install locations. Exits with a helpful message if none is found.
 *
 * @returns {string} the validated JAVA_HOME
 */
function resolveJavaHome() {
  for (const home of candidateHomes()) {
    const major = jdkMajor(home);
    if (major !== null && major >= REQUIRED_MAJOR) return home;
  }
  // eslint-disable-next-line no-console
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
      yield execFileSync('/usr/libexec/java_home', ['-v', String(REQUIRED_MAJOR)], {
        encoding: 'utf8',
      }).trim();
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
 *
 * @param {string} home - candidate JAVA_HOME
 * @returns {number | null} the major version, or null if `home` is not a usable JDK
 */
function jdkMajor(home) {
  if (!home) return null;
  const releaseFile = join(home, 'release');
  if (existsSync(releaseFile)) {
    const match = readFileSync(releaseFile, 'utf8').match(/JAVA_VERSION="(\d+)/);
    if (match) return Number(match[1]);
  }
  const javaBin = join(home, 'bin', 'java');
  if (!existsSync(javaBin)) return null;
  const probe = spawnSync(javaBin, ['-version'], { encoding: 'utf8' });
  const match = `${probe.stdout ?? ''}${probe.stderr ?? ''}`.match(
    /version "(\d+)/,
  );
  return match ? Number(match[1]) : null;
}
