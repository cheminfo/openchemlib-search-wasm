import type { FunctionKey, Tier } from './dictionary.ts';

import { searchFunctionKeys } from '#function-keys';

/** What the page shows, as the address carries it. */
export interface Filter {
  /** Matched against the id, the names and the SMARTS. */
  text: string;
  tier: Tier | 'all';
  /** One of the flags a key can carry, or `any` to show only keys with at least one. */
  flag: string;
  /** A category id, or the empty string for all of them. */
  category: string;
  /** The key whose details are open. */
  open: string;
}

/** The page as it opens: the stored keys, nothing filtered out. */
export const DEFAULT_FILTER: Filter = {
  text: '',
  tier: 'stored',
  flag: '',
  category: '',
  open: '',
};

const TIERS = new Set<string>(['stored', 'existing plane', 'on-demand', 'all']);

/**
 * Reads the filter from a query string. Unknown values fall back to the default.
 * @param search - `location.search`.
 * @returns The filter it describes.
 */
export function parseFilter(search: string): Filter {
  const params = new URLSearchParams(search);
  const tier = params.get('tier') ?? DEFAULT_FILTER.tier;
  return {
    text: params.get('q') ?? '',
    tier: TIERS.has(tier) ? (tier as Filter['tier']) : DEFAULT_FILTER.tier,
    flag: params.get('flag') ?? '',
    category: params.get('category') ?? '',
    open: params.get('key') ?? '',
  };
}

/**
 * Writes the filter as a query string, leaving every default out.
 * @param filter - The filter.
 * @returns The query string, with its `?` when not empty.
 */
export function formatFilter(filter: Filter): string {
  const params: string[] = [];
  const add = (name: string, value: string, fallback: string) => {
    if (value !== fallback) params.push(`${name}=${encodeURIComponent(value)}`);
  };
  add('q', filter.text, '');
  add('tier', filter.tier, DEFAULT_FILTER.tier);
  add('flag', filter.flag, '');
  add('category', filter.category, '');
  add('key', filter.open, '');
  return params.length === 0 ? '' : `?${params.join('&')}`;
}

/**
 * The keys the filter keeps, in their exported order. The text is looked up the way the package
 * looks names up, `searchFunctionKeys`, and also in the SMARTS and the subcategory.
 * @param keys - Every key.
 * @param filter - What to keep. Its category is not applied, so the category list can count.
 * @returns The kept keys.
 */
export function filterKeys(keys: FunctionKey[], filter: Filter): FunctionKey[] {
  const text = filter.text.trim().toLowerCase();
  const named = text
    ? new Set(searchFunctionKeys(text).map((key) => key.id))
    : null;
  return keys.filter((key) => {
    const flags = key.review?.flags ?? [];
    if (filter.tier !== 'all' && key.tier !== filter.tier) return false;
    if (filter.flag === 'any' && flags.length === 0) return false;
    if (filter.flag && filter.flag !== 'any' && !flags.includes(filter.flag)) {
      return false;
    }
    if (named === null || named.has(key.id)) return true;
    return (
      (key.smarts ?? '').toLowerCase().includes(text) ||
      key.subcategory.includes(text)
    );
  });
}

/** One category's keys, split by subcategory. */
export interface CategoryGroup {
  category: string;
  title: string;
  count: number;
  subcategories: Array<{ name: string; keys: FunctionKey[] }>;
}

/**
 * Groups keys by category, in taxonomy order, then by subcategory, most frequent key first.
 * @param keys - The keys to group.
 * @param taxonomy - Category id to title, in display order.
 * @returns One group per category that holds at least one key.
 */
export function groupKeys(
  keys: FunctionKey[],
  taxonomy: Readonly<Record<string, string>>,
): CategoryGroup[] {
  const groups: CategoryGroup[] = [];
  for (const [category, title] of Object.entries(taxonomy)) {
    const inCategory = keys.filter((key) => key.category === category);
    if (inCategory.length === 0) continue;
    const bySubcategory = new Map<string, FunctionKey[]>();
    for (const key of inCategory) {
      const list = bySubcategory.get(key.subcategory) ?? [];
      list.push(key);
      bySubcategory.set(key.subcategory, list);
    }
    const subcategories = [...bySubcategory.entries()]
      .map(([name, list]) => ({
        name,
        keys: list.toSorted((a, b) => b.count1m - a.count1m),
      }))
      .toSorted((a, b) => a.name.localeCompare(b.name));
    groups.push({ category, title, count: inCategory.length, subcategories });
  }
  return groups;
}

/**
 * Every flag present among the keys, most common first.
 * @param keys - The keys.
 * @returns The flags and how many keys carry each.
 */
export function flagCounts(keys: FunctionKey[]): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const key of keys) {
    for (const flag of key.review?.flags ?? []) {
      counts.set(flag, (counts.get(flag) ?? 0) + 1);
    }
  }
  return [...counts.entries()].toSorted((a, b) => b[1] - a[1]);
}
