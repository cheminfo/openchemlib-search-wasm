import { afterEach, expect, test, vi } from 'vitest';

import { getNoStereoTautomerIdCode, setLogHandler } from '../index.ts';
import { createConsoleImport } from '../wasm/log.ts';

import { fromSmiles } from './fixture.ts';

/**
 * Feeds a string to one of the character sinks the WASM runtime imports, the way Java's
 * `System.out` would: one character at a time.
 * @param sink - The sink to write to.
 * @param text - The characters to write.
 */
function write(sink: (code: number) => void, text: string): void {
  for (const character of text) {
    sink(character.codePointAt(0) as number);
  }
}

afterEach(() => {
  setLogHandler(null);
  vi.restoreAllMocks();
});

test('nothing reaches the console, whatever Java writes', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const { putcharStdout, putcharStderr } = createConsoleImport();

  write(putcharStdout, 'a line on stdout\n');
  write(putcharStderr, 'a line on stderr\n');

  expect(log).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
});

test('a handler receives whole lines, with the stream they came from', () => {
  const lines: Array<[string, string]> = [];
  setLogHandler((message, stream) => lines.push([stream, message]));
  const { putcharStdout, putcharStderr } = createConsoleImport();

  write(putcharStdout, 'first\nsecond\n');
  write(putcharStderr, 'a warning\n');

  expect(lines).toStrictEqual([
    ['stdout', 'first'],
    ['stdout', 'second'],
    ['stderr', 'a warning'],
  ]);
});

test('a line is delivered only once it is complete', () => {
  const lines: string[] = [];
  setLogHandler((message) => lines.push(message));
  const { putcharStdout } = createConsoleImport();

  write(putcharStdout, 'half a line');

  expect(lines).toStrictEqual([]);

  write(putcharStdout, ' and the rest\n');

  expect(lines).toStrictEqual(['half a line and the rest']);
});

test('the handler applies to a sink built before it was set', () => {
  const { putcharStdout } = createConsoleImport();
  const lines: string[] = [];

  write(putcharStdout, 'discarded\n');
  setLogHandler((message) => lines.push(message));
  write(putcharStdout, 'kept\n');

  expect(lines).toStrictEqual(['kept']);
});

test('setLogHandler(null) goes back to discarding', () => {
  const lines: string[] = [];
  setLogHandler((message) => lines.push(message));
  const { putcharStdout } = createConsoleImport();

  write(putcharStdout, 'kept\n');
  setLogHandler(null);
  write(putcharStdout, 'dropped\n');

  expect(lines).toStrictEqual(['kept']);
});

// OpenChemLib printed "Tautomer count exceeds maximum" for every molecule it gave up on, and built
// that message with a full extra canonization. It is switched off at source now, and the count says
// the same thing without the work.
test('a molecule OpenChemLib gives up on says nothing at all', () => {
  const lines: string[] = [];
  setLogHandler((message) => lines.push(message));
  let smiles = 'N';
  for (let i = 0; i < 10; i++) {
    smiles += '[C@@H](C)C(=O)N';
  }
  const tautomerCounts = new Int32Array(1);

  getNoStereoTautomerIdCode(fromSmiles(`${smiles}C`), {
    maxTautomers: 500,
    tautomerCounts,
  });

  expect(tautomerCounts[0]).toBeGreaterThanOrEqual(500);
  expect(lines).toStrictEqual([]);
}, 30_000);
