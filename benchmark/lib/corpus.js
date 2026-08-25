import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The 409,686 idcodes of reference.cheminfo.org, written by `npm run dataset`. 15.5 MiB of
// third-party data, so it is never committed; OCL_IDCODES overrides the location.
const REFERENCE_CORPUS = join(
  import.meta.dirname,
  '..',
  '..',
  'dev',
  'public',
  'idcodes.txt',
);

const TEST_CORPUS = join(
  import.meta.dirname,
  '..',
  '..',
  'src',
  '__tests__',
  'data',
  'idcodes.txt',
);

/**
 * Reads a corpus and takes an evenly spread sample of it.
 *
 * The sample is strided rather than a prefix because the reference corpus is ordered: its first
 * 25,000 idcodes average 27.1 characters against 38.67 over the whole file, so a prefix would time
 * unusually small molecules and read about 40% fast. Every 16th idcode averages 39.0 characters and
 * reproduces the corpus-wide benzene hit rate of 62.9%.
 * @param {number} size - How many idcodes to keep. The whole corpus is used when it holds fewer.
 * @returns {{idCodes: string[], path: string, total: number, stride: number, small: boolean}} The
 * sample, the file it came from, how many idcodes that file held, the sampling stride, and whether
 * the fallback test fixture was used.
 */
export function loadCorpus(size) {
  const { path, small } = findCorpus();
  const all = readIdCodes(path);
  const stride = Math.max(1, Math.floor(all.length / size));
  const wanted = Math.min(size, all.length);
  const idCodes = new Array(wanted);
  for (let i = 0; i < wanted; i++) {
    idCodes[i] = all[i * stride];
  }
  return { idCodes, path, total: all.length, stride, small };
}

/**
 * Reads every idcode of a newline-separated file.
 * @param {string} path - The file to read.
 * @returns {string[]} One idcode per line, without the trailing empty line.
 */
export function readIdCodes(path) {
  const idCodes = readFileSync(path, 'utf8').split('\n');
  while (idCodes.length > 0 && idCodes.at(-1) === '') {
    idCodes.pop();
  }
  return idCodes;
}

/**
 * Locates the corpus to benchmark against.
 * @returns {{path: string, small: boolean}} The file, and whether it is the 1,999-idcode test
 * fixture rather than a real corpus.
 */
export function findCorpus() {
  const fromEnvironment = process.env.OCL_IDCODES;
  if (fromEnvironment) {
    if (!existsSync(fromEnvironment)) {
      throw new Error(
        `OCL_IDCODES names a file that does not exist: ${fromEnvironment}`,
      );
    }
    return { path: fromEnvironment, small: false };
  }
  if (existsSync(REFERENCE_CORPUS)) {
    return { path: REFERENCE_CORPUS, small: false };
  }
  return { path: TEST_CORPUS, small: true };
}

/**
 * Averages the length of a list of idcodes, which is the cheapest proxy for molecule size.
 * @param {string[]} idCodes - The idcodes to measure.
 * @returns {number} The mean character count.
 */
export function meanLength(idCodes) {
  let total = 0;
  for (let i = 0; i < idCodes.length; i++) {
    total += idCodes[i].length;
  }
  return total / idCodes.length;
}
