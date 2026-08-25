import { readFileSync } from 'node:fs';

/** The byte a line ends on. Every idcode character is in 0x40-0x7F, so this can never be one. */
const NEWLINE = 10;

/**
 * Reads a corpus into a `SharedArrayBuffer` and indexes where each line starts.
 *
 * Sharing the bytes rather than the strings is what makes a many-worker scan cheap: `postMessage`
 * of a `string[]` copies about 26 MB into every worker, a transferred `Uint8Array` can only reach
 * one of them, and a `SharedArrayBuffer` is written once and read by all of them with no copy at
 * all. Each worker then decodes its own slice, which costs a few milliseconds.
 * @param {string} path - The newline-separated idcode file.
 * @returns {{bytes: Uint8Array, buffer: SharedArrayBuffer, starts: Int32Array, total: number}} The
 * shared bytes, the offset of every line, and how many lines there are.
 */
export function readSharedCorpus(path) {
  const file = readFileSync(path);
  const buffer = new SharedArrayBuffer(file.byteLength);
  const bytes = new Uint8Array(buffer);
  bytes.set(file);

  let total = 0;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === NEWLINE) total++;
  }
  if (bytes.length > 0 && bytes.at(-1) !== NEWLINE) total++;

  const starts = new Int32Array(total + 1);
  let line = 0;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === NEWLINE) starts[++line] = i + 1;
  }
  if (line < total) starts[total] = bytes.length + 1;

  return { bytes, buffer, starts, total };
}

/**
 * Cuts a corpus into contiguous, equally sized slices, one per worker.
 * @param {Int32Array} starts - The line offsets from {@link readSharedCorpus}.
 * @param {number} total - How many lines the corpus holds.
 * @param {number} workers - How many slices to cut.
 * @returns {Array<{lineFrom: number, lineTo: number, byteFrom: number, byteTo: number}>} One slice
 * per worker, as a line range and the byte range that holds it without its final newline.
 */
export function sliceCorpus(starts, total, workers) {
  const slices = new Array(workers);
  for (let i = 0; i < workers; i++) {
    const lineFrom = Math.floor((total * i) / workers);
    const lineTo = Math.floor((total * (i + 1)) / workers);
    slices[i] = {
      lineFrom,
      lineTo,
      byteFrom: starts[lineFrom],
      byteTo: starts[lineTo] - 1,
    };
  }
  return slices;
}
