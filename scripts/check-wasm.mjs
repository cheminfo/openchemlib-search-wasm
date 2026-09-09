// Checks that the committed wasm/data.js holds the module the Java sources produce, by comparing
// what it decompresses to rather than its own bytes.
//
// data.js embeds the module gzip+base64, and deflate output depends on the Node version — 24 ships
// zlib-ng, 26 a different zlib, and the two compress this same module to 106,240 and 105,338 bytes.
// So `git diff -- wasm` reports a byte-identical module as stale whenever the rebuild ran on a
// different Node than the commit did. The payload inside is what has to match, and does.
//
// Run it after `npm run build`: it compares the working tree against HEAD, so in CI it reports a
// stale module, and locally it tells you whether a rebuild changed anything worth committing.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gunzipSync } from 'node:zlib';

const EMBEDDED = 'wasm/data.js';

const root = join(import.meta.dirname, '..');
const built = await moduleIn(join(root, EMBEDDED));
const committed = await moduleIn(writeTemp(committedSource()));

if (built.digest === committed.digest) {
  console.log(
    `check-wasm: ${EMBEDDED} is up to date — ${built.bytes} B, sha256 ${built.digest}`,
  );
  process.exit(0);
}

console.error(
  `check-wasm: the committed module is not what the sources produce.\n` +
    `  committed: ${committed.bytes} B, sha256 ${committed.digest}\n` +
    `  built:     ${built.bytes} B, sha256 ${built.digest}`,
);
console.error(
  '::error::wasm/ is stale — run `npm run build` and commit the result',
);
process.exit(1);

/**
 * Reads the module a generated `data.js` carries.
 * @param {string} path - the file to read, as an absolute path
 * @returns {Promise<{bytes: number, digest: string}>} the decompressed module's size and digest
 */
async function moduleIn(path) {
  const { wasmGzipBase64 } = await import(pathToFileURL(path).href);
  const wasm = gunzipSync(Buffer.from(wasmGzipBase64, 'base64'));
  return {
    bytes: wasm.length,
    digest: createHash('sha256').update(wasm).digest('hex'),
  };
}

/**
 * The committed `data.js`, read from HEAD rather than from the working tree, which `npm run build`
 * has just overwritten.
 * @returns {Buffer} its source
 */
function committedSource() {
  try {
    return execFileSync('git', ['show', `HEAD:${EMBEDDED}`], {
      cwd: root,
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    console.error(`check-wasm: cannot read ${EMBEDDED} from HEAD.`);
    throw error;
  }
}

/**
 * Writes a source to a temporary file, so it can be imported as the ES module it is instead of
 * being parsed by hand.
 * @param {Buffer} source - the module source
 * @returns {string} the path it was written to
 */
function writeTemp(source) {
  const path = join(mkdtempSync(join(tmpdir(), 'check-wasm-')), 'data.js');
  writeFileSync(path, source);
  return path;
}
