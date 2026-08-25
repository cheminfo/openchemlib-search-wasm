import type { SharedCorpus } from './protocol.ts';

const NEWLINE = 0x0a;
const CARRIAGE_RETURN = 0x0d;
const decoder = new TextDecoder();

/** The corpus, packed once on the main thread and shared with every worker. */
export interface Corpus {
  /** The buffers to post to a worker. */
  shared: SharedCorpus;
  /** Every idcode, concatenated, no separators. */
  bytes: Uint8Array;
  /** `count + 1` entries: idcode `i` is `bytes[offsets[i] .. offsets[i + 1]]`. */
  offsets: Int32Array;
  count: number;
  characters: number;
}

/** Thrown when the corpus file has not been generated yet. */
export class DatasetMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatasetMissingError';
  }
}

/**
 * Fetches the idcode corpus and packs it into two `SharedArrayBuffer`s, so no worker ever needs a
 * copy of it and none of them has to split a 16 MB string.
 * @param url - Where the newline-separated idcodes are served from.
 * @returns The packed corpus.
 * @throws {DatasetMissingError} If the file has not been generated.
 */
export async function loadCorpus(url: string): Promise<Corpus> {
  const response = await fetch(url);
  const contentType = response.headers.get('content-type') ?? '';
  // A missing file under public/ falls through to Vite's SPA fallback, which answers 200 with the
  // index page, so the status alone does not say whether the corpus is there.
  if (!response.ok || contentType.includes('html')) {
    throw new DatasetMissingError(
      `${url} is not being served. Run \`npm run dataset\` once, then reload.`,
    );
  }
  return pack(new Uint8Array(await response.arrayBuffer()));
}

/**
 * Reads one idcode back out of the packed corpus.
 * @param corpus - The packed corpus.
 * @param index - Which idcode to read.
 * @returns The idcode, or an empty string when the index is out of range.
 */
export function readIdCode(corpus: Corpus, index: number): string {
  if (index < 0 || index >= corpus.count) return '';
  const from = corpus.offsets[index] ?? 0;
  const to = corpus.offsets[index + 1] ?? from;
  // The copy is not optional: `TextDecoder.decode` refuses a view over a `SharedArrayBuffer`.
  return decoder.decode(new Uint8Array(corpus.bytes.subarray(from, to)));
}

function pack(raw: Uint8Array): Corpus {
  const count = countLines(raw);
  const bytesBuffer = new SharedArrayBuffer(raw.length);
  const offsetsBuffer = new SharedArrayBuffer((count + 1) * 4);
  const bytes = new Uint8Array(bytesBuffer);
  const offsets = new Int32Array(offsetsBuffer);

  let written = 0;
  let line = 0;
  let start = 0;
  for (let i = 0; i <= raw.length; i++) {
    if (i !== raw.length && raw[i] !== NEWLINE) continue;
    let end = i;
    if (end > start && raw[end - 1] === CARRIAGE_RETURN) end--;
    if (end > start) {
      offsets[line] = written;
      line++;
      for (let byte = start; byte < end; byte++) {
        bytes[written] = raw[byte] ?? 0;
        written++;
      }
    }
    start = i + 1;
  }
  offsets[count] = written;

  return {
    shared: { bytes: bytesBuffer, offsets: offsetsBuffer, count },
    bytes,
    offsets,
    count,
    characters: written,
  };
}

function countLines(raw: Uint8Array): number {
  let count = 0;
  let start = 0;
  for (let i = 0; i <= raw.length; i++) {
    if (i !== raw.length && raw[i] !== NEWLINE) continue;
    let end = i;
    if (end > start && raw[end - 1] === CARRIAGE_RETURN) end--;
    if (end > start) count++;
    start = i + 1;
  }
  return count;
}
