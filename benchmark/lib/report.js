import { existsSync, readFileSync } from 'node:fs';
import { arch, cpus, platform } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Above this relative margin of error the sample is noise and the number must not be quoted. */
export const MAX_RME = 10;

/**
 * Reads the version of `openchemlib` that is actually installed.
 *
 * The A/B is only meaningful against a named release, and a version written into a title by hand
 * goes stale at the next `npm update` without anything failing.
 * @returns {string} The installed version, or "unknown" if the package cannot be located.
 */
export function openchemlibVersion() {
  try {
    let directory = dirname(fileURLToPath(import.meta.resolve('openchemlib')));
    for (let depth = 0; depth < 8; depth++) {
      const manifest = join(directory, 'package.json');
      if (existsSync(manifest)) {
        const parsed = JSON.parse(readFileSync(manifest, 'utf8'));
        if (parsed.name === 'openchemlib') return parsed.version;
      }
      const parent = dirname(directory);
      if (parent === directory) break;
      directory = parent;
    }
  } catch {
    // Fall through to "unknown": a missing version must never fail a benchmark run.
  }
  return 'unknown';
}

/**
 * Prints the title, the machine and the corpus every table below is measured on.
 * @param {string} title - What this file answers, in one line.
 * @param {object} corpus - The result of `loadCorpus`, or `null` when the file uses none.
 * @param {string} corpus.path - Where the idcodes came from.
 * @param {number} corpus.total - How many idcodes that file held.
 * @param {number} corpus.stride - The sampling stride.
 * @param {boolean} corpus.small - Whether the test fixture was used instead of a real corpus.
 * @param {string[]} corpus.idCodes - The sample itself.
 * @returns {void}
 */
export function printHeader(title, corpus) {
  console.log(`\n${title}`);
  console.log(
    `node ${process.version}  ${platform()} ${arch()}  ${cpus().length} cores`,
  );
  if (!corpus) return;
  const { idCodes, total, stride, path, small } = corpus;
  console.log(
    `corpus ${count(idCodes.length)} idcodes, every ${ordinal(stride)} of ${count(total)}, ` +
      `mean ${mean(idCodes).toFixed(2)} chars`,
  );
  console.log(`       ${path}`);
  if (small) {
    console.log(
      '\nWARNING: no reference corpus found, so these numbers come from the 1,999-idcode test\n' +
        '         fixture. It is far smaller and far less varied than a real library; run\n' +
        '         `npm run dataset` or set OCL_IDCODES before quoting anything from this run.',
    );
  }
  console.log('');
}

/**
 * Builds the `cycle` listener a suite reports through: one line per finished case, printed as it
 * finishes so a run that takes minutes shows progress.
 * @param {number|((name: string) => number)} units - How many molecules one call of the benchmarked
 * function processes, so the timing can be reported per molecule rather than per call. A function
 * when the cases do not all process the same number.
 * @param {(name: string) => string} describe - Returns the value the named case computed, printed
 * next to its timing so two cases can be checked for equivalence at a glance.
 * @returns {{onCycle: (event: object) => void, results: Map<string, object>}} The listener and the
 * per-case statistics it collects.
 */
export function createReporter(units, describe) {
  const results = new Map();
  const unitsOf = typeof units === 'function' ? units : () => units;
  return {
    results,
    onCycle(event) {
      const bench = event.target;
      if (bench.error) {
        console.log(`${bench.name.padEnd(42)} FAILED: ${bench.error}`);
        return;
      }
      const perUnit = 1e6 / bench.hz / unitsOf(bench.name);
      const { rme, sample } = bench.stats;
      results.set(bench.name, {
        perUnit,
        hz: bench.hz,
        rme,
        samples: sample.length,
      });
      console.log(
        `${bench.name.padEnd(42)}${micro(perUnit).padStart(9)} µs` +
          `${rmeText(rme).padStart(10)}${String(sample.length).padStart(5)} samples   ${describe(
            bench.name,
          )}`,
      );
    },
  };
}

/**
 * Prints a table with right-aligned numeric columns.
 * @param {Array<{title: string, align?: 'left'|'right'}>} columns - The header row.
 * @param {string[][]} rows - One array of already-formatted cells per row.
 * @returns {void}
 */
export function printTable(columns, rows) {
  const widths = new Array(columns.length);
  for (let i = 0; i < columns.length; i++) {
    let width = columns[i].title.length;
    for (let j = 0; j < rows.length; j++) {
      if (rows[j][i].length > width) width = rows[j][i].length;
    }
    widths[i] = width;
  }
  const line = (cells) =>
    cells
      .map((cell, i) =>
        columns[i].align === 'left'
          ? cell.padEnd(widths[i])
          : cell.padStart(widths[i]),
      )
      .join('  ')
      .trimEnd();
  console.log(line(columns.map((column) => column.title)));
  console.log(widths.map((width) => '-'.repeat(width)).join('  '));
  for (let i = 0; i < rows.length; i++) {
    console.log(line(rows[i]));
  }
}

/**
 * Formats a relative margin of error, marking anything the rules say is unusable.
 * @param {number} rme - The margin, in percent.
 * @returns {string} The margin, with a bang when it is above 10%.
 */
export function rmeText(rme) {
  return `±${rme.toFixed(1)}%${rme > MAX_RME ? '!' : ''}`;
}

/**
 * Groups a number in thousands.
 * @param {number} value - The number to format.
 * @returns {string} The grouped number.
 */
export function count(value) {
  return value.toLocaleString('en-US');
}

/**
 * Formats a per-molecule timing, keeping four decimals for the sub-microsecond cases where two
 * would round the whole number away.
 * @param {number} microseconds - The timing.
 * @returns {string} The timing, without a unit.
 */
export function micro(microseconds) {
  return microseconds < 1 ? microseconds.toFixed(4) : microseconds.toFixed(2);
}

/**
 * Rounds a duration to whatever unit reads best, so a run can announce how long it will take.
 * @param {number} totalSeconds - The duration.
 * @returns {string} The duration in seconds or minutes.
 */
export function duration(totalSeconds) {
  return totalSeconds < 90
    ? `${totalSeconds.toFixed(0)} seconds`
    : `${(totalSeconds / 60).toFixed(0)} minutes`;
}

/**
 * Prints the one line a reader should take away from a table.
 * @param {string} text - The sentence.
 * @returns {void}
 */
export function conclude(text) {
  console.log(`\n${text}\n`);
}

function mean(idCodes) {
  let total = 0;
  for (let i = 0; i < idCodes.length; i++) {
    total += idCodes[i].length;
  }
  return total / idCodes.length;
}

function ordinal(value) {
  const teens = value % 100;
  if (teens >= 11 && teens <= 13) return `${value}th`;
  const last = value % 10;
  if (last === 1) return `${value}st`;
  if (last === 2) return `${value}nd`;
  if (last === 3) return `${value}rd`;
  return `${value}th`;
}
