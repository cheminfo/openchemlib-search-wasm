// Extracts the idcode corpus the dev app scans into dev/public/idcodes.txt.
//
// The source database belongs to another project and is opened read-only through
// an `immutable=1` URI: the .bak file has a stale -shm beside it, and a plain open
// would try to recover it, which would write to a database we do not own. Only the
// id_code column is ever selected.
import { spawnSync } from 'node:child_process';
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const DEFAULT_DB =
  '/Users/lpatiny/git/cheminfo/reference.cheminfo.org/data/sqlite/db.sqlite.old-system.bak';

const root = join(import.meta.dirname, '..');
const output = join(root, 'dev', 'public', 'idcodes.txt');
// Records what the corpus beside it actually holds, so asking for the whole table after a limited
// extraction rebuilds instead of silently keeping the short file.
const marker = join(root, 'dev', 'public', 'idcodes.meta.json');
const database = process.env.OPENCHEMLIB_WASM_DATASET_DB ?? DEFAULT_DB;
const limit = parseLimit(process.argv[2]);

main();

function main() {
  requireSqlite3();
  requireDatabase();

  if (isUpToDate()) {
    const { size } = statSync(output);
    log(
      `dataset: ${output} already holds ${describeLimit()} and is newer than the database` +
        ` (${format(size)} bytes) — nothing to do.`,
    );
    log('dataset: delete it to force a rebuild.');
    return;
  }

  mkdirSync(join(root, 'dev', 'public'), { recursive: true });
  const temporary = `${output}.partial`;
  const started = performance.now();
  extract(temporary);
  renameSync(temporary, output);
  writeFileSync(marker, `${JSON.stringify({ database, limit })}\n`);

  const { size } = statSync(output);
  log(
    `dataset: wrote ${describeLimit()} to ${output} — ${format(size)} bytes in` +
      ` ${Math.round(performance.now() - started)} ms.`,
  );
}

/**
 * Runs the extraction, streaming sqlite3's stdout straight to a file so the 16 MB
 * result never passes through a Node string buffer.
 * @param {string} temporary - the file written before the atomic rename
 */
function extract(temporary) {
  const sql = `SELECT id_code FROM entries ORDER BY id${limit === null ? '' : ` LIMIT ${limit}`};`;
  const handle = openSync(temporary, 'w');
  let result;
  try {
    result = spawnSync(
      'sqlite3',
      ['-readonly', '-noheader', `file:${database}?immutable=1`, sql],
      { stdio: ['ignore', handle, 'pipe'], encoding: 'utf8' },
    );
  } finally {
    closeSync(handle);
  }
  if (result.status !== 0) {
    rmSync(temporary, { force: true });
    fail(
      `sqlite3 failed on ${database}:\n  ${(result.stderr ?? '').trim() || 'no error output'}`,
    );
  }
}

/**
 * Reports whether the extraction can be skipped.
 * @returns {boolean} true when the output holds exactly what was asked for and is newer than the
 * database
 */
function isUpToDate() {
  if (!existsSync(output) || !existsSync(marker)) return false;
  if (statSync(output).mtimeMs < statSync(database).mtimeMs) return false;
  try {
    const previous = JSON.parse(readFileSync(marker, 'utf8'));
    return previous.database === database && previous.limit === limit;
  } catch {
    return false;
  }
}

function describeLimit() {
  return limit === null ? 'the whole table' : `the first ${format(limit)} rows`;
}

function requireSqlite3() {
  const probe = spawnSync('sqlite3', ['-version'], { encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    fail(
      'sqlite3 is not on the PATH.\n' +
        '  macOS ships it at /usr/bin/sqlite3; elsewhere install the sqlite3 command line tool.',
    );
  }
}

function requireDatabase() {
  if (existsSync(database)) return;
  fail(
    `the database was not found at\n    ${database}\n` +
      '  Point OPENCHEMLIB_WASM_DATASET_DB at a SQLite file holding an `entries` table\n' +
      '  with an `id_code` column, then run `npm run dataset` again.',
  );
}

/**
 * Parses the optional row limit argument.
 * @param {string | undefined} value - the first command line argument
 * @returns {number | null} the limit, or null when the whole table is wanted
 */
function parseLimit(value) {
  if (value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    fail(`the row limit must be a positive integer, got "${value}".`);
  }
  return parsed;
}

function format(value) {
  return value.toLocaleString('en-US');
}

/**
 * Prints an actionable message and stops, so the app can tell the user to run this
 * script instead of failing on a missing file at load time.
 * @param {string} message - what went wrong and what to do about it
 */
function fail(message) {
  console.error(`dataset: ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(message);
}
