import { INDEX_WORDS } from '../types.ts';

import dictionary from './dictionary.json' with { type: 'json' };

/**
 * Where a key's answer comes from: one of the 512 function bits a record stores, a bit of the FragFp
 * or the screen that holds exactly the same molecules, or a substructure search run when asked.
 */
export type FunctionKeyTier = 'stored' | 'existingPlane' | 'onDemand';

/** One named function key: a functional group, a ring, a substituent, a natural product class. */
export interface FunctionKey {
  /** Stable identifier. */
  id: string;
  /** The name to show. No other key carries it as name or synonym, case aside. */
  name: string;
  /** The other names it answers to, each also unique across the dictionary. */
  synonyms: string[];
  /** A key of {@link getFunctionCategories}. */
  category: string;
  /** A finer group within the category. */
  subcategory: string;
  tier: FunctionKeyTier;
  /** For a `stored` key: its bit in the function words, 0 to 511. */
  plane?: number;
  /** For an `existingPlane` key: the fingerprint holding its bit. */
  fingerprint?: 'fragFp' | 'screen';
  /** For an `existingPlane` key: its bit in that fingerprint, 0 to 511. */
  bit?: number;
  /** The share of the 1,034,054 PubChem molecules it was counted on that hold it. */
  prevalence: number;
  /** Where its definition comes from: keys of {@link getFunctionKeySources}. */
  sources: string[];
  /** The SMARTS it was compiled from, absent for a key given as an idcode. */
  smarts?: string;
  /**
   * Its query fragments, as idcodes: a molecule holds the key when it holds any of them, which is
   * what `substructureSearch(key.fragments, entries)` tests.
   */
  fragments: string[];
}

/** A source the dictionary's definitions come from, and the licence they are used under. */
export interface FunctionKeySource {
  name: string;
  url: string;
  licence: string;
}

/** Where a key's bit sits in the 48-word record of `getMoleculeRecords`. */
export interface RecordBit {
  /** The word of the record: FragFp words first, then the screen, then the function bits. */
  word: number;
  /** The bit within that word. */
  mask: number;
}

/** What {@link searchFunctionKeys} takes. */
export interface SearchFunctionKeysOptions {
  /**
   * Only the keys of this tier.
   * @default every tier
   */
  tier?: FunctionKeyTier;
  /**
   * Only the keys of this category.
   * @default every category
   */
  category?: string;
  /**
   * The most keys to return.
   * @default no limit
   */
  limit?: number;
}

const KEYS = dictionary.keys as FunctionKey[];
let byName: Map<string, FunctionKey> | undefined;

/**
 * Returns every function key: the 512 stored ones in bit order, then those equal to a FragFp or
 * screen bit, then those computed on demand, by category and prevalence.
 * @returns The keys. They are shared: do not modify them.
 */
export function getFunctionKeys(): readonly FunctionKey[] {
  return KEYS;
}

/**
 * Finds a key by its id, its name or one of its synonyms, case aside.
 * @param nameOrId - What to look up, such as `thioether`, `Boc` or `pyridin_2_one`.
 * @returns The key, or undefined when nothing carries that name.
 */
export function getFunctionKey(nameOrId: string): FunctionKey | undefined {
  if (!byName) {
    byName = new Map();
    for (const key of KEYS) {
      for (const name of [key.id, key.name, ...key.synonyms]) {
        if (!byName.has(name.toLowerCase())) {
          byName.set(name.toLowerCase(), key);
        }
      }
    }
  }
  return byName.get(nameOrId.trim().toLowerCase());
}

/**
 * Finds the keys whose id, name or synonyms hold every word of a text, case aside: an exact name
 * first, then names starting with the text, then the rest, each by prevalence.
 * @param text - Words to look for, such as `aromatic amine` or `lactam`.
 * @param options - Narrows the result; see {@link SearchFunctionKeysOptions}.
 * @returns The matching keys, best first.
 */
export function searchFunctionKeys(
  text: string,
  options: SearchFunctionKeysOptions = {},
): FunctionKey[] {
  const { tier, category, limit = Number.POSITIVE_INFINITY } = options;
  const wanted = text.trim().toLowerCase();
  const words = wanted.split(/\s+/).filter(Boolean);
  const scored: Array<{ key: FunctionKey; rank: number }> = [];
  for (const key of KEYS) {
    if (
      (tier && key.tier !== tier) ||
      (category && key.category !== category)
    ) {
      continue;
    }
    const names = [key.name, ...key.synonyms].map((name) => name.toLowerCase());
    const haystack = `${key.id.toLowerCase()}\n${names.join('\n')}`;
    if (!words.every((word) => haystack.includes(word))) continue;
    const rank = names.includes(wanted)
      ? 0
      : names.some((name) => name.startsWith(wanted))
        ? 1
        : 2;
    scored.push({ key, rank });
  }
  scored.sort((a, b) => a.rank - b.rank || b.key.prevalence - a.key.prevalence);
  return scored.slice(0, limit).map(({ key }) => key);
}

/**
 * Returns the categories keys are grouped in, in display order.
 * @returns Category id to its title, such as `carbonyl` to `Carbonyl groups`.
 */
export function getFunctionCategories(): Readonly<Record<string, string>> {
  return dictionary.categories;
}

/**
 * Returns the sources the definitions come from, with their licences, for attribution.
 * @returns Source id, as a key's `sources` names it, to its name, address and licence.
 */
export function getFunctionKeySources(): Readonly<
  Record<string, FunctionKeySource>
> {
  return dictionary.sources;
}

/**
 * Says where a key's answer sits in a record of `getMoleculeRecords`, so a stored record answers it
 * with one mask test: `(record[word] & mask) !== 0`.
 * @param key - The key.
 * @returns The word and mask, or undefined for a key computed on demand, which a record does not hold.
 */
export function getRecordBit(key: FunctionKey): RecordBit | undefined {
  let base: number;
  let bit: number;
  if (key.tier === 'stored' && key.plane !== undefined) {
    base = 2 * INDEX_WORDS;
    bit = key.plane;
  } else if (key.tier === 'existingPlane' && key.bit !== undefined) {
    base = key.fingerprint === 'screen' ? INDEX_WORDS : 0;
    bit = key.bit;
  } else {
    return undefined;
  }
  return { word: base + (bit >> 5), mask: 1 << (31 - (bit & 31)) };
}
