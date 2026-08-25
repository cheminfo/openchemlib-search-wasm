import { parentPort, workerData } from 'node:worker_threads';

const {
  engine,
  queryIdCode,
  corpus,
  byteFrom,
  byteTo,
  result,
  lineFrom,
  lineTo,
} = workerData;

// The engine is imported here rather than at the top so the time it takes to instantiate is this
// worker's own — for WASM that is the module compile, which every worker pays once at startup.
const loadStart = performance.now();
const module =
  engine === 'wasm'
    ? await import('#lib')
    : await import('./lib/openchemlibJs.js');
const scan = engine === 'wasm' ? module.ssSearch : module.ssSearchJs;
const loadMilliseconds = performance.now() - loadStart;

const decodeStart = performance.now();
const idCodes = new TextDecoder()
  .decode(new Uint8Array(corpus, byteFrom, byteTo - byteFrom))
  .split('\n');
const decodeMilliseconds = performance.now() - decodeStart;

if (idCodes.length !== lineTo - lineFrom) {
  throw new Error(
    `worker was given bytes for ${idCodes.length} idcodes but lines ${lineFrom}..${lineTo}`,
  );
}

// The slice of the caller's buffer this worker owns. No index is written by any other worker, so
// nothing here needs an atomic and the main thread can read the buffer while the scan runs.
const output = new Uint8Array(result, lineFrom, idCodes.length);

parentPort.postMessage({
  type: 'ready',
  loadMilliseconds,
  decodeMilliseconds,
  molecules: idCodes.length,
});

parentPort.on('message', (message) => {
  if (message !== 'go') return;
  const start = performance.now();
  scan(queryIdCode, idCodes, output);
  parentPort.postMessage({
    type: 'done',
    scanMilliseconds: performance.now() - start,
  });
});
