import type { FunctionKey as PackageKey } from '#function-keys';
import { getFunctionCategories, getFunctionKeys } from '#function-keys';

/** Where a key lives once the dictionary is in the index, as the page names it. */
export type Tier = 'stored' | 'existing plane' | 'on-demand';

/** How OpenChemLib's matches compare with RDKit's matches of the source SMARTS, on 100k molecules. */
export type Verdict =
  | 'same'
  | 'close'
  | 'aromaticity'
  | 'idcode'
  | 'none-found'
  | 'differs';

/** Another key and how much of its molecule set it shares with this one. */
export interface Neighbour {
  id: string;
  /** Molecules matched by both, over molecules matched by either, on 1M molecules. */
  jaccard: number;
}

/** A key that was folded into this one when the dictionary was cleaned. */
export interface MergedKey {
  id: string;
  sources: string[];
  /** The names it brought; empty when they named something else. */
  names: string[];
  count1m: number;
  reason: string;
}

/** What only a reviewer needs about a key: frequencies, cost, comparisons, history. */
export interface Review {
  sourceCategory?: string;
  curated?: boolean;
  /** The SMARTS RDKit was checked with, when it differs from the compiled one. */
  rdkitSmarts?: string;
  count1m: number;
  costUs: number;
  verdict: Verdict;
  jaccard?: number;
  jaccardSameAromaticity?: number;
  ocl100k: number;
  rdkit100k: number;
  nearDuplicates?: Neighbour[];
  similarTo?: Neighbour;
  /** Our own key whose name means the same thing. */
  coveredBy?: string;
  /** The other keys whose names normalize to the same concept. */
  conceptGroup?: string[];
  flags?: string[];
  /** Why the key is not stored. */
  blockers?: string[];
  note?: string;
  /** What a rewritten key of ours replaced. */
  replaces?: { smarts: string; count1m: number };
  merged?: MergedKey[];
}

/** One key as the page shows it: the package's key, its place spelled out, and its review. */
export interface FunctionKey extends Omit<PackageKey, 'tier' | 'plane'> {
  tier: Tier;
  /** `function#n` for a stored key, `fragFp#n` or `screen#n` for one equal to an existing plane. */
  plane?: string;
  /** How many of the 1M molecules hold it: counted, or from the prevalence without review data. */
  count1m: number;
  review?: Review;
}

/** The numbers the summary lines quote. */
export interface DictionarySummary {
  stored: number;
  existingPlane: number;
  onDemand: number;
  /** What cleaning the dictionary did, when the review data says. */
  pruned?: {
    merged: number;
    rescued: number;
    droppedNeverMatched: number;
    droppedSlow: number;
    namesKept: number;
  };
  /** On-demand keys found in none of the 1M molecules, when the review data says. */
  onDemandNeverFound?: number;
  /** Median cost of an on-demand key, µs per molecule, when the review data says. */
  onDemandMedianUs?: number;
}

/** What the page works from. */
export interface Dictionary {
  /** When the review data was exported, or null without it. */
  generated: string | null;
  /** How many molecules `count1m` and the prevalences were measured on. */
  molecules: number;
  /** Category id to its title, in display order. */
  taxonomy: Readonly<Record<string, string>>;
  summary: DictionarySummary;
  keys: FunctionKey[];
}

interface ReviewFile {
  generated: string;
  molecules: number;
  pruned: DictionarySummary['pruned'];
  onDemand: { neverFound: number; costUs: Record<string, number> };
  keys: Record<string, Review>;
}

const MOLECULES = 1_034_054;
const TIERS: Record<PackageKey['tier'], Tier> = {
  stored: 'stored',
  existingPlane: 'existing plane',
  onDemand: 'on-demand',
};

/**
 * The package's keys, with the review data merged in when it is served. Without it the page still
 * shows every key, its names and its fragments, and runs it over the corpus.
 * @param reviewUrl - Where the review data is served from.
 * @returns The dictionary.
 */
export async function loadDictionary(reviewUrl: string): Promise<Dictionary> {
  const review = await fetchReview(reviewUrl);
  const molecules = review?.molecules ?? MOLECULES;
  const keys = getFunctionKeys().map((key) =>
    toPageKey(key, review, molecules),
  );
  const count = (tier: Tier) => keys.filter((key) => key.tier === tier).length;
  return {
    generated: review?.generated ?? null,
    molecules,
    taxonomy: getFunctionCategories(),
    summary: {
      stored: count('stored'),
      existingPlane: count('existing plane'),
      onDemand: count('on-demand'),
      pruned: review?.pruned,
      onDemandNeverFound: review?.onDemand.neverFound,
      onDemandMedianUs: review?.onDemand.costUs['50'],
    },
    keys,
  };
}

function toPageKey(
  key: PackageKey,
  review: ReviewFile | null,
  molecules: number,
): FunctionKey {
  const entry = review?.keys[key.id];
  const plane =
    key.tier === 'stored'
      ? `function#${key.plane}`
      : key.tier === 'existingPlane'
        ? `${key.fingerprint}#${key.bit}`
        : undefined;
  return {
    ...key,
    tier: TIERS[key.tier],
    plane,
    count1m: entry?.count1m ?? Math.round(key.prevalence * molecules),
    review: entry,
  };
}

async function fetchReview(url: string): Promise<ReviewFile | null> {
  const response = await fetch(url);
  const contentType = response.headers.get('content-type') ?? '';
  // A missing file under public/ falls through to Vite's SPA fallback, which answers 200 with the
  // index page.
  if (!response.ok || contentType.includes('html')) return null;
  return (await response.json()) as ReviewFile;
}
