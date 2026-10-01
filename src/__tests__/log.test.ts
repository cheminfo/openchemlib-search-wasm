import { afterEach, expect, test, vi } from 'vitest';

import { getNoStereoTautomerHash, setLogHandler } from '../index.ts';

import { fromSmiles } from './fixture.ts';

/**
 * A decapeptide: enough amides that OpenChemLib abandons the tautomer enumeration and prints
 * `Tautomer count exceeds maximum`, which is the only message the library has been seen to emit.
 * @returns Its idcode.
 */
function talkativeMolecule(): string {
  let smiles = 'N';
  for (let i = 0; i < 10; i++) {
    smiles += '[C@@H](C)C(=O)N';
  }
  return fromSmiles(`${smiles}C`);
}

afterEach(() => {
  setLogHandler(null);
  vi.restoreAllMocks();
});

test('a molecule OpenChemLib gives up on writes nothing to the console', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

  const hash = getNoStereoTautomerHash(talkativeMolecule());

  expect(hash).toBe(6922018973500175530n);
  expect(log).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
}, 30_000);

test('setLogHandler receives the line OpenChemLib would have printed', () => {
  const lines: Array<[string, string]> = [];
  setLogHandler((message, stream) => lines.push([stream, message]));

  getNoStereoTautomerHash(talkativeMolecule());

  expect(lines).toHaveLength(1);
  expect(lines[0]?.[0]).toBe('stdout');
  expect(lines[0]?.[1]).toMatch(/^Tautomer count exceeds maximum: /);
}, 30_000);

test('setLogHandler(null) goes back to discarding', () => {
  const lines: string[] = [];
  setLogHandler((message) => lines.push(message));
  getNoStereoTautomerHash(talkativeMolecule());

  expect(lines).toHaveLength(1);

  setLogHandler(null);
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  getNoStereoTautomerHash(talkativeMolecule());

  expect(lines).toHaveLength(1);
  expect(log).not.toHaveBeenCalled();
}, 30_000);

test('a molecule it can hash normally says nothing at all', () => {
  const lines: string[] = [];
  setLogHandler((message) => lines.push(message));

  expect(getNoStereoTautomerHash(fromSmiles('CCC(=O)CC'))).not.toBe(0n);
  expect(lines).toStrictEqual([]);
});
